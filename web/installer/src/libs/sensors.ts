import { createMemo, createResource, type Resource } from "solid-js";
import {
  getDeviceMeasurements,
  getLatestMeasurements,
  getOverview,
  type BackendDeviceChannel,
  type BackendLatestDevice,
  type BackendMeasurementSample,
  type BackendRangedDeviceChannel,
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

// Narrows a backend channel name to one worth showing. The backend omits the
// name of a channel nobody has described; this also folds away a name that is
// only whitespace, so the UI has a single "unnamed" case to fall back from.
export function channelDisplayName(name?: string | null): string | undefined {
  const trimmed = name?.trim();
  return trimmed ? trimmed : undefined;
}

// A channel of a device and how it has been described. The backend lists every
// channel the user set up as well as every channel that has carried a
// measurement, so a slot prepared before the device ever reported on it is
// here too, with nothing but its number.
export type ChannelMapping = {
  channel: number;
  // Undefined while the channel is still unnamed (see channelDisplayName).
  name?: string;
  // The type the user declared for the slot. It decides how the channel is
  // labelled and which unit its readings render in.
  declaredType?: SensorType;
  // The type the channel's newest reading was decoded with, from the uplink
  // payload. What a reading renders as when nothing has been declared.
  // Undefined while the channel has no readings in the response.
  reportedType?: SensorType;
  // Hidden channels are listed so they can be restored, but carry no readings —
  // the backend leaves their measurements out of every response.
  hidden: boolean;
};

// `channel` is the device channel (0–15) the reading arrived on. It's optional
// because sample/preview readings aren't tied to a real channel. `channelName`
// is the name that channel was given, if any. `latestAt` is when the reading
// arrived — the latest endpoints are unbounded in time, so without it a
// months-old value is indistinguishable from a current one.
export type SensorReadingWithChannel = SensorReading & {
  channel?: number;
  channelName?: string;
  latestAt?: number;
};

export type Sensor = {
  id: string;
  name: string;
  lngLat: [number, number];
  // Whether the token this device was resolved through grants read-only access.
  // Undefined when access is not token-scoped (e.g. mock/sample sensors).
  isReadonly?: boolean;
  // Every channel of the device: described ones, including any that have never
  // reported, and ones only known from their data. Empty for sample sensors.
  channels: ChannelMapping[];
  readings: SensorReadingWithChannel[];
};

export type SensorReadingWithHistory = SensorReading & {
  history?: { t: number; value: number }[];
  // Epoch ms of the reading that produced `value`. Lets the UI tell a fresh
  // headline value apart from one that is only the newest thing on record.
  latestAt?: number;
  channel?: number;
  channelName?: string;
};

export type SensorWithHistory = Omit<Sensor, "readings"> & {
  readings: SensorReadingWithHistory[];
};

// Backend measurement_type values map 1:1 to SensorType — see
// web/dashboard/internal/lora_protocol/decoder.go.
//
// `type_` is the type to render the value *as*: a channel's declared type where
// it has one, otherwise the type its readings arrived with. Because every value
// is stored as a plain number, any type can render any value — declaring a
// Boolean channel as a Distance plots it as 0s and 1s rather than refusing.
function readingFromBackend(
  type_: number | undefined,
  value: number,
): SensorReading | null {
  if (!Number.isFinite(value)) return null;
  if (type_ === undefined) return null;
  switch (type_ as SensorType) {
    case SensorType.Boolean:
      return { type: SensorType.Boolean, value: value !== 0 };
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
  const backendChannels = device.channels ?? [];
  const channels = backendChannels.map(channelFromBackend);

  // One reading per channel that has reported. The channel's declared type, if
  // any, decides how its value renders, else the type it reported.
  const readings: SensorReadingWithChannel[] = [];
  for (const [i, ch] of backendChannels.entries()) {
    const latest = ch.latest;
    if (!latest) continue;
    const reading = readingFromBackend(renderType(channels[i]), latest.value);
    if (!reading) continue;
    const at = Date.parse(latest.received_at);
    readings.push({
      ...reading,
      channel: ch.channel_id,
      channelName: channels[i].name,
      latestAt: Number.isNaN(at) ? undefined : at,
    });
  }
  return {
    id: device.device_id,
    name: device.name,
    lngLat: hasLocation ? [device.longitude!, device.latitude!] : LEIPZIG_CENTER,
    isReadonly: device.is_readonly,
    channels,
    readings,
  };
}

// The type a channel's readings render as: what the user declared, else what
// the payload carried. Undefined only for a channel with nothing to render.
function renderType(channel: ChannelMapping): SensorType | undefined {
  return channel.declaredType ?? channel.reportedType;
}

// Guard against a type the frontend doesn't know: an unrecognized value would
// otherwise select an empty label in the editor, or render nothing.
function knownSensorType(type_: number | null | undefined): SensorType | undefined {
  return type_ !== undefined && type_ !== null && ALL_SENSOR_TYPES.includes(type_ as SensorType)
    ? (type_ as SensorType)
    : undefined;
}

function channelFromBackend(channel: BackendDeviceChannel): ChannelMapping {
  return {
    channel: channel.channel_id,
    name: channelDisplayName(channel.name),
    hidden: channel.hidden ?? false,
    declaredType: knownSensorType(channel.measurement_type),
    reportedType: knownSensorType(channel.reported_type),
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
  channels: BackendRangedDeviceChannel[];
} = { window: { start: 0, end: 0 }, channels: [] };

// Fetch the given period of a device's history. The ranged endpoint is
// self-contained: it lists every channel of the device with its description
// attached and its in-range readings nested under it, so a channel that was
// just described shows up here before it has any data, and readings render as
// the type the user declared without a second lookup.
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
      const channels = await getDeviceMeasurements(token, {
        start: new Date(window.start),
        end: new Date(window.end),
      });
      return { window, channels };
    },
    { initialValue: EMPTY_WINDOW_RESULT },
  );

  // Every channel the backend listed, whether or not it has data in the window.
  // Empty until the first fetch lands.
  const channels = createMemo<ChannelMapping[]>(() =>
    (result()?.channels ?? []).map(channelFromBackend),
  );

  // Falls back to the requested period so a graph rendered before the first
  // fetch resolves still has a sane axis instead of the 1970 epoch.
  const window = createMemo<HistoryWindow>(() => {
    const w = result()?.window;
    if (w && w.end > 0) return w;
    return periodToWindow(period());
  });

  const readings = createMemo<SensorReadingWithHistory[]>(() => {
    const fetched = result()?.channels;
    if (!fetched || fetched.length === 0) return [];
    // Clip to the requested window: the backend is the source of truth for the
    // range, but clipping here means a stale or unbounded response can never
    // put out-of-period points on the graph.
    return readingsFromChannels(fetched, window().start);
  });

  return { result, channels, readings, window, refetch: () => void refetch() };
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
      const channels = await getDeviceMeasurements(token, {
        start: new Date(window.start),
        end: new Date(window.end),
        channel: ch,
      });
      const reading = readingsFromChannels(channels, window.start)[0] ?? null;
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

// Reduces the channels of a ranged response to one reading-with-history per
// channel that has data in the window. `since` (epoch ms) clips to the graph
// window: samples older than it are dropped, and a channel whose only samples
// fall outside the window is left out entirely rather than reported as a
// current reading. A channel with no samples at all is left out too — the
// caller lists those from the channel list, not from here.
export function readingsFromChannels(
  channels: BackendRangedDeviceChannel[],
  since?: number,
): SensorReadingWithHistory[] {
  const out: SensorReadingWithHistory[] = [];
  for (const ch of channels) {
    // Samples arrive ascending in time. Keep the most recent as the headline
    // value, compared by timestamp so ordering assumptions can't silently break.
    let latest: BackendMeasurementSample | null = null;
    let latestAt = Number.NEGATIVE_INFINITY;
    const history: { t: number; value: number }[] = [];
    for (const sample of ch.measurements ?? []) {
      const t = Date.parse(sample.received_at);
      // Unparseable timestamps can't be placed on a time axis, and can't be
      // checked against the window either — skip them.
      if (Number.isNaN(t)) continue;
      if (since !== undefined && t < since) continue;
      if (t >= latestAt) {
        latest = sample;
        latestAt = t;
      }
      if (Number.isFinite(sample.value)) history.push({ t, value: sample.value });
    }
    if (!latest) continue;

    // The graph needs chronological history; sort defensively in case the
    // backend's ordering ever changes.
    history.sort((a, b) => a.t - b.t);
    const mapping = channelFromBackend(ch);
    const reading = readingFromBackend(renderType(mapping), latest.value);
    if (!reading) continue;
    out.push({
      ...reading,
      history,
      latestAt,
      channel: mapping.channel,
      channelName: mapping.name,
    });
  }
  return out;
}

const MOCK_SENSORS: Sensor[] = [
  {
    id: "hbf",
    name: "Hauptbahnhof",
    lngLat: [12.3815, 51.345],
    channels: [],
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
    channels: [],
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
    channels: [],
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
    channels: [],
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
    channels: [],
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
    channels: [],
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
    channels: [],
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
