// src/lib/cartStore.js — Supabase-backed with per-user cart isolation
import { supabase } from "./supabase";

export const ORDER_STEPS = [
  { id: "placed",     label: "Order Placed",      desc: "We've received your order" },
  { id: "processing", label: "Processing",        desc: "Packing your items" },
  { id: "shipped",    label: "Shipped",           desc: "Handed to courier" },
  { id: "out",        label: "Out for Delivery",  desc: "Arriving today" },
  { id: "delivered",  label: "Delivered",         desc: "Order complete" },
];

const ORDERS_KEY = "apna.orders.v1";
const CART_PREFIX = "apna.cart.";

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
};

const getUserIdSync = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const uid =
          parsed?.user?.id ||
          parsed?.currentSession?.user?.id ||
          parsed?.session?.user?.id;
        if (uid) return uid;
      }
    }
  } catch {}
  return null;
};

const getCartKey = (userId = undefined) => {
  const uid = userId === undefined ? getUserIdSync() : userId;
  return uid ? `${CART_PREFIX}${uid}` : `${CART_PREFIX}guest`;
};

const ls = {
  getCart: (userId) => safeParse(localStorage.getItem(getCartKey(userId)), []),
  setCart: (v, userId) => localStorage.setItem(getCartKey(userId), JSON.stringify(v)),
  getOrders: () => safeParse(localStorage.getItem(ORDERS_KEY), []),
  setOrders: (v) => localStorage.setItem(ORDERS_KEY, JSON.stringify(v)),
};

const notify = (event) => {
  try { window.dispatchEvent(new Event(event)); } catch {}
};

/* ═══════════════════════════════════════════════════════════════
   CONNECTION / AUTH GUARDS
   ═══════════════════════════════════════════════════════════════ */
export const checkSupabaseReady = async () => {
  if (!supabase) {
    return { ok: false, reason: "Supabase client not configured. Check src/lib/supabase.js" };
  }

  let uid = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { ok: false, reason: "Auth error: " + error.message };
    uid = data?.user?.id || null;
  } catch {
    return { ok: false, reason: "Cannot reach Supabase. Check your internet connection." };
  }

  if (!uid) {
    return { ok: false, reason: "You must be signed in to continue." };
  }

  try {
    const { error } = await supabase.from("orders").select("id").limit(1);
    if (error) return { ok: false, reason: "Database error: " + error.message };
  } catch {
    return { ok: false, reason: "Cannot reach database. Please try again." };
  }

  return { ok: true, uid };
};

export const isUserLoggedIn = async () => {
  if (!supabase) return false;
  try {
    const { data } = await supabase.auth.getUser();
    return !!data?.user?.id;
  } catch {
    return false;
  }
};

const getUserId = async () => {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
};

/* ═══════════════════════════════════════════════════════════════
   GUEST CART MIGRATION
   ═══════════════════════════════════════════════════════════════ */
export const migrateGuestCart = async (userId) => {
  if (!userId) return;
  try {
    const guestKey = `${CART_PREFIX}guest`;
    const guestRaw = localStorage.getItem(guestKey);
    if (!guestRaw) return;

    const guestItems = safeParse(guestRaw, []);
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      localStorage.removeItem(guestKey);
      return;
    }

    const userKey = `${CART_PREFIX}${userId}`;
    const existing = safeParse(localStorage.getItem(userKey), []);

    const merged = [...existing];
    guestItems.forEach((g) => {
      const idx = merged.findIndex((m) => String(m.id) === String(g.id));
      if (idx > -1) {
        merged[idx] = { ...merged[idx], qty: (merged[idx].qty || 1) + (g.qty || 1) };
      } else {
        merged.push(g);
      }
    });

    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(guestKey);

    await writeCart(merged, userId);
  } catch (err) {
    console.warn("migrateGuestCart failed:", err);
  }
};

export const onUserSignOut = () => {
  notify("cart:update");
  notify("orders:update");
};

/* ═══════════════════════════════════════════════════════════════
   CART
   ═══════════════════════════════════════════════════════════════ */
export const readCart = (userId) => ls.getCart(userId);

