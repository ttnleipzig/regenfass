import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@solidjs/testing-library";
import Flasher from "@/components/molecules/Flasher.tsx";

// Mock Serial Port API
const mockSerialPort = {
  readable: new ReadableStream(),
  writable: new WritableStream(),
  getInfo: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
};

// Mock navigator.serial
Object.defineProperty(navigator, "serial", {
  writable: true,
  value: {
    requestPort: vi.fn(() => Promise.resolve(mockSerialPort)),
    getPorts: vi.fn(() => Promise.resolve([])),
  },
});

// Mock esptool-js
vi.mock("esptool-js", () => {
  return {
    Transport: vi.fn().mockImplementation(() => ({
      port: mockSerialPort,
    })),
    ESPLoader: vi.fn().mockImplementation(() => ({
      main: vi.fn(() => Promise.resolve("ESP32")),
      writeFlash: vi.fn(() => Promise.resolve()),
    })),
  };
});

describe("Flasher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders connect button", () => {
    render(() => <Flasher />);
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("renders connect button as button element", () => {
    render(() => <Flasher />);
    const button = screen.getByRole("button", { name: "Connect" });
    expect(button).toBeInTheDocument();
  });

  it("does not show device info initially", () => {
    render(() => <Flasher />);
    expect(screen.queryByText(/Connected to/)).not.toBeInTheDocument();
  });

  it("does not show file input initially", () => {
    const { container } = render(() => <Flasher />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeInTheDocument();
  });

  it("does not show message initially", () => {
    render(() => <Flasher />);
    expect(screen.queryByText(/No port selected/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Could not open serial port/)).not.toBeInTheDocument();
  });

  it("handles serial port request", async () => {
    render(() => <Flasher />);
    const button = screen.getByRole("button", { name: "Connect" });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(navigator.serial.requestPort).toHaveBeenCalled();
    });
  });

  it("shows error message when no port is selected", async () => {
    // Mock requestPort to throw NotFoundError
    const mockRequestPort = vi.fn(() => {
      const error = new Error("No port selected");
      (error as any).name = "NotFoundError";
      return Promise.reject(error);
    });
    Object.defineProperty(navigator, "serial", {
      writable: true,
      value: {
        requestPort: mockRequestPort,
        getPorts: vi.fn(() => Promise.resolve([])),
      },
    });

    render(() => <Flasher />);
    const button = screen.getByRole("button", { name: "Connect" });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(
        screen.getByText("No port selected. Please choose a serial device to continue.")
      ).toBeInTheDocument();
    });
  });

  it("shows error message when serial port cannot be opened", async () => {
    // Mock requestPort to throw generic error
    const mockRequestPort = vi.fn(() => {
      return Promise.reject(new Error("Port error"));
    });
    Object.defineProperty(navigator, "serial", {
      writable: true,
      value: {
        requestPort: mockRequestPort,
        getPorts: vi.fn(() => Promise.resolve([])),
      },
    });

    render(() => <Flasher />);
    const button = screen.getByRole("button", { name: "Connect" });
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Could not open serial port.")).toBeInTheDocument();
    });
  });
});
