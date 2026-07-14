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
});
