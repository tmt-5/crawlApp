import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

// Minimal light basemap in the paper palette, drawn from OpenFreeMap's
// OpenMapTiles vector tiles. Everything that isn't needed to find your way
// between bars (shops, transit stops, most labels) is left out.

// Slightly greyer than the page cream so the light streets stand out.
const PAPER = "#E9E1CE";
const RAISED = "#FBF4E2";
const INK_MUTED = "#68604F";
const SLATE = "#5F6F56";

const TILES = "https://tiles.openfreemap.org/planet";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

const zoomWidth = (stops: [number, number][]): ExpressionSpecification => [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  ...stops.flat(),
];

const MINOR_ROADS = ["minor", "service", "track", "raceway"];
const MAJOR_ROADS = ["primary", "secondary", "tertiary", "trunk", "motorway"];

export const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    openmaptiles: { type: "vector", url: TILES },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": PAPER } },
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: { "fill-color": SLATE, "fill-opacity": 0.1 },
    },
    {
      id: "landcover-green",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["match", ["get", "class"], ["wood", "grass"], true, false],
      paint: { "fill-color": SLATE, "fill-opacity": 0.08 },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: { "fill-color": "#C9D1C2" },
    },
    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-color": "#DED4BC",
        "fill-outline-color": "#CFC3A6",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.5, 1],
      },
    },
    {
      id: "railway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 13,
      filter: ["all", ["match", ["get", "class"], ["rail", "transit"], true, false], ["!=", ["get", "brunnel"], "tunnel"]],
      paint: { "line-color": "#CFC3A6", "line-width": 1, "line-dasharray": [3, 3] },
    },
    {
      id: "path",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 15,
      filter: ["all", ["==", ["get", "class"], "path"], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": RAISED, "line-width": zoomWidth([[15, 1], [18, 3]]) },
    },
    {
      id: "road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["all", ["match", ["get", "class"], MINOR_ROADS, true, false], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": RAISED, "line-width": zoomWidth([[13, 0.5], [16, 5], [19, 18]]) },
    },
    {
      id: "road-major-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["all", ["match", ["get", "class"], MAJOR_ROADS, true, false], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#D8CDB2", "line-width": zoomWidth([[11, 1.5], [16, 11], [19, 28]]) },
    },
    {
      id: "road-major",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["all", ["match", ["get", "class"], MAJOR_ROADS, true, false], ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": RAISED, "line-width": zoomWidth([[11, 0.8], [16, 8], [19, 24]]) },
    },
    {
      id: "water-name",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "water_name",
      filter: ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Italic"],
        "text-size": 11,
      },
      paint: { "text-color": SLATE, "text-halo-color": PAPER, "text-halo-width": 1 },
    },
    {
      id: "street-name",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      minzoom: 15,
      filter: ["match", ["get", "class"], [...MAJOR_ROADS, "minor"], true, false],
      layout: {
        "symbol-placement": "line",
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
      },
      paint: { "text-color": INK_MUTED, "text-halo-color": PAPER, "text-halo-width": 1.5 },
    },
    {
      id: "neighbourhood-name",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 12,
      maxzoom: 16,
      filter: ["match", ["get", "class"], ["suburb", "quarter", "neighbourhood"], true, false],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Bold"],
        "text-size": 11,
        "text-transform": "uppercase",
        "text-letter-spacing": 0.2,
      },
      paint: { "text-color": INK_MUTED, "text-halo-color": PAPER, "text-halo-width": 1.5 },
    },
  ],
};
