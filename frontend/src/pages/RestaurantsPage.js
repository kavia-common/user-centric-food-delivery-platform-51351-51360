import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

/**
 * PUBLIC_INTERFACE
 * RestaurantsPage lists restaurants and allows browsing into a menu.
 */
export function RestaurantsPage({ query }) {
  /** This is a public function. */
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [restaurants, setRestaurants] = useState([]);

  const cuisines = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => r.cuisine.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [restaurants]);

  const [cuisine, setCuisine] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus("loading");
      setError("");
      try {
        const res = await api.listRestaurants({ q: query, cuisine });
        if (mounted) {
          setRestaurants(res.items || []);
          setStatus("ready");
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load restaurants");
          setStatus("error");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [query, cuisine]);

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Restaurants</h1>
          <div className="small">Browse curated spots and order in minutes.</div>
        </div>

        <div className="row" style={{ minWidth: 240 }}>
          <select
            className="input"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            aria-label="Filter by cuisine"
          >
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === "loading" ? (
        <div className="grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ gridColumn: "span 6" }}>
              <div className="cardBody">
                <div className="skel" style={{ height: 18, width: "60%" }} />
                <div className="skel" style={{ height: 14, width: "80%", marginTop: 10 }} />
                <div className="skel" style={{ height: 14, width: "55%", marginTop: 8 }} />
                <div className="skel" style={{ height: 34, width: 120, marginTop: 12 }} />
              </div>
            </div>
          ))}
        </div>
      ) : status === "error" ? (
        <div className="alert alertError" role="alert">
          {error}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="emptyState" role="status">
          No restaurants match your search. Try a different keyword.
        </div>
      ) : (
        <div className="grid">
          {restaurants.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="card" style={{ gridColumn: "span 6" }}>
              <div className="cardBody">
                <div className="cardTitleRow">
                  <h2 className="cardTitle">{r.name}</h2>
                  <span className="badge">{r.priceLevel}</span>
                </div>
                <p className="cardSub">{r.description}</p>
                <div className="pillRow">
                  <span className="badge badgePrimary">⭐ {r.rating.toFixed(1)}</span>
                  <span className="badge">ETA {r.etaMins}m</span>
                  {r.cuisine.slice(0, 2).map((c) => (
                    <span key={c} className="badge">
                      {c}
                    </span>
                  ))}
                  {r.featured ? <span className="badge badgePrimary">Featured</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
