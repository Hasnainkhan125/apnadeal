// components/SellerAvatar.jsx — Compact seller avatar + plan label for feed cards
import React from "react";
import { FaCheckCircle, FaCrown, FaBolt, FaStar } from "react-icons/fa";

const PLAN_STYLES = {
  pro: {
    ring: "conic-gradient(#f5b947 0deg, #f5b947 360deg)",
    badge: "#164B3B",
    badgeColor: "#FFFFFF",
    badgeIcon: FaCrown,
    badgeText: "PRO",
    isPremium: true,
  },
  seller: {
    ring: "conic-gradient(#eba434 0deg, #eba434 360deg)",
    badge: "linear-gradient(90deg, #eba434, #c8861f)",
    badgeColor: "#0B0B12",
    badgeIcon: FaBolt,
    badgeText: "SELLER",
    isPremium: true,
  },
  free: {
    ring: "conic-gradient(rgba(20,20,30,0.18) 0deg, rgba(20,20,30,0.18) 360deg)",
    badge: "var(--fd-surface-2)",
    badgeColor: "var(--fd-txt-faint)",
    badgeIcon: FaStar,
    badgeText: "FREE",
    isPremium: false,
  },
};

export const SellerAvatar = ({
  avatar,
  name = "Seller",
  planId = "free",
  verified = false,
  size = 22,
}) => {
  const style = PLAN_STYLES[planId] || PLAN_STYLES.free;
  const initial = (name || "S").charAt(0).toUpperCase();

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Conic ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: style.ring }}
      />
      {/* Inner avatar */}
      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          inset: 2,
          background: "linear-gradient(135deg, var(--fd-primary) 0%, var(--fd-primary-3) 100%)",
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span
            className="font-ticket-body font-extrabold"
            style={{ fontSize: size * 0.42, color: "#0B0B12" }}
          >
            {initial}
          </span>
        )}
      </div>
      {/* Verified check */}
      {verified && (
        <FaCheckCircle
          className="absolute rounded-full"
          style={{
            fontSize: size * 0.42,
            color: "#10B981",
            background: "var(--fd-surface)",
            borderRadius: "999px",
            bottom: -1,
            right: -1,
          }}
        />
      )}
    </div>
  );
};

export const PlanLabel = ({ planId = "free", compact = true }) => {
  const style = PLAN_STYLES[planId] || PLAN_STYLES.free;
  const Icon = style.badgeIcon;

  return (
    <span
      className="inline-flex items-center gap-1 font-ticket-body font-extrabold rounded-full whitespace-nowrap"
      style={{
        background: style.badge,
        color: style.badgeColor,
        fontSize: compact ? 8.5 : 10,
        padding: compact ? "2px 6px" : "3px 9px",
        letterSpacing: "0.03em",
        border: !style.isPremium ? "1px solid var(--fd-line)" : "none",
        flexShrink: 0,
      }}
    >
      <Icon style={{ fontSize: compact ? 7 : 9 }} />
      {style.badgeText}
    </span>
  );
};