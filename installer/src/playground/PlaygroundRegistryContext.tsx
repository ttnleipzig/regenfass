import { createContext, useContext, type ParentProps } from "solid-js";
import type { PlaygroundRegistry } from "./types";

const PlaygroundRegistryContext = createContext<PlaygroundRegistry>();

export function PlaygroundRegistryProvider(
props: ParentProps<{ value: PlaygroundRegistry }>,
) {
	return (
		<PlaygroundRegistryContext.Provider value={props.value}>
			{props.children}
		</PlaygroundRegistryContext.Provider>
	);
}

export function usePlaygroundRegistry(): PlaygroundRegistry {
	const reg = useContext(PlaygroundRegistryContext);
	if (!reg) {
		throw new Error("usePlaygroundRegistry must be used inside PlaygroundRegistryProvider");
	}
	return reg;
}
