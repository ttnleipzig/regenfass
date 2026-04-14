import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepConfigEditing from "@/components/molecules/steps/StepConfigEditing.tsx";
import { formatAppKeyHexPairs } from "@/libs/hexKeyDisplay.ts";

const MOCK_APP_KEY_32 =
  "0123456789ABCDEF0123456789ABCDEF" as const;

describe("StepConfigEditing", () => {
  const mockState = {
    context: {
      deviceInfo: {
        config: {
          appEUI: "AAAABBBBCCCCDDDD",
          appKey: MOCK_APP_KEY_32,
          devEUI: "0123456789ABCDEF",
        },
      },
    },
  };
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders appEUI field", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByLabelText("appEUI")).toBeInTheDocument();
  });

  it("renders appKey field", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("appKey") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Show app key" })).toBeInTheDocument();
  });

  it("renders devEUI field", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByLabelText("devEUI")).toBeInTheDocument();
  });

  it("displays current config values", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const appEUIInput = screen.getByLabelText("appEUI") as HTMLInputElement;
    const appKeyInput = screen.getByLabelText("appKey") as HTMLInputElement;
    const devEUIInput = screen.getByLabelText("devEUI") as HTMLInputElement;

    expect(appEUIInput.value).toBe("AAAABBBBCCCCDDDD");
    expect(appKeyInput.value).toBe(formatAppKeyHexPairs(MOCK_APP_KEY_32));
    expect(devEUIInput.value).toBe("0123456789ABCDEF");
  });

  it("calls emitEvent when appEUI changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("appEUI");
    fireEvent.input(input, { target: { value: "1111222233334444" } });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "appEUI",
      value: "1111222233334444",
    });
  });

  it("calls emitEvent when appKey changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("appKey");
    const nextCanonical = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    fireEvent.input(input, {
      target: { value: formatAppKeyHexPairs(nextCanonical) },
    });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "appKey",
      value: nextCanonical,
    });
  });

  it("calls emitEvent when devEUI changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("devEUI");
    fireEvent.input(input, { target: { value: "FEDCBA9876543210" } });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "devEUI",
      value: "FEDCBA9876543210",
    });
  });

  it("renders clear button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByRole("button", { name: "clear" })).toBeInTheDocument();
  });

  it("renders load from file button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: "load from file" })
    ).toBeInTheDocument();
  });

  it("renders save to file button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: "save to file" })
    ).toBeInTheDocument();
  });

  it("renders save to device button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: "Save to device" })
    ).toBeInTheDocument();
  });

  it("calls emitEvent when clear button is clicked", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "clear" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "config.clear" });
  });

  it("calls emitEvent when load from file button is clicked", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "load from file" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.loadFromFile",
      config: {
        appEUI: "",
        appKey: "",
        devEUI: "",
      },
    });
  });

  it("calls emitEvent when save to file button is clicked", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "save to file" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "config.saveToFile" });
  });

  it("calls emitEvent when save to device button is clicked", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "Save to device" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "config.next" });
  });
});
