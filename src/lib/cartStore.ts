import { create } from "zustand";

export interface CartLine {
  id: string; // CartItem id
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  isOpen: boolean;
  lines: CartLine[];
  openCart: () => void;
  closeCart: () => void;
  setLines: (lines: CartLine[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
}

// Client store mirrors the server Cart/CartItem rows — every mutation here
// should be paired with a call to /api/cart/* so the DB stays the source of truth.
export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  lines: [],
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setLines: (lines) => set({ lines }),
  updateQuantity: (id, quantity) =>
    set((state) => ({ lines: state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)) })),
  removeLine: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
}));
