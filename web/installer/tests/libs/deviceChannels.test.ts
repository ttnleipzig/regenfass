import { describe, it, expect } from "vitest";
import {
  channelDisplayName,
  deviceToSensor,
  readingsFromChannels,
  SensorType,
} from "@/libs/sensors";
import type {
  BackendLatestDevice,
  BackendMeasurementSample,
  BackendRangedDeviceChannel,
} from "@/libs/api";

function device(
  overrides: Partial<BackendLatestDevice> = {},
): BackendLatestDevice {
  return {
    device_id: "dev-1",
    name: "Barrel",
    channels: [],
    ...overrides,
  };
}

describe("channelDisplayName", () => {
  it("treats an absent, empty or whitespace-only name as no name", () => {
    // The backend omits the name of an undescribed channel; the rest fold into
    // the same case so the UI has one thing to fall back from.
    expect(channelDisplayName(undefined)).toBeUndefined();
    expect(channelDisplayName(null)).toBeUndefined();
    expect(channelDisplayName("")).toBeUndefined();
    expect(channelDisplayName("   ")).toBeUndefined();
  });

  it("trims a real name", () => {
    expect(channelDisplayName("  Cistern ")).toBe("Cistern");
  });
});

describe("deviceToSensor channels", () => {
  it("maps described channels including ones with no measurements", () => {
    const sensor = deviceToSensor(
      device({
        channels: [
          {
            channel_id: 5,
            name: "Cistern",
            measurement_type: SensorType.Distance,
            hidden: false,
          },
        ],
      }),
    );
    expect(sensor.channels).toEqual([
      {
        channel: 5,
        name: "Cistern",
        declaredType: SensorType.Distance,
        hidden: false,
      },
    ]);
    // The point of a described channel: it reaches the dashboard before the
    // device has ever reported on it.
    expect(sensor.readings).toEqual([]);
  });

  it("leaves an undescribed channel with neither a name nor a type", () => {
    // The channel is listed because it has reported; nothing about it has been
    // described.
    const sensor = deviceToSensor(
      device({ channels: [{ channel_id: 2, hidden: false }] }),
    );
    expect(sensor.channels[0]).toEqual({
      channel: 2,
      name: undefined,
      declaredType: undefined,
      hidden: false,
    });
  });

  it("ignores a measurement type the frontend does not know", () => {
    // An unrecognized value would otherwise select an empty label in the editor.
    const sensor = deviceToSensor(
      device({
        channels: [
          { channel_id: 3, name: "Odd", measurement_type: 99, hidden: false },
        ],
      }),
    );
    expect(sensor.channels[0].declaredType).toBeUndefined();
  });

  it("defaults to no channels when the backend sends none", () => {
    expect(deviceToSensor(device()).channels).toEqual([]);
  });

  it("turns each channel's latest sample into a reading carrying the channel's name", () => {
    const sensor = deviceToSensor(
      device({
        channels: [
          {
            channel_id: 1,
            name: "Cistern",
            reported_type: SensorType.Distance,
            hidden: false,
            latest: { received_at: "2026-08-01T00:00:00Z", value: 42 },
          },
          {
            channel_id: 2,
            reported_type: SensorType.Temperature,
            hidden: false,
            latest: { received_at: "2026-08-01T00:00:00Z", value: 18 },
          },
          // Described, never reported: a channel, but no reading.
          { channel_id: 3, name: "Spare", hidden: false },
        ],
      }),
    );
    expect(sensor.readings).toEqual([
      {
        type: SensorType.Distance,
        value: 42,
        unit: "cm",
        channel: 1,
        channelName: "Cistern",
        latestAt: Date.parse("2026-08-01T00:00:00Z"),
      },
      {
        type: SensorType.Temperature,
        value: 18,
        unit: "°C",
        channel: 2,
        channelName: undefined,
        latestAt: Date.parse("2026-08-01T00:00:00Z"),
      },
    ]);
    expect(sensor.channels.map((c) => c.channel)).toEqual([1, 2, 3]);
  });

  it("renders a latest reading as the channel's declared type", () => {
    const sensor = deviceToSensor(
      device({
        channels: [
          {
            channel_id: 3,
            measurement_type: SensorType.Distance,
            reported_type: SensorType.Float,
            hidden: false,
            latest: { received_at: "2026-08-01T00:00:00Z", value: 42 },
          },
        ],
      }),
    );
    expect(sensor.readings[0]).toMatchObject({
      type: SensorType.Distance,
      value: 42,
      unit: "cm",
    });
  });
});

