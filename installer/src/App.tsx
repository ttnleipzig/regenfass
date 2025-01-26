import Steps from "@/components/molecules/steps/Steps.tsx";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header.tsx";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";

function App() {
	return (
		<>
			<ColorModeScript />
			<ColorModeProvider>
				<Header />
				<div class="flex flex-col w-full">
					<Steps />
				</div>
				<Footer />
			</ColorModeProvider>
		</>
	);
}

export default App;
