import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import "./components/a11y.css";

import { CartProvider } from "./state/CartContext";
import { SessionProvider } from "./state/SessionContext";

import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { CartPanel } from "./components/CartPanel";
import { AccountPanel } from "./components/AccountPanel";

import { RestaurantsPage } from "./pages/RestaurantsPage";
import { RestaurantMenuPage } from "./pages/RestaurantMenuPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function useQuerySync(setQuery) {
  const location = useLocation();
  useEffect(() => {
    // Keep UX predictable: clear search when leaving restaurant listing
    if (location.pathname !== "/") {
      setQuery("");
    }
  }, [location.pathname, setQuery]);
}

/**
 * PUBLIC_INTERFACE
 * App renders the complete food delivery frontend:
 * - responsive top nav + desktop sidebar + central content
 * - restaurant browsing + menu view
 * - cart and account side panels
 * - checkout + order tracking
 * - API client with mock fallback when REACT_APP_API_BASE is empty
 */
function App() {
  /** This is a public function. */
  const [theme, setTheme] = useState("light");
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** This is a public function. */
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const navProps = useMemo(
    () => ({
      theme,
      onToggleTheme: toggleTheme,
      searchValue: search,
      onSearchChange: setSearch,
      onOpenCart: () => setIsCartOpen(true),
    }),
    [theme, search]
  );

  return (
    <div className="App">
      <SessionProvider>
        <CartProvider>
          <BrowserRouter>
            <AppFrame
              navProps={navProps}
              isCartOpen={isCartOpen}
              onCloseCart={() => setIsCartOpen(false)}
              query={search}
              setQuery={setSearch}
            />
          </BrowserRouter>
        </CartProvider>
      </SessionProvider>
    </div>
  );
}

function AppFrame({ navProps, isCartOpen, onCloseCart, query, setQuery }) {
  const location = useLocation();
  useQuerySync(setQuery);

  const mainAria = useMemo(() => {
    if (location.pathname.startsWith("/restaurants/")) return "Restaurant menu";
    if (location.pathname === "/checkout") return "Checkout";
    if (location.pathname.startsWith("/orders/")) return "Order tracking";
    if (location.pathname === "/orders") return "Orders";
    return "Restaurants";
  }, [location.pathname]);

  return (
    <div className="appShell">
      <TopNav {...navProps} />

      <div className="layout">
        <Sidebar />
        <main className="main" aria-label={mainAria}>
          <Routes>
            <Route path="/" element={<RestaurantsPage query={query} />} />
            <Route path="/restaurants/:restaurantId" element={<RestaurantMenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <CartPanel isOpen={isCartOpen} onClose={onCloseCart} />
      <AccountPanel />
    </div>
  );
}

export default App;
