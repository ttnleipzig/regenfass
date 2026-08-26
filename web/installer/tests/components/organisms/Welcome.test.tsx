import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Welcome from "@/components/organisms/Welcome.tsx";

describe("Welcome", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders welcome paragraph", () => {
		const { container } = render(() => <Welcome />);
		const paragraph = container.querySelector("p");
		expect(paragraph).toBeInTheDocument();
	});

	it("renders description about tank and barrel water levels", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/This project measures water levels in tanks and barrels/),
		).toBeInTheDocument();
	});

	it("renders text about water level measurement", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/the readings to a server/),
		).toBeInTheDocument();
	});

	it("renders The Things Network reference", () => {
		render(() => <Welcome />);
		const ttNetwork = screen.getByText("The Things Network");
		expect(ttNetwork).toBeInTheDocument();
	});

	it("renders LoRaWAN reference", () => {
		render(() => <Welcome />);
		const lorawan = screen.getByText("LoRaWAN");
		expect(lorawan).toBeInTheDocument();
	});

	it("applies gradient styling to The Things Network", () => {
		render(() => <Welcome />);
		const ttNetwork = screen.getByText("The Things Network");
		const span = ttNetwork.closest("span");
		expect(span).toHaveClass("text-transparent");
		expect(span).toHaveClass("bg-gradient-to-br");
		expect(span).toHaveClass("bg-clip-text");
	});

	it("applies gradient styling to LoRaWAN", () => {
		render(() => <Welcome />);
		const lorawan = screen.getByText("LoRaWAN");
		const span = lorawan.closest("span");
		expect(span).toHaveClass("text-transparent");
		expect(span).toHaveClass("bg-gradient-to-br");
		expect(span).toHaveClass("bg-clip-text");
	});

	it("mentions HC-SR04 sensor", () => {
		render(() => <Welcome />);
		expect(screen.getByText(/HC-SR04 ultrasonic sensor/)).toBeInTheDocument();
	});

	it("mentions connected sensors and dashboard", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/connect different sensors and view their data in a dashboard/),
		).toBeInTheDocument();
	});

	it("renders complete welcome message", () => {
		render(() => <Welcome />);
		const paragraph = screen.getByText(/This project measures/);
		expect(paragraph).toBeInTheDocument();
		expect(paragraph.textContent).toContain("water levels in tanks and barrels");
		expect(paragraph.textContent).toContain("The Things Network");
		expect(paragraph.textContent).toContain("LoRaWAN");
	});
});
