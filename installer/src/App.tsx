import Steps from "@/components/molecules/steps/Steps.tsx";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header.tsx";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";

function App() {
	return (
		<>
			<ColorModeScript />
			<ColorModeProvider>
				<div class="min-h-screen flex flex-col">
					<Header />
					<div class="flex flex-col w-full flex-1">
						<Steps />
					</div>
					<Footer />
				</div>
			</ColorModeProvider>
		</>
	);
}

export default App;
