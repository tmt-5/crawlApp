// Design tokens for places Tailwind classes can't reach (map layers, DOM
// markers, inline styles). Keep in sync with tailwind.config.js.
export const colors = {
  ink: "#171511",
  inkSoft: "#4F493F",
  paper: "#F6ECD6",
  paperLight: "#FFF9EA",
  cream: "#F3E8CF",
  sand: "#DED0AE",
  ochre: "#F4A927",
  red: "#E84B2C",
  tick: "#BDB197",
} as const;

export const fonts = {
  display: "ArchivoNarrow_700Bold",
  body: "Archivo_400Regular",
  bodyBold: "Archivo_700Bold",
  mono: "Cousine_700Bold",
} as const;

// The flat offset "print" shadow used on a few accent elements: map controls,
// the stop ticket and ochre action chips. Everything else is flat.
export const hardShadow = { boxShadow: `3px 3px 0px ${colors.ink}` } as const;
