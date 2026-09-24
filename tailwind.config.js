/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Last Call" — retro dive-bar print palette.
        paper: "#f4ece0",
        "paper-raised": "#fff8ec",
        bar: "#eadfcd",
        ink: "#241d18",
        "ink-muted": "#8a7a63",
        "ink-body": "#5d5044",
        oxblood: "#8c2f24",
        mustard: "#d9a026",
        slate: "#3f6b5f",
      },
      fontFamily: {
        display: ["AlfaSlabOne_400Regular"],
        body: ["DMSans_400Regular"],
        "body-bold": ["DMSans_700Bold"],
      },
    },
  },
  plugins: [],
};
