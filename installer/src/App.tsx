import { ColorModeProvider, ColorModeScript } from "@kobalte/core";
import { Flasher } from "./Flasher.tsx";

function App() {
	return (
		<>
			<ColorModeScript />
			<ColorModeProvider>
				<div>
					<h1 class="text-4xl font-bold tracking-tight">
						Install Regenfass to your device!
					</h1>

					<Flasher />
				</div>
			</ColorModeProvider>
		</>
	);
}

export default App;
