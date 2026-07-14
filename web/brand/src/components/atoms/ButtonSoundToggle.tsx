import { Button } from "./Button.tsx";
import { soundEnabled, toggleSoundEnabled } from "../../libs/soundPreference.ts";
import { BiRegularVolumeFull, BiRegularVolumeMute } from "solid-icons/bi";
import { Show } from "solid-js";

export function ButtonSoundToggle() {
	const label = () => (soundEnabled() ? "Mute sounds" : "Unmute sounds");

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
