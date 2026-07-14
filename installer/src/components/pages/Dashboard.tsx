import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Plus from "lucide-solid/icons/plus";
import X from "lucide-solid/icons/x";
import Pencil from "lucide-solid/icons/pencil";
import MapIcon from "lucide-solid/icons/map";
import List from "lucide-solid/icons/list";
import Lock from "lucide-solid/icons/lock";
import LeipzigMap from "./LeipzigMap";
import {
  ALL_SENSOR_TYPES,
  sensorLabel,
  SensorType,
  useChannelHistory,
  useDeviceMeasurements,
  useOverview,
  type Sensor,
} from "../../libs/sensors";
import {
  addDeviceToken,
  addGroupToken,
  removeDeviceToken,
  removeGroupToken,
  useSubscriptions,
} from "../../libs/subscriptions";
import { resolveToken, updateDeviceName } from "../../libs/api";
import SensorGraph from "../molecules/SensorGraph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TextField, TextFieldRoot } from "../ui/text-input";

// Color tokens from the Figma design — kept local to this dashboard because
// the rest of the app uses the shadcn theme system and this view is intentionally
// dark-themed regardless of the user's color mode preference.
const BG = "#020817";
const INACTIVE = "#061846";
const DISABLED = "#0b142a";

// The device exposes 16 channels (0–15). Each channel can have a sensor type
// mapped to it; the slot editor lets the user pick which channel to map.
const CHANNELS = Array.from({ length: 16 }, (_, i) => i);
const SELECTED = "#6bb2fa";

