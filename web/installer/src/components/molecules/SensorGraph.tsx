import { Component, createEffect, createMemo, createSignal, Show } from "solid-js";
import { SolidApexCharts } from "solid-apexcharts";
import type { ApexOptions } from "apexcharts";
import Trash2 from "lucide-solid/icons/trash-2";
import {
  ALL_SENSOR_TYPES,
  sensorLabel,
  sensorUnit,
  SensorType,
  type HistoryWindow,
  type SensorReading,
} from "../../libs/sensors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TextField, TextFieldRoot } from "../ui/text-input";

const BG = "#020817";
const INACTIVE = "#061846";
const ACCENT = "#3b82f6";

type Props = {
  // Absent for a described channel that has nothing to plot — the device has
  // not reported on it yet. The card still renders so a prepared slot is
  // visible instead of missing from the panel.
  reading?: SensorReading;
  // The name the channel was given. Undefined for a channel nobody has named.
  name?: string;
  // The type the user declared for the channel, as opposed to the type a
  // reading arrived with. Only ever set by an explicit choice.
  declaredType?: SensorType | null;
  // Supplying this turns the header into an editor for the channel's
  // description: the name becomes an input and the type a select.
  onEdit?: (update: { name: string; type: SensorType | null }) => void;
  // Supplying this adds the control that takes the channel off the panel. It
  // deletes nothing: the measurements stay and keep arriving.
  onHide?: () => void;
  // Blocks the controls while a save or delete is in flight.
  busy?: boolean;
  // Points are (epoch ms, value) pairs. Anything outside `window` is dropped
  // rather than drawn, so a graph can never imply data it doesn't have.
  history?: { t: number; value: number }[];
  // Epoch ms of the reading `reading.value` came from. Undefined means unknown,
  // which is treated as stale — the headline is labelled instead of presented
  // as the device's current state.
  latestAt?: number;
  // The time range the graph covers. The x axis is pinned to it so gaps read as
  // gaps and every graph in the panel shares one scale.
  window: HistoryWindow;
  // How the covered range reads in prose ("the last 7 days"), for the empty
  // state. The caller owns this because it owns the period selector.
  periodLabel?: string;
  class?: string;
};

