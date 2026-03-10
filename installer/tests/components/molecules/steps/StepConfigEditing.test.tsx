import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepConfigEditing from "@/components/molecules/steps/StepConfigEditing.tsx";

describe("StepConfigEditing", () => {
  const mockState = {
    context: {
      deviceInfo: {
        config: {
          appEUI: "test-app-eui",
          appKey: "test-app-key",
          devEUI: "test-dev-eui",
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
    expect(screen.getByLabelText("appKey")).toBeInTheDocument();
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

    expect(appEUIInput.value).toBe("test-app-eui");
    expect(appKeyInput.value).toBe("test-app-key");
    expect(devEUIInput.value).toBe("test-dev-eui");
  });

  it("calls emitEvent when appEUI changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("appEUI");
    fireEvent.change(input, { target: { value: "new-value" } });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "appEUI",
      value: "new-value",
    });
  });

  it("calls emitEvent when appKey changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("appKey");
    fireEvent.change(input, { target: { value: "new-key" } });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "appKey",
      value: "new-key",
    });
  });

  it("calls emitEvent when devEUI changes", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const input = screen.getByLabelText("devEUI");
    fireEvent.change(input, { target: { value: "new-dev-eui" } });
    expect(mockEmitEvent).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "devEUI",
      value: "new-dev-eui",
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

  it("renders next button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByRole("button", { name: "next" })).toBeInTheDocument();
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

  it("calls emitEvent when next button is clicked", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "next" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "config.next" });
  });
});
