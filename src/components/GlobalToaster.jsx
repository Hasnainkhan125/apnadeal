import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { subscribeToasts } from "../lib/toast";

const COLORS = {
  success: { bg: "#16a34a", icon: FaCheck },
  error:   { bg: "#DC2626", icon: FaExclamationTriangle },
  warning: { bg: "#eb7d34", icon: FaExclamationTriangle },
  info:    { bg: "#2563EB", icon: FaInfoCircle },
};

export default function GlobalToaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = subscribeToasts((t) => {
      setItems((prev) => [...prev, t]);
      if (t.duration > 0) {
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), t.duration);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none max-w-[92vw]">
      <AnimatePresence>
        {items.map((t) => {
          const meta = COLORS[t.type] || COLORS.success;
          const Icon = meta.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md"
              style={{
                background: "rgba(15,15,25,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderLeft: `4px solid ${meta.bg}`,
              }}
            >
              <span
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${meta.bg}22`, color: meta.bg }}
              >
                <Icon className="text-xs" />
              </span>
              <span className="text-sm font-bold text-white leading-snug">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}