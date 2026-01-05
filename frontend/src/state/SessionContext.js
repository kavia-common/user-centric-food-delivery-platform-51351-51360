import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { api } from "../api/client";

const STORAGE_KEY = "fd.session.v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

const SessionContext = createContext(null);

const initialState = {
  status: "idle", // idle | loading | ready | error
  profile: null,
  error: null,
  isAccountOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.payload ? { ...state, ...action.payload } : state;
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_OK":
      return { ...state, status: "ready", profile: action.payload, error: null };
    case "LOAD_ERR":
      return { ...state, status: "error", error: action.payload };
    case "SET_PROFILE":
      return { ...state, profile: action.payload, status: "ready", error: null };
    case "OPEN_ACCOUNT":
      return { ...state, isAccountOpen: true };
    case "CLOSE_ACCOUNT":
      return { ...state, isAccountOpen: false };
    default:
      return state;
  }
}

/**
 * PUBLIC_INTERFACE
 * SessionProvider loads and stores the user profile and UI session state.
 */
export function SessionProvider({ children }) {
  /** This is a public function. */
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) dispatch({ type: "HYDRATE", payload: safeParse(raw, null) });
  }, []);

  useEffect(() => {
    // Persist only safe fields
    const persist = { profile: state.profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [state.profile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      dispatch({ type: "LOAD_START" });
      try {
        const p = await api.getProfile();
        if (mounted) dispatch({ type: "LOAD_OK", payload: p });
      } catch (e) {
        if (mounted) dispatch({ type: "LOAD_ERR", payload: e?.message || "Failed to load profile" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      session: state,
      openAccount: () => dispatch({ type: "OPEN_ACCOUNT" }),
      closeAccount: () => dispatch({ type: "CLOSE_ACCOUNT" }),
      updateProfile: async (patch) => {
        const updated = await api.updateProfile(patch);
        dispatch({ type: "SET_PROFILE", payload: updated });
        return updated;
      },
      setProfileLocal: (p) => dispatch({ type: "SET_PROFILE", payload: p }),
    }),
    [state]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access session state and actions.
 */
export function useSession() {
  /** This is a public function. */
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
