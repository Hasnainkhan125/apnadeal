// components/AIAdAssistant.jsx
// ✨ AI Listing Assistant — human-like voice + voice input + bulk input
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMagic, FaTimes, FaPaperPlane, FaMicrophone, FaCheck, FaRedo, FaArrowRight,
  FaCloudUploadAlt, FaTrash, FaPlus, FaVolumeUp, FaVolumeMute,
  FaCar, FaMotorcycle, FaMobileAlt, FaHome, FaLaptop, FaGamepad,
  FaGasPump, FaCog, FaPalette, FaBatteryFull, FaHdd, FaMemory, FaWifi,
  FaBoxOpen, FaFingerprint, FaMobile, FaWrench, FaKey, FaBuilding, FaFileContract,
  FaRulerCombined, FaBed, FaBath, FaLayerGroup, FaCompass, FaParking, FaChair,
  FaMicrochip, FaCamera, FaGem, FaTools, FaCube, FaShippingFast, FaUndo, FaCity,
} from "react-icons/fa";
import { generateWithChat } from "../lib/pollinations";

/* ═══════════════════════════════════════════════════════════════
   ICON MAP
   ═══════════════════════════════════════════════════════════════ */
const SUGGESTION_ICONS = {
  Vehicles: FaCar, Cars: FaCar, Car: FaCar, SUV: FaCar,
  Bikes: FaMotorcycle, Motorcycle: FaMotorcycle, Scooter: FaMotorcycle,
  Mobiles: FaMobileAlt, Mobile: FaMobileAlt, Phone: FaMobileAlt, Phones: FaMobileAlt,
  Property: FaHome, Home: FaHome, House: FaHome, Apartment: FaBuilding,
  Electronics: FaLaptop, Laptop: FaLaptop, Computer: FaLaptop,
  Toys: FaGamepad, Toy: FaGamepad, Game: FaGamepad,
  Petrol: FaGasPump, Diesel: FaGasPump, CNG: FaGasPump, Electric: FaBatteryFull, Hybrid: FaGasPump,
  Automatic: FaCog, Manual: FaCog, CVT: FaCog,
  Sedan: FaCar, Hatchback: FaCar, Crossover: FaCar, Van: FaCar, Pickup: FaCar, Truck: FaCar,
  White: FaPalette, Black: FaPalette, Silver: FaPalette, Grey: FaPalette,
  Red: FaPalette, Blue: FaPalette, Green: FaPalette, Brown: FaPalette,
  Beige: FaPalette, Gold: FaPalette, Purple: FaPalette,
  New: FaCheck, "Like New": FaCheck, Used: FaCheck, "Needs Repair": FaWrench,
  Apple: FaMobileAlt, Samsung: FaMobileAlt, Xiaomi: FaMobileAlt, Oppo: FaMobileAlt,
  Vivo: FaMobileAlt, Realme: FaMobileAlt, OnePlus: FaMobileAlt, Google: FaMobileAlt,
  Infinix: FaMobileAlt, Tecno: FaMobileAlt, Nokia: FaMobileAlt,
  "128GB": FaHdd, "256GB": FaHdd, "512GB": FaHdd, "1TB": FaHdd,
  "4GB": FaMemory, "6GB": FaMemory, "8GB": FaMemory, "12GB": FaMemory, "16GB": FaMemory,
  Yes: FaCheck, No: FaTimes,
  Plot: FaHome, Commercial: FaBuilding, Shop: FaBuilding, Office: FaBuilding,
  Marla: FaRulerCombined, Kanal: FaRulerCombined,
  Registry: FaFileContract, Fard: FaFileContract,
  Immediate: FaKey, "Ground only": FaLayerGroup,
  Desktop: FaLaptop, TV: FaLaptop, Camera: FaCamera, Audio: FaLaptop,
  "Gaming Console": FaGamepad, Monitor: FaLaptop, Printer: FaLaptop, Router: FaWifi,
  Tablet: FaMobile, Wearable: FaMobile,
  Wood: FaGem, Plastic: FaGem, Metal: FaGem,
  Toyota: FaCar, Honda: FaCar, Suzuki: FaCar, Kia: FaCar, Hyundai: FaCar, MG: FaCar,
  Lahore: FaCity, Karachi: FaCity, Islamabad: FaCity, Rawalpindi: FaCity,
  Faisalabad: FaCity, Multan: FaCity, Peshawar: FaCity, Quetta: FaCity,
};

