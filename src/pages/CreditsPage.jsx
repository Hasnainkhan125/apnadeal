// src/pages/CreditsPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PremiumCreditsModal from "../components/PremiumCreditsModal";

export default function CreditsPage() {
  const navigate = useNavigate();

  /* Lock body scroll since this page is just a full-screen modal */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <PremiumCreditsModal
      isOpen={true}
      onClose={() => navigate("/ai-image")}
      onSubscribe={(planId) => {
        console.log("subscribe", planId);
      }}
      onBuyCredits={(id, credits) => {
        console.log("bought", id, credits);
      }}
    />
  );
}