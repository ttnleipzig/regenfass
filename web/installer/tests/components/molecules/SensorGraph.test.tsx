import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import SensorGraph from "@/components/molecules/SensorGraph";
import { SensorType, type HistoryWindow } from "@/libs/sensors";

// ApexCharts needs a real layout engine; the graph's contract here is *what it
// is handed*, so stub the chart and assert on the series/options instead.
const chartCalls: { options: Record<string, any>; series: any[] }[] = [];
vi.mock("solid-apexcharts", () => ({
  SolidApexCharts: (props: { options: Record<string, any>; series: any[] }) => {
    chartCalls.push({ options: props.options, series: props.series });
    return <div data-testid="chart" />;
  },
}));

const END = Date.parse("2026-08-25T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const WINDOW: HistoryWindow = { start: END - 7 * DAY, end: END };

const distance = { type: SensorType.Distance, value: 42, unit: "cm" } as const;

describe("SensorGraph", () => {
  afterEach(() => {
    cleanup();
    chartCalls.length = 0;
  });

  it("renders no chart and says so when there is no history", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[]}
        window={WINDOW}
        periodLabel="the last 7 days"
      />
    ));
    expect(screen.getByText("No data in the last 7 days")).toBeInTheDocument();
    expect(screen.queryByTestId("chart")).not.toBeInTheDocument();
    // The old behaviour invented a 24-point random walk here.
    expect(chartCalls).toHaveLength(0);
  });

  it("does not plot points that fall outside the window", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[
          { t: END - 40 * DAY, value: 10 },
          { t: END - 30 * DAY, value: 11 },
        ]}
        window={WINDOW}
        periodLabel="the last 7 days"
      />
    ));
    expect(screen.getByText("No data in the last 7 days")).toBeInTheDocument();
    expect(chartCalls).toHaveLength(0);
  });

  it("plots only the in-window points and pins the axis to the window", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[
          { t: END - 30 * DAY, value: 10 },
          { t: END - 2 * DAY, value: 20 },
          { t: END - DAY, value: 21 },
        ]}
        latestAt={END - DAY}
        window={WINDOW}
      />
    ));
    expect(chartCalls).toHaveLength(1);
    const { options, series } = chartCalls[0];
    expect(series[0].data).toEqual([
      { x: END - 2 * DAY, y: 20 },
      { x: END - DAY, y: 21 },
    ]);
    expect(options.xaxis).toMatchObject({
      type: "datetime",
      min: WINDOW.start,
      max: WINDOW.end,
    });
  });

  it("labels a headline value from before the window with its age", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[]}
        latestAt={END - 30 * DAY}
        window={WINDOW}
      />
    ));
    expect(screen.getByText("42 cm · 4 wk ago")).toBeInTheDocument();
  });

  it("shows a fresh headline value unadorned", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[{ t: END - 3600_000, value: 42 }]}
        latestAt={END - 3600_000}
        window={WINDOW}
      />
    ));
    expect(screen.getByText("42 cm")).toBeInTheDocument();
  });

  it("dims a stale boolean reading instead of showing it as the current state", () => {
    render(() => (
      <SensorGraph
        reading={{ type: SensorType.Boolean, value: true }}
        history={[]}
        latestAt={END - 30 * DAY}
        window={WINDOW}
      />
    ));
    const badge = screen.getByText(/^On ·/);
    expect(badge).toHaveClass("opacity-60");
  });
});
