import React from "react";
import { useNavigate } from "react-router-dom";
import { SidePanel } from "./SidePanel";
import { useCart } from "../state/CartContext";
import { formatMoney } from "../utils/format";

/**
 * PUBLIC_INTERFACE
 * CartPanel shows cart items in a right-side panel.
 */
export function CartPanel({ isOpen, onClose }) {
  /** This is a public function. */
  const navigate = useNavigate();
  const { cart, totals, itemCount, setQty, removeItem, clear } = useCart();

  const footer = (
    <>
      <button className="btn btnGhost" onClick={clear} disabled={itemCount === 0}>
        Clear
      </button>
      <button
        className="btn btnPrimary"
        onClick={() => {
          onClose?.();
          navigate("/checkout");
        }}
        disabled={itemCount === 0}
      >
        Go to checkout
      </button>
    </>
  );

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Your cart"
      description={cart.restaurantName ? `From ${cart.restaurantName}` : "Add items from a menu to get started."}
      footer={footer}
    >
      {itemCount === 0 ? (
        <div className="emptyState" role="status">
          Your cart is empty. Browse restaurants and add something delicious.
        </div>
      ) : (
        <div className="stack">
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
                    <button className="btn btnSmall" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <div className="badge" aria-label={`Quantity ${it.qty}`}>{it.qty}</div>
                    <button className="btn btnSmall" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase quantity">
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

          <div className="card">
            <div className="cardBody">
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
              <div className="small" style={{ marginTop: 8 }}>
                Estimated delivery in ~{cart.restaurantName ? "30" : "—"} minutes.
              </div>
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
