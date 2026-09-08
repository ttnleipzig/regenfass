// Command seed fills a local database with plausible-looking devices, groups
// and measurement history so the dashboard has something to render without a
// real LoRaWAN fleet behind it.
//
// Everything it writes is tagged: devices get an EUI starting with seedEUIPrefix
// and groups a name starting with seedGroupPrefix, so --reset can remove exactly
// what earlier runs created and nothing else.
//
//	go run ./cmd/seed --devices=6 --days=21
//	go run ./cmd/seed --reset
package main

import (
	"context"
	"flag"
	"fmt"
	"math"
	"math/rand/v2"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ttn-leipzig/regenfass/internal/db"
	loraprotocol "github.com/ttn-leipzig/regenfass/internal/lora_protocol"
	"github.com/ttn-leipzig/regenfass/internal/utils"
)

// Tags on everything this command writes. --reset keys off both, so changing
// them orphans whatever an earlier run inserted.
const (
	seedEUIPrefix   = "5EED"
	seedGroupPrefix = "Seed "
)

// Leipzig, matching the frontend's fallback centre. Seeded devices are
// scattered within scatterDegrees of it so the map has separated pins.
var seedCenter = [2]float64{12.3731, 51.3397}

const scatterDegrees = 0.06

var (
	databaseUriFlag = flag.String("database-uri", "postgres://postgres:password@127.0.0.1:5434/regenfass?sslmode=disable", "database URI to seed")
	deviceCountFlag = flag.Int("devices", 6, "number of devices to create")
	groupCountFlag  = flag.Int("groups", 2, "number of groups to create; devices are spread across them")
	daysFlag        = flag.Float64("days", 14, "how far back the generated history reaches")
	intervalFlag    = flag.Duration("interval", 15*time.Minute, "spacing between generated readings")
	seedFlag        = flag.Uint64("seed", 0, "PRNG seed; 0 draws a random one. Replaying a reported seed reproduces that fleet, but only against a database without its devices in it already — --reset first")
	staleFlag       = flag.Duration("stale-after", 52*time.Hour, "how far before the end of the window one device stops reporting, so the stale-device UI has data; 0 keeps every device fresh")
	resetFlag       = flag.Bool("reset", false, "delete everything previous runs of this command created before seeding")
	resetOnlyFlag   = flag.Bool("reset-only", false, "with --reset, stop after deleting instead of seeding again")
)

func main() {
	flag.Parse()

	if err := run(context.Background()); err != nil {
		fmt.Fprintf(os.Stderr, "seed: %v\n", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	pool, err := pgxpool.New(ctx, *databaseUriFlag)
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping %s: %w", *databaseUriFlag, err)
	}
	if err := checkSchema(ctx, pool); err != nil {
		return err
	}

	if *resetFlag {
		if err := reset(ctx, pool); err != nil {
			return err
		}
		if *resetOnlyFlag {
			return nil
		}
	}

	return seed(ctx, pool)
}

// checkSchema fails early with something more useful than a "relation does not
// exist" from the middle of the insert loop. Migrations are the backend's job,
// not this command's.
func checkSchema(ctx context.Context, pool *pgxpool.Pool) error {
	var exists bool
	if err := pool.QueryRow(ctx, `SELECT to_regclass('device_measurement') IS NOT NULL`).Scan(&exists); err != nil {
		return fmt.Errorf("inspect schema: %w", err)
	}
	if !exists {
		return fmt.Errorf("database is not migrated — start the backend once (go run .) to run migrations")
	}
	return nil
}

func reset(ctx context.Context, pool *pgxpool.Pool) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin reset: %w", err)
	}
	defer tx.Rollback(ctx)

	// Ordered by foreign key: measurements reference channel mappings, which
	// reference devices; device_group references both devices and groups.
	steps := []struct {
		label string
		sql   string
		args  []any
	}{
		{"measurements", `DELETE FROM device_measurement WHERE device_id IN (SELECT id FROM device WHERE device_eui LIKE $1)`, []any{seedEUIPrefix + "%"}},
		{"channels", `DELETE FROM device_channel_mapping WHERE device_id IN (SELECT id FROM device WHERE device_eui LIKE $1)`, []any{seedEUIPrefix + "%"}},
		{"memberships", `DELETE FROM device_group WHERE device_id IN (SELECT id FROM device WHERE device_eui LIKE $1) OR group_id IN (SELECT id FROM "group" WHERE name LIKE $2)`, []any{seedEUIPrefix + "%", seedGroupPrefix + "%"}},
		{"groups", `DELETE FROM "group" WHERE name LIKE $1`, []any{seedGroupPrefix + "%"}},
		{"devices", `DELETE FROM device WHERE device_eui LIKE $1`, []any{seedEUIPrefix + "%"}},
	}

	var parts []string
	for _, step := range steps {
		tag, err := tx.Exec(ctx, step.sql, step.args...)
		if err != nil {
			return fmt.Errorf("reset %s: %w", step.label, err)
		}
		parts = append(parts, fmt.Sprintf("%d %s", tag.RowsAffected(), step.label))
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit reset: %w", err)
	}

	fmt.Printf("removed seeded data: %s\n", strings.Join(parts, ", "))
	return nil
}

