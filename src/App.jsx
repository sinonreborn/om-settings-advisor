import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════
   OM SYSTEM SETTINGS ADVISOR
   A comprehensive photography settings tool for the OM-1 Mark II
   ════════════════════════════════════════════════════════════ */

/* ─── OM SYSTEM LENS DATABASE ─── */
const LENS_DB = [
  { id: "7-14f28", name: "M.Zuiko 7-14mm f/2.8 PRO", equiv: "14-28mm", type: "zoom", maxAp: 2.8, syncIS: false, cat: "Ultra Wide Zoom" },
  { id: "8-25f4", name: "M.Zuiko 8-25mm f/4 PRO", equiv: "16-50mm", type: "zoom", maxAp: 4, syncIS: false, cat: "Wide Zoom" },
  { id: "12-40f28", name: "M.Zuiko 12-40mm f/2.8 PRO II", equiv: "24-80mm", type: "zoom", maxAp: 2.8, syncIS: true, cat: "Standard Zoom" },
  { id: "12-100f4", name: "M.Zuiko 12-100mm f/4 IS PRO", equiv: "24-200mm", type: "zoom", maxAp: 4, syncIS: true, cat: "All-in-one Zoom" },
  { id: "40-150f28", name: "M.Zuiko 40-150mm f/2.8 PRO", equiv: "80-300mm", type: "zoom", maxAp: 2.8, syncIS: false, cat: "Telephoto Zoom" },
  { id: "40-150f4", name: "M.Zuiko 40-150mm f/4 PRO", equiv: "80-300mm", type: "zoom", maxAp: 4, syncIS: false, cat: "Compact Tele" },
  { id: "100-400f5-63", name: "M.Zuiko 100-400mm f/5-6.3 IS", equiv: "200-800mm", type: "zoom", maxAp: 5, syncIS: true, cat: "Super Telephoto" },
  { id: "150-400f45", name: "M.Zuiko 150-400mm f/4.5 TC IS PRO", equiv: "300-1000mm", type: "zoom", maxAp: 4.5, syncIS: true, cat: "Super Tele PRO" },
  { id: "17f12", name: "M.Zuiko 17mm f/1.2 PRO", equiv: "34mm", type: "prime", maxAp: 1.2, syncIS: false, cat: "Wide Prime" },
  { id: "17f18", name: "M.Zuiko 17mm f/1.8", equiv: "34mm", type: "prime", maxAp: 1.8, syncIS: false, cat: "Wide Prime" },
  { id: "20f14", name: "M.Zuiko 20mm f/1.4 PRO", equiv: "40mm", type: "prime", maxAp: 1.4, syncIS: false, cat: "Wide Prime" },
  { id: "25f12", name: "M.Zuiko 25mm f/1.2 PRO", equiv: "50mm", type: "prime", maxAp: 1.2, syncIS: false, cat: "Standard Prime" },
  { id: "25f18", name: "M.Zuiko 25mm f/1.8", equiv: "50mm", type: "prime", maxAp: 1.8, syncIS: false, cat: "Standard Prime" },
  { id: "45f12", name: "M.Zuiko 45mm f/1.2 PRO", equiv: "90mm", type: "prime", maxAp: 1.2, syncIS: false, cat: "Portrait Prime" },
  { id: "45f18", name: "M.Zuiko 45mm f/1.8", equiv: "90mm", type: "prime", maxAp: 1.8, syncIS: false, cat: "Portrait Prime" },
  { id: "75f18", name: "M.Zuiko 75mm f/1.8", equiv: "150mm", type: "prime", maxAp: 1.8, syncIS: false, cat: "Tele Prime" },
  { id: "300f4", name: "M.Zuiko 300mm f/4 IS PRO", equiv: "600mm", type: "prime", maxAp: 4, syncIS: true, cat: "Super Tele Prime" },
  { id: "30f35m", name: "M.Zuiko 30mm f/3.5 Macro", equiv: "60mm", type: "prime", maxAp: 3.5, syncIS: false, cat: "Macro" },
  { id: "60f28m", name: "M.Zuiko 60mm f/2.8 Macro", equiv: "120mm", type: "prime", maxAp: 2.8, syncIS: false, cat: "Macro" },
  { id: "90f35m", name: "M.Zuiko 90mm f/3.5 Macro IS PRO", equiv: "180mm", type: "prime", maxAp: 3.5, syncIS: true, cat: "Macro PRO" },
  { id: "mc14", name: "MC-14 1.4x Teleconverter", equiv: "1.4x", type: "tc", maxAp: 0, syncIS: false, cat: "Teleconverter" },
  { id: "mc20", name: "MC-20 2x Teleconverter", equiv: "2x", type: "tc", maxAp: 0, syncIS: false, cat: "Teleconverter" },
];

const STORAGE_KEY = "om-advisor-kit";
const DEFAULT_KIT = ["12-100f4", "100-400f5-63", "45f18", "17f18"];

function usePersistedKit() {
  const [kit, setKitState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return s && s.length ? s : DEFAULT_KIT;
    } catch { return DEFAULT_KIT; }
  });
  const [loaded] = useState(true);

  const setKit = useCallback((ids) => {
    setKitState(ids);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  }, []);

  return [kit, setKit, loaded];
}

const ANIMALS = [
  { id: "cat", label: "Cat Snaps", icon: "🐱", tag: "Indoor loungers to outdoor prowlers" },
  { id: "dog", label: "Dog Shots", icon: "🐕", tag: "Park walks to full-speed zoomies" },
  { id: "squirrel", label: "Squirrel Grabs", icon: "🐿️", tag: "Twitchy, unpredictable, gone" },
  { id: "fox", label: "Fox Watch", icon: "🦊", tag: "Dawn visitors and garden lurkers" },
  { id: "deer", label: "Deer Stalker", icon: "🦌", tag: "Distant, cautious, easily spooked" },
  { id: "rabbit", label: "Rabbit Run", icon: "🐇", tag: "Here one second, bolted the next" },
  { id: "hedgehog", label: "Hog Patrol", icon: "🦔", tag: "Nighttime garden shufflers" },
  { id: "other", label: "Wild Card", icon: "🐾", tag: "Something else entirely" },
];
const ANIMAL_BEH = [
  { id: "chill", label: "Just chilling", desc: "Sleeping, sitting, grooming — not going anywhere" },
  { id: "potter", label: "Pottering about", desc: "Slow wander, sniffing around, exploring" },
  { id: "move", label: "On the move", desc: "Trotting, walking with purpose, alert" },
  { id: "send", label: "Full send", desc: "Running, chasing, zoomies, absolute chaos" },
];
const BIRDS = [
  { id: "garden", label: "Small Garden Bird", icon: "🐦", tag: "Robins, blue tits, wrens" },
  { id: "raptor", label: "Raptor", icon: "🦅", tag: "Hawks, kestrels, buzzards" },
  { id: "owl", label: "Owl", icon: "🦉", tag: "Low light specialists" },
  { id: "waterfowl", label: "Waterfowl", icon: "🦆", tag: "Ducks, geese, swans" },
  { id: "wader", label: "Wader / Shore", icon: "🦩", tag: "Herons, curlews, oystercatchers" },
  { id: "seabird", label: "Seabird", icon: "🕊️", tag: "Gulls, terns, gannets" },
  { id: "corvid", label: "Corvid", icon: "🐦‍⬛", tag: "Crows, magpies, jays" },
  { id: "other", label: "Other", icon: "🪶", tag: "Something else with wings" },
];
const BIRD_SC = [
  { id: "still", label: "Sat there, not doing much", desc: "Perched, preening, looking about", d: "EASY" },
  { id: "ready", label: "Looks like it might go", desc: "Alert, head up, tensed — could bolt", d: "READY" },
  { id: "feed", label: "Feeding", desc: "Head down eating, pauses between pecks", d: "EASY" },
  { id: "swim", label: "Swimming, just vibing", desc: "Floating, paddling gently", d: "EASY" },
  { id: "swim_r", label: "On water, getting restless", desc: "Flapping wings, running on water", d: "READY" },
  { id: "soar", label: "Soaring or gliding", desc: "Big slow circles, riding thermals", d: "TRACK" },
  { id: "fast", label: "In flight, moving fast", desc: "Flapping hard, diving, changing direction", d: "HARD" },
  { id: "nope", label: "It'll probably just sit there", desc: "Been watching ages. Get a portrait.", d: "CHILL" },
];
const LANDS = [
  { id: "vista", label: "Wide Vista", icon: "🏔️", desc: "Hills, valleys, peaks, big open skies" },
  { id: "wood", label: "Woodland", icon: "🌲", desc: "Trees, forest paths, dappled light" },
  { id: "water", label: "Water Feature", icon: "💧", desc: "Streams, lakes, waterfalls, coast" },
  { id: "urban", label: "Urban / Architecture", icon: "🏙️", desc: "Buildings, streets, structures" },
  { id: "close", label: "Close-up Nature", icon: "🌿", desc: "Flowers, textures, frost, moss, fungi" },
  { id: "night", label: "Night Sky", icon: "🌌", desc: "Stars, Milky Way, moon, aurora" },
  { id: "golden", label: "Golden Hour / Sunset", icon: "🌅", desc: "Dramatic light, long shadows" },
  { id: "long", label: "Long Exposure", icon: "🌊", desc: "Silky water, cloud trails" },
];

