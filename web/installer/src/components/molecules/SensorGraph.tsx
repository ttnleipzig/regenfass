import { Component, createMemo, Show } from "solid-js";
import { SolidApexCharts } from "solid-apexcharts";
import type { ApexOptions } from "apexcharts";
import Settings from "lucide-solid/icons/settings";
import {
  sensorLabel,
  sensorUnit,
  SensorType,
  type HistoryWindow,
  type SensorReading,
} from "../../libs/sensors";

const BG = "#020817";
const ACCENT = "#3b82f6";

type Props = {
  reading: SensorReading;
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
  const isBoolean = () => props.reading.type === SensorType.Boolean;

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

  const series = createMemo(() => [
    { name: sensorLabel(props.reading.type), data: points() },
  ]);

  const valueText = () => {
    const r = props.reading;
    if (r.type === SensorType.Boolean) return r.value ? "On" : "Off";
    const u = sensorUnit(r);
    return u ? `${r.value} ${u}` : `${r.value}`;
  };

  const headline = () => {
    const age = staleAge();
    if (age !== null) return `${valueText()} · ${formatAge(age)}`;
    return valueText();
  };

  return (
    <Show
      when={!isBoolean()}
      fallback={
        <div
          class={`flex items-center justify-between px-3 py-2 rounded-xl ${props.class ?? ""}`}
          style={{ "background-color": BG }}
        >
          <p class="text-xs font-bold">{sensorLabel(props.reading.type)}</p>
          <span
            class="px-2 py-0.5 rounded text-xs font-bold"
            classList={{ "opacity-60": isStale() }}
            style={{
              "background-color":
                (props.reading as { value: boolean }).value && !isStale()
                  ? "#1d4ed8"
                  : "#0b142a",
            }}
          >
            {headline()}
          </span>
        </div>
      }
    >
      <div
        class={`relative rounded-xl overflow-hidden ${props.class ?? "h-[180px]"}`}
        style={{ "background-color": BG }}
      >
        <p class="absolute left-3 top-3 text-xs font-bold z-10">
          {sensorLabel(props.reading.type)}
        </p>
        <p
          class="absolute right-10 top-3 text-xs font-semibold z-10"
          classList={{ "opacity-50": isStale(), "opacity-80": !isStale() }}
        >
          {headline()}
        </p>
        <button
          type="button"
          class="absolute right-3 top-3 z-10 size-5 inline-flex items-center justify-center rounded hover:opacity-70"
          aria-label="Graph settings"
        >
          <Settings class="size-4" />
        </button>
        <div class="absolute inset-0 pt-9">
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
