import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import CloudEnrollment from "@/components/molecules/CloudEnrollment";
import { installerDictEn } from "@/i18n/en";
import { ApiError } from "@/libs/api";

const cloud = installerDictEn.finishShowingNextSteps.cloud;

const registerDevice = vi.fn();
const getDeviceInfo = vi.fn();
const addDeviceToken = vi.fn();

// Only the network calls and the subscription store are stubbed — ApiError is the
// real one so the 409 branch is exercised through the same type the client throws.
vi.mock("@/libs/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/libs/api")>();
  return {
    ...actual,
    registerDevice: (...args: unknown[]) => registerDevice(...args),
    getDeviceInfo: (...args: unknown[]) => getDeviceInfo(...args),
  };
});

vi.mock("@/libs/subscriptions", () => ({
  addDeviceToken: (...args: unknown[]) => addDeviceToken(...args),
}));

describe("CloudEnrollment", () => {
  beforeEach(() => {
    registerDevice.mockReset();
    getDeviceInfo.mockReset();
    addDeviceToken.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("cannot enroll a device without a usable DevEUI", () => {
    render(() => <CloudEnrollment devEUI="ABCD" />);

    expect(screen.getByText(cloud.missingDevEui)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: cloud.enroll })).toBeDisabled();
  });

  it("enrolls the device, subscribes its token and shows both tokens", async () => {
    registerDevice.mockResolvedValue({
      read_write_token: "rw_token_123",
      read_only_token: "ro_token_123",
    });
    getDeviceInfo.mockResolvedValue({ device_id: "device-uuid" });

    render(() => <CloudEnrollment devEUI=" aabbccddeeff0011 " />);
    fireEvent.click(screen.getByRole("button", { name: cloud.enroll }));

    expect(await screen.findByText(cloud.enrolledTitle)).toBeInTheDocument();
    // Trimmed and upper-cased: the backend stores EUIs in upper case.
    expect(registerDevice).toHaveBeenCalledWith("AABBCCDDEEFF0011");
    expect(getDeviceInfo).toHaveBeenCalledWith("rw_token_123");
    expect(addDeviceToken).toHaveBeenCalledWith("rw_token_123", "device-uuid");

    expect(screen.getByText("rw_token_123")).toBeInTheDocument();
    expect(screen.getByText("ro_token_123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(cloud.openDashboard) })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("still subscribes the token when the device lookup fails", async () => {
    registerDevice.mockResolvedValue({
      read_write_token: "rw_token_123",
      read_only_token: "ro_token_123",
    });
    getDeviceInfo.mockRejectedValue(new Error("offline"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(() => <CloudEnrollment devEUI="AABBCCDDEEFF0011" />);
    fireEvent.click(screen.getByRole("button", { name: cloud.enroll }));

    expect(await screen.findByText(cloud.enrolledTitle)).toBeInTheDocument();
    expect(addDeviceToken).toHaveBeenCalledWith("rw_token_123", undefined);
    consoleError.mockRestore();
  });

  it("explains a 409 instead of leaking the raw API error", async () => {
    registerDevice.mockRejectedValue(new ApiError(409, "API POST /device failed: 409 Conflict"));

    render(() => <CloudEnrollment devEUI="AABBCCDDEEFF0011" />);
    fireEvent.click(screen.getByRole("button", { name: cloud.enroll }));

    expect(await screen.findByText(cloud.alreadyEnrolled)).toBeInTheDocument();
    expect(addDeviceToken).not.toHaveBeenCalled();
    // The button offers another attempt rather than staying on the initial label.
    expect(screen.getByRole("button", { name: cloud.retry })).toBeEnabled();
  });

  it("reports an unexpected failure with the API message", async () => {
    registerDevice.mockRejectedValue(new ApiError(500, "API POST /device failed: 500 boom"));

    render(() => <CloudEnrollment devEUI="AABBCCDDEEFF0011" />);
    fireEvent.click(screen.getByRole("button", { name: cloud.enroll }));

    expect(
      await screen.findByText(
        "Could not enroll the device: API POST /device failed: 500 boom",
      ),
    ).toBeInTheDocument();
  });
});
