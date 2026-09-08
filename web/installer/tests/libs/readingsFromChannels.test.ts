import { describe, it, expect } from "vitest";
import { readingsFromChannels } from "@/libs/sensors";
import type {
  BackendMeasurementSample,
  BackendRangedDeviceChannel,
} from "@/libs/api";
import { SensorType } from "@/libs/sensors";

const DISTANCE = SensorType.Distance; // measurement_type 4

function sample(receivedAt: string, value: number): BackendMeasurementSample {
  return { received_at: receivedAt, value };
}

function channel(
  id: number,
  measurements: BackendRangedDeviceChannel["measurements"],
): BackendRangedDeviceChannel {
  return {
    channel_id: id,
    name: `ch${id}`,
    reported_type: DISTANCE,
    hidden: false,
    measurements,
  };
}

describe("readingsFromChannels", () => {
  it("keeps the newest sample as headline given ascending-in-time samples", () => {
    // The ranged endpoint returns samples chronologically ascending within a
    // channel, so the last one is the newest.
    const [reading] = readingsFromChannels([
      channel(1, [
        sample("2026-06-01T00:00:00Z", 10),
        sample("2026-06-01T00:01:00Z", 11),
        sample("2026-06-01T00:02:00Z", 12),
      ]),
    ]);
    expect(reading.value).toBe(12);
  });

  it("builds history in chronological order", () => {
    const [reading] = readingsFromChannels([
      channel(1, [
        sample("2026-06-01T00:00:00Z", 10),
        sample("2026-06-01T00:01:00Z", 11),
        sample("2026-06-01T00:02:00Z", 12),
      ]),
    ]);
    expect(reading.history?.map((h) => h.value)).toEqual([10, 11, 12]);
    const times = reading.history?.map((h) => h.t) ?? [];
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("reports one reading per channel with data", () => {
    const out = readingsFromChannels([
      channel(1, [
        sample("2026-06-01T00:00:00Z", 10),
        sample("2026-06-01T00:01:00Z", 11),
      ]),
      channel(2, [
        sample("2026-06-01T00:00:30Z", 20),
        sample("2026-06-01T00:01:30Z", 21),
      ]),
    ]);
    const byChannel = new Map(out.map((r) => [r.channel, r.value]));
    expect(byChannel.get(1)).toBe(11);
    expect(byChannel.get(2)).toBe(21);
  });

  it("leaves out a channel with no samples", () => {
    // A described channel that has never reported is listed by the backend so
    // the panel can show it — but it has nothing to read, so it is the channel
    // list's job to surface it, not this reducer's.
    const out = readingsFromChannels([
      channel(1, []),
      channel(2, [sample("2026-06-01T00:00:00Z", 20)]),
    ]);
    expect(out.map((r) => r.channel)).toEqual([2]);
  });

  it("is robust to unordered samples (headline is still the newest)", () => {
    const [reading] = readingsFromChannels([
      channel(1, [
        sample("2026-06-01T00:02:00Z", 12),
        sample("2026-06-01T00:00:00Z", 10),
        sample("2026-06-01T00:01:00Z", 11),
      ]),
    ]);
    expect(reading.value).toBe(12);
    expect(reading.history?.map((h) => h.value)).toEqual([10, 11, 12]);
  });

  it("reports latestAt as the timestamp of the headline sample", () => {
    const [reading] = readingsFromChannels([
      channel(1, [
        sample("2026-06-01T00:00:00Z", 10),
        sample("2026-06-01T00:02:00Z", 12),
      ]),
    ]);
    expect(reading.latestAt).toBe(Date.parse("2026-06-01T00:02:00Z"));
  });

  it("carries the channel's name and number onto the reading", () => {
    const [reading] = readingsFromChannels([
      channel(7, [sample("2026-06-01T00:00:00Z", 1)]),
    ]);
    expect(reading.channel).toBe(7);
    expect(reading.channelName).toBe("ch7");
  });

  describe("window clipping via `since`", () => {
    const since = Date.parse("2026-06-01T00:00:00Z");

    it("drops points older than the window", () => {
      const [reading] = readingsFromChannels(
        [
          channel(1, [
            sample("2026-05-01T00:00:00Z", 1),
            sample("2026-05-20T00:00:00Z", 2),
            sample("2026-06-02T00:00:00Z", 30),
            sample("2026-06-03T00:00:00Z", 31),
          ]),
        ],
        since,
      );
      expect(reading.history?.map((h) => h.value)).toEqual([30, 31]);
      expect(reading.value).toBe(31);
    });

    it("omits a channel whose only readings predate the window", () => {
      // This is the case that used to surface month-old values as current:
      // nothing in range means nothing to report, not a stale headline.
      const out = readingsFromChannels(
        [
          channel(1, [
            sample("2026-05-01T00:00:00Z", 1),
            sample("2026-05-20T00:00:00Z", 2),
          ]),
        ],
        since,
      );
      expect(out).toEqual([]);
    });

    it("keeps in-window channels while dropping out-of-window ones", () => {
      const out = readingsFromChannels(
        [
          channel(1, [sample("2026-05-01T00:00:00Z", 1)]),
          channel(2, [sample("2026-06-02T00:00:00Z", 20)]),
        ],
        since,
      );
      expect(out.map((r) => r.channel)).toEqual([2]);
    });

    it("includes a point exactly on the window boundary", () => {
      const [reading] = readingsFromChannels(
        [channel(1, [sample("2026-06-01T00:00:00Z", 5)])],
        since,
      );
      expect(reading.history?.map((h) => h.value)).toEqual([5]);
    });

    it("skips samples with an unparseable timestamp", () => {
      const [reading] = readingsFromChannels(
        [
          channel(1, [
            sample("not-a-date", 5),
            sample("2026-06-02T00:00:00Z", 6),
          ]),
        ],
        since,
      );
      expect(reading.history?.map((h) => h.value)).toEqual([6]);
      expect(reading.value).toBe(6);
    });
  });
});
