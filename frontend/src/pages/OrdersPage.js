import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Note: In mock mode, we don't have a listOrders endpoint.
 * This page provides guidance and deep-links to last order if stored locally.
 */

const STORAGE_KEY = "fd.lastOrderId.v1";

/**
 * PUBLIC_INTERFACE
 * OrdersPage is a lightweight hub for order tracking.
 */
export function OrdersPage() {
  /** This is a public function. */
  const [lastOrderId, setLastOrderId] = useState("");

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY) || "";
    setLastOrderId(v);
  }, []);

  return (
    <div className="stack">
      <div className="rowBetween">
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>Order tracking</h1>
          <div className="small">Track your delivery progress in real-time (mocked updates here).</div>
        </div>
        <Link className="btn btnPrimary" to="/">
          Browse restaurants
        </Link>
      </div>

      <div className="card">
        <div className="cardBody">
          <h2 className="cardTitle">Track an order</h2>
          <p className="cardSub">
            After placing an order, you will be redirected to a tracking page. You can also paste an order ID into the URL:
            <span className="badge" style={{ marginLeft: 8 }}>/orders/&lt;orderId&gt;</span>
          </p>

          {lastOrderId ? (
            <div className="rowBetween" style={{ marginTop: 12 }}>
              <div className="small">Last order:</div>
              <Link className="btn btnSecondary" to={`/orders/${lastOrderId}`}>
                Open {lastOrderId}
              </Link>
            </div>
          ) : (
            <div className="emptyState" role="status" style={{ marginTop: 12 }}>
              No recent order ID found. Place an order to see tracking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
