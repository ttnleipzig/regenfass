import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepConfigEditing from "@/components/molecules/steps/StepConfigEditing.tsx";
import { formatAppKeyHexPairs } from "@/libs/hexKeyDisplay.ts";

const playErrorSound = vi.fn();

vi.mock("@/libs/errorSound.ts", () => ({
	playErrorSound: (...args: unknown[]) => playErrorSound(...args),
}));

const MOCK_APP_KEY_32 =
  "0123456789ABCDEF0123456789ABCDEF" as const;

describe("StepConfigEditing", () => {
  const mockState = {
    context: {
      deviceInfo: {
        configVersion: 1,
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
    playErrorSound.mockClear();
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

  it("loads config from json file and emits config.loadFromFile", async () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));

    const fileInput = screen.getByLabelText(
      "Load configuration from JSON file"
    ) as HTMLInputElement;
    const file = new File(
      [
        JSON.stringify({
          configVersion: 1,
          appEUI: "aaaabbbbccccdddd",
          appKey: "0123456789abcdef0123456789abcdef",
          devEUI: "0123456789abcdef",
        }),
      ],
      "regenfass-config.json",
      { type: "application/json" }
    );

    Object.defineProperty(fileInput, "files", {
      configurable: true,
      value: [file],
    });
    fireEvent.change(fileInput);

    await vi.waitFor(() => {
      expect(mockEmitEvent).toHaveBeenCalledWith({
        type: "config.loadFromFile",
        config: {
          appEUI: "AAAABBBBCCCCDDDD",
          appKey: "0123456789ABCDEF0123456789ABCDEF",
          devEUI: "0123456789ABCDEF",
        },
        configVersion: 1,
      });
    });
  });

  it("shows error when json file is invalid", async () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));

    const fileInput = screen.getByLabelText(
      "Load configuration from JSON file"
    ) as HTMLInputElement;
    const file = new File(["not json"], "config.json", {
      type: "application/json",
    });

    Object.defineProperty(fileInput, "files", {
      configurable: true,
      value: [file],
    });
    fireEvent.change(fileInput);

    expect(await screen.findByText("Invalid JSON format")).toBeInTheDocument();
    expect(playErrorSound).toHaveBeenCalledTimes(1);
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it("starts json download with current config when save to file is clicked", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") {
        return {
          href: "",
          download: "",
          click,
        } as HTMLAnchorElement;
      }
      return originalCreateElement(tagName, options);
    });

    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    fireEvent.click(screen.getByRole("button", { name: "save to file" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(JSON.parse(text)).toEqual({
      configVersion: 1,
      appEUI: "AAAABBBBCCCCDDDD",
      appKey: MOCK_APP_KEY_32,
      devEUI: "0123456789ABCDEF",
    });
    expect(mockEmitEvent).not.toHaveBeenCalled();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders appEUI copy button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: /copy appEUI to clipboard/i })
    ).toBeInTheDocument();
  });

  it("renders devEUI copy button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: /copy devEUI to clipboard/i })
    ).toBeInTheDocument();
  });

  it("copies appEUI to clipboard as uppercase hex", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", {
      name: /copy appEUI to clipboard/i,
    });
    fireEvent.click(button);

    expect(writeText).toHaveBeenCalledWith("AAAABBBBCCCCDDDD");
  });

  it("copies devEUI to clipboard as uppercase hex", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", {
      name: /copy devEUI to clipboard/i,
    });
    fireEvent.click(button);

    expect(writeText).toHaveBeenCalledWith("0123456789ABCDEF");
  });

  it("disables devEUI copy button when value is empty", () => {
    const emptyDevEUIState = {
      context: {
        deviceInfo: {
          config: {
            ...mockState.context.deviceInfo.config,
            devEUI: "",
          },
        },
      },
    };

    render(() => (
      <StepConfigEditing state={emptyDevEUIState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", {
      name: /copy devEUI to clipboard/i,
    });
    expect(button).toBeDisabled();
  });

  it("renders appKey copy button", () => {
    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByRole("button", { name: /copy appKey to clipboard/i })
    ).toBeInTheDocument();
  });

  it("copies appKey to clipboard as uppercase hex", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(() => (
      <StepConfigEditing state={mockState} emitEvent={mockEmitEvent} />
    ));
    fireEvent.click(
      screen.getByRole("button", { name: /copy appKey to clipboard/i })
    );

    expect(writeText).toHaveBeenCalledWith(MOCK_APP_KEY_32);
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
