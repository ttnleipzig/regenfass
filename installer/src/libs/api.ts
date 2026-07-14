// Base URL is taken from VITE_API_BASE_URL at build time. Defaults to the local
// backend (see backend/main.go: listenAddrFlag).
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:64000";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export type BackendMeasurementValue = number | boolean | null;

export type BackendDeviceMeasurement = {
  received_at: string;
  channel_id: number;
  channel_name: string;
  measurement_type: number;
  value: BackendMeasurementValue;
};

export type BackendLatestChannelMeasurement = {
  received_at: string;
  channel_id: number;
  channel_name: string;
  measurement_type: number;
  value: BackendMeasurementValue;
};

export type BackendLatestDevice = {
  device_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  // Only present on endpoints that resolve a device through a specific token
  // (e.g. /overview); omitted where read/write access is not token-scoped.
  is_readonly?: boolean;
  measurements: BackendLatestChannelMeasurement[];
};

export type LatestMeasurementsRequest = {
  groups?: string[];
  devices?: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new Error(
      `API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
    );
  }
  return (await res.json()) as T;
}

// The measurements endpoint is a downsampled ranged query: `start` and `end`
// (RFC3339) are required and it returns roughly 2000 points per channel across
// the range, each point being the newest actual reading in its time bucket.
export type DeviceMeasurementsQuery = {
  start: Date | string;
  end: Date | string;
  channel?: number;
};

// Ranged response wrapper. `measurements` is ordered chronologically within each
// channel; `bucket_seconds` reports the downsample bucket width actually used.
export type DeviceMeasurementsResponse = {
  start: string;
  end: string;
  channel_id?: number;
  bucket_seconds: number;
  measurements: BackendDeviceMeasurement[];
};

export async function getDeviceMeasurements(
  deviceToken: string,
  query: DeviceMeasurementsQuery,
): Promise<BackendDeviceMeasurement[]> {
  const toIso = (v: Date | string) => (typeof v === "string" ? v : v.toISOString());
  const params = new URLSearchParams();
  params.set("start", toIso(query.start));
  params.set("end", toIso(query.end));
  if (query.channel !== undefined) params.set("channel", String(query.channel));
  const path = `/device/${encodeURIComponent(deviceToken)}/measurements?${params.toString()}`;
  const body = await request<DeviceMeasurementsResponse>(path);
  return body.measurements ?? [];
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

export async function updateDeviceName(
  deviceToken: string,
  name: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/device/${encodeURIComponent(deviceToken)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
  );
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ?? JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(
      `API PATCH /device/${deviceToken} failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
    );
  }
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
