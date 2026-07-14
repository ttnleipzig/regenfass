import brandPreset from "@regenfass/brand/tailwind.preset.cjs";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [brandPreset],
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../brand/src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};
