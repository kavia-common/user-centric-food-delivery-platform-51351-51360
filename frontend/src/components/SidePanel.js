import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * SidePanel renders a right-side modal panel with an accessible dialog and focus management.
 */
export function SidePanel({ isOpen, title, description, onClose, children, footer }) {
  /** This is a public function. */
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    lastActiveRef.current = document.activeElement;
    // Move focus inside the panel
    setTimeout(() => {
      panelRef.current?.querySelector?.('[data-autofocus="true"]')?.focus?.();
      panelRef.current?.focus?.();
    }, 0);

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      // basic focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter((x) => x.offsetParent !== null);
        if (list.length === 0) return;

        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastActiveRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // close when clicking outside
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="panelHeader">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="btn btnIcon btnGhost" onClick={onClose} aria-label="Close panel" data-autofocus="true">
            ✕
          </button>
        </div>

        <div className="panelBody">{children}</div>

        {footer ? <div className="panelFooter">{footer}</div> : null}
      </div>
    </div>
  );
}
