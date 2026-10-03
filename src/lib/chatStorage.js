// src/lib/chatStorage.js
import { supabase } from "./supabase";

const INITIAL_CREDITS = 30;

/* ═══════════════════════════════════════════════════════════════
   CREDITS
   ═══════════════════════════════════════════════════════════════ */
export async function loadCreditsFromDB() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return INITIAL_CREDITS;

    const { data, error } = await supabase
      .from("user_chat_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    // If no row exists yet, create one with INITIAL_CREDITS
    if (!data) {
      const { data: inserted, error: insertErr } = await supabase
        .from("user_chat_credits")
        .insert({ user_id: user.id, credits: INITIAL_CREDITS })
        .select("credits")
        .single();
      if (insertErr) throw insertErr;
      return inserted.credits;
    }

    return data.credits;
  } catch (err) {
    console.warn("loadCreditsFromDB failed, using default:", err);
    return INITIAL_CREDITS;
  }
}

export async function saveCreditsToDB(newCredits) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_chat_credits")
      .upsert(
        {
          user_id: user.id,
          credits: newCredits,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
  } catch (err) {
    console.warn("saveCreditsToDB failed:", err);
  }
}

export async function rechargeCreditsInDB() {
  return saveCreditsToDB(INITIAL_CREDITS);
}

/* ═══════════════════════════════════════════════════════════════
   CONVERSATIONS / RECENTS
   ═══════════════════════════════════════════════════════════════ */
export async function loadConversationsFromDB(limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      ts: new Date(row.updated_at).getTime(),
      messages: row.messages || [],
    }));
  } catch (err) {
    console.warn("loadConversationsFromDB failed:", err);
    return [];
  }
}

export async function saveConversationToDB(conversation) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // If the conversation already has a DB id (uuid), update it
    const isUuid =
      typeof conversation.id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        conversation.id
      );

    if (isUuid) {
      const { data, error } = await supabase
        .from("chat_conversations")
        .update({
          title: conversation.title,
          messages: conversation.messages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Otherwise insert a new row
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: conversation.title,
        messages: conversation.messages,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("saveConversationToDB failed:", err);
    return null;
  }
}

export async function deleteConversationFromDB(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
  } catch (err) {
    console.warn("deleteConversationFromDB failed:", err);
  }
}

export async function clearAllConversationsFromDB() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("chat_conversations")
      .delete()
      .eq("user_id", user.id);
  } catch (err) {
    console.warn("clearAllConversationsFromDB failed:", err);
  }
}