"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type CartContextType = {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>; // expose for internal updates
  addToCart: (item: CartItem) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>; // live refresh function
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Fetch cart from backend
  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
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
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");

      await refreshCart();
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart item");

      await refreshCart();
    } catch (error) {
      console.error("Update cart item error:", error);
    }
  };

  const removeCartItem = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove cart item");

      await refreshCart();
    } catch (error) {
      console.error("Remove cart item error:", error);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart/clear", { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear cart");
      setCartItems([]);
    } catch (error) {
      console.error("Clear cart error:", error);
    }
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
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
