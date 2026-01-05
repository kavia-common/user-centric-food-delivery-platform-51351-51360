import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../state/CartContext";
import { useSession } from "../state/SessionContext";
import { formatMoney } from "../utils/format";

/**
 * PUBLIC_INTERFACE
 * CheckoutPage collects delivery info and places an order.
 */
export function CheckoutPage() {
  /** This is a public function. */
  const navigate = useNavigate();
  const { cart, totals, itemCount, clear } = useCart();
  const { session } = useSession();

  const [status, setStatus] = useState("idle"); // idle | placing | error
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState({
    name: session.profile?.name || "",
    phone: session.profile?.phone || "",
    address: session.profile?.address || "",
    notes: session.profile?.defaultNotes || "",
  });

  const canPlace = useMemo(() => itemCount > 0 && delivery.name && delivery.phone && delivery.address, [itemCount, delivery]);

  async function placeOrder() {
    setStatus("placing");
    setError("");
    try {
      const orderDraft = {
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        items: cart.items.map((it) => ({
          id: it.id,
          name: it.name,
          priceCents: it.priceCents,
          qty: it.qty,
        })),
        totals,
        delivery,
        etaMins: 30,
      };
      const res = await api.createOrder(orderDraft);
      clear();
      navigate(`/orders/${res.id}`);
    } catch (e) {
      setError(e?.message || "Failed to place order");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  if (itemCount === 0) {
    return (
      <div className="stack">
        <h1 style={{ margin: 0, fontSize: 18 }}>Checkout</h1>
        <div className="emptyState" role="status">
          Your cart is empty. Add items from a restaurant menu before checking out.
        </div>
        <button className="btn btnPrimary" onClick={() => navigate("/")}>
          Browse restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Checkout</h1>
          <div className="small">Confirm delivery details and place your order.</div>
        </div>
        <div className="badge badgePrimary">{cart.restaurantName}</div>
      </div>

      {error ? (
        <div className="alert alertError" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid">
        <div className="card" style={{ gridColumn: "span 7" }}>
          <div className="cardBody">
            <h2 className="cardTitle">Delivery details</h2>
            <p className="cardSub">We’ll share these with your courier.</p>

            <div className="inputRow inputRowTwo" style={{ marginTop: 12 }}>
              <div>
                <label className="small" htmlFor="co-name">Full name</label>
                <input
                  id="co-name"
                  className="input"
                  value={delivery.name}
                  onChange={(e) => setDelivery({ ...delivery, name: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="small" htmlFor="co-phone">Phone</label>
                <input
                  id="co-phone"
                  className="input"
                  value={delivery.phone}
                  onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label className="small" htmlFor="co-address">Address</label>
              <input
                id="co-address"
                className="input"
                value={delivery.address}
                onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                placeholder="Street, unit, city"
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <label className="small" htmlFor="co-notes">Delivery notes (optional)</label>
              <textarea
                id="co-notes"
                className="input"
                rows={4}
                value={delivery.notes}
                onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                placeholder="Example: call on arrival"
              />
            </div>

            <div className="alert alertInfo" role="note" style={{ marginTop: 12 }}>
              Payment is mocked in this demo. In production, integrate a payment provider and tokenize card data.
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 5" }}>
          <div className="cardBody">
            <h2 className="cardTitle">Order summary</h2>
            <p className="cardSub">{itemCount} item(s)</p>

            <div className="stack" style={{ marginTop: 12 }}>
              {cart.items.map((it) => (
                <div key={it.id} className="rowBetween">
                  <span className="small">
                    {it.qty} × {it.name}
                  </span>
                  <strong>{formatMoney(it.priceCents * it.qty)}</strong>
                </div>
              ))}
            </div>

            <hr className="hr" />
            <div className="rowBetween">
              <span className="small">Subtotal</span>
              <strong>{formatMoney(totals.subtotalCents)}</strong>
            </div>
            <div className="rowBetween" style={{ marginTop: 8 }}>
              <span className="small">Delivery</span>
              <strong>{formatMoney(totals.deliveryCents)}</strong>
            </div>
            <div className="rowBetween" style={{ marginTop: 8 }}>
              <span className="small">Tax</span>
              <strong>{formatMoney(totals.taxCents)}</strong>
            </div>

            <hr className="hr" />
            <div className="rowBetween">
              <span>Total</span>
              <strong style={{ fontSize: 18 }}>{formatMoney(totals.totalCents)}</strong>
            </div>

            <button
              className="btn btnPrimary"
              style={{ width: "100%", marginTop: 12 }}
              onClick={placeOrder}
              disabled={!canPlace || status === "placing"}
              aria-busy={status === "placing"}
            >
              {status === "placing" ? "Placing order..." : "Place order"}
            </button>

            <button className="btn btnGhost" style={{ width: "100%", marginTop: 10 }} onClick={() => navigate("/")}>
              Add more items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
