import { createActor } from "xstate";
import { describe, expect, it, vi } from "vitest";
import { setupStateMachine } from "@/libs/install/state";

vi.mock("@/libs/install/scp", () => ({
	SCPAdapter: {},
	readField: vi.fn(),
	writeField: vi.fn(),
}));

const heltec = "heltec_wifi_lora_32_V3_HCSR04";
const azDelivery = "az-delivery-devkit-v4_HCSR04";

function selectionActor(environment: string | null, version: string | null) {
	return createActor(setupStateMachine, {
		snapshot: setupStateMachine.resolveState({
			value: "Install_WaitingForInstallationMethodChoice",
			context: {
				firmwareReleases: [
					{ version: "1.2.3", environments: [heltec, azDelivery] },
					{ version: "1.2.2", environments: [heltec] },
				],
				upstreamVersions: ["1.2.3", "1.2.2"],
				targetEnvironment: environment,
				targetFirmwareVersion: version,
				error: null,
				connection: null,
				deviceInfo: {},
				configWriteProgress: null,
				installFlashProgress: null,
			},
		}),
	}).start();
}

describe("firmware selection state", () => {
	it.each([
		[null, "1.2.3", false],
		[azDelivery, null, false],
		[azDelivery, "1.2.2", false],
		[azDelivery, "1.2.3", true],
		[heltec, "1.2.2", true],
	] as const)(
		"validates %s with version %s",
		(environment, version, allowed) => {
			const actor = selectionActor(environment, version);
			expect(actor.getSnapshot().can({ type: "install.install" })).toBe(
				allowed,
			);
			actor.stop();
		},
	);

	it("clears the version and filters releases when the environment changes", () => {
		const actor = selectionActor(heltec, "1.2.2");
		actor.send({
			type: "install.environment_selected",
			environment: azDelivery,
		});
		expect(actor.getSnapshot().context.targetFirmwareVersion).toBeNull();
		expect(actor.getSnapshot().context.upstreamVersions).toEqual(["1.2.3"]);
		expect(actor.getSnapshot().can({ type: "install.install" })).toBe(false);
		actor.send({ type: "install.target_version_selected", version: "1.2.3" });
		expect(actor.getSnapshot().can({ type: "install.install" })).toBe(true);
		actor.stop();
	});
});
