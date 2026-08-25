import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import SensorGraph from "@/components/molecules/SensorGraph";
import {
  historyPresetMs,
  periodLabel,
  periodToWindow,
  deviceToSensor,
  reduceMeasurementsToReadings,
  SensorType,
} from "@/libs/sensors";
import type { BackendDeviceMeasurement, BackendLatestDevice } from "@/libs/api";
import type { HistoryPeriod } from "@/libs/sensors";

// ApexCharts needs a real layout engine. Stub it so the test can assert that no
// chart is constructed at all, which is the guarantee that matters here.
const chartCalls: unknown[] = [];
vi.mock("solid-apexcharts", () => ({
  SolidApexCharts: (props: unknown) => {
    chartCalls.push(props);
    return <div data-testid="chart" />;
  },
}));

// Captured from dashboard.regenfass.eu/api/ingester on 2026-08-25 for device
// token DU0NBGM7H1X4TRRB ("Solved Isogon"). This device has exactly two
// measurements on record, both from 2026-07-14 — six weeks before the capture.
// It is the case that made the dashboard draw invented curves: `/overview`
// returns these unbounded, while the 7-day ranged query returns nothing.
const CAPTURED_AT = Date.parse("2026-08-25T19:01:40Z");
const WINDOW_START = CAPTURED_AT - historyPresetMs("week");

const OVERVIEW_DEVICE: BackendLatestDevice = {
  device_id: "1eb08677-14a7-41c7-bb51-07da2b04c3aa",
  name: "Solved Isogon",
  latitude: 51.3376529,
  longitude: 12.3751267,
  is_readonly: true,
  measurements: [
    {
      received_at: "2026-07-14T21:42:23.134108Z",
      channel_id: 3,
      channel_name: "Unmapped",
      measurement_type: 1,
      value: 4.1492,
    },
    {
      received_at: "2026-07-14T21:42:23.134108Z",
      channel_id: 4,
      channel_name: "Unmapped",
      measurement_type: 2,
      value: -1,
    },
  ],
};

// What GET /device/:token/measurements?start=<now-7d> actually returned: nothing.
const RANGED_7D: BackendDeviceMeasurement[] = [];

// The same rows the ranged endpoint returns for a 60-day window, i.e. the only
// two readings this device has ever produced.
const RANGED_60D: BackendDeviceMeasurement[] = OVERVIEW_DEVICE.measurements.map(
  (m) => ({ ...m }),
);

describe("device with no readings in the graph window", () => {
  it("yields no in-window readings from the 7-day ranged fetch", () => {
    expect(reduceMeasurementsToReadings(RANGED_7D, WINDOW_START)).toEqual([]);
  });

  it("discards the six-week-old readings even from a wider fetch", () => {
    // The clip is what stops month-old points reaching the graph, whatever
    // range the request happened to cover.
    expect(reduceMeasurementsToReadings(RANGED_60D, WINDOW_START)).toEqual([]);
  });

  it("still exposes the stale values via /overview, so the panel can label them", () => {
    // The slot editor needs to know channels 3 and 4 are taken; the graph gets
    // no history and no timestamp, so it renders the empty state and marks the
    // headline as old rather than drawing a fabricated curve.
    const at = Date.parse("2026-07-14T21:42:23.134108Z");
    const sensor = deviceToSensor(OVERVIEW_DEVICE);
    expect(sensor.readings).toEqual([
      { type: SensorType.Float, value: 4.1492, channel: 3, latestAt: at },
      {
        type: SensorType.Pressure,
        value: -1,
        unit: "hPa",
        channel: 4,
        latestAt: at,
      },
    ]);
    // Well outside the graph window, so the cards render empty and dated.
    expect(at).toBeLessThan(WINDOW_START);
  });

  it("reports the readings as in-window only once the window reaches them", () => {
    // Sanity check that the clip is a real time comparison and not a blanket
    // drop: widen the window past 2026-07-14 and the rows come back.
    const wideStart = Date.parse("2026-07-01T00:00:00Z");
    const out = reduceMeasurementsToReadings(RANGED_60D, wideStart);
    expect(out.map((r) => r.channel)).toEqual([3, 4]);
    expect(out[0].latestAt).toBe(Date.parse("2026-07-14T21:42:23.134108Z"));
  });
});

