import { createMemo, createResource, type Resource } from "solid-js";
import {
  getDeviceMeasurements,
  getLatestMeasurements,
  getOverview,
  type BackendDeviceMeasurement,
  type BackendLatestDevice,
} from "./api";
import { useSubscriptions } from "./subscriptions";

export enum SensorType {
  Boolean = 0b0000,
  Float = 0b0001,
  Pressure = 0b0010,
  Voltage = 0b0011,
  Distance = 0b0100,
  Temperature = 0b0101,
  PPx = 0b0110,
  Brightness = 0b0111,
  Resistance = 0b1000,
  Humidity = 0b1001,
  pH = 0b1010,
  SoundLevel = 0b1011,
}

export type SensorReading =
  | { type: SensorType.Boolean; value: boolean }
  | { type: SensorType.Float; value: number; unit?: string }
  | { type: SensorType.Pressure; value: number; unit: "hPa" }
  | { type: SensorType.Voltage; value: number; unit: "V" }
  | { type: SensorType.Distance; value: number; unit: "cm" }
  | { type: SensorType.Temperature; value: number; unit: "°C" }
  | { type: SensorType.PPx; value: number; unit: "ppm" }
  | { type: SensorType.Brightness; value: number; unit: "lx" }
  | { type: SensorType.Resistance; value: number; unit: "Ω" }
  | { type: SensorType.Humidity; value: number; unit: "%" }
  | { type: SensorType.pH; value: number }
  | { type: SensorType.SoundLevel; value: number; unit: "dB" };

// `channel` is the device channel (0–15) the reading arrived on. It's optional
// because sample/preview readings aren't tied to a real channel. `latestAt` is
// when the reading arrived — the latest endpoints are unbounded in time, so
// without it a months-old value is indistinguishable from a current one.
export type SensorReadingWithChannel = SensorReading & {
  channel?: number;
  latestAt?: number;
};

export type Sensor = {
  id: string;
  name: string;
  lngLat: [number, number];
  // Whether the token this device was resolved through grants read-only access.
  // Undefined when access is not token-scoped (e.g. mock/sample sensors).
  isReadonly?: boolean;
  readings: SensorReadingWithChannel[];
};

export type SensorReadingWithHistory = SensorReading & {
  history?: { t: number; value: number }[];
  // Epoch ms of the reading that produced `value`. Lets the UI tell a fresh
  // headline value apart from one that is only the newest thing on record.
  latestAt?: number;
  channel?: number;
};

export type SensorWithHistory = Omit<Sensor, "readings"> & {
  readings: SensorReadingWithHistory[];
};

// Backend measurement_type values map 1:1 to SensorType — see
// web/dashboard/internal/lora_protocol/decoder.go.
function readingFromBackend(
  type_: number,
  value: number | boolean | null,
): SensorReading | null {
  if (value === null) return null;
  switch (type_ as SensorType) {
    case SensorType.Boolean:
      return { type: SensorType.Boolean, value: Boolean(value) };
    case SensorType.Float:
      return { type: SensorType.Float, value: Number(value) };
    case SensorType.Pressure:
      return { type: SensorType.Pressure, value: Number(value), unit: "hPa" };
    case SensorType.Voltage:
      return { type: SensorType.Voltage, value: Number(value), unit: "V" };
    case SensorType.Distance:
      return { type: SensorType.Distance, value: Number(value), unit: "cm" };
    case SensorType.Temperature:
      return { type: SensorType.Temperature, value: Number(value), unit: "°C" };
    case SensorType.PPx:
      return { type: SensorType.PPx, value: Number(value), unit: "ppm" };
    case SensorType.Brightness:
      return { type: SensorType.Brightness, value: Number(value), unit: "lx" };
    case SensorType.Resistance:
      return { type: SensorType.Resistance, value: Number(value), unit: "Ω" };
    case SensorType.Humidity:
      return { type: SensorType.Humidity, value: Number(value), unit: "%" };
    case SensorType.pH:
      return { type: SensorType.pH, value: Number(value) };
    case SensorType.SoundLevel:
      return { type: SensorType.SoundLevel, value: Number(value), unit: "dB" };
    default:
      return null;
  }
}

