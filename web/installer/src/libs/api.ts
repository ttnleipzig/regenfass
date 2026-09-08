// Base URL is taken from VITE_API_BASE_URL at build time. Defaults to the local
// backend (see web/dashboard/main.go: listenAddrFlag).
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:64000";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

// Every measurement is stored as a single number: the backend flattens a
// Boolean to 0 or 1 at ingest. The channel's type says how to read the value,
// so 0 on a Boolean channel is unambiguously "off".
export type BackendMeasurementValue = number;

// One reading of a channel. How to read the value is a property of the
// channel (`measurement_type` if declared, else `reported_type`), so it is not
// repeated per sample.
export type BackendMeasurementSample = {
  received_at: string;
  value: BackendMeasurementValue;
};

// A channel of a device and how it has been described. The backend lists a
// channel once somebody described or hid it — so a slot set up before the
// device ever reported on it is here — and once it has carried a measurement.
// `name` and `measurement_type` are absent for a channel nobody has described;
// `measurement_type` is the type the user declared. `reported_type` is the type
// the channel's newest reading in the response was decoded with, straight from
// the uplink payload; absent for a channel with no readings in the response.
export type BackendDeviceChannel = {
  channel_id: number;
  name?: string;
  measurement_type?: number;
  reported_type?: number;
  // A hidden channel is still listed so it can be restored, but carries no
  // readings in any measurement response.
  hidden: boolean;
};

// A channel with its newest reading, as the latest/overview endpoints return
// it. `latest` is absent while the channel has never reported, or is hidden.
export type BackendLatestDeviceChannel = BackendDeviceChannel & {
  latest?: BackendMeasurementSample;
};

// A channel with its downsampled readings in the requested range, ordered
// chronologically. Empty for a channel with nothing in range — the channel is
// still listed, which is what lets a freshly described slot show up at all.
export type BackendRangedDeviceChannel = BackendDeviceChannel & {
  measurements: BackendMeasurementSample[];
};

export type BackendLatestDevice = {
  device_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  // Only present on endpoints that resolve a device through a specific token
  // (e.g. /overview); omitted where read/write access is not token-scoped.
  is_readonly?: boolean;
  channels: BackendLatestDeviceChannel[];
};

export type LatestMeasurementsRequest = {
  groups?: string[];
  devices?: string[];
};

