import { Router, Route } from "@solidjs/router";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import PlaygroundLayout from "./PlaygroundLayout";
import PlaygroundHome from "./PlaygroundHome";
import ComponentRenderer from "./ComponentRenderer";

export default function PlaygroundApp() {
  return (
    <>
      <ColorModeScript />
      <ColorModeProvider>
        <Router>
          <Route path="/playground" component={PlaygroundLayout}>
            <Route path="/" component={PlaygroundHome} />
            <Route path="/:category/:component" component={ComponentRenderer} />
          </Route>
        </Router>
      </ColorModeProvider>
    </>
  );
}