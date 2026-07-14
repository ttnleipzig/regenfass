/* @refresh reload */
import { render } from "solid-js/web";

import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// In maplibre 6.x the ESM build resolves its worker URL relative to its own
// module URL. Vite's optimizeDeps puts maplibre under /node_modules/.vite/deps
// but does not place the worker file there, so the auto-resolved URL 404s and
// tiles silently fail to load. Importing the worker with the `?url` suffix
// gives us a real URL we can hand to `setWorkerUrl`.
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { Protocol } from "pmtiles";
import App from "./App";
import "./index.css";

maplibre.setWorkerUrl(workerUrl);

// Register the pmtiles:// protocol exactly once at app start so any maplibre
// instance can read PMTiles archives via byte-range HTTP requests. The
// `metadata: true` option makes pmtiles emit a full TileJSON (including
// `vector_layers`) when maplibre fetches the source URL — maplibre 6.x marks a
// vector source as "loaded" only after it sees that field.
maplibre.addProtocol("pmtiles", new Protocol({ metadata: true }).tile);

// Initialize theme from localStorage or system preference
(() => {
	try {
		const saved = localStorage.getItem("theme");
		const prefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		const isDark = saved ? saved === "dark" : prefersDark;
		const root = document.documentElement;
		root.classList.toggle("dark", isDark);
		root.setAttribute("data-kb-theme", isDark ? "dark" : "light");
	} catch {}
})();

const root = document.getElementById("root");

render(() => <App />, root!);
