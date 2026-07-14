import type { ParentProps } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { Footer, Header } from "@regenfass/brand";
import { DocPage } from "./components/DocPage";
import { HEADER_NAV } from "./lib/nav";

function Shell(props: ParentProps) {
  return (
    <div class="min-h-screen flex flex-col">
      <Header title="Regenfass Docs" navItems={HEADER_NAV} />
      <main class="flex-1 flex flex-col">{props.children}</main>
      <Footer />
    </div>
  );
}

function RoutedDoc() {
  return (
    <Shell>
      <DocPage />
    </Shell>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/" component={RoutedDoc} />
      <Route path="/hardware/sensors" component={RoutedDoc} />
      <Route path="/hardware/esp32" component={RoutedDoc} />
      <Route path="/hardware/lorawan" component={RoutedDoc} />
      <Route path="/lang/de" component={RoutedDoc} />
      <Route path="/lang/es" component={RoutedDoc} />
      <Route path="/lang/fr" component={RoutedDoc} />
      <Route path="/lang/ja" component={RoutedDoc} />
      <Route path="/lang/uk" component={RoutedDoc} />
      <Route path="/lang/zh-CN" component={RoutedDoc} />
      <Route path="/de" component={RoutedDoc} />
      <Route path="*404" component={RoutedDoc} />
    </Router>
  );
}
