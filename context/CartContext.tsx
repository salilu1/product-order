"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type CartContextType = {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  /**
   * Fetch cart ONLY for logged-in non-admin users
   */
  const refreshCart = async () => {
    if (!isAuthenticated || isAdmin) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        credentials: "include",
      });

      if (!res.ok) return; // silent fail

      const data = await res.json();

      setCartItems(
        (data.items ?? []).map((i: any) => ({
          productId: i.productId,
          name: i.product.name,
          price: Number(i.price),
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
        }))
      );
    } catch {
      // intentionally silent
    }
  };

  /**
   * React to auth changes
   * - Login → fetch cart (customer only)
   * - Logout / Admin login → clear cart
   */
  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setCartItems([]);
      return;
    }

    refreshCart();
  }, [isAuthenticated, isAdmin]);

  const addToCart = async (item: CartItem) => {
    if (!isAuthenticated || isAdmin) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.productId,
        quantity: item.quantity,
      }),
    });

    if (res.ok) await refreshCart();
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!isAuthenticated || isAdmin) return;

    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (res.ok) await refreshCart();
  };

  const removeCartItem = async (productId: string) => {
    if (!isAuthenticated || isAdmin) return;

    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.ok) await refreshCart();
  };

  const clearCart = async () => {
    if (!isAuthenticated || isAdmin) {
      setCartItems([]);
      return;
    }

    const res = await fetch("/api/cart/clear", { method: "POST" });

    if (res.ok) setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
