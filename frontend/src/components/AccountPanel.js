import React, { useMemo, useState } from "react";
import { SidePanel } from "./SidePanel";
import { useSession } from "../state/SessionContext";

/**
 * PUBLIC_INTERFACE
 * AccountPanel allows viewing/updating user profile details.
 */
export function AccountPanel() {
  /** This is a public function. */
  const { session, closeAccount, updateProfile } = useSession();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(null);
  const [err, setErr] = useState("");

  const model = useMemo(() => local || session.profile || {}, [local, session.profile]);

  async function onSave() {
    setSaving(true);
    setErr("");
    try {
      await updateProfile({
        name: model.name || "",
        email: model.email || "",
        phone: model.phone || "",
        address: model.address || "",
        defaultNotes: model.defaultNotes || "",
      });
      closeAccount();
    } catch (e) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <>
      <button className="btn btnGhost" onClick={closeAccount}>
        Close
      </button>
      <button className="btn btnPrimary" onClick={onSave} disabled={saving || session.status !== "ready"}>
        {saving ? "Saving..." : "Save"}
      </button>
    </>
  );

  return (
    <SidePanel
      isOpen={session.isAccountOpen}
      onClose={closeAccount}
      title="Account"
      description="Manage your profile and delivery preferences."
      footer={footer}
    >
      {session.status === "loading" ? (
        <div className="stack" aria-busy="true">
          <div className="skel" style={{ height: 18, width: "55%" }} />
          <div className="skel" style={{ height: 44 }} />
          <div className="skel" style={{ height: 44 }} />
          <div className="skel" style={{ height: 44 }} />
          <div className="skel" style={{ height: 90 }} />
        </div>
      ) : session.status === "error" ? (
        <div className="alert alertError" role="alert">
          Could not load your profile: {session.error}
        </div>
      ) : (
        <div className="stack">
          {err ? (
            <div className="alert alertError" role="alert">
              {err}
            </div>
          ) : null}

          <div className="inputRow inputRowTwo">
            <div>
              <label className="small" htmlFor="acc-name">Name</label>
              <input
                id="acc-name"
                className="input"
                value={model.name || ""}
                onChange={(e) => setLocal({ ...model, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="small" htmlFor="acc-email">Email</label>
              <input
                id="acc-email"
                className="input"
                value={model.email || ""}
                onChange={(e) => setLocal({ ...model, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="inputRow inputRowTwo">
            <div>
              <label className="small" htmlFor="acc-phone">Phone</label>
              <input
                id="acc-phone"
                className="input"
                value={model.phone || ""}
                onChange={(e) => setLocal({ ...model, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="small" htmlFor="acc-address">Delivery address</label>
              <input
                id="acc-address"
                className="input"
                value={model.address || ""}
                onChange={(e) => setLocal({ ...model, address: e.target.value })}
                placeholder="Street, unit, city"
              />
            </div>
          </div>

          <div>
            <label className="small" htmlFor="acc-notes">Default delivery notes</label>
            <textarea
              id="acc-notes"
              className="input"
              rows={4}
              value={model.defaultNotes || ""}
              onChange={(e) => setLocal({ ...model, defaultNotes: e.target.value })}
              placeholder="Example: ring the doorbell"
            />
            <div className="helpText" style={{ marginTop: 6 }}>
              These notes will be included at checkout unless you override them.
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
