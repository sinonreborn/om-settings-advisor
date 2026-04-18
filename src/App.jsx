import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   OM SETTINGS ADVISOR v2
   Dark glass theme · OM-1 + DJI · lens tabs with TC toggle
   ═══════════════════════════════════════════════════════════════ */

/* ─── LENS DB (with TC compatibility flag) ─── */
const LENS_DB = [
  { id: "7-14f28",    name: "7-14mm f/2.8 PRO",        short: "7-14 PRO",    equiv: "14-28mm",    type: "zoom",  maxAp: 2.8, syncIS: false, tc: false, cat: "Ultra Wide Zoom" },
  { id: "8-25f4",     name: "8-25mm f/4 PRO",          short: "8-25 PRO",    equiv: "16-50mm",    type: "zoom",  maxAp: 4,   syncIS: false, tc: false, cat: "Wide Zoom" },
  { id: "12-40f28",   name: "12-40mm f/2.8 PRO II",    short: "12-40 PRO",   equiv: "24-80mm",    type: "zoom",  maxAp: 2.8, syncIS: true,  tc: false, cat: "Standard Zoom" },
  { id: "12-100f4",   name: "12-100mm f/4 IS PRO",     short: "12-100 PRO",  equiv: "24-200mm",   type: "zoom",  maxAp: 4,   syncIS: true,  tc: false, cat: "All-in-one" },
  { id: "40-150f28",  name: "40-150mm f/2.8 PRO",      short: "40-150 f/2.8",equiv: "80-300mm",   type: "zoom",  maxAp: 2.8, syncIS: false, tc: true,  cat: "Tele Zoom" },
  { id: "40-150f4",   name: "40-150mm f/4 PRO",        short: "40-150 f/4",  equiv: "80-300mm",   type: "zoom",  maxAp: 4,   syncIS: false, tc: true,  cat: "Compact Tele" },
  { id: "100-400f5-63", name: "100-400mm f/5-6.3 IS",  short: "100-400",     equiv: "200-800mm",  type: "zoom",  maxAp: 5,   syncIS: true,  tc: true,  cat: "Super Tele" },
  { id: "150-400f45", name: "150-400mm f/4.5 TC IS PRO",short: "150-400 PRO",equiv: "300-1000mm", type: "zoom",  maxAp: 4.5, syncIS: true,  tc: true,  cat: "Super Tele PRO" },
  { id: "17f12",      name: "17mm f/1.2 PRO",          short: "17mm f/1.2",  equiv: "34mm",       type: "prime", maxAp: 1.2, syncIS: false, tc: false, cat: "Wide Prime" },
  { id: "17f18",      name: "17mm f/1.8",              short: "17mm f/1.8",  equiv: "34mm",       type: "prime", maxAp: 1.8, syncIS: false, tc: false, cat: "Wide Prime" },
  { id: "20f14",      name: "20mm f/1.4 PRO",          short: "20mm f/1.4",  equiv: "40mm",       type: "prime", maxAp: 1.4, syncIS: false, tc: false, cat: "Wide Prime" },
  { id: "25f12",      name: "25mm f/1.2 PRO",          short: "25mm f/1.2",  equiv: "50mm",       type: "prime", maxAp: 1.2, syncIS: false, tc: false, cat: "Standard Prime" },
  { id: "25f18",      name: "25mm f/1.8",              short: "25mm f/1.8",  equiv: "50mm",       type: "prime", maxAp: 1.8, syncIS: false, tc: false, cat: "Standard Prime" },
  { id: "45f12",      name: "45mm f/1.2 PRO",          short: "45mm f/1.2",  equiv: "90mm",       type: "prime", maxAp: 1.2, syncIS: false, tc: false, cat: "Portrait Prime" },
  { id: "45f18",      name: "45mm f/1.8",              short: "45mm f/1.8",  equiv: "90mm",       type: "prime", maxAp: 1.8, syncIS: false, tc: false, cat: "Portrait Prime" },
  { id: "75f18",      name: "75mm f/1.8",              short: "75mm f/1.8",  equiv: "150mm",      type: "prime", maxAp: 1.8, syncIS: false, tc: false, cat: "Tele Prime" },
  { id: "300f4",      name: "300mm f/4 IS PRO",        short: "300 PRO",     equiv: "600mm",      type: "prime", maxAp: 4,   syncIS: true,  tc: true,  cat: "Super Tele Prime" },
  { id: "30f35m",     name: "30mm f/3.5 Macro",        short: "30mm Macro",  equiv: "60mm",       type: "prime", maxAp: 3.5, syncIS: false, tc: false, cat: "Macro" },
  { id: "60f28m",     name: "60mm f/2.8 Macro",        short: "60mm Macro",  equiv: "120mm",      type: "prime", maxAp: 2.8, syncIS: false, tc: false, cat: "Macro" },
  { id: "90f35m",     name: "90mm f/3.5 Macro IS PRO", short: "90 Macro",    equiv: "180mm",      type: "prime", maxAp: 3.5, syncIS: true,  tc: true,  cat: "Macro PRO" },
];

const STORAGE_KEY = "om-advisor-kit-v2";
const DEFAULT_KIT = ["12-100f4", "100-400f5-63", "45f12", "17f12"];

/* ─── TC OPTIONS ─── */
const TC_OPTIONS = [
  { id: "none", label: "No TC",   stop: 0, mult: 1,   short: "" },
  { id: "mc14", label: "MC-14",   stop: 1, mult: 1.4, short: " +MC-14" },
  { id: "mc20", label: "MC-20",   stop: 2, mult: 2,   short: " +MC-20" },
];

/* ─── OM-1 SCENARIOS ─── */
const OM_MODES = [
  { id: "animals",    icon: "🐾",  label: "Animals",    sub: "Cats, dogs, foxes" },
  { id: "birds",      icon: "🦅",  label: "Birds",      sub: "Perched to in-flight" },
  { id: "landscape",  icon: "🏔️", label: "Landscape",  sub: "Weather-led" },
  { id: "macro",      icon: "🌿",  label: "Macro",      sub: "Close-up, textures" },
  { id: "portrait",   icon: "👤",  label: "Portrait",   sub: "People, rescue cats" },
  { id: "night",      icon: "🌌",  label: "Night",      sub: "Stars, low light" },
];

const ANIMALS = [
  { id: "cat",      label: "Cat",       icon: "🐱", tag: "Indoor or out" },
  { id: "dog",      label: "Dog",       icon: "🐕", tag: "Park walks to zoomies" },
  { id: "squirrel", label: "Squirrel",  icon: "🐿️", tag: "Twitchy, fast" },
  { id: "fox",      label: "Fox",       icon: "🦊", tag: "Dawn, garden" },
  { id: "deer",     label: "Deer",      icon: "🦌", tag: "Distant, cautious" },
  { id: "rabbit",   label: "Rabbit",    icon: "🐇", tag: "Quick to bolt" },
  { id: "hedgehog", label: "Hedgehog",  icon: "🦔", tag: "Night shuffler" },
  { id: "other",    label: "Other",     icon: "🐾", tag: "Something else" },
];

const ANIMAL_BEH = [
  { id: "chill",  label: "Chilling",     desc: "Still, relaxed, grooming" },
  { id: "potter", label: "Pottering",    desc: "Slow wander, exploring" },
  { id: "move",   label: "On the move",  desc: "Walking, trotting" },
  { id: "send",   label: "Full send",    desc: "Running, chasing" },
];

const BIRDS = [
  { id: "garden",    label: "Garden Bird",  icon: "🐦",    tag: "Robin, tit, wren" },
  { id: "raptor",    label: "Raptor",       icon: "🦅",    tag: "Hawk, kestrel, buzzard" },
  { id: "owl",       label: "Owl",          icon: "🦉",    tag: "Low light" },
  { id: "waterfowl", label: "Waterfowl",    icon: "🦆",    tag: "Duck, goose, swan" },
  { id: "wader",     label: "Wader",        icon: "🦩",    tag: "Heron, curlew" },
  { id: "seabird",   label: "Seabird",      icon: "🕊️",   tag: "Gull, tern" },
  { id: "corvid",    label: "Corvid",       icon: "🐦‍⬛", tag: "Crow, magpie, jay" },
  { id: "other",     label: "Other",        icon: "🪶",    tag: "Something else" },
];

const BIRD_SC = [
  { id: "still",  label: "Perched",         desc: "Still, looking around",      d: "EASY" },
  { id: "ready",  label: "Alert",           desc: "Might go any second",        d: "READY" },
  { id: "feed",   label: "Feeding",         desc: "Head down, pausing",         d: "EASY" },
  { id: "swim",   label: "On water",        desc: "Floating calmly",            d: "EASY" },
  { id: "swim_r", label: "Water, restless", desc: "Wings flapping",             d: "READY" },
  { id: "soar",   label: "Soaring",         desc: "Slow circles, thermals",     d: "TRACK" },
  { id: "fast",   label: "In flight",       desc: "Fast flapping, diving",      d: "HARD" },
];

const LANDS = [
  { id: "vista",   label: "Wide Vista",      icon: "🏔️", desc: "Hills, valleys, sky" },
  { id: "wood",    label: "Woodland",        icon: "🌲", desc: "Trees, dappled light" },
  { id: "water",   label: "Water Feature",   icon: "💧", desc: "Streams, lakes, coast" },
  { id: "urban",   label: "Urban",           icon: "🏙️", desc: "Buildings, structures" },
  { id: "golden",  label: "Golden Hour",     icon: "🌅", desc: "Dramatic light" },
  { id: "long",    label: "Long Exposure",   icon: "🌊", desc: "Silky water, trails" },
];

const MACRO_SC = [
  { id: "flowers",  label: "Flowers",        desc: "Outdoor, light breeze OK" },
  { id: "insects",  label: "Insects",        desc: "Fast, unpredictable" },
  { id: "textures", label: "Textures",       desc: "Frost, moss, fungi, bark" },
  { id: "product",  label: "Product/Still",  desc: "Indoor, controlled" },
];

const PORTRAIT_SC = [
  { id: "shelter_cat",  label: "Shelter Cat",   desc: "Silk Cat Rescue sessions" },
  { id: "people",       label: "Person",        desc: "Outdoor or indoor" },
  { id: "kittens",      label: "Kittens",       desc: "Oska, Nyx — low light indoor" },
  { id: "env_portrait", label: "Environmental", desc: "Subject in context" },
];

const NIGHT_SC = [
  { id: "stars",     label: "Stars / Milky Way", desc: "Starry Sky AF territory" },
  { id: "lowlight",  label: "Low Light Indoor",  desc: "Cats, home, handheld" },
  { id: "composite", label: "Live Composite",    desc: "Trails, light painting" },
  { id: "urban_n",   label: "Urban Night",       desc: "Streetlights, reflections" },
];