export const syncCartFromSupabase = async () => {
  const uid = await getUserId();
  if (!uid) return ls.getCart();

  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", uid);

  if (error) return ls.getCart(uid);

  const local = ls.getCart(uid);
  if ((!data || data.length === 0) && local.length > 0) {
    await writeCart(local, uid);
    return local;
  }

  const mapped = (data || []).map((row) => ({
    id: String(row.product_id),
    cartRowId: row.id,
    title: row.title_snapshot,
    image: row.image_snapshot,
    location: row.location_snapshot,
    price: Number(row.price_snapshot),
    qty: row.qty,
  }));

  ls.setCart(mapped, uid);
  notify("cart:update");
  return mapped;
};

export const writeCart = async (items, userId) => {
  const uid = userId || (await getUserId());

  ls.setCart(items, uid || undefined);
  notify("cart:update");

  if (!uid) return;

  const { data: existing, error: fetchErr } = await supabase
    .from("cart_items")
    .select("id, product_id")
    .eq("user_id", uid);

  if (fetchErr) return;

  const incomingIds = new Set(items.map((it) => String(it.id)));

  const toDelete = (existing || [])
    .filter((r) => !incomingIds.has(String(r.product_id)))
    .map((r) => r.id);

  if (toDelete.length > 0) {
    await supabase.from("cart_items").delete().in("id", toDelete);
  }

  if (items.length > 0) {
    const rows = items.map((it) => ({
      user_id: uid,
      product_id: String(it.id),
      qty: it.qty || 1,
      price_snapshot: it.price,
      title_snapshot: it.title,
      image_snapshot: it.image,
      location_snapshot: it.location,
    }));

    await supabase
      .from("cart_items")
      .upsert(rows, { onConflict: "user_id,product_id" });
  }
};

/* ═══════════════════════════════════════════════════════════════
   CART HELPERS
   ═══════════════════════════════════════════════════════════════ */
export const addToCart = async (product, qty = 1) => {
  const uid = await getUserId();
  const current = ls.getCart(uid);
  const idx = current.findIndex((c) => String(c.id) === String(product.id));

  const merged = [...current];
  if (idx > -1) {
    merged[idx] = { ...merged[idx], qty: (merged[idx].qty || 1) + qty };
  } else {
    merged.push({
      id: String(product.id),
      title: product.title,
      image: product.image,
      location: product.location,
      price: product.price,
      qty,
    });
  }

  await writeCart(merged, uid);
  return merged;
};

export const removeFromCart = async (productId) => {
  const uid = await getUserId();
  const current = ls.getCart(uid);
  const next = current.filter((c) => String(c.id) !== String(productId));
  await writeCart(next, uid);
  return next;
};

export const setCartQty = async (productId, qty) => {
  const uid = await getUserId();
  const current = ls.getCart(uid);
  if (qty <= 0) return removeFromCart(productId);

  const next = current.map((c) =>
    String(c.id) === String(productId) ? { ...c, qty } : c
  );
  await writeCart(next, uid);
  return next;
};

export const clearCart = async () => {
  const uid = await getUserId();

  ls.setCart([], uid || undefined);
  notify("cart:update");

  if (!uid) return;

  await supabase.from("cart_items").delete().eq("user_id", uid);
};

/* ═══════════════════════════════════════════════════════════════
   ORDERS — user's own
   ═══════════════════════════════════════════════════════════════ */
export const readOrders = () => ls.getOrders();