/* ═══════════════ HUMAN-LIKE VOICE LINES ═══════════════ */
const VOICE_LINES = {
  category:      "Alright! First, tell me — what kind of item are you selling today? You can pick one, or just say it.",
  title:         "Nice. Now give your ad a short, catchy title — like a mini headline. What should it say?",
  price:         "Alright, let's talk money. How much are you asking for it? Just tell me in rupees, or say something like sixty-two lakh.",
  condition:     "Okay. What's the overall condition — is it brand new, like new, used, or does it need some repair?",
  make:          "Got it. What's the make — for example, Toyota, Honda, Suzuki, or something else?",
  model:         "And which model is it? Just tell me the model name.",
  year:          "Perfect. What year is it?",
  bodyType:      "What kind of body type is it — sedan, hatchback, SUV, or something else?",
  transmission:  "Now, is it automatic or manual? Or maybe CVT?",
  fuel:          "What does it run on — petrol, diesel, CNG, electric, or hybrid?",
  engine:        "What's the engine size? You can say something like thirteen hundred cc, or eighteen hundred cc.",
  mileage:       "Roughly, how many kilometres has it done so far? An estimate is totally fine.",
  registeredIn:  "Where is it registered — which city?",
  ownersCount:   "How many owners has it had before you? First owner, second, third, or more?",
  accidentFree:  "Has it ever been in an accident? Just yes, no, or minor — be honest, it helps buyers trust you.",
  color:         "Last one — what's the exterior colour? White, black, silver, or another shade?",
  city:          "Which city is the item in right now?",
  area:          "And which area or locality exactly? That helps buyers nearby find you.",
  description:   "Almost done! Add any extra details — like service history, features, or anything a buyer should know.",
  brand:         "Alright, what brand is it — like Apple, Samsung, Dell, or something else?",
  storage:       "How much storage does it have — one twenty-eight gigabytes, two fifty-six, five twelve, or one terabyte?",
  ram:           "How much RAM does it have?",
  network:       "What network does it support — five G, four G LTE, three G, or WiFi only?",
  battery:       "What's the battery health like? For example, ninety-eight percent.",
  warranty:      "Is there any warranty remaining? If yes, how long?",
  pta:           "Is it PTA approved — yes or no?",
  boxAvailable:  "Do you still have the original box and accessories?",
  fingerprint:   "Is the face or fingerprint sensor working properly?",
  screenCondition: "How's the screen — perfect, some minor scratches, or cracked?",
  bodyCondition: "And the body — perfect, minor dents, or damaged?",
  repaired:      "Has it ever been repaired or opened up before?",
  type:          "What type is it exactly?",
  purpose:       "Are you selling, renting, or leasing it out?",
  subType:       "And what sub-type — residential, commercial, industrial, or agricultural?",
  title_type:    "What's the title type — freehold, leasehold, registry, fard, or allotment?",
  society:       "Which society or authority is it in — like DHA, Bahria, or something else?",
  area:          "What's the size of the property? Just tell me the number.",
  areaUnit:      "And what unit — marla, kanal, square feet, or acres?",
  beds:          "How many bedrooms are there?",
  baths:         "And how many bathrooms?",
  floors:        "How many floors does it have?",
  facing:        "Which direction is it facing — north, south, east, or west? Or maybe a corner or main road plot?",
  parking:       "How many parking spaces are available?",
  furnished:     "Is it unfurnished, semi-furnished, or fully furnished?",
  loanFree:      "Is it free of any loan or mortgage?",
  disputeFree:   "Any legal disputes on it? Yes or no.",
  possession:    "When is possession available — immediately, on payment, or after a month?",
  documents:     "What documents do you have — like registry, fard, or NOC?",
  processor:     "What processor does it have? For example, M3 Pro, or i7.",
  screen:        "What's the screen size? For example, fourteen inches.",
  gender:        "Is it suitable for boys, girls, or unisex?",
  material:      "What material is it made of? Plastic, wood, metal, or fabric?",
  battery:       "Does it need batteries — yes, no, or are they included?",
  assembly:      "Does it require assembly? Yes or no.",
  packaging:     "How's the packaging — original box, no box, or damaged box?",
  accessories:   "What items are included — like manual, charger, or extra pieces?",
  quantity:      "How many units do you have available?",
  delivery:      "Is delivery available — yes, no, or pickup only?",
  returnPolicy:  "What's your return policy?",
  photos:        "Great! Now let's add some photos. Tap the box to upload up to five pictures of your item.",
};

/* ═══════════════ SYSTEM PROMPT ═══════════════ */
const SYSTEM_PROMPT = `
You are the AI Listing Assistant for APNa Deal — Pakistan's marketplace.

You collect listing details by asking ONE question at a time.

CATEGORIES: Vehicles | Bikes | Mobiles | Property | Electronics | Toys

HOW YOU WORK
1. User describes what they're selling → detect category.
2. Ask the NEXT unanswered field (ONE at a time).
3. When user answers, remember it and move on.
4. After the "description" field → ALWAYS ask for photos (id="photos", type="photos").
5. After photos → return final listing.

BULK INPUT — CRITICAL RULE
The user may type a FULL description at any time, e.g.:

  "Toyota Corolla 2020, white, automatic, petrol, 45,000 km,
   Lahore, 1st owner, 62 lac, like new, accident free"

When that happens:
1. Read the whole message.
2. Extract EVERY field you can identify.
3. Put EVERYTHING you extracted inside "specs".
4. Ask ONLY about the NEXT missing field.
5. NEVER re-ask for something the user already provided.

If the user types just a category name, treat it as the category answer.
If the user greets (hi/hello/salam), greet back and ask what they're selling.

IF USER SAYS "I DON'T KNOW" / SKIPS
- If a field is optional, move on.
- If required, gently suggest options.
- Never loop on the same question more than twice.

FIELD ORDER BY CATEGORY
Vehicles:    category, title, price, condition, make, model, year, bodyType,
             transmission, fuel, engine, mileage, registeredIn, ownersCount,
             accidentFree, color, city, area, description, photos
Bikes:       category, title, price, condition, make, model, year, engine,
             mileage, registeredIn, ownersCount, color, city, area, description, photos
Mobiles:     category, title, price, condition, brand, model, storage, ram,
             network, color, battery, warranty, pta, boxAvailable, fingerprint,
             screenCondition, bodyCondition, repaired, city, area, description, photos
Property:    category, title, price, condition, type, purpose, subType,
             title_type, society, area, areaUnit, beds, baths, floors, facing,
             parking, furnished, loanFree, disputeFree, possession, documents,
             city, area2, description, photos
Electronics: category, title, price, condition, brand, model, type, processor,
             ram, storage, screen, color, warranty, boxAvailable, repaired, year,
             city, area, description, photos
Toys:        category, title, price, condition, brand, model, gender, material,
             color, battery, assembly, packaging, accessories, warranty, quantity,
             delivery, returnPolicy, city, area, description, photos

PHOTO QUESTION — special rule
- ALWAYS the LAST question before finalizing.
- id = "photos", type = "photos".

RESPONSE FORMAT — return ONLY JSON

While collecting info:
{
  "needsAnswers": true,
  "message": "Short friendly line (1 sentence).",
  "question": {
    "id": "make",
    "label": "What's the make?",
    "type": "text" | "select" | "color" | "number" | "photos",
    "placeholder": "e.g. Toyota",
    "options": ["Toyota","Honda","Suzuki","Kia","Hyundai","MG"],
    "suggestions": ["Toyota","Honda","Suzuki","Kia"]
  },
  "specs": { "category":"Vehicles", "title":"...", "make":"...", "condition":"..." }
}

When done:
{
  "needsAnswers": false,
  "message": "Perfect — I have everything!",
  "listing": {
    "category": "Vehicles", "title": "...", "description": "...",
    "price": 6200000, "condition": "Used", "city": "Lahore", "area": "DHA Phase 5",
    "specs": { "make":"Toyota", "model":"Corolla", "year":"2020" }
  }
}

RULES
- Ask ONE question per turn — never multiple.
- ALWAYS include "specs" with everything known so far.
- ALWAYS include "suggestions" with 3-8 short options for EVERY question.
- For "select" type, provide 3-8 real options (also in suggestions).
- For "color" type, no suggestions needed.
- For "photos" type, no suggestions needed.
- Prices in PKR: "62 lac" → 6200000, "1.2 crore" → 12000000.
- Return ONLY JSON. First character MUST be {. No markdown fences.
`.trim();

