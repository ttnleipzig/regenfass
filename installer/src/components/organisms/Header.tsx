import { Button } from "@/components/ui/button";
import { useColorMode } from "@kobalte/core/color-mode";
import { Moon, Sun } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

const Link = ({ href, children }: { href: string; children: JSX.Element }) => (
	<li>
		<a
			href={href}
			class="p-2 hover:text-slate-500 dark:hover:text-white hover:underline"
		>
			{children}
		</a>
	</li>
);

export default function Header() {
	const color = useColorMode();

	return (
		<header class="w-full py-6 mx-auto ">
			<div class="flex justify-between">
				<h1 class="text-2xl font-bold text-transparent bg-gradient-to-br from-sky-700 to-cyan-100 bg-clip-text">
					Regenfass
				</h1>
				<nav class="invisible md:visible">
					<ul class="flex font-medium text-gray-800 gap-x-3 dark:text-gray-400">
						<Link href="https://docs.regenfass.eu/">Docs</Link>
						<Link href="https://github.com/ttnleipzig/regenfass">
							GitHub
						</Link>
						<Link href="https://matrix.to/#/#ttn-leipzig:matrix.org">
							Matrix
						</Link>
					</ul>
				</nav>

				<Button onClick={() => color.toggleColorMode()} size="icon" variant="outline">
					{color.colorMode() === "dark" ? <Sun /> : <Moon />}
				</Button>
			</div>
		</header>
	);
}
