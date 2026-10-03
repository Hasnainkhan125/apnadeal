import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import { useAuth } from "../contexts/AuthContext";

export default function usePaymentNotifications() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`payment-notify-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "manual_payments",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const n = payload.new;
          const o = payload.old || {};

          // Only fire on actual status change
          if (n.status === o.status) return;

          if (n.status === "approved") {
            toast(
              `🎉 Payment approved — Premium unlocked!${
                n.pack_credits ? ` (+${n.pack_credits} credits)` : ""
              }`,
              { type: "success", duration: 6000 }
            );
            // Refresh the user's profile so isPremium() flips
            try { await refreshUser?.(); } catch {}
          } else if (n.status === "rejected") {
            toast("Your payment request was reviewed and rejected.", {
              type: "warning",
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshUser]);
}