func seed(ctx context.Context, pool *pgxpool.Pool) error {
	if *deviceCountFlag < 1 {
		return fmt.Errorf("--devices must be at least 1")
	}
	if *intervalFlag <= 0 {
		return fmt.Errorf("--interval must be positive")
	}
	if *daysFlag <= 0 {
		return fmt.Errorf("--days must be positive")
	}

	// A fixed default seed would redraw the previous run's EUIs on every
	// re-run, which the unique constraint on device_eui rejects. Random by
	// default; the seed is reported so a fleet can still be reproduced.
	seedValue := *seedFlag
	if seedValue == 0 {
		seedValue = rand.Uint64() | 1
	}
	rng := rand.New(rand.NewPCG(seedValue, 0x5EED))
	deck := newSpecDeck(rng)

	// One transaction for the whole fleet: a failed run leaves no half-seeded
	// devices for the dashboard to show.
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed: %w", err)
	}
	defer tx.Rollback(ctx)
	q := db.New(tx)

	// Names and EUIs already in the database. Seeding is additive: a run has to
	// dodge what earlier runs (and real devices) took rather than assume an
	// empty table.
	takenEUIs, err := takenStrings(ctx, tx, `SELECT device_eui FROM device`)
	if err != nil {
		return fmt.Errorf("load existing EUIs: %w", err)
	}
	takenGroups, err := takenStrings(ctx, tx, `SELECT name FROM "group"`)
	if err != nil {
		return fmt.Errorf("load existing group names: %w", err)
	}
	takenNames, err := takenStrings(ctx, tx, `SELECT name FROM device WHERE name <> ''`)
	if err != nil {
		return fmt.Errorf("load existing device names: %w", err)
	}

	end := time.Now().UTC().Truncate(*intervalFlag)
	start := end.Add(-time.Duration(*daysFlag * float64(24*time.Hour)))

	groups := make([]db.CreateGroupRow, 0, max(*groupCountFlag, 0))
	groupNames := make([]string, 0, cap(groups))
	for i := range max(*groupCountFlag, 0) {
		name := uniqueGroupName(i, takenGroups)
		group, err := q.CreateGroup(ctx, name)
		if err != nil {
			return fmt.Errorf("create group %q: %w", name, err)
		}
		groups = append(groups, group)
		groupNames = append(groupNames, name)
	}

	type seededDevice struct {
		eui      string
		name     string
		group    string
		rwToken  string
		roToken  string
		stale    bool
		channels []channel
	}
	seeded := make([]seededDevice, 0, *deviceCountFlag)
	totalRows := 0

	for i := range *deviceCountFlag {
		eui := uniqueEUI(rng, takenEUIs)
		device, err := q.CreateDevice(ctx, eui)
		if err != nil {
			return fmt.Errorf("create device %s: %w", eui, err)
		}

		// One device is deliberately left unnamed so the dashboard's
		// friendly-name fallback gets exercised too.
		name := ""
		if i > 0 {
			name = uniqueDeviceName(rng, takenNames)
			if err := q.UpdateDeviceName(ctx, db.UpdateDeviceNameParams{ID: device.ID, Name: name}); err != nil {
				return fmt.Errorf("name device %s: %w", eui, err)
			}
		}

		// Most devices report a location; one is left without so the frontend's
		// "pin it to the map centre" path is covered.
		if i != 1 {
			lng := seedCenter[0] + (rng.Float64()*2-1)*scatterDegrees
			lat := seedCenter[1] + (rng.Float64()*2-1)*scatterDegrees
			if err := q.UpdateDeviceLocation(ctx, db.UpdateDeviceLocationParams{
				ID:        device.ID,
				Latitude:  pgtype.Float8{Float64: lat, Valid: true},
				Longitude: pgtype.Float8{Float64: lng, Valid: true},
			}); err != nil {
				return fmt.Errorf("locate device %s: %w", eui, err)
			}
		}

		channels := pickChannels(deck, rng, i == 0, i == min(1, *deviceCountFlag-1))
		for _, ch := range channels {
			mapping := db.UpsertDeviceChannelMappingParams{
				DeviceID:  device.ID,
				ChannelID: ch.id,
			}
			// A described channel carries both its name and its declared type;
			// an undescribed one carries neither, exactly like a channel ingest
			// created on first sight.
			if ch.described {
				mapping.Name = pgtype.Text{String: ch.name, Valid: true}
				mapping.MeasurementType = pgtype.Int2{Int16: int16(ch.spec.typ), Valid: true}
			}
			if err := q.UpsertDeviceChannelMapping(ctx, mapping); err != nil {
				return fmt.Errorf("describe channel %d of %s: %w", ch.id, eui, err)
			}
		}

		// One device in the fleet went quiet a while ago. Without it every
		// device is equally fresh and the dashboard's stale-device handling
		// never shows up in local data.
		last := end
		stale := *staleFlag > 0 && i == 2 && *deviceCountFlag > 2
		if stale {
			last = end.Add(-*staleFlag)
		}

		rows, err := insertHistory(ctx, q, device.ID, channels, start, last, *intervalFlag, rng)
		if err != nil {
			return fmt.Errorf("history for %s: %w", eui, err)
		}
		totalRows += rows

		groupName := ""
		if len(groups) > 0 {
			group := groups[i%len(groups)]
			groupName = groupNames[i%len(groups)]
			if err := q.AddDeviceToGroup(ctx, db.AddDeviceToGroupParams{
				DeviceID: device.ID,
				GroupID:  group.ID,
				// Every third membership is read-only, so the read-only badge
				// and the disabled edit controls have something to show.
				IsReadonly: i%3 == 2,
			}); err != nil {
				return fmt.Errorf("add %s to group: %w", eui, err)
			}
		}

		if name == "" {
			name = utils.FriendlyDeviceName(device.ID) + " (unnamed)"
		}
		seeded = append(seeded, seededDevice{
			eui:      eui,
			name:     name,
			group:    groupName,
			rwToken:  device.RwToken,
			roToken:  device.RoToken,
			stale:    stale,
			channels: channels,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit seed: %w", err)
	}

	fmt.Printf("seeded %d device(s), %d group(s) and %d measurement(s) from %s to %s (--seed=%d)\n\n",
		len(seeded), len(groups), totalRows,
		start.Format(time.RFC3339), end.Format(time.RFC3339), seedValue)

	for i, group := range groups {
		fmt.Printf("group %-28s rw=%s ro=%s\n", groupNames[i], group.RwToken, group.RoToken)
	}
	if len(groups) > 0 {
		fmt.Println()
	}
	for _, d := range seeded {
		fmt.Printf("device %s  %-24s rw=%s ro=%s", d.eui, d.name, d.rwToken, d.roToken)
		if d.group != "" {
			fmt.Printf("  in %q", d.group)
		}
		if d.stale {
			fmt.Printf("  — silent for the last %s", *staleFlag)
		}
		fmt.Println()
		for _, ch := range d.channels {
			label := ch.name
			if !ch.described {
				label = "(undescribed)"
			}
			note := ""
			if ch.silent {
				note = "  — described but never reported"
			}
			fmt.Printf("    ch %2d  %-14s %s%s\n", ch.id, ch.spec.typeName, label, note)
		}
	}

	return nil
}

// insertHistory writes one reading per channel per tick. Rows go in via COPY in
// batches so a multi-week fleet does not become one enormous statement.
func insertHistory(
	ctx context.Context,
	q *db.Queries,
	deviceID pgtype.UUID,
	channels []channel,
	start, end time.Time,
	interval time.Duration,
	rng *rand.Rand,
) (int, error) {
	const batchSize = 5000

	series := make([]*generator, len(channels))
	for i, ch := range channels {
		series[i] = newGenerator(ch.spec, rng)
	}

	batch := make([]db.InsertDeviceMeasurementsParams, 0, batchSize)
	flush := func() error {
		if len(batch) == 0 {
			return nil
		}
		if _, err := q.InsertDeviceMeasurements(ctx, batch); err != nil {
			return err
		}
		batch = batch[:0]
		return nil
	}

	written := 0
	for t := start; !t.After(end); t = t.Add(interval) {
		for i, ch := range channels {
			if ch.silent {
				continue
			}
			// Devices miss uplinks; a gap in the series is the normal case, not
			// an edge case, so the graphs should show some.
			if rng.Float64() < ch.dropRate {
				continue
			}

			value, err := measurementValue(series[i].at(t, rng))
			if err != nil {
				return written, fmt.Errorf("channel %d: %w", ch.id, err)
			}

			batch = append(batch, db.InsertDeviceMeasurementsParams{
				DeviceID:        deviceID,
				MeasurementType: int16(ch.spec.typ),
				ChannelID:       ch.id,
				Value:           value,
				ReceivedAt:      utils.TimeToPG(t),
			})
			written++

			if len(batch) >= batchSize {
				if err := flush(); err != nil {
					return written, err
				}
			}
		}
	}

	return written, flush()
}

// spec describes how one kind of sensor behaves over a day: where its readings
// sit, how far they swing between night and afternoon, and how jittery
// consecutive readings are.
type spec struct {
	typ      loraprotocol.MeasurementType
	typeName string
	names    []string
	// Range the series is clamped into, and the band the baseline is drawn from.
	min, max float64
	// Peak-to-trough swing of the daily cycle and the hour that peak lands on.
	dailyAmp  float64
	peakHour  float64
	noise     float64 // stddev of the per-reading random walk step
	drift     float64 // signed change per day, e.g. a battery discharging
	decimals  int
	nightZero bool // clamp to zero outside daylight, for light sensors
}

var specs = []spec{
	{
		typ: loraprotocol.Distance, typeName: "distance",
		names: []string{"Water level", "Fill level", "Barrel depth"},
		min:   4, max: 118, dailyAmp: 6, peakHour: 6, noise: 0.7, drift: -1.8, decimals: 1,
	},
	{
		typ: loraprotocol.Temperature, typeName: "temperature",
		names: []string{"Air temperature", "Water temperature", "Enclosure temp"},
		min:   1, max: 31, dailyAmp: 9, peakHour: 15, noise: 0.25, decimals: 2,
	},
	{
		typ: loraprotocol.Humidity, typeName: "humidity",
		names: []string{"Air humidity", "Soil moisture"},
		min:   28, max: 99, dailyAmp: 18, peakHour: 4, noise: 1.2, decimals: 1,
	},
	{
		typ: loraprotocol.Voltage, typeName: "voltage",
		names: []string{"Battery", "Solar panel", "Supply voltage"},
		min:   3.15, max: 4.2, dailyAmp: 0.04, peakHour: 14, noise: 0.006, drift: -0.012, decimals: 3,
	},
	{
		typ: loraprotocol.Pressure, typeName: "pressure",
		names: []string{"Air pressure"},
		min:   978, max: 1034, dailyAmp: 1.5, peakHour: 10, noise: 0.35, decimals: 1,
	},
	{
		typ: loraprotocol.Brightness, typeName: "brightness",
		names: []string{"Ambient light", "Daylight"},
		min:   0, max: 65000, dailyAmp: 52000, peakHour: 13, noise: 900, decimals: 0, nightZero: true,
	},
	{
		typ: loraprotocol.PPx, typeName: "ppx",
		names: []string{"CO₂", "TVOC"},
		min:   410, max: 1400, dailyAmp: 260, peakHour: 20, noise: 18, decimals: 0,
	},
	{
		typ: loraprotocol.PH, typeName: "ph",
		names: []string{"Water pH"},
		min:   5.4, max: 8.6, dailyAmp: 0.25, peakHour: 16, noise: 0.04, decimals: 2,
	},
	{
		typ: loraprotocol.SoundLevel, typeName: "sound",
		names: []string{"Noise level"},
		min:   28, max: 82, dailyAmp: 16, peakHour: 18, noise: 2.5, decimals: 1,
	},
	{
		typ: loraprotocol.Resistance, typeName: "resistance",
		names: []string{"Leaf wetness", "Gas sensor resistance"},
		min:   180, max: 9800, dailyAmp: 1800, peakHour: 3, noise: 140, decimals: 0,
	},
	{
		typ: loraprotocol.Float, typeName: "float",
		names: []string{"Flow rate", "Raw reading"},
		min:   0, max: 24, dailyAmp: 5, peakHour: 8, noise: 0.6, decimals: 2,
	},
	{
		typ: loraprotocol.Boolean, typeName: "boolean",
		names: []string{"Pump running", "Lid open", "Overflow"},
	},
}

// uniqueDeviceName keeps two devices in the same fleet from ending up with the
// same label, which reads as a duplicate rather than as two barrels.
func uniqueDeviceName(rng *rand.Rand, used map[string]struct{}) string {
	for attempt := 0; ; attempt++ {
		name := fmt.Sprintf("%s %s", deviceAdjectives[rng.IntN(len(deviceAdjectives))], deviceNouns[rng.IntN(len(deviceNouns))])
		if attempt >= 32 {
			// More devices than the word lists can name distinctly.
			name = fmt.Sprintf("%s %d", name, len(used)+1)
		}
		if _, taken := used[name]; taken {
			continue
		}
		used[name] = struct{}{}
		return name
	}
}

var (
	deviceAdjectives = []string{"North", "South", "Garden", "Rooftop", "Allotment", "Courtyard", "Cellar", "Greenhouse", "Schoolyard", "Riverside"}
	deviceNouns      = []string{"Barrel", "Cistern", "Tank", "Butt", "Reservoir", "Downpipe"}
	groupLabels      = []string{"Community Garden", "School Roofs", "Allotment Colony", "City Depot"}
)

// channel is one slot of one device: which sensor sits there, whether anyone has
// described it, and how reliably it reports.
type channel struct {
	id        int16
	spec      spec
	name      string
	described bool
	// A described channel that has never carried a reading — the dashboard shows
	// it as an empty labelled card, which is worth having in the seed data.
	silent   bool
	dropRate float64
}

// specDeck deals sensor types out across the whole fleet without replacement,
// reshuffling only once every type has been used. Drawing independently per
// device left whole types (booleans, most notably) missing from a small fleet,
// which is exactly the case the dashboard has a distinct rendering for.
type specDeck struct {
	rng       *rand.Rand
	remaining []spec
}

func newSpecDeck(rng *rand.Rand) *specDeck {
	return &specDeck{rng: rng}
}

func (d *specDeck) draw() spec {
	if len(d.remaining) == 0 {
		d.remaining = append(d.remaining, specs...)
		d.rng.Shuffle(len(d.remaining), func(i, j int) {
			d.remaining[i], d.remaining[j] = d.remaining[j], d.remaining[i]
		})
	}
	s := d.remaining[len(d.remaining)-1]
	d.remaining = d.remaining[:len(d.remaining)-1]
	return s
}

// pickChannels lays out a device's slots: a handful of sensor types on
// consecutive channels, with one channel left undescribed and one described but
// silent, so every state the dashboard renders appears somewhere in the fleet.
// forceUndescribed and forceSilent name the device that is guaranteed to carry
// each of those channel states, so a small fleet still covers both instead of
// leaving it to the dice.
func pickChannels(deck *specDeck, rng *rand.Rand, forceUndescribed, forceSilent bool) []channel {
	count := 2 + rng.IntN(3)

	channels := make([]channel, 0, count+2)
	add := func(described, silent bool) {
		s := deck.draw()
		ch := channel{
			id:        int16(len(channels)),
			spec:      s,
			described: described,
			silent:    silent,
			dropRate:  rng.Float64() * 0.06,
		}
		if described {
			ch.name = s.names[rng.IntN(len(s.names))]
		}
		channels = append(channels, ch)
	}

	for range count {
		add(true, false)
	}

	// Beyond the guaranteed one, roughly a third of devices report on a channel
	// nobody has described, and roughly a third have a prepared slot that has
	// never reported.
	if forceUndescribed || rng.Float64() < 0.34 {
		add(false, false)
	}
	if forceSilent || rng.Float64() < 0.34 {
		add(true, true)
	}

	if len(channels) > loraprotocol.MaxChannelID+1 {
		channels = channels[:loraprotocol.MaxChannelID+1]
	}
	return channels
}

// generator turns a spec into an actual series. Readings are a baseline plus a
// daily cycle plus a mean-reverting random walk, so consecutive values are
// correlated the way a real sensor's are rather than independently random.
type generator struct {
	spec spec
	// Where this particular sensor sits inside its spec's range, and how far the
	// walk has currently wandered from it.
	base    float64
	walk    float64
	phase   float64 // per-device offset of the daily peak, in hours
	epoch   time.Time
	state   bool    // current value, for Boolean channels
	flipPer float64 // probability a Boolean flips between readings
}

func newGenerator(s spec, rng *rand.Rand) *generator {
	span := s.max - s.min
	return &generator{
		spec: s,
		// Keep the baseline off the rails so the daily cycle has room on both
		// sides before clamping kicks in.
		base:    s.min + span*(0.3+rng.Float64()*0.4),
		phase:   rng.Float64()*2 - 1,
		state:   rng.Float64() < 0.3,
		flipPer: 0.01 + rng.Float64()*0.05,
	}
}

func (g *generator) at(t time.Time, rng *rand.Rand) any {
	if g.spec.typ == loraprotocol.Boolean {
		if rng.Float64() < g.flipPer {
			g.state = !g.state
		}
		return g.state
	}

	if g.epoch.IsZero() {
		g.epoch = t
	}
	days := t.Sub(g.epoch).Hours() / 24

	// Mean-reverting so the walk stays a wobble around the baseline instead of
	// drifting off and pinning itself to a clamp.
	g.walk = g.walk*0.94 + rng.NormFloat64()*g.spec.noise

	hour := float64(t.Hour()) + float64(t.Minute())/60
	cycle := math.Sin(2 * math.Pi * (hour - g.spec.peakHour - g.phase) / 24)

	value := g.base + g.spec.dailyAmp*cycle/2 + g.walk + g.spec.drift*days

	if g.spec.nightZero {
		// Light sensors read essentially nothing at night; the smooth sinusoid
		// would otherwise put a plausible-looking glow at 3am.
		if daylight := math.Max(0, cycle); daylight == 0 {
			value = math.Abs(g.walk) * 0.02
		} else {
			value = g.spec.min + g.spec.dailyAmp*daylight + g.walk
		}
	}

	// A drifting series (a discharging battery) gets recharged rather than
	// flat-lining against the floor for the rest of the window.
	if g.spec.drift != 0 && (value < g.spec.min || value > g.spec.max) {
		g.epoch = t
		g.walk = 0
		span := g.spec.max - g.spec.min
		g.base = g.spec.min + span*(0.6+rng.Float64()*0.3)
		value = g.base
	}

	value = math.Min(g.spec.max, math.Max(g.spec.min, value))
	value = round(value, g.spec.decimals)

	// float32 to match what the uplink decoder produces, so seeded values have
	// the same precision as ingested ones.
	return float32(value)
}

// measurementValue flattens a generated point to the numeric shape every
// measurement is stored in, matching what the ingest path does with a decoded
// uplink. Kept in step with api.measurementValue.
func measurementValue(value any) (float64, error) {
	switch v := value.(type) {
	case bool:
		if v {
			return 1, nil
		}
		return 0, nil
	case float32:
		return float64(v), nil
	case float64:
		return v, nil
	default:
		return 0, fmt.Errorf("unsupported measurement value type %T", value)
	}
}

func round(v float64, decimals int) float64 {
	f := math.Pow(10, float64(decimals))
	return math.Round(v*f) / f
}

// takenStrings collects one text column into a set of values a new run must not
// reuse.
func takenStrings(ctx context.Context, tx pgx.Tx, query string) (map[string]struct{}, error) {
	rows, err := tx.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	taken := make(map[string]struct{})
	for rows.Next() {
		var value string
		if err := rows.Scan(&value); err != nil {
			return nil, err
		}
		taken[value] = struct{}{}
	}
	return taken, rows.Err()
}

// uniqueGroupName numbers a label up until it is one no group already carries,
// so seeding twice adds "Seed Community Garden 2" rather than a second group
// indistinguishable from the first.
func uniqueGroupName(index int, taken map[string]struct{}) string {
	base := seedGroupPrefix + groupLabels[index%len(groupLabels)]
	name := base
	for n := 2; ; n++ {
		if _, ok := taken[name]; !ok {
			taken[name] = struct{}{}
			return name
		}
		name = fmt.Sprintf("%s %d", base, n)
	}
}

// uniqueEUI draws a DevEUI no device holds yet. device_eui is unique across the
// whole table, so a re-run has to skip past the EUIs already in it.
func uniqueEUI(rng *rand.Rand, taken map[string]struct{}) string {
	for {
		eui := randomEUI(rng)
		if _, ok := taken[eui]; ok {
			continue
		}
		taken[eui] = struct{}{}
		return eui
	}
}

const hexDigits = "0123456789ABCDEF"

// randomEUI builds a DevEUI that looks like the real thing but is recognisably
// ours: 16 hex digits starting with the seed prefix.
func randomEUI(rng *rand.Rand) string {
	var sb strings.Builder
	sb.WriteString(seedEUIPrefix)
	for range 16 - len(seedEUIPrefix) {
		sb.WriteByte(hexDigits[rng.IntN(len(hexDigits))])
	}
	return sb.String()
}