const Dashboard: Component = () => {
  const [activeView, setActiveView] = createSignal<"map" | "list">("map");
  const [devicesExpanded, setDevicesExpanded] = createSignal(true);
  const [collapsedGroups, setCollapsedGroups] = createSignal<Set<string>>(new Set());
  const { overview, refetch: refetchSensors } = useOverview();
  const subscriptions = useSubscriptions();
  const [activeSensorId, setActiveSensorId] = createSignal<string | null>(null);
  const [activeDeviceToken, setActiveDeviceToken] = createSignal<string | null>(null);
  const [slotType, setSlotType] = createSignal<SensorType>(SensorType.Distance);
  const [slotDescription, setSlotDescription] = createSignal("");
  const [selectedChannel, setSelectedChannel] = createSignal<number | null>(null);
  const [detailsOpen, setDetailsOpen] = createSignal(false);
  const [tokenInput, setTokenInput] = createSignal("");

  const sensors = () => overview()?.all ?? [];
  const { readings: liveReadings } = useDeviceMeasurements(() => activeDeviceToken());
  // Last 7 days of readings for the channel the user is about to map, fetched
  // on demand when a channel is selected in the slot editor.
  const { reading: selectedChannelReading } = useChannelHistory(
    () => activeDeviceToken(),
    () => selectedChannel(),
  );

  const toggleGroupCollapsed = (token: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  };

  // Subscription tokens whose group/device the backend didn't return (deleted or
  // no longer valid). We still surface them as removable rows so a stale token
  // can't get stuck in the list with no way to clear it.
  const unresolvedGroups = () => {
    const resolved = new Set(overview()?.groups.map((g) => g.token));
    return subscriptions().groups.filter((t) => !resolved.has(t));
  };
  const unresolvedDevices = () => {
    const byID = subscriptions().deviceTokenByID;
    const represented = new Set(
      (overview()?.all ?? []).map((s) => byID[s.id]).filter(Boolean),
    );
    return subscriptions().devices.filter((t) => !represented.has(t));
  };

  const activeSensor = () => sensors().find((s) => s.id === activeSensorId());
  const pins = () =>
    sensors().map((s) => ({
      id: s.id,
      lngLat: s.lngLat,
      active: s.id === activeSensorId(),
    }));

  // Subscriptions keep a deviceId → token map for directly-added device tokens;
  // when the user opens a device's detail panel we use that token to fetch its
  // history. Devices that arrived only via a group subscription have no token
  // here, so the panel falls back to the headline value with no graph history.
  const openSensorDetails = (id: string) => {
    setActiveSensorId(id);
    setActiveDeviceToken(subscriptions().deviceTokenByID[id] ?? null);
    setDetailsOpen(true);
  };

  const [tokenError, setTokenError] = createSignal<string | null>(null);
  const [tokenBusy, setTokenBusy] = createSignal(false);

  const [nameDraft, setNameDraft] = createSignal("");
  const [nameBusy, setNameBusy] = createSignal(false);
  const [nameError, setNameError] = createSignal<string | null>(null);
  let nameInputRef: HTMLInputElement | undefined;

  const focusNameInput = () => {
    nameInputRef?.focus();
    nameInputRef?.select();
  };

  // Reset the rename draft whenever the user opens a different device panel so
  // the input always reflects the current device's name.
  createEffect(() => {
    const sensor = activeSensor();
    if (sensor) {
      setNameDraft(sensor.name);
      setNameError(null);
    }
  });

  const handleRename = async (e?: Event) => {
    e?.preventDefault();
    const sensor = activeSensor();
    if (!sensor || nameBusy()) return;
    const token = subscriptions().deviceTokenByID[sensor.id];
    if (!token) {
      setNameError("Add this device by its read-write token to edit its name.");
      return;
    }
    const value = nameDraft().trim();
    if (value === sensor.name) return;
    setNameError(null);
    setNameBusy(true);
    try {
      await updateDeviceName(token, value);
      refetchSensors();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save name";
      if (msg.includes("403")) {
        setNameError("This token is read-only — use the RW token to rename.");
      } else {
        setNameError(msg);
      }
    } finally {
      setNameBusy(false);
    }
  };

  const handleAddToken = async (e?: Event) => {
    e?.preventDefault();
    const value = tokenInput().trim();
    if (!value || tokenBusy()) return;
    setTokenError(null);
    setTokenBusy(true);
    try {
      const resolved = await resolveToken(value);
      if (!resolved) {
        setTokenError("Token not recognized");
        return;
      }
      if (resolved.kind === "device") {
        addDeviceToken(value, resolved.info.device_id);
      } else {
        addGroupToken(value);
      }
      setTokenInput("");
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Could not validate token");
    } finally {
      setTokenBusy(false);
    }
  };

  const readingsForActiveSensor = () => {
    const live = liveReadings();
    if (live && live.length > 0) return live;
    const sensor = activeSensor();
    return sensor ? sensor.readings.map((r) => ({ ...r, history: undefined })) : [];
  };

  // Channels that already carry a reading (and therefore a type) for the active
  // device. These are shown grayed out and can't be re-selected in the editor.
  const assignedChannels = () => {
    const set = new Set<number>();
    for (const r of readingsForActiveSensor()) {
      if (typeof r.channel === "number") set.add(r.channel);
    }
    return set;
  };

  // Clear the pending channel selection whenever the user opens a different
  // device so a stale slot isn't left highlighted.
  createEffect(() => {
    activeSensorId();
    setSelectedChannel(null);
  });

  // A single device entry in the right-hand list. Group members render indented
  // and without a remove control (the group owns the subscription); standalone
  // devices get a remove control when we hold their token.
  const DeviceRow: Component<{ sensor: Sensor; indent?: boolean; onRemove?: () => void }> = (
    props,
  ) => {
    const isActive = () => props.sensor.id === activeSensorId();
    return (
      <div
        class="flex items-center gap-2 pr-1"
        style={{ "background-color": isActive() ? INACTIVE : BG }}
      >
        <button
          type="button"
          class="flex items-center gap-2 py-2 pr-2 flex-1 min-w-0 text-left hover:opacity-90"
          classList={{ "pl-9": props.indent, "pl-6": !props.indent }}
          onClick={() => openSensorDetails(props.sensor.id)}
        >
          <span
            class="size-3 rounded-full inline-block ml-1.5"
            style={{ "background-color": isActive() ? "#6bb2fa" : "#ffffff" }}
          />
          <span class="text-sm font-bold truncate">{props.sensor.name}</span>
          <Show when={props.sensor.isReadonly}>
            <Lock class="size-3.5 shrink-0 opacity-60" aria-label="Read-only" />
          </Show>
        </button>
        <Show when={props.onRemove}>
          <button
            type="button"
            class="size-5 mr-1 inline-flex items-center justify-center rounded hover:opacity-70"
            aria-label={`Remove ${props.sensor.name}`}
            onClick={() => props.onRemove?.()}
          >
            <X class="size-4" />
          </button>
        </Show>
      </div>
    );
  };

  // Fallback row for a subscription token the backend didn't resolve, so it can
  // still be removed from the list.
  const UnresolvedRow: Component<{ label: string; token: string; onRemove: () => void }> = (
    props,
  ) => (
    <div class="flex items-center gap-2 p-2 w-full" style={{ "background-color": BG }}>
      <span
        class="text-[10px] font-bold uppercase px-1 rounded"
        style={{ "background-color": INACTIVE }}
      >
        {props.label}
      </span>
      <span
        class="flex-1 min-w-0 text-xs font-mono truncate opacity-50"
        title="Not found — it may have been deleted"
      >
        {props.token}
      </span>
      <button
        type="button"
        class="size-5 inline-flex items-center justify-center rounded hover:opacity-70"
        aria-label={`Remove ${props.label.toLowerCase()} subscription ${props.token}`}
        onClick={props.onRemove}
      >
        <X class="size-4" />
      </button>
    </div>
  );

  return (
    <div
      class="min-h-screen flex flex-col text-white"
      style={{ "background-color": BG }}
    >
      {/* Navbar */}
      <header
        class="flex h-[72px] items-center justify-between px-3 shrink-0"
        style={{ "background-color": BG }}
      >
        <div class="flex items-center">
          <h1 class="text-2xl font-bold leading-none">Regenfass</h1>
        </div>
        <A
          href="/install"
          class="px-3 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ "background-color": INACTIVE }}
        >
          Install
        </A>
      </header>

      {/* Map area */}
      <div class="relative flex-1 overflow-hidden">
        <Show when={activeView() === "map"}>
          <div class="absolute inset-0">
            <LeipzigMap pins={pins()} onPinClick={openSensorDetails} />
          </div>
        </Show>

        {/* Sensor details panel (left) */}
        <Show when={detailsOpen() && activeSensor()}>
          {(sensor) => (
        <aside
          class="absolute left-3 top-3 bottom-3 w-[560px] max-w-[calc(100vw-24px)] rounded-xl overflow-hidden flex flex-col gap-3 p-3 backdrop-blur-md border-2"
          style={{
            "background-color": "rgba(2,8,23,0.9)",
            "border-color": BG,
          }}
        >
          <div class="flex items-center justify-between gap-2">
            <form
              class="flex-1 min-w-0 flex items-center gap-2"
              onSubmit={handleRename}
            >
              <TextFieldRoot
                value={nameDraft()}
                onChange={(v) => {
                  setNameDraft(v);
                  if (nameError()) setNameError(null);
                }}
                class="flex-1 min-w-0"
              >
                <TextField
                  ref={nameInputRef}
                  aria-label="Device name"
                  placeholder="Device name"
                  class="text-2xl font-bold bg-transparent border-0 px-0 h-auto text-white placeholder:text-white/50"
                  disabled={nameBusy()}
                  onBlur={handleRename}
                />
              </TextFieldRoot>
              <button
                type="button"
                class="size-6 inline-flex items-center justify-center rounded text-white/70 hover:text-white hover:opacity-90"
                aria-label="Edit device name"
                onClick={focusNameInput}
              >
                <Pencil class="size-4" />
              </button>
              <Show when={nameBusy()}>
                <span class="text-xs opacity-70">Saving…</span>
              </Show>
            </form>
            <button
              type="button"
              class="size-6 inline-flex items-center justify-center rounded hover:opacity-70"
              aria-label="Close details"
              onClick={() => setDetailsOpen(false)}
            >
              <X class="size-5" />
            </button>
          </div>
          <Show when={nameError()}>
            <p class="text-xs text-red-400 -mt-1">{nameError()}</p>
          </Show>
          <div class="h-0.5 w-full" style={{ "background-color": INACTIVE }} />

          {/* Graphs */}
          <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
            <For each={readingsForActiveSensor()}>
              {(reading) => (
                <SensorGraph
                  reading={reading}
                  seed={`${sensor().id}:${reading.type}`}
                  history={reading.history}
                />
              )}
            </For>

            {/* Slot editor + preview */}
            <div
              class="rounded-xl overflow-hidden h-[240px] flex gap-3 p-3 border border-dashed"
              style={{
                "background-color": BG,
                "border-color": INACTIVE,
              }}
            >
              {/* Inputs */}
              <div class="flex-1 min-w-0 flex flex-col items-end justify-between h-full overflow-hidden">
                <div class="flex-1 min-h-0 flex flex-col gap-1.5 w-full overflow-hidden">
                  <TextFieldRoot
                    value={slotDescription()}
                    onChange={setSlotDescription}
                    class="w-full"
                  >
                    <TextField
                      placeholder="Description"
                      class="text-white placeholder:text-white/50"
                      style={{ "border-color": INACTIVE }}
                    />
                  </TextFieldRoot>

                  <div class="grid grid-cols-8 gap-1 w-full">
                    <For each={CHANNELS}>
                      {(channel) => {
                        const isAssigned = () => assignedChannels().has(channel);
                        const isSelected = () => selectedChannel() === channel;
                        const bg = () =>
                          isSelected()
                            ? SELECTED
                            : isAssigned()
                            ? DISABLED
                            : INACTIVE;
                        const fg = () =>
                          isSelected()
                            ? "#000000"
                            : isAssigned()
                            ? "rgba(255,255,255,0.35)"
                            : "#ffffff";
                        return (
                          <button
                            type="button"
                            disabled={isAssigned()}
                            aria-pressed={isSelected()}
                            aria-label={
                              isAssigned()
                                ? `Channel ${channel} (type already assigned)`
                                : `Map type to channel ${channel}`
                            }
                            class="size-6 rounded flex items-center justify-center text-sm font-semibold transition-opacity enabled:hover:opacity-80 disabled:cursor-not-allowed"
                            style={{
                              "background-color": bg(),
                              color: fg(),
                            }}
                            onClick={() => setSelectedChannel(channel)}
                          >
                            {channel}
                          </button>
                        );
                      }}
                    </For>
                  </div>

                  <Select<SensorType>
                    options={ALL_SENSOR_TYPES}
                    value={slotType()}
                    onChange={(v) => v !== null && setSlotType(v)}
                    itemComponent={(itemProps) => (
                      <SelectItem
                        item={itemProps.item}
                        class="text-white focus:bg-[#061846] focus:text-white"
                      >
                        {sensorLabel(itemProps.item.rawValue)}
                      </SelectItem>
                    )}
                  >
                    <SelectTrigger
                      aria-label="Sensor type"
                      class="w-full bg-transparent text-white"
                      style={{ "border-color": INACTIVE }}
                    >
                      <SelectValue<SensorType>>
                        {(state) => sensorLabel(state.selectedOption())}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent class="bg-[#020817] border-[#061846] text-white" />
                  </Select>
                </div>
                <button
                  type="button"
                  class="px-3 py-2 rounded text-xs font-bold text-white hover:opacity-80"
                  style={{ "background-color": INACTIVE }}
                >
                  Add
                </button>
              </div>

              {/* Preview — prompts to pick a channel until one is selected;
                  then the channel's last 7 days, or a "no data yet" message
                  when the channel has no readings in that window. */}
              <div class="flex-1 min-w-0">
                <Show
                  when={selectedChannel() !== null}
                  fallback={
                    <div class="h-full flex items-center justify-center text-center text-xs opacity-60">
                      Select a channel to preview its data
                    </div>
                  }
                >
                  <Show
                    when={!selectedChannelReading.loading}
                    fallback={
                      <div class="h-full flex items-center justify-center text-xs opacity-60">
                        Loading…
                      </div>
                    }
                  >
                    <Show
                      when={selectedChannelReading()}
                      fallback={
                        <div class="h-full flex items-center justify-center text-xs opacity-60">
                          No data yet
                        </div>
                      }
                    >
                      {(reading) => (
                        <SensorGraph
                          reading={reading()}
                          seed={`channel:${activeSensorId()}:${selectedChannel()}`}
                          history={reading().history}
                          class="h-full"
                        />
                      )}
                    </Show>
                  </Show>
                </Show>
              </div>
            </div>
          </div>
        </aside>
          )}
        </Show>

        {/* Devices (right) */}
        <aside
          class="absolute top-3 right-3 w-[240px] rounded-xl overflow-hidden backdrop-blur-sm flex flex-col gap-0.5"
          style={{ "background-color": "rgba(2,8,23,0.9)" }}
        >
          <button
            type="button"
            class="flex items-center gap-2 p-2 w-full text-left hover:opacity-90"
            style={{ "background-color": INACTIVE }}
            onClick={() => setDevicesExpanded(!devicesExpanded())}
          >
            <ChevronDown
              class="size-6 transition-transform"
              classList={{ "-rotate-90": !devicesExpanded() }}
            />
            <span class="text-sm font-bold">
              Devices ({sensors().length})
            </span>
          </button>

          <Show when={devicesExpanded()}>
            <Show
              when={
                (overview()?.groups.length ?? 0) > 0 ||
                (overview()?.devices.length ?? 0) > 0 ||
                unresolvedGroups().length > 0 ||
                unresolvedDevices().length > 0
              }
              fallback={
                <div
                  class="px-3 py-2 text-xs opacity-70"
                  style={{ "background-color": BG }}
                >
                  Add a device or group token below to see live readings.
                </div>
              }
            >
              {/* Groups, each with its member devices nested underneath */}
              <For each={overview()?.groups ?? []}>
                {(group) => {
                  const collapsed = () => collapsedGroups().has(group.token);
                  return (
                    <>
                      <div
                        class="flex items-center gap-1 px-2 py-2"
                        style={{ "background-color": BG }}
                      >
                        <button
                          type="button"
                          class="size-5 inline-flex items-center justify-center rounded hover:opacity-70"
                          aria-label={
                            collapsed()
                              ? `Expand group ${group.name}`
                              : `Collapse group ${group.name}`
                          }
                          aria-expanded={!collapsed()}
                          onClick={() => toggleGroupCollapsed(group.token)}
                        >
                          <ChevronDown
                            class="size-4 transition-transform"
                            classList={{ "-rotate-90": collapsed() }}
                          />
                        </button>
                        <span class="flex-1 min-w-0 text-sm font-bold truncate">
                          {group.name}
                        </span>
                        <Show when={group.isReadonly}>
                          <Lock class="size-3.5 shrink-0 opacity-60" aria-label="Read-only" />
                        </Show>
                        <button
                          type="button"
                          class="size-5 inline-flex items-center justify-center rounded hover:opacity-70"
                          aria-label={`Remove group ${group.name}`}
                          onClick={() => removeGroupToken(group.token)}
                        >
                          <X class="size-4" />
                        </button>
                      </div>
                      <Show when={!collapsed()}>
                        <Show
                          when={group.devices.length > 0}
                          fallback={
                            <div
                              class="pl-9 pr-2 py-1.5 text-xs opacity-60"
                              style={{ "background-color": BG }}
                            >
                              No devices yet
                            </div>
                          }
                        >
                          <For each={group.devices}>
                            {(s) => <DeviceRow sensor={s} indent />}
                          </For>
                        </Show>
                      </Show>
                    </>
                  );
                }}
              </For>

              {/* Standalone devices (subscribed directly, not via a group) */}
              <For each={overview()?.devices ?? []}>
                {(s) => {
                  const token = () => subscriptions().deviceTokenByID[s.id];
                  return (
                    <DeviceRow
                      sensor={s}
                      onRemove={token() ? () => removeDeviceToken(token()!) : undefined}
                    />
                  );
                }}
              </For>

              {/* Stale subscription tokens the backend no longer resolves */}
              <For each={unresolvedGroups()}>
                {(token) => (
                  <UnresolvedRow
                    label="Group"
                    token={token}
                    onRemove={() => removeGroupToken(token)}
                  />
                )}
              </For>
              <For each={unresolvedDevices()}>
                {(token) => (
                  <UnresolvedRow
                    label="Device"
                    token={token}
                    onRemove={() => removeDeviceToken(token)}
                  />
                )}
              </For>
            </Show>
          </Show>

          <form
            class="flex flex-col gap-1 p-2 w-full"
            style={{ "background-color": BG }}
            onSubmit={handleAddToken}
          >
            <div class="flex items-center gap-2 w-full">
              <TextFieldRoot
                value={tokenInput()}
                onChange={(v) => {
                  setTokenInput(v);
                  if (tokenError()) setTokenError(null);
                }}
                class="flex-1 min-w-0"
              >
                <TextField
                  placeholder="Add device / group..."
                  class="text-white placeholder:text-white/50 text-sm"
                  style={{ "border-color": INACTIVE }}
                  disabled={tokenBusy()}
                />
              </TextFieldRoot>
              <button
                type="submit"
                class="size-6 inline-flex items-center justify-center rounded hover:opacity-70 disabled:opacity-40"
                aria-label="Add device or group token"
                disabled={tokenBusy() || !tokenInput().trim()}
              >
                <Plus class="size-5" />
              </button>
            </div>
            <Show when={tokenError()}>
              <p class="text-xs text-red-400">{tokenError()}</p>
            </Show>
          </form>
        </aside>

        {/* View toggle (bottom right) */}
        <div
          class="absolute bottom-3 right-3 rounded-lg backdrop-blur-sm flex gap-2 p-1"
          style={{ "background-color": "rgba(2,8,23,0.9)" }}
        >
          <button
            type="button"
            class="flex items-center gap-1 px-1.5 py-1 rounded text-sm font-bold transition-colors"
            style={{
              "background-color":
                activeView() === "map" ? INACTIVE : "transparent",
            }}
            onClick={() => setActiveView("map")}
          >
            <MapIcon class="size-6" />
            <span>Map</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1 px-1.5 py-1 rounded text-sm font-bold transition-colors"
            style={{
              "background-color":
                activeView() === "list" ? INACTIVE : "transparent",
            }}
            onClick={() => setActiveView("list")}
          >
            <List class="size-6" />
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