/* ─── DJI SCENARIOS ─── */
const DJI_MODES = [
  { id: "aerial_land",   icon: "🏞️", label: "Aerial Landscape", sub: "Scenery from above" },
  { id: "architecture",  icon: "🏛️", label: "Architecture",     sub: "Buildings, patterns" },
  { id: "above_subj",    icon: "🔍",  label: "Subject From Above",sub: "People, wildlife, cars" },
  { id: "orbit",         icon: "🌀",  label: "Orbit / Circle",   sub: "Point of interest spin" },
  { id: "reveal",        icon: "✨",  label: "Reveal Shot",       sub: "Dramatic pull-back" },
  { id: "hyperlapse",    icon: "⏱️", label: "Hyperlapse",        sub: "Time-compressed motion" },
];

const DJI_OUTPUT = [
  { id: "photo_single",  label: "Single Photo",   icon: "📷" },
  { id: "photo_aeb",     label: "AEB Bracket",    icon: "📸" },
  { id: "photo_pano",    label: "Panorama",       icon: "🌅" },
  { id: "video_cine",    label: "Cinematic Video",icon: "🎬" },
  { id: "video_smooth",  label: "Smooth Video",   icon: "🎥" },
  { id: "video_slow",    label: "Slow Motion",    icon: "🐢" },
];

const DJI_COMPLEXITY = [
  { id: "easy",   label: "Keep it easy",    desc: "Auto-assisted, fewer decisions" },
  { id: "try",    label: "Try something",   desc: "Semi-manual, new territory" },
];

/* ─── KNOWLEDGE BASE ─── */
const KB_OM = `OM SYSTEM OM-1 Mark II reference:
- 20.4MP Stacked BSI, ISO 200-25600 native (usable to ~32000 with Lightroom AI Denoise)
- 5-axis IBIS (7 stops body, 8.5 Sync IS on compatible lenses)
- Stacked sensor: electronic shutter to 1/32000s, no flash sync on electronic
- Mechanical shutter flash sync: 1/250s max

DRIVE MODES: SH2 12.5-50fps C-AF+AE maintained (best action). SH1 120fps AF first-frame only. Pro Capture H (SH2-based, continuous AF). Pro Capture L (SH1-based, first-frame AF only). Pro Capture ideal for one-handed shelter shooting.

AF: Subject Detection supports Bird, Cats & Dogs, Human, Cars/Trains/Planes. C-AF+Tracking automatically disabled when Subject Detection ON (Mark II behaviour). Toggle Subject Detection via assigned button for quick fallback.

SYNC IS LENSES (8.5 stops): 12-40 f/2.8 PRO II, 12-100 f/4 IS PRO, 100-400 IS, 150-400 IS PRO, 90mm f/3.5 Macro IS PRO.

TELECONVERTERS: MC-14 (1 stop penalty), MC-20 (2 stop penalty). Compatible only with 40-150 f/2.8 PRO, 40-150 f/4 PRO, 100-400 IS, 150-400 IS PRO, 300mm f/4 IS PRO, 90mm Macro IS PRO. Strictly sunny-day use for the 100-400 + MC-20 (f/10-12.6 at long end).

HIGH ISO: James has confirmed OM-1 II handles ISO 32000-40000 cleanly when processed through Lightroom AI Denoise on M4 Max Mac. Do not conservatively cap ISO at 6400.

APERTURE PRAGMATICS (for James): f/1.2 DoF too shallow for reliable hits on moving subjects. f/2 is the default for action at f/1.2 primes; f/1.2 reserved for static deliberate shots.`;

const KB_DJI = `DJI Mini 4 Pro reference:
- 1/1.3" sensor, 24mm equiv f/1.7 fixed aperture
- Shutter 1/16000s electronic to 2s
- 4K/100fps, 1080p/200fps slow-mo
- Takeoff weight under 249g (no registration most jurisdictions)
- Wind resistance: level 5 (up to 10.7 m/s ≈ 38 km/h)
- Do not fly above 20 km/h sustained wind (risky), grounded above 30 km/h

PHOTO: Auto (default), Pro (manual controls). AEB bracket for HDR scenes. Panorama modes: Sphere, 180°, Wide-angle, Vertical.

VIDEO: D-Log M colour for grading flexibility (needs post work). Normal for direct output. 180° shutter rule: shutter = 1/(framerate × 2). ND filters recommended bright conditions (ND8/16/32/64).

SIMPLICITY: For someone learning, Auto photo + Normal colour + no ND is totally valid. Pro mode and D-Log M worth trying on controlled sunny days.`;

/* ─── STYLES / TOKENS ─── */
const FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=DotGothic16&display=swap";

const T = {
  bg:        "#0c0a08",
  bgWarm:    "#15120f",
  surface:   "#141210",
  surfaceHi: "#1c1814",
  surfaceAc: "#231d16",
  stroke:    "rgba(255, 240, 220, 0.06)",
  strokeHi:  "rgba(232, 208, 160, 0.18)",
  strokeAct: "rgba(232, 208, 160, 0.38)",
  gold:      "#e8d0a0",
  goldSoft:  "#c8b088",
  goldDim:   "#8a7a5e",
  amber:     "#d4a574",
  text:      "#ecebe8",
  textMid:   "#7a7872",
  textDim:   "#56544e",
  textFaint: "#3a3834",
  grn:       "#80c88a",
  blu:       "#80b4c8",
  red:       "#e06050",
  wrn:       "#c8a860",
  violet:    "#a898c8",
};

const FONT_DISPLAY = "'DotGothic16', monospace";
const FONT_MONO    = "'JetBrains Mono', monospace";
const FONT_SANS    = "'Inter', sans-serif";

/* ─── ATMOSPHERIC BACKGROUND ─── */
function AtmoBg() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(216, 168, 96, 0.04) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 100%, rgba(120, 96, 72, 0.04) 0%, transparent 55%),
        #0c0a08
      `,
    }}>
      {/* dotted texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(232, 208, 160, 0.035) 1px, transparent 0)`,
        backgroundSize: "16px 16px",
        opacity: 1,
      }} />
    </div>
  );
}

/* ─── SUN MATHS ─── */
// Computes sun azimuth (compass direction from N, clockwise) and altitude (degrees above horizon)
// Based on Jean Meeus, Astronomical Algorithms (simplified). Accurate to ~1°.
function sunPosition(date, lat, lon) {
  const rad = Math.PI / 180;
  const dayMs = 1000 * 60 * 60 * 24;
  const J1970 = 2440588;
  const J2000 = 2451545;
  const toJulian = d => d.valueOf() / dayMs - 0.5 + J1970;
  const toDays = d => toJulian(d) - J2000;

  const e = rad * 23.4397;
  const d = toDays(date);

  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372;
  const L = M + C + P + Math.PI;

  const dec = Math.asin(Math.sin(0) * Math.cos(e) + Math.cos(0) * Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.sin(L) * Math.cos(e) - Math.tan(0) * Math.sin(e), Math.cos(L));

  const lw = rad * -lon;
  const phi = rad * lat;
  const siderealTime = rad * (280.16 + 360.9856235 * d) - lw;
  const H = siderealTime - ra;

  const altitude = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const azimuth = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));

  // Convert azimuth to compass degrees (0 = N, 90 = E, etc.)
  let azDeg = (azimuth * 180 / Math.PI + 180) % 360;
  const altDeg = altitude * 180 / Math.PI;
  return { azimuth: azDeg, altitude: altDeg };
}

// Returns a ~24-hour arc of sun positions for sketching the sun path
function sunArc(date, lat, lon) {
  const pts = [];
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  for (let h = 0; h <= 24; h += 0.5) {
    const t = new Date(start.getTime() + h * 3600 * 1000);
    pts.push({ t, ...sunPosition(t, lat, lon) });
  }
  return pts;
}

// Sunrise / sunset estimation
function sunEvents(date, lat, lon) {
  const arc = sunArc(date, lat, lon);
  let sunrise = null, sunset = null;
  for (let i = 1; i < arc.length; i++) {
    if (arc[i - 1].altitude < 0 && arc[i].altitude >= 0) sunrise = arc[i].t;
    if (arc[i - 1].altitude >= 0 && arc[i].altitude < 0) sunset = arc[i - 1].t;
  }
  return { sunrise, sunset };
}

/* ─── PIN STORAGE ─── */
const PINS_KEY = "om-advisor-pins-v2";
const ACTIVE_PIN_KEY = "om-advisor-active-pin-v2";
const DEFAULT_LOCATION = { lat: 53.41, lon: -2.16, label: "Stockport" };

function usePins() {
  const [pins, setPinsState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(PINS_KEY));
      return Array.isArray(s) ? s : [];
    } catch { return []; }
  });
  const setPins = useCallback((next) => {
    setPinsState(next);
    try { localStorage.setItem(PINS_KEY, JSON.stringify(next)); } catch {}
  }, []);
  return [pins, setPins];
}

function useActivePin(pins) {
  const [activeId, setActiveIdState] = useState(() => {
    try { return localStorage.getItem(ACTIVE_PIN_KEY); } catch { return null; }
  });
  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
    try {
      if (id) localStorage.setItem(ACTIVE_PIN_KEY, id);
      else localStorage.removeItem(ACTIVE_PIN_KEY);
    } catch {}
  }, []);
  const active = pins.find(p => p.id === activeId) || null;
  return [active, setActiveId];
}

/* ─── MAPLIBRE LAZY LOADER ─── */
let mapLibrePromise = null;
function loadMapLibre() {
  if (typeof window === "undefined") return Promise.reject("no window");
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (mapLibrePromise) return mapLibrePromise;

  mapLibrePromise = new Promise((resolve, reject) => {
    // Load CSS
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/maplibre-gl@5.1.1/dist/maplibre-gl.css";
    document.head.appendChild(css);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@5.1.1/dist/maplibre-gl.js";
    script.onload = () => {
      if (window.maplibregl) resolve(window.maplibregl);
      else reject("maplibregl not available after load");
    };
    script.onerror = () => reject("failed to load maplibre-gl");
    document.head.appendChild(script);
  });
  return mapLibrePromise;
}

