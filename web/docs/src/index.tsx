/* @refresh reload */
import { render } from "solid-js/web";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import App from "./App";
import "./index.css";

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
