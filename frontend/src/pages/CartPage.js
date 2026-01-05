import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext";
import { formatMoney } from "../utils/format";

/**
 * PUBLIC_INTERFACE
 * CartPage is a dedicated page view of the cart (in addition to the side panel).
 * This is useful for direct deep-linking and smaller screens.
 */
export function CartPage() {
  /** This is a public function. */
  const navigate = useNavigate();
  const { cart, totals, itemCount, setQty, removeItem, clear, promoCode, setPromoCode } = useCart();

  const [localPromo, setLocalPromo] = useState(promoCode || "");

  const canCheckout = useMemo(() => itemCount > 0, [itemCount]);

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Cart</h1>
          <div className="small">{cart.restaurantName ? `From ${cart.restaurantName}` : "Your cart is currently empty."}</div>
        </div>

        <Link className="btn" to="/">
          ← Restaurants
        </Link>
      </div>

      {itemCount === 0 ? (
        <div className="emptyState" role="status">
          Nothing in your cart yet. Add items from a restaurant menu.
        </div>
      ) : (
        <div className="grid">
          <div className="card" style={{ gridColumn: "span 7" }}>
            <div className="cardBody">
              <h2 className="cardTitle">Items</h2>
              <p className="cardSub">Adjust quantities or remove items.</p>

              <div className="stack" style={{ marginTop: 12 }}>
                {cart.items.map((it) => (
                  <div key={it.id} className="card">
                    <div className="cardBody">
                      <div className="rowBetween">
                        <div className="stack" style={{ gap: 4 }}>
                          <div style={{ fontWeight: 700 }}>{it.name}</div>
                          <div className="small">{it.description}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>{formatMoney(it.priceCents)}</div>
                      </div>

                      <div className="rowBetween" style={{ marginTop: 12 }}>
                        <div className="row">
                          <button
                            className="btn btnSmall"
                            onClick={() => setQty(it.id, it.qty - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <div className="badge" aria-label={`Quantity ${it.qty}`}>
                            {it.qty}
                          </div>
                          <button
                            className="btn btnSmall"
                            onClick={() => setQty(it.id, it.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button className="btn btnSmall btnDanger" onClick={() => removeItem(it.id)} aria-label="Remove item">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rowBetween" style={{ marginTop: 8 }}>
                  <button className="btn btnGhost" onClick={clear}>
                    Clear cart
                  </button>
                  <button className="btn btnPrimary" onClick={() => navigate("/checkout")} disabled={!canCheckout}>
                    Go to checkout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: "span 5" }}>
            <div className="cardBody">
              <h2 className="cardTitle">Summary</h2>
              <p className="cardSub">{itemCount} item(s)</p>

              <div className="stack" style={{ marginTop: 12 }}>
                <div>
                  <label className="small" htmlFor="promo">
                    Promo code (optional)
                  </label>
                  <div className="row" style={{ marginTop: 6 }}>
                    <input
                      id="promo"
                      className="input"
                      value={localPromo}
                      onChange={(e) => setLocalPromo(e.target.value)}
                      placeholder="e.g., OCEAN10"
                    />
                    <button
                      className="btn btnSecondary"
                      onClick={() => setPromoCode(localPromo.trim() || "")}
                      aria-label="Apply promo code"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="helpText" style={{ marginTop: 6 }}>
                    Promo codes are stored in cart state for now (discount math can be added later).
                  </div>
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

                {promoCode ? (
                  <div className="alert alertInfo" role="note" style={{ marginTop: 12 }}>
                    Promo applied: <strong>{promoCode}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
