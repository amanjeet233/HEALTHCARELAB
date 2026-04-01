# 🎨 Frontend Architecture & Component Design - Part 3

**Date:** 2026-03-24
**Phase:** Phase 5.2 - Payment Integration (Backend Ready, Frontend Incomplete)
**Build Status:** ✅ Clean Build, ⚠️ Missing 13 Pages/Components
**Architecture Score:** 8.2/10 (Very Good - Needs Order/Payment Pages)

---

## 📑 Table of Contents

1. [Frontend Architecture Overview](#frontend-architecture-overview)
2. [Project Structure & Organization](#project-structure--organization)
3. [Component Hierarchy](#component-hierarchy)
4. [State Management Strategy](#state-management-strategy)
5. [API Integration Layer](#api-integration-layer)
6. [Custom Hooks Deep Dive](#custom-hooks-deep-dive)
7. [Routing & Navigation](#routing--navigation)
8. [React Component Patterns](#react-component-patterns)
9. [TypeScript Implementation](#typescript-implementation)
10. [Styling & CSS Strategy](#styling--css-strategy)
11. [Authentication Flow](#authentication-flow)
12. [Error Handling & Loading States](#error-handling--loading-states)
13. [Performance Optimization](#performance-optimization-strategies)
14. [Testing Strategy](#testing-strategy)
15. [Component Library Reference](#component-library-reference)

---

## Frontend Architecture Overview

### Technology Stack
```
Framework           → React 18.x (with Hooks)
Language            → TypeScript
Build Tool          → Vite
State Management    → React Context API + Custom Hooks
Routing             → React Router v6
HTTP Client         → Axios
UI Components       → React + Custom CSS
CSS Methodology     → BEM (Block Element Modifier)
Animations          → Framer Motion / CSS Transitions
Icons               → React Icons
Form Handling       → React Hook Form (planned)
Validation          → Zod / Yup (planned)
Testing             → Vitest + React Testing Library
Package Manager     → npm or yarn
```

### 4-Layer Frontend Architecture
```
┌──────────────────────────────────────────────┐
│   PRESENTATION LAYER                         │
│   (Pages & Containers - User Interface)      │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│   COMPONENT LAYER                            │
│   (Reusable Components - Building Blocks)    │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│   STATE/HOOKS LAYER                          │
│   (Custom Hooks & Context - Business Logic)  │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│   API/SERVICE LAYER                          │
│   (HTTP Client & API Services)               │
└──────────────────────────────────────────────┘
```

---

## Project Structure & Organization

### Directory Organization

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx                    ✅ Complete
│   │   ├── TestListingPage.tsx                ✅ Complete
│   │   ├── PackagesPage.tsx                   ✅ Complete
│   │   ├── BookingPage.tsx                    ✅ Complete
│   │   ├── CartPage.tsx                       ✅ Complete
│   │   ├── MyBookingsPage.tsx                 ✅ Complete
│   │   ├── ProfilePage.tsx                    ✅ Complete
│   │   ├── ReportsPage.tsx                    ✅ Complete
│   │   ├── NotificationCenter.tsx             ✅ Complete
│   │   ├── OrderCheckoutPage.tsx              ❌ MISSING
│   │   ├── MyOrdersPage.tsx                   ❌ MISSING
│   │   ├── OrderDetailsPage.tsx               ❌ MISSING
│   │   ├── PaymentPage.tsx                    ❌ MISSING
│   │   ├── PaymentStatusPage.tsx              ❌ MISSING
│   │   └── admin/
│   │       ├── AdminDashboard.tsx             ✅ Complete
│   │       ├── UserManagementPage.tsx         ✅ Complete
│   │       └── OrderManagementPage.tsx        ❌ MISSING
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                     ✅ Complete
│   │   │   ├── Footer.tsx                     ✅ Complete
│   │   │   ├── Sidebar.tsx                    ✅ Complete
│   │   │   └── AnimatedRoutes.tsx             ✅ Complete
│   │   │
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx             ✅ Complete
│   │   │   ├── ErrorBoundary.tsx              ✅ Complete
│   │   │   ├── Card.tsx                       ✅ Complete
│   │   │   ├── Modal.tsx                      ✅ Complete
│   │   │   ├── StatusBadge.tsx                ✅ Complete
│   │   │   ├── ConfirmationModal.tsx          ✅ Complete
│   │   │   ├── PageTransition.tsx             ✅ Complete
│   │   │   └── AppModal.tsx                   ✅ Complete
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx                  ✅ Complete
│   │   │   ├── ForgotPasswordModal.tsx        ✅ Complete
│   │   │   ├── ResetPasswordModal.tsx         ✅ Complete
│   │   │   └── ProtectedRoute.tsx             ✅ Complete
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx                   ✅ Complete
│   │   │   ├── CartSummary.tsx                ✅ Complete
│   │   │   └── CouponApplier.tsx              ✅ Complete
│   │   │
│   │   ├── order/
│   │   │   ├── OrderCheckoutForm.tsx          ❌ MISSING
│   │   │   ├── OrderConfirmation.tsx          ❌ MISSING
│   │   │   ├── OrderTimeline.tsx              ❌ MISSING
│   │   │   ├── OrderItemCard.tsx              ❌ MISSING
│   │   │   └── OrderFilters.tsx               ❌ MISSING
│   │   │
│   │   ├── payment/
│   │   │   ├── RazorpayButton.tsx             ❌ MISSING
│   │   │   ├── PaymentForm.tsx                ❌ MISSING
│   │   │   ├── PaymentStatus.tsx              ❌ MISSING
│   │   │   └── PaymentModal.tsx               ❌ MISSING
│   │   │
│   │   ├── doctor/
│   │   │   ├── ExpertsSection.tsx             ✅ Complete
│   │   │   ├── DoctorAvailabilitySection.tsx  ✅ Complete
│   │   │   └── ConsultationBookingModal.tsx   ✅ Complete
│   │   │
│   │   ├── 3d/
│   │   │   ├── DNAHelix3D.tsx                 ✅ Complete
│   │   │   ├── MedicalIcons3D.tsx             ✅ Complete
│   │   │   └── Microscope3D.tsx               ✅ Complete
│   │   │
│   │   └── interactive/
│   │       ├── HealthQuiz.tsx                 ✅ Complete
│   │       └── PulseSupport.tsx               ✅ Complete
│   │
│   ├── hooks/
│   │   ├── useCart.ts                         ✅ Complete
│   │   ├── useAuth.ts                         ✅ Complete
│   │   ├── useBooking.ts                      ✅ Complete
│   │   ├── useOrders.ts                       ❌ MISSING
│   │   ├── usePayment.ts                      ❌ MISSING
│   │   └── useAPI.ts                          ✅ Generic API hook
│   │
│   ├── context/
│   │   ├── AuthContext.tsx                    ✅ Complete
│   │   ├── CartContext.tsx                    ✅ Complete (might not be used)
│   │   └── NotificationContext.tsx            ✅ Complete
│   │
│   ├── services/
│   │   ├── api.ts                             ✅ Axios instance
│   │   ├── authService.ts                     ✅ Auth APIs
│   │   ├── cartService.ts                     ✅ Cart APIs
│   │   ├── bookingService.ts                  ✅ Booking APIs
│   │   ├── orderService.ts                    ❌ MISSING
│   │   ├── paymentService.ts                  ❌ MISSING
│   │   └── razorpayService.ts                 ❌ MISSING
│   │
│   ├── types/
│   │   ├── index.ts                           ✅ TypeScript types
│   │   ├── api.ts                             ✅ API response types
│   │   ├── entities.ts                        ✅ Entity types
│   │   └── forms.ts                           ✅ Form types
│   │
│   ├── utils/
│   │   ├── constants.ts                       ✅ App constants
│   │   ├── formatters.ts                      ✅ Data formatting
│   │   └── validators.ts                      ✅ Form validation
│   │
│   ├── styles/
│   │   ├── globals.css                        ✅ Global styles
│   │   ├── variables.css                      ✅ CSS variables
│   │   └── animations.css                     ✅ Animations
│   │
│   ├── App.tsx                                ✅ Main app component
│   ├── main.tsx                               ✅ Entry point
│   └── index.css                              ✅ Root styles
│
├── public/
│   ├── favicon.svg
│   ├── logo.png
│   └── ...
│
├── package.json                               ✅ Dependencies
├── vite.config.ts                             ✅ Build config
├── tsconfig.json                              ✅ TypeScript config
└── .env.example                               ✅ Environment vars
```

---

## Component Hierarchy

### Page Component Flow

```
App.tsx
├── Layout (Header + Sidebar)
│   ├── Header.tsx
│   │   ├── Logo
│   │   ├── Navigation
│   │   ├── Cart Icon (Badge)
│   │   └── User Menu
│   │
│   ├── Sidebar.tsx
│   │   ├── Navigation Links
│   │   └── Quick Actions
│   │
│   └── AnimatedRoutes.tsx
│       ├── LandingPage
│       │   ├── HeroSection
│       │   ├── FeatureCards
│       │   ├── ExpertsSection
│       │   └── CTASection
│       │
│       ├── TestListingPage
│       │   ├── SearchBar
│       │   ├── CategoryBar
│       │   ├── FilterPanel
│       │   └── TestGrid
│       │       └── TestCard (Reusable)
│       │
│       ├── CartPage
│       │   ├── CartItemsList
│       │   │   └── CartItem (Reusable)
│       │   ├── CartSummary
│       │   ├── CouponApplier
│       │   └── CheckoutButton ← Needs connection
│       │
│       ├── OrderCheckoutPage ❌ MISSING
│       │   ├── OrderForm
│       │   ├── OrderReview
│       │   └── SubmitButton
│       │
│       ├── PaymentPage ❌ MISSING
│       │   ├── OrderSummary
│       │   ├── PaymentMethod
│       │   ├── RazorpayForm
│       │   └── ConfirmButton
│       │
│       ├── MyOrdersPage ❌ MISSING
│       │   ├── OrderFilters
│       │   ├── OrdersList
│       │   │   └── OrderCard (Reusable)
│       │   └── Pagination
│       │
│       ├── OrderDetailsPage ❌ MISSING
│       │   ├── OrderHeader
│       │   ├── OrderItems
│       │   ├── OrderTimeline
│       │   └── OrderActions
│       │
│       ├── PaymentStatusPage ❌ MISSING
│       │   ├── ResultIcon (Success/Failure)
│       │   ├── ResultMessage
│       │   ├── OrderDetails
│       │   └── NextStepsButton
│       │
│       └── AdminDashboard ✅
│           └── OrderManagementPage ❌ MISSING
│               ├── OrderTable
│               ├── StatusUpdater
│               └── Filters
│
│   └── Footer.tsx
│
└── Modals (Overlay)
    ├── AuthModal
    ├── ConfirmationModal
    └── PaymentModal ❌ MISSING
```

---

## State Management Strategy

### Context API Approach
```typescript
// AuthContext.tsx - Manages authentication state
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
}

// CartContext.tsx - Manages shopping cart state
interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, qty: number) => void;
}

// NotificationContext.tsx - Global notifications
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

### Custom Hooks for Business Logic
```typescript
// useCart.ts - Cart operations
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => { /* ... */ }, []);
  const addTest = useCallback(async (testId: number) => { /* ... */ }, []);
  const removeItem = useCallback(async (itemId: number) => { /* ... */ }, []);
  const updateQuantity = useCallback(async (itemId: number, qty: number) => { /* ... */ }, []);
  const applyCoupon = useCallback(async (code: string) => { /* ... */ }, []);

  return { cart, loading, error, fetchCart, addTest, removeItem, updateQuantity, applyCoupon };
}

// useOrders.ts - Order management (MISSING)
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (page: number = 0) => { /* ... */ }, []);
  const createOrder = useCallback(async (cartId: number) => { /* ... */ }, []);
  const getOrderDetails = useCallback(async (orderId: number) => { /* ... */ }, []);
  const cancelOrder = useCallback(async (orderId: number) => { /* ... */ }, []);

  return { orders, loading, currentOrder, fetchOrders, createOrder, getOrderDetails, cancelOrder };
}

// usePayment.ts - Payment operations (MISSING)
export function usePayment() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(async (orderId: number, email: string, phone: string) => { /* ... */ }, []);
  const verifyPaymentStatus = useCallback(async (orderId: number) => { /* ... */ }, []);
  const handlePaymentSuccess = useCallback(async (razorpayResponse: any) => { /* ... */ }, []);

  return { paymentStatus, loading, initiatePayment, verifyPaymentStatus, handlePaymentSuccess };
}
```

### State Flow Diagram
```
User Action (Click Add to Cart)
    ↓
Component (TestCard.tsx)
    ↓
Hook (useCart.addTest())
    ↓
Service (cartService.addTest())
    ↓
API (POST /api/cart/add-test)
    ↓
Backend (CartController)
    ↓
Response (CartResponse)
    ↓
Service (Parse response)
    ↓
Hook (Update state)
    ↓
Context (Update cart)
    ↓
Component (Re-render with new cart)
    ↓
UI Update (Show success toast)
```

---

## API Integration Layer

### Axios Configuration

**File:** `src/services/api.ts`

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuth } from '@/hooks/useAuth';

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh & errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### API Service Layer

**File:** `src/services/orderService.ts` (MISSING - Need to Create)

```typescript
import api from './api';
import { Order, OrderRequest, OrderResponse } from '@/types';

class OrderService {
  // Create order from cart
  async createOrder(request: OrderRequest): Promise<OrderResponse> {
    const response = await api.post<any>('/orders/create', request);
    return response.data.data;
  }

  // Get user's orders (paginated)
  async getUserOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    direction: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ content: Order[]; totalElements: number; totalPages: number }> {
    const response = await api.get<any>('/orders/my', {
      params: { page, size, sortBy, direction },
    });
    return response.data.data;
  }

  // Get single order
  async getOrderById(orderId: number): Promise<Order> {
    const response = await api.get<any>(`/orders/${orderId}`);
    return response.data.data;
  }

  // Cancel order (if PENDING)
  async cancelOrder(orderId: number): Promise<void> {
    await api.delete(`/orders/${orderId}`);
  }

  // Get order status history
  async getOrderStatusHistory(orderId: number): Promise<any[]> {
    const response = await api.get<any>(`/orders/${orderId}/status-history`);
    return response.data.data;
  }
}

export const orderService = new OrderService();
```

**File:** `src/services/paymentService.ts` (MISSING - Need to Create)

```typescript
import api from './api';

interface PaymentInitiationRequest {
  email: string;
  phone: string;
}

interface PaymentInitiationResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  paymentLink: string;
}

interface PaymentStatus {
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
  amount: number;
  razorpayOrderId: string;
}

class PaymentService {
  // Initiate payment for order
  async initiatePayment(
    orderId: number,
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const response = await api.post<any>(
      `/orders/${orderId}/initiate-payment`,
      request
    );
    return response.data.data;
  }

  // Get payment status
  async getPaymentStatus(orderId: number): Promise<PaymentStatus> {
    const response = await api.get<any>(`/orders/${orderId}/payment-status`);
    return response.data.data;
  }

  // Handle Razorpay payment callback
  async verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<void> {
    const response = await api.post<any>('/payments/razorpay-callback', {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
    return response.data.data;
  }
}

export const paymentService = new PaymentService();
```

---

## Custom Hooks Deep Dive

### useCart Hook - Complete Implementation

**File:** `src/hooks/useCart.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { cartService } from '@/services/cartService';

export interface CartItem {
  cartItemId: number;
  testId?: number;
  packageId?: number;
  testName?: string;
  packageName?: string;
  name?: string;
  quantity: number;
  price: number;
  discount?: number;
  finalPrice?: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  couponCode?: string;
  status: string;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      setCart(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch cart';
      setError(errorMsg);
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add test to cart
  const addTest = useCallback(async (testId: number, quantity: number = 1) => {
    try {
      const response = await cartService.addTestToCart({
        testId,
        quantity,
      });
      setCart(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add test';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Add package to cart
  const addPackage = useCallback(async (packageId: number) => {
    try {
      const response = await cartService.addPackageToCart({
        packageId,
      });
      setCart(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add package';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      setCart(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to remove item';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Update quantity
  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      const response = await cartService.updateQuantity(cartItemId, { quantity });
      setCart(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update quantity';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Apply coupon
  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      const response = await cartService.applyCoupon({
        couponCode,
      });
      setCart(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid coupon code';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    try {
      const response = await cartService.removeCoupon();
      setCart(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to remove coupon';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addTest,
    addPackage,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
  };
}
```

### useOrders Hook - To Be Implemented

**File:** `src/hooks/useOrders.ts` (MISSING)

```typescript
import { useState, useCallback } from 'react';
import { orderService } from '@/services/orderService';

export interface Order {
  id: number;
  orderReference: string;
  userId: number;
  userName: string;
  status: 'PENDING' | 'PAYMENT_COMPLETED' | 'TECHNICIAN_ASSIGNED' | 'DELIVERED';
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  testId: number;
  testName: string;
  quantity: number;
  price: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  });

  // Fetch user orders
  const fetchOrders = useCallback(
    async (page: number = 0, size: number = 10) => {
      setLoading(true);
      setError(null);
      try {
        const response = await orderService.getUserOrders(page, size);
        setOrders(response.content);
        setPagination({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: page,
        });
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch orders';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create order from cart
  const createOrder = useCallback(
    async (cartId: number, orderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const newOrder = await orderService.createOrder({
          cartId,
          ...orderData,
        });
        setCurrentOrder(newOrder as any);
        return newOrder;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to create order';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get order details
  const getOrderDetails = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.getOrderById(orderId);
      setCurrentOrder(order);
      return order;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch order';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setCurrentOrder(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel order';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    getOrderDetails,
    cancelOrder,
  };
}
```

### usePayment Hook - To Be Implemented

**File:** `src/hooks/usePayment.ts` (MISSING)

```typescript
import { useState, useCallback } from 'react';
import { paymentService } from '@/services/paymentService';

export interface PaymentInitiationResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  paymentLink: string;
}

export interface PaymentStatus {
  orderId: number;
  orderStatus: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  razorpayOrderId: string;
}

export function usePayment() {
  const [paymentData, setPaymentData] = useState<PaymentInitiationResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initiate payment
  const initiatePayment = useCallback(
    async (orderId: number, email: string, phone: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await paymentService.initiatePayment(orderId, {
          email,
          phone,
        });
        setPaymentData(response);
        return response;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to initiate payment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get payment status
  const getPaymentStatus = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const status = await paymentService.getPaymentStatus(orderId);
      setPaymentStatus(status);
      return status;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch payment status';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Razorpay response
  const handlePaymentSuccess = useCallback(async (response: any) => {
    try {
      await paymentService.verifyPaymentSignature(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      );
      return true;
    } catch (err) {
      setError('Payment verification failed');
      return false;
    }
  }, []);

  return {
    paymentData,
    paymentStatus,
    loading,
    error,
    initiatePayment,
    getPaymentStatus,
    handlePaymentSuccess,
  };
}
```

---

## Routing & Navigation

### App Router Configuration

**File:** `src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import TestListingPage from '@/pages/TestListingPage';
import CartPage from '@/pages/CartPage';
import OrderCheckoutPage from '@/pages/OrderCheckoutPage'; // MISSING
import PaymentPage from '@/pages/PaymentPage'; // MISSING
import MyOrdersPage from '@/pages/MyOrdersPage'; // MISSING
import OrderDetailsPage from '@/pages/OrderDetailsPage'; // MISSING
import PaymentStatusPage from '@/pages/PaymentStatusPage'; // MISSING

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import OrderManagementPage from '@/pages/admin/OrderManagementPage'; // MISSING

export function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/tests" element={<TestListingPage />} />

            {/* Protected Routes - Users */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <OrderCheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:orderId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-status/:orderId"
              element={
                <ProtectedRoute>
                  <PaymentStatusPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderManagementPage />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
```

---

## React Component Patterns

### Pattern 1: Functional Component with Hooks

**Example: CartPage.tsx**

```typescript
interface CartPageProps {}

const CartPage: React.FC<CartPageProps> = () => {
  const { cart, loading, error, fetchCart, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/tests')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {error && <ErrorAlert message={error} />}

      <div className="cart-container">
        <CartItemsList
          items={cart.items}
          onRemove={removeItem}
          onUpdateQuantity={updateQuantity}
        />
        <CartSummary cart={cart} onCheckout={() => navigate('/checkout')} />
      </div>
    </div>
  );
};
```

### Pattern 2: Reusable Component with Props

```typescript
interface CartItemProps {
  item: CartItem;
  onRemove: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, qty: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="cart-item">
      <div className="item-info">
        <h4>{item.testName}</h4>
        <p>₹{item.price.toFixed(2)} × {item.quantity}</p>
      </div>

      <div className="item-actions">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.cartItemId, Number(e.target.value))}
        />
        <button onClick={() => onRemove(item.cartItemId)}>Remove</button>
      </div>

      <div className="item-total">
        ₹{(item.finalPrice || item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};
```

### Pattern 3: Container Component (Smart)

```typescript
interface OrderListContainerProps {
  onSelectOrder: (order: Order) => void;
}

const OrderListContainer: React.FC<OrderListContainerProps> = ({ onSelectOrder }) => {
  const { orders, loading, error, fetchOrders, pagination } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={() => onSelectOrder(order)}
        />
      ))}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchOrders(page)}
      />
    </div>
  );
};
```

### Pattern 4: Form Component with Validation

```typescript
interface OrderCheckoutFormProps {
  onSubmit: (data: OrderRequest) => void;
  loading?: boolean;
}

const OrderCheckoutForm: React.FC<OrderCheckoutFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<OrderRequest>({
    cartId: 1,
    preferredDate: '',
    preferredTimeSlot: '',
    preferredLocation: '',
    contactEmail: '',
    contactPhone: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Date is required';
    }
    if (!formData.contactEmail || !formData.contactEmail.includes('@')) {
      newErrors.contactEmail = 'Valid email is required';
    }
    if (!formData.contactPhone || formData.contactPhone.length !== 10) {
      newErrors.contactPhone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label>Preferred Date</label>
        <input
          type="date"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.preferredDate && <span className="error">{errors.preferredDate}</span>}
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
        />
        {errors.contactEmail && <span className="error">{errors.contactEmail}</span>}
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          maxLength={10}
        />
        {errors.contactPhone && <span className="error">{errors.contactPhone}</span>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating Order...' : 'Create Order'}
      </button>
    </form>
  );
};
```

---

## TypeScript Implementation

### Type Definitions

**File:** `src/types/index.ts`

```typescript
// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: UserRole[];
  createdAt: string;
}

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Cart types
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  couponCode?: string;
  status: CartStatus;
}

export type CartStatus = 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';

export interface CartItem {
  cartItemId: number;
  testId?: number;
  packageId?: number;
  testName?: string;
  packageName?: string;
  quantity: number;
  price: number;
  discount?: number;
  finalPrice?: number;
}

// Order types
export interface Order {
  id: number;
  orderReference: string;
  userId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  totalAmount: number;
  razorpayOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_COMPLETED'
  | 'TECHNICIAN_ASSIGNED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORT_GENERATED'
  | 'DELIVERED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface OrderItem {
  id: number;
  testId: number;
  testName: string;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  cartId: number;
  preferredDate: string;
  preferredTimeSlot: string;
  preferredLocation: string;
  contactEmail: string;
  contactPhone: string;
  specialInstructions?: string;
}

// Payment types
export interface PaymentInitiationResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  paymentLink: string;
}
```

---

## Styling & CSS Strategy

### CSS Organization

**File:** `src/styles/globals.css`

```css
/* ============ VARIABLES ============ */
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 28px;
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* ============ RESET ============ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--dark-color);
  background-color: white;
}

/* ============ TYPOGRAPHY ============ */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-2xl); }
h2 { font-size: var(--font-size-xl); }
h3 { font-size: var(--font-size-lg); }

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: darken(var(--primary-color), 10%);
}

/* ============ BUTTONS ============ */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
  box-shadow: var(--shadow-md);
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

/* ============ FORMS ============ */
input, select, textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--secondary-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.error {
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
```

### BEM Methodology

```css
/* Block: Main component */
.card { }

/* Element: Part of block */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier: Variation */
.card--highlighted { }
.card--disabled { }
```

---

## Authentication Flow

### Frontend Auth Flow

```
User visits app
    ↓
Check localStorage for accessToken
    ↓ (Token exists)
Verify token validity (check expiration)
    ↓ (Valid)
User logged in, set AuthContext
    ↓ (Invalid/Expired)
Try refresh token
    ↓ (Success)
Get new accessToken, update localStorage
    ↓ (Failure)
Redirect to login
    ↓ (No token)
Show login modal
    ↓
User enters credentials
    ↓
POST /api/auth/login
    ↓
Backend validates & returns JWT tokens
    ↓
Frontend stores tokens in localStorage
    ↓
Set AuthContext with user data
    ↓
Redirect to dashboard
```

### Protected Route Component

```typescript
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : null;
};
```

---

## Error Handling & Loading States

### Global Error Handler

```typescript
interface ErrorAlertProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, type = 'error' }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`alert alert-${type}`}>
      <p>{message}</p>
      <button onClick={() => setVisible(false)}>×</button>
    </div>
  );
};
```

### Loading State Management

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await someApiCall();
    // Handle result
  } catch (err: any) {
    const message = err.response?.data?.message || 'An error occurred';
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

---

## Performance Optimization Strategies

### 1. Code Splitting

```typescript
import React, { lazy, Suspense } from 'react';

const OrderPage = lazy(() => import('@/pages/OrderCheckoutPage'));

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/checkout" element={<OrderPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component
const CartItem = memo(({ item, onRemove }: Props) => {
  return <div>{item.name}</div>;
});

// Memoize computed values
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### 3. Virtual Scrolling (for large lists)

```typescript
import { FixedSizeList } from 'react-window';

const OrderList = ({ orders }: Props) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <OrderCard order={orders[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={orders.length}
      itemSize={100}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 4. Image Optimization

```typescript
// Use modern image formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." loading="lazy" />
</picture>
```

---

##Testing Strategy

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { CartPage } from '@/pages/CartPage';

describe('CartPage', () => {
  test('renders empty cart message', () => {
    render(<CartPage />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  test('displays cart items', () => {
    const mockCart = {
      items: [{ id: 1, name: 'Test 1', price: 100 }],
    };
    render(<CartPage cart={mockCart} />);
    expect(screen.getByText('Test 1')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';

describe('useCart', () => {
  test('should add item to cart', async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.addTest(1);
    });

    expect(result.current.cart?.items.length).toBeGreaterThan(0);
  });
});
```

---

## Component Library Reference

### Existing Components (✅ Complete)

| Component | Location | Purpose |
|-----------|----------|---------|
| Header | `src/components/layout/Header.tsx` | Top navigation bar |
| Footer | `src/components/layout/Footer.tsx` | Page footer |
| CartPage | `src/pages/CartPage.tsx` | Shopping cart page |
| LoadingSpinner | `src/components/common/LoadingSpinner.tsx` | Loading indicator |
| Modal | `src/components/common/AppModal.tsx` | Modal dialog |
| Card | `src/components/common/Card.tsx` | Reusable card component |
| AuthModal | `src/components/auth/AuthModal.tsx` | Login/Register |

### Missing Components (❌ Need to Create)

| Component | Location | Purpose |
|-----------|----------|---------|
| **OrderCheckoutForm** | `src/components/order/OrderCheckoutForm.tsx` | Order creation form |
| **OrderCard** | `src/components/order/OrderCard.tsx` | Single order display |
| **OrderTimeline** | `src/components/order/OrderTimeline.tsx` | Status timeline |
| **RazorpayButton** | `src/components/payment/RazorpayButton.tsx` | Payment button |
| **PaymentForm** | `src/components/payment/PaymentForm.tsx` | Payment details form |
| **PaymentStatus** | `src/components/payment/PaymentStatus.tsx` | Payment result |

---

## Summary: Frontend Architecture

### Current State: ⭐⭐⭐⭐☆ (4/5)
- ✅ Clean component structure
- ✅ Proper state management (Context + Hooks)
- ✅ TypeScript throughout
- ✅ Good error handling
- ⚠️ Missing order/payment components
- ⚠️ Missing payment integration

### Implementation Quality: ⭐⭐⭐⭐☆ (4/5)
- ✅ React hooks best practices
- ✅ Component composition
- ✅ API integration layer ready
- ⚠️ Tests not comprehensive
- ⚠️ Performance optimization partial

### Next Priority: 🔴 CRITICAL
**Missing Pages (5):**
1. OrderCheckoutPage.tsx
2. MyOrdersPage.tsx
3. OrderDetailsPage.tsx
4. PaymentPage.tsx
5. PaymentStatusPage.tsx

**Missing Services (2):**
1. orderService.ts
2. paymentService.ts

**Missing Hooks (2):**
1. useOrders.ts
2. usePayment.ts

---

**Ready to build missing components?** 🚀

---

**Last Updated:** 2026-03-24
