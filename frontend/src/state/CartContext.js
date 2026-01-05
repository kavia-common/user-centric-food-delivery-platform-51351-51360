import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "fd.cart.v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function sum(items) {
  return items.reduce((acc, x) => acc + x, 0);
}

function calcTotals(items) {
  const subtotalCents = sum(items.map((i) => i.priceCents * i.qty));
  const deliveryCents = subtotalCents > 0 ? 299 : 0;
  const taxCents = Math.round(subtotalCents * 0.0825);
  const totalCents = subtotalCents + deliveryCents + taxCents;
  return { subtotalCents, deliveryCents, taxCents, totalCents };
}

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      return action.payload || state;
    }
    case "ADD_ITEM": {
      const { restaurantId, restaurantName, item } = action.payload;
      // Enforce single-restaurant cart for simpler UX
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return {
          ...state,
          restaurantId,
          restaurantName,
          items: [{ ...item, qty: 1 }],
        };
      }

      const existing = state.items.find((x) => x.id === item.id);
      const items = existing
        ? state.items.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
        : [...state.items, { ...item, qty: 1 }];

      return { ...state, restaurantId, restaurantName, items };
    }
    case "SET_QTY": {
      const { itemId, qty } = action.payload;
      const items = state.items
        .map((x) => (x.id === itemId ? { ...x, qty: Math.max(0, qty) } : x))
        .filter((x) => x.qty > 0);
      const cleared = items.length === 0;
      return cleared ? { restaurantId: null, restaurantName: null, items: [] } : { ...state, items };
    }
    case "REMOVE_ITEM": {
      const { itemId } = action.payload;
      const items = state.items.filter((x) => x.id !== itemId);
      const cleared = items.length === 0;
      return cleared ? { restaurantId: null, restaurantName: null, items: [] } : { ...state, items };
    }
    case "CLEAR": {
      return { restaurantId: null, restaurantName: null, items: [] };
    }
    default:
      return state;
  }
}

/**
 * PUBLIC_INTERFACE
 * CartProvider stores cart contents and exposes actions to mutate the cart.
 */
export function CartProvider({ children }) {
  /** This is a public function. */
  const [state, dispatch] = useReducer(reducer, { restaurantId: null, restaurantName: null, items: [] });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      dispatch({ type: "HYDRATE", payload: safeParse(raw, null) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => calcTotals(state.items), [state.items]);
  const itemCount = useMemo(() => sum(state.items.map((i) => i.qty)), [state.items]);

  const value = useMemo(
    () => ({
      cart: state,
      totals,
      itemCount,
      addItem: (restaurant, item) =>
        dispatch({
          type: "ADD_ITEM",
          payload: { restaurantId: restaurant.id, restaurantName: restaurant.name, item },
        }),
      setQty: (itemId, qty) => dispatch({ type: "SET_QTY", payload: { itemId, qty } }),
      removeItem: (itemId) => dispatch({ type: "REMOVE_ITEM", payload: { itemId } }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state, totals, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access cart state and actions.
 */
export function useCart() {
  /** This is a public function. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
