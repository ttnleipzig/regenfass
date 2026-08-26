import { Route, Router } from "@solidjs/router";
import { ButtonToggleSound, Header } from "@regenfass/brand";
import type { ParentProps } from "solid-js";
import {
  PlaygroundComponentPage,
  PlaygroundHomePage,
  PlaygroundLayout,
  TokensPage,
  findFirstPlaygroundSlug,
} from "./playground/Playground";

function Shell(props: ParentProps) {
  return (
    <div class="min-h-screen flex flex-col">
      <Header
        title="Regenfass"
        titleSuffix="Playground"
        fullWidth
        navPosition="left"
        navItems={[
          {
            href: `/${findFirstPlaygroundSlug()}`,
            label: "Components",
          },
          { href: "https://docs.regenfass.eu/", label: "Docs", external: true },
          { href: "https://install.regenfass.eu", label: "Installer", external: true },
          {
            href: "https://github.com/ttnleipzig/regenfass",
            label: "GitHub",
            external: true,
          },
        ]}
        trailing={<ButtonToggleSound />}
      />

      <div class="flex-1">{props.children}</div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={Shell}>
        <Route path="/" component={PlaygroundLayout}>
          <Route path="/" component={PlaygroundHomePage} />
          <Route path="/tokens" component={TokensPage} />
          <Route path="/:slug" component={PlaygroundComponentPage} />
        </Route>
      </Route>
    </Router>
  );
}
