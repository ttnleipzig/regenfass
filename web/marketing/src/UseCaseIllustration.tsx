import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@regenfass/brand";

export type UseCaseIllustrationKind = "home" | "garden" | "tank";

export interface UseCaseIllustrationProps extends ComponentProps<"svg"> {
	kind: UseCaseIllustrationKind;
}

function HomeIllustration() {
	return (
		<>
			<defs>
				<linearGradient id="uci-home-sky" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="hsl(199 89% 48%)" stop-opacity="0.24" />
					<stop offset="100%" stop-color="hsl(171 91% 36%)" stop-opacity="0.1" />
				</linearGradient>
				<radialGradient id="uci-home-glow" cx="50%" cy="40%" r="65%">
					<stop offset="0%" stop-color="hsl(199 89% 60%)" stop-opacity="0.32" />
					<stop offset="100%" stop-color="hsl(199 89% 48%)" stop-opacity="0" />
				</radialGradient>
			</defs>
			<rect x="18" y="18" width="284" height="144" rx="28" fill="url(#uci-home-sky)" />
			<circle cx="130" cy="66" r="42" fill="url(#uci-home-glow)" />
			<circle cx="226" cy="108" r="32" fill="hsl(171 91% 36% / 0.16)" />
			<path
				d="M46 108c24-26 52-39 84-39 31 0 58 10 80 30"
				fill="none"
				stroke="hsl(199 89% 58% / 0.6)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M46 130c16-20 36-30 60-30 24 0 44 9 59 27"
				fill="none"
				stroke="hsl(171 91% 44% / 0.56)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M94 118h88l-9 18H103z"
				fill="hsl(222 47% 12% / 0.72)"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="2.5"
			/>
			<path
				d="M104 118V88h68v30"
				fill="none"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
			<path
				d="M99 92l39-25 40 25"
				fill="none"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<rect x="187" y="88" width="28" height="44" rx="14" fill="hsl(222 47% 8% / 0.96)" />
			<path
				d="M201 94v30"
				fill="none"
				stroke="hsl(199 89% 60%)"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<circle cx="201" cy="130" r="12" fill="hsl(199 89% 48% / 0.3)" />
			<circle cx="201" cy="130" r="7" fill="hsl(199 89% 60%)" />
			<path
				d="M76 76h20"
				stroke="hsl(45 100% 70% / 1)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M86 66v20"
				stroke="hsl(45 100% 70% / 1)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M74 138h18"
				stroke="hsl(171 91% 44% / 0.86)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M114 138h12"
				stroke="hsl(171 91% 44% / 0.86)"
				stroke-width="4"
				stroke-linecap="round"
			/>
		</>
	);
}

function GardenIllustration() {
	return (
		<>
			<defs>
				<linearGradient id="uci-garden-sky" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="hsl(171 91% 36%)" stop-opacity="0.18" />
					<stop offset="100%" stop-color="hsl(199 89% 48%)" stop-opacity="0.12" />
				</linearGradient>
				<radialGradient id="uci-garden-glow" cx="30%" cy="30%" r="55%">
					<stop offset="0%" stop-color="hsl(45 100% 70%)" stop-opacity="0.4" />
					<stop offset="100%" stop-color="hsl(45 100% 70%)" stop-opacity="0" />
				</radialGradient>
			</defs>
			<rect x="18" y="18" width="284" height="144" rx="28" fill="url(#uci-garden-sky)" />
			<circle cx="76" cy="70" r="34" fill="url(#uci-garden-glow)" />
			<circle cx="240" cy="88" r="24" fill="hsl(199 89% 48% / 0.16)" />
			<path
				d="M48 118c26-24 53-36 83-36 31 0 58 10 84 30"
				fill="none"
				stroke="hsl(171 91% 46% / 0.62)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<rect x="56" y="106" width="88" height="30" rx="8" fill="hsl(222 47% 8% / 0.96)" />
			<path
				d="M62 112h76"
				stroke="hsl(199 89% 58% / 0.66)"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<path
				d="M158 98h88v38h-88z"
				fill="hsl(222 47% 8% / 0.96)"
				stroke="hsl(199 89% 58% / 0.6)"
				stroke-width="2.5"
			/>
			<path
				d="M168 128c14-10 28-15 42-15 13 0 25 4 36 12"
				fill="none"
				stroke="hsl(199 89% 58% / 0.7)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<circle cx="78" cy="72" r="12" fill="hsl(45 100% 70% / 1)" />
			<path
				d="M78 56v-8M78 96v-8M62 72h-8M102 72h-8M66 60l-5-5M90 84l-5-5M66 84l-5 5M90 60l-5 5"
				stroke="hsl(45 100% 70% / 1)"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<path
				d="M208 70c0-14 9-26 22-30 13 4 22 16 22 30v12h-44z"
				fill="hsl(222 47% 8% / 0.96)"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="2.5"
			/>
			<path
				d="M230 82v34"
				stroke="hsl(199 89% 60%)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M230 116c0 8-6 14-14 14"
				fill="none"
				stroke="hsl(171 91% 46% / 0.86)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<circle cx="230" cy="58" r="6" fill="hsl(199 89% 60%)" />
		</>
	);
}

