// components/ShopByCategory.jsx
// ─────────────────────────────────────────────────────────────────
// Full-width image slider with dots — modern marketplace hero banners.
// Fully responsive, self-contained, auto-rotates, clickable dots.
// Mobile: shows the full banner (contain, auto height) — no crop.
// ─────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   DEFAULT SLIDES — replace `image` with your own banner URLs
   ═══════════════════════════════════════════════════════════════ */
export const SHOP_SLIDES = [
  {
    id: "flash-sale",
    image: "/banner/banner1.png",   // 👈 your file in public/banner/
    alt: "Flash Sale — Limited time & stock",
    link: "/sale",
    title: "Flash Sale",
  },
  {
    id: "fashion",
    image: "/banner/banner2.png",
    alt: "Fashion sale",
    link: "/category/fashion",
    title: "Fashion",
  },
  {
    id: "electronics",
    image: "/banner/banner3.png",
    alt: "Electronics",
    link: "/category/electronics",
    title: "Electronics",
  },
  {
    id: "payday",
    image: "/banner/banner4.png",
    alt: "Payday sale",
    link: "/sale",
    title: "Payday Sale",
  },
  {
    id: "payday2",
    image: "/banner/banner5.png",
    alt: "Payday sale",
    link: "/sale",
    title: "Payday Sale",
  },
];

/* ═══════════════════════════════════════════════════════════════
   INLINE CSS
   ═══════════════════════════════════════════════════════════════ */
const STYLES = `
.ssc-wrap {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--fd-surface, #FFFFFF);
  box-shadow: 0 1px 3px -1px rgba(20,20,40,0.06), 0 4px 16px -8px rgba(20,20,40,0.08);
}
@media (max-width: 767px) {
  .ssc-wrap { border-radius: 12px; }
}

.ssc-track {
  display: flex;
  width: 100%;
  transition: transform 0.55s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}
@media (max-width: 767px) {
  .ssc-track { align-items: flex-start; }
}

.ssc-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  /* responsive aspect ratio — desktop / tablet / mobile */
  aspect-ratio: 16 / 5;
  background: var(--fd-surface-2, #F5F5F7);
  overflow: hidden;
  cursor: pointer;
  border: none;
  padding: 0;
  display: block;
  text-align: left;
}
@media (max-width: 1279px) {
  .ssc-slide { aspect-ratio: 16 / 6; }
}
@media (max-width: 1023px) {
  .ssc-slide { aspect-ratio: 16 / 7; }
}
/* ⭐ MOBILE: let the image decide the height — full banner visible */
@media (max-width: 767px) {
  .ssc-slide {
    aspect-ratio: auto;
    height: auto;
    background: transparent;
  }
}

.ssc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
/* ⭐ MOBILE: show the full image, no crop */
@media (max-width: 767px) {
  .ssc-img {
    height: auto !important;
    object-fit: contain !important;
    object-position: center !important;
  }
}

/* Dots */
.ssc-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 5;
  pointer-events: none;
}
@media (max-width: 767px) {
  .ssc-dots { bottom: 8px; gap: 6px; }
}

.ssc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  border: none;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.25s ease, width 0.3s ease, transform 0.2s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}
.ssc-dot:hover { background: rgba(255,255,255,0.85); transform: scale(1.15); }

.ssc-dot--active {
  width: 22px;
  border-radius: 999px;
  background: #FFFFFF;
  box-shadow: 0 1px 6px rgba(0,0,0,0.35);
}
@media (max-width: 767px) {
  .ssc-dot { width: 6px; height: 6px; }
  .ssc-dot--active { width: 18px; }
}

/* Side arrows (desktop only, appear on hover) */
.ssc-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 14px -4px rgba(0,0,0,0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #111111;
  font-size: 13px;
  z-index: 6;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.ssc-wrap:hover .ssc-arrow {
  opacity: 1;
  pointer-events: auto;
}
.ssc-arrow:hover { transform: translateY(-50%) scale(1.08); }
.ssc-arrow--prev { left: 12px; }
.ssc-arrow--next { right: 12px; }

@media (max-width: 767px) {
  .ssc-arrow { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ShopByCategory = ({
  slides = SHOP_SLIDES,
  autoPlay = true,
  interval = 5000,
  onSlideClick,
}) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const total = slides.length;

  /* Auto-rotate */
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, total]);

  const goTo = (i) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  /* Swipe gestures */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next(); else prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleClick = (slide) => {
    onSlideClick?.(slide);
  };

  if (!total) return null;

  return (
    <>
      <style>{STYLES}</style>
      <section className="mb-5 sm:mb-6">
        <div
          className="ssc-wrap"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="carousel"
        >
          {/* Track */}
          <div
            className="ssc-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, i) => (
              <button
                key={s.id ?? i}
                type="button"
                className="ssc-slide"
                onClick={() => handleClick(s)}
                aria-label={s.title || s.alt || `Slide ${i + 1}`}
                aria-hidden={i !== index}
                tabIndex={i === index ? 0 : -1}
              >
                <img
                  src={s.image}
                  alt={s.alt || s.title || `Slide ${i + 1}`}
                  className="ssc-img"
                  loading={i === 0 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  draggable="false"
                />
              </button>
            ))}
          </div>

          {/* Dots */}
          {total > 1 && (
            <div className="ssc-dots" role="tablist" aria-label="Slides">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`ssc-dot ${i === index ? "ssc-dot--active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}

          {/* Side arrows (desktop only) */}
          {total > 1 && (
            <>
              <button
                type="button"
                className="ssc-arrow ssc-arrow--prev"
                onClick={prev}
                aria-label="Previous slide"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="ssc-arrow ssc-arrow--next"
                onClick={next}
                aria-label="Next slide"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ShopByCategory;