function extractJSON(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  let s = String(raw).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(s); } catch {}
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b <= a) return null;
  const c = s.slice(a, b + 1);
  try { return JSON.parse(c); } catch {}
  try { return JSON.parse(c.replace(/,\s*([}\]])/g, "$1").replace(/'/g, '"')); } catch { return null; }
}

/* ═══════════════ TEXT-TO-SPEECH HOOK — female voice ═══════════════ */
const FEMALE_HINTS = [
  "female", "woman", "zira", "samantha", "victoria", "karen", "moira", "tessa",
  "fiona", "serena", "kate", "allison", "ava", "susan", "nicky", "veena",
  "google uk english female", "google us english", "microsoft zira",
];

const useSpeech = () => {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_speech_enabled");
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);
  const utteranceRef = useRef(null);
  const unlockedRef = useRef(false);

  const pickFemaleVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const englishVoices = voices.filter((v) => /^en(-|_)?/i.test(v.lang));
    return (
      englishVoices.find((x) => /female/i.test(x.name)) ||
      englishVoices.find((x) => FEMALE_HINTS.some((h) => x.name.toLowerCase().includes(h))) ||
      voices.find((x) => /Google UK English Female/i.test(x.name)) ||
      voices.find((x) => /en-(IN|PK)/i.test(x.lang)) ||
      voices.find((x) => /Google US English/i.test(x.name)) ||
      englishVoices[0] ||
      voices[0] ||
      null
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => { voiceRef.current = pickFemaleVoice(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch {} };
  }, []);

  useEffect(() => {
    try { localStorage.setItem("ai_speech_enabled", String(enabled)); } catch {}
  }, [enabled]);

  useEffect(() => () => {
    try { window.speechSynthesis?.cancel(); } catch {}
  }, []);

  /* ⭐ Prime the speech engine on first user gesture (mobile requirement) */
  const unlock = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (unlockedRef.current) return;
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      unlockedRef.current = true;
    } catch {}
    try { window.speechSynthesis.getVoices(); } catch {}
  }, []);

  const speak = useCallback((text) => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!text) return;

    try { window.speechSynthesis.cancel(); } catch {}

    const u = new SpeechSynthesisUtterance(String(text));
    if (!voiceRef.current) voiceRef.current = pickFemaleVoice();
    if (voiceRef.current) u.voice = voiceRef.current;
    u.lang = voiceRef.current?.lang || "en-US";

    u.rate = 0.98;
    u.pitch = 1.16;
    u.volume = 1;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utteranceRef.current = u;
    setTimeout(() => {
      try { window.speechSynthesis.speak(u); } catch {}
    }, 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const stop = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e;
      if (!next) stop();
      else unlock();
      return next;
    });
  }, [stop, unlock]);

  const resume = useCallback(() => {
    try { window.speechSynthesis?.resume?.(); } catch {}
  }, []);

  return {
    speak, stop, toggle, unlock, resume,
    enabled, speaking,
    supported: typeof window !== "undefined" && !!window.speechSynthesis,
  };
};

/* ═══════════════ Build a human-like spoken line for a question ═══════════════ */
function buildSpokenLine(question, specs) {
  if (!question) return "";

  if (question.id === "category") {
    return VOICE_LINES.category;
  }

  const line = VOICE_LINES[question.id];
  if (line) {
    if (question.id === "make" && specs?.category) {
      return `Got it. What's the make of your ${specs.category.toLowerCase().replace(/s$/, "")}? For example, Toyota, Honda, or Suzuki.`;
    }
    if (question.id === "model" && specs?.make) {
      return `And which ${specs.make} model is it? Just tell me the model name.`;
    }
    if (question.id === "price" && specs?.title) {
      return `Alright, let's talk money. How much are you asking for "${specs.title}"? You can say something like sixty-two lakh.`;
    }
    return line;
  }

  const label = String(question.label || "").trim().replace(/\?+$/, "");
  return `Alright. ${label}.`;
}

