import { Button } from "./Button.tsx";
import { soundEnabled, toggleSoundEnabled } from "../../libs/soundPreference.ts";
import { BiRegularVolumeFull, BiRegularVolumeMute } from "solid-icons/bi";
import { Show } from "solid-js";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export function ButtonSoundToggle() {
	const t = useBrandT();
	const label = () =>
		soundEnabled() ? t("a11y.muteSounds") : t("a11y.unmuteSounds");

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={label()}
			aria-pressed={!soundEnabled()}
			onClick={() => toggleSoundEnabled()}
			class="transition-transform duration-200 active:scale-95 text-foreground/80 hover:text-foreground"
		>
			<Show
				when={soundEnabled()}
				fallback={<BiRegularVolumeMute aria-hidden={true} size={16} />}
			>
				<BiRegularVolumeFull aria-hidden={true} size={16} />
			</Show>
		</Button>
	);
}
