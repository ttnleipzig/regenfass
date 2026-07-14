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
// because sample/preview readings aren't tied to a real channel.
export type SensorReadingWithChannel = SensorReading & {
  channel?: number;
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
  channel?: number;
};

export type SensorWithHistory = Omit<Sensor, "readings"> & {
  readings: SensorReadingWithHistory[];
};

// Backend measurement_type values map 1:1 to SensorType — see
// backend/internal/lora_protocol/decoder.go.
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
    if (reading) readings.push({ ...reading, channel: m.channel_id });
  }
  return {
    id: device.device_id,
    name: device.name,
    lngLat: hasLocation ? [device.longitude!, device.latitude!] : LEIPZIG_CENTER,
    isReadonly: device.is_readonly,
    readings,
  };
}

// How far back the device detail panel graphs reach. The ranged measurements
// endpoint downsamples to ~2000 points across this window, so the exact width
// only affects resolution, not payload size.
const DEVICE_HISTORY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function useDeviceMeasurements(deviceToken: () => string | null | undefined) {
  const [measurements, { refetch }] = createResource(
    () => deviceToken() ?? null,
    async (token) => {
      if (!token) return [] as BackendDeviceMeasurement[];
      const end = new Date();
      const start = new Date(end.getTime() - DEVICE_HISTORY_WINDOW_MS);
      return getDeviceMeasurements(token, { start, end });
    },
    { initialValue: [] },
  );

  const readings = createMemo<SensorReadingWithHistory[]>(() => {
    const rows = measurements();
    if (!rows || rows.length === 0) return [];
    return reduceMeasurementsToReadings(rows);
  });

  return { measurements, readings, refetch: () => void refetch() };
}

// Fetch the given window of measurements for a single channel of a device and
// reduce them to one reading-with-history. Returns null while there is no
// device token / selected channel, or when the channel has no data in range.
export function useChannelHistory(
  deviceToken: () => string | null | undefined,
  channel: () => number | null,
  windowMs = DEVICE_HISTORY_WINDOW_MS,
) {
  const [reading, { refetch }] = createResource(
    () => {
      const token = deviceToken();
      const ch = channel();
      if (!token || ch === null) return null;
      return { token, channel: ch };
    },
    async ({ token, channel: ch }) => {
      const end = new Date();
      const start = new Date(end.getTime() - windowMs);
      const rows = await getDeviceMeasurements(token, { start, end, channel: ch });
      if (rows.length === 0) return null;
      return reduceMeasurementsToReadings(rows)[0] ?? null;
    },
    { initialValue: null },
  );

  return { reading, refetch: () => void refetch() };
}

export function reduceMeasurementsToReadings(
  rows: BackendDeviceMeasurement[],
): SensorReadingWithHistory[] {
  // Rows arrive grouped by channel, ascending in time within each channel.
  // Build history per channel and keep the most recent reading as the headline
  // value (compared by timestamp so ordering assumptions can't silently break).
  type Acc = {
    latest: BackendDeviceMeasurement;
    history: { t: number; value: number }[];
  };
  const byChannel = new Map<number, Acc>();
  for (const row of rows) {
    const t = Date.parse(row.received_at);
    let acc = byChannel.get(row.channel_id);
    if (!acc) {
      acc = { latest: row, history: [] };
      byChannel.set(row.channel_id, acc);
    }
    if (t >= Date.parse(acc.latest.received_at)) acc.latest = row;
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
    out.push({ ...reading, history: acc.history, channel: acc.latest.channel_id });
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

// Deterministic fake history per (sensor, reading) so mock graphs are stable
// across renders. Replace this when real time-series data arrives from the API.
export function sensorHistory(
  seed: string,
  latest: number,
  points = 24,
): number[] {
  const rng = mulberry32(hashString(seed));
  const variance = Math.max(Math.abs(latest) * 0.15, 0.5);
  const out: number[] = [];
  let v = latest + (rng() - 0.5) * variance * 1.5;
  for (let i = 0; i < points - 1; i++) {
    v += (rng() - 0.5) * variance * 0.6;
    out.push(Math.round(v * 100) / 100);
  }
  out.push(Math.round(latest * 100) / 100);
  return out;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
