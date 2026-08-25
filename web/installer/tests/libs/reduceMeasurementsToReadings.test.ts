import { describe, it, expect } from "vitest";
import { reduceMeasurementsToReadings } from "@/libs/sensors";
import type { BackendDeviceMeasurement } from "@/libs/api";
import { SensorType } from "@/libs/sensors";

const DISTANCE = SensorType.Distance; // measurement_type 4

function row(
  channel: number,
  receivedAt: string,
  value: number | boolean,
): BackendDeviceMeasurement {
  return {
    received_at: receivedAt,
    channel_id: channel,
    channel_name: `ch${channel}`,
    measurement_type: DISTANCE,
    value,
  };
}

describe("reduceMeasurementsToReadings", () => {
  it("keeps the newest reading as headline given ascending-in-time rows", () => {
    // The ranged endpoint returns rows chronologically ascending within a
    // channel, so the last row is the newest.
    const rows = [
      row(1, "2026-06-01T00:00:00Z", 10),
      row(1, "2026-06-01T00:01:00Z", 11),
      row(1, "2026-06-01T00:02:00Z", 12),
    ];
    const [reading] = reduceMeasurementsToReadings(rows);
    expect(reading.value).toBe(12);
  });

  it("builds history in chronological order", () => {
    const rows = [
      row(1, "2026-06-01T00:00:00Z", 10),
      row(1, "2026-06-01T00:01:00Z", 11),
      row(1, "2026-06-01T00:02:00Z", 12),
    ];
    const [reading] = reduceMeasurementsToReadings(rows);
    expect(reading.history?.map((h) => h.value)).toEqual([10, 11, 12]);
    const times = reading.history?.map((h) => h.t) ?? [];
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("groups by channel and reports the newest per channel", () => {
    const rows = [
      row(1, "2026-06-01T00:00:00Z", 10),
      row(1, "2026-06-01T00:01:00Z", 11),
      row(2, "2026-06-01T00:00:30Z", 20),
      row(2, "2026-06-01T00:01:30Z", 21),
    ];
    const out = reduceMeasurementsToReadings(rows);
    const byChannel = new Map(out.map((r) => [r.channel, r.value]));
    expect(byChannel.get(1)).toBe(11);
    expect(byChannel.get(2)).toBe(21);
  });

  it("is robust to unordered input (headline is still the newest)", () => {
    const rows = [
      row(1, "2026-06-01T00:02:00Z", 12),
      row(1, "2026-06-01T00:00:00Z", 10),
      row(1, "2026-06-01T00:01:00Z", 11),
    ];
    const [reading] = reduceMeasurementsToReadings(rows);
    expect(reading.value).toBe(12);
    expect(reading.history?.map((h) => h.value)).toEqual([10, 11, 12]);
  });

  it("reports latestAt as the timestamp of the headline reading", () => {
    const rows = [
      row(1, "2026-06-01T00:00:00Z", 10),
      row(1, "2026-06-01T00:02:00Z", 12),
    ];
    const [reading] = reduceMeasurementsToReadings(rows);
    expect(reading.latestAt).toBe(Date.parse("2026-06-01T00:02:00Z"));
  });

  describe("window clipping via `since`", () => {
    const since = Date.parse("2026-06-01T00:00:00Z");

    it("drops points older than the window", () => {
      const rows = [
        row(1, "2026-05-01T00:00:00Z", 1),
        row(1, "2026-05-20T00:00:00Z", 2),
        row(1, "2026-06-02T00:00:00Z", 30),
        row(1, "2026-06-03T00:00:00Z", 31),
      ];
      const [reading] = reduceMeasurementsToReadings(rows, since);
      expect(reading.history?.map((h) => h.value)).toEqual([30, 31]);
      expect(reading.value).toBe(31);
    });

    it("omits a channel whose only readings predate the window", () => {
      // This is the case that used to surface month-old values as current:
      // nothing in range means nothing to report, not a stale headline.
      const rows = [
        row(1, "2026-05-01T00:00:00Z", 1),
        row(1, "2026-05-20T00:00:00Z", 2),
      ];
      expect(reduceMeasurementsToReadings(rows, since)).toEqual([]);
    });

    it("keeps in-window channels while dropping out-of-window ones", () => {
      const rows = [
        row(1, "2026-05-01T00:00:00Z", 1),
        row(2, "2026-06-02T00:00:00Z", 20),
      ];
      const out = reduceMeasurementsToReadings(rows, since);
      expect(out.map((r) => r.channel)).toEqual([2]);
    });

    it("includes a point exactly on the window boundary", () => {
      const rows = [row(1, "2026-06-01T00:00:00Z", 5)];
      const [reading] = reduceMeasurementsToReadings(rows, since);
      expect(reading.history?.map((h) => h.value)).toEqual([5]);
    });

    it("skips rows with an unparseable timestamp", () => {
      const rows = [row(1, "not-a-date", 5), row(1, "2026-06-02T00:00:00Z", 6)];
      const [reading] = reduceMeasurementsToReadings(rows, since);
      expect(reading.history?.map((h) => h.value)).toEqual([6]);
      expect(reading.value).toBe(6);
    });
  });
});
