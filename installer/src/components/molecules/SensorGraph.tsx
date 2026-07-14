import { Component, createMemo, Show } from "solid-js";
import { SolidApexCharts } from "solid-apexcharts";
import type { ApexOptions } from "apexcharts";
import Settings from "lucide-solid/icons/settings";
import {
  sensorHistory,
  sensorLabel,
  sensorUnit,
  SensorType,
  type SensorReading,
} from "../../libs/sensors";

const BG = "#020817";
const ACCENT = "#3b82f6";

type Props = {
  reading: SensorReading;
  seed: string;
  history?: { t: number; value: number }[];
  class?: string;
};

const SensorGraph: Component<Props> = (props) => {
  const isBoolean = () => props.reading.type === SensorType.Boolean;

  const data = createMemo(() => {
    if (props.reading.type === SensorType.Boolean) return [];
    const real = props.history;
    if (real && real.length > 0) {
      return real.map((p) => Math.round(p.value * 100) / 100);
    }
    return sensorHistory(props.seed, props.reading.value, 24);
  });

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
    tooltip: {
      theme: "dark",
      x: { show: false },
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
    { name: sensorLabel(props.reading.type), data: data() },
  ]);

  const latestText = () => {
    const r = props.reading;
    if (r.type === SensorType.Boolean) return r.value ? "On" : "Off";
    const u = sensorUnit(r);
    return u ? `${r.value} ${u}` : `${r.value}`;
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
            style={{
              "background-color":
                (props.reading as { value: boolean }).value
                  ? "#1d4ed8"
                  : "#0b142a",
            }}
          >
            {latestText()}
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
        <p class="absolute right-10 top-3 text-xs font-semibold z-10 opacity-80">
          {latestText()}
        </p>
        <button
          type="button"
          class="absolute right-3 top-3 z-10 size-5 inline-flex items-center justify-center rounded hover:opacity-70"
          aria-label="Graph settings"
        >
          <Settings class="size-4" />
        </button>
        <div class="absolute inset-0 pt-9">
          <SolidApexCharts
            type="area"
            options={options()}
            series={series()}
            height="100%"
            width="100%"
          />
        </div>
      </div>
    </Show>
  );
};

export default SensorGraph;