/* ═══════════════ TOKENS ═══════════════ */
const BRAND = "#e66000";
const VIDEO_SRC = "https://cdn.dribbble.com/userupload/5941383/file/original-7d6aa7a179576200db16695d16d8d225.mp4";
const RING = "linear-gradient(120deg,#ff7a1a,#ff3d8b,#7c5cff,#38bdf8)";
const COLORS = [
  ["White", "#F7F1E4"], ["Black", "#1B1815"], ["Silver", "#B3A793"], ["Grey", "#7A6F5D"],
  ["Red", "#B23A2E"], ["Blue", "#2A4A6B"], ["Green", "#164B3B"], ["Amber", "#fc9d03"],
  ["Brown", "#8B5E3C"], ["Beige", "#D9C9A8"], ["Gold", "#C9A227"], ["Purple", "#6B4A8A"],
];
const THINK_LINES = [
  "Reading what you told me…",
  "Picking the right details…",
  "Preparing your next question…",
  "Almost there…",
];
const THEMES = {
  dark: { bg: "#07060c", text: "#fff", sub: "rgba(255,255,255,.62)", glass: "rgba(255,255,255,.07)", line: "rgba(255,255,255,.14)", field: "#12101a" },
  light: { bg: "#fbf7f2", text: "#18130f", sub: "rgba(24,19,15,.62)", glass: "rgba(255,255,255,.75)", line: "rgba(24,19,15,.12)", field: "#ffffff" },
};
const human = (k) => k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/* ═══════════════ AI ORB ═══════════════ */
const BLOBS = [
  { c: "#ff7a1a", x: [-22, 18, -10], y: [-12, 16, -18], d: 7 },
  { c: "#ff3d8b", x: [20, -18, 14], y: [14, -16, 10], d: 9 },
  { c: "#7c5cff", x: [-16, 20, -20], y: [18, -10, 16], d: 8 },
  { c: "#38bdf8", x: [14, -20, 18], y: [-18, 14, -12], d: 10 },
];
const Orb = ({ state = "idle", size = 120, speaking = false }) => {
  const k = state === "thinking" ? 0.4 : state === "listening" ? 0.55 : 1;
  const u = size / 60;
  const [failed, setFailed] = useState(false);
  const vidRef = useRef(null);
  useEffect(() => {
    if (vidRef.current) vidRef.current.playbackRate = state === "thinking" ? 1.8 : state === "listening" ? 1.4 : 1;
  }, [state]);
  const useVideo = !!VIDEO_SRC && !failed;
  const animating = state !== "idle" || speaking;
  return (
    <motion.div
      className="relative rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
      animate={{ scale: animating ? [1, state === "listening" ? 1.1 : speaking ? 1.06 : 1.05, 1] : 1 }}
      transition={{ duration: state === "listening" ? 0.8 : speaking ? 1.1 : 1.6, repeat: animating ? Infinity : 0, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -size * 0.7,
          background: "conic-gradient(from 0deg,#ff7a1a,#ff3d8b,#7c5cff,#38bdf8,#ff7a1a)",
          filter: `blur(${size * 0.7}px)`,
          opacity: state === "idle" ? (speaking ? 0.6 : 0.4) : 0.65,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: (speaking ? 8 : 14) * k, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="relative h-full w-full rounded-full overflow-hidden"
        style={{
          background: "#0b0612",
          boxShadow: "inset 0 0 36px rgba(255,255,255,.4), 0 0 0 1.5px rgba(255,255,255,.28)",
        }}
      >
        {useVideo ? (
          <video
            ref={vidRef}
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setFailed(true)}
            onLoadedData={(e) => {
              e.currentTarget.playbackRate = state === "thinking" ? 1.8 : state === "listening" ? 1.4 : 1;
            }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scale(1.7)" }}
          />
        ) : (
          <>
            {BLOBS.map((b, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: size * 1.05,
                  height: size * 1.05,
                  left: size * -0.025,
                  top: size * -0.025,
                  background: b.c,
                  filter: `blur(${size * 0.22}px)`,
                }}
                animate={{
                  x: b.x.map((v) => v * u),
                  y: b.y.map((v) => v * u),
                  scale: [1, 1.2, 0.9],
                }}
                transition={{
                  duration: b.d * k,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 22%,rgba(255,255,255,.45),transparent 50%)",
          }}
        />
      </div>
    </motion.div>
  );
};

const Reveal = ({ text }) => (
  <>
    {String(text).split(" ").map((w, i) => (
      <motion.span
        key={i}
        className="inline-block mr-[0.28em]"
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: i * 0.06, duration: 0.45 }}
      >
        {w}
      </motion.span>
    ))}
  </>
);

const Wave = () => (
  <div className="flex items-center justify-center gap-[3px] h-16 sm:h-20">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.span
        key={i}
        className="w-[3px] rounded-full"
        style={{ background: RING }}
        animate={{ height: [6, 16 + ((i * 37) % 52), 6] }}
        transition={{ duration: 0.6 + (i % 5) * 0.13, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
      />
    ))}
  </div>
);

/* ═══════════════ SUGGESTION CHIP ═══════════════ */
const SuggestionChip = ({ label, onPick, glass, index = 0, variant = "pill" }) => {
  const Icon = SUGGESTION_ICONS[label];
  const isCategory = variant === "category";
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPick(label)}
      className={`inline-flex items-center gap-2 font-bold transition-colors ${
        isCategory
          ? "px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl text-[14px] sm:text-[15px]"
          : "px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-[14px]"
      }`}
      style={glass}
    >
      {Icon && (
        <Icon
          className={isCategory ? "text-base sm:text-lg" : "text-[12px] sm:text-[13px]"}
          style={{ color: BRAND }}
        />
      )}
      <span>{label}</span>
    </motion.button>
  );
};

