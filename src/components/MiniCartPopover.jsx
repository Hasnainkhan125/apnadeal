// components/MiniCartPopover.jsx — Ticket-styled mini cart preview
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaTimes, FaTrash, FaArrowRight } from "react-icons/fa";

const formatRs = (num) => `Rs ${Number(num || 0).toLocaleString("en-US")}`;

const MiniCartPopover = ({ open, onClose, cart, onRemove, detailPath }) => {
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close on outside click + Esc
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const subtotal = cart.reduce(
    (s, c) => s + (Number(c.price) || 0) * (c.qty || 1),
    0
  );
  const count = cart.reduce((s, c) => s + (c.qty || 1), 0);

  const goToDetail = (item) => {
    onClose();
    const base = detailPath || "/property";
    navigate(`${base}/${item.id}`);
  };

  const goToFullCart = () => {
    onClose();
    navigate("/orders");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="absolute right-0 top-[calc(100%+10px)] z-[150] w-[340px] max-w-[calc(100vw-1rem)] rounded-2xl border border-[#1B1815]/10 dark:border-[#F7F1E4]/10 bg-[#FCFAF3] dark:bg-[#17140F] shadow-[0_25px_70px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
          role="dialog"
          aria-label="Mini cart"
        >
          {/* Ticket-edge top sheen */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(232,163,61,0.6), transparent)",
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-[#1B1815]/10 dark:border-[#F7F1E4]/10">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-[#B9791E] dark:text-[#E8A33D] text-[12px]" />
              <span className="font-ticket-display text-sm font-bold text-[#1B1815] dark:text-[#F7F1E4]">
                Your Cart
              </span>
              <span className="font-ticket-body text-[10px] font-bold text-[#7A6F5D] dark:text-[#B3A793]">
                · {count} {count === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-[#7A6F5D] dark:text-[#B3A793] hover:bg-[#1B1815]/5 dark:hover:bg-[#F7F1E4]/5"
              aria-label="Close cart"
            >
              <FaTimes className="text-[10px]" />
            </button>
          </div>

          {/* Items */}
          {cart.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FaShoppingCart className="text-2xl text-[#7A6F5D]/40 mx-auto mb-2" />
              <p className="font-ticket-body text-xs text-[#7A6F5D] dark:text-[#B3A793]">
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="max-h-[280px] overflow-y-auto py-2">
              {cart.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="group/row flex items-start gap-3 px-4 py-2.5 hover:bg-[#1B1815]/[0.03] dark:hover:bg-[#F7F1E4]/[0.03]"
                >
                  <div className="h-11 w-11 rounded-lg overflow-hidden bg-[#1B1815] flex-shrink-0">
                    <img
                      src={item.image || "/car1.png"}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-ticket-body text-[11px] font-bold text-[#1B1815] dark:text-[#F7F1E4] truncate leading-tight">
                      {item.title}
                    </p>
                    <p className="font-ticket-body text-[9px] text-[#7A6F5D] dark:text-[#B3A793] truncate mt-0.5">
                      {item.location || item.category} · Qty {item.qty || 1}
                    </p>

                    {/* ✨ Learn more link */}
                    <button
                      onClick={() => goToDetail(item)}
                      className="mt-1 inline-flex items-center gap-1 font-ticket-body text-[9.5px] font-bold text-[#B9791E] dark:text-[#E8A33D] underline decoration-[#B9791E]/40 dark:decoration-[#E8A33D]/40 underline-offset-2 hover:decoration-[#B9791E] dark:hover:decoration-[#E8A33D]"
                    >
                      Learn more
                      <FaArrowRight className="text-[7px]" />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-ticket-display text-[11px] font-bold text-[#1B1815] dark:text-[#F7F1E4] tabular-nums">
                      {formatRs((item.price || 0) * (item.qty || 1))}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="opacity-0 group-hover/row:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-[#B23A2E] hover:bg-[#B23A2E]/10 transition-opacity"
                      aria-label={`Remove ${item.title}`}
                    >
                      <FaTrash className="text-[9px]" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 5 && (
                <p className="px-4 py-2 font-ticket-body text-[10px] text-[#7A6F5D] dark:text-[#B3A793] text-center">
                  +{cart.length - 5} more items
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-[#1B1815]/10 dark:border-[#F7F1E4]/10 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[#7A6F5D] dark:text-[#B3A793]">
                  Subtotal
                </span>
                <span className="font-ticket-display text-base font-bold text-[#B9791E] dark:text-[#E8A33D] tabular-nums">
                  {formatRs(subtotal)}
                </span>
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToFullCart}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B1815] dark:bg-[#E8A33D] text-[#F7F1E4] dark:text-[#1B1815] font-ticket-body text-[11px] font-extrabold tracking-wide"
              >
                View full cart
                <FaArrowRight className="text-[9px]" />
              </motion.button>

              {/* ⬇️ tiny hint link */}
              <button
                onClick={goToFullCart}
                className="mt-2 w-full text-center font-ticket-body text-[9.5px] text-[#7A6F5D] dark:text-[#B3A793] underline decoration-dotted underline-offset-2 hover:text-[#B9791E] dark:hover:text-[#E8A33D]"
              >
                Learn more about orders & checkout
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniCartPopover;