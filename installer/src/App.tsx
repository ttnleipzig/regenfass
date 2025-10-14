import { Router, Route } from "@solidjs/router";
import Steps from "./components/molecules/steps/Steps";
import Footer from "./components/organisms/Footer";
import Header from "./components/organisms/Header";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import PlaygroundLayout from "./playground/PlaygroundLayout";
import PlaygroundHome from "./playground/PlaygroundHome";
import ComponentRenderer from "./playground/ComponentRenderer";

// Main app layout for the installer
function MainApp() {
	return (
		<div class="min-h-screen flex flex-col">
			<Header />
			<div class="flex flex-col w-full flex-1">
				<Steps />
			</div>
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
					<Route path="/" component={MainApp} />
					<Route path="/playground" component={PlaygroundHomeWrapper} />
					<Route path="/playground/:category/:component" component={ComponentRendererWrapper} />
				</Router>
			</ColorModeProvider>
		</>
	);
}

export default App;
