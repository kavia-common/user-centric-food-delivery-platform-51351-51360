import React from "react";
import { isApiConfigured } from "../api/client";
import { useCart } from "../state/CartContext";
import { useSession } from "../state/SessionContext";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar for global actions (search, cart, account, theme).
 */
export function TopNav({ theme, onToggleTheme, searchValue, onSearchChange, onOpenCart }) {
  /** This is a public function. */
  const { itemCount } = useCart();
  const { openAccount, session } = useSession();

  return (
    <header className="topNav">
      <div className="topNavInner">
        <div className="brand" aria-label="Food delivery home">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <strong>Ocean Eats</strong>
            <span>{isApiConfigured() ? "Connected to API" : "Mock mode (no API base)"}</span>
          </div>
        </div>

        <div className="navGrow">
          <label className="srOnly" htmlFor="nav-search">
            Search restaurants
          </label>
          <input
            id="nav-search"
            className="input"
            placeholder="Search restaurants, cuisines..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label="Search restaurants"
          />
        </div>

        <div className="navActions">
          <button className="btn btnIcon" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button className="btn btnPrimary" onClick={onOpenCart} aria-label="Open cart">
            Cart <span className="badge badgePrimary" aria-label={`${itemCount} items in cart`}>{itemCount}</span>
          </button>

          <button className="btn" onClick={openAccount} aria-label="Open account panel">
            {session.profile?.name ? session.profile.name.split(" ")[0] : "Account"}
          </button>
        </div>
      </div>
    </header>
  );
}