describe("readingsFromChannels channel names", () => {
  function channel(channelName?: string): BackendRangedDeviceChannel {
    return {
      channel_id: 1,
      name: channelName,
      reported_type: SensorType.Distance,
      hidden: false,
      measurements: [{ received_at: "2026-08-01T00:00:00Z", value: 42 }],
    };
  }

  it("carries a real channel name through to the reading", () => {
    expect(readingsFromChannels([channel("Cistern")])[0].channelName).toBe(
      "Cistern",
    );
  });

  it("leaves an undescribed channel nameless so the graph falls back to the type", () => {
    expect(readingsFromChannels([channel()])[0].channelName).toBeUndefined();
  });
});

describe("declared type as a render override", () => {
  function sample(value: number, at = "2026-08-01T00:00:00Z"): BackendMeasurementSample {
    return { received_at: at, value };
  }

  function channel(
    declared: SensorType | undefined,
    reported: SensorType,
    measurements: BackendMeasurementSample[],
  ): BackendRangedDeviceChannel {
    return {
      channel_id: 3,
      measurement_type: declared,
      reported_type: reported,
      hidden: false,
      measurements,
    };
  }

  it("renders a reading as the declared type, not the reported one", () => {
    // The point of the field: firmware sends a bare Float and the user says it
    // is a water level, so it renders in cm.
    const [reading] = readingsFromChannels([
      channel(SensorType.Distance, SensorType.Float, [sample(42)]),
    ]);
    expect(reading.type).toBe(SensorType.Distance);
    expect(reading).toMatchObject({ value: 42, unit: "cm" });
  });

  it("falls back to the reported type where nothing is declared", () => {
    const [reading] = readingsFromChannels([
      channel(undefined, SensorType.Temperature, [sample(18)]),
    ]);
    expect(reading.type).toBe(SensorType.Temperature);
  });

  it("reinterprets a boolean channel under a numeric type", () => {
    // Booleans are stored as 0/1, so a declared type can never hit a value
    // shape it refuses to render — it just plots the steps.
    const [reading] = readingsFromChannels([
      channel(SensorType.Float, SensorType.Boolean, [
        sample(1, "2026-08-01T00:00:00Z"),
        sample(0, "2026-08-01T00:01:00Z"),
      ]),
    ]);
    expect(reading.type).toBe(SensorType.Float);
    expect(reading.value).toBe(0);
    expect(reading.history?.map((h) => h.value)).toEqual([1, 0]);
  });

  it("reads a stored 0 under a Boolean type as off", () => {
    const [reading] = readingsFromChannels([
      channel(undefined, SensorType.Boolean, [sample(0)]),
    ]);
    expect(reading).toMatchObject({ type: SensorType.Boolean, value: false });
  });

  it("reads a stored 1 under a Boolean type as on", () => {
    const [reading] = readingsFromChannels([
      channel(undefined, SensorType.Boolean, [sample(1)]),
    ]);
    expect(reading).toMatchObject({ type: SensorType.Boolean, value: true });
  });

  it("plots booleans as their stored numbers", () => {
    const [reading] = readingsFromChannels([
      channel(undefined, SensorType.Boolean, [
        sample(1, "2026-08-01T00:00:00Z"),
        sample(0, "2026-08-01T00:01:00Z"),
      ]),
    ]);
    expect(reading.history?.map((h) => h.value)).toEqual([1, 0]);
  });
});

describe("hidden channels", () => {
  it("carries the hidden flag through so it can be restored", () => {
    const sensor = deviceToSensor(
      device({
        channels: [
          { channel_id: 4, name: "Noisy", hidden: true },
          { channel_id: 5, name: "Cistern", hidden: false },
        ],
      }),
    );
    expect(sensor.channels.map((c) => [c.channel, c.hidden])).toEqual([
      [4, true],
      [5, false],
    ]);
  });
});
