import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import SensorGraph from "@/components/molecules/SensorGraph";
import { SensorType, type HistoryWindow } from "@/libs/sensors";

// ApexCharts needs a real layout engine; the graph's contract here is *what it
// is handed*, so stub the chart and assert on the series/options instead.
const chartCalls: { options: Record<string, any>; series: any[] }[] = [];
vi.mock("solid-apexcharts", () => ({
  SolidApexCharts: (props: { options: Record<string, any>; series: any[] }) => {
    chartCalls.push({ options: props.options, series: props.series });
    return <div data-testid="chart" />;
  },
}));

const END = Date.parse("2026-08-25T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const WINDOW: HistoryWindow = { start: END - 7 * DAY, end: END };

const distance = { type: SensorType.Distance, value: 42, unit: "cm" } as const;

describe("SensorGraph", () => {
  afterEach(() => {
    cleanup();
    chartCalls.length = 0;
  });

  it("titles the card with the sensor type when the channel has no name", () => {
    render(() => <SensorGraph reading={distance} history={[]} window={WINDOW} />);
    expect(screen.getByText("Water Level")).toBeInTheDocument();
  });

  it("leads with the channel name and keeps the type as the qualifier", () => {
    // Two channels of the same type have to stay tellable apart.
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        history={[]}
        window={WINDOW}
      />
    ));
    expect(screen.getByText("Cistern · Water Level")).toBeInTheDocument();
  });

  it("titles a boolean card the same way", () => {
    render(() => (
      <SensorGraph
        reading={{ type: SensorType.Boolean, value: true }}
        name="Lid"
        window={WINDOW}
      />
    ));
    expect(screen.getByText("Lid · Status")).toBeInTheDocument();
  });

  it("renders no chart and says so when there is no history", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[]}
        window={WINDOW}
        periodLabel="the last 7 days"
      />
    ));
    expect(screen.getByText("No data in the last 7 days")).toBeInTheDocument();
    expect(screen.queryByTestId("chart")).not.toBeInTheDocument();
    // The old behaviour invented a 24-point random walk here.
    expect(chartCalls).toHaveLength(0);
  });

  it("does not plot points that fall outside the window", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[
          { t: END - 40 * DAY, value: 10 },
          { t: END - 30 * DAY, value: 11 },
        ]}
        window={WINDOW}
        periodLabel="the last 7 days"
      />
    ));
    expect(screen.getByText("No data in the last 7 days")).toBeInTheDocument();
    expect(chartCalls).toHaveLength(0);
  });

  it("plots only the in-window points and pins the axis to the window", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[
          { t: END - 30 * DAY, value: 10 },
          { t: END - 2 * DAY, value: 20 },
          { t: END - DAY, value: 21 },
        ]}
        latestAt={END - DAY}
        window={WINDOW}
      />
    ));
    expect(chartCalls).toHaveLength(1);
    const { options, series } = chartCalls[0];
    expect(series[0].data).toEqual([
      { x: END - 2 * DAY, y: 20 },
      { x: END - DAY, y: 21 },
    ]);
    expect(options.xaxis).toMatchObject({
      type: "datetime",
      min: WINDOW.start,
      max: WINDOW.end,
    });
  });

  it("labels a headline value from before the window with its age", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[]}
        latestAt={END - 30 * DAY}
        window={WINDOW}
      />
    ));
    expect(screen.getByText("42 cm · 4 wk ago")).toBeInTheDocument();
  });

  it("shows a fresh headline value unadorned", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        history={[{ t: END - 3600_000, value: 42 }]}
        latestAt={END - 3600_000}
        window={WINDOW}
      />
    ));
    expect(screen.getByText("42 cm")).toBeInTheDocument();
  });

  it("dims a stale boolean reading instead of showing it as the current state", () => {
    render(() => (
      <SensorGraph
        reading={{ type: SensorType.Boolean, value: true }}
        history={[]}
        latestAt={END - 30 * DAY}
        window={WINDOW}
      />
    ));
    const badge = screen.getByText(/^On ·/);
    expect(badge).toHaveClass("opacity-60");
  });
});

