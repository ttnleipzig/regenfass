import brandPreset from "@regenfass/brand/tailwind.preset.cjs";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [brandPreset],
  darkMode: ["selector", ':is(.dark, [data-kb-theme="dark"])'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../brand/src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};
