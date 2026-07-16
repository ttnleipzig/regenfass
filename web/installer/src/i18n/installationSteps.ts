import type { Translator } from "@solid-primitives/i18n";
import { installerDictEn } from "./en.ts";
import type { FlatInstallerDictionary } from "./index.ts";

/** Labels align with `getInstallationActiveStep`: connect → method choice → flash. */
export function installationSteps(
	t: Translator<FlatInstallerDictionary>,
): string[] {
	return [
		t("installationSteps.connect"),
		t("installationSteps.chooseMethod"),
		t("installationSteps.flash"),
	];
}

/** English step labels for tests that assert paginator copy. */
export const INSTALLATION_STEPS = [
	installerDictEn.installationSteps.connect,
	installerDictEn.installationSteps.chooseMethod,
	installerDictEn.installationSteps.flash,
] as const;
