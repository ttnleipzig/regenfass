/* @refresh reload */
import { render } from "solid-js/web";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import { initAnalytics, initColorMode } from "@regenfass/brand";
import App from "./App";
import "./index.css";

initColorMode();

initAnalytics(import.meta.env.VITE_SWETRIX_PROJECT_ID, {
  apiURL: import.meta.env.VITE_SWETRIX_API_URL,
});

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

render(
  () => (
    <>
      <ColorModeScript />
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </>
  ),
  root,
);