function TankIllustration() {
	return (
		<>
			<defs>
				<linearGradient id="uci-tank-sky" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="hsl(199 89% 48%)" stop-opacity="0.2" />
					<stop offset="100%" stop-color="hsl(222 47% 8%)" stop-opacity="0.08" />
				</linearGradient>
				<radialGradient id="uci-tank-glow" cx="70%" cy="35%" r="55%">
					<stop offset="0%" stop-color="hsl(199 89% 60%)" stop-opacity="0.34" />
					<stop offset="100%" stop-color="hsl(199 89% 48%)" stop-opacity="0" />
				</radialGradient>
			</defs>
			<rect x="18" y="18" width="284" height="144" rx="28" fill="url(#uci-tank-sky)" />
			<circle cx="228" cy="76" r="38" fill="url(#uci-tank-glow)" />
			<rect x="72" y="46" width="72" height="92" rx="36" fill="hsl(222 47% 8% / 0.96)" />
			<rect
				x="72"
				y="46"
				width="72"
				height="92"
				rx="36"
				fill="none"
				stroke="hsl(199 89% 58% / 0.66)"
				stroke-width="2.5"
			/>
			<path
				d="M98 60v-16M98 60h48"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M84 118c10-11 22-17 35-17 12 0 24 5 33 15"
				fill="none"
				stroke="hsl(171 91% 46% / 0.7)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<rect x="108" y="58" width="80" height="58" rx="18" fill="hsl(222 47% 8% / 0.96)" />
			<path
				d="M116 98h64"
				stroke="hsl(199 89% 58% / 0.66)"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<path
				d="M140 66v32"
				stroke="hsl(45 100% 70% / 1)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M140 82h16"
				stroke="hsl(45 100% 70% / 1)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				d="M188 66l18 16v32"
				fill="none"
				stroke="hsl(199 89% 58% / 0.68)"
				stroke-width="4"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M194 116h24"
				stroke="hsl(199 89% 60%)"
				stroke-width="5"
				stroke-linecap="round"
			/>
			<path
				d="M210 82c12 0 20 9 20 20s-8 20-20 20"
				fill="none"
				stroke="hsl(171 91% 46% / 0.72)"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<circle cx="210" cy="102" r="5" fill="hsl(199 89% 60%)" />
			<path
				d="M62 132h196"
				stroke="hsl(199 89% 58% / 0.28)"
				stroke-width="3"
				stroke-linecap="round"
			/>
		</>
	);
}

export default function UseCaseIllustration(props: UseCaseIllustrationProps) {
	const [local, rest] = splitProps(props, ["kind", "class"]);

	return (
		<svg
			viewBox="0 0 320 180"
			fill="none"
			class={cn("h-36 w-full", local.class)}
			aria-hidden="true"
			{...rest}
		>
			<rect x="18" y="18" width="284" height="144" rx="28" fill="hsl(222 47% 8% / 0.18)" />
			{local.kind === "home" && <HomeIllustration />}
			{local.kind === "garden" && <GardenIllustration />}
			{local.kind === "tank" && <TankIllustration />}
		</svg>
	);
}
