import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal } from "solid-js";
import type { HistoryPeriod } from "@/libs/sensors";
import type { BackendRangedDeviceChannel } from "@/libs/api";

// Capture the range each fetch asks for, so the test can assert the selector
// actually redrives the query rather than just relabelling the panel.
const calls: { start: string; end: string; channel?: number }[] = [];
// What the next fetch answers with; the ranged endpoint returns channels.
let response: BackendRangedDeviceChannel[] = [];
vi.mock("@/libs/api", () => ({
  getDeviceMeasurements: vi.fn(
    async (
      _token: string,
      q: { start: Date; end: Date; channel?: number },
    ) => {
      calls.push({
        start: q.start.toISOString(),
        end: q.end.toISOString(),
        channel: q.channel,
      });
      return response;
    },
  ),
  getLatestMeasurements: vi.fn(async () => []),
  getOverview: vi.fn(async () => ({ groups: [], devices: [] })),
}));

const { useDeviceMeasurements, SensorType } = await import("@/libs/sensors");

const DAY = 24 * 60 * 60 * 1000;
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("useDeviceMeasurements period", () => {
  beforeEach(() => {
    calls.length = 0;
    response = [];
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.parse("2026-08-25T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("refetches with the new span when the period changes", async () => {
    await createRoot(async (dispose) => {
      const [period, setPeriod] = createSignal<HistoryPeriod>({
        kind: "preset",
        preset: "week",
      });
      const { window } = useDeviceMeasurements(() => "tok", period);
      window(); // subscribe so the resource runs
      await flush();

      expect(calls).toHaveLength(1);
      expect(Date.parse(calls[0].end) - Date.parse(calls[0].start)).toBe(7 * DAY);

      setPeriod({ kind: "preset", preset: "year" });
      await flush();

      expect(calls).toHaveLength(2);
      expect(Date.parse(calls[1].end) - Date.parse(calls[1].start)).toBe(
        365 * DAY,
      );
      dispose();
    });
  });

  it("sends a custom range verbatim", async () => {
    await createRoot(async (dispose) => {
      const start = Date.parse("2026-07-01T00:00:00Z");
      const end = Date.parse("2026-07-10T00:00:00Z");
      const [period] = createSignal<HistoryPeriod>({ kind: "custom", start, end });
      const { window } = useDeviceMeasurements(() => "tok", period);
      window();
      await flush();

      expect(calls).toHaveLength(1);
      expect(Date.parse(calls[0].start)).toBe(start);
      expect(Date.parse(calls[0].end)).toBe(end);
      dispose();
    });
  });

  it("does not fetch a half-filled or backwards custom range", async () => {
    await createRoot(async (dispose) => {
      const [period, setPeriod] = createSignal<HistoryPeriod>({
        kind: "custom",
        start: NaN,
        end: Date.parse("2026-07-10T00:00:00Z"),
      });
      const { window } = useDeviceMeasurements(() => "tok", period);
      window();
      await flush();
      expect(calls).toHaveLength(0);

      setPeriod({
        kind: "custom",
        start: Date.parse("2026-07-10T00:00:00Z"),
        end: Date.parse("2026-07-01T00:00:00Z"),
      });
      await flush();
      expect(calls).toHaveLength(0);

      // Completing the range releases the fetch.
      setPeriod({
        kind: "custom",
        start: Date.parse("2026-07-01T00:00:00Z"),
        end: Date.parse("2026-07-10T00:00:00Z"),
      });
      await flush();
      expect(calls).toHaveLength(1);
      dispose();
    });
  });

  it("reports a window matching the selected period before the fetch lands", () => {
    createRoot((dispose) => {
      const [period] = createSignal<HistoryPeriod>({
        kind: "preset",
        preset: "day",
      });
      const { window } = useDeviceMeasurements(() => "tok", period);
      const w = window();
      expect(w.end - w.start).toBe(DAY);
      dispose();
    });
  });
});

describe("useDeviceMeasurements channels", () => {
  beforeEach(() => {
    calls.length = 0;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.parse("2026-08-25T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("lists a freshly described channel even though it has no data yet", async () => {
    // The scenario that motivated the response shape: a slot was just named,
    // so the mapping exists but no measurement references it. The channel
    // still has to reach the panel, which it can only do if the endpoint lists
    // channels independently of their samples.
    response = [
      {
        channel_id: 5,
        name: "Cistern",
        measurement_type: SensorType.Distance,
        hidden: false,
        measurements: [],
      },
      {
        channel_id: 2,
        reported_type: SensorType.Temperature,
        hidden: false,
        measurements: [{ received_at: "2026-08-25T11:00:00Z", value: 18 }],
      },
    ];
    await createRoot(async (dispose) => {
      const { channels, readings } = useDeviceMeasurements(() => "tok");
      channels();
      await flush();

      expect(channels()).toEqual([
        {
          channel: 5,
          name: "Cistern",
          declaredType: SensorType.Distance,
          reportedType: undefined,
          hidden: false,
        },
        {
          channel: 2,
          name: undefined,
          declaredType: undefined,
          reportedType: SensorType.Temperature,
          hidden: false,
        },
      ]);
      // Only the channel with data in the window yields a reading.
      expect(readings().map((r) => r.channel)).toEqual([2]);
      dispose();
    });
  });
});
