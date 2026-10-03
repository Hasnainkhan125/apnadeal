// components/OrderPDF.jsx — Nike-style Order Receipt PDF
// Clean modern design, real tracking number, item images, itemized totals.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ═══════════════════════════════════════════════════════════════
   BRAND TOKENS — neutral / minimal Nike-inspired palette
   ═══════════════════════════════════════════════════════════════ */
const C = {
  ink:     [17, 17, 17],
  gray:    [110, 110, 110],
  light:   [200, 200, 200],
  softer:  [240, 240, 240],
  paper:   [255, 255, 255],
  soft:    [250, 250, 250],
  green:   [22, 163, 74],
  accent:  [235, 125, 52],       // APNa brand orange (for accent bits)
  badge:   [247, 247, 247],
};

const BODY_FONT = "helvetica"; // built-in, always works
const DISPLAY_FONT = "helvetica";

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString("en-US")}`;

const METHOD_LABELS = {
  easypaisa: "Easypaisa",
  bank:      "Meezan Bank",
  cod:       "Cash on Delivery",
};

/* ═══════════════════════════════════════════════════════════════
   TRACKING NUMBER — matches Orders.jsx logic exactly
   ═══════════════════════════════════════════════════════════════ */
const getTrackingNumber = (order) => {
  if (order?.trackingNumber) return order.trackingNumber;
  if (order?.tracking_number) return order.tracking_number;

  // Fallback: derive from order id (same as Orders.jsx)
  const cleaned = String(order?.id || "000000")
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(-6)
    .toUpperCase();
  return `APD-${cleaned || "000000"}`;
};

const getCourier = (order) => order?.courier || "APNa Logistics";

const getOrderStatus = (order) => {
  const STEPS = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
  if (order?.statusIndex != null) return STEPS[order.statusIndex] || "Order Placed";

  // Fallback: derive from elapsed time (same 8-sec-per-step as Orders.jsx)
  const elapsed = (Date.now() - new Date(order?.placedAt || Date.now()).getTime()) / 1000;
  const idx = Math.min(STEPS.length - 1, Math.floor(elapsed / 8));
  return STEPS[idx];
};

/* ═══════════════════════════════════════════════════════════════
   IMAGE LOADER — converts remote image URL → base64
   ═══════════════════════════════════════════════════════════════ */
const loadImageAsDataUrl = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve(null);
    // Already a data URL
    if (url.startsWith("data:image")) return resolve(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;

    // Timeout safety
    setTimeout(() => resolve(null), 5000);
  });

/* ═══════════════════════════════════════════════════════════════
   MAIN PDF GENERATOR — Nike-style receipt
   ═══════════════════════════════════════════════════════════════ */
export const downloadOrderPDF = async (order) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;                       // outer margin
  const innerW = pageW - M * 2;

  const items = Array.isArray(order?.items) ? order.items : [];
  const customer = order?.customer || {};

  // ── Preload item images in parallel ──
  const itemImages = await Promise.all(
    items.map((it) => loadImageAsDataUrl(it.image))
  );

  /* ═══════════════════════════════════════════════
     TOP — small brand mark
     ═══════════════════════════════════════════════ */
  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.ink);
  doc.text("APNa Deal", M, M + 6);

  // Tiny underline accent
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(2);
  doc.line(M, M + 14, M + 42, M + 14);

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  doc.text("MARKETPLACE", M + 48, M + 14);

  /* ═══════════════════════════════════════════════
     HEADLINE — "Your order Confirmed!"
     ═══════════════════════════════════════════════ */
  let y = M + 70;

  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(26);
  doc.setTextColor(...C.ink);
  doc.text("Your order Confirmed!", M, y);

  y += 30;

  // Greeting
  const name = (customer.fullName || "").split(" ")[0] || "there";
  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text(`Hello ${name},`, M, y);

  y += 18;

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.gray);
  doc.text(
    "Your order has been confirmed and will be shipping within next 2 days.",
    M,
    y
  );

  y += 26;

  /* ═══════════════════════════════════════════════
     THIN DIVIDER
     ═══════════════════════════════════════════════ */
  doc.setDrawColor(...C.soft);
  doc.setLineWidth(1);
  doc.line(M, y, pageW - M, y);

  y += 24;

  /* ═══════════════════════════════════════════════
     META ROW — 4 columns
     Order Date · Order No · Payment · Tracking #
     ═══════════════════════════════════════════════ */
  const metaY = y;
  const colGap = innerW / 4;
  const cols = [
    { label: "Order Date",     value: new Date(order?.placedAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
    { label: "Order No",       value: String(order?.id || "—") },
    { label: "Payment",        value: METHOD_LABELS[order?.method] || "—" },
    { label: "Tracking No",    value: getTrackingNumber(order) },
  ];

  cols.forEach((col, i) => {
    const x = M + i * colGap;

    doc.setFont(BODY_FONT, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.gray);
    doc.text(col.label, x, metaY);

    doc.setFont(DISPLAY_FONT, "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...C.ink);
    doc.text(col.value, x, metaY + 15, { maxWidth: colGap - 8 });
  });

  y = metaY + 38;

  // Divider
  doc.setDrawColor(...C.soft);
  doc.line(M, y, pageW - M, y);
  y += 30;

  /* ═══════════════════════════════════════════════
     ITEMS — image + title + qty + price on the right
     ═══════════════════════════════════════════════ */
  const imgSize = 64;
  const rowGap = 18;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const img = itemImages[i];

    // Image (or placeholder box)
    if (img) {
      try {
        doc.addImage(img, "PNG", M, y, imgSize, imgSize);
      } catch {
        doc.setFillColor(...C.soft);
        doc.roundedRect(M, y, imgSize, imgSize, 6, 6, "F");
      }
    } else {
      doc.setFillColor(...C.soft);
      doc.roundedRect(M, y, imgSize, imgSize, 6, 6, "F");
      doc.setFont(BODY_FONT, "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gray);
      doc.text("No image", M + imgSize / 2, y + imgSize / 2, { align: "center" });
    }

    // Title
    const textX = M + imgSize + 16;
    doc.setFont(DISPLAY_FONT, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.ink);
    doc.text(String(it.title || "Item").slice(0, 60), textX, y + 16);

    // Qty
    doc.setFont(BODY_FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.gray);
    doc.text(`Quantity : ${it.qty || 1}`, textX, y + 34);

    // Category / location (optional)
    const meta = it.category || it.location || "";
    if (meta) {
      doc.text(String(meta).slice(0, 60), textX, y + 50);
    }

    // Price (right)
    doc.setFont(DISPLAY_FONT, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.ink);
    doc.text(
      formatRs((it.price || 0) * (it.qty || 1)),
      pageW - M,
      y + 20,
      { align: "right" }
    );

    y += imgSize + rowGap;
  }

  y += 4;

  /* ═══════════════════════════════════════════════
     DIVIDER + TOTALS (right-aligned)
     ═══════════════════════════════════════════════ */
  doc.setDrawColor(...C.soft);
  doc.line(M, y, pageW - M, y);
  y += 22;

  const subtotal = order?.subtotal ?? items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const shipping = order?.shippingFee ?? order?.shipping ?? 20;
  const delivery = order?.deliveryCharge ?? 0;
  const discount = order?.discount ?? 0;
  const total = order?.total ?? subtotal + shipping + delivery - discount;

  const labelX = pageW - M - 200;
  const valueX = pageW - M;

  const drawTotalRow = (label, value, opts = {}) => {
    const { bold = false, color = C.ink, big = false } = opts;
    doc.setFont(bold ? DISPLAY_FONT : BODY_FONT, bold ? "bold" : "normal");
    doc.setFontSize(big ? 13 : 10.5);
    doc.setTextColor(...color);
    doc.text(label, labelX, y);
    doc.setFont(DISPLAY_FONT, "bold");
    doc.setFontSize(big ? 14 : 10.5);
    doc.text(value, valueX, y, { align: "right" });
    y += big ? 22 : 16;
  };

  drawTotalRow("Subtotal", formatRs(subtotal));
  if (shipping) drawTotalRow("Shipping Fee", formatRs(shipping));
  if (delivery) drawTotalRow("Delivery Fee", formatRs(delivery));
  if (discount > 0) drawTotalRow("Discount", `- ${formatRs(discount)}`, { color: C.green });

  // Divider before total
  doc.setDrawColor(...C.light);
  doc.line(labelX, y - 6, valueX, y - 6);
  y += 8;

  drawTotalRow("Total", formatRs(total), { bold: true, big: true });

  y += 10;

  /* ═══════════════════════════════════════════════
     CLOSING NOTE + SIGNATURE
     ═══════════════════════════════════════════════ */
  doc.setDrawColor(...C.soft);
  doc.line(M, y, pageW - M, y);
  y += 24;

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.gray);
  const noteLines = doc.splitTextToSize(
    "We'll be sending a shipping confirmation email when the item is shipped successfully.",
    innerW - 20
  );
  doc.text(noteLines, M, y);
  y += noteLines.length * 16 + 8;

  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text("Thank You for shopping with us!", M, y);
  y += 18;

  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.ink);
  doc.text("APNa Deal Team", M, y);
  y += 12;

  // Status pill (small)
  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text(`Status : ${getOrderStatus(order)}  ·  via ${getCourier(order)}`, M, y);

  /* ═══════════════════════════════════════════════
     DELIVERY ADDRESS (bottom strip)
     ═══════════════════════════════════════════════ */
  y += 24;
  doc.setDrawColor(...C.soft);
  doc.line(M, y, pageW - M, y);
  y += 18;

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text("Shipping Address", M, y);
  y += 14;

  doc.setFont(DISPLAY_FONT, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...C.ink);
  doc.text(customer.fullName || "—", M, y);
  y += 14;

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.gray);
  if (customer.phone) { doc.text(customer.phone, M, y); y += 12; }
  if (customer.address) {
    const lines = doc.splitTextToSize(customer.address, innerW - 40);
    doc.text(lines, M, y);
    y += lines.length * 12;
  }
  if (customer.city) { doc.text(customer.city, M, y); y += 12; }

  /* ═══════════════════════════════════════════════
     FOOTER BAR
     ═══════════════════════════════════════════════ */
  const footerH = 48;
  const footerY = pageH - footerH;

  doc.setFillColor(...C.badge);
  doc.rect(0, footerY, pageW, footerH, "F");

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text("Need Help? Visit our Help Center", M, footerY + 28);

  doc.setFont(BODY_FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text(
    `© ${new Date().getFullYear()} APNa Deal`,
    pageW - M,
    footerY + 28,
    { align: "right" }
  );

  /* ═══════════════════════════════════════════════
     SAVE
     ═══════════════════════════════════════════════ */
  doc.save(`${order?.id || "order"}.pdf`);
};

export default downloadOrderPDF;