/* ═══════════════ PHOTO PICKER ═══════════════ */
const PhotoPicker = ({ photos, onPick, onRemove, t }) => {
  if (photos.length === 0) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="w-full flex flex-col items-center justify-center gap-3 py-10 sm:py-14 px-4 border-2 border-dashed rounded-3xl transition active:scale-[0.98]"
        style={{ borderColor: `${BRAND}80`, background: `${BRAND}0d` }}
      >
        <div
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)`, boxShadow: `0 12px 28px -10px ${BRAND}cc` }}
        >
          <FaCloudUploadAlt className="text-white text-xl sm:text-2xl" />
        </div>
        <p className="text-[15px] sm:text-[16px] font-extrabold" style={{ color: t.text }}>
          Tap to add photos
        </p>
        <p className="text-[11.5px] sm:text-[12px] font-semibold" style={{ color: t.sub }}>
          Up to 5 images · Max 5MB each
        </p>
      </button>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {photos.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden"
            style={{ border: `2px solid ${BRAND}55`, background: t.field }}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label="Remove photo"
              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full flex items-center justify-center bg-red-500 text-white shadow-lg active:scale-95 transition"
            >
              <FaTrash className="text-[11px]" />
            </button>
          </motion.div>
        ))}
        {photos.length < 5 && (
          <button
            type="button"
            onClick={onPick}
            className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center active:scale-95 transition"
            style={{ borderColor: `${BRAND}80`, background: `${BRAND}0d` }}
          >
            <FaPlus className="text-[#e66000] text-xl" />
          </button>
        )}
      </div>
      <p className="text-[12px] font-semibold text-center mt-3" style={{ color: t.sub }}>
        {photos.length} / 5 photos selected
      </p>
    </>
  );
};

/* ═══════════════ MAIN ═══════════════ */
const AIAdAssistant = ({ open, onClose, onSubmit }) => {
  const [isDark, setIsDark] = useState(true);
  const [specs, setSpecs] = useState({});
  const [question, setQuestion] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkLine, setThinkLine] = useState(0);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [finalListing, setFinalListing] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  const specsRef = useRef({});
  const questionRef = useRef(null);
  const historyRef = useRef([]);
  const lastCallRef = useRef({ answer: "", first: true });
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const lastSpokenRef = useRef("");
  const isListeningRef = useRef(false);
  const t = isDark ? THEMES.dark : THEMES.light;

  /* ⭐ TTS */
  const {
    speak, stop: stopSpeech, toggle: toggleSpeech,
    unlock: unlockSpeech, resume: resumeSpeech,
    enabled: speechEnabled, speaking, supported: speechSupported,
  } = useSpeech();

  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("theme-light"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  useEffect(() => {
    if (!isThinking) return;
    setThinkLine(0);
    const id = setInterval(() => setThinkLine((n) => (n + 1) % THINK_LINES.length), 1800);
    return () => clearInterval(id);
  }, [isThinking]);

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch {}
    clearInterval(timerRef.current);
    stopSpeech();
  }, [stopSpeech]);

  /* ⭐ Resume TTS when tab becomes visible again (mobile suspends it) */
  useEffect(() => {
    if (!open || !speechEnabled) return;
    const onVis = () => {
      if (document.visibilityState === "visible") resumeSpeech();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [open, speechEnabled, resumeSpeech]);

  useEffect(() => {
    if (question && !isThinking && question.type !== "photos" && question.type !== "select" && question.type !== "color") {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [question, isThinking]);

  /* ⭐ SPEAK human-like line for the new question */
  useEffect(() => {
    if (!open || !speechEnabled) return;
    if (isThinking) return;
    if (isListeningRef.current) return;

    if (finalListing) {
      const line = "All set! Your listing is ready. Tap the button below to use it.";
      if (lastSpokenRef.current !== line) {
        lastSpokenRef.current = line;
        speak(line);
      }
      return;
    }

    if (question?.label) {
      const line = buildSpokenLine(question, specs);
      if (lastSpokenRef.current !== line) {
        lastSpokenRef.current = line;
        speak(line);
      }
    }
  }, [question, finalListing, isThinking, speechEnabled, specs, speak]);

  /* ═══════════ AI CALL ═══════════ */
  const askAI = useCallback(async (userAnswer = "", isFirst = false) => {
    lastCallRef.current = { answer: userAnswer, first: isFirst };
    setIsThinking(true);
    setError("");
    try { stopSpeech(); } catch {}

    try {
      const q = questionRef.current;
      const prev = { ...specsRef.current };
      if (userAnswer && q?.id && q.id !== "photos") prev[q.id] = userAnswer;

      const historyText = historyRef.current
        .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`)
        .join("\n\n");

      const firstMessage =
        "User wants to create a listing. Start by asking what they're selling, " +
        "OR wait for them to describe the item fully. " +
        "If they describe it in detail, extract every field you can and only " +
        "ask about what's still missing.";

      const userLabel = isFirst
        ? firstMessage
        : q?.id === "category"
          ? `User chose category: ${userAnswer}. Extract any other details from this message too, then ask for the next missing field.`
          : `User's message: "${userAnswer}". Extract EVERY field you can find. Merge into "specs". Then ask ONLY about the next missing field.`;

      const composed = [
        historyText ? `Conversation:\n${historyText}` : "",
        `Known specs so far: ${JSON.stringify(prev)}`,
        userLabel,
      ].filter(Boolean).join("\n\n");

      const raw = await generateWithChat({ message: composed, system: SYSTEM_PROMPT });
      const data = extractJSON(raw);
      if (!data) throw new Error("Invalid AI response");

      historyRef.current = [
        ...historyRef.current,
        ...(userAnswer ? [{ role: "user", text: userAnswer }] : []),
        { role: "assistant", text: data.message || "" },
      ];
      const merged = { ...prev, ...(data.specs || {}) };
      specsRef.current = merged;
      setSpecs(merged);
      if (userAnswer && q?.id) setAnswered((p) => (p.includes(q.id) ? p : [...p, q.id]));

      if (data.listing && data.needsAnswers === false) {
        questionRef.current = null;
        setQuestion(null);
        setFinalListing({ ...data.listing, images: photos.map((p) => p.url) });
        setAiMessage(data.message || "Your listing is ready.");
      } else {
        const nextQ = data.question || null;
        if (nextQ) {
          if (!nextQ.suggestions && Array.isArray(nextQ.options)) {
            nextQ.suggestions = nextQ.options;
          }
          if (!nextQ.suggestions && nextQ.type !== "color" && nextQ.type !== "photos") {
            const fallbacks = {
              engine: ["660cc","1000cc","1300cc","1500cc","1800cc","2000cc","2500cc+"],
              mileage: ["Under 10,000 km","10,000-50,000 km","50,000-100,000 km","100,000+ km"],
              year: ["2024","2023","2022","2021","2020","2019","2018","2017"],
              ownersCount: ["1st","2nd","3rd","4th+"],
              registeredIn: ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad"],
              city: ["Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad"],
              transmission: ["Automatic","Manual","CVT","DCT","Tiptronic"],
              fuel: ["Petrol","Diesel","CNG","Electric","Hybrid"],
              bodyType: ["Sedan","Hatchback","SUV","Crossover","MPV","Van"],
              color: ["White","Black","Silver","Grey","Red","Blue"],
              storage: ["32GB","64GB","128GB","256GB","512GB","1TB"],
              ram: ["2GB","3GB","4GB","6GB","8GB","12GB","16GB"],
              network: ["5G","4G LTE","3G","WiFi Only"],
              areaUnit: ["Marla","Kanal","Sq. Ft.","Sq. Yards","Acre"],
              beds: ["1","2","3","4","5","6+"],
              baths: ["1","2","3","4","5","6+"],
              floors: ["Ground only","Ground + 1","Ground + 2","Ground + 3+"],
              parking: ["None","1","2","3","4+"],
              furnished: ["Unfurnished","Semi-Furnished","Fully Furnished"],
              delivery: ["Yes","No","Pickup Only"],
              pta: ["Yes","No"],
              boxAvailable: ["Yes","No"],
              fingerprint: ["Yes","No"],
              accidentFree: ["Yes","No","Minor"],
            };
            const fb = fallbacks[nextQ.id];
            if (fb) nextQ.suggestions = fb;
          }
        }
        questionRef.current = nextQ;
        setQuestion(nextQ);
        setAiMessage(data.message || "");
        setAnswer("");
      }
    } catch (err) {
      console.error("AI error:", err);
      setError("I couldn't reach the AI. Check your connection and try again.");
    } finally {
      setIsThinking(false);
    }
  }, [photos, stopSpeech]);

  const start = useCallback(() => {
    specsRef.current = {}; questionRef.current = null; historyRef.current = [];
    lastSpokenRef.current = "";
    setSpecs({}); setQuestion(null); setAiMessage(""); setAnswer("");
    setFinalListing(null); setAnswered([]); setError(""); setPhotos([]);
    askAI("", true);
  }, [askAI]);

  useEffect(() => { if (open) start(); /* eslint-disable-next-line */ }, [open]);

  const submitAnswer = useCallback((v) => {
    const val = String(v ?? answer).trim();
    if (!val || isThinking) return;
    /* ⭐ Any tap on an answer chip/button also unlocks TTS */
    try { unlockSpeech(); } catch {}
    stopSpeech();
    askAI(val);
  }, [answer, isThinking, askAI, stopSpeech, unlockSpeech]);

  /* ═══════════ VOICE INPUT ═══════════ */
  const stopVoice = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    clearInterval(timerRef.current);
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const startVoice = useCallback(() => {
    /* ⭐ Unlock speech engine on this same tap (mobile) */
    try { unlockSpeech(); } catch {}

    /* ⭐ Check for mic permission first */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input isn't supported on this browser. Please type instead.");
      return;
    }

    /* ⭐ If we can check permission state, do it and alert if denied */
    const beginRecognition = () => {
      try { recRef.current?.stop(); } catch {}
      stopSpeech();
      isListeningRef.current = true;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-PK";
      rec.onresult = (e) => setVoiceText(Array.from(e.results).map((r) => r[0].transcript).join(" "));
      rec.onerror = (ev) => {
        const code = ev?.error || "";
        if (code === "not-allowed" || code === "service-not-allowed") {
          alert("Microphone access is blocked. Please allow microphone permission in your browser settings and try again.");
        } else if (code === "no-speech") {
          /* ignore — user didn't speak */
        } else {
          alert(`Voice input error: ${code || "unknown"}. Please try again or type instead.`);
        }
        stopVoice();
      };
      rec.onend = () => { setIsListening(false); isListeningRef.current = false; };
      try {
        rec.start();
        recRef.current = rec;
        setVoiceText(""); setVoiceSeconds(0); setIsListening(true);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setVoiceSeconds((s) => s + 1), 1000);
      } catch (err) {
        alert("Could not start voice input. Please try again or type instead.");
        stopVoice();
      }
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((status) => {
          if (status.state === "denied") {
            alert("Microphone access is blocked. Please allow microphone permission in your browser settings and try again.");
            return;
          }
          beginRecognition();
        })
        .catch(() => beginRecognition());
    } else {
      beginRecognition();
    }
  }, [stopVoice, stopSpeech, unlockSpeech]);

  const confirmVoice = () => {
    const x = voiceText.trim();
    stopVoice();
    setVoiceText("");
    if (x) {
      stopSpeech();
      askAI(x);
    }
  };
  const cancelVoice = () => { stopVoice(); setVoiceText(""); };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ═══════════ PHOTOS ═══════════ */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) { alert("Up to 5 photos."); return; }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} is larger than 5MB.`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), url: ev.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id));
  const confirmPhotos = () => {
    if (photos.length === 0) return;
    askAI(`[${photos.length} photo${photos.length > 1 ? "s" : ""} uploaded]`);
  };

  const apply = () => { if (finalListing) { onSubmit?.(finalListing); onClose?.(); } };

  if (!open) return null;

  const orbState = isListening ? "listening" : isThinking ? "thinking" : "idle";
  const progress = finalListing ? 1 : Math.min(answered.length / 12, 0.95);
  const chips = Object.entries(specs).filter(([, v]) => v && typeof v !== "object").slice(-8);
  const showInput = !isThinking && !error && !finalListing && question && question.type !== "photos";
  const isCategoryQuestion = question?.id === "category";

  const glass = { background: t.glass, border: `1px solid ${t.line}`, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" };

  const content = (
    <AnimatePresence>
      <motion.div
        key="ai-assistant"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{
          zIndex: 999999,
          background: t.bg, color: t.text,
          fontFamily: "'Manrope','Inter',system-ui,sans-serif",
          paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)",
          height: "100dvh",
        }}
        onClick={() => { try { unlockSpeech(); } catch {} }}
      >
        <motion.div
          aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ width: "min(520px, 80vw)", height: "min(520px, 80vw)", left: "50%", top: -180, marginLeft: "min(-260px, -40vw)", background: `radial-gradient(circle, ${BRAND}, transparent 65%)`, filter: "blur(70px)" }}
          animate={{ opacity: isDark ? [0.28, 0.45, 0.28] : [0.18, 0.28, 0.18], scale: [1, 1.12, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ width: "min(380px, 60vw)", height: "min(380px, 60vw)", right: -140, bottom: -100, background: "radial-gradient(circle,#7c5cff,transparent 65%)", filter: "blur(80px)", opacity: isDark ? 0.25 : 0.12 }} />

        <div className="relative h-[3px] w-full flex-shrink-0" style={{ background: t.line }}>
          <motion.div className="h-full" style={{ background: RING }} animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
        </div>

        <div className="relative flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className="relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                width: 30,
                height: 30,
                background: speaking ? "#FFFFFF" : "rgba(255,255,255,0.06)",
                border: speaking
                  ? "1px solid rgba(255,255,255,0.9)"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: speaking
                  ? "0 0 0 3px rgba(255,255,255,0.18), 0 0 20px -4px rgba(255,255,255,0.55)"
                  : "none",
                transition:
                  "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <img
                src="/logo.png"
                alt="APNa Deal"
                className="w-full h-full object-contain p-1"
                draggable={false}
                style={{
                  filter: speaking ? "brightness(0.15)" : "brightness(1)",
                  transition: "filter 0.3s ease",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML = `
                    <span style="color:${speaking ? "#111" : "#fff"};font-size:11px;font-weight:800;">A</span>
                  `;
                }}
              />

              {speaking && (
                <motion.span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ border: "2px solid #FFFFFF" }}
                  animate={{ scale: [1, 1.55, 1.8], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </div>

            <div className="leading-tight min-w-0">
              <p className="text-[13px] sm:text-[14px] font-extrabold truncate">
                APNa AI
              </p>
              <p
                className="text-[10.5px] sm:text-[11px] font-semibold truncate"
                style={{ color: t.sub }}
              >
                {speaking
                  ? "Speaking…"
                  : answered.length
                  ? `${answered.length} detail${answered.length > 1 ? "s" : ""} saved`
                  : "Listing assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {speechSupported && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleSpeech(); }}
                aria-label={speechEnabled ? "Mute AI voice" : "Unmute AI voice"}
                title={speechEnabled ? "Mute AI voice" : "Unmute AI voice"}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center active:scale-95 transition"
                style={{
                  ...glass,
                  color: speechEnabled ? BRAND : t.sub,
                  opacity: speechEnabled ? 1 : 0.6,
                }}
              >
                {speechEnabled ? <FaVolumeUp className="text-[13px]" /> : <FaVolumeMute className="text-[13px]" />}
              </button>
            )}
            <button onClick={onClose} aria-label="Close"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center active:scale-95 transition"
              style={glass}>
              <FaTimes className="text-[13px]" />
            </button>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="relative px-3 sm:px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {chips.map(([k, v]) => (
              <motion.span
                key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-semibold whitespace-nowrap" style={glass}
              >
                <span style={{ color: t.sub }}>{human(k)} </span>{String(v)}
              </motion.span>
            ))}
          </div>
        )}

        <div className="relative flex-1 overflow-y-auto px-4 sm:px-5">
          <div className="min-h-full flex flex-col items-center justify-center py-5 sm:py-6 mx-auto w-full max-w-2xl text-center">
            <Orb size={isThinking ? 110 : 96} state={orbState} speaking={speaking} />

            <AnimatePresence mode="wait">
              {isThinking && (
                <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 sm:mt-8">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={thinkLine}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="text-[15px] sm:text-[17px] font-bold px-4"
                      style={{ background: `linear-gradient(90deg,${t.sub},${BRAND},#ff3d8b,${t.sub})`, backgroundSize: "250% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "aiShimmer 2.2s linear infinite" }}
                    >
                      {THINK_LINES[thinkLine]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}

              {!isThinking && error && (
                <motion.div key="err" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 sm:mt-8 flex flex-col items-center gap-4 px-4">
                  <p className="text-[14px] sm:text-[16px] font-semibold max-w-sm">{error}</p>
                  <button
                    onClick={() => askAI(lastCallRef.current.answer, lastCallRef.current.first)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[13.5px] sm:text-[14px] font-bold text-white active:scale-95 transition"
                    style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)` }}
                  >
                    <FaRedo className="text-[11px]" /> Try again
                  </button>
                </motion.div>
              )}

              {!isThinking && !error && !finalListing && question && question.type !== "photos" && (
                <motion.div key={question.id || question.label} exit={{ opacity: 0, y: -12 }} className="mt-6 sm:mt-8 w-full flex flex-col items-center px-1">
                  {aiMessage && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                      className="text-[13px] sm:text-[14px] font-semibold mb-3 max-w-md px-2"
                      style={{ color: t.sub }}
                    >
                      {aiMessage}
                    </motion.p>
                  )}
                  <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-extrabold leading-[1.15] max-w-xl mb-6 sm:mb-8 px-2" style={{ letterSpacing: "-0.025em" }}>
                    <Reveal text={question.label} />
                  </h2>

                  {question.type === "select" && Array.isArray(question.options) && (
                    <div className={`flex flex-wrap gap-2.5 sm:gap-3 justify-center ${isCategoryQuestion ? "max-w-2xl" : "max-w-lg"}`}>
                      {question.options.map((o, i) => (
                        <SuggestionChip
                          key={o}
                          label={o}
                          onPick={submitAnswer}
                          glass={glass}
                          index={i}
                          variant={isCategoryQuestion ? "category" : "pill"}
                        />
                      ))}
                    </div>
                  )}

                  {isCategoryQuestion && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-5 text-[12px] sm:text-[13px] font-semibold max-w-md"
                      style={{ color: t.sub }}
                    >
                      💡 Or type anything — like{" "}
                      <span style={{ color: BRAND }}>
                        "Toyota Corolla 2020, white, 45,000 km, 62 lac, Lahore"
                      </span>{" "}
                      — and I'll fill in the details automatically.
                    </motion.p>
                  )}

                  {question.type === "color" && (
                    <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center max-w-md">
                      {COLORS.map(([name, hex], i) => (
                        <motion.button
                          key={name} title={name} aria-label={name}
                          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.03 }}
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
                          onClick={() => submitAnswer(name)}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                          style={{ background: hex, border: `2px solid ${t.line}`, boxShadow: "0 8px 18px -8px rgba(0,0,0,.5)" }}
                        />
                      ))}
                    </div>
                  )}

                  {question.type !== "select" && question.type !== "color" &&
                    Array.isArray(question.suggestions) && question.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                      {question.suggestions.map((s, i) => (
                        <SuggestionChip
                          key={s}
                          label={s}
                          onPick={submitAnswer}
                          glass={glass}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {!isThinking && !error && !finalListing && question && question.type === "photos" && (
                <motion.div key="photos" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 sm:mt-8 w-full flex flex-col items-center px-2">
                  {aiMessage && (
                    <p className="text-[13px] sm:text-[14px] font-semibold mb-3 max-w-md" style={{ color: t.sub }}>
                      {aiMessage}
                    </p>
                  )}
                  <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-extrabold leading-[1.15] max-w-xl mb-6 sm:mb-8" style={{ letterSpacing: "-0.025em" }}>
                    <Reveal text={question.label || "Add photos of your item"} />
                  </h2>

                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />

                  <div className="w-full max-w-lg">
                    <PhotoPicker photos={photos} onPick={() => fileRef.current?.click()} onRemove={removePhoto} t={t} />
                  </div>

                  <button
                    onClick={confirmPhotos}
                    disabled={photos.length === 0}
                    className="mt-5 w-full max-w-lg py-3.5 sm:py-4 rounded-full text-[14px] sm:text-[15px] font-extrabold text-white active:scale-[0.98] transition disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)`, boxShadow: `0 14px 32px -12px ${BRAND}cc` }}
                  >
                    <FaCheck className="inline mr-2 text-[12px]" />
                    Continue with {photos.length} photo{photos.length !== 1 ? "s" : ""}
                  </button>
                </motion.div>
              )}

              {!isThinking && !error && finalListing && (
                <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 sm:mt-8 w-full flex flex-col items-center px-2">
                  <h2 className="text-[22px] sm:text-[28px] md:text-[34px] font-extrabold leading-tight mb-5 sm:mb-6 max-w-xl" style={{ letterSpacing: "-0.025em" }}>
                    <Reveal text={aiMessage || "Your listing is ready."} />
                  </h2>
                  <div className="w-full max-w-md rounded-3xl p-4 sm:p-5 text-left space-y-2.5 sm:space-y-3" style={glass}>
                    {[
                      ["Category", finalListing.category],
                      ["Title", finalListing.title],
                      ["Price", finalListing.price ? `Rs ${Number(finalListing.price).toLocaleString()}` : ""],
                      ["Condition", finalListing.condition],
                      ["Location", [finalListing.area, finalListing.city].filter(Boolean).join(", ")],
                      ["Photos", finalListing.images?.length ? `${finalListing.images.length} uploaded` : ""],
                    ].map(([l, v]) => (
                      <div key={l} className="flex items-start justify-between gap-3">
                        <span className="text-[11.5px] sm:text-[12px] font-semibold flex-shrink-0" style={{ color: t.sub }}>{l}</span>
                        <span className="text-[13px] sm:text-[14px] font-bold text-right break-words min-w-0">{v || "—"}</span>
                      </div>
                    ))}
                    {finalListing.specs && (
                      <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: `1px solid ${t.line}` }}>
                        {Object.entries(finalListing.specs).filter(([, v]) => v).slice(0, 12).map(([k, v]) => (
                          <span key={k} className="px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-semibold" style={{ background: t.glass, border: `1px solid ${t.line}` }}>
                            <span style={{ color: t.sub }}>{human(k)} </span>{String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {showInput && (
          <div className="relative px-3 sm:px-4 pb-4 sm:pb-5 pt-2 flex-shrink-0">
            <div className="max-w-2xl mx-auto rounded-full p-[1.5px]" style={{ background: RING, boxShadow: `0 18px 40px -18px ${BRAND}99` }}>
              <div className="flex items-center gap-2 rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 sm:py-2" style={{ background: t.field }}>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode={question.type === "number" ? "numeric" : "text"}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitAnswer(); } }}
                  placeholder={question.placeholder || "Type your answer…"}
                  className="flex-1 min-w-0 bg-transparent outline-none text-[14px] sm:text-[15px] font-semibold"
                  style={{ color: t.text }}
                />
                <button onClick={startVoice} aria-label="Speak your answer"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center active:scale-95 transition flex-shrink-0"
                  style={{ color: t.sub }}>
                  <FaMicrophone className="text-[14px] sm:text-[15px]" />
                </button>
                <button
                  onClick={() => submitAnswer()} disabled={!answer.trim()} aria-label="Send"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-white active:scale-95 transition disabled:opacity-35 flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)` }}
                >
                  <FaPaperPlane className="text-[12px] sm:text-[13px]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!isThinking && !error && finalListing && (
          <div className="relative px-3 sm:px-4 pb-5 sm:pb-6 pt-2 flex-shrink-0">
            <div className="max-w-md mx-auto flex flex-col gap-2">
              <button
                onClick={apply}
                className="w-full py-3.5 sm:py-4 rounded-full text-[14px] sm:text-[15px] font-extrabold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition"
                style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)`, boxShadow: `0 18px 40px -16px ${BRAND}cc` }}
              >
                <FaCheck className="text-[12px]" /> Use this listing <FaArrowRight className="text-[12px]" />
              </button>
              <button onClick={start} className="py-3 text-[12.5px] sm:text-[13px] font-bold inline-flex items-center justify-center gap-2" style={{ color: t.sub }}>
                <FaMagic className="text-[11px]" /> Start over
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center px-5 sm:px-6"
              style={{ background: isDark ? "rgba(7,6,12,.94)" : "rgba(251,247,242,.95)", backdropFilter: "blur(24px)" }}
            >
              <motion.div
                aria-hidden className="absolute bottom-0 left-0 right-0 h-40 sm:h-48 pointer-events-none"
                style={{ background: RING, filter: "blur(70px)" }}
                animate={{ opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 1.6, repeat: Infinity }}
              />
              <Orb size={140} state="listening" />
              <div className="relative mt-8 sm:mt-10 w-full max-w-md"><Wave /></div>
              <p className="relative mt-4 text-center text-[16px] sm:text-[19px] font-bold max-w-md min-h-[52px] leading-snug px-4">
                {voiceText || "Listening…"}
              </p>
              <p className="relative text-[13px] sm:text-[14px] font-bold tabular-nums mt-2" style={{ color: BRAND }}>
                {fmt(voiceSeconds)}
              </p>
              <div className="relative flex items-center gap-5 sm:gap-6 mt-8 sm:mt-10">
                <button onClick={cancelVoice} aria-label="Cancel"
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center active:scale-95 transition" style={glass}>
                  <FaTimes />
                </button>
                <button
                  onClick={confirmVoice} disabled={!voiceText.trim()} aria-label="Send voice answer"
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition"
                  style={{ background: `linear-gradient(135deg,${BRAND},#ff9a3c)`, boxShadow: `0 16px 40px -12px ${BRAND}cc` }}
                >
                  <FaCheck className="text-base sm:text-lg" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes aiShimmer { to { background-position: -250% 0; } }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { scrollbar-width: none; }
          @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; } }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default AIAdAssistant;