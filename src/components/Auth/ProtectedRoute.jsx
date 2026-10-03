// src/components/Auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePlan } from "../../contexts/PlanContext";

const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { user, loading } = useAuth();
  const planCtx = usePlan();
  const location = useLocation();

  if (loading || planCtx?.loading) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 dark:text-stone-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (requirePremium) {
    const planId = planCtx?.planId || "free";
    const isPaid = planId !== "free";
    if (!isPaid) {
      return (
        <Navigate
          to="/premium"
          replace
          state={{ from: location.pathname, reason: "premium_required" }}
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;