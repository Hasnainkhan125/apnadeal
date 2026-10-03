// pages/MyListings.jsx — Ticket Design System + Rejected tab + Boost button
// ⭐ Brand: #e66000 (unified)
// ⭐ Clickable cards → navigate to PUBLIC listing detail page
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  FaList, FaEdit, FaTrash, FaPlus, FaEye, FaSpinner,
  FaTimes, FaMapMarkerAlt, FaClock, FaCheckCircle, FaBolt,
  FaSave, FaExclamationTriangle, FaTag, FaUndo, FaCheck,
  FaCar, FaMotorcycle, FaMobileAlt, FaHome, FaLaptop,
  FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCog, FaPalette,
  FaShieldAlt, FaCity, FaUserTie, FaWrench, FaStar,
  FaFileContract, FaBoxOpen, FaHdd, FaMemory, FaWifi,
  FaBatteryFull, FaFingerprint, FaMicrochip, FaCameraRetro,
  FaBed, FaBath, FaRulerCombined, FaKey, FaCompass, FaParking,
  FaUtensils, FaChair, FaUniversity, FaBuilding, FaLayerGroup,
  FaRulerVertical, FaRegBuilding, FaTools, FaGem, FaMoneyBillWave,
  FaPhone, FaSearch, FaRocket, FaBan, FaRedo, FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   ⭐ CATEGORY → PUBLIC PATH MAPPER (same as Feed.jsx)
   ═══════════════════════════════════════════════════════════════ */
const categoryPath = (rawCat) => {
  const cat = String(rawCat || "").toLowerCase().trim();
  switch (cat) {
    case "vehicles": case "vehicle": case "cars": case "car": return "vehicle";
    case "bikes": case "bike": case "motorcycles": case "motorcycle": return "bike";
    case "mobiles": case "mobile": case "phones": case "phone": return "mobile";
    case "property": case "properties": case "real estate": case "realestate": return "property";
    case "electronics": case "electronic": return "electronic";
    case "toys": case "toy": return "toy";
    default: return "listing";
  }
};

/* ═══════════════════════════════════════════════════════════════
   MY LISTINGS — THEME TOKENS — brand #e66000
   ═══════════════════════════════════════════════════════════════ */
const MyListingsStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    .theme-dark {
      --ml-bg-1:           #0A0A12;
      --ml-bg-2:           #0F0F1A;
      --ml-panel:          rgba(255,255,255,0.045);
      --ml-panel-2:        rgba(255,255,255,0.02);
      --ml-line:           rgba(255,255,255,0.08);
      --ml-line-str:       rgba(255,255,255,0.15);
      --ml-txt:            #FFFFFF;
      --ml-txt-soft:       rgba(255,255,255,0.65);
      --ml-txt-faint:      rgba(255,255,255,0.45);
      --ml-dot:            rgba(255,255,255,0.06);
      --ml-primary:        #e66000;
      --ml-primary-2:      #ff7a1a;
      --ml-primary-3:      #c75200;
      --ml-primary-soft:   rgba(230,96,0,0.14);
      --ml-primary-glow:   rgba(230,96,0,0.45);
      --ml-accent:         #e66000;
      --ml-accent-soft:    rgba(230,96,0,0.16);
      --ml-accent-glow:    rgba(230,96,0,0.55);
      --ml-danger:         #B23A2E;
      --ml-danger-soft:    rgba(178,58,46,0.15);
    }

    .theme-light {
      --ml-bg-1:           #FFFFFF;
      --ml-bg-2:           #FAF7F3;
      --ml-panel:          rgba(255,255,255,0.85);
      --ml-panel-2:        rgba(255,255,255,0.95);
      --ml-line:           rgba(20,20,30,0.08);
      --ml-line-str:       rgba(20,20,30,0.15);
      --ml-txt:            #1A1613;
      --ml-txt-soft:       rgba(26,22,19,0.62);
      --ml-txt-faint:      rgba(26,22,19,0.42);
      --ml-dot:            rgba(20,20,30,0.08);
      --ml-primary:        #e66000;
      --ml-primary-2:      #ff7a1a;
      --ml-primary-3:      #c75200;
      --ml-primary-soft:   rgba(230,96,0,0.12);
      --ml-primary-glow:   rgba(230,96,0,0.35);
      --ml-accent:         #e66000;
      --ml-accent-soft:    rgba(230,96,0,0.12);
      --ml-accent-glow:    rgba(230,96,0,0.35);
      --ml-danger:         #B23A2E;
      --ml-danger-soft:    rgba(178,58,46,0.10);
    }

    .ml-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--ml-primary-soft), transparent 60%),
        radial-gradient(900px 500px at 90% 110%, var(--ml-accent-soft), transparent 60%),
        linear-gradient(180deg, var(--ml-bg-1) 0%, var(--ml-bg-2) 100%);
      color: var(--ml-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .ml-panel {
      background: var(--ml-panel);
      border: 1px solid var(--ml-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .ml-grad-text {
      background: linear-gradient(120deg, #e66000 0%, #ff7a1a 40%, #e66000 70%, #c75200 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .ml-grad-bg {
      background: linear-gradient(135deg, #e66000 0%, #ff7a1a 40%, #e66000 100%);
      color: #FFFFFF;
    }

    /* ⭐ Clickable card hover effect */
    .ml-card-clickable {
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.25s ease,
                  box-shadow 0.25s ease;
    }
    .ml-card-clickable:hover {
      transform: translateY(-2px);
      border-color: var(--ml-accent) !important;
      box-shadow: 0 20px 40px -20px var(--ml-accent-glow),
                  0 0 0 1px var(--ml-accent-soft);
    }
    .ml-card-clickable:active {
      transform: translateY(0);
    }

    /* ⭐ "View listing" pill — appears on hover on desktop */
    .ml-open-pill {
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .ml-card-clickable:hover .ml-open-pill {
      opacity: 1;
      transform: translateX(0);
    }
    @media (max-width: 640px) {
      .ml-open-pill { opacity: 1; transform: translateX(0); }
    }

    @keyframes ml-sweep {
      0%   { transform: translateX(-30%) skewX(-20deg); }
      60%  { transform: translateX(230%) skewX(-20deg); }
      100% { transform: translateX(230%) skewX(-20deg); }
    }

    @keyframes boost-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(230,96,0,0.55); }
      50%      { box-shadow: 0 0 0 6px rgba(230,96,0,0); }
    }
    .boost-pulse { animation: boost-pulse 2.2s ease-in-out infinite; }
  `}</style>
);

const conditions = ["New", "Like New", "Used", "Needs Repair"];

const COLORS = [
  { name: "White",  hex: "#FFFFFF" },
  { name: "Black",  hex: "#111827" },
  { name: "Silver", hex: "#B3A793" },
  { name: "Grey",   hex: "#6B7280" },
  { name: "Red",    hex: "#B23A2E" },
  { name: "Blue",   hex: "#2A4A6B" },
  { name: "Green",  hex: "#164B3B" },
  { name: "Amber",  hex: "#e66000" },
  { name: "Brown",  hex: "#8B5E3C" },
  { name: "Beige",  hex: "#D9C9A8" },
  { name: "Gold",   hex: "#C9A227" },
  { name: "Purple", hex: "#7C3AED" },
];

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Larkana",
  "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan",
  "Gujrat", "Sahiwal", "Wah Cantonment", "Mardan", "Kasur",
  "Okara", "Mingora", "Nawabshah", "Chiniot", "Kamoke",
  "Swabi", "Abbottabad", "Mansehra", "Nowshera", "Charsadda",
  "Kohat", "Bannu", "Dera Ismail Khan", "Swat", "Gilgit",
  "Skardu", "Muzaffarabad", "Mirpur", "Attock", "Jhelum",
  "Chakwal", "Mianwali", "Bhakkar", "Layyah", "Vehari",
];

const AREA_SUGGESTIONS = {
  Lahore: [
    "DHA Phase 1","DHA Phase 2","DHA Phase 3","DHA Phase 4","DHA Phase 5",
    "DHA Phase 6","DHA Phase 7","DHA Phase 8","Gulberg I","Gulberg II","Gulberg III",
    "Model Town","Johar Town","Bahria Town","Bahria Orchard","Askari 10","Askari 11",
    "Cantt","Township","Iqbal Town","Faisal Town","Wapda Town","Green Town","Sabzazar",
    "Shadman","Garden Town","Cavalry Ground","Harbanspura",
  ],
  Karachi: [
    "Clifton Block 1","Clifton Block 2","Clifton Block 5","DHA Phase 1","DHA Phase 5",
    "DHA Phase 6","DHA Phase 8","Gulshan-e-Iqbal Block 13","Gulshan-e-Johar",
    "Bahadurabad","PECHS Block 2","PECHS Block 6","Saddar","North Nazimabad",
    "Nazimabad","Malir Cantt","Korangi","Scheme 33","Federal B Area","Tariq Road",
  ],
  Islamabad: [
    "F-5","F-6","F-7","F-8","F-10","F-11","G-5","G-6","G-7","G-8","G-9","G-10","G-11",
    "E-7","E-8","E-11","H-8","H-9","H-11","I-8","I-9","I-10","DHA Phase 1","DHA Phase 2",
    "DHA Phase 5","Bahria Enclave","Gulberg Greens","Gulberg Residencia","Blue Area",
  ],
  Rawalpindi: [
    "Bahria Town Phase 1","Bahria Town Phase 2","Bahria Town Phase 3","Bahria Town Phase 4",
    "Bahria Town Phase 5","Bahria Town Phase 7","Bahria Town Phase 8","Chaklala Scheme 1",
    "Chaklala Scheme 2","Chaklala Scheme 3","Satellite Town","Saddar","Adiala Road",
    "Gulraiz Housing","Peshawar Road","Airport Housing",
  ],
};

const GENERIC_AREAS = [
  "Cantt","Civil Lines","Model Town","Satellite Town","Gulberg","DHA","Bahria Town",
  "Peoples Colony","Wapda Town","Gulshan Colony","Block A","Block B","Main Bazaar",
  "City Area","Old City","New Colony",
];

/* ═══ VEHICLES ═══ */
const VEHICLE_MAKES = [
  "Toyota","Honda","Suzuki","Kia","Hyundai","MG","Changan","Proton",
  "Nissan","Mitsubishi","Mazda","BMW","Mercedes-Benz","Audi","Lexus",
  "Land Rover","Jeep","Ford","Chevrolet","Daihatsu","FAW","Haval","Peugeot",
  "Renault","United","Prince","Daehan","DFSK","Chery","Oshan","Other",
];
const VEHICLE_MODELS_BY_MAKE = {
  Toyota: ["Corolla","Yaris","Camry","Prius","Vitz","Aqua","Passo","Land Cruiser","Prado","Fortuner","Hilux","Hiace","Coaster","Rush","C-HR","Raize","Other"],
  Honda: ["Civic","City","Accord","BR-V","HR-V","CR-V","Vezel","Fit","N-WGN","N-Box","Odyssey","Other"],
  Suzuki: ["Alto","Cultus","Wagon R","Swift","Bolan","Ravi","Every","Mehran","Khyber","Liana","Margalla","Vitara","Jimny","Other"],
  Kia: ["Sportage","Sorento","Picanto","Stonic","Carnival","Grand Carnival","Other"],
  Hyundai: ["Tucson","Elantra","Sonata","Santa Fe","i10","i20","Porter","Other"],
  MG: ["HS","ZS","ZS EV","5","RX8","GT","Other"],
  Changan: ["Alsvin","Karvaan","Oshan X7","CX70","M9","Other"],
  Proton: ["Saga","Persona","Iriz","Exora","Other"],
  Nissan: ["Dayz","Note","Juke","X-Trail","Sunny","Other"],
  Mitsubishi: ["Pajero","Lancer","Mirage","Outlander","Other"],
  Mazda: ["Demio","Axela","CX-5","CX-8","Other"],
  BMW: ["3 Series","5 Series","7 Series","X1","X3","X5","X6","Other"],
  "Mercedes-Benz": ["C-Class","E-Class","S-Class","GLA","GLC","GLE","Other"],
  Audi: ["A3","A4","A6","Q3","Q5","Q7","Other"],
  Lexus: ["ES","IS","LS","NX","RX","LX","Other"],
  "Land Rover": ["Range Rover","Range Rover Sport","Evoque","Discovery","Defender","Other"],
  Jeep: ["Wrangler","Cherokee","Grand Cherokee","Compass","Other"],
  Ford: ["Ranger","Mustang","Explorer","F-150","Other"],
  Haval: ["H6","Jolion","H9","Other"],
  Other: ["Other"],
};
const VEHICLE_TRANSMISSIONS = ["Automatic","Manual","CVT","DCT","Tiptronic","Other"];
const VEHICLE_FUELS = ["Petrol","Diesel","CNG","Electric","Hybrid","LPG","Other"];
const VEHICLE_BODY_TYPES = ["Sedan","Hatchback","SUV","Crossover","MPV","Van","Coupe","Convertible","Pickup","Truck","Wagon","Other"];
const VEHICLE_ASSEMBLY = ["Local","Imported","Other"];
const VEHICLE_OWNERS = ["1st","2nd","3rd","4th+"];

/* ═══ BIKES ═══ */
const BIKE_MAKES = [
  "Honda","Yamaha","Suzuki","United","Road Prince","Ravi","Super Power",
  "Ravi Piaggio","Crown","Unique","Roma","Metro","Sohrab","Hero","Other",
];
const BIKE_MODELS_BY_MAKE = {
  Honda: ["CD 70","CD 100","CD 125","CG 125","Pridor","CB 150F","CB 125F","CB 250F","Benly","Other"],
  Yamaha: ["YBR 125","YBR 125G","YBR 125Z","YB 125Z","YBR 150","XTZ 125","Other"],
  Suzuki: ["GD 110","GS 150","GR 150","Other"],
  United: ["US 70","US 100","US 125","US 150","Other"],
  "Road Prince": ["RP 70","RP 100","RP 125","Other"],
  Ravi: ["Ravi 70","Ravi 100","Other"],
  "Super Power": ["SP 70","SP 100","SP 125","Other"],
  "Ravi Piaggio": ["Piaggio 70","Piaggio 100","Other"],
  Crown: ["Crown 70","Crown 100","Other"],
  Unique: ["Unique 70","Unique 100","Other"],
  Roma: ["Roma 70","Roma 100","Other"],
  Metro: ["Metro 70","Metro 100","Other"],
  Sohrab: ["Sohrab 70","Sohrab 100","Other"],
  Hero: ["Hero 70","Hero 100","Other"],
  Other: ["Other"],
};
const BIKE_ENGINE = ["70cc","100cc","110cc","125cc","150cc","200cc","250cc+","Electric","Other"];

/* ═══ MOBILES ═══ */
const MOBILE_BRANDS = [
  "Apple","Samsung","Xiaomi","Oppo","Vivo","Realme","OnePlus","Huawei","Honor",
  "Google","Infinix","Tecno","Itel","Nokia","Sony","Motorola","Asus","Nothing",
  "Lenovo","QMobile","Other",
];
const MOBILE_MODELS_BY_BRAND = {
  Apple: ["iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15 Plus","iPhone 15","iPhone 14 Pro Max","iPhone 14 Pro","iPhone 14 Plus","iPhone 14","iPhone 13 Pro Max","iPhone 13 Pro","iPhone 13","iPhone 12 Pro Max","iPhone 12","iPhone 11 Pro Max","iPhone 11","iPhone XS Max","iPhone XR","iPhone X","iPhone SE 2022","iPhone SE 2020","iPad Pro","iPad Air","iPad Mini","iPad","Other"],
  Samsung: ["Galaxy S24 Ultra","Galaxy S24+","Galaxy S24","Galaxy S23 Ultra","Galaxy S22 Ultra","Galaxy S21","Galaxy Z Fold 5","Galaxy Z Flip 5","Galaxy A54","Galaxy A34","Galaxy A14","Galaxy M34","Galaxy Tab S9","Galaxy Tab S8","Other"],
  Xiaomi: ["14 Pro","14","13 Pro","13","12 Pro","12","11T Pro","Redmi Note 13 Pro","Redmi Note 13","Redmi Note 12","Redmi 13C","Redmi 12","Poco X6 Pro","Poco F5","Other"],
  Oppo: ["Find X7","Reno 11 Pro","Reno 10","Reno 8","A78","A58","A17","A16","A5s","Other"],
  Vivo: ["X100 Pro","X90","V29 Pro","V29","Y36","Y27","Y22","Y17s","Y02","Other"],
  Realme: ["GT 5 Pro","GT Neo 5","12 Pro+","11 Pro","C67","C55","C53","Narzo 60","Other"],
  OnePlus: ["12","11","10 Pro","9 Pro","Nord 3","Nord CE 3","Other"],
  Google: ["Pixel 8 Pro","Pixel 8","Pixel 7 Pro","Pixel 7","Pixel 6a","Other"],
  Infinix: ["Zero 30","Note 40","Note 30","Hot 40","Hot 30","Smart 8","Other"],
  Tecno: ["Camon 30","Camon 20","Spark 20","Spark 10","Pova 5","Other"],
  Other: ["Other"],
};
const MOBILE_STORAGE = ["32GB","64GB","128GB","256GB","512GB","1TB"];
const MOBILE_RAM = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB"];
const MOBILE_NETWORK = ["5G","4G LTE","3G","WiFi Only"];

/* ═══ PROPERTY ═══ */
const PROPERTY_TYPES = ["House","Apartment","Flat","Plot","Commercial","Farm House","Shop","Office","Warehouse","Building","Other"];
const PROPERTY_PURPOSE = ["For Sale","For Rent","For Lease"];
const PROPERTY_SUB_TYPES = ["Residential","Commercial","Industrial","Agricultural","Other"];
const PROPERTY_TITLE_TYPE = ["Freehold","Leasehold","Registry","Fard","Allotment","Other"];
const PROPERTY_SOCIETIES = ["DHA","Bahria Town","LDA","CDA","RDA","Askari","Gulberg Greens","Model Town Society","Other"];
const PROPERTY_AREA_UNITS = ["Marla","Kanal","Sq. Ft.","Sq. Yards","Acre"];
const PROPERTY_FACING = ["North","South","East","West","North-East","North-West","South-East","South-West","Corner","Main Road","Other"];
const PROPERTY_DOCUMENTS = ["Registry","Fard","NOC","Allotment Letter","Transfer Letter","Sale Deed","Other"];

/* ═══ ELECTRONICS ═══ */
const ELECTRONICS_BRANDS = [
  "Apple","Samsung","Dell","HP","Lenovo","Asus","Acer","MSI","Sony","LG",
  "JBL","Bose","Beats","Canon","Nikon","Fujifilm","Logitech","Razer","Other",
];
const ELECTRONICS_TYPES = ["Laptop","Desktop","TV","Camera","Audio","Gaming Console","Monitor","Printer","Router","Tablet","Wearable","Other"];

/* ═══ SPEC GROUPS ═══ */
const specGroupsByCategory = {
  Vehicles: [
    {
      title: "Vehicle Information",
      icon: FaCar,
      fields: [
        { key: "make", label: "Make", icon: FaCar, kind: "suggest", suggestions: VEHICLE_MAKES, placeholder: "e.g., Toyota", required: true },
        { key: "model", label: "Model", icon: FaCar, kind: "suggest", suggestionsKey: "models", placeholder: "e.g., Corolla", required: true },
        { key: "year", label: "Year", icon: FaCalendarAlt, kind: "number", placeholder: "e.g., 2022", required: true },
        { key: "variant", label: "Variant", icon: FaGem, kind: "text", placeholder: "e.g., Altis Grande" },
        { key: "bodyType", label: "Body Type", icon: FaCar, kind: "select", options: VEHICLE_BODY_TYPES },
        { key: "assembly", label: "Assembly", icon: FaTools, kind: "select", options: VEHICLE_ASSEMBLY },
        { key: "color", label: "Exterior Color", icon: FaPalette, kind: "color" },
      ],
    },
    {
      title: "Engine & Performance",
      icon: FaCog,
      fields: [
        { key: "engine", label: "Engine (cc)", icon: FaCog, kind: "text", placeholder: "e.g., 1800cc" },
        { key: "transmission", label: "Transmission", icon: FaCog, kind: "select", options: VEHICLE_TRANSMISSIONS, required: true },
        { key: "fuel", label: "Fuel Type", icon: FaGasPump, kind: "select", options: VEHICLE_FUELS, required: true },
        { key: "mileage", label: "Mileage (km)", icon: FaTachometerAlt, kind: "text", placeholder: "e.g., 45,000" },
      ],
    },
    {
      title: "Condition & History",
      icon: FaShieldAlt,
      fields: [
        { key: "registeredIn", label: "Registered City", icon: FaCity, kind: "suggest", suggestions: CITIES, placeholder: "e.g., Lahore" },
        { key: "ownersCount", label: "Owners", icon: FaUserTie, kind: "select", options: VEHICLE_OWNERS },
        { key: "accidentFree", label: "Accident Free", icon: FaShieldAlt, kind: "select", options: ["Yes","No","Minor"] },
        { key: "lastService", label: "Last Service", icon: FaWrench, kind: "text", placeholder: "e.g., 3 months ago" },
      ],
    },
  ],

  Bikes: [
    {
      title: "Bike Information",
      icon: FaMotorcycle,
      fields: [
        { key: "make", label: "Make", icon: FaMotorcycle, kind: "suggest", suggestions: BIKE_MAKES, placeholder: "e.g., Honda", required: true },
        { key: "model", label: "Model", icon: FaMotorcycle, kind: "suggest", suggestionsKey: "models", placeholder: "e.g., CD 70", required: true },
        { key: "year", label: "Year", icon: FaCalendarAlt, kind: "number", placeholder: "e.g., 2023", required: true },
        { key: "engine", label: "Engine (cc)", icon: FaCog, kind: "select", options: BIKE_ENGINE },
        { key: "color", label: "Color", icon: FaPalette, kind: "color" },
      ],
    },
    {
      title: "Condition & Registration",
      icon: FaShieldAlt,
      fields: [
        { key: "mileage", label: "Mileage (km)", icon: FaTachometerAlt, kind: "text", placeholder: "e.g., 4,200" },
        { key: "registeredIn", label: "Registered City", icon: FaCity, kind: "suggest", suggestions: CITIES, placeholder: "e.g., Lahore" },
        { key: "ownersCount", label: "Owners", icon: FaUserTie, kind: "select", options: VEHICLE_OWNERS },
        { key: "documents", label: "Documents Complete", icon: FaFileContract, kind: "select", options: ["Yes","No"] },
      ],
    },
  ],

  Mobiles: [
    {
      title: "Device Information",
      icon: FaMobileAlt,
      fields: [
        { key: "brand", label: "Brand", icon: FaMobileAlt, kind: "suggest", suggestions: MOBILE_BRANDS, placeholder: "e.g., Apple", required: true },
        { key: "model", label: "Model", icon: FaMobileAlt, kind: "suggest", suggestionsKey: "models", placeholder: "e.g., iPhone 15", required: true },
        { key: "storage", label: "Storage", icon: FaHdd, kind: "select", options: MOBILE_STORAGE, required: true },
        { key: "ram", label: "RAM", icon: FaMemory, kind: "select", options: MOBILE_RAM },
        { key: "network", label: "Network", icon: FaWifi, kind: "select", options: MOBILE_NETWORK },
        { key: "color", label: "Color", icon: FaPalette, kind: "color" },
      ],
    },
    {
      title: "Battery & Warranty",
      icon: FaBatteryFull,
      fields: [
        { key: "battery", label: "Battery Health", icon: FaBatteryFull, kind: "text", placeholder: "e.g., 98%" },
        { key: "warranty", label: "Warranty", icon: FaFileContract, kind: "text", placeholder: "e.g., 6 months" },
        { key: "pta", label: "PTA Approved", icon: FaCheckCircle, kind: "select", options: ["Yes","No"], required: true },
        { key: "boxAvailable", label: "Box & Accessories", icon: FaBoxOpen, kind: "select", options: ["Yes","No"] },
        { key: "fingerprint", label: "Face/Fingerprint", icon: FaFingerprint, kind: "select", options: ["Yes","No"] },
      ],
    },
    {
      title: "Condition Details",
      icon: FaShieldAlt,
      fields: [
        { key: "screenCondition", label: "Screen", icon: FaMobileAlt, kind: "select", options: ["Perfect","Minor scratches","Cracked"] },
        { key: "bodyCondition", label: "Body", icon: FaMobileAlt, kind: "select", options: ["Perfect","Minor dents","Damaged"] },
        { key: "repaired", label: "Any Repairs?", icon: FaWrench, kind: "select", options: ["Never opened","Screen replaced","Battery replaced","Other"] },
      ],
    },
  ],

  Property: [
    {
      title: "Property Type & Basic",
      icon: FaHome,
      fields: [
        { key: "type", label: "Property Type", icon: FaHome, kind: "select", options: PROPERTY_TYPES, required: true },
        { key: "purpose", label: "Purpose", icon: FaKey, kind: "select", options: PROPERTY_PURPOSE, required: true },
        { key: "subType", label: "Sub-Type", icon: FaBuilding, kind: "select", options: PROPERTY_SUB_TYPES },
        { key: "title_type", label: "Title Type", icon: FaFileContract, kind: "select", options: PROPERTY_TITLE_TYPE },
        { key: "society", label: "Society", icon: FaRegBuilding, kind: "suggest", suggestions: PROPERTY_SOCIETIES, placeholder: "e.g., DHA" },
      ],
    },
    {
      title: "Area & Layout",
      icon: FaRulerCombined,
      fields: [
        { key: "area", label: "Area", icon: FaRulerCombined, kind: "text", placeholder: "e.g., 10", required: true },
        { key: "areaUnit", label: "Area Unit", icon: FaRulerVertical, kind: "select", options: PROPERTY_AREA_UNITS, required: true },
        { key: "beds", label: "Bedrooms", icon: FaBed, kind: "select", options: ["1","2","3","4","5","6","7","8+"] },
        { key: "baths", label: "Bathrooms", icon: FaBath, kind: "select", options: ["1","2","3","4","5","6+"] },
        { key: "floors", label: "Floors", icon: FaLayerGroup, kind: "select", options: ["Ground only","Ground + 1","Ground + 2","Ground + 3+"] },
        { key: "kitchens", label: "Kitchens", icon: FaUtensils, kind: "select", options: ["1","2","3+"] },
        { key: "servantQuarters", label: "Servant Qtr.", icon: FaHome, kind: "select", options: ["Yes","No"] },
      ],
    },
    {
      title: "Features & Amenities",
      icon: FaStar,
      fields: [
        { key: "facing", label: "Facing", icon: FaCompass, kind: "select", options: PROPERTY_FACING },
        { key: "parking", label: "Parking", icon: FaParking, kind: "select", options: ["None","1","2","3","4+"] },
        { key: "furnished", label: "Furnishing", icon: FaChair, kind: "select", options: ["Unfurnished","Semi-Furnished","Fully Furnished"] },
      ],
    },
    {
      title: "Legal & Documents",
      icon: FaFileContract,
      fields: [
        { key: "documents", label: "Documents", icon: FaFileContract, kind: "multi", options: PROPERTY_DOCUMENTS },
        { key: "loanFree", label: "Loan Free", icon: FaUniversity, kind: "select", options: ["Yes","No"], required: true },
        { key: "disputeFree", label: "Dispute Free", icon: FaShieldAlt, kind: "select", options: ["Yes","No"], required: true },
        { key: "possession", label: "Possession", icon: FaKey, kind: "select", options: ["Immediate","On Payment","1 Month","3 Months+"] },
        { key: "plotNumber", label: "Plot / House No.", icon: FaHome, kind: "text", placeholder: "Optional" },
      ],
    },
    {
      title: "Pricing & Availability",
      icon: FaMoneyBillWave,
      fields: [
        { key: "priceNegotiable", label: "Negotiable", icon: FaMoneyBillWave, kind: "select", options: ["Yes","No","Slightly"] },
        { key: "installments", label: "Installments", icon: FaMoneyBillWave, kind: "select", options: ["Yes","No"] },
        { key: "taxPaid", label: "Taxes Paid", icon: FaFileContract, kind: "select", options: ["Yes","No"] },
        { key: "maintenanceCharges", label: "Monthly Maintenance", icon: FaMoneyBillWave, kind: "text", placeholder: "e.g., Rs 5,000" },
      ],
    },
  ],

  Electronics: [
    {
      title: "Device Information",
      icon: FaLaptop,
      fields: [
        { key: "brand", label: "Brand", icon: FaLaptop, kind: "suggest", suggestions: ELECTRONICS_BRANDS, placeholder: "e.g., Apple, Dell", required: true },
        { key: "model", label: "Model", icon: FaLaptop, kind: "text", placeholder: "e.g., MacBook Pro 14", required: true },
        { key: "type", label: "Type", icon: FaLaptop, kind: "select", options: ELECTRONICS_TYPES },
        { key: "processor", label: "Processor", icon: FaMicrochip, kind: "text", placeholder: "e.g., M3 Pro" },
        { key: "ram", label: "RAM", icon: FaMemory, kind: "select", options: ["4GB","8GB","16GB","32GB","64GB+"] },
        { key: "storage", label: "Storage", icon: FaHdd, kind: "text", placeholder: "e.g., 512GB SSD" },
        { key: "screen", label: "Screen Size", icon: FaLaptop, kind: "text", placeholder: "e.g., 14 inch" },
        { key: "camera", label: "Camera", icon: FaCameraRetro, kind: "text", placeholder: "e.g., 4K Webcam" },
        { key: "color", label: "Color", icon: FaPalette, kind: "color" },
      ],
    },
    {
      title: "Condition & Warranty",
      icon: FaShieldAlt,
      fields: [
        { key: "warranty", label: "Warranty", icon: FaFileContract, kind: "text", placeholder: "e.g., 1 year" },
        { key: "boxAvailable", label: "Box & Accessories", icon: FaBoxOpen, kind: "select", options: ["Yes","No"] },
        { key: "repaired", label: "Any Repairs?", icon: FaWrench, kind: "select", options: ["Never opened","Minor repair","Major repair"] },
        { key: "year", label: "Year", icon: FaCalendarAlt, kind: "number", placeholder: "e.g., 2023" },
      ],
    },
  ],
};

const getModelSuggestions = (category, make) => {
  if (category === "Vehicles") return VEHICLE_MODELS_BY_MAKE[make] || [];
  if (category === "Bikes") return BIKE_MODELS_BY_MAKE[make] || [];
  if (category === "Mobiles") return MOBILE_MODELS_BY_BRAND[make] || [];
  return [];
};

const timeAgo = (iso) => {
  if (!iso) return "recently";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

/* ═══ SUGGEST INPUT ═══ */
const SuggestInput = ({
  label, value, onChange, placeholder, icon: Icon, suggestions = [],
  error, maxSuggestions = 8, required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = String(value || "").trim().toLowerCase();
    if (!q) return suggestions.slice(0, maxSuggestions);
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, maxSuggestions);
  }, [value, suggestions, maxSuggestions]);

  const pick = (s) => { onChange(s); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter") { e.preventDefault(); pick(filtered[highlight]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
        style={{ color: "var(--ml-txt-soft)" }}>
        {label}
        {required && <span className="text-[#B23A2E] ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
          style={{ color: "var(--ml-primary)" }} />}
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`font-ticket-body w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl border bg-transparent text-sm outline-none transition-colors ml-input`}
          style={{
            color: "var(--ml-txt)",
            borderColor: error ? "rgba(178,58,46,0.5)" : "var(--ml-line-str)",
          }}
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[80] left-0 right-0 mt-1 rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] overflow-hidden max-h-56 overflow-y-auto scrollbar-hide ml-suggest"
            style={{ background: "var(--ml-bg-1)", border: "1px solid var(--ml-line)" }}
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                className="px-3 py-2 font-ticket-body text-xs cursor-pointer"
                style={
                  i === highlight
                    ? { background: "var(--ml-accent-soft)", color: "var(--ml-accent)" }
                    : { color: "var(--ml-txt)" }
                }
              >
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══ MULTI SELECT ═══ */
const MultiSelect = ({ label, values = [], onChange, options = [], icon: Icon }) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const toggle = (opt) => {
    const has = values.includes(opt);
    onChange(has ? values.filter((v) => v !== opt) : [...values, opt]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return showAll || q ? base : base.slice(0, 12);
  }, [search, options, showAll]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: "var(--ml-txt-soft)" }}>
          {Icon && <Icon className="text-[10px]" style={{ color: "var(--ml-primary)" }} />}
          {label}
        </label>
        {values.length > 0 && (
          <span className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              color: "var(--ml-accent)",
              background: "var(--ml-accent-soft)",
              borderColor: "var(--ml-accent)",
            }}>
            {values.length} selected
          </span>
        )}
      </div>

      {options.length > 12 && (
        <div className="relative mb-2.5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="font-ticket-body w-full pl-8 pr-3 py-2 rounded-lg border text-xs outline-none"
            style={{
              color: "var(--ml-txt)",
              background: "transparent",
              borderColor: "var(--ml-line-str)",
            }}
          />
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px]"
            style={{ color: "var(--ml-primary)" }} />
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {filtered.map((opt) => {
          const isOn = values.includes(opt);
          return (
            <motion.button
              key={opt}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(opt)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all"
              style={
                isOn
                  ? { background: "var(--ml-accent)", color: "#FFFFFF", borderColor: "transparent" }
                  : { borderColor: "var(--ml-line-str)", color: "var(--ml-txt)" }
              }
            >
              {isOn ? <FaCheck className="text-[8px] sm:text-[9px]" /> : <FaPlus className="text-[7px] sm:text-[8px] opacity-60" />}
              <span>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {options.length > 12 && !search && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2.5 font-ticket-body text-[10px] font-bold underline decoration-dotted underline-offset-2"
          style={{ color: "var(--ml-accent)" }}
        >
          {showAll ? "Show fewer" : `Show all ${options.length} options`}
        </button>
      )}
    </div>
  );
};

/* ═══ COLOR PICKER ═══ */
const ColorPicker = ({ label, value, onChange, icon: Icon }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-2">
      <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
        style={{ color: "var(--ml-txt-soft)" }}>
        {Icon && <Icon className="text-[10px]" style={{ color: "var(--ml-primary)" }} />}
        {label}
      </label>
      {value && (
        <span className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            color: "var(--ml-accent)",
            background: "var(--ml-accent-soft)",
            borderColor: "var(--ml-accent)",
          }}>
          {value}
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => {
        const active = value === c.name;
        const isLight = ["White","Silver","Beige","Gold"].includes(c.name);
        return (
          <button
            key={c.name}
            type="button"
            title={c.name}
            onClick={() => onChange(active ? "" : c.name)}
            className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 transition-all flex-shrink-0 ${
              active ? "scale-110" : "hover:scale-110"
            }`}
            style={{
              backgroundColor: c.hex,
              borderColor: active ? "var(--ml-accent)" : "var(--ml-line-str)",
              boxShadow: active ? "0 0 0 3px var(--ml-accent-soft)" : undefined,
            }}
          >
            {active && (
              <span className="absolute inset-0 flex items-center justify-center">
                <FaCheck className="text-[10px]" style={{ color: isLight ? "#111827" : "#FFFFFF" }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [markSoldId, setMarkSoldId] = useState(null);
  const [isMarking, setIsMarking] = useState(false);

  const [relistId, setRelistId] = useState(null);
  const [isRelisting, setIsRelisting] = useState(false);

  /* ⭐ Resubmit (after rejection) */
  const [resubmitId, setResubmitId] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchMyListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("posted_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error("Fetch my listings error:", err);
      showToast("Failed to load listings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ⭐ Check if a listing is currently boosted */
  const isBoosted = (listing) => {
    if (!listing?.featured) return false;
    if (!listing?.featured_until) return true;
    return new Date(listing.featured_until) > new Date();
  };

  /* ⭐ Days remaining on boost */
  const boostDaysLeft = (listing) => {
    if (!listing?.featured_until) return null;
    const ms = new Date(listing.featured_until).getTime() - Date.now();
    if (ms <= 0) return 0;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  const handleMarkSold = async () => {
    if (!markSoldId) return;
    setIsMarking(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", markSoldId)
        .eq("user_id", user.id);
      if (error) throw error;
      showToast("Marked as sold 🎉");
      setMarkSoldId(null);
      fetchMyListings();
    } catch (err) {
      showToast(err.message || "Failed to mark as sold", "error");
    } finally {
      setIsMarking(false);
    }
  };

  const handleRelist = async () => {
    if (!relistId) return;
    setIsRelisting(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "pending" })
        .eq("id", relistId)
        .eq("user_id", user.id);
      if (error) throw error;
      showToast("Listing submitted for review ✅");
      setRelistId(null);
      fetchMyListings();
    } catch (err) {
      showToast(err.message || "Failed to re-list", "error");
    } finally {
      setIsRelisting(false);
    }
  };

  /* ⭐ Resubmit a rejected listing */
  const handleResubmit = async () => {
    if (!resubmitId) return;
    setIsResubmitting(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          status: "pending",
          moderation_notes: null,
          reviewed_at: null,
        })
        .eq("id", resubmitId)
        .eq("user_id", user.id);
      if (error) throw error;
      showToast("Listing resubmitted for review");
      setResubmitId(null);
      fetchMyListings();
    } catch (err) {
      showToast(err.message || "Failed to resubmit", "error");
    } finally {
      setIsResubmitting(false);
    }
  };

  /* ⭐ Boost redirect */
  const handleBoost = (listing) => {
    const url = `/checkout?boost=${listing.id}&days=7&amount=200`;
    window.location.href = url;
  };
const handleCardClick = (listing) => {
  navigate(`/listing/${listing.id}`);   // → /listing/f30bd0ea-...
};
  const startEdit = (listing) => {
    setEditingId(listing.id);
    setEditingCategory(listing.category);
    setEditForm({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price || "",
      condition: listing.condition || "",
      city: listing.city || "",
      area: listing.area || "",
      contact_number: listing.contact_number || "",
      specs: listing.specs || {},
    });
    setEditImages(
      (listing.images || []).map((url, idx) => ({
        id: `${listing.id}-${idx}`,
        url,
        existing: true,
      }))
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCategory(null);
    setEditForm(null);
    setEditImages([]);
  };

  const updateSpec = (key, value) => {
    setEditForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const getFieldSuggestions = (field) => {
    if (field.suggestionsKey === "models") {
      const make = editForm?.specs?.make;
      return getModelSuggestions(editingCategory, make);
    }
    return field.suggestions || [];
  };

  const handleEditImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (editImages.length + files.length > 5) {
      showToast("You can have up to 5 images.", "error");
      return;
    }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is larger than 5MB.`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), url: ev.target.result, file, name: file.name, existing: false },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeEditImage = (id) => {
    setEditImages((prev) => prev.filter((img) => img.id !== id));
  };

  const uploadImage = async (img) => {
    if (img.existing) return img.url;
    const file = img.file;
    if (!file) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const saveEdit = async () => {
    if (!editForm || !editingId) return;
    if (!editForm.title.trim()) { showToast("Title is required", "error"); return; }
    if (!editForm.price || Number(editForm.price) <= 0) { showToast("Valid price is required", "error"); return; }

    setIsSaving(true);
    try {
      const imageUrls = [];
      for (const img of editImages) {
        const url = await uploadImage(img);
        if (url) imageUrls.push(url);
      }

      const currentListing = listings.find((l) => l.id === editingId);
      const wasActive = currentListing?.status === "active";

      const { error } = await supabase
        .from("listings")
        .update({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          price: Number(editForm.price),
          condition: editForm.condition,
          city: editForm.city,
          area: editForm.area.trim() || null,
          contact_number: editForm.contact_number.trim(),
          specs: editForm.specs || {},
          images: imageUrls,
          cover_image: imageUrls[0] || null,
          status: wasActive ? "pending" : currentListing?.status,
          moderation_notes: wasActive ? null : currentListing?.moderation_notes,
        })
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) throw error;

      showToast(wasActive ? "Updated — pending review" : "Listing updated successfully");
      cancelEdit();
      fetchMyListings();
    } catch (err) {
      showToast(err.message || "Failed to save changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("listings").delete()
        .eq("id", deleteId)
        .eq("user_id", user.id);
      if (error) throw error;
      showToast("Listing deleted");
      setDeleteId(null);
      fetchMyListings();
    } catch (err) {
      showToast(err.message || "Failed to delete", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (filter === "all") return true;
    return l.status === filter;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "pending").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  const formatPrice = (num) => {
    const n = Number(num) || 0;
    if (n >= 10000000) {
      const c = n / 10000000;
      return `Rs ${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, "")} Crore`;
    }
    if (n >= 100000) {
      const l = n / 100000;
      return `Rs ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, "")} Lakh`;
    }
    return `Rs ${n.toLocaleString("en-US")}`;
  };

  const activeSpecGroups = editingCategory
    ? specGroupsByCategory[editingCategory] || []
    : [];

  const areaSuggestions = useMemo(() => {
    const city = String(editForm?.city || "").trim();
    if (city && AREA_SUGGESTIONS[city]) return AREA_SUGGESTIONS[city];
    const key = Object.keys(AREA_SUGGESTIONS).find(
      (c) => c.toLowerCase() === city.toLowerCase()
    );
    if (key) return AREA_SUGGESTIONS[key];
    return GENERIC_AREAS;
  }, [editForm?.city]);

  return (
    <div className="min-h-screen ml-bg relative">
      <MyListingsStyles />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(var(--ml-accent) 0.6px, transparent 0.6px)`,
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[70] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border font-ticket-body text-xs sm:text-sm font-bold shadow-lg max-w-[90vw] text-center"
            style={{
              background: toast.type === "error" ? "var(--ml-danger)" : "var(--ml-accent)",
              color: "#FFFFFF",
              borderColor: "transparent",
              boxShadow: toast.type === "error"
                ? "0 10px 30px -8px rgba(178,58,46,0.5)"
                : "0 10px 30px -8px var(--ml-accent-glow)",
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 rounded-xl border flex items-center justify-center"
              style={{ borderColor: "var(--ml-accent)", background: "var(--ml-accent-soft)" }}>
              <FaList className="text-sm sm:text-base" style={{ color: "var(--ml-accent)" }} />
            </div>
            <div className="min-w-0">
              <h1 className="font-ticket-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
                style={{ color: "var(--ml-txt)" }}>
                My Listings
              </h1>
              <p className="font-ticket-body text-[11px] sm:text-xs lg:text-sm"
                style={{ color: "var(--ml-txt-soft)" }}>
                {isLoading ? "Loading..." : `${listings.length} ads posted · tap a card to open`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="rounded-[18px] sm:rounded-[22px] border p-1.5 mb-4 sm:mb-5 flex items-center gap-1 overflow-x-auto scrollbar-hide"
          style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}>
          {[
            { id: "all",      label: "All" },
            { id: "active",   label: "Active" },
            { id: "pending",  label: "Pending" },
            { id: "rejected", label: "Rejected" },
            { id: "sold",     label: "Sold" },
          ].map((t) => {
            const active = filter === t.id;
            const count = statusCounts[t.id] || 0;
            const isRejected = t.id === "rejected";
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className="relative flex-1 min-w-[80px] sm:min-w-[100px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-ticket-body text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors"
                style={{ color: active ? "#FFFFFF" : "var(--ml-txt-soft)" }}
              >
                {active && (
                  <motion.div
                    layoutId="my-listings-filter"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isRejected
                        ? "linear-gradient(135deg, #B23A2E 0%, #8A2A20 100%)"
                        : "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                      boxShadow: isRejected
                        ? "0 6px 20px -6px rgba(178,58,46,0.6)"
                        : "0 6px 20px -6px var(--ml-accent-glow)",
                    }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                {active && isRejected && <FaBan className="relative z-10 text-[9px]" />}
                <span className="relative z-10">{t.label}</span>
                <span className="relative z-10 font-ticket-body text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? "rgba(255,255,255,0.20)" : "var(--ml-panel-2)",
                    color: active ? "#FFFFFF" : "var(--ml-txt-soft)",
                  }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* LISTINGS GRID */}
        {isLoading ? (
          <div className="rounded-[22px] border py-16 sm:py-20 text-center"
            style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}>
            <FaSpinner className="text-2xl sm:text-3xl mx-auto mb-4 animate-spin"
              style={{ color: "var(--ml-accent)" }} />
            <p className="font-ticket-body text-xs sm:text-sm" style={{ color: "var(--ml-txt-soft)" }}>
              Loading your listings...
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-[22px] border py-12 sm:py-16 px-4 text-center"
            style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}>
            <FaList className="text-3xl sm:text-4xl mx-auto mb-4"
              style={{ color: "var(--ml-txt-faint)" }} />
            <p className="font-ticket-display text-base sm:text-lg font-bold mb-1"
              style={{ color: "var(--ml-txt)" }}>
              {filter === "all" ? "No listings yet" : `No ${filter} listings`}
            </p>
            <p className="font-ticket-body text-[11px] sm:text-xs mb-4" style={{ color: "var(--ml-txt-soft)" }}>
              {filter === "all"
                ? "Post your first ad to get started"
                : filter === "rejected"
                  ? "No rejected listings — nice work!"
                  : "Try a different filter"}
            </p>
            <Link
              to="/post-ad"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-ticket-body text-xs font-bold"
              style={{ background: "var(--ml-accent)", color: "#FFFFFF" }}
            >
              <FaPlus className="text-[10px]" /> Post Ad
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((v) => {
              const boosted = isBoosted(v);
              const daysLeft = boostDaysLeft(v);
              const isRejected = v.status === "rejected";
              const isActive = v.status === "active";

              return (
                <motion.div
                  key={v.id}
                  layout
                  onClick={() => handleCardClick(v)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(v);
                    }
                  }}
                  className="ml-card-clickable rounded-[22px] border overflow-hidden flex flex-col sm:flex-row"
                  style={{
                    background: "var(--ml-bg-1)",
                    borderColor: isRejected ? "var(--ml-danger)" : "var(--ml-line)",
                    borderWidth: isRejected ? 2 : 1,
                  }}
                >
                  <div className="relative sm:w-48 aspect-[4/3] sm:aspect-auto bg-black flex-shrink-0">
                    <img
                      src={v.cover_image || v.images?.[0] || "/car1.png"}
                      alt={v.title}
                      className={`w-full h-full object-contain p-3 ${isRejected ? "opacity-50 grayscale" : ""}`}
                      loading="lazy"
                    />

                    {/* ⭐ Boosted badge */}
                    {boosted && !isRejected && (
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                          color: "#FFFFFF",
                          boxShadow: "0 4px 14px -4px rgba(230,96,0,0.8)",
                        }}>
                        <FaRocket className="text-[8px]" />
                        <span className="font-ticket-body text-[8px] font-black uppercase tracking-wider">
                          Boosted
                        </span>
                        {daysLeft != null && (
                          <span className="font-ticket-body text-[8px] font-bold opacity-80">
                            · {daysLeft}d left
                          </span>
                        )}
                      </div>
                    )}

                    {/* ⭐ Rejected stamp */}
                    {isRejected && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-black/45" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative -rotate-[10deg]">
                            <div
                              className="flex items-center gap-2 px-4 py-2 rounded-xl"
                              style={{
                                background: "rgba(178,58,46,0.9)",
                                boxShadow: "0 0 0 2px rgba(255,255,255,0.85) inset, 0 8px 24px -8px rgba(178,58,46,0.8)",
                              }}
                            >
                              <FaBan className="text-white text-xs" />
                              <span className="font-ticket-display text-[12px] font-bold tracking-[0.2em] text-white">
                                REJECTED
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {v.featured && !boosted && !isRejected && (
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--ml-accent)",
                          color: "#FFFFFF",
                          boxShadow: "0 4px 14px -4px var(--ml-accent-glow)",
                        }}>
                        <FaBolt className="text-[8px]" />
                        <span className="font-ticket-body text-[8px] font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                    )}

                    {v.status === "sold" && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
                        <div
                          className="absolute inset-0 opacity-[0.14]"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, #FFFFFF 0 2px, transparent 2px 12px)",
                          }}
                        />
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-2xl opacity-50"
                          style={{ background: "var(--ml-accent)" }}
                        />
                        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-md" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative -rotate-[10deg] flex flex-col items-center">
                            <div className="absolute inset-0 translate-y-1 rounded-xl bg-black/40 blur-[6px]" />
                            <div
                              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl"
                              style={{
                                background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                                boxShadow: "0 12px 30px -8px var(--ml-accent-glow), 0 0 0 2px rgba(255,255,255,0.9) inset, 0 0 0 4px var(--ml-accent-soft) inset",
                              }}
                            >
                              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-black/20 ring-1 ring-black/30">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                  <polyline points="5 12 10 17 19 8" />
                                </svg>
                              </span>
                              <span className="font-ticket-display text-[10px] sm:text-[14px] font-bold tracking-[0.2em] leading-none"
                                style={{ color: "#FFFFFF" }}>
                                SOLD OUT
                              </span>
                              <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
                                <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[ml-sweep_2.8s_ease-in-out_infinite]" />
                              </span>
                            </div>
                            <div className="mt-1 h-1 w-3/4 rounded-full bg-black/40 blur-[3px]" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <span className="font-ticket-body text-[9px] font-bold uppercase tracking-[0.25em] text-white/85">
                            No longer available
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-ticket-body text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                            style={{ color: "var(--ml-accent)", borderColor: "var(--ml-accent)" }}>
                            {v.category}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold"
                              style={{ color: "var(--ml-accent)" }}>
                              <FaCheckCircle className="text-[8px]" /> Active
                            </span>
                          )}
                          {v.status === "pending" && (
                            <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold"
                              style={{ color: "#e66000" }}>
                              <FaClock className="text-[8px]" /> Pending review
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                color: "#B23A2E",
                                background: "var(--ml-danger-soft)",
                                border: "1px solid #B23A2E",
                              }}>
                              <FaBan className="text-[8px]" /> Rejected
                            </span>
                          )}
                          {v.status === "sold" && (
                            <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold px-2 py-0.5 rounded-full border"
                              style={{
                                color: "var(--ml-accent)",
                                background: "var(--ml-accent-soft)",
                                borderColor: "var(--ml-accent)",
                              }}>
                              <FaCheckCircle className="text-[8px]" /> Sold
                            </span>
                          )}
                          {v.verified && (
                            <span className="font-ticket-body text-[9px] font-bold" style={{ color: "var(--ml-accent)" }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <h3 className="font-ticket-display text-base sm:text-lg font-bold leading-tight line-clamp-2 sm:line-clamp-1"
                          style={{ color: "var(--ml-txt)" }}>
                          {v.title}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 font-ticket-body text-[10px] flex-wrap"
                          style={{ color: "var(--ml-txt-soft)" }}>
                          <span className="inline-flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[9px]" style={{ color: "var(--ml-accent)" }} />
                            <span className="truncate max-w-[120px] sm:max-w-none">
                              {v.area ? `${v.area}, ${v.city}` : v.city}
                            </span>
                          </span>
                          <span className="hidden sm:inline">·</span>
                          <span className="inline-flex items-center gap-1">
                            <FaClock className="text-[9px]" style={{ color: "var(--ml-accent)" }} />
                            {timeAgo(v.posted_at)}
                          </span>
                          <span className="hidden sm:inline">·</span>
                          <span className="inline-flex items-center gap-1">
                            <FaEye className="text-[9px]" style={{ color: "var(--ml-accent)" }} />
                            {v.views || 0} views
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0">
                        <p className="font-ticket-display text-base sm:text-lg font-bold tabular-nums whitespace-nowrap"
                          style={{ color: "var(--ml-accent)" }}>
                          {formatPrice(v.price)}
                        </p>

                        {/* ⭐ Open listing pill */}
                        <span className="ml-open-pill inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--ml-accent-soft)",
                            color: "var(--ml-accent)",
                            border: "1px solid var(--ml-accent)",
                          }}>
                          View listing
                          <FaChevronRight className="text-[8px]" />
                        </span>
                      </div>
                    </div>

                    {/* ⭐ Rejection reason panel */}
                    {isRejected && v.moderation_notes && (
                      <div className="mt-3 mb-2 rounded-xl px-3.5 py-3"
                        style={{
                          background: "var(--ml-danger-soft)",
                          border: "1px solid var(--ml-danger)",
                        }}>
                        <div className="flex items-start gap-2">
                          <FaExclamationTriangle className="text-[11px] mt-0.5 flex-shrink-0"
                            style={{ color: "var(--ml-danger)" }} />
                          <div className="min-w-0">
                            <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-1"
                              style={{ color: "var(--ml-danger)" }}>
                              Why it was rejected
                            </p>
                            <p className="font-ticket-body text-[12px] leading-relaxed"
                              style={{ color: "var(--ml-txt)" }}>
                              {v.moderation_notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons — stopPropagation so they don't trigger card click */}
                    <div
                      className="mt-auto pt-3 border-t flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap"
                      style={{ borderColor: "var(--ml-line)" }}
                      onClick={(e) => e.stopPropagation()}
                    >

                      {/* ⭐ BOOST BUTTON */}
                      {isActive && !boosted && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBoost(v); }}
                          className="group/boost relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl overflow-hidden font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95 boost-pulse"
                          style={{
                            background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                            color: "#FFFFFF",
                            boxShadow: "0 6px 18px -6px rgba(230,96,0,0.8)",
                          }}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/boost:translate-x-full transition-transform duration-700" />
                          <FaRocket className="text-[9px] sm:text-[10px] relative z-10" />
                          <span className="relative z-10">Boost</span>
                        </button>
                      )}

                      {boosted && isActive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl font-ticket-body text-[10px] sm:text-[11px] font-bold"
                          style={{
                            background: "var(--ml-accent-soft)",
                            color: "var(--ml-accent)",
                            border: "1px solid var(--ml-accent)",
                          }}>
                          <FaRocket className="text-[9px]" />
                          Boosted {daysLeft != null ? `· ${daysLeft}d` : ""}
                        </span>
                      )}

                      {/* ⭐ RESUBMIT button for rejected */}
                      {isRejected && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setResubmitId(v.id); }}
                          className="group/resubmit relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl overflow-hidden font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95"
                          style={{
                            background: "var(--ml-accent)",
                            color: "#FFFFFF",
                            boxShadow: "0 6px 18px -6px var(--ml-accent-glow)",
                          }}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/resubmit:translate-x-full transition-transform duration-700" />
                          <FaRedo className="text-[9px] sm:text-[10px] relative z-10" />
                          <span className="relative z-10">Resubmit</span>
                        </button>
                      )}

                      {v.status === "sold" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setRelistId(v.id); }}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border font-ticket-body text-[10px] sm:text-[11px] font-bold transition-colors"
                          style={{ borderColor: "var(--ml-accent)", color: "var(--ml-accent)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ml-accent-soft)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                        >
                          <FaUndo className="text-[9px] sm:text-[10px]" /> Re-list
                        </button>
                      ) : !isRejected ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setMarkSoldId(v.id); }}
                          className="group/sold relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl overflow-hidden font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95"
                          style={{
                            background: "var(--ml-accent)",
                            color: "#FFFFFF",
                            boxShadow: "0 6px 18px -6px var(--ml-accent-glow)",
                          }}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/sold:translate-x-full transition-transform duration-700" />
                          <FaTag className="text-[9px] sm:text-[10px] relative z-10" />
                          <span className="relative z-10">Mark Sold</span>
                        </button>
                      ) : null}

                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(v); }}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border font-ticket-body text-[10px] sm:text-[11px] font-bold transition-colors"
                        style={{ borderColor: "var(--ml-accent)", color: "var(--ml-accent)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ml-accent-soft)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                      >
                        <FaEdit className="text-[9px] sm:text-[10px]" /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(v.id); }}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border font-ticket-body text-[10px] sm:text-[11px] font-bold transition-colors"
                        style={{ borderColor: "var(--ml-danger)", color: "var(--ml-danger)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ml-danger-soft)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                      >
                        <FaTrash className="text-[9px] sm:text-[10px]" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingId && editForm && (
          <div
            className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center pt-10 px-3 pb-6 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={cancelEdit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="rounded-[22px] sm:rounded-[26px] border w-full max-w-4xl my-4 sm:my-8 overflow-hidden"
              style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-3"
                style={{ background: "var(--ml-accent-soft)", borderColor: "var(--ml-line)" }}>
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-xl border flex items-center justify-center"
                    style={{ borderColor: "var(--ml-accent)", background: "var(--ml-accent-soft)" }}>
                    <FaEdit className="text-sm sm:text-base" style={{ color: "var(--ml-accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--ml-accent)" }}>
                      Editing listing
                    </p>
                    <h3 className="font-ticket-display text-sm sm:text-base font-bold leading-tight truncate"
                      style={{ color: "var(--ml-txt)" }}>
                      {editForm.title || "Untitled listing"}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={cancelEdit}
                  className="flex-shrink-0 p-2 rounded-full transition-colors"
                  style={{ color: "var(--ml-txt-soft)" }}
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              <div className="p-4 sm:p-6 lg:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: "var(--ml-txt-soft)" }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="font-ticket-body w-full px-4 py-3 rounded-xl border bg-transparent text-sm outline-none"
                      style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                    />
                  </div>
                  <div>
                    <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: "var(--ml-txt-soft)" }}>
                      Price (Rs) *
                    </label>
                    <div className="relative">
                      <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--ml-accent)" }} />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="font-ticket-body w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm font-bold tabular-nums outline-none"
                        style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--ml-txt-soft)" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="font-ticket-body w-full px-4 py-3 rounded-xl border bg-transparent text-sm outline-none resize-none"
                    style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                  />
                </div>

                <div>
                  <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: "var(--ml-txt-soft)" }}>
                    Condition *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {conditions.map((c) => {
                      const isSelected = editForm.condition === c;
                      return (
                        <motion.button
                          key={c}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setEditForm({ ...editForm, condition: c })}
                          className="px-4 py-3 rounded-xl border font-ticket-body text-xs font-bold transition-colors"
                          style={
                            isSelected
                              ? {
                                  background: "var(--ml-accent)",
                                  color: "#FFFFFF",
                                  borderColor: "transparent",
                                  boxShadow: "0 6px 18px -6px var(--ml-accent-glow)",
                                }
                              : { borderColor: "var(--ml-line-str)", color: "var(--ml-txt)" }
                          }
                        >
                          {c}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {activeSpecGroups.length > 0 && (
                  <div className="space-y-5">
                    {activeSpecGroups.map((group) => {
                      const GroupIcon = group.icon;
                      const isMultiGroup = group.fields.some((f) => f.kind === "multi");
                      const isColorOnly = group.fields.length === 1 && group.fields[0].kind === "color";

                      return (
                        <div
                          key={group.title}
                          className="rounded-2xl border p-5 sm:p-6"
                          style={{ borderColor: "var(--ml-accent)", background: "var(--ml-accent-soft)" }}
                        >
                          <div className="flex items-center gap-3 mb-5 pb-4 border-b"
                            style={{ borderColor: "var(--ml-line)" }}>
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center border"
                              style={{ background: "var(--ml-accent-soft)", borderColor: "var(--ml-accent)" }}>
                              <GroupIcon className="text-sm" style={{ color: "var(--ml-accent)" }} />
                            </div>
                            <p className="font-ticket-display text-sm sm:text-base font-bold"
                              style={{ color: "var(--ml-txt)" }}>
                              {group.title}
                            </p>
                          </div>

                          <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                            isMultiGroup || isColorOnly ? "lg:grid-cols-1" : "lg:grid-cols-3"
                          } gap-5`}>
                            {group.fields.map((field) => {
                              const value = editForm.specs?.[field.key];

                              if (field.kind === "color") {
                                return (
                                  <div key={field.key} className={isColorOnly ? "" : "sm:col-span-2 lg:col-span-3"}>
                                    <ColorPicker
                                      label={field.label}
                                      icon={field.icon}
                                      value={value || ""}
                                      onChange={(v) => updateSpec(field.key, v)}
                                    />
                                  </div>
                                );
                              }

                              if (field.kind === "multi") {
                                return (
                                  <div key={field.key} className="sm:col-span-2 lg:col-span-1">
                                    <MultiSelect
                                      label={field.label}
                                      icon={field.icon}
                                      options={field.options}
                                      values={Array.isArray(value) ? value : []}
                                      onChange={(vals) => updateSpec(field.key, vals)}
                                    />
                                  </div>
                                );
                              }

                              if (field.kind === "suggest") {
                                const sugg = getFieldSuggestions(field);
                                return (
                                  <SuggestInput
                                    key={field.key}
                                    label={field.label}
                                    value={value || ""}
                                    onChange={(v) => {
                                      updateSpec(field.key, v);
                                      if (field.key === "make") {
                                        setEditForm((prev) => ({
                                          ...prev,
                                          specs: { ...prev.specs, model: "" },
                                        }));
                                      }
                                    }}
                                    placeholder={field.placeholder}
                                    icon={field.icon}
                                    suggestions={sugg}
                                    required={field.required}
                                    maxSuggestions={10}
                                  />
                                );
                              }

                              if (field.kind === "select") {
                                return (
                                  <div key={field.key}>
                                    <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                                      style={{ color: "var(--ml-txt-soft)" }}>
                                      {field.label}
                                      {field.required && <span className="text-[#B23A2E] ml-1">*</span>}
                                    </label>
                                    <div className="relative">
                                      <select
                                        value={value || ""}
                                        onChange={(e) => updateSpec(field.key, e.target.value)}
                                        className="font-ticket-body appearance-none w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold outline-none cursor-pointer"
                                        style={{
                                          color: "var(--ml-txt)",
                                          background: "var(--ml-bg-1)",
                                          borderColor: "var(--ml-line-str)",
                                        }}
                                      >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map((opt) => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                      <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                                        style={{ color: "var(--ml-accent)" }} />
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={field.key}>
                                  <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                                    style={{ color: "var(--ml-txt-soft)" }}>
                                    {field.label}
                                    {field.required && <span className="text-[#B23A2E] ml-1">*</span>}
                                  </label>
                                  <div className="relative">
                                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                      style={{ color: "var(--ml-accent)" }} />
                                    <input
                                      type={field.kind === "number" ? "number" : "text"}
                                      placeholder={field.placeholder}
                                      value={value || ""}
                                      onChange={(e) => updateSpec(field.key, e.target.value)}
                                      className="font-ticket-body w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                                      style={{
                                        color: "var(--ml-txt)",
                                        background: "var(--ml-bg-1)",
                                        borderColor: "var(--ml-line-str)",
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <SuggestInput
                    label="City"
                    value={editForm.city}
                    onChange={(v) => setEditForm({ ...editForm, city: v })}
                    placeholder="e.g., Lahore"
                    icon={FaCity}
                    suggestions={CITIES}
                    maxSuggestions={8}
                  />
                  <SuggestInput
                    label="Area / Locality"
                    value={editForm.area}
                    onChange={(v) => setEditForm({ ...editForm, area: v })}
                    placeholder="e.g., DHA Phase 5"
                    icon={FaMapMarkerAlt}
                    suggestions={areaSuggestions}
                    maxSuggestions={8}
                  />
                  <div>
                    <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: "var(--ml-txt-soft)" }}>
                      Contact Number
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--ml-accent)" }} />
                      <input
                        type="tel"
                        value={editForm.contact_number}
                        onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                        className="font-ticket-body w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent text-sm font-mono tracking-wider outline-none"
                        style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3 block"
                    style={{ color: "var(--ml-txt-soft)" }}>
                    Photos ({editImages.length}/5)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageAdd}
                    className="hidden"
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {editImages.map((img) => (
                      <div
                        key={img.id}
                        className="group/img relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border bg-black"
                        style={{ borderColor: "var(--ml-line)" }}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeEditImage(img.id)}
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full text-white flex items-center justify-center sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                          style={{ background: "var(--ml-danger)" }}
                        >
                          <FaTrash className="text-[10px] sm:text-xs" />
                        </button>
                      </div>
                    ))}
                    {editImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl sm:rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-colors"
                        style={{ borderColor: "var(--ml-line-str)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ml-accent)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ml-line-str)"; }}
                      >
                        <FaPlus className="text-base sm:text-lg" style={{ color: "var(--ml-accent)" }} />
                        <span className="font-ticket-body text-[9px] sm:text-[10px] font-bold"
                          style={{ color: "var(--ml-txt-soft)" }}>
                          Add
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3"
                style={{ borderColor: "var(--ml-line)", background: "var(--ml-panel-2)" }}>
                <button
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border font-ticket-body text-xs font-bold disabled:opacity-50"
                  style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={isSaving}
                  className="group/save relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl overflow-hidden font-ticket-body font-bold text-xs transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: "var(--ml-accent)",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px -8px var(--ml-accent-glow)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-700" />
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin text-xs relative z-10" />
                      <span className="relative z-10">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-xs relative z-10" />
                      <span className="relative z-10">Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MARK AS SOLD CONFIRMATION */}
      <AnimatePresence>
        {markSoldId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[22px] sm:rounded-[26px] border max-w-md w-full p-5 sm:p-6 lg:p-8"
              style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 border"
                style={{ background: "var(--ml-accent-soft)", borderColor: "var(--ml-accent)" }}>
                <FaTag className="text-xl sm:text-2xl" style={{ color: "var(--ml-accent)" }} />
              </div>
              <h3 className="font-ticket-display text-lg sm:text-xl font-bold text-center mb-2"
                style={{ color: "var(--ml-txt)" }}>
                Mark this as sold?
              </h3>
              <p className="font-ticket-body text-xs sm:text-sm text-center mb-5 sm:mb-6"
                style={{ color: "var(--ml-txt-soft)" }}>
                Your listing will be hidden from the marketplace. You can re-list it anytime from the Sold tab.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setMarkSoldId(null)}
                  disabled={isMarking}
                  className="flex-1 py-3 rounded-xl border font-ticket-body font-bold text-xs transition-colors disabled:opacity-50"
                  style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkSold}
                  disabled={isMarking}
                  className="group/sold relative flex-1 py-3 rounded-xl overflow-hidden font-ticket-body font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "var(--ml-accent)",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px -8px var(--ml-accent-glow)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/sold:translate-x-full transition-transform duration-700" />
                  {isMarking ? (
                    <>
                      <FaSpinner className="animate-spin text-xs relative z-10" />
                      <span className="relative z-10">Marking...</span>
                    </>
                  ) : (
                    <>
                      <FaTag className="text-xs relative z-10" />
                      <span className="relative z-10">Mark Sold</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RE-LIST CONFIRMATION */}
      <AnimatePresence>
        {relistId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[22px] sm:rounded-[26px] border max-w-md w-full p-5 sm:p-6 lg:p-8"
              style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 border"
                style={{ background: "var(--ml-accent-soft)", borderColor: "var(--ml-accent)" }}>
                <FaUndo className="text-xl sm:text-2xl" style={{ color: "var(--ml-accent)" }} />
              </div>
              <h3 className="font-ticket-display text-lg sm:text-xl font-bold text-center mb-2"
                style={{ color: "var(--ml-txt)" }}>
                Put this listing back online?
              </h3>
              <p className="font-ticket-body text-xs sm:text-sm text-center mb-5 sm:mb-6"
                style={{ color: "var(--ml-txt-soft)" }}>
                It will go through review again and appear on the marketplace once approved.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setRelistId(null)}
                  disabled={isRelisting}
                  className="flex-1 py-3 rounded-xl border font-ticket-body font-bold text-xs transition-colors disabled:opacity-50"
                  style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRelist}
                  disabled={isRelisting}
                  className="group/rel relative flex-1 py-3 rounded-xl overflow-hidden font-ticket-body font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "var(--ml-accent)",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px -8px var(--ml-accent-glow)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/rel:translate-x-full transition-transform duration-700" />
                  {isRelisting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs relative z-10" />
                      <span className="relative z-10">Re-listing...</span>
                    </>
                  ) : (
                    <>
                      <FaUndo className="text-xs relative z-10" />
                      <span className="relative z-10">Re-list</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⭐ RESUBMIT CONFIRMATION (after rejection) */}
      <AnimatePresence>
        {resubmitId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[22px] sm:rounded-[26px] border max-w-md w-full p-5 sm:p-6 lg:p-8"
              style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 border"
                style={{ background: "var(--ml-accent-soft)", borderColor: "var(--ml-accent)" }}>
                <FaRedo className="text-xl sm:text-2xl" style={{ color: "var(--ml-accent)" }} />
              </div>
              <h3 className="font-ticket-display text-lg sm:text-xl font-bold text-center mb-2"
                style={{ color: "var(--ml-txt)" }}>
                Resubmit for review?
              </h3>
              <p className="font-ticket-body text-xs sm:text-sm text-center mb-5 sm:mb-6"
                style={{ color: "var(--ml-txt-soft)" }}>
                Make sure you've fixed the issue mentioned in the rejection reason. Your ad will go back to review.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setResubmitId(null)}
                  disabled={isResubmitting}
                  className="flex-1 py-3 rounded-xl border font-ticket-body font-bold text-xs transition-colors disabled:opacity-50"
                  style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResubmit}
                  disabled={isResubmitting}
                  className="group/resubmit2 relative flex-1 py-3 rounded-xl overflow-hidden font-ticket-body font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "var(--ml-accent)",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px -8px var(--ml-accent-glow)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/resubmit2:translate-x-full transition-transform duration-700" />
                  {isResubmitting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs relative z-10" />
                      <span className="relative z-10">Resubmitting...</span>
                    </>
                  ) : (
                    <>
                      <FaRedo className="text-xs relative z-10" />
                      <span className="relative z-10">Resubmit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[22px] sm:rounded-[26px] border max-w-md w-full p-5 sm:p-6 lg:p-8"
              style={{ background: "var(--ml-bg-1)", borderColor: "var(--ml-line)" }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border flex items-center justify-center mb-4 sm:mb-5"
                style={{ borderColor: "var(--ml-danger)", background: "var(--ml-danger-soft)" }}>
                <FaExclamationTriangle className="text-xl sm:text-2xl" style={{ color: "var(--ml-danger)" }} />
              </div>
              <h3 className="font-ticket-display text-lg sm:text-xl font-bold text-center mb-2"
                style={{ color: "var(--ml-txt)" }}>
                Delete this listing?
              </h3>
              <p className="font-ticket-body text-xs sm:text-sm text-center mb-5 sm:mb-6"
                style={{ color: "var(--ml-txt-soft)" }}>
                This action cannot be undone. Your ad and images will be permanently removed.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl border font-ticket-body font-bold text-xs transition-colors disabled:opacity-50"
                  style={{ color: "var(--ml-txt)", borderColor: "var(--ml-line-str)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl text-white font-ticket-body font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "var(--ml-danger)" }}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="text-xs" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyListings;