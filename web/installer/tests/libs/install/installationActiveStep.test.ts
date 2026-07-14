import { describe, it, expect, vi } from "vitest";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";

function mockMatches(activeId: string) {
	return { matches: vi.fn((id: string) => id === activeId) };
}

describe("getInstallationActiveStep", () => {
	it("returns undefined for non-objects and missing matches", () => {
		expect(getInstallationActiveStep(null)).toBeUndefined();
		expect(getInstallationActiveStep(undefined)).toBeUndefined();
		expect(getInstallationActiveStep({})).toBeUndefined();
		expect(getInstallationActiveStep({ matches: "nope" })).toBeUndefined();
	});

	it("returns 1 for connect / welcome phase states", () => {
		expect(getInstallationActiveStep(mockMatches("Start_WaitingForUser"))).toBe(
			1,
		);
		expect(getInstallationActiveStep(mockMatches("Connect_Connecting"))).toBe(
			1,
		);
		expect(getInstallationActiveStep(mockMatches("Connect_ReadingVersion"))).toBe(
			1,
		);
	});

	it("returns 2 for install method choice", () => {
		expect(
			getInstallationActiveStep(
				mockMatches("Install_WaitingForInstallationMethodChoice"),
			),
		).toBe(2);
	});

	it("returns 3 while flashing firmware", () => {
		expect(getInstallationActiveStep(mockMatches("Install_Installing"))).toBe(
			3,
		);
	});

	it("returns undefined for other machine states", () => {
		for (const id of [
			"Start_CheckingWebSerialSupport",
			"Start_FetchUpstreamVersions",
			"Install_MigratingConfiguration",
			"Config_Editing",
			"Config_WritingConfiguration",
			"Finish_ShowingNextSteps",
			"Finish_ShowingError",
		]) {
			expect(getInstallationActiveStep(mockMatches(id))).toBeUndefined();
		}
	});
});
