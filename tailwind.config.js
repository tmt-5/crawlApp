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
        // Warm print palette; keep in sync with lib/theme.ts.
        ink: "#171511",
        "ink-soft": "#4F493F",
        paper: "#F6ECD6",
        "paper-light": "#FFF9EA",
        cream: "#F3E8CF",
        sand: "#DED0AE",
        ochre: "#F4A927",
        red: "#E84B2C",
        tick: "#BDB197",
      },
      fontFamily: {
        display: ["ArchivoNarrow_700Bold"],
        body: ["Archivo_400Regular"],
        "body-semi": ["Archivo_600SemiBold"],
        "body-bold": ["Archivo_700Bold"],
        mono: ["Cousine_700Bold"],
        "mono-regular": ["Cousine_400Regular"],
      },
    },
  },
  plugins: [],
};
