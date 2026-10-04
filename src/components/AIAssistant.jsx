// AIAssistant.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { generateWithChat } from "../lib/pollinations";

/* ═══════════════════════════════════════════════════════════════
   AI ASSISTANT — Modern, glassmorphic, theme-aware
   - 100% FREE for everyone — NO sign-in / login required
   - Launcher uses message icon (gradient bg)
   - Header uses logo (transparent)
   - AI replies show with a smooth fade-in (no typewriter)
   - System prompt teaches the AI ONLY about this project
   - Auto-links to category pages when user asks about
     vehicles / mobiles / property / toys / electronics
   - Simple text links (no emoji, no buttons)
   Logo: /logo.png
   ═══════════════════════════════════════════════════════════════ */

const LOGO_SRC = "/logo.png";

/* 💬 message icon used in chat bubbles + launcher */
const MessageIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

/* ── small hook: detects mobile viewport (<768px) ── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

const SUGGESTIONS = [
  "What can I sell here?",
  "How do I boost my ad?",
  "What are the plans?",
  "Show me vehicles",
];

/* ═══════════════════════════════════════════════════════════════
   ⭐ CATEGORY ICONS — small SVGs used in links
   ═══════════════════════════════════════════════════════════════ */
const CarIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17h14M5 17a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 17v-3l2-5h10l2 5v3" />
    <circle cx="7.5" cy="17" r="1.5" />
    <circle cx="16.5" cy="17" r="1.5" />
  </svg>
);

const PhoneIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const HomeIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ToyIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const LaptopIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const ArrowRightIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

