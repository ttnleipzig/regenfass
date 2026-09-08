import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from "solid-js";
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
  DEFAULT_HISTORY_PERIOD,
  HISTORY_PRESETS,
  isValidPeriod,
  periodLabel,
  periodToWindow,
  sensorLabel,
  SensorType,
  useChannelHistory,
  useDeviceMeasurements,
  useOverview,
  type ChannelMapping,
  type HistoryPeriod,
  type HistoryPreset,
  type Sensor,
} from "../../libs/sensors";
import {
  addDeviceToken,
  addGroupToken,
  removeDeviceToken,
  removeGroupToken,
  useSubscriptions,
} from "../../libs/subscriptions";
import {
  ApiError,
  resolveToken,
  setDeviceChannelHidden,
  updateDeviceName,
  upsertDeviceChannel,
} from "../../libs/api";
import { fromDateTimeInput, toDateTimeInput } from "../../libs/dateTimeInput";
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

// The graph period selector offers the rolling presets plus an explicit range.
type PeriodChoice = HistoryPreset | "custom";
const PERIOD_CHOICES: PeriodChoice[] = [
  ...HISTORY_PRESETS.map((p) => p.id),
  "custom",
];

function periodChoiceLabel(choice: PeriodChoice): string {
  if (choice === "custom") return "Custom";
  return HISTORY_PRESETS.find((p) => p.id === choice)?.label ?? choice;
}


