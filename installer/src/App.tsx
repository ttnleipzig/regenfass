import { Router, Route } from "@solidjs/router";
import Steps from "./components/molecules/steps/Steps";
import Footer from "./components/organisms/Footer";
import Header from "./components/organisms/Header";
import Newsletter from "./components/organisms/Newsletter";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import PlaygroundLayout from "./playground/PlaygroundLayout";
import PlaygroundHome from "./playground/PlaygroundHome";
import ComponentRenderer from "./playground/ComponentRenderer";
import Dashboard from "./components/pages/Dashboard";

// Installer flow — the web-serial firmware installation experience.
function InstallApp() {
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

// Playground wrapper components
function PlaygroundHomeWrapper() {
	return (
		<PlaygroundLayout>
			<PlaygroundHome />
		</PlaygroundLayout>
	);
}

function ComponentRendererWrapper() {
	return (
		<PlaygroundLayout>
			<ComponentRenderer />
		</PlaygroundLayout>
	);
}

function App() {
	return (
		<>
			<ColorModeScript />
			<ColorModeProvider>
				<Router>
					<Route path="/" component={Dashboard} />
					<Route path="/install" component={InstallApp} />
					<Route path="/playground" component={PlaygroundHomeWrapper} />
					<Route path="/playground/:category/:component" component={ComponentRendererWrapper} />
				</Router>
			</ColorModeProvider>
		</>
	);
}

export default App;