/* Map category id → icon component */
const CATEGORY_ICONS = {
  vehicles: CarIcon,
  mobiles: PhoneIcon,
  property: HomeIcon,
  toys: ToyIcon,
  electronics: LaptopIcon,
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ CATEGORY LINK RULES
   When the user's message mentions a category keyword, we attach
   a "Visit" link to the AI reply that navigates to that category.
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_LINKS = [
  {
    id: "vehicles",
    path: "/vehicles",
    label: "Visit Vehicles",
    keywords: [
      "vehicle", "vehicles", "car", "cars", "bike", "bikes",
      "motorcycle", "motorcycles", "truck", "trucks", "auto",
      "suzuki", "toyota", "honda civic", "corolla", "cultus",
      "civic", "fortuner", "sportage",
    ],
  },
  {
    id: "mobiles",
    path: "/mobiles",
    label: "Visit Mobiles",
    keywords: [
      "mobile", "mobiles", "phone", "phones", "iphone", "samsung",
      "xiaomi", "oppo", "vivo", "tablet", "tablets", "smartphone",
      "android", "pixel", "oneplus", "realme",
    ],
  },
  {
    id: "property",
    path: "/property",
    label: "Visit Property",
    keywords: [
      "property", "properties", "house", "houses", "home", "homes",
      "plot", "plots", "flat", "flats", "apartment", "apartments",
      "land", "marla", "kanal", "commercial", "shop", "office",
    ],
  },
  {
    id: "toys",
    path: "/toys",
    label: "Visit Toys",
    keywords: [
      "toy", "toys", "lego", "doll", "dolls", "puzzle", "game",
      "games", "kids", "children", "baby", "playstation", "xbox",
      "nintendo", "controller",
    ],
  },
  {
    id: "electronics",
    path: "/electronics",
    label: "Visit Electronics",
    keywords: [
      "electronic", "electronics", "laptop", "laptops", "tv", "television",
      "camera", "cameras", "audio", "speaker", "speakers", "headphone",
      "headphones", "monitor", "printer", "router", "macbook", "dell",
      "hp", "lenovo", "asus", "acer", "console",
    ],
  },
];

/* ⭐ Detect categories mentioned in the user's message */
const detectCategories = (text) => {
  if (!text) return [];
  const lower = String(text).toLowerCase();
  const found = [];
  for (const cat of CATEGORY_LINKS) {
    for (const kw of cat.keywords) {
      // Word-boundary-ish match
      const rx = new RegExp(`(^|[^a-z])${kw}([^a-z]|$)`, "i");
      if (rx.test(lower)) {
        if (!found.includes(cat.id)) found.push(cat.id);
        break;
      }
    }
  }
  return found;
};

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT — trains the AI on THIS project only
   ═══════════════════════════════════════════════════════════════ */
const SYSTEM_PROMPT = `
You are the friendly in-app helper for our Pakistani marketplace app "ApexDeal".
Your job is ONLY to help users understand and use OUR app. Never invent features we don't have.

═══════════════════════════════════════════
WHAT OUR APP IS
═══════════════════════════════════════════
ApexDeal is Pakistan's number-one local marketplace platform — homegrown, made in Pakistan,
built to help people buy and sell items locally across every city in Pakistan.
Owner & founder: Hasnain Khan.
Support (WhatsApp & calls): 03140972575.

Main sections:
1) Marketplace — post and buy items (free plan: 1 active listing).
2) AI Studio — generate images, remove backgrounds, AI chat.
3) Momento (Social Feed) — post, like, comment, share your products.
4) Chat — real-time buyer/seller chat, incoming requests, connect instantly.
5) Dashboard — analytics, item reviews, credits.

Every seller on ApexDeal is a VERIFIED SELLER — we manually verify identity so buyers can trust every listing.

═══════════════════════════════════════════
HOW POSTING AN ITEM WORKS (4 STEPS)
═══════════════════════════════════════════
Step 1 — Clear Photo: snap your item from any angle; our AI cleans the background automatically.
Step 2 — Name & Model: e.g. "Honda CD 70", "iPhone 13 Pro"; AI writes the full title & description for you.
Step 3 — Condition: New, like-new, used, or needs repair; we use this to suggest a fair market price.
Step 4 — Your Location: so we target local buyers in your city — real buyers near you, not random people.

After posting: the ad goes into PENDING. Our AI checks it. Once approved, it goes live.
Free users can post only 1 active listing at a time.

═══════════════════════════════════════════
WHAT YOU CAN SELL
═══════════════════════════════════════════
Vehicles, bikes, laptops, phones, property, electronics, toys, and more.
Payments are handled safely with Escrow Checkout — money is held until both sides confirm.

═══════════════════════════════════════════
PLANS (pricing in PKR)
═══════════════════════════════════════════
🟢 STARTER — Free
   • 1 Active Listing (post one item at a time)
   • 3 AI Images / month (try NanoBanana image generation)
   • Live Seller Chat (message buyers & sellers in real time)
   • Social Feed (post, like, comment, share)
   • Escrow Checkout (safe payments until both sides confirm)
   • Buy any item without limits

⭐ SELLER — Rs 500 / month  (Most Popular)
   • 30 Active Listings (6× more than free)
   • 30 AI Images / month
   • 1 Featured Boost / month (top of category for 7 days)
   • Verified Seller Badge
   • Background Remover (one-click cut-outs)
   • Priority in Search

👑 PRO SELLER — Rs 1,500 / month
   • Unlimited Listings (whole inventory)
   • 200 AI Images / month (full AI Studio access)
   • 4 Featured Boosts / month
   • Listing Analytics (views, clicks, chats, conversions)
   • Priority Support (chat with a human within minutes)
   • Gold Business Badge

═══════════════════════════════════════════
AI STUDIO CREDITS & RECHARGE
═══════════════════════════════════════════
AI Studio uses credits. When a user runs out, they click the CREDITS icon to open credit packages.
Choose a package → pay → SEND PAYMENT DETAILS (name, number, screenshot, etc.) →
we review within 2 HOURS → after verification the credits are added.

═══════════════════════════════════════════
DASHBOARD
═══════════════════════════════════════════
Shows: your analytics (views, clicks, chats), item reviews, and your AI Studio credit balance.

═══════════════════════════════════════════
SUPPORT & CONTACT
═══════════════════════════════════════════
- Owner: Hasnain Khan
- WhatsApp & Calls: 03140972575
- For any issue (payment, verification, listing approval, credits), tell the user to message us on WhatsApp at 03140972575 — we reply fast.

═══════════════════════════════════════════
HOW TO ANSWER
═══════════════════════════════════════════
- Be warm, short, and simple. Customers are not technical.
- Use plain words. Avoid jargon. You may reply in English or Roman Urdu — match the user's language.
- Prefer step-by-step answers when explaining "how to do X".
- If a question is NOT about our app (e.g. general trivia, coding, math, weather),
  politely say you only help with ApexDeal and offer the closest useful topic.
- If you don't know a detail, say: "Please message us on WhatsApp at 03140972575 — we'll help you right away."
- Never invent features, prices, or timelines we haven't listed above.
- Never say ApexDeal is an Indian app — we are proudly Pakistani, based in Pakistan, made for Pakistan.
- Keep answers under ~90 words unless the user asks for a full breakdown.
- You can use short emojis occasionally (✨ ✅ 💬 🇵🇰) but don't overdo it.
`.trim();

/* ═══════════════════════════════════════════════════════════════
   ⭐ CATEGORY LINK — simple underlined text link (no button, no emoji)
   ═══════════════════════════════════════════════════════════════ */
const CategoryLinkChip = ({ category, onNavigate }) => {
  const Icon = CATEGORY_ICONS[category.id] || CarIcon;
  const label = category.label.replace("Visit ", "");

  return (
    <a
      href={category.path}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(category.path);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        padding: "2px 0",
        color: "var(--nav-primary, #eb7d34)",
        fontSize: 13.5,
        fontWeight: 600,
        fontFamily: "inherit",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        textDecorationThickness: "1.5px",
        cursor: "pointer",
        background: "transparent",
        border: "none",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <Icon size={13} />
      <span>Visit {label}</span>
      <ArrowRightIcon size={11} />
    </a>
  );
};

const AIAssistant = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi 👋 I'm your ApexDeal assistant — completely free, no login needed. Ask me anything about posting items, AI Studio, plans, credits, or our social feed!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringLauncher, setIsHoveringLauncher] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── navigation helper (works with or without react-router) ── */
  const navigate = useCallback((path) => {
    try {
      // If we're inside a Router, use history API (react-router listens to popstate)
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
      // Also close the assistant panel
      setIsOpen(false);
    } catch {
      window.location.href = path;
    }
  }, []);

  /* ── smooth scroll helper ────────────────────────────────── */
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => textareaRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* ── send message ── (no auth check, fully free) ──────────── */
  const handleSend = useCallback(
    async (customText) => {
      const text = (customText ?? input).trim();
      if (!text || isLoading) return;

      const userMsg = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      await new Promise((r) => setTimeout(r, 200));

      try {
        const reply = await generateWithChat({
          message: text,
          system: SYSTEM_PROMPT, // 👈 our trained prompt
        });

        // ⭐ Detect categories in the user's question
        const matchedCats = detectCategories(text);
        const categoryChips = matchedCats
          .map((id) => CATEGORY_LINKS.find((c) => c.id === id))
          .filter(Boolean);

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            categories: categoryChips, // ⭐ attach for rendering
          },
        ]);
      } catch (err) {
        console.error("AI error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, I couldn't reach the server just now 😅 — please try again in a moment.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes ai-pop-in {
          0%   { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes ai-pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.7; }
          70%  { transform: scale(1.4); opacity: 0;   }
          100% { transform: scale(1.4); opacity: 0;   }
        }
        @keyframes ai-dot {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0);   }
          40%           { opacity: 1;   transform: translateY(-4px);}
        }
        @keyframes ai-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .ai-scroll::-webkit-scrollbar       { width: 6px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-scroll::-webkit-scrollbar-thumb {
          background: var(--nav-line-str, rgba(255,255,255,0.15));
          border-radius: 99px;
        }
        .ai-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--nav-primary, #eb7d34);
        }

        /* ⭐ Raise the launcher on mobile so it clears the bottom nav */
        @media (max-width: 767px) {
          .ai-assistant-wrapper { bottom: 92px !important; right: 16px !important; }
        }
      `}</style>

      <div
        className="ai-assistant-wrapper"
        style={{
          ...styles.wrapper,
          bottom: isMobile ? 92 : 24,
          right: isMobile ? 16 : 24,
        }}
      >
        {/* ══════════ LAUNCHER ══════════ */}
        <button
          style={{
            ...styles.launcher,
            ...(isHoveringLauncher ? styles.launcherHover : {}),
          }}
          onClick={() => setIsOpen((o) => !o)}
          onMouseEnter={() => setIsHoveringLauncher(true)}
          onMouseLeave={() => setIsHoveringLauncher(false)}
          aria-label="Toggle AI assistant"
        >
          {!isOpen && <span style={styles.pulseRing} aria-hidden />}

          <span
            style={{
              ...styles.launcherIcon,
              transform: isOpen
                ? "rotate(90deg) scale(0.6)"
                : "rotate(0deg) scale(1)",
              opacity: isOpen ? 0 : 1,
            }}
          >
            <MessageIcon size={26} />
          </span>

          <span
            style={{
              ...styles.launcherIcon,
              position: "absolute",
              transform: isOpen
                ? "rotate(0deg) scale(1)"
                : "rotate(-90deg) scale(0.6)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            ✕
          </span>
        </button>

        {/* ══════════ CHAT PANEL ══════════ */}
        {isOpen && (
          <div style={styles.panel}>
            {/* ── header ── */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.avatar}>
                  <img src={LOGO_SRC} alt="AI" style={styles.avatarLogo} />
                  <span style={styles.avatarOnline} />
                </div>
                <div>
                  <div style={styles.headerTitle}>AI Assistant</div>
                  <div style={styles.headerSubtitle}>
                    <span style={styles.dotLive} />
                    Free · No login needed
                  </div>
                </div>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--nav-surface-2, rgba(255,255,255,0.06))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ── messages ── */}
            <div className="ai-scroll" style={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.row,
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    animation: "ai-slide-up 0.35s ease both",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={styles.messageBadge}>
                      <MessageIcon size={16} />
                    </div>
                  )}

                  <div style={styles.bubbleWrap}>
                    <div
                      style={{
                        ...styles.bubble,
                        ...(msg.role === "user"
                          ? styles.userBubble
                          : styles.assistantBubble),
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* ⭐ Category links — appear under the AI reply */}
                    {msg.role === "assistant" &&
                      Array.isArray(msg.categories) &&
                      msg.categories.length > 0 && (
                        <div style={styles.categoryRow}>
                          {msg.categories.map((cat) => (
                            <CategoryLinkChip
                              key={cat.id}
                              category={cat}
                              onNavigate={navigate}
                            />
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ ...styles.row, justifyContent: "flex-start" }}>
                  <div style={styles.messageBadge}>
                    <MessageIcon size={16} />
                  </div>
                  <div
                    style={{
                      ...styles.bubble,
                      ...styles.assistantBubble,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "14px 18px",
                    }}
                  >
                    <span style={{ ...styles.dot, animationDelay: "0s" }} />
                    <span style={{ ...styles.dot, animationDelay: "0.15s" }} />
                    <span style={{ ...styles.dot, animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── suggestions (send straight to the AI, no auth) ── */}
            {messages.length <= 1 && !isLoading && (
              <div style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    style={styles.chip}
                    onClick={() => handleSend(s)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--nav-primary, #eb7d34)";
                      e.currentTarget.style.color =
                        "var(--nav-primary, #eb7d34)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--nav-line, rgba(255,255,255,0.1))";
                      e.currentTarget.style.color =
                        "var(--nav-txt-soft, rgba(255,255,255,0.65))";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── input ── */}
            <div style={styles.inputArea}>
              <div style={styles.inputWrap}>
                <textarea
                  ref={textareaRef}
                  style={styles.textarea}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the app… (free, no login)"
                  rows={1}
                />
                <button
                  style={{
                    ...styles.sendBtn,
                    opacity: isLoading || !input.trim() ? 0.4 : 1,
                    cursor:
                      isLoading || !input.trim() ? "not-allowed" : "pointer",
                    transform:
                      !isLoading && input.trim() ? "scale(1)" : "scale(0.95)",
                  }}
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div style={styles.footerNote}>
                Powered by AI · Press <kbd style={styles.kbd}>Enter</kbd> to send
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const styles = {
  wrapper: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 99999,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  launcher: {
    position: "relative",
    width: 62,
    height: 62,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, var(--nav-primary, #eb7d34) 0%, var(--nav-primary-2, #f59e0b) 100%)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow:
      "0 12px 32px -8px var(--nav-primary-glow, rgba(235,125,52,0.55)), 0 6px 20px -6px rgba(0,0,0,0.35)",
  },
  launcherHover: {
    transform: "scale(1.08) rotate(-4deg)",
    boxShadow:
      "0 16px 40px -8px var(--nav-primary-glow, rgba(235,125,52,0.75)), 0 8px 24px -6px rgba(0,0,0,0.4)",
  },
  launcherIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 24,
  },
  pulseRing: {
    position: "absolute",
    inset: 4,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.7)",
    animation: "ai-pulse-ring 2s ease-out infinite",
    pointerEvents: "none",
  },
  panel: {
    position: "absolute",
    bottom: 82,
    right: 0,
    width: 400,
    maxWidth: "calc(100vw - 24px)",
    height: "min(500px, calc(100vh - 140px))",
    maxHeight: "calc(100vh - 140px)",
    background: "var(--nav-panel, #16161F)",
    color: "var(--nav-txt, #FFFFFF)",
    borderRadius: 24,
    border: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
    boxShadow:
      "0 32px 64px -16px rgba(0,0,0,0.5), 0 12px 32px -8px rgba(0,0,0,0.35), inset 0 1px 0 0 rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    animation: "ai-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    transformOrigin: "bottom right",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    background:
      "linear-gradient(180deg, var(--nav-panel-2, #1C1C28) 0%, var(--nav-panel, #16161F) 100%)",
    borderBottom: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#e67f00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 4px 12px -4px rgba(230,127,0,0.6)",
  },
  avatarLogo: {
    width: 30,
    height: 30,
    objectFit: "contain",
    display: "block",
    pointerEvents: "none",
    filter: "brightness(0) invert(1)",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "var(--nav-txt, #FFFFFF)",
  },
  headerSubtitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--nav-txt-faint, rgba(255,255,255,0.45))",
    marginTop: 2,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "transparent",
    border: "none",
    color: "var(--nav-txt-soft, rgba(255,255,255,0.65))",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, color 0.2s",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    scrollbarWidth: "thin",
  },
  row: { display: "flex", alignItems: "flex-end", gap: 8 },
  /* ⭐ Bubble wrapper holds the bubble + category links */
  bubbleWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: "78%",
    minWidth: 0,
  },
  messageBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "var(--nav-primary-soft, rgba(235,125,52,0.14))",
    border: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
    color: "var(--nav-primary, #eb7d34)",
  },
  bubble: {
    maxWidth: "100%",
    padding: "11px 15px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    letterSpacing: "-0.005em",
  },
  userBubble: {
    background:
      "linear-gradient(135deg, var(--nav-primary, #eb7d34) 0%, var(--nav-primary-2, #f59e0b) 100%)",
    color: "#fff",
    borderBottomRightRadius: 6,
    boxShadow:
      "0 6px 18px -6px var(--nav-primary-glow, rgba(235,125,52,0.6))",
  },
  assistantBubble: {
    background: "var(--nav-surface, rgba(255,255,255,0.045))",
    color: "var(--nav-txt, #FFFFFF)",
    border: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
    borderBottomLeftRadius: 6,
  },
  /* ⭐ Column of category links under an AI reply */
  categoryRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: 2,
    paddingLeft: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--nav-primary, #eb7d34)",
    animation: "ai-dot 1.2s infinite ease-in-out",
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "0 18px 14px",
  },
  chip: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "var(--nav-surface, rgba(255,255,255,0.045))",
    border: "1px solid var(--nav-line, rgba(255,255,255,0.1))",
    color: "var(--nav-txt-soft, rgba(255,255,255,0.65))",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  inputArea: {
    padding: "12px 14px 14px",
    borderTop: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
    background:
      "linear-gradient(0deg, var(--nav-panel-2, #1C1C28) 0%, var(--nav-panel, #16161F) 100%)",
  },
  inputWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    padding: 4,
    borderRadius: 16,
    background: "var(--nav-surface, rgba(255,255,255,0.045))",
    border: "1px solid var(--nav-line, rgba(255,255,255,0.08))",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "none",
    background: "transparent",
    color: "var(--nav-txt, #FFFFFF)",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    maxHeight: 120,
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "none",
    background:
      "linear-gradient(135deg, var(--nav-primary, #eb7d34) 0%, var(--nav-primary-2, #f59e0b) 100%)",
    color: "#fff",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow:
      "0 6px 16px -4px var(--nav-primary-glow, rgba(235,125,52,0.5))",
    marginBottom: 2,
  },
  footerNote: {
    marginTop: 10,
    fontSize: 11,
    textAlign: "center",
    color: "var(--nav-txt-faint, rgba(255,255,255,0.4))",
    letterSpacing: "0.01em",
  },
  kbd: {
    padding: "1px 5px",
    borderRadius: 4,
    background: "var(--nav-surface-2, rgba(255,255,255,0.06))",
    border: "1px solid var(--nav-line, rgba(255,255,255,0.1))",
    fontSize: 10,
    fontFamily: "monospace",
    color: "var(--nav-txt-soft, rgba(255,255,255,0.65))",
  },
};

export default AIAssistant;