// Carries the HTTP status so callers can branch on it (e.g. 409 when a device
// EUI has already been enrolled) instead of matching on the message text.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Sends the request and throws an ApiError carrying the status on any non-2xx
// response. Returns the raw response so callers can decide whether there is a
// body to read — the write endpoints answer 204 with none.
async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ?? JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new ApiError(
      res.status,
      `API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
    );
  }
  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init);
  return (await res.json()) as T;
}

async function requestNoContent(path: string, init?: RequestInit): Promise<void> {
  await send(path, init);
}

// The measurements endpoint is a downsampled ranged query: `start` and `end`
// (RFC3339) are required and it returns roughly 2000 points per channel across
// the range, each point being the newest actual reading in its time bucket.
export type DeviceMeasurementsQuery = {
  start: Date | string;
  end: Date | string;
  channel?: number;
};

// Ranged response. Every channel of the device is listed, its description
// attached once, with its readings in the range nested under it (ordered
// chronologically). `bucket_seconds` reports the downsample bucket width
// actually used. With `channel` given, only that channel is listed.
export type DeviceMeasurementsResponse = {
  start: string;
  end: string;
  channel_id?: number;
  bucket_seconds: number;
  channels: BackendRangedDeviceChannel[];
};

export async function getDeviceMeasurements(
  deviceToken: string,
  query: DeviceMeasurementsQuery,
): Promise<BackendRangedDeviceChannel[]> {
  const toIso = (v: Date | string) => (typeof v === "string" ? v : v.toISOString());
  const params = new URLSearchParams();
  params.set("start", toIso(query.start));
  params.set("end", toIso(query.end));
  if (query.channel !== undefined) params.set("channel", String(query.channel));
  const path = `/device/${encodeURIComponent(deviceToken)}/measurements?${params.toString()}`;
  const body = await request<DeviceMeasurementsResponse>(path);
  return body.channels ?? [];
}

export type DeviceInfoResponse = {
  device_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  is_readonly: boolean;
  read_only_token: string;
  read_write_token?: string;
};

export type RegisterDeviceResponse = {
  read_write_token: string;
  read_only_token: string;
};

// Enrolls a device in the cloud by its LoRaWAN DevEUI. /ingest only stores
// uplinks for devices that already exist, so this is what makes a freshly
// flashed device start collecting measurements. An EUI the backend already
// knows comes back as 409 — the tokens handed out the first time are the only
// way back to that device.
export async function registerDevice(
  deviceEUI: string,
): Promise<RegisterDeviceResponse> {
  return request<RegisterDeviceResponse>("/device", {
    method: "POST",
    body: JSON.stringify({ device_eui: deviceEUI }),
  });
}

export async function getDeviceInfo(token: string): Promise<DeviceInfoResponse> {
  return request<DeviceInfoResponse>(`/device/${encodeURIComponent(token)}`);
}

export async function updateDeviceName(
  deviceToken: string,
  name: string,
): Promise<void> {
  await requestNoContent(`/device/${encodeURIComponent(deviceToken)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

// Passing either field as null (or the name as empty) clears it, returning the
// channel to being undescribed.
export type DeviceChannelUpdate = {
  name?: string | null;
  measurement_type?: number | null;
};

// Describes one of a device's channels: its name and the sensor type the user
// declared for it. The channel need not have reported anything yet — describing
// it up front is how a slot is prepared for a sensor. Requires the RW token; a
// read-only token comes back as 403.
export async function upsertDeviceChannel(
  deviceToken: string,
  channel: number,
  update: DeviceChannelUpdate,
): Promise<void> {
  await requestNoContent(
    `/device/${encodeURIComponent(deviceToken)}/channels/${channel}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: update.name ?? null,
        measurement_type: update.measurement_type ?? null,
      }),
    },
  );
}

// Takes a channel off the dashboard, or puts it back. Nothing is deleted: the
// measurements stay and keep arriving, they are just not returned while the
// channel is hidden. Requires the RW token; a read-only token comes back as 403.
export async function setDeviceChannelHidden(
  deviceToken: string,
  channel: number,
  hidden: boolean,
): Promise<void> {
  await requestNoContent(
    `/device/${encodeURIComponent(deviceToken)}/channels/${channel}/hidden`,
    { method: "PUT", body: JSON.stringify({ hidden }) },
  );
}

export type GroupInfoResponse = {
  name: string;
  is_readonly: boolean;
  devices: { token: string; is_readonly: boolean }[];
};

export type ResolvedToken =
  | { kind: "device"; info: DeviceInfoResponse }
  | { kind: "group"; info: GroupInfoResponse };

// Probe both /device/:token and /group/:token to determine whether a token
// belongs to a device or a group. The two endpoints accept either the RW or RO
// token, so RW/RO are both supported transparently.
export async function resolveToken(token: string): Promise<ResolvedToken | null> {
  const path = encodeURIComponent(token);
  const [deviceRes, groupRes] = await Promise.allSettled([
    fetch(`${API_BASE_URL}/device/${path}`),
    fetch(`${API_BASE_URL}/group/${path}`),
  ]);

  if (deviceRes.status === "fulfilled" && deviceRes.value.ok) {
    const info = (await deviceRes.value.json()) as DeviceInfoResponse;
    return { kind: "device", info };
  }
  if (groupRes.status === "fulfilled" && groupRes.value.ok) {
    const info = (await groupRes.value.json()) as GroupInfoResponse;
    return { kind: "group", info };
  }
  return null;
}

export async function getLatestMeasurements(
  req: LatestMeasurementsRequest,
): Promise<BackendLatestDevice[]> {
  const body = await request<{ devices: BackendLatestDevice[] }>(
    "/measurements/latest",
    {
      method: "POST",
      body: JSON.stringify({
        groups: req.groups ?? [],
        devices: req.devices ?? [],
      }),
    },
  );
  return body.devices ?? [];
}

// A subscribed group together with its member devices and each device's latest
// reading per channel. `token` echoes back the subscription token that resolved
// to this group so the client can correlate it with its stored subscriptions.
export type BackendOverviewGroup = {
  token: string;
  name: string;
  is_readonly: boolean;
  devices: BackendLatestDevice[];
};

// The dashboard view of a set of subscriptions: devices organized under the
// groups they belong to, plus directly-subscribed devices that are not members
// of any returned group.
export type BackendOverview = {
  groups: BackendOverviewGroup[];
  devices: BackendLatestDevice[];
};

export async function getOverview(
  req: LatestMeasurementsRequest,
): Promise<BackendOverview> {
  const body = await request<Partial<BackendOverview>>("/overview", {
    method: "POST",
    body: JSON.stringify({
      groups: req.groups ?? [],
      devices: req.devices ?? [],
    }),
  });
  return { groups: body.groups ?? [], devices: body.devices ?? [] };
}
