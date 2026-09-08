import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";

// The payloads the local backend returns for seed device ZTWJR0LI9I62UD53
// ("North Tank"): four channels with a week of data and a fifth, "Pump
// running", described as a Boolean but never reported on.
const TOKEN = "ZTWJR0LI9I62UD53";
const DEVICE_ID = "63fe0cd1-42ba-4df5-9f9f-b4862b108fba";
const NOW = "2026-09-08T19:45:00+02:00";

const OVERVIEW_DEVICE = {
  device_id: DEVICE_ID,
  name: "North Tank",
  is_readonly: false,
  channels: [
    { channel_id: 0, name: "Water temperature", measurement_type: 5, reported_type: 5, hidden: false, latest: { received_at: NOW, value: 23.4 } },
    { channel_id: 3, name: "Daylight", measurement_type: 7, reported_type: 7, hidden: false, latest: { received_at: NOW, value: 50485 } },
    { channel_id: 4, name: "Pump running", measurement_type: 0, hidden: false },
  ],
};

const RANGED = [
  { channel_id: 0, name: "Water temperature", measurement_type: 5, reported_type: 5, hidden: false, measurements: [{ received_at: NOW, value: 23.4 }] },
  { channel_id: 3, name: "Daylight", measurement_type: 7, reported_type: 7, hidden: false, measurements: [{ received_at: NOW, value: 50485 }] },
  { channel_id: 4, name: "Pump running", measurement_type: 0, hidden: false, measurements: [] },
];

vi.mock("@/libs/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/libs/api")>();
  return {
    ...actual,
    getOverview: vi.fn(async () => ({ groups: [], devices: [OVERVIEW_DEVICE] })),
    getDeviceMeasurements: vi.fn(async (_t: string, q: { channel?: number }) =>
      q.channel === undefined ? RANGED : RANGED.filter((c) => c.channel_id === q.channel),
    ),
  };
});
vi.mock("solid-apexcharts", () => ({
  SolidApexCharts: () => <div data-testid="chart" />,
}));
vi.mock("@/components/pages/LeipzigMap", () => ({
  default: () => <div data-testid="map" />,
}));

localStorage.setItem(
  "regenfass:subscriptions",
  JSON.stringify({ groups: [], devices: [TOKEN], deviceTokenByID: { [DEVICE_ID]: TOKEN } }),
);

const { default: Dashboard } = await import("@/components/pages/Dashboard");

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("Dashboard panel for a device with a described, never-reported channel", () => {
  afterEach(cleanup);

  it("renders a card for the empty channel next to the ones with data", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.parse(NOW));
    try {
      render(() => (
        <Router root={(p) => <>{p.children}</>}>
          <Route path="/" component={Dashboard} />
        </Router>
      ));
      await flush();
      await flush();

      fireEvent.click(screen.getByText("North Tank"));
      await flush();
      await flush();

      // Channels with data get their graph…
      expect((screen.getAllByLabelText("Channel name") as HTMLInputElement[]).map((i) => i.value))
        .toEqual(["Water temperature", "Daylight", "Pump running"]);
      // …and the empty one still gets a card with its empty state.
      expect(screen.getByText(/No data in/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