function WeatherScene({ weather }) {
  if (!weather) return null;
  const c = weather.weathercode;
  const isN = weather.is_day === 0;
  const wind = weather.windspeed || 0;
  const temp = Math.round(weather.temperature);
  const isSnow = c >= 71 && c <= 77;
  const isRain = c >= 51 && c <= 67;
  const isClear = c <= 1;
  const isPartly = c >= 2 && c <= 3;
  const isOvercast = c >= 4 && c <= 48;
  const isStorm = c >= 80;
  const isWindy = wind > 30;
  const isCold = temp <= 3;

  // Sky gradient
  let skyTop, skyBot;
  if (isN) { skyTop = "#0a0e1a"; skyBot = "#151a2e"; }
  else if (isClear) { skyTop = "#4a8ec2"; skyBot = "#8ec5e8"; }
  else if (isPartly) { skyTop = "#5a8aaa"; skyBot = "#9ab8cc"; }
  else if (isSnow) { skyTop = "#7a8090"; skyBot = "#b0b8c4"; }
  else if (isRain || isStorm) { skyTop = "#3a4050"; skyBot = "#5a6270"; }
  else { skyTop = "#6a7280"; skyBot = "#9aa0a8"; }

  // Ground
  let gnd = isSnow || isCold ? "#d8dce4" : "#3a4a30";
  let gnd2 = isSnow || isCold ? "#c0c8d0" : "#2a3820";

  const particles = [];
  if (isRain) {
    for (let i = 0; i < 12; i++) {
      const x = 20 + Math.random() * 260;
      const y = 10 + Math.random() * 50;
      const d = 0.3 + Math.random() * 0.5;
      particles.push(<line key={`r${i}`} x1={x} y1={y} x2={x - 3} y2={y + 8} stroke="rgba(160,190,220,0.5)" strokeWidth="1" strokeLinecap="round">
        <animate attributeName="y1" values={`${y};${y + 70};${y}`} dur={`${d + 0.8}s`} repeatCount="indefinite" />
        <animate attributeName="y2" values={`${y + 8};${y + 78};${y + 8}`} dur={`${d + 0.8}s`} repeatCount="indefinite" />
      </line>);
    }
  }
  if (isSnow) {
    for (let i = 0; i < 15; i++) {
      const x = 15 + Math.random() * 270;
      const y = 5 + Math.random() * 55;
      const d = 1.5 + Math.random() * 2;
      const r = 1 + Math.random() * 1.5;
      particles.push(<circle key={`s${i}`} cx={x} cy={y} r={r} fill="rgba(220,230,240,0.7)">
        <animate attributeName="cy" values={`${y};${y + 65};${y}`} dur={`${d}s`} repeatCount="indefinite" />
        <animate attributeName="cx" values={`${x};${x + 8};${x - 4};${x}`} dur={`${d * 1.3}s`} repeatCount="indefinite" />
      </circle>);
    }
  }

  // Wind streaks
  const windLines = [];
  if (isWindy) {
    for (let i = 0; i < 5; i++) {
      const y = 20 + i * 12;
      const x = 40 + Math.random() * 100;
      windLines.push(<line key={`w${i}`} x1={x} y1={y} x2={x + 30 + Math.random() * 25} y2={y - 1} stroke="rgba(200,210,220,0.25)" strokeWidth="1" strokeLinecap="round">
        <animate attributeName="x1" values={`${x};${x + 120};${x}`} dur={`${1.2 + Math.random() * 0.6}s`} repeatCount="indefinite" />
        <animate attributeName="x2" values={`${x + 40};${x + 160};${x + 40}`} dur={`${1.2 + Math.random() * 0.6}s`} repeatCount="indefinite" />
      </line>);
    }
  }

  return (
    <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
      <svg viewBox="0 0 300 80" style={{ display: "block", width: "100%" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={skyTop} /><stop offset="100%" stopColor={skyBot} /></linearGradient>
          <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={gnd} /><stop offset="100%" stopColor={gnd2} /></linearGradient>
        </defs>
        {/* Sky */}
        <rect width="300" height="80" fill="url(#sky)" />
        {/* Ground */}
        <ellipse cx="150" cy="82" rx="180" ry="20" fill="url(#gnd)" />

        {/* Sun or Moon */}
        {!isOvercast && !isRain && !isStorm && !isSnow && (
          isN
            ? <><circle cx="240" cy="18" r="8" fill="#e8e4d0" opacity="0.9" /><circle cx="237" cy="16" r="7" fill={skyTop} /></>
            : <circle cx="240" cy="20" r="12" fill="#f0d870" opacity="0.85"><animate attributeName="opacity" values="0.85;0.95;0.85" dur="4s" repeatCount="indefinite" /></circle>
        )}

        {/* Clouds */}
        {(isPartly || isOvercast || isRain || isStorm) && <>
          <g opacity={isOvercast || isRain ? "0.7" : "0.5"}>
            <ellipse cx="70" cy="22" rx="32" ry="10" fill={isRain ? "#4a5060" : "#8a9098"} />
            <ellipse cx="58" cy="20" rx="18" ry="9" fill={isRain ? "#505868" : "#9aa0a8"} />
            <ellipse cx="85" cy="20" rx="20" ry="9" fill={isRain ? "#485060" : "#8a9098"} />
          </g>
          <g opacity={isOvercast || isRain ? "0.6" : "0.4"} transform={`translate(${isWindy ? 0 : 0}, 0)`}>
            <ellipse cx="190" cy="16" rx="28" ry="9" fill={isRain ? "#485060" : "#8a9098"} />
            <ellipse cx="175" cy="14" rx="16" ry="8" fill={isRain ? "#505868" : "#9aa0a8"} />
            <ellipse cx="205" cy="15" rx="18" ry="8" fill={isRain ? "#4a5060" : "#8a9098"} />
          </g>
        </>}

        {/* Fog layer for overcast */}
        {isOvercast && !isRain && !isSnow && <rect x="0" y="45" width="300" height="20" fill="rgba(140,150,160,0.12)" />}

        {/* Stars at night */}
        {isN && isClear && <>
          {[{x:40,y:12},{x:90,y:8},{x:130,y:18},{x:180,y:6},{x:210,y:14},{x:260,y:10},{x:55,y:28},{x:160,y:30}].map((s,i) =>
            <circle key={`st${i}`} cx={s.x} cy={s.y} r={0.8 + Math.random()} fill="#e8e4d0" opacity={0.4 + Math.random() * 0.4}>
              <animate attributeName="opacity" values={`${0.3 + Math.random() * 0.3};${0.7 + Math.random() * 0.3};${0.3 + Math.random() * 0.3}`} dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
            </circle>
          )}
        </>}

        {/* Water hint on ground */}
        <ellipse cx="120" cy="72" rx="35" ry="4" fill="rgba(100,140,170,0.15)" />
        <ellipse cx="180" cy="74" rx="20" ry="3" fill="rgba(100,140,170,0.1)" />

        {/* Distant treeline */}
        {!isSnow && <path d="M0,62 Q15,52 30,62 Q42,54 55,62 Q65,55 78,62 Q88,53 100,62 Q112,54 125,62 Q135,56 148,62 Q160,52 172,62 Q182,55 195,62 Q208,53 220,62 Q230,56 245,62 Q255,52 268,62 Q278,56 290,62 L300,62 L300,68 L0,68 Z" fill="rgba(30,50,25,0.4)" />}
        {isSnow && <path d="M0,62 Q15,54 30,62 Q42,56 55,62 Q65,57 78,62 Q88,55 100,62 Q112,56 125,62 Q135,58 148,62 Q160,54 172,62 Q182,57 195,62 Q208,55 220,62 Q230,58 245,62 Q255,54 268,62 Q278,58 290,62 L300,62 L300,68 L0,68 Z" fill="rgba(180,190,200,0.35)" />}

        {particles}
        {windLines}
      </svg>

      {/* Condition badges */}
      <div style={{ position: "absolute", bottom: 6, right: 8, display: "flex", gap: 4 }}>
        {isWindy && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.5)", color: "#a0b8cc", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>💨 {Math.round(wind)}km/h</span>}
        {isCold && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.5)", color: "#a0c0e0", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>🥶 {temp}°C</span>}
        {isWindy && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.5)", color: "#c0a070", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>🚁 tricky</span>}
      </div>
    </div>
  );
}

function parseW(w) {
  if (!w) return { label: "Unknown", icon: "☁️" };
  const c = w.weathercode;
  if (c <= 1) return { label: "Clear", icon: "☀️" };
  if (c <= 3) return { label: "Partly Cloudy", icon: "⛅" };
  if (c <= 48) return { label: "Overcast", icon: "☁️" };
  if (c <= 67) return { label: "Rainy", icon: "🌧️" };
  if (c <= 77) return { label: "Snow", icon: "❄️" };
  return { label: "Stormy", icon: "⛈️" };
}

/* ─── KNOWLEDGE + PROMPT ─── */
const KB = `You are an expert photography advisor for the OM SYSTEM OM-1 Mark II with deep knowledge from Phil Norton's guide.

CAMERA: 20.4MP Stacked BSI, ISO 200-25600 (usable ~6400), 1053 cross-type AF points, 5-axis IBIS (7 stops body, 8.5 Sync IS), electronic shutter to 1/32000s.

FN LEVER (Mode 2): Two positions each store INDEPENDENT AF Mode + AF Target per Custom Mode. ALWAYS specify both.

DRIVE MODES: Sequential L ~10fps mechanical. Silent Seq ~10fps electronic. SH2 12.5-50fps C-AF+metering maintained, min 1/160s blackout-free (best action mode). SH1 12.5-120fps AF+metering FIRST FRAME ONLY above 20fps. Pro Capture H (SH2-based) pre-frames with continuous AF up to 99. Pro Capture L (SH1-based) first-frame AF only.

AF BUTTON PRIORITY: When Subject Detection ON, shutter half-press and AF-ON can have different priorities. Option 1 "Subject Detect Priority" tracks detected subject. Option 2 "AF Target Priority" uses C-AF+Tracking. Assign to different buttons for instant fallback.

SUBJECT DETECTION: Bird, Dogs & Cats, Human, Cars/Trains/Planes. C-AF+Tracking DISABLED when Subject Detection ON (Mark II change). Dogs & Cats is hit-and-miss for non-domestic animals.

C-AF AREA: "All" = detection tracks across entire frame. "Target" = only within selected target.

DIAL SWAP (wildlife): Cog>1.Ops>Dial Settings>M/B: Front→ISO, Rear→Shutter. Aperture via Exp Comp+arrows.

BUTTONS (per CM): Exp Comp, Record, ISO, AF-ON, AEL, Arrow R/D, Front Bottom/Top, Lens Fn.

COMPUTATIONAL (cannot combine): Live ND (to ND128/7 stops, S or M only), Live GND, Hi Res, Focus BKT/Stack, Live Composite, Live Time, Starry Sky AF.

SYNC IS LENSES (8.5 stops): 12-40 f/2.8 PRO II, 12-100 f/4 IS PRO, 100-400 f/5-6.3 IS, 150-400 f/4.5 IS PRO, 90mm f/3.5 Macro IS PRO.

IS MODES: S-IS Auto (general), S-IS 1 (vertical pan), S-IS 2 (horizontal pan).
Low ISO Processing: Detail (landscapes) or Drive Speed (wildlife/action).`;

function buildPrompt(mode, sel, weather, extra, availLenses, mountedId) {
  const w = parseW(weather);
  const isN = weather?.is_day === 0;
  const t = weather ? Math.round(weather.temperature) : null;
  const ws = weather ? `WEATHER: ${w.label}, ${t}°C, wind ${weather.windspeed}km/h. ${isN ? "Night." : "Day."}` : "Assume overcast UK.";

  const ml = mountedId ? LENS_DB.find(l => l.id === mountedId) : null;
  const bag = availLenses.filter(id => id !== mountedId).map(id => LENS_DB.find(l => l.id === id)).filter(Boolean);
  let ls = "";
  if (ml) {
    ls = `MOUNTED LENS: ${ml.name} (${ml.equiv}, f/${ml.maxAp}${ml.syncIS ? ", Sync IS" : ""}). Optimise for THIS lens.`;
    if (bag.length) ls += `\nALSO IN BAG: ${bag.map(l => `${l.name} (${l.equiv}, f/${l.maxAp}${l.syncIS?", Sync IS":""})`).join("; ")}. If notably better option exists, mention in would_swap.`;
  } else {
    const all = availLenses.map(id => LENS_DB.find(l => l.id === id)).filter(Boolean);
    ls = `AVAILABLE LENSES: ${all.map(l => `${l.name} (${l.equiv}, f/${l.maxAp}${l.syncIS?", Sync IS":""})`).join("; ")}. Recommend the best one.`;
  }

  let sc = "";
  if (mode === "animals") {
    const a = ANIMALS.find(x => x.id === sel.animal), b = ANIMAL_BEH.find(x => x.id === sel.beh);
    sc = `ANIMAL: ${a?.label}. Behaviour: "${b?.label}" — ${b?.desc}. Use Dogs & Cats detection (fallback: C-AF+Tracking).`;
  } else if (mode === "birds") {
    const bt = BIRDS.find(x => x.id === sel.bird), bs = BIRD_SC.find(x => x.id === sel.birdSc);
    sc = `BIRD: ${bt?.label}. Scenario: "${bs?.label}" — ${bs?.desc} [${bs?.d}]. Use Bird detection. C-AF+Tracking disabled when active — use AF Button Priority fallback.`;
  } else if (mode === "landscape") {
    const lt = LANDS.find(x => x.id === sel.land);
    sc = `LANDSCAPE: ${lt?.label} — ${lt?.desc}. ${ws} Factor weather into lens/settings.`;
  }

  return `${KB}\n\n${ws}\n${sc}\n${ls}\n${extra ? `NOTES: ${extra}` : ""}

Respond ONLY with valid JSON (no markdown):
{"preset_name":"Branded name","shooting_mode":"A/S/M + reason","recommended_lens":"lens name","lens_reason":"why","would_swap":"better lens or null","swap_reason":"why or null","aperture":"f/X","shutter_speed":"1/Xs","iso":"value","metering":"mode","drive_mode":"mode+fps","drive_reason":"why","lever1_af_mode":"mode","lever1_af_target":"target","lever1_use":"when","lever2_af_mode":"mode","lever2_af_target":"target","lever2_use":"when","subject_detection":"mode","af_button_shutter":"function","af_button_afon":"function","c_af_area":"All/Target","c_af_sensitivity":"value+reason","btn_exp_comp":"fn","btn_iso":"fn","btn_af_on":"fn","btn_ael":"fn","btn_arrow_right":"fn","btn_arrow_down":"fn","btn_front_bottom":"fn","btn_front_top":"fn","btn_lens_fn":"fn","dial_config":"description","is_mode":"mode+reason","special_feature":"feature or null","special_feature_detail":"detail or null","low_iso_processing":"Detail/Drive Speed","tips":["tip1","tip2","tip3","tip4"],"why":"3-4 sentences","setup_steps":["step1","step2","step3"]}

Be SPECIFIC. Real menu paths. Justify everything by scenario + lens + conditions.`;
}

/* ─── STYLES ─── */
const FONTS = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap";
const C = {
  bg:"#0c0c0b",srf:"#141413",bdr:"rgba(255,255,255,0.06)",bdrA:"rgba(200,185,160,0.3)",
  gold:"#c8b9a0",gD:"#8a7d6a",gB:"#e8dcc8",txt:"#c4c0b8",tD:"#6a6a64",tM:"#4a4a46",
  acc:"#d4a574",red:"#c87060",grn:"#70c880",blu:"#70b4c8",wrn:"#b4a050",
};

/* ─── COMPONENTS ─── */
function Card({sel,onClick,icon,label,tag}){return(
  <button onClick={onClick} style={{padding:"14px",cursor:"pointer",textAlign:"left",width:"100%",background:sel?"rgba(200,185,160,0.08)":C.srf,border:`1px solid ${sel?C.bdrA:C.bdr}`,borderRadius:10,transition:"all .15s",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:12}}>
    <span style={{fontSize:26,flexShrink:0,lineHeight:1}}>{icon}</span>
    <div style={{minWidth:0}}>
      <div style={{fontSize:13,fontWeight:600,color:sel?C.gB:"#aaa",fontFamily:"'JetBrains Mono',monospace"}}>{label}</div>
      <div style={{fontSize:11,color:C.tD,marginTop:2}}>{tag}</div>
    </div>
  </button>
);}

function Chip({sel,onClick,label,desc,d}){
  const dc={EASY:C.grn,READY:C.blu,TRACK:C.wrn,HARD:C.red,CHILL:C.grn};
  return(<button onClick={onClick} style={{padding:"13px 16px",cursor:"pointer",textAlign:"left",width:"100%",background:sel?"rgba(200,185,160,0.08)":C.srf,border:`1px solid ${sel?C.bdrA:C.bdr}`,borderRadius:10,transition:"all .15s",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
    <div><div style={{fontSize:13,fontWeight:600,color:sel?C.gB:"#aaa"}}>{label}</div><div style={{fontSize:11,color:C.tD,marginTop:2}}>{desc}</div></div>
    {d&&<span style={{fontSize:9,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",padding:"3px 7px",borderRadius:5,flexShrink:0,background:`${dc[d]||C.tD}18`,color:dc[d]||C.tD}}>{d}</span>}
  </button>);
}

function SL({children}){return <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:C.tD,fontFamily:"'JetBrains Mono',monospace",marginBottom:10,marginTop:28}}>{children}</div>;}
function SC({label,value,sub}){return(
  <div style={{background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
    <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",color:C.tD,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{label}</div>
    <div style={{fontSize:16,fontWeight:700,color:C.gB,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.15,wordBreak:"break-word"}}>{value}</div>
    {sub&&<div style={{fontSize:9,color:C.tM,marginTop:3}}>{sub}</div>}
  </div>
);}
function BR({label,value,icon}){return(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>{icon&&<span style={{fontSize:10,opacity:.4,fontFamily:"'JetBrains Mono',monospace"}}>{icon}</span>}<span style={{fontSize:11,color:C.tD,fontFamily:"'JetBrains Mono',monospace"}}>{label}</span></div>
    <span style={{fontSize:11,color:C.gold,fontFamily:"'JetBrains Mono',monospace",fontWeight:500,textAlign:"right",maxWidth:"55%"}}>{value}</span>
  </div>
);}
function RS({title,icon,children,ac}){return(
  <div style={{background:ac?`${ac}08`:"transparent",border:`1px solid ${ac?`${ac}20`:C.bdr}`,borderRadius:12,padding:16,marginBottom:12}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:ac||C.gD,fontFamily:"'JetBrains Mono',monospace",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>{icon&&<span style={{fontSize:13}}>{icon}</span>}{title}</div>
    {children}
  </div>
);}

/* ─── LENS KIT PANEL ─── */
function KitPanel({kit,setKit,onClose}){
  const [q,setQ]=useState("");
  const cats={};LENS_DB.forEach(l=>{if(!cats[l.cat])cats[l.cat]=[];cats[l.cat].push(l);});
  const fl=q.trim()?LENS_DB.filter(l=>l.name.toLowerCase().includes(q.toLowerCase())||l.equiv.includes(q)):LENS_DB;
  const fc={};fl.forEach(l=>{if(!fc[l.cat])fc[l.cat]=[];fc[l.cat].push(l);});
  const tog=id=>{const n=kit.includes(id)?kit.filter(x=>x!==id):[...kit,id];setKit(n);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column"}}>
      <div style={{maxWidth:600,width:"100%",margin:"0 auto",flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"20px 20px 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><div style={{fontSize:16,fontWeight:700,color:C.gB}}>My Lens Kit</div><div style={{fontSize:11,color:C.tD,marginTop:2}}>{kit.length} selected</div></div>
            <button onClick={onClose} style={{padding:"8px 16px",border:`1px solid ${C.bdrA}`,background:"transparent",borderRadius:8,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Done</button>
          </div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search lenses…" style={{width:"100%",padding:"10px 14px",background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:8,color:C.txt,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none",marginBottom:12}}/>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"0 20px 20px"}}>
          {Object.entries(fc).map(([cat,lenses])=>(
            <div key={cat}>
              <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:C.tD,fontFamily:"'JetBrains Mono',monospace",margin:"14px 0 6px",position:"sticky",top:0,background:"rgba(12,12,11,0.95)",padding:"4px 0",zIndex:2}}>{cat}</div>
              {lenses.map(l=>{const own=kit.includes(l.id);return(
                <button key={l.id} onClick={()=>tog(l.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 12px",marginBottom:4,cursor:"pointer",textAlign:"left",background:own?"rgba(200,185,160,0.08)":C.srf,border:`1px solid ${own?C.bdrA:C.bdr}`,borderRadius:8,fontFamily:"'Outfit',sans-serif"}}>
                  <div><div style={{fontSize:12,fontWeight:600,color:own?C.gB:"#999"}}>{l.name}</div><div style={{fontSize:10,color:C.tD,marginTop:1}}>{l.equiv} · f/{l.maxAp}{l.syncIS?" · Sync IS":""}</div></div>
                  <div style={{width:20,height:20,borderRadius:5,flexShrink:0,border:`1.5px solid ${own?C.gold:C.bdr}`,background:own?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.bg,fontWeight:700}}>{own?"✓":""}</div>
                </button>
              );})}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LENS SELECTOR ─── */
function LensSel({kit,mt,setMt,bag,setBag}){
  const lenses=kit.map(id=>LENS_DB.find(l=>l.id===id)).filter(l=>l&&l.type!=="tc");
  if(!lenses.length)return null;
  return(<div>
    <SL>What's on the camera?</SL>
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {lenses.map(l=>{const isM=mt===l.id,isB=bag.includes(l.id);return(
        <div key={l.id} style={{display:"flex",gap:4}}>
          <button onClick={()=>setMt(isM?null:l.id)} style={{flex:1,padding:"10px 12px",cursor:"pointer",textAlign:"left",background:isM?"rgba(200,185,160,0.1)":C.srf,border:`1px solid ${isM?C.bdrA:C.bdr}`,borderRadius:8,fontFamily:"'Outfit',sans-serif"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:isM?C.gB:C.tM}}>{isM?"◉":"○"}</span>
              <div><div style={{fontSize:12,fontWeight:600,color:isM?C.gB:"#999"}}>{l.name.replace("M.Zuiko ","")}</div><div style={{fontSize:10,color:C.tD}}>{l.equiv}{l.syncIS?" · Sync IS":""}</div></div>
            </div>
          </button>
          {!isM&&<button onClick={()=>setBag(isB?bag.filter(x=>x!==l.id):[...bag,l.id])} title="In bag" style={{width:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:isB?"rgba(112,180,200,0.08)":C.srf,border:`1px solid ${isB?"rgba(112,180,200,0.25)":C.bdr}`,borderRadius:8,fontSize:14,fontFamily:"'Outfit',sans-serif"}}><span style={{opacity:isB?1:0.3}}>🎒</span></button>}
        </div>
      );})}
    </div>
    {mt&&bag.length>0&&<div style={{fontSize:10,color:C.tD,marginTop:6}}><span style={{color:C.blu}}>🎒 In bag:</span> {bag.map(id=>LENS_DB.find(l=>l.id===id)?.name.replace("M.Zuiko ","")).join(", ")}</div>}
    {!mt&&<div style={{fontSize:10,color:C.tM,marginTop:6}}>Tap a lens to set as mounted, or just hit Get Settings for a recommendation</div>}
  </div>);
}

/* ─── FORECAST ANALYSIS ─── */
function analyzeForecast(forecast, currentWeather) {
  if (!forecast || !forecast.time) return null;
  const now = new Date();
  const nowH = now.getHours();

  // Find current hour index
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

  // Find next sun window (cloud < 50 and day)
  let nextSun = null;
  for (const h of upcoming) {
    if (h.cloud < 50 && h.isDay) { nextSun = h; break; }
  }

  // Find next rain risk (prob > 40)
  let nextRain = null;
  for (const h of upcoming) {
    if (h.rainProb > 40) { nextRain = h; break; }
  }

  // Find next clear-ish window (cloud < 30)
  let nextClear = null;
  for (const h of upcoming) {
    if (h.cloud < 30 && h.isDay) { nextClear = h; break; }
  }

  // Golden hour calc (rough: sunset - 1hr)
  // Simple approximation for UK latitude
  const month = now.getMonth();
  const sunsetApprox = [16.5, 17.2, 18, 19.8, 20.8, 21.3, 21, 20.2, 19, 17.8, 16.5, 16][month];
  const goldenStart = Math.floor(sunsetApprox - 1);
  const goldenMin = Math.round((sunsetApprox - 1 - goldenStart) * 60);

  // Drone assessment
  const droneOk = currentWeather && currentWeather.windspeed < 30;
  const droneRisky = currentWeather && currentWeather.windspeed >= 20 && currentWeather.windspeed < 30;

  return { upcoming, nextSun, nextRain, nextClear, goldenStart, goldenMin, sunsetApprox, droneOk, droneRisky };
}

function formatHour(h) {
  if (h === 0) return "midnight";
  if (h === 12) return "noon";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

/* ─── CONDITIONS DASHBOARD ─── */
function ConditionsDash({ weather, forecast, weatherLive }) {
  if (!weather) return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: C.tD }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${C.bdr}`, borderTop: `2px solid ${C.gB}`, borderRadius: "50%", margin: "0 auto 10px", animation: "spin .8s linear infinite" }} />
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>Reading conditions…</div>
    </div>
  );

  const wi = parseW(weather);
  const isN = weather.is_day === 0;
  const temp = Math.round(weather.temperature);
  const wind = Math.round(weather.windspeed);
  const info = analyzeForecast(forecast, weather);

  // Light quality assessment
  let lightLabel, lightColor;
  if (isN) { lightLabel = "Night"; lightColor = "#6a7aaa"; }
  else if (weather.weathercode <= 1) { lightLabel = "Bright / harsh"; lightColor = "#d0a840"; }
  else if (weather.weathercode <= 3) { lightLabel = "Nice diffused"; lightColor = C.grn; }
  else if (weather.weathercode <= 48) { lightLabel = "Soft / flat"; lightColor = C.blu; }
  else { lightLabel = "Dark / moody"; lightColor = "#8a7090"; }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Weather Scene */}
      <WeatherScene weather={weather} />

      {/* Conditions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        <div style={{ background: C.srf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "12px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.tD, fontFamily: "'JetBrains Mono',monospace", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Right now</span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: weatherLive ? `${C.grn}15` : `${C.wrn}15`, color: weatherLive ? C.grn : C.wrn }}>{weatherLive ? "● LIVE" : "◌ SNAPSHOT"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{isN ? "🌙" : wi.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.gB, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{temp}°C</div>
              <div style={{ fontSize: 11, color: C.tD, marginTop: 2 }}>{wi.label}</div>
            </div>
          </div>
        </div>

        <div style={{ background: C.srf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "12px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.tD, fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>Light quality</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: lightColor, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.2 }}>{lightLabel}</div>
          <div style={{ fontSize: 10, color: C.tD, marginTop: 4 }}>
            {isN ? "Low ISO + tripod territory" :
             weather.weathercode <= 1 ? "Watch for blown highlights" :
             weather.weathercode <= 3 ? "Great for most subjects" :
             weather.weathercode <= 48 ? "Even tones, no harsh shadows" :
             "Boost ISO, embrace the mood"}
          </div>
        </div>
      </div>

      {/* Wind + Drone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
        <div style={{ background: C.srf, border: `1px solid ${wind > 30 ? `${C.red}30` : C.bdr}`, borderRadius: 10, padding: "12px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.tD, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>Wind</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: wind > 30 ? C.red : wind > 20 ? C.wrn : C.gB, fontFamily: "'JetBrains Mono',monospace" }}>{wind} km/h</div>
          <div style={{ fontSize: 10, color: C.tD, marginTop: 2 }}>
            {wind < 10 ? "Dead calm — long exposures fine" :
             wind < 20 ? "Light breeze — no issues" :
             wind < 30 ? "Breezy — brace for tele shots" :
             "Strong — tripod may shake"}
          </div>
        </div>

        <div style={{ background: C.srf, border: `1px solid ${!info?.droneOk ? `${C.red}30` : C.bdr}`, borderRadius: 10, padding: "12px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.tD, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>🚁 Drone</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: info?.droneOk ? (info?.droneRisky ? C.wrn : C.grn) : C.red, fontFamily: "'JetBrains Mono',monospace" }}>
            {info?.droneOk ? (info?.droneRisky ? "Risky" : "Good to fly") : "Grounded"}
          </div>
          <div style={{ fontSize: 10, color: C.tD, marginTop: 2 }}>
            {!info?.droneOk ? `${wind}km/h — too gusty for Mini 4 Pro` :
             info?.droneRisky ? "Flyable but expect drift" :
             "Conditions look fine"}
          </div>
        </div>
      </div>

      {/* Forecast alerts */}
      {info && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {info.nextSun && weather.weathercode > 3 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${C.wrn}08`, border: `1px solid ${C.wrn}15`, borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>☀️</span>
              <div style={{ fontSize: 11, color: C.wrn }}>Sun due around <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{formatHour(info.nextSun.hour)}</span> <span style={{ color: C.tD }}>({info.nextSun.cloud}% cloud)</span></div>
            </div>
          )}

          {info.nextRain && weather.weathercode < 50 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${C.blu}08`, border: `1px solid ${C.blu}15`, borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>🌧️</span>
              <div style={{ fontSize: 11, color: C.blu }}>Rain risk from <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{formatHour(info.nextRain.hour)}</span> <span style={{ color: C.tD }}>({info.nextRain.rainProb}% chance)</span></div>
            </div>
          )}

          {!isN && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${C.acc}08`, border: `1px solid ${C.acc}15`, borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>🌅</span>
              <div style={{ fontSize: 11, color: C.acc }}>Golden hour starts ~<span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{info.goldenStart}:{String(info.goldenMin).padStart(2,"0")}</span> <span style={{ color: C.tD }}>(sunset ~{Math.floor(info.sunsetApprox)}:{String(Math.round((info.sunsetApprox % 1) * 60)).padStart(2,"0")})</span></div>
            </div>
          )}
        </div>
      )}

      {/* Mini hourly strip */}
      {info?.upcoming?.length > 0 && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: C.srf, border: `1px solid ${C.bdr}`, borderRadius: 10 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.tD, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>Next few hours</div>
          <div style={{ display: "flex", gap: 0, overflow: "auto" }}>
            {info.upcoming.slice(0, 8).map((h, i) => {
              const hW = { weathercode: h.code, is_day: h.isDay };
              const hw = parseW(hW);
              const isNow = i === 0;
              return (
                <div key={i} style={{ flex: "0 0 auto", width: 44, textAlign: "center", padding: "4px 2px", borderRadius: 6, background: isNow ? `${C.gold}10` : "transparent" }}>
                  <div style={{ fontSize: 9, color: isNow ? C.gold : C.tM, fontFamily: "'JetBrains Mono',monospace", fontWeight: isNow ? 700 : 400 }}>{isNow ? "now" : formatHour(h.hour)}</div>
                  <div style={{ fontSize: 14, margin: "2px 0" }}>{h.isDay ? hw.icon : "🌙"}</div>
                  <div style={{ fontSize: 9, color: C.tD, fontFamily: "'JetBrains Mono',monospace" }}>{h.temp}°</div>
                  {h.rainProb > 30 && <div style={{ fontSize: 8, color: C.blu, fontFamily: "'JetBrains Mono',monospace" }}>{h.rainProb}%💧</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */
export default function App(){
  const [kit,setKit,kitLoaded]=usePersistedKit();
  const [showKit,setShowKit]=useState(false);
  const [mt,setMt]=useState(null);
  const [bag,setBag]=useState([]);
  const [mode,setMode]=useState(null);
  const [animal,setAnimal]=useState("");
  const [beh,setBeh]=useState("");
  const [bird,setBird]=useState("");
  const [birdSc,setBirdSc]=useState("");
  const [land,setLand]=useState("");
  const [extra,setExtra]=useState("");
  const [weather,setW]=useState(null);
  const [forecast,setForecast]=useState(null);
  const [weatherLive,setWeatherLive]=useState(false);
  const [result,setR]=useState(null);
  const [loading,setL]=useState(false);
  const [err,setErr]=useState(null);
  const [showS,setShowS]=useState(false);
  const rr=useRef(null);

  useEffect(()=>{
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=53.41&longitude=-2.16&current_weather=true&hourly=weathercode,temperature_2m,windspeed_10m,cloudcover,precipitation_probability,is_day&forecast_days=1&timezone=Europe/London", { signal: controller.signal })
      .then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
      .then(d=>{setW(d.current_weather);setForecast(d.hourly||null);setWeatherLive(true);})
      .catch(()=>{/* weather unavailable — dashboard shows loading state */})
      .finally(()=>clearTimeout(timeout));
    return ()=>{controller.abort();clearTimeout(timeout);};
  },[]);

  const wi=parseW(weather);const isN=weather?.is_day===0;const tc=weather?Math.round(weather.temperature):null;
  function reset(){setMode(null);setAnimal("");setBeh("");setBird("");setBirdSc("");setLand("");setExtra("");setR(null);setErr(null);setShowS(false);setMt(null);setBag([]);}
  function canGo(){if(loading||!kit.length)return false;if(mode==="animals")return animal&&beh;if(mode==="birds")return bird&&birdSc;if(mode==="landscape")return!!land;return false;}

  async function go(){
    setL(true);setErr(null);setR(null);setShowS(false);
    const sel={animal,beh,bird,birdSc,land};
    const avail=mt?[mt,...bag]:kit;
    const p=buildPrompt(mode,sel,weather,extra,avail,mt);
    try{
      const res=await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:p})});
      if(!res.ok)throw new Error(res.status);
      const d=await res.json();const txt=d.text||"";
      setR(JSON.parse(txt.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim()));
    }catch(e){console.error(e);setErr("Something went wrong — try again.");}
    finally{setL(false);}
  }

  useEffect(()=>{if(result&&rr.current)rr.current.scrollIntoView({behavior:"smooth",block:"start"});},[result]);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.txt,fontFamily:"'Outfit',sans-serif"}}>
      <link href={FONTS} rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}::selection{background:${C.gold}30}*{box-sizing:border-box}input::placeholder{color:${C.tM}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.bdr};border-radius:4px}`}</style>

      {showKit&&<KitPanel kit={kit} setKit={setKit} onClose={()=>setShowKit(false)}/>}

      {/* HEADER */}
      <header style={{padding:"22px 20px 18px",borderBottom:`1px solid ${C.bdr}`,background:"linear-gradient(180deg,rgba(200,185,160,0.03),transparent)"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.gB},${C.gD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.bg,fontWeight:700}}>◎</div>
            <div><div style={{fontSize:15,fontWeight:700,color:C.gB}}>OM Settings Advisor</div><div style={{fontSize:9,color:C.tD,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>OM-1 Mark II</div></div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {weather&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:14}}><span style={{fontSize:11}}>{isN?"🌙":wi.icon}</span><span style={{fontSize:10,color:C.tD,fontFamily:"'JetBrains Mono',monospace"}}>{tc}°</span></div>}
            <button onClick={()=>setShowKit(true)} style={{padding:"4px 10px",cursor:"pointer",background:!kit.length?`${C.acc}15`:C.srf,border:`1px solid ${!kit.length?`${C.acc}40`:C.bdr}`,borderRadius:14,display:"flex",alignItems:"center",gap:4,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:!kit.length?C.acc:C.tD,animation:!kit.length?"pulse 2s ease infinite":"none"}}><span style={{fontSize:11}}>📷</span>{!kit.length?"Add lenses":`${kit.length} lens${kit.length!==1?"es":""}`}</button>
          </div>
        </div>
      </header>

      <main style={{maxWidth:600,margin:"0 auto",padding:"0 20px 60px"}}>

        {!kit.length&&<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:36,marginBottom:12}}>📷</div><div style={{fontSize:16,fontWeight:600,color:C.gB,marginBottom:6}}>Set up your lens kit</div><div style={{fontSize:13,color:C.tD,lineHeight:1.5,maxWidth:320,margin:"0 auto 20px"}}>Add your lenses so recommendations match your actual glass.</div><button onClick={()=>setShowKit(true)} style={{padding:"12px 28px",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.gB},${C.gold})`,color:C.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Add My Lenses</button></div>}

        {!!kit.length&&<>
          {/* CONDITIONS DASHBOARD - always visible */}
          <ConditionsDash weather={weather} forecast={forecast} weatherLive={weatherLive} />

          {/* MODE */}
          <SL>What are you shooting?</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[{id:"animals",icon:"🐾",label:"Animals",sub:"Cat Snaps & more"},{id:"birds",icon:"🦅",label:"Birds",sub:"Tweet Settings"},{id:"landscape",icon:"🏔️",label:"Landscape",sub:"Weather-aware"}].map(m=>(
              <button key={m.id} onClick={()=>{setMode(m.id);setAnimal("");setBeh("");setBird("");setBirdSc("");setLand("");setR(null);setErr(null);setShowS(false);setMt(null);setBag([]);}} style={{padding:"16px 10px",cursor:"pointer",textAlign:"center",background:mode===m.id?"rgba(200,185,160,0.08)":C.srf,border:`${mode===m.id?"1.5px":"1px"} solid ${mode===m.id?C.bdrA:C.bdr}`,borderRadius:12,fontFamily:"'Outfit',sans-serif"}}>
                <div style={{fontSize:24,marginBottom:4}}>{m.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:mode===m.id?C.gB:"#aaa"}}>{m.label}</div>
                <div style={{fontSize:10,color:C.tM,marginTop:2}}>{m.sub}</div>
              </button>
            ))}
          </div>

          {mode==="animals"&&<><SL>Pick your preset</SL><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{ANIMALS.map(a=><Card key={a.id} sel={animal===a.id} onClick={()=>{setAnimal(a.id);setBeh("");}} icon={a.icon} label={a.label} tag={a.tag}/>)}</div>{animal&&<><SL>What's it doing?</SL><div style={{display:"flex",flexDirection:"column",gap:6}}>{ANIMAL_BEH.map(b=><Chip key={b.id} sel={beh===b.id} onClick={()=>setBeh(b.id)} label={b.label} desc={b.desc}/>)}</div></>}</>}

          {mode==="birds"&&<><SL>What kind of bird?</SL><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{BIRDS.map(b=><Card key={b.id} sel={bird===b.id} onClick={()=>{setBird(b.id);setBirdSc("");}} icon={b.icon} label={b.label} tag={b.tag}/>)}</div>{bird&&<><SL>What's it going to do?</SL><div style={{display:"flex",flexDirection:"column",gap:6}}>{BIRD_SC.map(s=><Chip key={s.id} sel={birdSc===s.id} onClick={()=>setBirdSc(s.id)} label={s.label} desc={s.desc} d={s.d}/>)}</div></>}</>}

          {mode==="landscape"&&<><SL>What kind of scene?</SL><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{LANDS.map(l=><Card key={l.id} sel={land===l.id} onClick={()=>setLand(l.id)} icon={l.icon} label={l.label} tag={l.desc}/>)}</div>{land&&weather&&<><WeatherScene weather={weather}/><div style={{marginTop:8,padding:"10px 14px",background:`${C.gold}08`,border:`1px solid ${C.gold}18`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>{isN?"🌙":wi.icon}</span><div><div style={{fontSize:11,color:C.gold,fontFamily:"'JetBrains Mono',monospace"}}>Live weather → lens + settings</div><div style={{fontSize:10,color:C.tD,marginTop:1}}>{wi.label}, {tc}°C</div></div></div></>}</>}

          {mode&&<LensSel kit={kit} mt={mt} setMt={setMt} bag={bag} setBag={setBag}/>}

          {mode&&<>
            <div style={{marginTop:16}}><SL>Anything else? <span style={{color:C.tM,textTransform:"none",letterSpacing:0}}>(optional)</span></SL><input value={extra} onChange={e=>setExtra(e.target.value)} placeholder="e.g. 'handheld', 'through a window', 'want bokeh'…" style={{width:"100%",padding:"12px 14px",background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:8,color:C.txt,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none"}}/></div>
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <button onClick={reset} style={{padding:"12px 16px",background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:10,color:C.tD,fontSize:12,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Reset</button>
              <button onClick={go} disabled={!canGo()} style={{flex:1,padding:"12px",border:"none",borderRadius:10,background:canGo()?`linear-gradient(135deg,${C.gB},${C.gold})`:"rgba(255,255,255,0.04)",color:canGo()?C.bg:C.tM,fontSize:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:canGo()?"pointer":"not-allowed"}}>{loading?"Working it out…":"Get Settings"}</button>
            </div>
          </>}

          {loading&&<div style={{textAlign:"center",padding:"32px 0",color:C.tD}}><div style={{width:24,height:24,border:`2px solid ${C.bdr}`,borderTop:`2px solid ${C.gB}`,borderRadius:"50%",margin:"0 auto 12px",animation:"spin .8s linear infinite"}}/><div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Dialling in your shot…</div></div>}
          {err&&<div style={{marginTop:14,padding:"12px 14px",background:`${C.red}12`,border:`1px solid ${C.red}25`,borderRadius:8,color:C.red,fontSize:12}}>{err}</div>}

          {/* ═══ RESULTS ═══ */}
          {result&&<div ref={rr} style={{marginTop:24,animation:"fadeUp .4s ease"}}>
            <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.gold}30,transparent)`,marginBottom:20}}/>

            <div style={{background:`linear-gradient(135deg,${C.gold}0c,${C.gold}04)`,border:`1px solid ${C.gold}20`,borderRadius:12,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:C.gD,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>Preset</div>
              <div style={{fontSize:19,fontWeight:800,color:C.gB,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.2,letterSpacing:"-0.03em"}}>{result.preset_name}</div>
              <div style={{fontSize:11,color:C.tD,marginTop:4}}>Mode: <span style={{color:C.gold}}>{result.shooting_mode}</span></div>
            </div>

            <RS title="Lens" icon="🔭" ac={C.gold}>
              <div style={{fontSize:14,fontWeight:700,color:C.gB,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{result.recommended_lens}</div>
              <div style={{fontSize:12,color:C.tD,lineHeight:1.5}}>{result.lens_reason}</div>
              {result.would_swap&&result.would_swap!=="null"&&<div style={{marginTop:10,padding:"10px 12px",background:`${C.blu}0c`,border:`1px solid ${C.blu}20`,borderRadius:6}}>
                <div style={{fontSize:10,color:C.blu,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,marginBottom:2}}>🔄 Consider swapping to:</div>
                <div style={{fontSize:12,fontWeight:700,color:C.txt}}>{result.would_swap}</div>
                <div style={{fontSize:11,color:C.tD,marginTop:2}}>{result.swap_reason}</div>
              </div>}
            </RS>

            <RS title="Exposure">
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:6}}><SC label="Aperture" value={result.aperture}/><SC label="Shutter" value={result.shutter_speed}/><SC label="ISO" value={result.iso}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><SC label="Metering" value={result.metering}/><SC label="IS Mode" value={result.is_mode}/></div>
            </RS>

            <RS title="Drive Mode" icon="⚡"><div style={{fontSize:14,fontWeight:700,color:C.gB,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{result.drive_mode}</div><div style={{fontSize:11,color:C.tD,lineHeight:1.5}}>{result.drive_reason}</div></RS>

            <RS title="Autofocus" icon="◎" ac={C.blu}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <div style={{background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:12}}><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",color:C.tD,fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>Lever 1</div><div style={{fontSize:13,fontWeight:700,color:C.gB,fontFamily:"'JetBrains Mono',monospace"}}>{result.lever1_af_mode}</div><div style={{fontSize:11,color:C.gold,marginTop:2}}>{result.lever1_af_target}</div><div style={{fontSize:10,color:C.tD,marginTop:4,lineHeight:1.4}}>{result.lever1_use}</div></div>
                <div style={{background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:12}}><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",color:C.tD,fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>Lever 2</div><div style={{fontSize:13,fontWeight:700,color:C.gB,fontFamily:"'JetBrains Mono',monospace"}}>{result.lever2_af_mode}</div><div style={{fontSize:11,color:C.gold,marginTop:2}}>{result.lever2_af_target}</div><div style={{fontSize:10,color:C.tD,marginTop:4,lineHeight:1.4}}>{result.lever2_use}</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><SC label="Subject Detect" value={result.subject_detection}/><SC label="C-AF Area" value={result.c_af_area}/></div>
              {(result.af_button_shutter||result.af_button_afon)&&<div style={{marginTop:8,padding:"10px 12px",background:C.srf,borderRadius:6,border:`1px solid ${C.bdr}`}}><div style={{fontSize:9,textTransform:"uppercase",color:C.tD,fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>AF Button Priority</div><div style={{fontSize:10,color:C.txt,lineHeight:1.6}}><span style={{color:C.gD}}>Shutter ½:</span> {result.af_button_shutter}<br/><span style={{color:C.gD}}>AF-ON:</span> {result.af_button_afon}</div></div>}
              {result.c_af_sensitivity&&<div style={{fontSize:10,color:C.tD,marginTop:6}}>C-AF Sensitivity: <span style={{color:C.gold}}>{result.c_af_sensitivity}</span></div>}
            </RS>

            <RS title="Button Map" icon="⌨"><BR label="Exp Comp" value={result.btn_exp_comp} icon="⊞"/><BR label="ISO Btn" value={result.btn_iso} icon="◆"/><BR label="AF-ON" value={result.btn_af_on} icon="AF"/><BR label="AEL" value={result.btn_ael} icon="AE"/><BR label="Arrow →" value={result.btn_arrow_right} icon="▶"/><BR label="Arrow ↓" value={result.btn_arrow_down} icon="▼"/><BR label="Front ⊙" value={result.btn_front_bottom} icon="◉"/><BR label="Front ⊚" value={result.btn_front_top} icon="◎"/><BR label="Lens Fn" value={result.btn_lens_fn} icon="Fn"/><div style={{marginTop:8,padding:"8px 10px",background:C.srf,borderRadius:6,border:`1px solid ${C.bdr}`,fontSize:10,color:C.tD}}><span style={{color:C.gD}}>Dials:</span> {result.dial_config}</div></RS>

            {result.special_feature&&result.special_feature!=="null"&&<RS title="Special Feature" icon="✦" ac={C.acc}><div style={{fontSize:14,fontWeight:700,color:C.acc,fontFamily:"'JetBrains Mono',monospace"}}>{result.special_feature}</div>{result.special_feature_detail&&result.special_feature_detail!=="null"&&<div style={{fontSize:11,color:C.tD,marginTop:4,lineHeight:1.5}}>{result.special_feature_detail}</div>}</RS>}

            <RS title="Why These Settings"><p style={{fontSize:13,lineHeight:1.65,margin:0,color:C.txt}}>{result.why}</p></RS>

            {result.tips?.length>0&&<RS title="Tips">{result.tips.map((t,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:i<result.tips.length-1?6:0}}><span style={{color:C.gold,fontSize:9,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>→</span><span style={{fontSize:12,lineHeight:1.5,color:C.tD}}>{t}</span></div>)}</RS>}

            {result.setup_steps?.length>0&&<div style={{marginBottom:12}}>
              <button onClick={()=>setShowS(!showS)} style={{width:"100%",padding:"14px 16px",background:C.srf,border:`1px solid ${C.bdr}`,borderRadius:showS?"12px 12px 0 0":"12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Outfit',sans-serif"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13}}>💾</span><span style={{fontSize:12,fontWeight:600,color:C.gold}}>Programme this Custom Mode</span></div>
                <span style={{color:C.tD,fontSize:14,transition:"transform .2s",transform:showS?"rotate(180deg)":"none"}}>▾</span>
              </button>
              {showS&&<div style={{padding:16,background:C.srf,border:`1px solid ${C.bdr}`,borderTop:"none",borderRadius:"0 0 12px 12px",animation:"fadeUp .3s ease"}}>
                {result.setup_steps.map((s,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:i<result.setup_steps.length-1?10:0}}><span style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginTop:2}}>{String(i+1).padStart(2,"0")}</span><span style={{fontSize:12,lineHeight:1.55,color:C.txt}}>{s.replace(/^Step \d+:\s*/,"")}</span></div>)}
                <div style={{marginTop:12,padding:"10px 12px",background:`${C.wrn}10`,borderRadius:6,border:`1px solid ${C.wrn}18`}}><div style={{fontSize:10,color:C.wrn,lineHeight:1.5}}>Set "Save Settings" to <strong>Reset</strong>. Verify by switching mode dial away and back.</div></div>
              </div>}
            </div>}

            <div style={{textAlign:"center",padding:"16px 0 0",borderTop:`1px solid ${C.bdr}`}}><button onClick={reset} style={{padding:"10px 24px",background:"transparent",border:`1px solid ${C.bdr}`,borderRadius:8,color:C.tD,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Start Over</button></div>
          </div>}
        </>}
      </main>
    </div>
  );
}
