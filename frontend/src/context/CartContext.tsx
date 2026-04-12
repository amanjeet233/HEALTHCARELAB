import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export interface CartItem {
  cartItemId: number;
  testId?: number;
  packageId?: number;
  testName?: string;
  packageName?: string;
  name?: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
  finalPrice?: number;
  addedAt?: string;
  isPackage?: boolean;
}

export interface CartResponse {
  cartId?: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  gstAmount?: number;
  couponCode?: string;
  itemCount?: number;
}

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addTest: (testId: number, name: string, price: number, quantity?: number) => Promise<void>;
  addPackage: (packageId: number, name: string, price: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (testId?: number, packageId?: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'medsync_cart_cache';

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeCart = (raw: any): CartResponse | null => {
  if (!raw || typeof raw !== 'object') return null;

  const items: CartItem[] = (Array.isArray(raw.items) ? raw.items : []).map((item: any) => {
    const itemType = String(item?.itemType || '').toUpperCase();
    const isPackage = itemType === 'TEST_PACKAGE' || itemType === 'PACKAGE';
    const itemId = toNumber(item?.itemId ?? item?.testId ?? item?.packageId, 0);
    const quantity = toNumber(item?.quantity, 1);
    const unitPrice = toNumber(item?.unitPrice ?? item?.price, 0);
    const lineTotal = toNumber(item?.lineTotal ?? item?.total ?? item?.finalPrice, unitPrice * quantity);

    return {
      cartItemId: toNumber(item?.cartItemId, Date.now()),
      testId: isPackage ? undefined : itemId,
      packageId: isPackage ? itemId : undefined,
      testName: !isPackage ? (item?.itemName ?? item?.testName) : undefined,
      packageName: isPackage ? (item?.itemName ?? item?.packageName) : undefined,
      name: item?.itemName ?? item?.name,
      quantity,
      price: unitPrice,
      total: lineTotal,
      discount: toNumber(item?.discountAmount ?? item?.discount, 0),
      finalPrice: toNumber(item?.finalPrice, lineTotal),
      addedAt: item?.addedAt,
      isPackage
    };
  });

  return {
    cartId: toNumber(raw.cartId, 0),
    items,
    subtotal: toNumber(raw.subtotal, 0),
    discountAmount: toNumber(raw.discountAmount, 0),
    taxAmount: toNumber(raw.taxAmount, 0),
    totalPrice: toNumber(raw.totalPrice, 0),
    gstAmount: toNumber(raw.taxAmount, 0),
    couponCode: raw.couponCode ?? undefined,
    itemCount: toNumber(raw.itemCount, items.reduce((acc, item) => acc + item.quantity, 0))
  };
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const cachedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedCart) {
      try {
        setCart(normalizeCart(JSON.parse(cachedCart)));
      } catch (e) {
        console.error("Failed to parse cached cart", e);
      }
    }
  }, []);

  const syncToLocalStorage = (cartData: CartResponse | null) => {
    if (cartData) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartData));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/cart');
      const cartData = normalizeCart(response.data.data);
      setCart(cartData);
      syncToLocalStorage(cartData);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Unauthenticated means fallback to pure offline cart behaviour (LocalStorage keeps state)
        // No-op here so we don't wipe localStorage. Wait! LocalStorage MUST represent current user's cart.
        // Actually offline-first means we handle updates purely in JS until checkout if auth fails.
        console.warn("Unauthenticated. Using LocalStorage offline cart.");
      } else {
        setError('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Offline handler for add
  const generateOfflineCartItem = (id: number, type: 'test' | 'package', name: string, price: number, quantity: number): CartItem => {
      return {
          cartItemId: Date.now(), // Fake ID
          testId: type === 'test' ? id : undefined,
          packageId: type === 'package' ? id : undefined,
          name: name,
          testName: type === 'test' ? name : undefined,
          packageName: type === 'package' ? name : undefined,
          quantity: quantity,
          price: price,
          total: price * quantity,
          isPackage: type === 'package'
      };
  };

  const processOfflineAdd = (id: number, type: 'test' | 'package', name: string, price: number, quantity: number) => {
    let currentCart = cart ? { ...cart } : { items: [], subtotal: 0, discountAmount: 0, taxAmount: 0, totalPrice: 0 };
    
    // Check if exists
    const existingIndex = currentCart.items.findIndex(item => 
        (type === 'test' && item.testId === id) || (type === 'package' && item.packageId === id)
    );

    if (existingIndex >= 0) {
        currentCart.items[existingIndex].quantity += quantity;
        currentCart.items[existingIndex].total = currentCart.items[existingIndex].quantity * currentCart.items[existingIndex].price;
    } else {
        currentCart.items.push(generateOfflineCartItem(id, type, name, price, quantity));
    }

    // Recalculate totals
    currentCart.subtotal = currentCart.items.reduce((acc, item) => acc + item.total, 0);
    currentCart.totalPrice = currentCart.subtotal;
    currentCart.itemCount = currentCart.items.reduce((acc, item) => acc + item.quantity, 0);

    setCart(currentCart);
    syncToLocalStorage(currentCart);
    setIsCartOpen(true);
  };

  const addTest = useCallback(async (testId: number, name: string, price: number, quantity: number = 1) => {
    try {
      const response = await api.post('/api/cart/add-test', { testId, quantity });
      const cartData = normalizeCart(response.data.data);
      setCart(cartData);
      syncToLocalStorage(cartData);
      setIsCartOpen(true);
      toast.success(`${name} added to cart!`, { duration: 2000 });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Unauthenticated -> offline cart
        processOfflineAdd(testId, 'test', name, price, quantity);
        toast('Login to save your cart', {
          icon: '🔐',
          duration: 3000,
          style: { background: '#1E293B', color: '#fff' }
        });
      } else if (status === 404) {
        // Test not found in DB -> still add to offline cart with a note
        processOfflineAdd(testId, 'test', name, price, quantity);
        toast('Added to local cart. Test sync pending.', {
          icon: '⚠️',
          duration: 3000,
          style: { background: '#92400E', color: '#fff' }
        });
      } else if (status === 503 || !status) {
        // Backend down -> offline cart fallback, NO error thrown
        processOfflineAdd(testId, 'test', name, price, quantity);
        toast('Server offline. Item saved locally.', {
          icon: '📥',
          duration: 3000,
          style: { background: '#1E293B', color: '#fff' }
        });
      } else {
        // Any other error -> still use offline
        processOfflineAdd(testId, 'test', name, price, quantity);
        toast('Added to local cart.', { duration: 2000 });
      }
    }
  }, [cart]);

  const addPackage = useCallback(async (packageId: number, name: string, price: number) => {
    try {
      const response = await api.post('/api/cart/add-package', { packageId });
      const normalized = normalizeCart(response.data.data);
      setCart(normalized);
      syncToLocalStorage(normalized);
      setIsCartOpen(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        processOfflineAdd(packageId, 'package', name, price, 1);
        toast('Login to save your cart', {
          icon: '🔐',
          duration: 3000,
          style: { background: '#1E293B', color: '#fff' }
        });
      } else if (status === 400) {
        // Package may already be in cart on backend; sync and open cart.
        await fetchCart();
        setIsCartOpen(true);
      } else if (status === 404) {
        processOfflineAdd(packageId, 'package', name, price, 1);
        toast('Added to local cart. Package sync pending.', {
          icon: '⚠️',
          duration: 3000,
          style: { background: '#92400E', color: '#fff' }
        });
      } else if (status === 503 || !status) {
        processOfflineAdd(packageId, 'package', name, price, 1);
        toast('Server offline. Package saved locally.', {
          icon: '📥', duration: 3000,
          style: { background: '#1E293B', color: '#fff' }
        });
      } else {
        processOfflineAdd(packageId, 'package', name, price, 1);
        toast('Added to local cart.', { duration: 2000 });
      }
    }
  }, [cart, fetchCart]);

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      const response = await api.delete(`/api/cart/item/${cartItemId}`);
      const normalized = normalizeCart(response.data.data);
      setCart(normalized);
      syncToLocalStorage(normalized);
    } catch (err: any) {
      // Offline fallback
      if (cart) {
          const newCart = { ...cart };
          newCart.items = newCart.items.filter(item => item.cartItemId !== cartItemId);
          newCart.subtotal = newCart.items.reduce((acc, item) => acc + item.total, 0);
          newCart.totalPrice = newCart.subtotal;
          newCart.itemCount = newCart.items.reduce((acc, item) => acc + item.quantity, 0);
          setCart(newCart);
          syncToLocalStorage(newCart);
      }
    }
  }, [cart]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      const response = await api.put(`/api/cart/item/${cartItemId}`, { quantity });
      const normalized = normalizeCart(response.data.data);
      setCart(normalized);
      syncToLocalStorage(normalized);
    } catch (err: any) {
         if (cart) {
          const newCart = { ...cart };
          const itemIndex = newCart.items.findIndex(item => item.cartItemId === cartItemId);
          if (itemIndex >= 0) {
              newCart.items[itemIndex].quantity = quantity;
              newCart.items[itemIndex].total = quantity * newCart.items[itemIndex].price;
          }
          newCart.subtotal = newCart.items.reduce((acc, item) => acc + item.total, 0);
          newCart.totalPrice = newCart.subtotal;
          newCart.itemCount = newCart.items.reduce((acc, item) => acc + item.quantity, 0);
          setCart(newCart);
          syncToLocalStorage(newCart);
      }
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/api/cart/clear');
      setCart(null);
      syncToLocalStorage(null);
    } catch (err: any) {
      setCart(null);
      syncToLocalStorage(null);
    }
  }, []);

  const isInCart = useCallback((testId?: number, packageId?: number): boolean => {
    if (!cart?.items) return false;
    return cart.items.some(item =>
      (testId !== undefined && testId !== null && item.testId === testId) ||
      (packageId !== undefined && packageId !== null && item.packageId === packageId)
    );
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, isCartOpen, setIsCartOpen, fetchCart, addTest, addPackage, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
