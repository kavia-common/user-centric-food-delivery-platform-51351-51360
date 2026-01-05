import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { formatMoney, formatTime, statusLabel } from "../utils/format";

const LAST_ORDER_KEY = "fd.lastOrderId.v1";

/**
 * PUBLIC_INTERFACE
 * OrderTrackingPage shows status updates for a given order.
 */
export function OrderTrackingPage() {
  /** This is a public function. */
  const { orderId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem(LAST_ORDER_KEY, orderId);
  }, [orderId]);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const load = async () => {
      try {
        const o = await api.getOrder(orderId);
        if (mounted) {
          setOrder(o);
          setStatus("ready");
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load order");
          setStatus("error");
        }
      }
    };

    (async () => {
      setStatus("loading");
      setError("");
      await load();
      timer = setInterval(load, 3500);
    })();

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [orderId]);

  const steps = useMemo(
    () => [
      { key: "PLACED", label: "Placed" },
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "PREPARING", label: "Preparing" },
      { key: "OUT_FOR_DELIVERY", label: "On the way" },
      { key: "DELIVERED", label: "Delivered" },
    ],
    []
  );

  if (status === "loading") {
    return (
      <div className="stack" aria-busy="true">
        <div className="rowBetween">
          <div className="skel" style={{ height: 18, width: 260 }} />
          <div className="skel" style={{ height: 40, width: 140 }} />
        </div>
        <div className="card">
          <div className="cardBody">
            <div className="skel" style={{ height: 14, width: "70%" }} />
            <div className="skel" style={{ height: 14, width: "55%", marginTop: 10 }} />
            <div className="skel" style={{ height: 14, width: "40%", marginTop: 10 }} />
            <div className="skel" style={{ height: 44, marginTop: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="stack">
        <div className="alert alertError" role="alert">
          {error}
        </div>
        <Link className="btn btnPrimary" to="/orders">
          Back to orders
        </Link>
      </div>
    );
  }

  const progress = Math.max(0, Math.min(100, order?.progress || 0));

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Tracking: {order.id}</h1>
          <div className="small">
            {order.restaurantName} • Placed at {formatTime(order.createdAt)} • ETA ~{order.etaMins}m
          </div>
        </div>
        <Link className="btn" to="/orders">
          ← Orders
        </Link>
      </div>

      <div className="card">
        <div className="cardBody">
          <div className="rowBetween">
            <div>
              <div className="small">Current status</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{statusLabel(order.status)}</div>
            </div>
            <span className="badge badgePrimary">{progress}%</span>
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              aria-label="Order progress"
              style={{
                height: 12,
                borderRadius: 999,
                border: "1px solid var(--border)",
                overflow: "hidden",
                background: "rgba(17,24,39,0.06)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
                  transition: "width 600ms ease",
                }}
              />
            </div>
          </div>

          <div className="grid" style={{ marginTop: 14 }}>
            {steps.map((s) => {
              const active = steps.findIndex((x) => x.key === order.status) >= steps.findIndex((x) => x.key === s.key);
              return (
                <div key={s.key} className="card" style={{ gridColumn: "span 12" }}>
                  <div className="cardBody">
                    <div className="rowBetween">
                      <strong>{s.label}</strong>
                      <span className={`badge ${active ? "badgePrimary" : ""}`}>{active ? "Done" : "Pending"}</span>
                    </div>
                    <div className="small" style={{ marginTop: 6 }}>
                      {s.key === "OUT_FOR_DELIVERY"
                        ? "Your courier is heading your way."
                        : s.key === "PREPARING"
                          ? "The kitchen is preparing your meal."
                          : s.key === "CONFIRMED"
                            ? "Restaurant confirmed your order."
                            : s.key === "DELIVERED"
                              ? "Enjoy your meal!"
                              : "Order received."}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="hr" />

          <div className="stack">
            <div className="rowBetween">
              <span className="small">Delivery to</span>
              <strong>{order.delivery?.address || "—"}</strong>
            </div>
            <div className="rowBetween">
              <span className="small">Total paid</span>
              <strong>{formatMoney(order.totals?.totalCents || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardBody">
          <h2 className="cardTitle">Items</h2>
          <div className="stack" style={{ marginTop: 12 }}>
            {(order.items || []).map((it) => (
              <div key={it.id} className="rowBetween">
                <span className="small">
                  {it.qty} × {it.name}
                </span>
                <strong>{formatMoney(it.priceCents * it.qty)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
