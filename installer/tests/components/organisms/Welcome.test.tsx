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

	it("renders description about smart water tank", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/This project is about a smart water tank/),
		).toBeInTheDocument();
	});

	it("renders text about water level measurement", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/It measures the water level and sends the data/),
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
		const { container } = render(() => <Welcome />);
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

	it("mentions web interface and telegram bot", () => {
		render(() => <Welcome />);
		expect(
			screen.getByText(/controlled via a web interface or via a telegram bot/),
		).toBeInTheDocument();
	});

	it("renders complete welcome message", () => {
		render(() => <Welcome />);
		const paragraph = screen.getByText(/This project is about/);
		expect(paragraph).toBeInTheDocument();
		expect(paragraph.textContent).toContain("smart water tank");
		expect(paragraph.textContent).toContain("The Things Network");
		expect(paragraph.textContent).toContain("LoRaWAN");
	});
});
