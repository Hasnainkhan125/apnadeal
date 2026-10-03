// src/hooks/usePlanLimits.js — Check limits + show upgrade prompts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePlan } from "../contexts/PlanContext";
import { useAuth } from "../contexts/AuthContext";

export const usePlanLimits = () => {
  const { user } = useAuth();
  const plan = usePlan();
  const navigate = useNavigate();

  /* ═══════════════════════════════════════════════════════════
     Count current active listings for this user
     ═══════════════════════════════════════════════════════════ */
  const getActiveListingsCount = useCallback(async () => {
    if (!user?.id) return 0;
    try {
      const { count, error } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.warn("count listings failed:", err);
      return 0;
    }
  }, [user?.id]);

  /* ═══════════════════════════════════════════════════════════
     Can the user post another listing?
     ⭐ Free = 1, Seller = 30, Pro = Unlimited
     ═══════════════════════════════════════════════════════════ */
  const canPostListing = useCallback(async () => {
    const max = plan.limitListings;

    // ⭐ Pro / unlimited — always allowed, no DB call
    if (max === Infinity) {
      return { ok: true, used: 0, max: Infinity };
    }

    // ⭐ Fail open if plan data isn't loaded yet
    if (max === undefined || max === null || Number.isNaN(max)) {
      return { ok: true, used: 0, max: 1 };
    }

    // ⭐ Paid users with 30+ listings — never block
    if (plan.isPaid && max >= 30) {
      return { ok: true, used: 0, max };
    }

    if (!user?.id) {
      return {
        ok: false,
        used: 0,
        max,
        reason: "Please sign in to post a listing.",
        upgradeTo: "seller",
      };
    }

    const count = await getActiveListingsCount();

    if (count < max) {
      return { ok: true, used: count, max };
    }

    const planName = plan.plan?.name || "Free";
    const reason =
      max === 1
        ? `You've used your 1 free listing. Delete your current listing or upgrade to Seller for 30 listings.`
        : `You've reached your ${planName} limit of ${max} active listings.`;

    return {
      ok: false,
      used: count,
      max,
      reason,
      upgradeTo: "seller",
    };
  }, [plan, user?.id, getActiveListingsCount]);

  /* ═══════════════════════════════════════════════════════════
     Can the user generate N AI images this month?
     ⭐ Free = 3, Seller = 30, Pro = 200
     ═══════════════════════════════════════════════════════════ */
  const canGenerateImages = useCallback(
    async (count = 1) => {
      const max = plan.limitAiImages;

      if (max === Infinity) {
        return { ok: true, used: 0, max: Infinity };
      }

      if (max === undefined || max === null || Number.isNaN(max)) {
        return { ok: true, used: 0, max: 3 };
      }

      // ⭐ Paid users with 30+ images/month — never block
      if (plan.isPaid && max >= 30) {
        return { ok: true, used: 0, max };
      }

      if (!user?.id) {
        return {
          ok: false,
          used: 0,
          max,
          reason: "Please sign in to generate images.",
          upgradeTo: "seller",
        };
      }

      try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count: used, error } = await supabase
          .from("generated_images")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart.toISOString());

        if (error) throw error;

        const total = (used || 0) + count;

        if (total <= max) {
          return { ok: true, used: used || 0, max };
        }

        const planName = plan.plan?.name || "Free";
        return {
          ok: false,
          used: used || 0,
          max,
          reason: `You've used ${used || 0} of ${max} AI images this month on the ${planName} plan.`,
          upgradeTo: "seller",
        };
      } catch (err) {
        console.warn("AI image check failed:", err);
        // Fail open — don't block the user if the check errors
        return { ok: true, used: 0, max };
      }
    },
    [plan, user?.id]
  );

  /* ═══════════════════════════════════════════════════════════
     Can the user apply a featured boost?
     ⭐ Free = 0, Seller = 1/month, Pro = 4/month
     ═══════════════════════════════════════════════════════════ */
  const canBoost = useCallback(async () => {
    const max = plan.limitBoosts;

    if (max === Infinity) {
      return { ok: true, used: 0, max: Infinity };
    }

    if (max === 0) {
      return {
        ok: false,
        used: 0,
        max: 0,
        reason: `${plan.plan?.name || "Free"} plan doesn't include featured boosts. Upgrade to Seller to get 1 boost/month.`,
        upgradeTo: "seller",
      };
    }

    if (!user?.id) {
      return {
        ok: false,
        used: 0,
        max,
        reason: "Please sign in to boost listings.",
        upgradeTo: "seller",
      };
    }

    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: used, error } = await supabase
        .from("listing_boosts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      if (error) throw error;

      if ((used || 0) < max) {
        return { ok: true, used: used || 0, max };
      }

      return {
        ok: false,
        used: used || 0,
        max,
        reason: `You've used all ${max} boosts for this month.`,
        upgradeTo: "pro",
      };
    } catch (err) {
      console.warn("boost check failed:", err);
      return { ok: true, used: 0, max };
    }
  }, [plan, user?.id]);

  /* ═══════════════════════════════════════════════════════════
     Can the user clean an image (background remover)?
     ⭐ Free = 5/month, Seller = 50/month, Pro = Unlimited
     ═══════════════════════════════════════════════════════════ */
  const canCleanImage = useCallback(async () => {
    const max = plan.limitCleanPerMonth;

    if (max === Infinity) {
      return { ok: true, used: 0, max: Infinity };
    }

    if (!user?.id) {
      return {
        ok: false,
        used: 0,
        max,
        reason: "Please sign in to use the background remover.",
        upgradeTo: "seller",
      };
    }

    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: used, error } = await supabase
        .from("cleaned_images")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      // If the table doesn't exist yet, fail open
      if (error && error.code !== "42P01") throw error;

      const usedCount = used || 0;

      if (usedCount < max) {
        return { ok: true, used: usedCount, max };
      }

      return {
        ok: false,
        used: usedCount,
        max,
        reason: `You've used ${usedCount} of ${max} background removals this month.`,
        upgradeTo: "seller",
      };
    } catch (err) {
      console.warn("clean image check failed:", err);
      return { ok: true, used: 0, max };
    }
  }, [plan, user?.id]);

  /* ═══════════════════════════════════════════════════════════
     Navigate to upgrade page
     ═══════════════════════════════════════════════════════════ */
  const promptUpgrade = useCallback(
    (targetPlan = "seller") => {
      navigate("/premium", { state: { highlight: targetPlan } });
    },
    [navigate]
  );

  /* ═══════════════════════════════════════════════════════════
     Return everything
     ═══════════════════════════════════════════════════════════ */
  return {
    ...plan,
    canPostListing,
    canGenerateImages,
    canBoost,
    canCleanImage,
    getActiveListingsCount,
    promptUpgrade,
  };
};