// Devices without a known location — TTN never provided one — get pinned to
// the map centre so they're still visible on the dashboard.
export const LEIPZIG_CENTER: [number, number] = [12.3731, 51.3397];

export type LatestSensorsResult = {
  sensors: Resource<Sensor[]>;
  refetch: () => void;
};

export function useLatestSensors(): LatestSensorsResult {
  const subscriptions = useSubscriptions();

  const [sensors, { refetch }] = createResource<Sensor[], { groups: string[]; devices: string[] }>(
    () => ({ groups: subscriptions().groups, devices: subscriptions().devices }),
    async (sub) => {
      if (sub.groups.length === 0 && sub.devices.length === 0) return [];
      const devices = await getLatestMeasurements(sub);
      return devices.map(deviceToSensor);
    },
    { initialValue: [] },
  );

  return { sensors, refetch: () => void refetch() };
}

// A subscribed group and the devices that belong to it, mapped into the
// frontend `Sensor` shape. `token` is the subscription token that resolved to
// this group, used to remove the subscription.
export type SensorGroup = {
  token: string;
  name: string;
  isReadonly: boolean;
  devices: Sensor[];
};

export type Overview = {
  // Subscribed groups, each with its member devices nested inside.
  groups: SensorGroup[];
  // Directly-subscribed devices that are not members of any returned group.
  devices: Sensor[];
  // Every device flattened and de-duplicated by id — the source for map pins
  // and the active-sensor lookup, regardless of how it was subscribed.
  all: Sensor[];
};

const EMPTY_OVERVIEW: Overview = { groups: [], devices: [], all: [] };

export type LatestOverviewResult = {
  overview: Resource<Overview>;
  refetch: () => void;
};

// Fetches the grouped dashboard view for the current subscriptions: devices
// organized under their groups plus standalone devices. Also exposes a
// flattened `all` list for the map.
export function useOverview(): LatestOverviewResult {
  const subscriptions = useSubscriptions();

  const [overview, { refetch }] = createResource<Overview, { groups: string[]; devices: string[] }>(
    () => ({ groups: subscriptions().groups, devices: subscriptions().devices }),
    async (sub) => {
      if (sub.groups.length === 0 && sub.devices.length === 0) return EMPTY_OVERVIEW;
      const data = await getOverview(sub);
      const groups: SensorGroup[] = data.groups.map((g) => ({
        token: g.token,
        name: g.name,
        isReadonly: g.is_readonly,
        devices: g.devices.map(deviceToSensor),
      }));
      const devices = data.devices.map(deviceToSensor);

      const seen = new Set<string>();
      const all: Sensor[] = [];
      for (const s of [...groups.flatMap((g) => g.devices), ...devices]) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        all.push(s);
      }
      return { groups, devices, all };
    },
    { initialValue: EMPTY_OVERVIEW },
  );

  return { overview, refetch: () => void refetch() };
}

export function deviceToSensor(device: BackendLatestDevice): Sensor {
  const hasLocation =
    typeof device.longitude === "number" && typeof device.latitude === "number";
  const readings: SensorReadingWithChannel[] = [];
  for (const m of device.measurements) {
    const reading = readingFromBackend(m.measurement_type, m.value);
    if (!reading) continue;
    const at = Date.parse(m.received_at);
    readings.push({
      ...reading,
      channel: m.channel_id,
      latestAt: Number.isNaN(at) ? undefined : at,
    });
  }
  return {
    id: device.device_id,
    name: device.name,
    lngLat: hasLocation ? [device.longitude!, device.latitude!] : LEIPZIG_CENTER,
    isReadonly: device.is_readonly,
    readings,
  };
}

// The window a fetch actually covered. Graphs pin their time axis to this so a
// point from outside the window can't be drawn as if it were recent, and an
// empty window renders as "no data" rather than as a flat or fabricated line.
export type HistoryWindow = { start: number; end: number };

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// The rolling ranges offered in the graph period selector. Each is a lookback
// from "now"; the ranged measurements endpoint downsamples to ~2000 points
// across whatever span it's given, so a wider range costs resolution, not
// payload size.
export const HISTORY_PRESETS = [
  { id: "day", label: "Last day", spanLabel: "day", ms: DAY_MS },
  { id: "week", label: "Last 7 days", spanLabel: "7 days", ms: 7 * DAY_MS },
  { id: "month", label: "Last month", spanLabel: "month", ms: 30 * DAY_MS },
  { id: "year", label: "Last year", spanLabel: "year", ms: 365 * DAY_MS },
] as const;

export type HistoryPreset = (typeof HISTORY_PRESETS)[number]["id"];

// A rolling preset, or an explicit start/end the user picked. Custom ranges are
// absolute, so they don't drift as time passes.
export type HistoryPeriod =
  | { kind: "preset"; preset: HistoryPreset }
  | { kind: "custom"; start: number; end: number };

export const DEFAULT_HISTORY_PERIOD: HistoryPeriod = {
  kind: "preset",
  preset: "week",
};

export function historyPresetMs(preset: HistoryPreset): number {
  return (
    HISTORY_PRESETS.find((p) => p.id === preset)?.ms ?? 7 * DAY_MS
  );
}

// Resolves a period to concrete bounds. Presets are anchored to `now` at the
// moment of resolution, which is why this is called inside fetchers rather than
// held in a signal — a stored "last day" would otherwise go stale on the clock.
export function periodToWindow(
  period: HistoryPeriod,
  now = Date.now(),
): HistoryWindow {
  if (period.kind === "custom") return { start: period.start, end: period.end };
  return { start: now - historyPresetMs(period.preset), end: now };
}

// How the period reads in prose: "the last 7 days", or a formatted range for a
// custom window. Used in the panel header and the graphs' empty state.
export function periodLabel(period: HistoryPeriod): string {
  if (period.kind === "preset") {
    const preset = HISTORY_PRESETS.find((p) => p.id === period.preset);
    return `the last ${preset?.spanLabel ?? "7 days"}`;
  }
  const fmt = (t: number) =>
    new Date(t).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(period.start)} – ${fmt(period.end)}`;
}

// True when the period describes a usable range. Custom ranges come from user
// input, so they can be half-filled or backwards.
export function isValidPeriod(period: HistoryPeriod): boolean {
  if (period.kind === "preset") return true;
  return (
    Number.isFinite(period.start) &&
    Number.isFinite(period.end) &&
    period.start < period.end
  );
}

const EMPTY_WINDOW_RESULT: {
  window: HistoryWindow;
  rows: BackendDeviceMeasurement[];
} = { window: { start: 0, end: 0 }, rows: [] };

export function useDeviceMeasurements(
  deviceToken: () => string | null | undefined,
  period: () => HistoryPeriod = () => DEFAULT_HISTORY_PERIOD,
) {
  const [result, { refetch }] = createResource(
    () => {
      const token = deviceToken();
      if (!token) return null;
      const p = period();
      // An unusable custom range would otherwise be sent to the backend as a
      // backwards or NaN interval; hold the previous view until it's complete.
      if (!isValidPeriod(p)) return null;
      return { token, period: p };
    },
    async ({ token, period: p }) => {
      const window = periodToWindow(p);
      const rows = await getDeviceMeasurements(token, {
        start: new Date(window.start),
        end: new Date(window.end),
      });
      return { window, rows };
    },
    { initialValue: EMPTY_WINDOW_RESULT },
  );

  const measurements = createMemo(() => result()?.rows ?? []);

  // Falls back to the requested period so a graph rendered before the first
  // fetch resolves still has a sane axis instead of the 1970 epoch.
  const window = createMemo<HistoryWindow>(() => {
    const w = result()?.window;
    if (w && w.end > 0) return w;
    return periodToWindow(period());
  });

  const readings = createMemo<SensorReadingWithHistory[]>(() => {
    const rows = result()?.rows;
    if (!rows || rows.length === 0) return [];
    // Clip to the requested window: the backend is the source of truth for the
    // range, but clipping here means a stale or unbounded response can never
    // put out-of-period points on the graph.
    return reduceMeasurementsToReadings(rows, window().start);
  });

  return { result, measurements, readings, window, refetch: () => void refetch() };
}

// Fetch the given period of measurements for a single channel of a device and
// reduce them to one reading-with-history. Returns null while there is no
// device token / selected channel, or when the channel has no data in range.
export function useChannelHistory(
  deviceToken: () => string | null | undefined,
  channel: () => number | null,
  period: () => HistoryPeriod = () => DEFAULT_HISTORY_PERIOD,
) {
  const [result, { refetch }] = createResource(
    () => {
      const token = deviceToken();
      const ch = channel();
      if (!token || ch === null) return null;
      const p = period();
      if (!isValidPeriod(p)) return null;
      return { token, channel: ch, period: p };
    },
    async ({ token, channel: ch, period: p }) => {
      const window = periodToWindow(p);
      const rows = await getDeviceMeasurements(token, {
        start: new Date(window.start),
        end: new Date(window.end),
        channel: ch,
      });
      if (rows.length === 0) return { window, reading: null };
      const reading = reduceMeasurementsToReadings(rows, window.start)[0] ?? null;
      return { window, reading };
    },
    { initialValue: null },
  );

  const reading = createMemo(() => result()?.reading ?? null);
  const window = createMemo<HistoryWindow>(() => {
    const w = result()?.window;
    if (w && w.end > 0) return w;
    return periodToWindow(period());
  });

  return { result, reading, window, refetch: () => void refetch() };
}

// `since` (epoch ms) clips the result to the graph window: rows older than it
// are dropped, and a channel whose only rows fall outside the window is left
// out entirely rather than reported as a current reading.
export function reduceMeasurementsToReadings(
  rows: BackendDeviceMeasurement[],
  since?: number,
): SensorReadingWithHistory[] {
  // Rows arrive grouped by channel, ascending in time within each channel.
  // Build history per channel and keep the most recent reading as the headline
  // value (compared by timestamp so ordering assumptions can't silently break).
  type Acc = {
    latest: BackendDeviceMeasurement;
    latestAt: number;
    history: { t: number; value: number }[];
  };
  const byChannel = new Map<number, Acc>();
  for (const row of rows) {
    const t = Date.parse(row.received_at);
    // Unparseable timestamps can't be placed on a time axis, and can't be
    // checked against the window either — skip them.
    if (Number.isNaN(t)) continue;
    if (since !== undefined && t < since) continue;
    let acc = byChannel.get(row.channel_id);
    if (!acc) {
      acc = { latest: row, latestAt: t, history: [] };
      byChannel.set(row.channel_id, acc);
    }
    if (t >= acc.latestAt) {
      acc.latest = row;
      acc.latestAt = t;
    }
    if (typeof row.value === "number") {
      acc.history.push({ t, value: row.value });
    } else if (typeof row.value === "boolean") {
      acc.history.push({ t, value: row.value ? 1 : 0 });
    }
  }

  const out: SensorReadingWithHistory[] = [];
  for (const acc of byChannel.values()) {
    // The graph needs chronological history; rows are already ascending per
    // channel, but sort defensively in case channels interleave.
    acc.history.sort((a, b) => a.t - b.t);
    const reading = readingFromBackend(acc.latest.measurement_type, acc.latest.value);
    if (!reading) continue;
    out.push({
      ...reading,
      history: acc.history,
      latestAt: acc.latestAt,
      channel: acc.latest.channel_id,
    });
  }
  return out;
}

const MOCK_SENSORS: Sensor[] = [
  {
    id: "hbf",
    name: "Hauptbahnhof",
    lngLat: [12.3815, 51.345],
    readings: [
      { type: SensorType.Distance, value: 42, unit: "cm" },
      { type: SensorType.Temperature, value: 18.4, unit: "°C" },
      { type: SensorType.PPx, value: 412, unit: "ppm" },
    ],
  },
  {
    id: "plagwitz",
    name: "Plagwitz",
    lngLat: [12.327, 51.332],
    readings: [
      { type: SensorType.Distance, value: 31, unit: "cm" },
      { type: SensorType.Humidity, value: 64, unit: "%" },
      { type: SensorType.Brightness, value: 8200, unit: "lx" },
    ],
  },
  {
    id: "connewitz",
    name: "Connewitz",
    lngLat: [12.37, 51.305],
    readings: [
      { type: SensorType.Distance, value: 55, unit: "cm" },
      { type: SensorType.pH, value: 7.2 },
      { type: SensorType.Voltage, value: 3.86, unit: "V" },
    ],
  },
  {
    id: "gohlis",
    name: "Gohlis",
    lngLat: [12.365, 51.365],
    readings: [
      { type: SensorType.Distance, value: 19, unit: "cm" },
      { type: SensorType.Temperature, value: 17.1, unit: "°C" },
      { type: SensorType.SoundLevel, value: 54, unit: "dB" },
    ],
  },
  {
    id: "stoetteritz",
    name: "Stötteritz",
    lngLat: [12.415, 51.323],
    readings: [
      { type: SensorType.Distance, value: 27, unit: "cm" },
      { type: SensorType.Humidity, value: 71, unit: "%" },
      { type: SensorType.Pressure, value: 1013, unit: "hPa" },
    ],
  },
  {
    id: "reudnitz",
    name: "Reudnitz",
    lngLat: [12.397, 51.337],
    readings: [
      { type: SensorType.Distance, value: 36, unit: "cm" },
      { type: SensorType.PPx, value: 460, unit: "ppm" },
      { type: SensorType.Humidity, value: 58, unit: "%" },
      { type: SensorType.Resistance, value: 12400, unit: "Ω" },
    ],
  },
  {
    id: "binmitte",
    name: "BinMitte",
    lngLat: [12.3731, 51.3397],
    readings: [
      { type: SensorType.Distance, value: 48, unit: "cm" },
      { type: SensorType.Temperature, value: 19.2, unit: "°C" },
      { type: SensorType.Humidity, value: 62, unit: "%" },
      { type: SensorType.PPx, value: 380, unit: "ppm" },
      { type: SensorType.Boolean, value: true },
    ],
  },
];

export function useSensors(): Sensor[] {
  return MOCK_SENSORS;
}

export const ALL_SENSOR_TYPES: SensorType[] = [
  SensorType.Boolean,
  SensorType.Float,
  SensorType.Pressure,
  SensorType.Voltage,
  SensorType.Distance,
  SensorType.Temperature,
  SensorType.PPx,
  SensorType.Brightness,
  SensorType.Resistance,
  SensorType.Humidity,
  SensorType.pH,
  SensorType.SoundLevel,
];

export function sampleReading(type: SensorType): SensorReading {
  switch (type) {
    case SensorType.Boolean:
      return { type, value: true };
    case SensorType.Float:
      return { type, value: 42 };
    case SensorType.Pressure:
      return { type, value: 1013, unit: "hPa" };
    case SensorType.Voltage:
      return { type, value: 3.7, unit: "V" };
    case SensorType.Distance:
      return { type, value: 30, unit: "cm" };
    case SensorType.Temperature:
      return { type, value: 20, unit: "°C" };
    case SensorType.PPx:
      return { type, value: 400, unit: "ppm" };
    case SensorType.Brightness:
      return { type, value: 5000, unit: "lx" };
    case SensorType.Resistance:
      return { type, value: 10000, unit: "Ω" };
    case SensorType.Humidity:
      return { type, value: 60, unit: "%" };
    case SensorType.pH:
      return { type, value: 7.0 };
    case SensorType.SoundLevel:
      return { type, value: 50, unit: "dB" };
  }
}

export function sensorLabel(type: SensorType): string {
  switch (type) {
    case SensorType.Boolean:
      return "Status";
    case SensorType.Float:
      return "Value";
    case SensorType.Pressure:
      return "Pressure";
    case SensorType.Voltage:
      return "Voltage";
    case SensorType.Distance:
      return "Water Level";
    case SensorType.Temperature:
      return "Temperature";
    case SensorType.PPx:
      return "Air Quality";
    case SensorType.Brightness:
      return "Brightness";
    case SensorType.Resistance:
      return "Resistance";
    case SensorType.Humidity:
      return "Humidity";
    case SensorType.pH:
      return "pH";
    case SensorType.SoundLevel:
      return "Sound Level";
  }
}

export function sensorUnit(r: SensorReading): string | undefined {
  return "unit" in r ? r.unit : undefined;
}
