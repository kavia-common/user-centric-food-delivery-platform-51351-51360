import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../state/CartContext";

/**
 * PUBLIC_INTERFACE
 * Sidebar navigation for desktop (and collapses naturally on mobile).
 */
export function Sidebar() {
  /** This is a public function. */
  const { itemCount, cart } = useCart();

  const linkClass = ({ isActive }) => `sideLink ${isActive ? "sideLinkActive" : ""}`;

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sideSectionTitle">Browse</div>

      <NavLink to="/" className={linkClass} end>
        <div className="sideIcon" aria-hidden="true">🍽️</div>
        <div className="sideMeta">
          <strong>Restaurants</strong>
          <span>Find your next meal</span>
        </div>
      </NavLink>

      <NavLink to="/orders" className={linkClass}>
        <div className="sideIcon" aria-hidden="true">🧭</div>
        <div className="sideMeta">
          <strong>Order Tracking</strong>
          <span>Live status updates</span>
        </div>
      </NavLink>

      <div className="sideSectionTitle">Checkout</div>

      <NavLink to="/checkout" className={linkClass}>
        <div className="sideIcon" aria-hidden="true">🧾</div>
        <div className="sideMeta">
          <strong>Checkout</strong>
          <span>{cart.restaurantName ? `From ${cart.restaurantName}` : "Ready when you are"}</span>
        </div>
        <span className="badge badgePrimary" aria-label={`${itemCount} items`}>{itemCount}</span>
      </NavLink>

      <hr className="hr" />

      <div className="sideSectionTitle">Tips</div>
      <div className="alert alertInfo" role="note">
        <div className="small">
          Add items from one restaurant at a time. Switching restaurants will start a new cart for clarity.
        </div>
      </div>
    </aside>
  );
}
