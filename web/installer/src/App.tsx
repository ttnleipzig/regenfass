import { Router, Route } from "@solidjs/router";
import Steps from "./components/molecules/steps/Steps";
import { Footer, Header, LocaleProvider, Newsletter } from "@regenfass/brand";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";

// Main app layout for the installer
function MainApp() {
	return (
		<div class="min-h-screen flex flex-col">
			<Header />
			<main class="flex flex-col w-full flex-1">
				<Steps />
			</main>
			<Newsletter />
			<Footer />
		</div>
	);
}

function App() {
	return (
		<>
			<ColorModeScript />
			<ColorModeProvider>
				<LocaleProvider>
					<Router>
						<Route path="/" component={MainApp} />
					</Router>
				</LocaleProvider>
			</ColorModeProvider>
		</>
	);
}

export default App;
