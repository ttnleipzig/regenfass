import { describe, it, expect } from "vitest";
import { fromDateTimeInput, toDateTimeInput } from "@/libs/dateTimeInput";

describe("datetime-local conversions", () => {
  it("round-trips a timestamp to the minute", () => {
    const t = new Date(2026, 6, 14, 21, 42, 0, 0).getTime();
    expect(fromDateTimeInput(toDateTimeInput(t))).toBe(t);
  });

  it("formats in local time, not UTC", () => {
    // Built from local components, so the rendered string must match them
    // regardless of the runner's zone.
    const d = new Date(2026, 0, 5, 8, 7);
    expect(toDateTimeInput(d.getTime())).toBe("2026-01-05T08:07");
  });

  it("zero-pads every field", () => {
    const d = new Date(2026, 8, 9, 4, 5);
    expect(toDateTimeInput(d.getTime())).toBe("2026-09-09T04:05");
  });

  it("drops seconds so the value fits the input's default step", () => {
    const withSeconds = new Date(2026, 6, 14, 21, 42, 37, 500).getTime();
    expect(toDateTimeInput(withSeconds)).toBe("2026-07-14T21:42");
  });

  it("reads a picker value as local time", () => {
    expect(fromDateTimeInput("2026-07-14T21:42")).toBe(
      new Date(2026, 6, 14, 21, 42).getTime(),
    );
  });

  it("returns NaN for a blank, half-typed or malformed value", () => {
    expect(fromDateTimeInput("")).toBeNaN();
    expect(fromDateTimeInput("nonsense")).toBeNaN();
    // Date.parse would read these as real dates; the range isn't ready yet.
    expect(fromDateTimeInput("2026-07-")).toBeNaN();
    expect(fromDateTimeInput("2026-07")).toBeNaN();
    expect(fromDateTimeInput("2026")).toBeNaN();
    expect(fromDateTimeInput("2026-07-14")).toBeNaN();
  });

  it("still rejects a well-shaped but impossible date", () => {
    expect(fromDateTimeInput("2026-13-01T00:00")).toBeNaN();
    expect(fromDateTimeInput("2026-07-14T25:00")).toBeNaN();
  });

  it("accepts the seconds-bearing form some browsers emit", () => {
    expect(fromDateTimeInput("2026-07-14T21:42:30")).toBe(
      new Date(2026, 6, 14, 21, 42, 30).getTime(),
    );
  });

  it("returns an empty string for an invalid timestamp", () => {
    expect(toDateTimeInput(NaN)).toBe("");
  });
});
