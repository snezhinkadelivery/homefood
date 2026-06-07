'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CartItem, MenuItem } from '@/types';
import { DELIVERY_FEE, FREE_DELIVERY_MIN } from '@/lib/supabase';

const STORAGE_KEY = 'homefood_cart';
const EVENT = 'homefood_cart_change';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
    const onChange = () => setItems(readCart());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    const current = readCart();
    const existing = current.find((c) => c.id === item.id);
    let next: CartItem[];
    if (existing) {
      next = current.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
      );
    } else {
      next = [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          quantity: 1,
        },
      ];
    }
    writeCart(next);
  }, []);

  const updateQuantity = useCallback((id: number, qty: number) => {
    const current = readCart();
    const next =
      qty <= 0
        ? current.filter((c) => c.id !== id)
        : current.map((c) => (c.id === id ? { ...c, quantity: qty } : c));
    writeCart(next);
  }, []);

  const removeItem = useCallback((id: number) => {
    writeCart(readCart().filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => writeCart([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return {
    items,
    hydrated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    total,
  };
}
