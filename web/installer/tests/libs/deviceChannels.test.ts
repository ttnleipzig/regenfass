import { describe, it, expect } from "vitest";
import {
  channelDisplayName,
  deviceToSensor,
  reduceMeasurementsToReadings,
  SensorType,
} from "@/libs/sensors";
import type {
  BackendDeviceMeasurement,
  BackendLatestDevice,
} from "@/libs/api";

function device(
  overrides: Partial<BackendLatestDevice> = {},
): BackendLatestDevice {
  return {
    device_id: "dev-1",
    name: "Barrel",
    measurements: [],
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
          { channel_id: 5, name: "Cistern", measurement_type: SensorType.Distance },
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
    // Ingest creates the row so a measurement can reference it; nothing about
    // the channel has been described.
    const sensor = deviceToSensor(device({ channels: [{ channel_id: 2 }] }));
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
      device({ channels: [{ channel_id: 3, name: "Odd", measurement_type: 99 }] }),
    );
    expect(sensor.channels[0].declaredType).toBeUndefined();
  });

  it("defaults to no channels against a backend that does not send them", () => {
    expect(deviceToSensor(device()).channels).toEqual([]);
  });

  it("carries the channel name onto each latest reading", () => {
    const sensor = deviceToSensor(
      device({
        measurements: [
          {
            received_at: "2026-08-01T00:00:00Z",
            channel_id: 1,
            channel_name: "Cistern",
            measurement_type: SensorType.Distance,
            value: 42,
          },
          {
            received_at: "2026-08-01T00:00:00Z",
            channel_id: 2,
            channel_name: undefined,
            measurement_type: SensorType.Temperature,
            value: 18,
          },
        ],
      }),
    );
    expect(sensor.readings.map((r) => r.channelName)).toEqual([
      "Cistern",
      undefined,
    ]);
  });
});

describe("reduceMeasurementsToReadings channel names", () => {
  function row(channelName?: string): BackendDeviceMeasurement {
    return {
      received_at: "2026-08-01T00:00:00Z",
      channel_id: 1,
      channel_name: channelName,
      measurement_type: SensorType.Distance,
      value: 42,
    };
  }

  it("carries a real channel name through to the reading", () => {
    expect(reduceMeasurementsToReadings([row("Cistern")])[0].channelName).toBe(
      "Cistern",
    );
  });

  it("leaves an undescribed channel nameless so the graph falls back to the type", () => {
    expect(reduceMeasurementsToReadings([row()])[0].channelName).toBeUndefined();
  });
});

describe("declared type as a render override", () => {
  function row(
    channel: number,
    measurementType: SensorType,
    value: number,
  ): BackendDeviceMeasurement {
    return {
      received_at: "2026-08-01T00:00:00Z",
      channel_id: channel,
      measurement_type: measurementType,
      value,
    };
  }

  it("renders a reading as the declared type, not the reported one", () => {
    // The point of the field: firmware sends a bare Float and the user says it
    // is a water level, so it renders in cm.
    const [reading] = reduceMeasurementsToReadings(
      [row(3, SensorType.Float, 42)],
      undefined,
      new Map([[3, SensorType.Distance]]),
    );
    expect(reading.type).toBe(SensorType.Distance);
    expect(reading).toMatchObject({ value: 42, unit: "cm" });
  });

  it("falls back to the reported type where nothing is declared", () => {
    const [reading] = reduceMeasurementsToReadings(
      [row(3, SensorType.Temperature, 18)],
      undefined,
      new Map(),
    );
    expect(reading.type).toBe(SensorType.Temperature);
  });

  it("reinterprets a boolean channel under a numeric type", () => {
    // Booleans are stored as 0/1, so a declared type can never hit a value
    // shape it refuses to render — it just plots the steps.
    const [reading] = reduceMeasurementsToReadings(
      [row(1, SensorType.Boolean, 1), row(1, SensorType.Boolean, 0)],
      undefined,
      new Map([[1, SensorType.Float]]),
    );
    expect(reading.type).toBe(SensorType.Float);
    expect(reading.value).toBe(0);
    expect(reading.history?.map((h) => h.value)).toEqual([1, 0]);
  });

  it("reads a stored 0 under a Boolean type as off", () => {
    const [reading] = reduceMeasurementsToReadings([
      row(1, SensorType.Boolean, 0),
    ]);
    expect(reading).toMatchObject({ type: SensorType.Boolean, value: false });
  });

  it("reads a stored 1 under a Boolean type as on", () => {
    const [reading] = reduceMeasurementsToReadings([
      row(1, SensorType.Boolean, 1),
    ]);
    expect(reading).toMatchObject({ type: SensorType.Boolean, value: true });
  });

  it("plots booleans as their stored numbers", () => {
    const [reading] = reduceMeasurementsToReadings([
      row(1, SensorType.Boolean, 1),
      row(1, SensorType.Boolean, 0),
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