export const syncOrdersFromSupabase = async () => {
  const uid = await getUserId();
  if (!uid) return ls.getOrders();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      order_events (*)
    `)
    .eq("user_id", uid)
    .order("placed_at", { ascending: false });

  if (error || !data) return ls.getOrders();

  const mapped = data.map((o) => ({
    id: o.order_number || o.id,
    dbId: o.id,
    items: (o.order_items || []).map((it) => ({
      id: String(it.product_id || it.id),
      title: it.title,
      image: it.image,
      price: Number(it.price),
      qty: it.qty,
      location: it.location,
    })),
    subtotal: Number(o.subtotal || 0),
    deliveryCharge: Number(o.shipping_fee || 0),
    total: Number(o.total || 0),
    method: o.payment_method,
    paymentStatus: o.payment_status,
    statusIndex: o.status_index ?? 0,
    trackingNumber: o.tracking_number,
    courier: o.courier,
    eta: o.eta,
    placedAt: o.placed_at,
    customer: {
      fullName: o.customer_name,
      phone: o.customer_phone,
      address: o.customer_address,
      city: o.customer_city,
    },
    events: (o.order_events || [])
      .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))
      .map((e) => ({
        stepId: e.step_id,
        label: e.label,
        desc: e.description,
        occurredAt: e.occurred_at,
      })),
  }));

  ls.setOrders(mapped);
  notify("orders:update");
  return mapped;
};

/* ═══════════════════════════════════════════════════════════════
   ORDERS — admin view (all users)
   Uses admin_get_all_orders RPC (SECURITY DEFINER) to bypass RLS.
   Related tables (order_items, order_events) also need admin read
   policies — see the SQL notes below.
   ═══════════════════════════════════════════════════════════════ */
export const syncAllOrdersFromSupabase = async () => {
  if (!supabase) return ls.getOrders();

  const { data: orderRows, error } = await supabase.rpc("admin_get_all_orders");
  if (error || !orderRows) {
    console.error("[cartStore] admin RPC failed:", error?.message);
    return ls.getOrders();
  }

  const orderIds = orderRows.map((o) => o.id);
  if (orderIds.length === 0) {
    ls.setOrders([]);
    notify("orders:update");
    return [];
  }

  /* Try to fetch items + events — if RLS blocks them, we still show orders. */
  const [itemsRes, eventsRes] = await Promise.all([
    supabase.from("order_items").select("*").in("order_id", orderIds),
    supabase.from("order_events").select("*").in("order_id", orderIds),
  ]);

  if (itemsRes.error)  console.warn("[cartStore] order_items fetch:", itemsRes.error.message);
  if (eventsRes.error) console.warn("[cartStore] order_events fetch:", eventsRes.error.message);

  const itemsByOrder = {};
  (itemsRes.data || []).forEach((it) => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
    itemsByOrder[it.order_id].push(it);
  });

  const eventsByOrder = {};
  (eventsRes.data || []).forEach((e) => {
    if (!eventsByOrder[e.order_id]) eventsByOrder[e.order_id] = [];
    eventsByOrder[e.order_id].push(e);
  });

  const mapped = orderRows.map((o) => ({
    id: o.order_number || o.id,
    dbId: o.id,
    userId: o.user_id,
    items: (itemsByOrder[o.id] || []).map((it) => ({
      id: String(it.product_id || it.id),
      title: it.title,
      image: it.image,
      price: Number(it.price),
      qty: it.qty,
      location: it.location,
    })),
    subtotal: Number(o.subtotal || 0),
    deliveryCharge: Number(o.shipping_fee || 0),
    total: Number(o.total || 0),
    method: o.payment_method,
    paymentStatus: o.payment_status,
    statusIndex: o.status_index ?? 0,
    trackingNumber: o.tracking_number,
    courier: o.courier,
    eta: o.eta,
    placedAt: o.placed_at,
    customer: {
      fullName: o.customer_name,
      phone: o.customer_phone,
      address: o.customer_address,
      city: o.customer_city,
    },
    events: (eventsByOrder[o.id] || [])
      .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))
      .map((e) => ({
        stepId: e.step_id,
        label: e.label,
        desc: e.description,
        occurredAt: e.occurred_at,
      })),
  }));

  ls.setOrders(mapped);
  notify("orders:update");
  return mapped;
};

export const writeOrders = async (orders) => {
  ls.setOrders(orders);
  notify("orders:update");
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN — update order status (any user's order)
   Uses the admin_update_order_status RPC (SECURITY DEFINER).
   ═══════════════════════════════════════════════════════════════ */
export const updateOrderStatus = async (orderId, statusIndex) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const safeIndex = Math.max(0, Math.min(statusIndex, ORDER_STEPS.length - 1));
  const step = ORDER_STEPS[safeIndex];

  /* Resolve the local id → DB UUID */
  const local = ls.getOrders();
  const match = local.find((o) => o.id === orderId || o.dbId === orderId);
  let dbId = match?.dbId;

  if (!dbId) {
    const { data: found, error: findErr } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", orderId)
      .maybeSingle();
    if (findErr) throw new Error("Lookup failed: " + findErr.message);
    if (!found?.id) throw new Error("Order not found in database.");
    dbId = found.id;
  }

  /* Call the admin RPC — SECURITY DEFINER, bypasses RLS */
  const { data, error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: dbId,
    p_status: step.id,
    p_status_index: safeIndex,
    p_label: step.label,
    p_description: step.desc,
  });

  if (error) {
    console.error("[updateOrderStatus] ❌ RPC error:", error);
    throw new Error("Could not update status: " + error.message);
  }

  /* Update local mirror */
  const next = ls.getOrders().map((o) =>
    o.dbId === dbId
      ? { ...o, statusIndex: safeIndex, statusUpdatedAt: new Date().toISOString() }
      : o
  );
  ls.setOrders(next);
  notify("orders:update");

  return data;
};

/* ═══════════════════════════════════════════════════════════════
   createOrder — throws on failure
   ═══════════════════════════════════════════════════════════════ */
export const createOrder = async ({
  items,
  subtotal,
  deliveryCharge,
  total,
  method,
  customer,
  txnRef = null,
}) => {
  const gate = await checkSupabaseReady();
  if (!gate.ok) throw new Error(gate.reason);

  const uid = gate.uid;
  const localId = "ORD-" + Date.now().toString().slice(-8).toUpperCase();

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: uid,
      order_number: localId,
      status: "placed",
      status_index: 0,
      subtotal,
      shipping_fee: deliveryCharge,
      total,
      payment_method: method,
      payment_status: "pending",
      payment_ref: txnRef,
      tracking_number: `APD-${localId.slice(-6)}`,
      courier: "APNa Logistics",
      customer_name: customer.fullName,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_city: customer.city,
    })
    .select()
    .single();

  if (orderErr || !orderRow) {
    throw new Error("Order could not be saved: " + (orderErr?.message || "unknown error"));
  }

  const itemRows = items.map((it) => ({
    order_id: orderRow.id,
    product_id: it.id ? String(it.id) : null,
    title: it.title,
    image: it.image,
    price: it.price,
    qty: it.qty || 1,
    location: it.location,
  }));
  await supabase.from("order_items").insert(itemRows);

  await supabase.from("order_events").insert({
    order_id: orderRow.id,
    step_id: "placed",
    label: "Order Placed",
    description: "We've received your order",
  });

  await supabase.from("cart_items").delete().eq("user_id", uid);
  ls.setCart([], uid);
  notify("cart:update");

  await syncOrdersFromSupabase();

  return {
    id: localId,
    dbId: orderRow.id,
    items,
    subtotal,
    deliveryCharge,
    total,
    method,
    customer: { ...customer, txnRef },
    placedAt: orderRow.placed_at || new Date().toISOString(),
    statusIndex: 0,
    trackingNumber: orderRow.tracking_number,
    courier: orderRow.courier,
  };
};

/* ═══════════════════════════════════════════════════════════════
   deleteOrder — user deletes their own
   ═══════════════════════════════════════════════════════════════ */
export const deleteOrder = async (localId) => {
  const gate = await checkSupabaseReady();
  if (!gate.ok) throw new Error(gate.reason);

  const next = ls.getOrders().filter((o) => o.id !== localId);
  ls.setOrders(next);
  notify("orders:update");

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("user_id", gate.uid)
    .eq("order_number", localId);

  if (error) throw new Error("Could not delete order: " + error.message);
};
export const adminDeleteOrder = async (orderId) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const local = ls.getOrders();
  const match = local.find((o) => o.id === orderId || o.dbId === orderId);
  let dbId = match?.dbId;

  if (!dbId) {
    const { data: found, error: findErr } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", orderId)
      .maybeSingle();
    if (findErr) throw new Error("Lookup failed: " + findErr.message);
    if (!found?.id) throw new Error("Order not found.");
    dbId = found.id;
  }

  /* Calls the SECURITY DEFINER RPC — bypasses RLS */
  const { error } = await supabase.rpc("admin_delete_order", {
    p_order_id: dbId,
  });

  if (error) {
    console.error("[adminDeleteOrder] ❌ RPC error:", error);
    throw new Error("Could not delete order: " + error.message);
  }

  const next = local.filter((o) => o.dbId !== dbId);
  ls.setOrders(next);
  notify("orders:update");

  return true;
};