describe("SensorGraph channel editing", () => {
  afterEach(() => {
    cleanup();
    chartCalls.length = 0;
  });

  it("titles the card statically when it is not editable", () => {
    render(() => (
      <SensorGraph reading={distance} name="Cistern" history={[]} window={WINDOW} />
    ));
    expect(screen.getByText("Cistern · Water Level")).toBeInTheDocument();
    expect(screen.queryByLabelText("Channel name")).not.toBeInTheDocument();
  });

  it("replaces the title with a name input and a type select when editable", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        onEdit={() => {}}
        history={[]}
        window={WINDOW}
      />
    ));
    const input = screen.getByLabelText("Channel name") as HTMLInputElement;
    expect(input.value).toBe("Cistern");
    expect(screen.getByLabelText("Sensor type")).toBeInTheDocument();
    expect(screen.queryByText("Cistern · Water Level")).not.toBeInTheDocument();
  });

  it("commits a renamed channel on blur", () => {
    const edits: { name: string; type: SensorType | null }[] = [];
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        declaredType={SensorType.Distance}
        onEdit={(update) => edits.push(update)}
        history={[]}
        window={WINDOW}
      />
    ));
    const input = screen.getByLabelText("Channel name");
    fireEvent.input(input, { target: { value: "Rain barrel" } });
    fireEvent.blur(input);
    expect(edits).toEqual([
      { name: "Rain barrel", type: SensorType.Distance },
    ]);
  });

  it("shows no type in the select when nothing has been declared", () => {
    // Regression: the select used to fall back to the type the channel reports.
    // Clearing a description then looked like it had half-failed — the name
    // went blank while the select carried on showing a type.
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        declaredType={null}
        onEdit={() => {}}
        history={[]}
        window={WINDOW}
      />
    ));
    expect(screen.getByLabelText("Sensor type")).toHaveTextContent(
      "No sensor type",
    );
  });

  it("shows a cleared channel as fully undescribed", () => {
    // What a card looks like straight after its mapping is removed: the row has
    // to stay because measurements reference it, so the card stays too — but
    // nothing about it should still read as described.
    render(() => (
      <SensorGraph
        reading={distance}
        name={undefined}
        declaredType={null}
        onEdit={() => {}}
        onHide={() => {}}
        history={[]}
        window={WINDOW}
      />
    ));
    expect((screen.getByLabelText("Channel name") as HTMLInputElement).value).toBe(
      "",
    );
    expect(screen.getByLabelText("Sensor type")).toHaveTextContent(
      "No sensor type",
    );
  });

  it("does not declare the reported type when only the name is edited", () => {
    const edits: { name: string; type: SensorType | null }[] = [];
    render(() => (
      <SensorGraph
        reading={distance}
        onEdit={(update) => edits.push(update)}
        history={[]}
        window={WINDOW}
      />
    ));
    const input = screen.getByLabelText("Channel name");
    fireEvent.input(input, { target: { value: "Cistern" } });
    fireEvent.blur(input);
    expect(edits).toEqual([{ name: "Cistern", type: null }]);
  });

  it("does not commit when the name is unchanged", () => {
    const edits: unknown[] = [];
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        onEdit={(update) => edits.push(update)}
        history={[]}
        window={WINDOW}
      />
    ));
    fireEvent.blur(screen.getByLabelText("Channel name"));
    expect(edits).toEqual([]);
  });

  it("offers a hide control only when hiding is possible", () => {
    const { unmount } = render(() => (
      <SensorGraph reading={distance} name="Cistern" history={[]} window={WINDOW} />
    ));
    expect(screen.queryByLabelText("Hide Cistern")).not.toBeInTheDocument();
    unmount();

    let hidden = 0;
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        onHide={() => (hidden += 1)}
        history={[]}
        window={WINDOW}
      />
    ));
    fireEvent.click(screen.getByLabelText("Hide Cistern"));
    expect(hidden).toBe(1);
  });

  it("locks the controls while a write is in flight", () => {
    render(() => (
      <SensorGraph
        reading={distance}
        name="Cistern"
        onEdit={() => {}}
        onHide={() => {}}
        busy
        history={[]}
        window={WINDOW}
      />
    ));
    expect(screen.getByLabelText("Channel name")).toBeDisabled();
    expect(screen.getByLabelText("Hide Cistern")).toBeDisabled();
  });

  it("renders a described channel that has never reported", () => {
    // No reading at all: the slot was prepared before the device sent anything.
    render(() => (
      <SensorGraph
        name="Cistern"
        declaredType={SensorType.Distance}
        onEdit={() => {}}
        window={WINDOW}
        periodLabel="the last 7 days"
      />
    ));
    expect(screen.getByText("No data in the last 7 days")).toBeInTheDocument();
    expect(chartCalls).toHaveLength(0);
    expect(
      (screen.getByLabelText("Channel name") as HTMLInputElement).value,
    ).toBe("Cistern");
  });
});
