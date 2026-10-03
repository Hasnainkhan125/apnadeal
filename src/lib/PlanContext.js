// src/contexts/PlanContext.jsx — Auto-assigns Free plan on first login
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { PLANS, getPlan, getLimit, hasFeature } from "../lib/plans";

const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
  const { user } = useAuth();
  const [planId, setPlanId] = useState(PLANS.free.id);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Load (or create) the user's subscription ── */
  const loadSubscription = useCallback(async () => {
    if (!user?.id) {
      setPlanId(PLANS.free.id);
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1) Try to fetch existing subscription
      const { data: existing, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // 2) If none exists, create the FREE plan automatically
      if (!existing) {
        const { data: created, error: createErr } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan: PLANS.free.id,
            billing_cycle: "monthly",
            status: "active",
            start_date: new Date().toISOString(),
            end_date: null,                 // free plan never expires
            payment_method: "auto",
          })
          .select()
          .single();

        if (createErr) throw createErr;
        setSubscription(created);
        setPlanId(PLANS.free.id);
      } else {
        // 3) Respect the current plan (free/seller/pro)
        const activePlan = getPlan(existing.plan);
        setSubscription(existing);
        setPlanId(activePlan.id);
      }
    } catch (err) {
      console.error("PlanContext load error:", err);
      setPlanId(PLANS.free.id);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /* ── Listen for external plan changes ── */
  useEffect(() => {
    const onUpdated = () => loadSubscription();
    window.addEventListener("plan-updated", onUpdated);
    return () => window.removeEventListener("plan-updated", onUpdated);
  }, [loadSubscription]);

  /* ── Public API ── */
  const value = {
    planId,
    plan: getPlan(planId),
    subscription,
    loading,

    isFree: planId === PLANS.free.id,
    isSeller: planId === PLANS.seller.id,
    isPro: planId === PLANS.pro.id,
    isPaid: planId !== PLANS.free.id,

    // Limits
    limitListings: getLimit(planId, "listings"),
    limitAiImages: getLimit(planId, "aiImages"),
    limitVideoSeconds: getLimit(planId, "aiVideoSeconds"),
    limitBoosts: getLimit(planId, "featuredBoosts"),
    limitCleanPerMonth: getLimit(planId, "imageCleanPerMonth"),

    // Feature flags
    hasAnalytics: hasFeature(planId, "analytics"),
    hasVerifiedBadge: hasFeature(planId, "verifiedBadge"),
    hasGoldBadge: hasFeature(planId, "goldBadge"),
    hasPrioritySupport: hasFeature(planId, "prioritySupport"),

    refresh: loadSubscription,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside <PlanProvider>");
  return ctx;
};