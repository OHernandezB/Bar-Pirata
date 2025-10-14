import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { id, name, price, qty }
  const [reservation, setReservation] = useState(null); // { name, rut, email, phone }

  const addItem = (item, qty = 1) => {
    if (!item || !item.id) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id, qty) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0), [items]);

  const value = { items, reservation, addItem, removeItem, updateQty, clearCart, setReservation, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  return ctx;
}