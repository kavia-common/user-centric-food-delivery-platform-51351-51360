/**
 * Formatting helpers for UI.
 */

/**
 * PUBLIC_INTERFACE
 * Formats cents to currency string.
 */
export function formatMoney(cents) {
  /** This is a public function. */
  const n = (cents || 0) / 100;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/**
 * PUBLIC_INTERFACE
 * Formats a timestamp as a readable local time.
 */
export function formatTime(ts) {
  /** This is a public function. */
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * PUBLIC_INTERFACE
 * Human label for order statuses.
 */
export function statusLabel(status) {
  /** This is a public function. */
  const map = {
    PLACED: "Order placed",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[status] || status || "Unknown";
}
