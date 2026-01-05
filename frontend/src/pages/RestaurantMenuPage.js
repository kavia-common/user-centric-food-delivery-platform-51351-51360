import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../state/CartContext";

/**
 * PUBLIC_INTERFACE
 * RestaurantMenuPage displays a restaurant and its menu items.
 */
export function RestaurantMenuPage() {
  /** This is a public function. */
  const { restaurantId } = useParams();
  const { addItem, cart } = useCart();

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("loading");
      setError("");
      try {
        const r = await api.getRestaurant(restaurantId);
        const m = await api.listMenu(restaurantId);
        if (mounted) {
          setRestaurant(r);
          setMenu(m);
          setStatus("ready");
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load menu");
          setStatus("error");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  const byCategory = useMemo(() => {
    const map = new Map();
    (menu?.items || []).forEach((it) => {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    });
    return map;
  }, [menu]);

  if (status === "loading") {
    return (
      <div className="stack" aria-busy="true">
        <div className="rowBetween">
          <div className="stack" style={{ gap: 6 }}>
            <div className="skel" style={{ height: 18, width: 220 }} />
            <div className="skel" style={{ height: 14, width: 320 }} />
          </div>
          <div className="skel" style={{ height: 40, width: 120 }} />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="cardBody">
              <div className="skel" style={{ height: 16, width: "55%" }} />
              <div className="skel" style={{ height: 12, width: "80%", marginTop: 10 }} />
              <div className="skel" style={{ height: 34, width: 140, marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="stack">
        <div className="alert alertError" role="alert">
          {error}
        </div>
        <Link className="btn" to="/">
          Back to restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>{restaurant?.name || "Restaurant"}</h1>
          <div className="small">
            {restaurant?.cuisine?.join(" • ")} • ⭐ {restaurant?.rating?.toFixed?.(1)} • ETA {restaurant?.etaMins}m
          </div>
        </div>
        <Link className="btn" to="/">
          ← Restaurants
        </Link>
      </div>

      {cart.restaurantId && cart.restaurantId !== restaurant?.id ? (
        <div className="alert alertInfo" role="status">
          Your cart currently contains items from <strong>{cart.restaurantName}</strong>. Adding items here will start a new cart.
        </div>
      ) : null}

      {[...byCategory.entries()].map(([cat, items]) => (
        <section key={cat} className="stack" aria-label={cat}>
          <div className="sideSectionTitle" style={{ margin: "6px 2px" }}>
            {cat}
          </div>
          <div className="grid">
            {items.map((it) => (
              <div key={it.id} className="card" style={{ gridColumn: "span 6" }}>
                <div className="cardBody">
                  <div className="cardTitleRow">
                    <h2 className="cardTitle">{it.name}</h2>
                    <span className="badge badgePrimary">{it.price}</span>
                  </div>
                  <p className="cardSub">{it.description}</p>
                  <div className="rowBetween" style={{ marginTop: 12 }}>
                    <div className="small">Popular pick</div>
                    <button
                      className="btn btnSecondary"
                      onClick={() =>
                        addItem(restaurant, {
                          id: it.id,
                          name: it.name,
                          description: it.description,
                          priceCents: it.priceCents,
                        })
                      }
                      aria-label={`Add ${it.name} to cart`}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
