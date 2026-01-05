import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * NotFoundPage is shown when route doesn't match.
 */
export function NotFoundPage() {
  /** This is a public function. */
  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 18 }}>Page not found</h1>
      <div className="emptyState" role="status">
        The page you’re looking for doesn’t exist. Use navigation to get back on track.
      </div>
      <Link className="btn btnPrimary" to="/">
        Go to restaurants
      </Link>
    </div>
  );
}