// Renders the graph cards exactly as Dashboard's fallback path builds them for
// this device: channels from /overview, but no history and no timestamp.
describe("the panel this device actually renders", () => {
  afterEach(() => {
    cleanup();
    chartCalls.length = 0;
  });

  it("shows two labelled empty cards and draws no chart", () => {
    const window = { start: WINDOW_START, end: CAPTURED_AT };
    const readings = deviceToSensor(OVERVIEW_DEVICE).readings.map((r) => ({
      ...r,
      history: [] as { t: number; value: number }[],
    }));

    render(() => (
      <>
        {readings.map((r) => (
          <SensorGraph
            reading={r}
            history={r.history}
            latestAt={r.latestAt}
            window={window}
            periodLabel="the last 7 days"
          />
        ))}
      </>
    ));

    expect(screen.getAllByText("No data in the last 7 days")).toHaveLength(2);
    expect(screen.queryAllByTestId("chart")).toHaveLength(0);
    expect(chartCalls).toHaveLength(0);

    // Values are still shown, but dimmed and stamped with their real age
    // rather than presented as the device's current state.
    expect(screen.getByText("4.1492 · 1 mo ago")).toHaveClass("opacity-50");
    expect(screen.getByText("-1 hPa · 1 mo ago")).toHaveClass("opacity-50");
  });
});

// Captured from the same device for start=2026-07-01, end=2026-07-31. The
// finer bucket at this span reveals three readings per channel that the
// "Last year" preset collapses into one, which is the point of the custom range.
const CUSTOM_JULY: BackendDeviceMeasurement[] = [
  { received_at: "2026-07-14T21:16:03.356637Z", channel_id: 3, channel_name: "Unmapped", measurement_type: 1, value: 4.0877 },
  { received_at: "2026-07-14T21:39:03.101432Z", channel_id: 3, channel_name: "Unmapped", measurement_type: 1, value: 4.2312 },
  { received_at: "2026-07-14T21:42:23.134108Z", channel_id: 3, channel_name: "Unmapped", measurement_type: 1, value: 4.1492 },
  { received_at: "2026-07-14T21:16:03.356637Z", channel_id: 4, channel_name: "Unmapped", measurement_type: 2, value: -1 },
  { received_at: "2026-07-14T21:39:03.101432Z", channel_id: 4, channel_name: "Unmapped", measurement_type: 2, value: -1 },
  { received_at: "2026-07-14T21:42:23.134108Z", channel_id: 4, channel_name: "Unmapped", measurement_type: 2, value: -1 },
];

describe("a custom range that does contain the data", () => {
  const period: HistoryPeriod = {
    kind: "custom",
    start: Date.parse("2026-07-01T00:00:00Z"),
    end: Date.parse("2026-07-31T23:59:00Z"),
  };
  const window = periodToWindow(period);

  it("keeps every reading and marks the headline as in-window", () => {
    const out = reduceMeasurementsToReadings(CUSTOM_JULY, window.start);
    expect(out.map((r) => r.channel)).toEqual([3, 4]);
    const ch3 = out.find((r) => r.channel === 3)!;
    expect(ch3.history?.map((h) => h.value)).toEqual([4.0877, 4.2312, 4.1492]);
    expect(ch3.value).toBe(4.1492);
    expect(ch3.latestAt).toBeGreaterThanOrEqual(window.start);
    expect(ch3.latestAt).toBeLessThanOrEqual(window.end);
  });

  it("plots the points instead of showing the empty state", () => {
    const [ch3] = reduceMeasurementsToReadings(CUSTOM_JULY, window.start);
    render(() => (
      <SensorGraph
        reading={ch3}
        history={ch3.history}
        latestAt={ch3.latestAt}
        window={window}
        periodLabel={periodLabel(period)}
      />
    ));
    expect(screen.queryByText(/No data in/)).not.toBeInTheDocument();
    expect(screen.getByTestId("chart")).toBeInTheDocument();
    // In-window, so the headline carries no age suffix.
    expect(screen.getByText("4.1492")).toBeInTheDocument();
  });
});