const Dashboard: Component = () => {
  const [activeView, setActiveView] = createSignal<"map" | "list">("map");
  const [devicesExpanded, setDevicesExpanded] = createSignal(true);
  const [collapsedGroups, setCollapsedGroups] = createSignal<Set<string>>(new Set());
  const { overview, refetch: refetchSensors } = useOverview();
  const subscriptions = useSubscriptions();
  const [activeSensorId, setActiveSensorId] = createSignal<string | null>(null);
  const [activeDeviceToken, setActiveDeviceToken] = createSignal<string | null>(null);
  const [slotType, setSlotType] = createSignal<SensorType | null>(null);
  const [slotDescription, setSlotDescription] = createSignal("");
  const [selectedChannel, setSelectedChannel] = createSignal<number | null>(null);
  const [slotError, setSlotError] = createSignal<string | null>(null);
  const [detailsOpen, setDetailsOpen] = createSignal(false);
  const [tokenInput, setTokenInput] = createSignal("");

  const sensors = () => overview()?.all ?? [];

  // Which range the panel's graphs cover. A preset is a rolling lookback; the
  // custom pair is absolute, held as input strings so a half-typed value can
  // exist without being sent to the backend.
  const [periodChoice, setPeriodChoice] = createSignal<PeriodChoice>(
    DEFAULT_HISTORY_PERIOD.kind === "preset"
      ? DEFAULT_HISTORY_PERIOD.preset
      : "week",
  );
  const [customStart, setCustomStart] = createSignal("");
  const [customEnd, setCustomEnd] = createSignal("");

  const period = createMemo<HistoryPeriod>(() => {
    const choice = periodChoice();
    if (choice !== "custom") return { kind: "preset", preset: choice };
    return {
      kind: "custom",
      start: fromDateTimeInput(customStart()),
      end: fromDateTimeInput(customEnd()),
    };
  });
  const periodText = () => periodLabel(period());
  const customRangeInvalid = () =>
    periodChoice() === "custom" && !isValidPeriod(period());

  // Switching to Custom seeds the pickers from the range currently on screen,
  // so the graphs don't blank out waiting for two empty fields to be filled in.
  const handlePeriodChoice = (choice: PeriodChoice) => {
    if (choice === "custom" && periodChoice() !== "custom") {
      const w = periodToWindow(period());
      setCustomStart(toDateTimeInput(w.start));
      setCustomEnd(toDateTimeInput(w.end));
    }
    setPeriodChoice(choice);
  };

  const {
    readings: liveReadings,
    window: historyWindow,
    refetch: refetchLiveReadings,
  } = useDeviceMeasurements(
    () => activeDeviceToken(),
    period,
    () => activeSensor()?.channels ?? [],
  );
  // Readings for the channel the user is about to map, over the same period as
  // the graphs above, fetched on demand when a channel is selected.
  const {
    result: selectedChannelResult,
    reading: selectedChannelReading,
    window: selectedChannelWindow,
    refetch: refetchSelectedChannel,
  } = useChannelHistory(
    () => activeDeviceToken(),
    () => selectedChannel(),
    period,
    () => activeSensor()?.channels ?? [],
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

  // Readings for the open panel. The ranged endpoint (clipped to the graph
  // window) is the source of truth; when it returns nothing for this device we
  // still list the channels from /overview so the slot editor knows which are
  // taken. Those carry no history — there is none in the window — but they keep
  // their `received_at`, so each card can say how old the value actually is
  // instead of presenting it as the device's current state.
  const readingsForActiveSensor = () => {
    const live = liveReadings();
    if (live && live.length > 0) return live;
    const sensor = activeSensor();
    return sensor ? sensor.readings.map((r) => ({ ...r, history: [] })) : [];
  };

  // Channels that already carry a reading (and therefore a type) for the active
  // device.
  const assignedChannels = () => {
    const set = new Set<number>();
    for (const r of readingsForActiveSensor()) {
      if (typeof r.channel === "number") set.add(r.channel);
    }
    return set;
  };

  // Every channel the backend knows about for the open device, indexed for the
  // editor. Includes channels the device has reported on — ingest maps those the
  // first time it sees them — as well as slots described ahead of any data.
  const channelsByID = createMemo(() => {
    const map = new Map<number, ChannelMapping>();
    for (const c of activeSensor()?.channels ?? []) map.set(c.channel, c);
    return map;
  });

  // Channels that are spoken for, either by a reading or by a description. They
  // stay selectable: ingest names a channel "Unmapped" the first time it sees
  // one, so describing a channel that already has data is the common case.
  const usedChannels = createMemo(() => {
    const set = new Set<number>(assignedChannels());
    for (const channel of channelsByID().keys()) set.add(channel);
    return set;
  });

  // A described channel with no reading in the current view: the device hasn't
  // reported on it yet, or not within the chosen period. Undescribed channels
  // are left out — a bare "Unmapped" placeholder card would say nothing.
  const describedEmptyChannels = createMemo(() => {
    const withReadings = assignedChannels();
    return (activeSensor()?.channels ?? [])
      .filter(
        (c) =>
          !c.hidden &&
          !withReadings.has(c.channel) &&
          (c.name !== undefined || c.declaredType !== undefined),
      )
      .sort((a, b) => a.channel - b.channel);
  });

  // Channels taken off the panel. Listed under the grid so hiding one is
  // reversible without hunting for it.
  const hiddenChannels = createMemo(() =>
    (activeSensor()?.channels ?? [])
      .filter((c) => c.hidden)
      .sort((a, b) => a.channel - b.channel),
  );

  // Selecting a channel loads whatever it is already called and typed, so the
  // editor edits the slot rather than silently overwriting it with defaults.
  // Only the declared type is loaded: prefilling the type a channel happens to
  // report would declare it on the next save without the user picking it.
  const selectChannel = (channel: number) => {
    setSelectedChannel(channel);
    setSlotError(null);
    const existing = channelsByID().get(channel);
    setSlotDescription(existing?.name ?? "");
    setSlotType(existing?.declaredType ?? null);
  };

  // Nothing filled in. Saving that is only meaningful for a channel that has a
  // description to clear.
  const slotIsEmpty = () =>
    slotDescription().trim() === "" && slotType() === null;

  // Whether the selected channel has already been described, which is the
  // difference between adding a slot and editing one.
  const slotIsUpdate = () => {
    const channel = selectedChannel();
    if (channel === null) return false;
    const existing = channelsByID().get(channel);
    return existing?.name !== undefined || existing?.declaredType !== undefined;
  };

  // The channel currently being written to, so only that card's controls lock
  // up rather than every card in the panel.
  const [channelBusy, setChannelBusy] = createSignal<number | null>(null);

  // Both the slot editor and each graph card write through here. `write` does
  // the call; everything around it is the token check, the error mapping and
  // the refetches all channel writes need.
  const writeChannel = async (
    channel: number,
    write: (token: string) => Promise<void>,
  ) => {
    const sensor = activeSensor();
    if (!sensor || channelBusy() !== null) return;
    const token = subscriptions().deviceTokenByID[sensor.id];
    if (!token) {
      setSlotError(
        "Add this device by its read-write token to describe its channels.",
      );
      return;
    }
    setSlotError(null);
    setChannelBusy(channel);
    try {
      await write(token);
      // The graphs title themselves from the channel name the measurement
      // endpoints hand back, so all three sources have to be refreshed for a
      // change to show up without reopening the panel.
      refetchSensors();
      refetchLiveReadings();
      refetchSelectedChannel();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setSlotError(
          "This token is read-only — use the RW token to describe channels.",
        );
      } else {
        setSlotError(
          err instanceof Error ? err.message : "Could not save the channel",
        );
      }
    } finally {
      setChannelBusy(null);
    }
  };

  // writeChannel serializes writes, so any one in flight locks the editor.
  const slotBusy = () => channelBusy() !== null;

  const handleChannelEdit = (
    channel: number,
    update: { name: string; type: SensorType | null },
  ) =>
    void writeChannel(channel, (token) =>
      upsertDeviceChannel(token, channel, {
        name: update.name === "" ? null : update.name,
        measurement_type: update.type,
      }),
    );

  const handleChannelHidden = (channel: number, hidden: boolean) =>
    void writeChannel(channel, (token) =>
      setDeviceChannelHidden(token, channel, hidden),
    );

  const handleSaveSlot = () => {
    const channel = selectedChannel();
    if (channel === null) return;
    handleChannelEdit(channel, {
      name: slotDescription().trim(),
      type: slotType(),
    });
  };

  // Clear the pending slot whenever the user opens a different device so a stale
  // selection isn't left highlighted or a stale description left in the field.
  createEffect(() => {
    activeSensorId();
    setSelectedChannel(null);
    setSlotDescription("");
    setSlotError(null);
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

          {/* Period selector — governs every graph in the panel */}
          <div class="flex flex-col gap-2 px-1">
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-60 shrink-0">Period</span>
              <Select<PeriodChoice>
                options={PERIOD_CHOICES}
                value={periodChoice()}
                onChange={(v) => v !== null && handlePeriodChoice(v)}
                itemComponent={(itemProps) => (
                  <SelectItem
                    item={itemProps.item}
                    class="text-white focus:bg-[#061846] focus:text-white"
                  >
                    {periodChoiceLabel(itemProps.item.rawValue)}
                  </SelectItem>
                )}
              >
                <SelectTrigger
                  aria-label="Graph period"
                  class="w-[160px] bg-transparent text-white"
                  style={{ "border-color": INACTIVE }}
                >
                  <SelectValue<PeriodChoice>>
                    {(state) => periodChoiceLabel(state.selectedOption())}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent class="bg-[#020817] border-[#061846] text-white" />
              </Select>
            </div>

            <Show when={periodChoice() === "custom"}>
              <div class="flex items-center gap-2 flex-wrap">
                <input
                  type="datetime-local"
                  aria-label="Period start"
                  class="h-9 rounded-md border bg-transparent px-2 text-sm text-white"
                  style={{ "border-color": INACTIVE, "color-scheme": "dark" }}
                  value={customStart()}
                  onChange={(e) => setCustomStart(e.currentTarget.value)}
                />
                <span class="text-xs opacity-60">to</span>
                <input
                  type="datetime-local"
                  aria-label="Period end"
                  class="h-9 rounded-md border bg-transparent px-2 text-sm text-white"
                  style={{ "border-color": INACTIVE, "color-scheme": "dark" }}
                  value={customEnd()}
                  onChange={(e) => setCustomEnd(e.currentTarget.value)}
                />
              </div>
              <Show when={customRangeInvalid()}>
                <p class="text-xs text-red-400">
                  Pick a start and an end, with the start first. Showing the
                  previous range until then.
                </p>
              </Show>
            </Show>
          </div>

          {/* Graphs */}
          <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
            <For each={readingsForActiveSensor()}>
              {(reading) => (
                <SensorGraph
                  reading={reading}
                  name={reading.channelName}
                  declaredType={
                    reading.channel === undefined
                      ? null
                      : channelsByID().get(reading.channel)?.declaredType ?? null
                  }
                  onEdit={
                    reading.channel === undefined
                      ? undefined
                      : (update) => handleChannelEdit(reading.channel!, update)
                  }
                  onHide={
                    reading.channel === undefined
                      ? undefined
                      : () => handleChannelHidden(reading.channel!, true)
                  }
                  busy={channelBusy() === reading.channel}
                  history={reading.history}
                  latestAt={reading.latestAt}
                  window={historyWindow()}
                  periodLabel={periodText()}
                />
              )}
            </For>

            {/* A slot that has been described but has nothing to plot. It still
                gets a card so a channel prepared ahead of the sensor is visible
                instead of silently missing from the panel. */}
            <For each={describedEmptyChannels()}>
              {(channel) => (
                <SensorGraph
                  name={channel.name}
                  declaredType={channel.declaredType ?? null}
                  onEdit={(update) => handleChannelEdit(channel.channel, update)}
                  onHide={() => handleChannelHidden(channel.channel, true)}
                  busy={channelBusy() === channel.channel}
                  window={historyWindow()}
                  periodLabel={periodText()}
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
                    onChange={(v) => {
                      setSlotDescription(v);
                      if (slotError()) setSlotError(null);
                    }}
                    class="w-full"
                  >
                    <TextField
                      placeholder="Description"
                      class="text-white placeholder:text-white/50"
                      style={{ "border-color": INACTIVE }}
                      disabled={slotBusy()}
                    />
                  </TextFieldRoot>

                  <div class="grid grid-cols-8 gap-1 w-full">
                    <For each={CHANNELS}>
                      {(channel) => {
                        const isUsed = () => usedChannels().has(channel);
                        const isSelected = () => selectedChannel() === channel;
                        const bg = () =>
                          isSelected() ? SELECTED : isUsed() ? DISABLED : INACTIVE;
                        const fg = () =>
                          isSelected()
                            ? "#000000"
                            : isUsed()
                            ? "rgba(255,255,255,0.35)"
                            : "#ffffff";
                        return (
                          <button
                            type="button"
                            disabled={slotBusy()}
                            aria-pressed={isSelected()}
                            aria-label={
                              isUsed()
                                ? `Edit channel ${channel}`
                                : `Describe channel ${channel}`
                            }
                            class="size-6 rounded flex items-center justify-center text-sm font-semibold transition-opacity enabled:hover:opacity-80 disabled:cursor-not-allowed"
                            style={{
                              "background-color": bg(),
                              color: fg(),
                            }}
                            onClick={() => selectChannel(channel)}
                          >
                            {channel}
                          </button>
                        );
                      }}
                    </For>
                  </div>

                  <Show when={hiddenChannels().length > 0}>
                    <div class="flex items-center gap-1 flex-wrap text-[10px]">
                      <span class="opacity-60">Hidden:</span>
                      <For each={hiddenChannels()}>
                        {(channel) => (
                          <button
                            type="button"
                            class="px-1.5 py-0.5 rounded font-semibold enabled:hover:opacity-80 disabled:opacity-50"
                            style={{ "background-color": DISABLED }}
                            disabled={slotBusy()}
                            aria-label={`Restore ${channel.name ?? `channel ${channel.channel}`}`}
                            onClick={() =>
                              handleChannelHidden(channel.channel, false)
                            }
                          >
                            {channel.name ?? `Channel ${channel.channel}`}
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>

                  <Select<SensorType>
                    options={ALL_SENSOR_TYPES}
                    value={slotType()}
                    onChange={setSlotType}
                    disabled={slotBusy()}
                    placeholder="No sensor type"
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
                <div class="flex items-center gap-2 w-full justify-end">
                  <Show when={slotError()}>
                    <p class="text-[10px] text-red-400 flex-1 min-w-0 text-left">
                      {slotError()}
                    </p>
                  </Show>
                  <button
                    type="button"
                    class="px-3 py-2 rounded text-xs font-bold text-white shrink-0 enabled:hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "background-color": INACTIVE }}
                    disabled={
                      selectedChannel() === null ||
                      slotBusy() ||
                      (slotIsEmpty() && !slotIsUpdate())
                    }
                    onClick={handleSaveSlot}
                  >
                    {slotBusy() ? "Saving…" : slotIsUpdate() ? "Save" : "Add"}
                  </button>
                </div>
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
                    when={!selectedChannelResult.loading}
                    fallback={
                      <div class="h-full flex items-center justify-center text-xs opacity-60">
                        Loading…
                      </div>
                    }
                  >
                    <Show
                      when={selectedChannelReading()}
                      fallback={
                        <div class="h-full flex items-center justify-center text-xs opacity-60 px-3 text-center">
                          No data in {periodText()}
                        </div>
                      }
                    >
                      {(reading) => (
                        <SensorGraph
                          reading={reading()}
                          name={reading().channelName}
                          history={reading().history}
                          latestAt={reading().latestAt}
                          window={selectedChannelWindow()}
                          periodLabel={periodText()}
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
