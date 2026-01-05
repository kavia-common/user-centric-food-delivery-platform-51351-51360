/**
 * Mock API used when REACT_APP_API_BASE is empty.
 * This enables the frontend to run fully in isolation.
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const db = {
  restaurants: [
    {
      id: "r-sea-bowl",
      name: "Sea Bowl Kitchen",
      cuisine: ["Healthy", "Bowls"],
      rating: 4.7,
      etaMins: 25,
      priceLevel: "$$",
      description: "Ocean-fresh poke bowls and warm grains with crisp veggies.",
      featured: true,
    },
    {
      id: "r-ember-grill",
      name: "Ember & Grill",
      cuisine: ["Burgers", "Grill"],
      rating: 4.5,
      etaMins: 30,
      priceLevel: "$$",
      description: "Char-grilled favorites with smoky sauces and house fries.",
      featured: false,
    },
    {
      id: "r-saffron-route",
      name: "Saffron Route",
      cuisine: ["Indian", "Curry"],
      rating: 4.6,
      etaMins: 35,
      priceLevel: "$$",
      description: "Aromatic curries, biryani, and fresh-baked naan.",
      featured: true,
    },
    {
      id: "r-amber-sushi",
      name: "Amber Sushi Bar",
      cuisine: ["Sushi", "Japanese"],
      rating: 4.8,
      etaMins: 28,
      priceLevel: "$$$",
      description: "Modern sushi with premium cuts and seasonal specials.",
      featured: false,
    },
  ],
  menus: {
    "r-sea-bowl": [
      {
        id: "m-sea-1",
        name: "Classic Salmon Poke",
        description: "Salmon, cucumber, edamame, avocado, sesame, shoyu.",
        priceCents: 1399,
        category: "Signature Bowls",
      },
      {
        id: "m-sea-2",
        name: "Spicy Tuna Crunch",
        description: "Spicy tuna, tempura crunch, seaweed salad, rice base.",
        priceCents: 1499,
        category: "Signature Bowls",
      },
      {
        id: "m-sea-3",
        name: "Miso Mushroom Broth",
        description: "Umami miso broth with mushrooms and spring onion.",
        priceCents: 699,
        category: "Sides",
      },
    ],
    "r-ember-grill": [
      {
        id: "m-emb-1",
        name: "Smash Burger Deluxe",
        description: "Double patty, cheddar, pickles, ember sauce, brioche.",
        priceCents: 1299,
        category: "Burgers",
      },
      {
        id: "m-emb-2",
        name: "Crispy Chicken Sandwich",
        description: "Buttermilk chicken, slaw, spicy mayo, toasted bun.",
        priceCents: 1199,
        category: "Sandwiches",
      },
      {
        id: "m-emb-3",
        name: "House Fries",
        description: "Golden fries with smoked salt and garlic aioli.",
        priceCents: 499,
        category: "Sides",
      },
    ],
    "r-saffron-route": [
      {
        id: "m-saf-1",
        name: "Butter Chicken",
        description: "Creamy tomato curry, tender chicken, warm spices.",
        priceCents: 1499,
        category: "Curries",
      },
      {
        id: "m-saf-2",
        name: "Paneer Tikka Bowl",
        description: "Grilled paneer, saffron rice, mint chutney, salad.",
        priceCents: 1399,
        category: "Bowls",
      },
      {
        id: "m-saf-3",
        name: "Garlic Naan",
        description: "Fresh naan brushed with garlic butter.",
        priceCents: 349,
        category: "Breads",
      },
    ],
    "r-amber-sushi": [
      {
        id: "m-sus-1",
        name: "Salmon Nigiri (6pc)",
        description: "Silky salmon over seasoned rice.",
        priceCents: 1599,
        category: "Nigiri",
      },
      {
        id: "m-sus-2",
        name: "Ocean Roll",
        description: "Shrimp tempura, avocado, eel sauce drizzle.",
        priceCents: 1699,
        category: "Rolls",
      },
      {
        id: "m-sus-3",
        name: "Miso Soup",
        description: "Classic miso with tofu and wakame.",
        priceCents: 299,
        category: "Sides",
      },
    ],
  },
  profile: {
    id: "u-demo",
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "+1 (555) 010-2020",
    address: "42 Harbor View Ave, Suite 9",
    defaultNotes: "Leave at door if I don't answer.",
  },
  orders: [],
};

function formatOrderStatus(now, createdAtMs) {
  const elapsed = Math.max(0, now - createdAtMs);
  if (elapsed < 60_000) return "PLACED";
  if (elapsed < 6 * 60_000) return "CONFIRMED";
  if (elapsed < 16 * 60_000) return "PREPARING";
  if (elapsed < 28 * 60_000) return "OUT_FOR_DELIVERY";
  return "DELIVERED";
}

function computeProgress(status) {
  const map = {
    PLACED: 10,
    CONFIRMED: 25,
    PREPARING: 55,
    OUT_FOR_DELIVERY: 80,
    DELIVERED: 100,
    CANCELLED: 0,
  };
  return map[status] ?? 0;
}

function toMoney(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

/**
 * PUBLIC_INTERFACE
 * Mock API surface that mimics the real backend contract used by the UI.
 */
export const mockApi = {
  /** This is a public function. */
  async listRestaurants({ q, cuisine } = {}) {
    await wait(450);
    let items = [...db.restaurants];
    if (q) {
      const qq = q.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(qq) || r.description.toLowerCase().includes(qq));
    }
    if (cuisine) {
      const cc = cuisine.toLowerCase();
      items = items.filter((r) => r.cuisine.some((c) => c.toLowerCase() === cc));
    }
    return { items };
  },

  /** This is a public function. */
  async getRestaurant(restaurantId) {
    await wait(250);
    const r = db.restaurants.find((x) => x.id === restaurantId);
    if (!r) throw new Error("Restaurant not found");
    return { ...r };
  },

  /** This is a public function. */
  async listMenu(restaurantId) {
    await wait(450);
    const items = db.menus[restaurantId];
    if (!items) throw new Error("Menu not found");
    const categories = [...new Set(items.map((i) => i.category))];
    return { restaurantId, categories, items: items.map((i) => ({ ...i, price: toMoney(i.priceCents) })) };
  },

  /** This is a public function. */
  async createOrder(orderDraft) {
    await wait(700);
    const id = `o-${Math.random().toString(16).slice(2, 8)}-${Date.now().toString(16).slice(6)}`;
    const createdAt = Date.now();
    const order = {
      id,
      createdAt,
      ...orderDraft,
      status: "PLACED",
      progress: 10,
      etaMins: orderDraft.etaMins || 30,
    };
    db.orders.unshift(order);
    return { ...order };
  },

  /** This is a public function. */
  async getOrder(orderId) {
    await wait(300);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const now = Date.now();
    const status = formatOrderStatus(now, order.createdAt);
    const progress = computeProgress(status);

    return { ...order, status, progress };
  },

  /** This is a public function. */
  async getProfile() {
    await wait(300);
    return { ...db.profile };
  },

  /** This is a public function. */
  async updateProfile(profilePatch) {
    await wait(400);
    db.profile = { ...db.profile, ...profilePatch };
    return { ...db.profile };
  },
};
