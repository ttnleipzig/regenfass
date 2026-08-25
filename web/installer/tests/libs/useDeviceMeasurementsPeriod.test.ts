import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal } from "solid-js";
import type { HistoryPeriod } from "@/libs/sensors";

// Capture the range each fetch asks for, so the test can assert the selector
// actually redrives the query rather than just relabelling the panel.
const calls: { start: string; end: string; channel?: number }[] = [];
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
      return [];
    },
  ),
  getLatestMeasurements: vi.fn(async () => []),
  getOverview: vi.fn(async () => ({ groups: [], devices: [] })),
}));

const { useDeviceMeasurements } = await import("@/libs/sensors");

const DAY = 24 * 60 * 60 * 1000;
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("useDeviceMeasurements period", () => {
  beforeEach(() => {
    calls.length = 0;
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
