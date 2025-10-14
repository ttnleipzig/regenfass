import { Router, Route } from "@solidjs/router";
import PlaygroundLayout from "./PlaygroundLayout";
import PlaygroundHome from "./PlaygroundHome";
import ComponentRenderer from "./ComponentRenderer";

export default function PlaygroundApp() {
  return (
    <Router>
      <Route path="/playground" component={PlaygroundLayout}>
        <Route path="/" component={PlaygroundHome} />
        <Route path="/:category/:component" component={ComponentRenderer} />
      </Route>
    </Router>
  );
}