import { createSignal } from "solid-js";

const STORAGE_KEY = "regenfass:subscriptions";

export type Subscriptions = {
  groups: string[];
  devices: string[];
  // device_id (UUID) → token, for devices added directly so we can call
  // /device/:token/measurements when the user opens the details panel.
  deviceTokenByID: Record<string, string>;
};

function emptySubs(): Subscriptions {
  return { groups: [], devices: [], deviceTokenByID: {} };
}

function readStored(): Subscriptions {
  if (typeof localStorage === "undefined") return emptySubs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySubs();
    const parsed = JSON.parse(raw) as Partial<Subscriptions>;
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups.filter((t) => typeof t === "string") : [],
      devices: Array.isArray(parsed.devices) ? parsed.devices.filter((t) => typeof t === "string") : [],
      deviceTokenByID:
        parsed.deviceTokenByID && typeof parsed.deviceTokenByID === "object"
          ? Object.fromEntries(
              Object.entries(parsed.deviceTokenByID).filter(
                ([k, v]) => typeof k === "string" && typeof v === "string",
              ),
            )
          : {},
    };
  } catch {
    return emptySubs();
  }
}

function writeStored(v: Subscriptions) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

const [subscriptions, setSubscriptionsInternal] = createSignal<Subscriptions>(readStored());

function update(updater: (prev: Subscriptions) => Subscriptions) {
  const next = updater(subscriptions());
  setSubscriptionsInternal(next);
  writeStored(next);
}

export function useSubscriptions() {
  return subscriptions;
}

export function addDeviceToken(token: string, deviceID?: string) {
  const trimmed = token.trim();
  if (!trimmed) return;
  update((prev) => {
    const devices = prev.devices.includes(trimmed) ? prev.devices : [...prev.devices, trimmed];
    const deviceTokenByID = deviceID
      ? { ...prev.deviceTokenByID, [deviceID]: trimmed }
      : prev.deviceTokenByID;
    return { ...prev, devices, deviceTokenByID };
  });
}

export function addGroupToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed) return;
  update((prev) => (prev.groups.includes(trimmed) ? prev : { ...prev, groups: [...prev.groups, trimmed] }));
}

export function removeDeviceToken(token: string) {
  update((prev) => {
    const deviceTokenByID = Object.fromEntries(
      Object.entries(prev.deviceTokenByID).filter(([, t]) => t !== token),
    );
    return { ...prev, devices: prev.devices.filter((t) => t !== token), deviceTokenByID };
  });
}

export function removeGroupToken(token: string) {
  update((prev) => ({ ...prev, groups: prev.groups.filter((t) => t !== token) }));
}
