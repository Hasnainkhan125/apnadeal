// src/components/FollowButton.jsx
// Follow/unfollow button with state
import React, { useState, useEffect } from "react";
import { FaUserPlus, FaUserCheck, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const FollowButton = ({
  targetUserId,
  size = "md",           // sm | md | lg
  onFollowChange,        // optional callback (isFollowing) => void
  variant = "primary",   // primary | outline | minimal
}) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isSelf = !user || user.id === targetUserId;

  /* Load follow status */
  useEffect(() => {
    if (!user || !targetUserId || isSelf) {
      setInitialized(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .maybeSingle();
        if (!cancelled) setFollowing(!!data);
      } catch (err) {
        console.warn("Follow check failed:", err);
      } finally {
        if (!cancelled) setInitialized(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user, targetUserId, isSelf]);

  const handleToggle = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!user) return;
    if (isSelf) return;
    if (loading) return;

    setLoading(true);
    const prev = following;
    setFollowing(!prev); // optimistic

    try {
      const { data, error } = await supabase.rpc("toggle_follow", {
        p_target_id: targetUserId,
      });
      if (error) throw error;

      const nowFollowing = data === "followed";
      setFollowing(nowFollowing);
      onFollowChange?.(nowFollowing);
    } catch (err) {
      console.error("Toggle follow failed:", err);
      setFollowing(prev); // rollback
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) return null;
  if (!initialized) {
    return (
      <div
        className={`${size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9"} rounded-full flex items-center justify-center`}
        style={{ background: "var(--sp-card-2, #f5f5f5)" }}
      >
        <FaSpinner className="animate-spin text-[10px]" style={{ color: "var(--sp-txt-soft, #999)" }} />
      </div>
    );
  }

  /* Sizes */
  const sizeClasses = {
    sm: "h-7 px-2.5 text-[10px] gap-1",
    md: "h-9 px-3.5 text-[11px] gap-1.5",
    lg: "h-11 px-5 text-[13px] gap-2",
  }[size] || "h-9 px-3.5 text-[11px] gap-1.5";

  const iconSize = { sm: "text-[8px]", md: "text-[10px]", lg: "text-[12px]" }[size] || "text-[10px]";

  /* Styles */
  let bg, color, border;
  if (following) {
    bg = variant === "outline" ? "transparent" : "var(--sp-card-2, #f5f5f5)";
    color = "var(--sp-txt, #000)";
    border = "1px solid var(--sp-line, #e5e5e5)";
  } else {
    bg = "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))";
    color = "#fff";
    border = "none";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-full font-black whitespace-nowrap transition-all disabled:opacity-60 ${sizeClasses}`}
      style={{ background: bg, color, border }}
      aria-label={following ? "Unfollow" : "Follow"}
    >
      {loading ? (
        <FaSpinner className={`animate-spin ${iconSize}`} />
      ) : following ? (
        <FaUserCheck className={iconSize} />
      ) : (
        <FaUserPlus className={iconSize} />
      )}
      <span>{following ? "Following" : "Follow"}</span>
    </motion.button>
  );
};

export default FollowButton;