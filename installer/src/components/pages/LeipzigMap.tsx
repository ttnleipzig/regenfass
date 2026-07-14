import { Component, For, JSX } from "solid-js";
import { Map, Marker } from "solid-maplibre";
import { layers, namedFlavor } from "@protomaps/basemaps";
import type { StyleSpecification } from "maplibre-gl";

const PMTILES_URL = "pmtiles:///leipzig.pmtiles";

const LEIPZIG_CENTER: [number, number] = [12.3731, 51.3397];

const style: StyleSpecification = {
  version: 8,
  glyphs:
    "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite:
    "https://protomaps.github.io/basemaps-assets/sprites/v4/dark",
  sources: {
    protomaps: {
      type: "vector",
      url: PMTILES_URL,
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: layers("protomaps", namedFlavor("dark"), { lang: "de" }),
};

export type MapPin = {
  id: string;
  lngLat: [number, number];
  active?: boolean;
};

// Build a marker DOM element. Solid JSX expressions for native tags evaluate
// to real DOM nodes, so we can hand them directly to maplibre's Marker via
// the `element` option.
function pinElement(active: boolean, onClick: () => void): HTMLElement {
  const fill = active ? "#ffffff" : "#020817";
  const bg = active ? "#1d4ed8" : "#ffffff";
  return (
    <div class="cursor-pointer" onClick={onClick}>
      <div
        class="size-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{
          "background-color": bg,
          "box-shadow": active
            ? "0 6px 5px rgba(0,0,0,0.75)"
            : "0 2px 4px rgba(0,0,0,0.35)",
        }}
      >
        <svg viewBox="0 0 20 32" class="h-7 w-[18px]" fill={fill} aria-hidden="true">
          <path d="M10 0 C4 9 0 16 0 22 a10 10 0 0 0 20 0 C20 16 16 9 10 0 Z" />
        </svg>
      </div>
    </div>
  ) as unknown as HTMLElement;
}

type Props = {
  pins: MapPin[];
  onPinClick?: (id: string) => void;
  class?: string;
  style?: JSX.CSSProperties;
};

const LeipzigMap: Component<Props> = (props) => {
  return (
    <Map
      class={props.class}
      style={props.style ?? { width: "100%", height: "100%" }}
      options={{
        style,
        center: LEIPZIG_CENTER,
        zoom: 12.5,
        attributionControl: { compact: true },
      }}
    >
      <For each={props.pins}>
        {(pin) => (
          <Marker
            position={pin.lngLat}
            element={pinElement(!!pin.active, () => props.onPinClick?.(pin.id))}
          />
        )}
      </For>
    </Map>
  );
};

export default LeipzigMap;
