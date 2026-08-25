import { describe, it, expect } from "vitest";
import {
  DEFAULT_HISTORY_PERIOD,
  HISTORY_PRESETS,
  historyPresetMs,
  isValidPeriod,
  periodLabel,
  periodToWindow,
  type HistoryPeriod,
} from "@/libs/sensors";

const NOW = Date.parse("2026-08-25T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

describe("history presets", () => {
  it("offers day / 7 days / month / year", () => {
    expect(HISTORY_PRESETS.map((p) => p.id)).toEqual([
      "day",
      "week",
      "month",
      "year",
    ]);
  });

  it("spans each preset from now backwards", () => {
    const spans: Record<string, number> = {
      day: DAY,
      week: 7 * DAY,
      month: 30 * DAY,
      year: 365 * DAY,
    };
    for (const preset of HISTORY_PRESETS) {
      const w = periodToWindow({ kind: "preset", preset: preset.id }, NOW);
      expect(w.end).toBe(NOW);
      expect(w.end - w.start).toBe(spans[preset.id]);
      expect(historyPresetMs(preset.id)).toBe(spans[preset.id]);
    }
  });

  it("defaults to the last 7 days", () => {
    expect(DEFAULT_HISTORY_PERIOD).toEqual({ kind: "preset", preset: "week" });
  });

  it("re-anchors a preset to whatever `now` is at resolution time", () => {
    // This is why presets are resolved in the fetcher rather than stored: a
    // "last day" held as fixed bounds would silently go stale.
    const later = NOW + 3 * DAY;
    const a = periodToWindow({ kind: "preset", preset: "day" }, NOW);
    const b = periodToWindow({ kind: "preset", preset: "day" }, later);
    expect(b.start - a.start).toBe(3 * DAY);
  });
});

describe("custom periods", () => {
  const custom = (start: number, end: number): HistoryPeriod => ({
    kind: "custom",
    start,
    end,
  });

  it("uses the given bounds verbatim, ignoring now", () => {
    const w = periodToWindow(custom(1000, 2000), NOW);
    expect(w).toEqual({ start: 1000, end: 2000 });
  });

  it("rejects a blank, backwards or equal range", () => {
    expect(isValidPeriod(custom(NaN, NOW))).toBe(false);
    expect(isValidPeriod(custom(NOW, NaN))).toBe(false);
    expect(isValidPeriod(custom(NOW, NOW - DAY))).toBe(false);
    expect(isValidPeriod(custom(NOW, NOW))).toBe(false);
  });

  it("accepts a forwards range", () => {
    expect(isValidPeriod(custom(NOW - DAY, NOW))).toBe(true);
  });

  it("treats every preset as valid", () => {
    for (const preset of HISTORY_PRESETS) {
      expect(isValidPeriod({ kind: "preset", preset: preset.id })).toBe(true);
    }
  });
});

describe("periodLabel", () => {
  it("reads as prose for presets", () => {
    expect(periodLabel({ kind: "preset", preset: "day" })).toBe("the last day");
    expect(periodLabel({ kind: "preset", preset: "week" })).toBe(
      "the last 7 days",
    );
    expect(periodLabel({ kind: "preset", preset: "month" })).toBe(
      "the last month",
    );
    expect(periodLabel({ kind: "preset", preset: "year" })).toBe(
      "the last year",
    );
  });

  it("shows both endpoints for a custom range", () => {
    const label = periodLabel({
      kind: "custom",
      start: Date.parse("2026-07-01T08:30:00Z"),
      end: Date.parse("2026-07-15T20:45:00Z"),
    });
    expect(label).toContain("–");
    expect(label).toMatch(/Jul/);
  });
});