/* ─── MAP PANEL ─── */
function MapPanel({ center, pins, activePin, onSelectPin, onAddPin, weather, onOpenPins }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Sun position & arc for the CURRENT time at the active pin (or center)
  const lat = activePin?.lat ?? center.lat;
  const lon = activePin?.lon ?? center.lon;
  const now = new Date();
  const sun = sunPosition(now, lat, lon);
  const { sunrise, sunset } = sunEvents(now, lat, lon);
  const wind = weather ? { speed: weather.windspeed, dir: weather.winddirection || 0 } : null;

  // Initialize map once
  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((ml) => {
        if (cancelled || !containerRef.current) return;
        const map = new ml.Map({
          container: containerRef.current,
          style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
          center: [center.lon, center.lat],
          zoom: 12,
          attributionControl: false,
          pitchWithRotate: false,
          dragRotate: false,
        });
        map.addControl(new ml.AttributionControl({ compact: true }), "bottom-right");
        map.on("load", () => {
          if (!cancelled) { mapRef.current = map; setReady(true); }
        });
        map.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          onAddPin({ lat, lon: lng });
        });
      })
      .catch((err) => { if (!cancelled) setError(String(err)); });

    return () => {
      cancelled = true;
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-centre on active pin when it changes
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const target = activePin ? [activePin.lon, activePin.lat] : [center.lon, center.lat];
    mapRef.current.easeTo({ center: target, duration: 600 });
  }, [activePin?.id, activePin?.lat, activePin?.lon, ready, center.lat, center.lon]);

  // Render/update pin markers
  useEffect(() => {
    if (!ready || !mapRef.current || !window.maplibregl) return;
    markersRef.current.forEach(m => { try { m.remove(); } catch {} });
    markersRef.current = [];
    pins.forEach(p => {
      const el = document.createElement("div");
      const isActive = activePin?.id === p.id;
      el.style.cssText = `
        width: ${isActive ? 22 : 14}px;
        height: ${isActive ? 22 : 14}px;
        border-radius: 50%;
        background: ${isActive ? "#e8d0a0" : "rgba(232, 208, 160, 0.7)"};
        border: 2px solid ${isActive ? "#1a1410" : "rgba(26, 20, 16, 0.6)"};
        box-shadow: 0 0 0 ${isActive ? 6 : 0}px rgba(232, 208, 160, 0.2), 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: all 0.2s;
      `;
      el.title = p.label || "Unnamed pin";
      el.onclick = (e) => { e.stopPropagation(); onSelectPin(p.id); };
      const marker = new window.maplibregl.Marker({ element: el })
        .setLngLat([p.lon, p.lat])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [pins, activePin?.id, ready, onSelectPin]);

  // Build overlay: sun direction indicator + wind arrow
  const hasSun = sun.altitude > -6;
  const sunAngleCSS = sun.azimuth; // 0 = N, 90 = E. We render on top of the map with same convention.
  const windAngleCSS = wind?.dir ?? 0; // open-meteo: direction wind is blowing FROM

  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...glass("bri"), padding: 0 }}>
      <div ref={containerRef} style={{ width: "100%", height: 260, background: "#0a0a0c" }} />

      {/* Loading overlay */}
      {!ready && !error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(10, 10, 12, 0.9)", backdropFilter: "blur(6px)",
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textDim,
          flexDirection: "column", gap: 8,
        }}>
          <div style={{
            width: 20, height: 20,
            border: `2px solid ${T.stroke}`, borderTop: `2px solid ${T.gold}`,
            borderRadius: "50%", animation: "spin .8s linear infinite",
          }} />
          Loading map…
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(10, 10, 12, 0.9)",
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.red,
          textAlign: "center", padding: 20,
        }}>
          Map unavailable.<br/>Check your connection.
        </div>
      )}

      {/* Top-left: active pin label & pins button */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10,
        display: "flex", gap: 6, alignItems: "flex-start", justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        <div style={{
          ...glass("bri"),
          padding: "6px 10px", borderRadius: 10, maxWidth: "65%",
          pointerEvents: "auto",
        }}>
          <div style={{
            fontSize: 8, textTransform: "uppercase", letterSpacing: "0.14em",
            color: T.textDim, fontFamily: "'JetBrains Mono', monospace", marginBottom: 1,
          }}>{activePin ? "active pin" : "viewing"}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activePin?.label || "Unnamed"}
            {!activePin && (center.label || "Stockport")}
          </div>
        </div>
        <button onClick={onOpenPins} style={{
          ...glass("bri"),
          padding: "8px 12px", borderRadius: 10, cursor: "pointer",
          color: T.gold, fontSize: 11, fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", alignItems: "center", gap: 5,
          pointerEvents: "auto", borderColor: T.strokeHi,
        }}>
          📍 {pins.length}
        </button>
      </div>

      {/* Bottom overlay: sun + wind indicators */}
      {ready && (
        <div style={{
          position: "absolute", bottom: 10, left: 10, right: 10,
          display: "flex", gap: 6, pointerEvents: "none",
        }}>
          {/* Sun indicator */}
          <div style={{
            ...glass("bri"),
            flex: 1, padding: "7px 10px", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
              <svg viewBox="-14 -14 28 28" style={{ width: "100%", height: "100%" }}>
                <circle r="13" fill="rgba(255,255,255,0.04)" stroke="rgba(232,208,160,0.2)" strokeWidth="0.5"/>
                <text x="0" y="-9.5" fontSize="4" fill={T.textDim} fontFamily="monospace" textAnchor="middle">N</text>
                <text x="10" y="1.5" fontSize="4" fill={T.textDim} fontFamily="monospace" textAnchor="middle">E</text>
                <text x="0" y="12" fontSize="4" fill={T.textDim} fontFamily="monospace" textAnchor="middle">S</text>
                <text x="-10" y="1.5" fontSize="4" fill={T.textDim} fontFamily="monospace" textAnchor="middle">W</text>
                {hasSun && (() => {
                  const r = 10;
                  const a = (sunAngleCSS - 90) * Math.PI / 180;
                  const x = r * Math.cos(a);
                  const y = r * Math.sin(a);
                  return (
                    <g>
                      <line x1="0" y1="0" x2={x} y2={y} stroke="#f4d890" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx={x} cy={y} r="2.2" fill="#f4d890"/>
                    </g>
                  );
                })()}
                {!hasSun && <circle r="2" fill={T.violet} opacity="0.5"/>}
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 9, color: T.textDim, fontFamily: FONT_MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Sun
              </div>
              <div style={{ fontSize: 13, color: hasSun ? T.wrn : T.violet, fontFamily: FONT_DISPLAY, lineHeight: 1.1, marginTop: 2 }}>
                {hasSun
                  ? `${compassDir(sun.azimuth)} ${Math.round(sun.altitude)}°`
                  : "Below horizon"}
              </div>
            </div>
          </div>

          {/* Wind indicator */}
          {wind && (
            <div style={{
              ...glass("bri"),
              flex: 1, padding: "7px 10px", borderRadius: 10,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                <svg viewBox="-14 -14 28 28" style={{ width: "100%", height: "100%" }}>
                  <circle r="13" fill="rgba(255,255,255,0.04)" stroke="rgba(128,180,200,0.2)" strokeWidth="0.5"/>
                  {/* Wind arrow — rotate to wind direction. open-meteo reports direction FROM which wind blows. */}
                  <g transform={`rotate(${windAngleCSS})`}>
                    <line x1="0" y1="9" x2="0" y2="-7" stroke={T.blu} strokeWidth="1.4" strokeLinecap="round"/>
                    <polygon points="0,-10 -2.5,-5 2.5,-5" fill={T.blu}/>
                  </g>
                </svg>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 9, color: T.textDim, fontFamily: FONT_MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Wind
                </div>
                <div style={{ fontSize: 13, color: T.blu, fontFamily: FONT_DISPLAY, lineHeight: 1.1, marginTop: 2 }}>
                  {compassDir(wind.dir)} {Math.round(wind.speed)}km/h
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function compassDir(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}

/* ─── PINS PANEL ─── */
function PinsPanel({ pins, setPins, activePinId, setActivePinId, onClose }) {
  const [editing, setEditing] = useState(null); // {id, label} while being renamed

  const startRename = (pin) => setEditing({ id: pin.id, label: pin.label || "" });
  const saveRename = () => {
    if (!editing) return;
    setPins(pins.map(p => p.id === editing.id ? { ...p, label: editing.label.trim() || "Unnamed" } : p));
    setEditing(null);
  };
  const removePin = (id) => {
    setPins(pins.filter(p => p.id !== id));
    if (activePinId === id) setActivePinId(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(5, 5, 8, 0.85)", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        maxWidth: 600, width: "100%", margin: "0 auto",
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "22px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: FONT_SANS, letterSpacing: "-0.02em" }}>Saved Spots</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {pins.length} pin{pins.length === 1 ? "" : "s"} · tap the map to add
              </div>
            </div>
            <button onClick={onClose} style={{
              ...glass("bri"),
              padding: "8px 18px", borderRadius: 10,
              color: T.gold, fontSize: 12, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
              borderColor: T.strokeAct,
            }}>Done</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "0 20px 20px" }}>
          {pins.length === 0 && (
            <div style={{
              padding: "40px 20px", textAlign: "center",
              color: T.textDim, fontSize: 13, lineHeight: 1.6,
            }}>
              No pins yet. Close this, tap somewhere on the map to drop a pin, then come back here to name it.
            </div>
          )}
          {pins.map(p => {
            const isActive = activePinId === p.id;
            const isEditing = editing?.id === p.id;
            return (
              <div key={p.id} style={{
                ...glass(isActive ? "bri" : "base"),
                border: `1px solid ${isActive ? T.strokeAct : T.stroke}`,
                padding: 12, marginBottom: 6, borderRadius: 10,
              }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      autoFocus
                      value={editing.label}
                      onChange={e => setEditing({ ...editing, label: e.target.value })}
                      onKeyDown={e => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditing(null); }}
                      placeholder="Name this spot…"
                      style={{
                        flex: 1, padding: "8px 12px", ...glass("lite"),
                        color: T.text, fontSize: 13,
                        fontFamily: "'Inter', sans-serif", outline: "none", borderRadius: 8,
                      }}
                    />
                    <button onClick={saveRename} style={{
                      padding: "8px 14px", background: T.gold, border: "none", borderRadius: 8,
                      color: T.bgWarm, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}>Save</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => { setActivePinId(p.id); onClose(); }} style={{
                      flex: 1, background: "transparent", border: "none",
                      textAlign: "left", cursor: "pointer", padding: 0,
                    }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: isActive ? T.text : T.textMid,
                        fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 6,
                      }}>
                        {isActive && <span style={{ color: T.gold, fontSize: 14 }}>●</span>}
                        {p.label || "Unnamed"}
                      </div>
                      <div style={{ fontSize: 10, color: T.textDim, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                        {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
                      </div>
                    </button>
                    <button onClick={() => startRename(p)} style={{
                      padding: "6px 10px", ...glass("lite"), borderRadius: 8, cursor: "pointer",
                      color: T.textMid, fontSize: 11, fontFamily: "'Inter', sans-serif",
                    }}>Rename</button>
                    <button onClick={() => removePin(p.id)} style={{
                      padding: "6px 10px", ...glass("lite"), borderRadius: 8, cursor: "pointer",
                      color: T.red, fontSize: 11, fontFamily: "'Inter', sans-serif",
                      borderColor: `${T.red}30`,
                    }}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── SURFACE PRIMITIVES ─── */
// Flat surfaces replace the previous glassy blur panels.
// API is identical (variant: "base" | "lite" | "bri") so all callers keep working.
const glass = (variant = "base") => ({
  background: variant === "bri" ? T.surfaceHi : variant === "lite" ? T.surface : T.surface,
  border: `1px solid ${variant === "bri" ? T.strokeHi : T.stroke}`,
  borderRadius: 14,
});
const surface = glass; // alias for new-style callers

function GlassCard({ children, style = {}, variant = "base", active = false }) {
  return (
    <div style={{
      ...glass(variant),
      border: `1px solid ${active ? T.strokeAct : (variant === "bri" ? T.strokeHi : T.stroke)}`,
      padding: 14,
      transition: "border-color .2s, background .2s",
      ...style,
    }}>{children}</div>
  );
}

function Label({ children, accent }) {
  return (
    <div style={{
      fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em",
      color: accent || T.textDim, fontFamily: FONT_MONO,
      marginBottom: 10, marginTop: 24, fontWeight: 500,
    }}>{children}</div>
  );
}

/* ─── WEATHER HELPERS ─── */
function parseW(w) {
  if (!w) return { label: "Unknown", icon: "☁️", tone: "neutral" };
  const c = w.weathercode;
  if (c <= 1)  return { label: "Clear",         icon: "☀️", tone: "bright" };
  if (c <= 3)  return { label: "Partly Cloudy", icon: "⛅", tone: "diffused" };
  if (c <= 48) return { label: "Overcast",      icon: "☁️", tone: "flat" };
  if (c <= 67) return { label: "Rain",          icon: "🌧️", tone: "moody" };
  if (c <= 77) return { label: "Snow",          icon: "❄️", tone: "cold" };
  return { label: "Storm", icon: "⛈️", tone: "moody" };
}

function analyzeForecast(forecast, currentWeather) {
  if (!forecast || !forecast.time) return null;
  const now = new Date();
  const nowH = now.getHours();
  const times = forecast.time.map(t => new Date(t));
  let startIdx = times.findIndex(t => t.getHours() >= nowH && t.getDate() === now.getDate());
  if (startIdx < 0) startIdx = 0;
  const upcoming = [];
  for (let i = startIdx; i < Math.min(startIdx + 12, times.length); i++) {
    upcoming.push({
      hour: times[i].getHours(),
      code: forecast.weathercode[i],
      temp: Math.round(forecast.temperature_2m[i]),
      wind: Math.round(forecast.windspeed_10m[i]),
      cloud: forecast.cloudcover[i],
      rainProb: forecast.precipitation_probability?.[i] || 0,
      isDay: forecast.is_day?.[i] || 1,
    });
  }
  let nextSun = null, nextRain = null;
  for (const h of upcoming) { if (!nextSun && h.cloud < 50 && h.isDay) nextSun = h; }
  for (const h of upcoming) { if (!nextRain && h.rainProb > 40) nextRain = h; }
  const month = now.getMonth();
  const sunsetApprox = [16.5, 17.2, 18, 19.8, 20.8, 21.3, 21, 20.2, 19, 17.8, 16.5, 16][month];
  const goldenStart = Math.floor(sunsetApprox - 1);
  const goldenMin = Math.round((sunsetApprox - 1 - goldenStart) * 60);
  const windNow = currentWeather?.windspeed || 0;
  const droneStatus = windNow >= 30 ? "grounded" : windNow >= 20 ? "risky" : "good";
  return { upcoming, nextSun, nextRain, goldenStart, goldenMin, sunsetApprox, droneStatus };
}

function formatHour(h) {
  if (h === 0) return "midnight";
  if (h === 12) return "noon";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

/* ─── WEATHER ORB (atmospheric visual) ─── */
function WeatherOrb({ weather }) {
  if (!weather) return null;
  const c = weather.weathercode;
  const isN = weather.is_day === 0;
  const isClear = c <= 1;
  const isPartly = c >= 2 && c <= 3;
  const isOvercast = c >= 4 && c <= 48;
  const isRain = c >= 51 && c <= 67;
  const isSnow = c >= 71 && c <= 77;
  const isStorm = c >= 80;

  let centreColor, edgeColor, iconChar;
  if (isN) { centreColor = "#6a7096"; edgeColor = "#1a1d30"; iconChar = isClear ? "☽" : "☁"; }
  else if (isClear) { centreColor = "#f4d890"; edgeColor = "#8a6830"; iconChar = "☀"; }
  else if (isPartly) { centreColor = "#d4c088"; edgeColor = "#6a5c40"; iconChar = "⛅"; }
  else if (isOvercast) { centreColor = "#a0a0a0"; edgeColor = "#484848"; iconChar = "☁"; }
  else if (isRain) { centreColor = "#80a0c0"; edgeColor = "#304050"; iconChar = "☂"; }
  else if (isSnow) { centreColor = "#d8e0ea"; edgeColor = "#5a6878"; iconChar = "❄"; }
  else { centreColor = "#a080a0"; edgeColor = "#302040"; iconChar = "⚡"; }

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${centreColor}, ${edgeColor} 70%, transparent 100%)`,
        filter: "blur(1px)", opacity: 0.9,
      }} />
      <div style={{
        position: "absolute", inset: -8, borderRadius: "50%",
        background: `radial-gradient(circle, ${centreColor}40, transparent 60%)`,
        filter: "blur(8px)",
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 30, color: "#1a1410", fontWeight: 300, textShadow: `0 0 8px ${centreColor}80`,
      }}>{iconChar}</div>
    </div>
  );
}

/* ─── CONDITIONS DASHBOARD ─── */
function ConditionsDash({ weather, forecast, weatherLive, locationLabel }) {
  if (!weather) return (
    <div style={{ ...glass(), padding: "36px 20px", textAlign: "center" }}>
      <div style={{
        width: 20, height: 20,
        border: `2px solid ${T.stroke}`, borderTop: `2px solid ${T.gold}`,
        borderRadius: "50%", margin: "0 auto 12px",
        animation: "spin .8s linear infinite",
      }} />
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textDim }}>
        Reading conditions…
      </div>
    </div>
  );

  const wi = parseW(weather);
  const isN = weather.is_day === 0;
  const temp = Math.round(weather.temperature);
  const wind = Math.round(weather.windspeed);
  const info = analyzeForecast(forecast, weather);

  let lightLabel, lightColor;
  if (isN) { lightLabel = "Night"; lightColor = T.violet; }
  else if (weather.weathercode <= 1) { lightLabel = "Bright & hard"; lightColor = T.wrn; }
  else if (weather.weathercode <= 3) { lightLabel = "Diffused"; lightColor = T.grn; }
  else if (weather.weathercode <= 48) { lightLabel = "Soft & flat"; lightColor = T.blu; }
  else { lightLabel = "Dark & moody"; lightColor = T.violet; }

  const droneColour = info?.droneStatus === "good" ? T.grn : info?.droneStatus === "risky" ? T.wrn : T.red;
  const droneLabel  = info?.droneStatus === "good" ? "Good to fly" : info?.droneStatus === "risky" ? "Risky" : "Grounded";
  const droneDetail = info?.droneStatus === "good" ? "Conditions look fine" : info?.droneStatus === "risky" ? "Flyable, expect drift" : `${wind}km/h — too gusty`;

  return (
    <div>
      {/* PRIMARY — hero glass panel */}
      <GlassCard variant="bri" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <WeatherOrb weather={weather} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontWeight: 400,
                fontSize: 42, color: T.text, lineHeight: 1,
              }}>{temp}°</div>
              <div style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 10,
                background: weatherLive ? `${T.grn}18` : `${T.wrn}18`,
                color: weatherLive ? T.grn : T.wrn,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              }}>{weatherLive ? "● LIVE" : "◌ SNAPSHOT"}</div>
            </div>
            <div style={{ fontSize: 13, color: T.textMid, marginBottom: 6 }}>{wi.label} · {locationLabel || "Location"}</div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              <span><span style={{ color: lightColor }}>●</span> {lightLabel}</span>
              <span><span style={{ color: wind > 30 ? T.red : wind > 20 ? T.wrn : T.grn }}>●</span> {wind} km/h</span>
              <span><span style={{ color: droneColour }}>●</span> 🚁 {droneLabel}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FORECAST ALERTS */}
      {info && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {info.nextSun && weather.weathercode > 3 && (
            <AlertRow icon="☀️" colour={T.wrn} text={`Sun due around ${formatHour(info.nextSun.hour)}`} detail={`${info.nextSun.cloud}% cloud`} />
          )}
          {info.nextRain && weather.weathercode < 50 && (
            <AlertRow icon="🌧️" colour={T.blu} text={`Rain risk from ${formatHour(info.nextRain.hour)}`} detail={`${info.nextRain.rainProb}% chance`} />
          )}
          {!isN && (
            <AlertRow
              icon="🌅" colour={T.amber}
              text={`Golden hour ~${info.goldenStart}:${String(info.goldenMin).padStart(2,"0")}`}
              detail={`sunset ~${Math.floor(info.sunsetApprox)}:${String(Math.round((info.sunsetApprox % 1) * 60)).padStart(2,"0")}`}
            />
          )}
        </div>
      )}

      {/* HOURLY STRIP */}
      {info?.upcoming?.length > 0 && (
        <GlassCard style={{ marginTop: 8, padding: "14px 10px 10px" }}>
          <div style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em",
            color: T.textDim, fontFamily: FONT_MONO,
            marginBottom: 10, paddingLeft: 4,
          }}>Next hours</div>
          <div style={{ display: "flex", gap: 2, overflow: "auto", paddingBottom: 2 }}>
            {info.upcoming.slice(0, 10).map((h, i) => {
              const hw = parseW({ weathercode: h.code, is_day: h.isDay });
              const isNow = i === 0;
              return (
                <div key={i} style={{
                  flex: "0 0 auto", width: 48, textAlign: "center",
                  padding: "7px 2px", borderRadius: 8,
                  background: isNow ? `${T.gold}15` : "transparent",
                  border: isNow ? `1px solid ${T.gold}35` : "1px solid transparent",
                }}>
                  <div style={{
                    fontSize: 11, color: isNow ? T.gold : T.textMid,
                    fontFamily: FONT_DISPLAY, lineHeight: 1,
                  }}>{isNow ? "NOW" : formatHour(h.hour)}</div>
                  <div style={{ fontSize: 16, margin: "5px 0 4px" }}>{h.isDay ? hw.icon : "🌙"}</div>
                  <div style={{ fontSize: 13, color: T.text, fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{h.temp}°</div>
                  {h.rainProb > 30 && (
                    <div style={{ fontSize: 10, color: T.blu, fontFamily: FONT_DISPLAY, marginTop: 3, lineHeight: 1 }}>{h.rainProb}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function AlertRow({ icon, colour, text, detail }) {
  return (
    <div style={{
      ...glass("lite"),
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 14px", borderRadius: 10,
      borderColor: `${colour}20`, background: `${colour}10`,
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <div style={{ fontSize: 11, color: colour, flex: 1 }}>
        <span style={{ fontWeight: 600 }}>{text}</span>
        {detail && <span style={{ color: T.textDim, marginLeft: 6, fontFamily: "'JetBrains Mono', monospace" }}>({detail})</span>}
      </div>
    </div>
  );
}

/* ─── HORIZONTAL MODE SCROLLER ─── */
function ModeScroller({ modes, selected, onSelect }) {
  return (
    <div style={{
      display: "flex", gap: 8, overflow: "auto",
      padding: "4px 2px 12px", scrollSnapType: "x proximity",
      scrollbarWidth: "thin", scrollbarColor: `${T.stroke} transparent`,
    }}>
      {modes.map(m => {
        const active = selected === m.id;
        return (
          <button key={m.id} onClick={() => onSelect(m.id)} style={{
            flex: "0 0 auto", width: 120, scrollSnapAlign: "start",
            ...glass(active ? "bri" : "base"),
            border: `1px solid ${active ? T.strokeAct : T.stroke}`,
            padding: "14px 12px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            fontFamily: "'Inter', sans-serif", transition: "all .15s",
          }}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{m.icon}</span>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: active ? T.text : T.textMid,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{m.label}</div>
            <div style={{ fontSize: 9, color: T.textDim, lineHeight: 1.2, textAlign: "center" }}>{m.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── TOP TABS: OM-1 / DJI ─── */
function TopTabs({ active, onChange }) {
  const tabs = [
    { id: "om1", label: "OM-1 II", icon: "◎" },
    { id: "dji", label: "DJI Mini 4 Pro", icon: "◢" },
  ];
  return (
    <div style={{
      ...glass("bri"), padding: 4, display: "flex", gap: 4,
      borderRadius: 14, marginBottom: 16,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, padding: "10px 14px", cursor: "pointer",
            background: isActive
              ? `linear-gradient(135deg, ${T.gold}20, ${T.amber}15)`
              : "transparent",
            border: `1px solid ${isActive ? T.strokeAct : "transparent"}`,
            borderRadius: 11,
            color: isActive ? T.text : T.textMid,
            fontFamily: "'Inter', sans-serif",
            fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}>
            <span style={{ fontSize: 14, color: isActive ? T.gold : T.textDim }}>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── SELECTION CARD (glass) ─── */
function SelCard({ sel, onClick, icon, label, tag, difficulty }) {
  const dColor = { EASY: T.grn, READY: T.blu, TRACK: T.wrn, HARD: T.red }[difficulty];
  return (
    <button onClick={onClick} style={{
      ...glass(sel ? "bri" : "base"),
      border: `1px solid ${sel ? T.strokeAct : T.stroke}`,
      padding: "13px 14px", cursor: "pointer", textAlign: "left",
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      fontFamily: "'Inter', sans-serif", transition: "all .15s",
      position: "relative",
    }}>
      {icon && <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: sel ? T.text : T.textMid,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{label}</div>
        {tag && <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{tag}</div>}
      </div>
      {difficulty && (
        <span style={{
          fontSize: 8, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          padding: "3px 7px", borderRadius: 5, flexShrink: 0,
          background: `${dColor}20`, color: dColor, letterSpacing: "0.08em",
        }}>{difficulty}</span>
      )}
    </button>
  );
}

/* ─── LENS TABS WITH TC TOGGLE ─── */
function LensTabs({ kit, mounted, setMounted, tc, setTc }) {
  const lenses = kit.map(id => LENS_DB.find(l => l.id === id)).filter(Boolean);
  if (!lenses.length) return null;

  const mountedLens = mounted ? LENS_DB.find(l => l.id === mounted) : null;
  const canTC = mountedLens?.tc;

  return (
    <div>
      <Label>Lens mounted</Label>
      <div style={{
        display: "flex", gap: 6, overflow: "auto",
        padding: "2px 2px 8px", scrollSnapType: "x proximity",
        scrollbarWidth: "thin",
      }}>
        <button onClick={() => setMounted(null)} style={{
          flex: "0 0 auto", scrollSnapAlign: "start",
          ...glass(mounted === null ? "bri" : "base"),
          border: `1px solid ${mounted === null ? T.strokeAct : T.stroke}`,
          padding: "10px 14px", cursor: "pointer",
          fontSize: 12, fontWeight: 600,
          color: mounted === null ? T.text : T.textMid,
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: "nowrap", transition: "all .15s",
        }}>Auto-pick</button>
        {lenses.map(l => {
          const active = mounted === l.id;
          return (
            <button key={l.id} onClick={() => { setMounted(l.id); if (!l.tc) setTc("none"); }} style={{
              flex: "0 0 auto", scrollSnapAlign: "start",
              ...glass(active ? "bri" : "base"),
              border: `1px solid ${active ? T.strokeAct : T.stroke}`,
              padding: "10px 14px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap", transition: "all .15s",
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: active ? T.text : T.textMid,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{l.short}</div>
              <div style={{ fontSize: 9, color: T.textDim }}>{l.equiv}</div>
            </button>
          );
        })}
      </div>

      {/* TC TOGGLE — only on compatible lenses */}
      {canTC && (
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em",
            color: T.textDim, fontFamily: "'JetBrains Mono', monospace",
          }}>Teleconverter</div>
          <div style={{
            ...glass("lite"), padding: 3, display: "flex", gap: 2, borderRadius: 10,
          }}>
            {TC_OPTIONS.map(opt => {
              const active = tc === opt.id;
              return (
                <button key={opt.id} onClick={() => setTc(opt.id)} style={{
                  padding: "6px 12px", cursor: "pointer",
                  background: active ? `${T.gold}25` : "transparent",
                  border: "none",
                  borderRadius: 8,
                  color: active ? T.gold : T.textDim,
                  fontSize: 11, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all .15s",
                }}>{opt.label}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LENS KIT MANAGEMENT ─── */
function usePersistedKit() {
  const [kit, setKitState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return s && s.length ? s : DEFAULT_KIT;
    } catch { return DEFAULT_KIT; }
  });
  const setKit = useCallback((ids) => {
    setKitState(ids);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  }, []);
  return [kit, setKit];
}

function KitPanel({ kit, setKit, onClose }) {
  const [q, setQ] = useState("");
  const fl = q.trim()
    ? LENS_DB.filter(l => l.name.toLowerCase().includes(q.toLowerCase()) || l.equiv.includes(q))
    : LENS_DB;
  const fc = {};
  fl.forEach(l => { if (!fc[l.cat]) fc[l.cat] = []; fc[l.cat].push(l); });
  const tog = id => {
    const n = kit.includes(id) ? kit.filter(x => x !== id) : [...kit, id];
    setKit(n);
  };
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(5, 5, 8, 0.85)", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        maxWidth: 600, width: "100%", margin: "0 auto",
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "22px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: FONT_SANS, letterSpacing: "-0.02em" }}>My Lens Kit</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{kit.length} selected</div>
            </div>
            <button onClick={onClose} style={{
              ...glass("bri"),
              padding: "8px 18px", borderRadius: 10,
              color: T.gold, fontSize: 12, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
              borderColor: T.strokeAct,
            }}>Done</button>
          </div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search lenses…" style={{
            width: "100%", padding: "11px 14px",
            ...glass("lite"),
            color: T.text, fontSize: 13,
            fontFamily: "'Inter', sans-serif", outline: "none",
            marginBottom: 12, borderRadius: 10,
          }}/>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "0 20px 20px" }}>
          {Object.entries(fc).map(([cat, lenses]) => (
            <div key={cat}>
              <div style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
                color: T.textDim, fontFamily: "'JetBrains Mono', monospace",
                margin: "14px 0 6px", position: "sticky", top: 0,
                background: "rgba(5, 5, 8, 0.95)", backdropFilter: "blur(8px)",
                padding: "4px 0", zIndex: 2,
              }}>{cat}</div>
              {lenses.map(l => {
                const own = kit.includes(l.id);
                return (
                  <button key={l.id} onClick={() => tog(l.id)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "11px 14px", marginBottom: 4, cursor: "pointer",
                    textAlign: "left",
                    ...glass(own ? "bri" : "base"),
                    border: `1px solid ${own ? T.strokeAct : T.stroke}`,
                    borderRadius: 10,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: own ? T.text : T.textMid }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: T.textDim, marginTop: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                        {l.equiv} · f/{l.maxAp}{l.syncIS ? " · Sync IS" : ""}{l.tc ? " · TC" : ""}
                      </div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${own ? T.gold : T.stroke}`,
                      background: own ? T.gold : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: T.bg, fontWeight: 700,
                    }}>{own ? "✓" : ""}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PROMPT BUILDERS (trimmed output) ─── */
function buildOMPrompt(mode, sel, weather, extra, kit, mountedId, tcId) {
  const w = parseW(weather);
  const isN = weather?.is_day === 0;
  const t = weather ? Math.round(weather.temperature) : null;
  const wind = weather ? Math.round(weather.windspeed) : null;
  const ws = weather
    ? `CONDITIONS: ${w.label}, ${t}°C, wind ${wind}km/h. ${isN ? "Night." : "Day."}`
    : "CONDITIONS: assume overcast UK.";

  const ml = mountedId ? LENS_DB.find(l => l.id === mountedId) : null;
  const tc = TC_OPTIONS.find(o => o.id === tcId) || TC_OPTIONS[0];
  const bag = kit.filter(id => id !== mountedId).map(id => LENS_DB.find(l => l.id === id)).filter(Boolean);

  let ls;
  if (ml) {
    const effMax = ml.maxAp * tc.mult;
    const reach = tc.mult === 1 ? ml.equiv : `${Math.round(parseInt(ml.equiv) * tc.mult)}mm equiv`;
    ls = `MOUNTED: ${ml.name}${tc.id !== "none" ? ` + ${tc.label}` : ""} (${reach}, max aperture effectively f/${effMax.toFixed(1)}${ml.syncIS ? ", Sync IS" : ""}). Tailor everything to THIS combo.`;
    if (bag.length) ls += `\nIN BAG: ${bag.map(l => `${l.short} (${l.equiv}, f/${l.maxAp})`).join("; ")}. If a materially better lens exists for the situation, mention in would_swap (else null).`;
  } else {
    const all = kit.map(id => LENS_DB.find(l => l.id === id)).filter(Boolean);
    ls = `LENS KIT AVAILABLE: ${all.map(l => `${l.short} (${l.equiv}, f/${l.maxAp}${l.tc ? ", TC-compat" : ""})`).join("; ")}. Pick the best lens for the scenario and put it in recommended_lens.`;
  }

  let sc = "";
  if (mode === "animals") {
    const a = ANIMALS.find(x => x.id === sel.animal), b = ANIMAL_BEH.find(x => x.id === sel.beh);
    sc = `SCENARIO: ${a?.label} — "${b?.label}" (${b?.desc}). Use Cats & Dogs subject detection; fallback C-AF+Tracking via AF-ON.`;
  } else if (mode === "birds") {
    const bt = BIRDS.find(x => x.id === sel.bird), bs = BIRD_SC.find(x => x.id === sel.birdSc);
    sc = `SCENARIO: ${bt?.label} — "${bs?.label}" (${bs?.desc}) [${bs?.d}]. Use Bird subject detection.`;
  } else if (mode === "landscape") {
    const lt = LANDS.find(x => x.id === sel.land);
    sc = `SCENARIO: Landscape — ${lt?.label}: ${lt?.desc}. Factor live weather heavily.`;
  } else if (mode === "macro") {
    const mc = MACRO_SC.find(x => x.id === sel.macro);
    sc = `SCENARIO: Macro — ${mc?.label}: ${mc?.desc}. Focus stacking likely relevant.`;
  } else if (mode === "portrait") {
    const pt = PORTRAIT_SC.find(x => x.id === sel.portrait);
    sc = `SCENARIO: Portrait — ${pt?.label}: ${pt?.desc}. Subject detection: Cats & Dogs for cats, Human for people.`;
  } else if (mode === "night") {
    const nt = NIGHT_SC.find(x => x.id === sel.night);
    sc = `SCENARIO: Night — ${nt?.label}: ${nt?.desc}. Consider Starry Sky AF, Live Composite, Live Time if relevant.`;
  }

  return `${KB_OM}

${ws}
${sc}
${ls}
${extra ? `USER NOTES: ${extra}` : ""}

Respond ONLY with this compact JSON (no markdown, no preamble):
{
  "preset_name": "Short evocative name",
  "shooting_mode": "A/S/M + one-line reason",
  "recommended_lens": "lens name (only if auto-picking, else restate mounted)",
  "would_swap": "better lens name or null",
  "swap_reason": "one-line why or null",
  "aperture": "f/X.X",
  "shutter_speed": "1/Xs or Xs",
  "iso": "value",
  "drive_mode": "mode + fps",
  "af_summary": "Subject detection + C-AF area + one-line fallback",
  "is_mode": "S-IS Auto / S-IS 1 / S-IS 2 + one-line reason",
  "special_feature": "Pro Capture / Live Comp / Starry Sky AF / Focus Stack / null",
  "key_buttons": ["2-3 button assignments that matter most for THIS shot, e.g. 'AF-ON: C-AF+Tracking fallback', 'Lens Fn: Subject Detect toggle'"],
  "why": "2-3 sentence plain-English explanation tying scenario, lens, and conditions together",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "setup_steps": ["step 1", "step 2", "step 3", "step 4"]
}

Be SPECIFIC. Use real OM-1 II menu terminology. Trim the fat.`;
}

function buildDJIPrompt(mode, sel, weather, extra) {
  const w = parseW(weather);
  const t = weather ? Math.round(weather.temperature) : null;
  const wind = weather ? Math.round(weather.windspeed) : null;
  const isN = weather?.is_day === 0;
  const ws = weather
    ? `CONDITIONS: ${w.label}, ${t}°C, wind ${wind}km/h. ${isN ? "Night." : "Day."}`
    : "CONDITIONS: assume UK overcast.";

  const m = DJI_MODES.find(x => x.id === sel.djiMode);
  const o = DJI_OUTPUT.find(x => x.id === sel.djiOutput);
  const c = DJI_COMPLEXITY.find(x => x.id === sel.djiComplexity);
  const isVid = sel.djiOutput?.startsWith("video");

  const sc = `SCENARIO: ${m?.label} (${m?.sub}).
OUTPUT: ${o?.label}.
APPROACH: ${c?.label} — ${c?.desc}.`;

  return `${KB_DJI}

${ws}
${sc}
${extra ? `USER NOTES: ${extra}` : ""}

User is James — experienced photographer, newer to drone. Don't assume manual expertise; suggest auto-modes liberally. Mention manual settings only when the approach is "try something".

Respond ONLY with this compact JSON (no markdown):
{
  "preset_name": "Short evocative name",
  "capture_mode": "${isVid ? "4K/30 / 4K/60 / 1080p / etc" : "Auto / Pro"}",
  "aperture": "f/1.7 (fixed)",
  "shutter_speed": "1/X s${isVid ? " (180° rule applied)" : ""}",
  "iso": "value or 'Auto'",
  "white_balance": "Auto / Sunny / Cloudy / Kelvin value",
  "colour_profile": "Normal / D-Log M",
  "nd_filter": "None / ND8 / ND16 / ND32 / ND64 + reason",
  ${isVid ? `"video_recording": "Normal / Slow Motion / Hyperlapse",` : `"photo_style": "Single / AEB / Pano type",`}
  "focus_or_flight": "Focus mode OR flight technique — e.g. 'ActiveTrack on subject' / 'Orbit, 20m radius'",
  "why": "2-3 sentence plain-English explanation",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "flight_checklist": ["check 1", "check 2", "check 3"]
}

Keep it simple. No unnecessary manual faff.`;
}

/* ─── RESULT PIECES ─── */
function SpecChip({ label, value, accent }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.stroke}`,
      padding: "12px 10px 11px", borderRadius: 10,
      textAlign: "center", flex: "1 1 0", minWidth: 0,
    }}>
      <div style={{
        fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
        color: T.textDim, fontFamily: FONT_MONO, marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontSize: 22,
        color: accent || T.text,
        fontFamily: FONT_DISPLAY,
        lineHeight: 1, wordBreak: "break-word",
      }}>{value || "—"}</div>
    </div>
  );
}

function Section({ title, icon, accent, children, style = {} }) {
  return (
    <div style={{ ...glass(), padding: 16, marginBottom: 10, ...style }}>
      <div style={{
        fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em",
        color: accent || T.goldDim, fontFamily: "'JetBrains Mono', monospace",
        marginBottom: 10, display: "flex", alignItems: "center", gap: 7, fontWeight: 500,
      }}>
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        {title}
      </div>
      {children}
    </div>
  );
}

function OMResult({ result }) {
  if (!result) return null;
  return (
    <div>
      {/* HERO PRESET */}
      <GlassCard variant="bri" style={{
        padding: "20px 20px",
        background: `linear-gradient(135deg, ${T.gold}12, ${T.amber}06)`,
        borderColor: T.strokeHi,
      }}>
        <div style={{
          fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
          color: T.goldDim, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4,
        }}>Preset</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: T.text,
          fontFamily: FONT_SANS, letterSpacing: "-0.03em",
          lineHeight: 1.05, marginBottom: 6,
        }}>{result.preset_name}</div>
        <div style={{ fontSize: 12, color: T.textMid }}>
          Mode: <span style={{ color: T.gold, fontFamily: FONT_MONO }}>{result.shooting_mode}</span>
        </div>
      </GlassCard>

      <div style={{ height: 10 }} />

      {/* LENS */}
      <Section title="Lens" icon="🔭" accent={T.gold}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: T.text,
          fontFamily: "'JetBrains Mono', monospace", marginBottom: 4,
        }}>{result.recommended_lens}</div>
        {result.would_swap && result.would_swap !== "null" && (
          <div style={{
            ...glass("lite"),
            marginTop: 10, padding: "10px 12px", borderRadius: 8,
            background: `${T.blu}10`, borderColor: `${T.blu}25`,
          }}>
            <div style={{
              fontSize: 10, color: T.blu, fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, marginBottom: 3, letterSpacing: "0.08em",
            }}>🔄 CONSIDER SWAPPING</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{result.would_swap}</div>
            {result.swap_reason && result.swap_reason !== "null" && (
              <div style={{ fontSize: 11, color: T.textMid, marginTop: 3 }}>{result.swap_reason}</div>
            )}
          </div>
        )}
      </Section>

      {/* EXPOSURE TRIANGLE */}
      <Section title="Exposure">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <SpecChip label="Aperture" value={result.aperture} accent={T.gold} />
          <SpecChip label="Shutter" value={result.shutter_speed} accent={T.gold} />
          <SpecChip label="ISO" value={result.iso} accent={T.gold} />
        </div>
      </Section>

      {/* DRIVE + AF + IS */}
      <Section title="Drive & Focus" icon="⚡" accent={T.blu}>
        <div style={{ fontSize: 12, color: T.textMid, marginBottom: 6 }}>
          <span style={{ color: T.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginRight: 6 }}>DRIVE</span>
          <span style={{ color: T.text, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{result.drive_mode}</span>
        </div>
        <div style={{ fontSize: 12, color: T.textMid, marginBottom: 6 }}>
          <span style={{ color: T.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginRight: 6 }}>AF</span>
          {result.af_summary}
        </div>
        <div style={{ fontSize: 12, color: T.textMid }}>
          <span style={{ color: T.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, marginRight: 6 }}>IS</span>
          {result.is_mode}
        </div>
      </Section>

      {/* KEY BUTTONS (trimmed) */}
      {result.key_buttons?.length > 0 && (
        <Section title="Key Buttons" icon="⌨">
          {result.key_buttons.map((b, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "baseline",
              padding: "6px 0",
              borderBottom: i < result.key_buttons.length - 1 ? `1px solid ${T.stroke}` : "none",
            }}>
              <span style={{ color: T.gold, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, flexShrink: 0 }}>▸</span>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: T.textMid }}>{b}</span>
            </div>
          ))}
        </Section>
      )}

      {/* SPECIAL FEATURE */}
      {result.special_feature && result.special_feature !== "null" && (
        <Section title="Special Feature" icon="✦" accent={T.amber}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: T.amber,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{result.special_feature}</div>
        </Section>
      )}

      {/* WHY */}
      <Section title="Why">
        <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: T.textMid }}>{result.why}</p>
      </Section>

      {/* TIPS */}
      {result.tips?.length > 0 && (
        <Section title="Tips">
          {result.tips.map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "baseline",
              marginBottom: i < result.tips.length - 1 ? 8 : 0,
            }}>
              <span style={{ color: T.gold, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 12, lineHeight: 1.55, color: T.textMid }}>{t}</span>
            </div>
          ))}
        </Section>
      )}

      {/* SETUP STEPS */}
      {result.setup_steps?.length > 0 && (
        <CollapsibleSteps steps={result.setup_steps} />
      )}
    </div>
  );
}

function CollapsibleSteps({ steps }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "14px 16px",
        ...glass(open ? "bri" : "base"),
        border: `1px solid ${open ? T.strokeAct : T.stroke}`,
        borderRadius: open ? "12px 12px 0 0" : 12,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>💾</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.gold }}>Programme this Custom Mode</span>
        </div>
        <span style={{
          color: T.textDim, fontSize: 14, transition: "transform .2s",
          transform: open ? "rotate(180deg)" : "none",
        }}>▾</span>
      </button>
      {open && (
        <div style={{
          ...glass("bri"),
          padding: 16, borderTop: "none",
          borderRadius: "0 0 12px 12px",
          animation: "fadeUp .3s ease",
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 10,
              marginBottom: i < steps.length - 1 ? 10 : 0,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: T.gold,
                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: 2,
              }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 12, lineHeight: 1.55, color: T.textMid }}>
                {s.replace(/^Step \d+:\s*/, "")}
              </span>
            </div>
          ))}
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: `${T.wrn}10`, borderRadius: 8,
            border: `1px solid ${T.wrn}25`,
            fontSize: 10, color: T.wrn, lineHeight: 1.5,
          }}>
            Set <strong>Save Settings</strong> to <strong>Reset</strong> when done. Verify by rotating the mode dial away and back.
          </div>
        </div>
      )}
    </div>
  );
}

function DJIResult({ result, isVideo }) {
  if (!result) return null;
  return (
    <div>
      {/* HERO PRESET */}
      <GlassCard variant="bri" style={{
        padding: "20px 20px",
        background: `linear-gradient(135deg, ${T.blu}12, ${T.violet}06)`,
        borderColor: T.strokeHi,
      }}>
        <div style={{
          fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
          color: T.blu, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4,
        }}>Drone Preset</div>
        <div style={{
          fontSize: 26, fontWeight: 800, color: T.text,
          fontFamily: FONT_SANS, letterSpacing: "-0.03em",
          lineHeight: 1.05, marginBottom: 6,
        }}>{result.preset_name}</div>
        <div style={{ fontSize: 12, color: T.textMid }}>
          Mode: <span style={{ color: T.blu, fontFamily: FONT_MONO }}>{result.capture_mode}</span>
        </div>
      </GlassCard>

      <div style={{ height: 10 }} />

      {/* EXPOSURE TRIANGLE */}
      <Section title="Exposure">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <SpecChip label="Aperture" value={result.aperture} accent={T.blu} />
          <SpecChip label="Shutter" value={result.shutter_speed} accent={T.blu} />
          <SpecChip label="ISO" value={result.iso} accent={T.blu} />
        </div>
      </Section>

      {/* COLOUR + WB */}
      <Section title="Colour & White Balance" icon="🎨" accent={T.violet}>
        <div style={{ display: "flex", gap: 6 }}>
          <SpecChip label="WB" value={result.white_balance} />
          <SpecChip label="Profile" value={result.colour_profile} />
        </div>
      </Section>

      {/* ND FILTER */}
      {result.nd_filter && (
        <Section title="ND Filter" icon="⬛">
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 3 }}>{result.nd_filter}</div>
        </Section>
      )}

      {/* PHOTO STYLE OR VIDEO RECORDING */}
      {isVideo && result.video_recording && (
        <Section title="Recording Mode" icon="🎬">
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{result.video_recording}</div>
        </Section>
      )}
      {!isVideo && result.photo_style && (
        <Section title="Photo Style" icon="📸">
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{result.photo_style}</div>
        </Section>
      )}

      {/* FOCUS / FLIGHT */}
      {result.focus_or_flight && (
        <Section title="Focus / Flight Technique" icon="🎯" accent={T.blu}>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55 }}>{result.focus_or_flight}</div>
        </Section>
      )}

      {/* WHY */}
      <Section title="Why">
        <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: T.textMid }}>{result.why}</p>
      </Section>

      {/* TIPS */}
      {result.tips?.length > 0 && (
        <Section title="Tips">
          {result.tips.map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "baseline",
              marginBottom: i < result.tips.length - 1 ? 8 : 0,
            }}>
              <span style={{ color: T.blu, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 12, lineHeight: 1.55, color: T.textMid }}>{t}</span>
            </div>
          ))}
        </Section>
      )}

      {/* CHECKLIST */}
      {result.flight_checklist?.length > 0 && (
        <Section title="Pre-flight Checklist" icon="✓" accent={T.grn}>
          {result.flight_checklist.map((c, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "baseline",
              marginBottom: i < result.flight_checklist.length - 1 ? 8 : 0,
            }}>
              <span style={{
                display: "inline-block", width: 14, height: 14, borderRadius: 3,
                border: `1.5px solid ${T.grn}`, flexShrink: 0, marginTop: 2,
              }} />
              <span style={{ fontSize: 12, lineHeight: 1.55, color: T.textMid }}>{c}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  // Kit & UI state
  const [kit, setKit] = usePersistedKit();
  const [showKit, setShowKit] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [device, setDevice] = useState("om1");

  // Location / pins
  const [pins, setPins] = usePins();
  const [activePin, setActivePinId] = useActivePin(pins);
  const [geoCenter, setGeoCenter] = useState(DEFAULT_LOCATION);
  const [geoRequested, setGeoRequested] = useState(false);

  // Ask for geolocation once on mount
  useEffect(() => {
    if (geoRequested) return;
    setGeoRequested(true);
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: "Your location" });
      },
      () => { /* denied or failed: keep Stockport default */ },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers for map interaction
  const addPin = useCallback((coords) => {
    const id = "pin_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    const newPin = { id, lat: coords.lat, lon: coords.lon, label: "New pin" };
    const next = [...pins, newPin];
    setPins(next);
    setActivePinId(id);
    setShowPins(true);
  }, [pins, setPins, setActivePinId]);

  // OM-1 state
  const [mounted, setMounted] = useState(null);
  const [tc, setTc] = useState("none");
  const [omMode, setOmMode] = useState(null);
  const [animal, setAnimal] = useState("");
  const [beh, setBeh] = useState("");
  const [bird, setBird] = useState("");
  const [birdSc, setBirdSc] = useState("");
  const [land, setLand] = useState("");
  const [macro, setMacro] = useState("");
  const [portrait, setPortrait] = useState("");
  const [night, setNight] = useState("");

  // DJI state
  const [djiMode, setDjiMode] = useState(null);
  const [djiOutput, setDjiOutput] = useState("");
  const [djiComplexity, setDjiComplexity] = useState("easy");

  // Shared
  const [extra, setExtra] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [weatherLive, setWeatherLive] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const resultRef = useRef(null);

  // Fetch weather — refetches when active pin or geo center changes
  useEffect(() => {
    const lat = activePin?.lat ?? geoCenter.lat;
    const lon = activePin?.lon ?? geoCenter.lon;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=weathercode,temperature_2m,windspeed_10m,cloudcover,precipitation_probability,is_day&forecast_days=1&timezone=auto`;
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setWeather(d.current_weather); setForecast(d.hourly || null); setWeatherLive(true); })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [activePin?.id, activePin?.lat, activePin?.lon, geoCenter.lat, geoCenter.lon]);

  function resetScenario() {
    setResult(null); setErr(null);
    setAnimal(""); setBeh(""); setBird(""); setBirdSc("");
    setLand(""); setMacro(""); setPortrait(""); setNight("");
    setDjiOutput("");
  }

  function handleDeviceChange(d) {
    setDevice(d);
    setOmMode(null); setDjiMode(null);
    resetScenario();
  }

  function canGo() {
    if (loading || !kit.length) return false;
    if (device === "om1") {
      if (!omMode) return false;
      if (omMode === "animals") return animal && beh;
      if (omMode === "birds") return bird && birdSc;
      if (omMode === "landscape") return !!land;
      if (omMode === "macro") return !!macro;
      if (omMode === "portrait") return !!portrait;
      if (omMode === "night") return !!night;
    } else {
      return djiMode && djiOutput && djiComplexity;
    }
    return false;
  }

  async function go() {
    setLoading(true); setErr(null); setResult(null);
    let prompt;
    if (device === "om1") {
      const sel = { animal, beh, bird, birdSc, land, macro, portrait, night };
      prompt = buildOMPrompt(omMode, sel, weather, extra, kit, mounted, tc);
    } else {
      const sel = { djiMode, djiOutput, djiComplexity };
      prompt = buildDJIPrompt(djiMode, sel, weather, extra);
    }
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const txt = d.text || "";
      const clean = txt.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      console.error(e);
      setErr("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const wi = parseW(weather);
  const isN = weather?.is_day === 0;
  const tc_short = (() => { const o = TC_OPTIONS.find(x => x.id === tc); return o?.short || ""; })();
  const isDJIVideo = djiOutput?.startsWith("video");

  return (
    <div style={{
      minHeight: "100vh", position: "relative",
      color: T.text, fontFamily: "'Inter', sans-serif",
    }}>
      <link href={FONTS} rel="stylesheet"/>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        ::selection { background: ${T.gold}40; color: ${T.text} }
        * { box-sizing: border-box }
        body { margin: 0; background: ${T.bg}; color: ${T.text}; }
        input::placeholder { color: ${T.textFaint} }
        ::-webkit-scrollbar { width: 6px; height: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: ${T.stroke}; border-radius: 4px }
        ::-webkit-scrollbar-thumb:hover { background: ${T.strokeHi} }
        button { font-family: inherit }
      `}</style>

      <AtmoBg />

      {showKit && <KitPanel kit={kit} setKit={setKit} onClose={() => setShowKit(false)}/>}
      {showPins && <PinsPanel pins={pins} setPins={setPins} activePinId={activePin?.id} setActivePinId={setActivePinId} onClose={() => setShowPins(false)}/>}

      {/* HEADER */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "24px 20px 18px",
        borderBottom: `1px solid ${T.stroke}`,
      }}>
        <div style={{
          maxWidth: 620, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${T.gold}, ${T.goldDim} 70%, ${T.bgWarm} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: T.bgWarm, fontWeight: 700,
            }}>◎</div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: T.text,
                fontFamily: FONT_SANS, letterSpacing: "-0.02em",
              }}>Settings</div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: T.textMid,
                fontFamily: FONT_SANS, letterSpacing: "-0.02em",
              }}>Advisor</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {weather && (
              <div style={{
                background: T.surface,
                border: `1px solid ${T.stroke}`,
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 12,
              }}>
                <span style={{ fontSize: 12 }}>{isN ? "🌙" : wi.icon}</span>
                <span style={{
                  fontSize: 15, color: T.text, fontFamily: FONT_DISPLAY,
                  lineHeight: 1, marginTop: 1,
                }}>
                  {weather ? Math.round(weather.temperature) : "—"}°
                </span>
              </div>
            )}
            <button onClick={() => setShowKit(true)} style={{
              background: !kit.length ? T.surfaceHi : T.surface,
              border: `1px solid ${!kit.length ? T.strokeAct : T.stroke}`,
              padding: "6px 12px", cursor: "pointer",
              borderRadius: 12,
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: FONT_MONO,
              fontSize: 10, color: !kit.length ? T.amber : T.textMid,
              animation: !kit.length ? "pulse 2s ease infinite" : "none",
            }}>
              <span style={{ fontSize: 11 }}>📷</span>
              {!kit.length ? "Add lenses" : `${kit.length} lens${kit.length !== 1 ? "es" : ""}`}
            </button>
          </div>
        </div>
      </header>

      <main style={{
        position: "relative", zIndex: 1,
        maxWidth: 620, margin: "0 auto", padding: "18px 20px 60px",
      }}>

        {!kit.length && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.5 }}>📷</div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8,
              fontFamily: FONT_SANS, letterSpacing: "-0.02em",
            }}>Set up your lens kit</div>
            <div style={{
              fontSize: 13, color: T.textMid, lineHeight: 1.6,
              maxWidth: 320, margin: "0 auto 24px",
            }}>Tell me what glass you have. Recommendations will be tailored to your actual kit.</div>
            <button onClick={() => setShowKit(true)} style={{
              padding: "13px 32px", border: "none", borderRadius: 10,
              background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`,
              color: T.bgWarm, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              boxShadow: `0 4px 20px ${T.gold}30`,
            }}>Add My Lenses</button>
          </div>
        )}

        {!!kit.length && (
          <>
            {/* MAP — hero panel at the top */}
            <div style={{ marginBottom: 16 }}>
              <MapPanel
                center={geoCenter}
                pins={pins}
                activePin={activePin}
                onSelectPin={(id) => setActivePinId(id)}
                onAddPin={addPin}
                weather={weather}
                onOpenPins={() => setShowPins(true)}
              />
            </div>

            {/* TOP DEVICE TABS */}
            <TopTabs active={device} onChange={handleDeviceChange} />

            {/* CONDITIONS DASHBOARD */}
            <ConditionsDash
              weather={weather}
              forecast={forecast}
              weatherLive={weatherLive}
              locationLabel={activePin?.label || geoCenter.label || "Stockport"}
            />

            {/* DEVICE CONTENT */}
            {device === "om1" ? (
              <OMFlow
                kit={kit}
                mounted={mounted} setMounted={setMounted}
                tc={tc} setTc={setTc}
                omMode={omMode} setOmMode={(m) => { setOmMode(m); resetScenario(); }}
                animal={animal} setAnimal={setAnimal}
                beh={beh} setBeh={setBeh}
                bird={bird} setBird={setBird}
                birdSc={birdSc} setBirdSc={setBirdSc}
                land={land} setLand={setLand}
                macro={macro} setMacro={setMacro}
                portrait={portrait} setPortrait={setPortrait}
                night={night} setNight={setNight}
              />
            ) : (
              <DJIFlow
                djiMode={djiMode} setDjiMode={(m) => { setDjiMode(m); resetScenario(); }}
                djiOutput={djiOutput} setDjiOutput={setDjiOutput}
                djiComplexity={djiComplexity} setDjiComplexity={setDjiComplexity}
              />
            )}

            {/* EXTRA NOTES + GO BUTTON */}
            {((device === "om1" && omMode) || (device === "dji" && djiMode)) && (
              <>
                <Label>Anything else <span style={{ color: T.textFaint, textTransform: "none", letterSpacing: 0 }}>(optional)</span></Label>
                <input
                  value={extra} onChange={e => setExtra(e.target.value)}
                  placeholder="e.g. 'handheld', 'through glass', 'want bokeh'…"
                  style={{
                    width: "100%", padding: "12px 14px",
                    ...glass("lite"),
                    color: T.text, fontSize: 13,
                    fontFamily: "'Inter', sans-serif", outline: "none",
                    borderRadius: 10,
                  }}
                />

                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  <button onClick={() => { resetScenario(); setOmMode(null); setDjiMode(null); setMounted(null); setTc("none"); setExtra(""); }} style={{
                    padding: "13px 20px",
                    ...glass("base"),
                    borderRadius: 11, color: T.textMid,
                    fontSize: 12, fontFamily: "'Inter', sans-serif",
                    fontWeight: 500, cursor: "pointer",
                  }}>Reset</button>
                  <button onClick={go} disabled={!canGo()} style={{
                    flex: 1, padding: "13px", border: "none", borderRadius: 11,
                    background: canGo()
                      ? `linear-gradient(135deg, ${T.gold}, ${T.amber})`
                      : "rgba(255, 255, 255, 0.04)",
                    color: canGo() ? T.bgWarm : T.textFaint,
                    fontSize: 14, fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: canGo() ? "pointer" : "not-allowed",
                    boxShadow: canGo() ? `0 4px 20px ${T.gold}25` : "none",
                    transition: "all .2s",
                  }}>
                    {loading ? "Working it out…" : "Get Settings"}
                  </button>
                </div>
              </>
            )}

            {/* LOADING */}
            {loading && (
              <div style={{ textAlign: "center", padding: "36px 0", color: T.textDim }}>
                <div style={{
                  width: 26, height: 26,
                  border: `2px solid ${T.stroke}`, borderTop: `2px solid ${T.gold}`,
                  borderRadius: "50%", margin: "0 auto 12px",
                  animation: "spin .8s linear infinite",
                }}/>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  Dialling in your shot…
                </div>
              </div>
            )}

            {/* ERROR */}
            {err && (
              <GlassCard style={{
                marginTop: 14, background: `${T.red}12`,
                borderColor: `${T.red}35`, color: T.red, fontSize: 12,
              }}>{err}</GlassCard>
            )}

            {/* RESULT */}
            {result && (
              <div ref={resultRef} style={{ marginTop: 28, animation: "fadeUp .4s ease" }}>
                <div style={{
                  height: 1, marginBottom: 18,
                  background: `linear-gradient(90deg, transparent, ${T.gold}30, transparent)`,
                }} />
                {device === "om1"
                  ? <OMResult result={result} />
                  : <DJIResult result={result} isVideo={isDJIVideo} />}
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button onClick={() => { setResult(null); setErr(null); }} style={{
                    ...glass("lite"),
                    padding: "10px 24px", borderRadius: 10,
                    color: T.textDim, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}>Dismiss result</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── OM-1 FLOW ─── */
function OMFlow(props) {
  const {
    kit, mounted, setMounted, tc, setTc,
    omMode, setOmMode,
    animal, setAnimal, beh, setBeh,
    bird, setBird, birdSc, setBirdSc,
    land, setLand,
    macro, setMacro,
    portrait, setPortrait,
    night, setNight,
  } = props;

  return (
    <>
      <Label accent={T.gold}>What are you shooting?</Label>
      <ModeScroller modes={OM_MODES} selected={omMode} onSelect={setOmMode} />

      {/* ANIMALS */}
      {omMode === "animals" && (
        <>
          <Label>Pick your subject</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {ANIMALS.map(a => (
              <SelCard key={a.id} sel={animal === a.id} onClick={() => { setAnimal(a.id); setBeh(""); }} icon={a.icon} label={a.label} tag={a.tag}/>
            ))}
          </div>
          {animal && (
            <>
              <Label>What's it doing?</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ANIMAL_BEH.map(b => (
                  <SelCard key={b.id} sel={beh === b.id} onClick={() => setBeh(b.id)} label={b.label} tag={b.desc}/>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* BIRDS */}
      {omMode === "birds" && (
        <>
          <Label>What kind of bird?</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {BIRDS.map(b => (
              <SelCard key={b.id} sel={bird === b.id} onClick={() => { setBird(b.id); setBirdSc(""); }} icon={b.icon} label={b.label} tag={b.tag}/>
            ))}
          </div>
          {bird && (
            <>
              <Label>What's it going to do?</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {BIRD_SC.map(s => (
                  <SelCard key={s.id} sel={birdSc === s.id} onClick={() => setBirdSc(s.id)} label={s.label} tag={s.desc} difficulty={s.d}/>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* LANDSCAPE */}
      {omMode === "landscape" && (
        <>
          <Label>What kind of scene?</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {LANDS.map(l => (
              <SelCard key={l.id} sel={land === l.id} onClick={() => setLand(l.id)} icon={l.icon} label={l.label} tag={l.desc}/>
            ))}
          </div>
        </>
      )}

      {/* MACRO */}
      {omMode === "macro" && (
        <>
          <Label>Macro what?</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MACRO_SC.map(m => (
              <SelCard key={m.id} sel={macro === m.id} onClick={() => setMacro(m.id)} label={m.label} tag={m.desc}/>
            ))}
          </div>
        </>
      )}

      {/* PORTRAIT */}
      {omMode === "portrait" && (
        <>
          <Label>Portrait of?</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PORTRAIT_SC.map(p => (
              <SelCard key={p.id} sel={portrait === p.id} onClick={() => setPortrait(p.id)} label={p.label} tag={p.desc}/>
            ))}
          </div>
        </>
      )}

      {/* NIGHT */}
      {omMode === "night" && (
        <>
          <Label>What kind of night?</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NIGHT_SC.map(n => (
              <SelCard key={n.id} sel={night === n.id} onClick={() => setNight(n.id)} label={n.label} tag={n.desc}/>
            ))}
          </div>
        </>
      )}

      {/* LENS TABS */}
      {omMode && <LensTabs kit={kit} mounted={mounted} setMounted={setMounted} tc={tc} setTc={setTc} />}
    </>
  );
}

/* ─── DJI FLOW ─── */
function DJIFlow({ djiMode, setDjiMode, djiOutput, setDjiOutput, djiComplexity, setDjiComplexity }) {
  return (
    <>
      <Label accent={T.blu}>What's the shot?</Label>
      <ModeScroller modes={DJI_MODES} selected={djiMode} onSelect={setDjiMode} />

      {djiMode && (
        <>
          <Label>Output type</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {DJI_OUTPUT.map(o => (
              <SelCard key={o.id} sel={djiOutput === o.id} onClick={() => setDjiOutput(o.id)} icon={o.icon} label={o.label}/>
            ))}
          </div>

          {djiOutput && (
            <>
              <Label>Approach</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DJI_COMPLEXITY.map(c => (
                  <SelCard key={c.id} sel={djiComplexity === c.id} onClick={() => setDjiComplexity(c.id)} label={c.label} tag={c.desc}/>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