// Coarse age label for a stale headline value ("3 wk ago"). Precision beyond
// this doesn't change what the reader does with it.
export function formatAge(ageMs: number): string {
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} wk ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(days / 365)} y ago`;
}

const SensorGraph: Component<Props> = (props) => {
  const isBoolean = () => props.reading?.type === SensorType.Boolean;

  // What the select shows: only what has actually been declared. It used to fall
  // back to the type the channel reports so it was never blank, but that made
  // clearing a description look like it had failed — the name went blank while
  // the select carried on showing a type nobody had declared any more.
  const declaredType = () => props.declaredType ?? null;

  // The static title is a label rather than an editor, so it may fall back to
  // the type the channel reports — that is genuinely what the card is showing.
  const labelledType = () => props.declaredType ?? props.reading?.type ?? null;

  // A named channel leads with its name and keeps the type as the qualifier, so
  // two channels of the same type stay tellable apart.
  const title = () => {
    const type = labelledType();
    const label = type === null ? undefined : sensorLabel(type);
    if (props.name && label) return `${props.name} · ${label}`;
    return props.name ?? label ?? "Unnamed channel";
  };

  // The name input is a draft so a half-typed name isn't saved on every
  // keystroke; it commits on blur or Enter, like the device rename does.
  const [nameDraft, setNameDraft] = createSignal(props.name ?? "");
  createEffect(() => setNameDraft(props.name ?? ""));

  const commitName = () => {
    const value = nameDraft().trim();
    if (value === (props.name ?? "")) return;
    props.onEdit?.({ name: value, type: declaredType() });
  };

  // Only points inside the window are plotted. This is deliberately enforced in
  // the view as well as at fetch time: the panel's promise is "the last
  // DEVICE_HISTORY_WINDOW_LABEL", so out-of-range points are never drawn.
  const points = createMemo(() => {
    const w = props.window;
    return (props.history ?? [])
      .filter((p) => Number.isFinite(p.t) && p.t >= w.start && p.t <= w.end)
      .map((p) => ({ x: p.t, y: Math.round(p.value * 100) / 100 }));
  });

  const hasData = () => points().length > 0;

  // A value from before the window (or with no timestamp at all) is the newest
  // thing on record, not a current reading.
  const staleAge = () => {
    const at = props.latestAt;
    if (at === undefined) return null;
    if (at >= props.window.start) return null;
    return props.window.end - at;
  };
  const isStale = () => props.latestAt === undefined || staleAge() !== null;

  const options = createMemo<ApexOptions>(() => ({
    chart: {
      type: "area",
      sparkline: { enabled: true },
      background: "transparent",
      animations: { enabled: false },
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.55,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: [ACCENT],
    // Pinning min/max to the fetch window is what makes the graph honest: two
    // readings an hour apart three weeks ago render as a short blip at the left
    // edge instead of spanning the full width.
    xaxis: {
      type: "datetime",
      min: props.window.start,
      max: props.window.end,
    },
    tooltip: {
      theme: "dark",
      x: { format: "dd MMM HH:mm" },
      marker: { show: false },
      y: {
        formatter: (v: number) => {
          const u = sensorUnit(props.reading);
          return u ? `${v} ${u}` : `${v}`;
        },
      },
    },
    grid: { show: false, padding: { left: 0, right: 0, top: 0, bottom: 0 } },
  }));

  const series = createMemo(() => [{ name: title(), data: points() }]);

  const valueText = () => {
    const r = props.reading;
    if (!r) return "";
    if (r.type === SensorType.Boolean) return r.value ? "On" : "Off";
    const u = sensorUnit(r);
    return u ? `${r.value} ${u}` : `${r.value}`;
  };

  const headline = () => {
    const age = staleAge();
    if (age !== null) return `${valueText()} · ${formatAge(age)}`;
    return valueText();
  };

  // The header is shared by both card shapes: a static title when the card is
  // read-only, an editor for the channel's description when it isn't.
  const Header: Component = () => (
    <Show
      when={props.onEdit}
      fallback={<p class="text-xs font-bold truncate">{title()}</p>}
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <TextFieldRoot
          value={nameDraft()}
          onChange={setNameDraft}
          class="min-w-0"
        >
          <TextField
            aria-label="Channel name"
            placeholder="Unnamed channel"
            class="h-6 w-[8.5rem] px-1.5 text-xs font-bold bg-transparent text-white placeholder:text-white/40"
            style={{ "border-color": INACTIVE }}
            disabled={props.busy}
            onBlur={commitName}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
            }}
          />
        </TextFieldRoot>
        <Select<SensorType>
          options={ALL_SENSOR_TYPES}
          value={declaredType()}
          onChange={(type) =>
            props.onEdit?.({ name: nameDraft().trim(), type })
          }
          disabled={props.busy}
          // SelectValue's children only render once something is selected, so
          // the undeclared case has to come from the root's placeholder.
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
            class="h-6 w-[7.5rem] px-1.5 text-xs bg-transparent text-white"
            style={{ "border-color": INACTIVE }}
          >
            <SelectValue<SensorType>>
              {(state) => sensorLabel(state.selectedOption())}
            </SelectValue>
          </SelectTrigger>
          <SelectContent class="bg-[#020817] border-[#061846] text-white" />
        </Select>
      </div>
    </Show>
  );

  const HideButton: Component = () => (
    <Show when={props.onHide}>
      <button
        type="button"
        class="size-5 shrink-0 inline-flex items-center justify-center rounded text-white/70 enabled:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`Hide ${props.name ?? "this channel"}`}
        title="Hide this channel. Its measurements are kept."
        disabled={props.busy}
        onClick={() => props.onHide?.()}
      >
        <Trash2 class="size-4" />
      </button>
    </Show>
  );

  const Headline: Component = () => (
    <Show when={props.reading}>
      <p
        class="text-xs font-semibold shrink-0"
        classList={{ "opacity-50": isStale(), "opacity-80": !isStale() }}
      >
        {headline()}
      </p>
    </Show>
  );

  return (
    <Show
      when={!isBoolean()}
      fallback={
        <div
          class={`flex items-center gap-2 px-3 py-2 rounded-xl ${props.class ?? ""}`}
          style={{ "background-color": BG }}
        >
          <Header />
          <div class="flex-1" />
          <span
            class="px-2 py-0.5 rounded text-xs font-bold shrink-0"
            classList={{ "opacity-60": isStale() }}
            style={{
              "background-color":
                (props.reading as { value: boolean } | undefined)?.value &&
                !isStale()
                  ? "#1d4ed8"
                  : "#0b142a",
            }}
          >
            {headline()}
          </span>
          <HideButton />
        </div>
      }
    >
      <div
        class={`rounded-xl overflow-hidden flex flex-col ${props.class ?? "h-[180px]"}`}
        style={{ "background-color": BG }}
      >
        <div class="flex items-center gap-2 px-3 pt-2 pb-1 shrink-0">
          <Header />
          <div class="flex-1" />
          <Headline />
          <HideButton />
        </div>
        <div class="flex-1 min-h-0">
          <Show
            when={hasData()}
            fallback={
              <div class="h-full flex items-center justify-center text-xs opacity-60 px-3 text-center">
                No data in {props.periodLabel ?? "this period"}
              </div>
            }
          >
            <SolidApexCharts
              type="area"
              options={options()}
              series={series()}
              height="100%"
              width="100%"
            />
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default SensorGraph;
