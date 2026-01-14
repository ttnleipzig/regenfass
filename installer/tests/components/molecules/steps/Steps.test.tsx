import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Steps from "@/components/molecules/steps/Steps.tsx";

// Mock XState Solid
vi.mock("@xstate/solid", () => {
  return {
    useMachine: vi.fn(() => {
      // The component uses (state as any).matches(...), so state should be the object directly
      const state = {
        matches: (value: string) => value === "Start_WaitingForUser",
        toJSON: () => ({ value: "Start_WaitingForUser" }),
      };
      const emitEvent = vi.fn();
      return [state, emitEvent];
    }),
  };
});

// Mock StatelyAI Inspector
vi.mock("@statelyai/inspect", () => {
  return {
    createBrowserInspector: vi.fn(() => ({
      inspect: vi.fn(),
    })),
  };
});

// Mock state machine
vi.mock("@/libs/install/state.ts", () => {
  return {
    setupStateMachine: {},
  };
});

// Mock all step components
vi.mock("@/components/molecules/steps/StepStartCheckingWebSerialSupport.tsx", () => ({
  default: () => <div>Checking Web Serial Support</div>,
}));

vi.mock("@/components/molecules/steps/StepStartFetchUpstreamVersions.tsx", () => ({
  default: () => <div>Fetching Upstream Versions</div>,
}));

vi.mock("@/components/molecules/steps/StepStartWaitingForUser.tsx", () => ({
  default: () => <div>Waiting For User</div>,
}));

vi.mock("@/components/molecules/steps/StepConnectConnecting.tsx", () => ({
  default: () => <div>Connecting</div>,
}));

vi.mock("@/components/molecules/steps/StepConnectReadingVersion.tsx", () => ({
  default: () => <div>Reading Version</div>,
}));

vi.mock("@/components/molecules/steps/StepInstallWaitingForInstallationMethodChoice.tsx", () => ({
  default: () => <div>Waiting For Installation Method Choice</div>,
}));

vi.mock("@/components/molecules/steps/StepInstallInstalling.tsx", () => ({
  default: () => <div>Installing</div>,
}));

vi.mock("@/components/molecules/steps/StepInstallMigratingConfiguration.tsx", () => ({
  default: () => <div>Migrating Configuration</div>,
}));

vi.mock("@/components/molecules/steps/StepConfigEditing.tsx", () => ({
  default: () => <div>Editing Configuration</div>,
}));

vi.mock("@/components/molecules/steps/StepConfigWritingConfiguration.tsx", () => ({
  default: () => <div>Writing Configuration</div>,
}));

vi.mock("@/components/molecules/steps/StepFinishShowingNextSteps.tsx", () => ({
  default: () => <div>Showing Next Steps</div>,
}));

vi.mock("@/components/molecules/steps/StepFinishShowingError.tsx", () => ({
  default: () => <div>Showing Error</div>,
}));

describe("Steps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders steps container", () => {
    const { container } = render(() => <Steps />);
    const containerElement = container.querySelector(".mx-auto.max-w-3xl");
    expect(containerElement).toBeInTheDocument();
  });

  it("renders step component based on state", () => {
    render(() => <Steps />);
    expect(screen.getByText("Waiting For User")).toBeInTheDocument();
  });

  it("has correct container classes", () => {
    const { container } = render(() => <Steps />);
    const containerElement = container.querySelector(".mx-auto.max-w-3xl");
    expect(containerElement).toHaveClass("px-4", "sm:px-6", "py-6", "space-y-6");
  });
});
