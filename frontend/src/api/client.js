/**
 * Minimal API client for the food delivery frontend.
 * Uses REACT_APP_API_BASE when present; otherwise falls back to local mock data.
 */

import { mockApi } from "./mockApi";

/**
 * Prefer REACT_APP_API_BASE (requested), fall back to REACT_APP_BACKEND_URL if provided.
 * If neither is set, the app runs in mock mode.
 */
const API_BASE = (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "").trim();

/**
 * PUBLIC_INTERFACE
 * Returns true when the app is configured to use a real backend API.
 */
export function isApiConfigured() {
  /** This is a public function. */
  return Boolean(API_BASE);
}

async function httpJson(path, { method = "GET", body, signal } = {}) {
  const url = `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  const payload = contentType.includes("application/json") && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload && payload.message ? payload.message : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

/**
 * PUBLIC_INTERFACE
 * Food delivery API surface used by the UI.
 * If REACT_APP_API_BASE is empty, functions use local mock data.
 */
export const api = {
  /** This is a public function. */
  async listRestaurants({ q, cuisine } = {}) {
    if (!isApiConfigured()) return mockApi.listRestaurants({ q, cuisine });
    return httpJson(`/restaurants?q=${encodeURIComponent(q || "")}&cuisine=${encodeURIComponent(cuisine || "")}`);
  },

  /** This is a public function. */
  async getRestaurant(restaurantId) {
    if (!isApiConfigured()) return mockApi.getRestaurant(restaurantId);
    return httpJson(`/restaurants/${encodeURIComponent(restaurantId)}`);
  },

  /** This is a public function. */
  async listMenu(restaurantId) {
    if (!isApiConfigured()) return mockApi.listMenu(restaurantId);
    return httpJson(`/restaurants/${encodeURIComponent(restaurantId)}/menu`);
  },

  /** This is a public function. */
  async createOrder(orderDraft) {
    if (!isApiConfigured()) return mockApi.createOrder(orderDraft);
    return httpJson(`/orders`, { method: "POST", body: orderDraft });
  },

  /** This is a public function. */
  async getOrder(orderId) {
    if (!isApiConfigured()) return mockApi.getOrder(orderId);
    return httpJson(`/orders/${encodeURIComponent(orderId)}`);
  },

  /** This is a public function. */
  async getProfile() {
    if (!isApiConfigured()) return mockApi.getProfile();
    return httpJson(`/me`);
  },

  /** This is a public function. */
  async updateProfile(profilePatch) {
    if (!isApiConfigured()) return mockApi.updateProfile(profilePatch);
    return httpJson(`/me`, { method: "PUT", body: profilePatch });
  },
};
