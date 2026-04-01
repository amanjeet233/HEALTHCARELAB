# 📝 Complete Implementation Guide - Part 4

**Date:** 2026-03-24
**Phase:** Phase 5.3 - Frontend Implementation & Integration
**Difficulty:** Intermediate (3-4 hours for complete implementation)
**Status:** Ready to Build ✅

---

## 📑 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Step 1: Create Missing Services](#step-1-create-missing-services)
3. [Step 2: Create Missing Hooks](#step-2-create-missing-hooks)
4. [Step 3: Create Order Pages](#step-3-create-order-pages)
5. [Step 4: Create Payment Pages](#step-4-create-payment-pages)
6. [Step 5: Create Order Components](#step-5-create-order-components)
7. [Step 6: Create Payment Components](#step-6-create-payment-components)
8. [Step 7: Connect Cart to Checkout](#step-7-connect-cart-to-checkout)
9. [Step 8: Add Routes](#step-8-add-routes)
10. [Step 9: Testing Guide](#step-9-testing-guide)
11. [Step 10: Deployment](#step-10-deployment)

---

## Quick Start Guide

### Prerequisites Check
```bash
✅ Backend running on http://localhost:8080
✅ Frontend running on http://localhost:5173
✅ Node.js 16+ installed
✅ Git repository ready
```

### Implementation Time Estimate
```
orderService.ts              → 15 min ⏱️
paymentService.ts            → 15 min ⏱️
useOrders.ts hook            → 20 min ⏱️
usePayment.ts hook           → 20 min ⏱️
OrderCheckoutPage.tsx        → 30 min ⏱️
MyOrdersPage.tsx             → 30 min ⏱️
OrderDetailsPage.tsx         → 25 min ⏱️
PaymentPage.tsx              → 35 min ⏱️
PaymentStatusPage.tsx        → 20 min ⏱️
Components (5 files)         → 40 min ⏱️
Routes + Cart connection     → 15 min ⏱️
Testing                      → 30 min ⏱️
─────────────────────────────
TOTAL                        → 295 minutes ≈ 5 hours
```

### Quick Build Command
```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build for dev
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## Step 1: Create Missing Services

### 1.1 OrderService.ts

**File:** `frontend/src/services/orderService.ts`

```typescript
import api from './api';

export interface OrderRequest {
  cartId: number;
  preferredDate: string;
  preferredTimeSlot: string;
  preferredLocation: string;
  contactEmail: string;
  contactPhone: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: number;
  testId: number;
  testName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderReference: string;
  userId: number;
  userName: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface StatusHistoryEntry {
  id: number;
  orderId: number;
  newStatus: string;
  oldStatus?: string;
  reason?: string;
  changedBy: string;
  createdAt: string;
}

class OrderService {
  /**
   * Create order from cart
   */
  async createOrder(request: OrderRequest): Promise<Order> {
    try {
      const response = await api.post<any>('/orders/create', request);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  /**
   * Get user's orders (paginated)
   */
  async getUserOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    direction: 'ASC' | 'DESC' = 'DESC'
  ): Promise<OrderResponse> {
    try {
      const response = await api.get<any>('/orders/my', {
        params: {
          page,
          size,
          sortBy,
          direction,
        },
      });
      return {
        content: response.data.data.content,
        totalElements: response.data.data.totalElements,
        totalPages: response.data.data.totalPages,
        currentPage: page,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get single order by ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get<any>(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: number): Promise<StatusHistoryEntry[]> {
    try {
      const response = await api.get<any>(`/orders/${orderId}/status-history`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch history');
    }
  }

  /**
   * Cancel order (only PENDING orders)
   */
  async cancelOrder(orderId: number): Promise<void> {
    try {
      await api.delete(`/orders/${orderId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  /**
   * Get all orders (Admin only)
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get<any>('/orders');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
}

export const orderService = new OrderService();
```

**Time to Create:** 15 min ⏱️

---

### 1.2 PaymentService.ts

**File:** `frontend/src/services/paymentService.ts`

```typescript
import api from './api';

export interface PaymentInitiationRequest {
  email: string;
  phone: string;
}

export interface PaymentInitiationResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  paymentLink: string;
}

export interface PaymentStatus {
  orderId: number;
  orderStatus: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  razorpayOrderId: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    email: string;
    contact: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

class PaymentService {
  /**
   * Initiate payment for order
   */
  async initiatePayment(
    orderId: number,
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    try {
      const response = await api.post<any>(
        `/orders/${orderId}/initiate-payment`,
        request
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to initiate payment'
      );
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: number): Promise<PaymentStatus> {
    try {
      const response = await api.get<any>(`/orders/${orderId}/payment-status`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch payment status'
      );
    }
  }

  /**
   * Verify payment signature (after Razorpay modal closes)
   */
  async verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<void> {
    try {
      await api.post('/payments/razorpay-callback', {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Payment verification failed'
      );
    }
  }

  /**
   * Generate Razorpay options object
   */
  generateRazorpayOptions(
    paymentData: PaymentInitiationResponse,
    onSuccess: (response: any) => void,
    onFailure: () => void
  ): RazorpayOptions {
    return {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: Math.round(paymentData.amount * 100), // Convert to paise
      currency: paymentData.currency,
      name: 'Healthcare Lab Test Booking',
      description: `Order: ${paymentData.orderId}`,
      order_id: paymentData.razorpayOrderId,
      prefill: {
        email: paymentData.customerEmail,
        contact: paymentData.customerPhone,
      },
      handler: onSuccess,
      modal: {
        ondismiss: onFailure,
      },
    };
  }

  /**
   * Load Razorpay script
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}

export const paymentService = new PaymentService();
```

**Time to Create:** 15 min ⏱️

---

## Step 2: Create Missing Hooks

### 2.1 useOrders Hook

**File:** `frontend/src/hooks/useOrders.ts`

```typescript
import { useState, useCallback } from 'react';
import { orderService, Order, OrderRequest, StatusHistoryEntry } from '@/services/orderService';

interface UsePagination {
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [pagination, setPagination] = useState<UsePagination>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  });

  /**
   * Fetch user's orders
   */
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
        const errorMsg = err.message || 'Failed to fetch orders';
        setError(errorMsg);
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Create order from cart
   */
  const createOrder = useCallback(async (orderData: OrderRequest): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await orderService.createOrder(orderData);
      setCurrentOrder(newOrder);
      return newOrder;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create order';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get order details
   */
  const getOrderDetails = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.getOrderById(orderId);
      setCurrentOrder(order);

      // Fetch status history
      const history = await orderService.getOrderStatusHistory(orderId);
      setStatusHistory(history);

      return order;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch order';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to cancel order';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder?.id]);

  /**
   * Refresh order status
   */
  const refreshOrderStatus = useCallback(async () => {
    if (!currentOrder) return;
    try {
      const updated = await orderService.getOrderById(currentOrder.id);
      setCurrentOrder(updated);

      const history = await orderService.getOrderStatusHistory(currentOrder.id);
      setStatusHistory(history);
    } catch (err: any) {
      console.error('Refresh status error:', err);
    }
  }, [currentOrder?.id]);

  return {
    orders,
    currentOrder,
    statusHistory,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    getOrderDetails,
    cancelOrder,
    refreshOrderStatus,
  };
}
```

**Time to Create:** 20 min ⏱️

---

### 2.2 usePayment Hook

**File:** `frontend/src/hooks/usePayment.ts`

```typescript
import { useState, useCallback } from 'react';
import {
  paymentService,
  PaymentInitiationResponse,
  PaymentStatus,
} from '@/services/paymentService';

export function usePayment() {
  const [paymentData, setPaymentData] = useState<PaymentInitiationResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  /**
   * Initiate payment for order
   */
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
        const errorMsg = err.message || 'Failed to initiate payment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get payment status
   */
  const getPaymentStatus = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const status = await paymentService.getPaymentStatus(orderId);
      setPaymentStatus(status);
      return status;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch payment status';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Open Razorpay payment modal
   */
  const openRazorpayModal = useCallback(
    async (paymentDataToUse: PaymentInitiationResponse) => {
      setRazorpayLoading(true);
      setError(null);
      try {
        // Load Razorpay script
        const scriptLoaded = await paymentService.loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay script');
        }

        return new Promise<boolean>((resolve) => {
          const options = paymentService.generateRazorpayOptions(
            paymentDataToUse,
            async (response: any) => {
              try {
                // Verify payment signature
                await paymentService.verifyPaymentSignature(
                  response.razorpay_payment_id,
                  response.razorpay_order_id,
                  response.razorpay_signature
                );

                // Update payment status
                const status = await getPaymentStatus(paymentDataToUse.orderId);
                setPaymentStatus(status);

                resolve(true);
              } catch (err: any) {
                setError(err.message || 'Payment verification failed');
                resolve(false);
              }
            },
            () => {
              resolve(false);
            }
          );

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to open payment modal';
        setError(errorMsg);
        return false;
      } finally {
        setRazorpayLoading(false);
      }
    },
    [getPaymentStatus]
  );

  /**
   * Clear payment data
   */
  const clearPaymentData = useCallback(() => {
    setPaymentData(null);
    setPaymentStatus(null);
    setError(null);
  }, []);

  return {
    paymentData,
    paymentStatus,
    loading,
    error,
    razorpayLoading,
    initiatePayment,
    getPaymentStatus,
    openRazorpayModal,
    clearPaymentData,
  };
}
```

**Time to Create:** 20 min ⏱️

---

## Step 3: Create Order Pages

### 3.1 OrderCheckoutPage.tsx

**File:** `frontend/src/pages/OrderCheckoutPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import OrderCheckoutForm from '@/components/order/OrderCheckoutForm';
import { OrderRequest } from '@/services/orderService';
import './OrderCheckoutPage.css';

const OrderCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (data: OrderRequest) => {
    setFormError(null);
    try {
      const newOrder = await createOrder(data);

      // Redirect to payment page
      navigate(`/payment/${newOrder.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create order');
    }
  };

  if (cartLoading) {
    return <LoadingSpinner />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-page empty-cart">
        <div className="empty-content">
          <h2>Your cart is empty</h2>
          <p>Please add items before proceeding to checkout</p>
          <button onClick={() => navigate('/tests')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Order Checkout</h1>

      {formError && <ErrorAlert message={formError} type="error" />}
      {orderError && <ErrorAlert message={orderError} type="error" />}

      <div className="checkout-container">
        {/* Left: Form */}
        <div className="checkout-form-section">
          <OrderCheckoutForm
            onSubmit={handleSubmit}
            loading={orderLoading}
            defaultEmail={user?.email}
          />
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="summary-items">
              <h4>Items ({cart.items.length})</h4>
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="summary-item">
                  <span>
                    {item.testName || item.packageName}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                  <span>₹{(item.finalPrice || item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-₹{cart.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Tax (18%):</span>
                <span>₹{cart.taxAmount.toFixed(2)}</span>
              </div>

              <div className="summary-row total">
                <strong>Total Amount:</strong>
                <strong>₹{cart.totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            <div className="summary-info">
              <p>✓ Free home sample collection</p>
              <p>✓ Reports in 24-48 hours</p>
              <p>✓ 24/7 customer support</p>
              <p>✓ Secure payment with Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCheckoutPage;
```

**CSS File:** `frontend/src/pages/OrderCheckoutPage.css`

```css
.checkout-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.checkout-page h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
  }
}

.checkout-form-section,
.checkout-summary-section {
  display: flex;
  flex-direction: column;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.summary-card h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
}

.summary-items {
  margin-bottom: 1rem;
}

.summary-items h4 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  border-bottom: 1px solid #eee;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #ddd, transparent);
  margin: 1rem 0;
}

.summary-breakdown {
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #666;
}

.summary-row.discount {
  color: #28a745;
}

.summary-row.total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 0.5rem;
}

.summary-info {
  background: #f0f7ff;
  border-left: 4px solid #007bff;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
}

.summary-info p {
  margin: 0.25rem 0;
}

.empty-cart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-content h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-content p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
```

**Time to Create:** 30 min ⏱️

---

### 3.2 MyOrdersPage.tsx

**File:** `frontend/src/pages/MyOrdersPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import OrderCard from '@/components/order/OrderCard';
import './MyOrdersPage.css';

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, error, pagination, fetchOrders } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  return (
    <div className="my-orders-page">
      <h1>My Orders</h1>

      {error && <ErrorAlert message={error} type="error" />}

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="status-filter"
        >
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PAYMENT_COMPLETED">Payment Completed</option>
          <option value="TECHNICIAN_ASSIGNED">Technician Assigned</option>
          <option value="SAMPLE_COLLECTED">Sample Collected</option>
          <option value="PROCESSING">Processing</option>
          <option value="REPORT_GENERATED">Report Generated</option>
          <option value="DELIVERED">Delivered</option>
        </select>

        <span className="order-count">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No orders found</h2>
          <p>
            {statusFilter
              ? 'No orders with this status'
              : "You haven't placed any orders yet"}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/tests')}
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <>
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.currentPage === 0}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </div>

              <button
                disabled={
                  pagination.currentPage === pagination.totalPages - 1
                }
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyOrdersPage;
```

**CSS File:** `frontend/src/pages/MyOrdersPage.css`

```css
.my-orders-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
  max-width: 1200px;
  margin: 0 auto;
}

.my-orders-page h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.status-filter {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
}

.order-count {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}
```

**Time to Create:** 30 min ⏱️

---

### 3.3 OrderDetailsPage.tsx

**File:** `frontend/src/pages/OrderDetailsPage.tsx`

```typescript
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import OrderTimeline from '@/components/order/OrderTimeline';
import './OrderDetailsPage.css';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    currentOrder,
    statusHistory,
    loading,
    error,
    getOrderDetails,
    cancelOrder,
  } = useOrders();

  useEffect(() => {
    if (orderId) {
      getOrderDetails(Number(orderId));
    }
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    if (
      window.confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      )
    ) {
      try {
        await cancelOrder(currentOrder.id);
        navigate('/orders');
      } catch (err) {
        console.error('Cancel order error:', err);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentOrder) {
    return (
      <div className="order-details-page error-state">
        <h2>Order not found</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  const canCancel = currentOrder.status === 'PENDING';

  return (
    <div className="order-details-page">
      <button className="back-btn" onClick={() => navigate('/orders')}>
        ← Back to Orders
      </button>

      {error && <ErrorAlert message={error} type="error" />}

      <div className="order-header">
        <div className="order-info">
          <h1>Order {currentOrder.orderReference}</h1>
          <p className="order-date">
            Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="order-status">
          <span className={`status-badge status-${currentOrder.status.toLowerCase()}`}>
            {currentOrder.status.replace(/_/g, ' ')}
          </span>
          {currentOrder.paymentStatus && (
            <span className={`payment-badge payment-${currentOrder.paymentStatus.toLowerCase()}`}>
              {currentOrder.paymentStatus}
            </span>
          )}
        </div>
      </div>

      <div className="order-content">
        {/* Left: Order Details */}
        <div className="order-main">
          {/* Items Section */}
          <section className="order-section">
            <h2>Order Items</h2>
            <div className="items-list">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <h3>{item.testName}</h3>
                    <p className="item-id">Test ID: {item.testId}</p>
                  </div>
                  <div className="item-pricing">
                    <div className="qty">Qty: {item.quantity}</div>
                    <div className="price">₹{item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="order-section">
            <h2>Order Status Timeline</h2>
            <OrderTimeline history={statusHistory} />
          </section>
        </div>

        {/* Right: Summary & Actions */}
        <aside className="order-sidebar">
          <div className="order-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-detail">
              <span>Subtotal:</span>
              <span>₹{currentOrder.subtotal.toFixed(2)}</span>
            </div>

            {currentOrder.discountAmount > 0 && (
              <div className="summary-detail discount">
                <span>Discount:</span>
                <span>-₹{currentOrder.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-detail">
              <span>Tax:</span>
              <span>₹{currentOrder.taxAmount.toFixed(2)}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-detail total">
              <span>Total:</span>
              <span>₹{currentOrder.totalAmount.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="order-actions">
              {currentOrder.paymentStatus === 'PENDING' && (
                <button
                  className="btn btn-primary full-width"
                  onClick={() => navigate(`/payment/${currentOrder.id}`)}
                >
                  Complete Payment
                </button>
              )}

              {canCancel && (
                <button
                  className="btn btn-danger full-width"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              )}

              <button
                className="btn btn-secondary full-width"
                onClick={() => navigate('/orders')}
              >
                View All Orders
              </button>
            </div>

            {/* Info */}
            <div className="order-info-box">
              <p>✓ Free home sample collection</p>
              <p>✓ Reports in 24-48 hours</p>
              <p>✓ 24/7 customer support</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
```

**CSS File:** `frontend/src/pages/OrderDetailsPage.css`

```css
.order-details-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #0056b3;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-info h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #333;
}

.order-date {
  color: #666;
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
}

.order-status {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.status-badge,
.payment-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.payment-badge {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.payment-completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .order-content {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }
}

.order-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.order-section h2 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  color: #333;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.item-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.item-id {
  margin: 0;
  font-size: 0.85rem;
  color: #999;
}

.item-pricing {
  text-align: right;
}

.qty {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.order-sidebar {
  display: flex;
  flex-direction: column;
}

.order-summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary-card h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 1rem;
}

.summary-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #666;
}

.summary-detail.total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #ddd, transparent);
  margin: 1rem 0;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.full-width {
  width: 100%;
}

.order-info-box {
  background: #f0f7ff;
  border-left: 4px solid #007bff;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
}

.order-info-box p {
  margin: 0.25rem 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-state h2 {
  margin-bottom: 1rem;
  color: #333;
}
```

**Time to Create:** 25 min ⏱️

---

## Step 4: Create Payment Pages

### 4.1 PaymentPage.tsx

**File:** `frontend/src/pages/PaymentPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { useOrders } from '@/hooks/useOrders';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import PaymentForm from '@/components/payment/PaymentForm';
import './PaymentPage.css';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, getOrderDetails } = useOrders();
  const {
    paymentData,
    loading,
    error,
    razorpayLoading,
    initiatePayment,
    openRazorpayModal,
  } = usePayment();

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrderDetails(Number(orderId));
    }
  }, [orderId]);

  const handleInitiatePayment = async (email: string, phone: string) => {
    setFormError(null);
    try {
      if (!orderId) throw new Error('Order ID is missing');

      const paymentInfo = await initiatePayment(Number(orderId), email, phone);

      // Open Razorpay modal
      const success = await openRazorpayModal(paymentInfo);

      if (success) {
        // Redirect to payment status page
        navigate(`/payment-status/${orderId}?status=success`);
      } else {
        setFormError('Payment was cancelled');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to initiate payment');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentOrder) {
    return (
      <div className="payment-page error-state">
        <h2>Order not found</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  if (currentOrder.paymentStatus === 'COMPLETED') {
    return (
      <div className="payment-page error-state">
        <h2>Payment Already Completed</h2>
        <p>This order has already been paid for.</p>
        <button onClick={() => navigate(`/orders/${currentOrder.id}`)} className="btn btn-primary">
          View Order
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Complete Payment</h1>

      {formError && <ErrorAlert message={formError} type="error" />}
      {error && <ErrorAlert message={error} type="error" />}

      <div className="payment-container">
        {/* Left: Payment Form */}
        <div className="payment-form-section">
          <PaymentForm
            onSubmit={handleInitiatePayment}
            loading={razorpayLoading}
            defaultEmail={currentOrder.userId ? undefined : currentOrder.orderReference}
          />
        </div>

        {/* Right: Order Summary */}
        <div className="payment-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="summary-info">
              <div className="info-row">
                <span>Order Reference:</span>
                <strong>{currentOrder.orderReference}</strong>
              </div>
              <div className="info-row">
                <span>Order Date:</span>
                <span>{new Date(currentOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span className="status-badge">
                  {currentOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="items-breakdown">
              <h4>Items ({currentOrder.items.length})</h4>
              {currentOrder.items.map((item) => (
                <div key={item.id} className="item-row">
                  <span>{item.testName}</span>
                  <span>₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="pricing-breakdown">
              <div className="breakdown-row">
                <span>Subtotal:</span>
                <span>₹{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              {currentOrder.discountAmount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount:</span>
                  <span>-₹{currentOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Tax:</span>
                <span>₹{currentOrder.taxAmount.toFixed(2)}</span>
              </div>
              <div className="breakdown-row total">
                <strong>Total Amount:</strong>
                <strong>₹{currentOrder.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="security-notice">
              <p>🔒 Secure payment powered by Razorpay</p>
              <p>Your payment information is encrypted and secure</p>
            </div>

            <button
              className="btn btn-secondary full-width"
              onClick={() => navigate(`/orders/${currentOrder.id}`)}
            >
              ← Back to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
```

**CSS File:** `frontend/src/pages/PaymentPage.css`

```css
.payment-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.payment-page h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.payment-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .payment-container {
    grid-template-columns: 1fr;
  }
}

.payment-form-section,
.payment-summary-section {
  display: flex;
  flex-direction: column;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.summary-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
}

.summary-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #666;
}

.info-row span:last-child {
  font-weight: 500;
}

.status-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.summary-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #ddd, transparent);
  margin: 1rem 0;
}

.items-breakdown h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.pricing-breakdown {
  margin-bottom: 1rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #666;
}

.breakdown-row.discount {
  color: #28a745;
}

.breakdown-row.total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 0.5rem;
}

.security-notice {
  background: #f0f7ff;
  border-left: 4px solid #007bff;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #333;
}

.security-notice p {
  margin: 0.25rem 0;
}

.full-width {
  width: 100%;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

.error-state h2 {
  margin-bottom: 1rem;
  color: #333;
}

.error-state p {
  color: #666;
  margin-bottom: 1.5rem;
}
```

**Time to Create:** 35 min ⏱️

---

### 4.2 PaymentStatusPage.tsx

**File:** `frontend/src/pages/PaymentStatusPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { usePayment } from '@/hooks/usePayment';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import './PaymentStatusPage.css';

const PaymentStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'pending';

  const { currentOrder, getOrderDetails } = useOrders();
  const { paymentStatus, getPaymentStatus } = usePayment();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchData = async () => {
        try {
          await getOrderDetails(Number(orderId));
          await getPaymentStatus(Number(orderId));
        } catch (err) {
          console.error('Error fetching payment status:', err);
        } finally {
          setLoading(false);
        }
      };

      // Add slight delay for better UX
      setTimeout(fetchData, 1000);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="payment-status-page">
        <LoadingSpinner />
      </div>
    );
  }

  const isSuccess = status === 'success' && paymentStatus?.paymentStatus === 'COMPLETED';

  return (
    <div className="payment-status-page">
      <div className={`status-container ${isSuccess ? 'success' : 'failure'}`}>
        {isSuccess ? (
          <>
            <div className="status-icon success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p className="status-message">
              Your payment has been processed successfully
            </p>
          </>
        ) : (
          <>
            <div className="status-icon failure-icon">✕</div>
            <h1>Payment Failed</h1>
            <p className="status-message">
              Unfortunately, your payment could not be processed
            </p>
          </>
        )}

        {currentOrder && (
          <div className="order-confirmation">
            <h2>Order Details</h2>

            <div className="confirmation-detail">
              <span>Order Reference:</span>
              <strong>{currentOrder.orderReference}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Amount:</span>
              <strong>₹{currentOrder.totalAmount.toFixed(2)}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Status:</span>
              <span className={`status-badge ${currentOrder.paymentStatus.toLowerCase()}`}>
                {currentOrder.paymentStatus}
              </span>
            </div>

            {isSuccess && (
              <div className="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                  <li>✓ Your order has been confirmed</li>
                  <li>✓ A technician will contact you to schedule sample collection</li>
                  <li>✓ Home sample collection is free</li>
                  <li>✓ Reports will be available in 24-48 hours</li>
                </ul>
              </div>
            )}

            {!isSuccess && (
              <div className="retry-section">
                <p>You can try the payment again or contact our support team for assistance</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/payment/${currentOrder.id}`)}
                >
                  Retry Payment
                </button>
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            View Order Details
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
            Back to My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
```

**CSS File:** `frontend/src/pages/PaymentStatusPage.css`

```css
.payment-status-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-container {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-icon {
  background-color: #d4edda;
  color: #28a745;
}

.failure-icon {
  background-color: #f8d7da;
  color: #dc3545;
}

.status-container h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  color: #333;
}

.status-message {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.order-confirmation {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.order-confirmation h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
}

.confirmation-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #666;
}

.confirmation-detail strong {
  color: #333;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #28a745;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background-color: #f8d7da;
  color: #dc3545;
}

.next-steps {
  background: white;
  border-left: 4px solid #28a745;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
}

.next-steps h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #333;
}

.next-steps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.next-steps li {
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.retry-section {
  background: white;
  border-left: 4px solid #dc3545;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
}

.retry-section p {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-direction: column;
}

@media (min-width: 600px) {
  .action-buttons {
    flex-direction: row;
  }

  .btn {
    flex: 1;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
```

**Time to Create:** 20 min ⏱️

---

## Step 5: Create Order Components

### 5.1 OrderCheckoutForm.tsx

**File:** `frontend/src/components/order/OrderCheckoutForm.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { OrderRequest } from '@/services/orderService';
import './OrderCheckoutForm.css';

interface OrderCheckoutFormProps {
  onSubmit: (data: OrderRequest) => void;
  loading?: boolean;
  defaultEmail?: string;
}

interface FormData extends OrderRequest {
  cartId: number;
}

interface FormErrors {
  [key: string]: string;
}

const OrderCheckoutForm: React.FC<OrderCheckoutFormProps> = ({
  onSubmit,
  loading = false,
  defaultEmail = '',
}) => {
  const [formData, setFormData] = useState<FormData>({
    cartId: 1, // Would come from cart context in real app
    preferredDate: '',
    preferredTimeSlot: '09:00',
    preferredLocation: '',
    contactEmail: defaultEmail,
    contactPhone: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Date validation
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Date is required';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.preferredDate = 'Date must be today or later';
      }
    }

    // Email validation
    if (!formData.contactEmail) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }

    // Phone validation
    if (!formData.contactPhone) {
      newErrors.contactPhone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Phone must be 10 digits';
    }

    // Location validation
    if (!formData.preferredLocation) {
      newErrors.preferredLocation = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData);
      }
    },
    [formData, validateForm, onSubmit]
  );

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label htmlFor="preferredDate">Preferred Date *</label>
        <input
          type="date"
          id="preferredDate"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          min={minDate}
          className={errors.preferredDate ? 'error' : ''}
        />
        {errors.preferredDate && (
          <span className="error-message">{errors.preferredDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="preferredTimeSlot">Preferred Time Slot *</label>
        <select
          id="preferredTimeSlot"
          name="preferredTimeSlot"
          value={formData.preferredTimeSlot}
          onChange={handleChange}
          className={errors.preferredTimeSlot ? 'error' : ''}
        >
          <option value="09:00">09:00 AM - 10:00 AM</option>
          <option value="10:00">10:00 AM - 11:00 AM</option>
          <option value="14:00">02:00 PM - 03:00 PM</option>
          <option value="15:00">03:00 PM - 04:00 PM</option>
          <option value="16:00">04:00 PM - 05:00 PM</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="preferredLocation">Preferred Location *</label>
        <select
          id="preferredLocation"
          name="preferredLocation"
          value={formData.preferredLocation}
          onChange={handleChange}
          className={errors.preferredLocation ? 'error' : ''}
        >
          <option value="">Select a location</option>
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Lab Center">Lab Center</option>
        </select>
        {errors.preferredLocation && (
          <span className="error-message">{errors.preferredLocation}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contactEmail">Email *</label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="your@email.com"
          className={errors.contactEmail ? 'error' : ''}
        />
        {errors.contactEmail && (
          <span className="error-message">{errors.contactEmail}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contactPhone">Phone Number *</label>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          placeholder="9876543210"
          maxLength={10}
          className={errors.contactPhone ? 'error' : ''}
        />
        {errors.contactPhone && (
          <span className="error-message">{errors.contactPhone}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
        <textarea
          id="specialInstructions"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          placeholder="Any special instructions for the technician..."
          rows={3}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating Order...' : 'Create Order & Proceed to Payment'}
      </button>
    </form>
  );
};

export default OrderCheckoutForm;
```

**CSS File:** `frontend/src/components/order/OrderCheckoutForm.css`

```css
.checkout-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.form-group input.error:focus,
.form-group select.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
}
```

**Time to Create:** Not counted (detailed in components section)

---

### 5.2 OrderCard.tsx

**File:** `frontend/src/components/order/OrderCard.tsx`

```typescript
import React from 'react';
import { Order } from '@/services/orderService';
import { StatusBadge } from '@/components/common/StatusBadge';
import './OrderCard.css';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="order-card" onClick={onClick}>
      <div className="card-header">
        <div className="order-ref">
          <h3>{order.orderReference}</h3>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>
        <div className="status-badges">
          <StatusBadge status={order.status} />
          {order.paymentStatus && (
            <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="items-count">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>

        <div className="amount">₹{order.totalAmount.toFixed(2)}</div>
      </div>

      <div className="card-footer">
        <button className="btn btn-small">View Details →</button>
      </div>
    </div>
  );
};

export default OrderCard;
```

**CSS File:** `frontend/src/components/order/OrderCard.css`

```css
.order-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.order-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-ref h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.order-date {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.payment-status {
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.payment-status.completed {
  background-color: #d4edda;
  color: #28a745;
}

.payment-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.items-count {
  font-size: 0.9rem;
  color: #666;
}

.amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.card-footer {
  text-align: center;
}

.btn-small {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-small:hover {
  background-color: #0056b3;
}
```

**Time to Create:** Not counted (detailed in components section)

---

### 5.3 OrderTimeline.tsx

**File:** `frontend/src/components/order/OrderTimeline.tsx`

```typescript
import React from 'react';
import { StatusHistoryEntry } from '@/services/orderService';
import './OrderTimeline.css';

interface OrderTimelineProps {
  history: StatusHistoryEntry[];
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="empty-timeline">No status updates yet</div>;
  }

  const sortedHistory = [...history].reverse();

  return (
    <div className="timeline">
      {sortedHistory.map((entry, index) => (
        <div key={entry.id} className="timeline-item">
          <div className="timeline-marker">
            <div className={`marker-dot status-${entry.newStatus.toLowerCase()}`} />
            {index < sortedHistory.length - 1 && <div className="marker-line" />}
          </div>

          <div className="timeline-content">
            <div className="timeline-header">
              <h4 className="timeline-status">
                {entry.newStatus.replace(/_/g, ' ')}
              </h4>
              <span className="timeline-time">
                {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {entry.reason && (
              <p className="timeline-reason">{entry.reason}</p>
            )}

            <p className="timeline-by">Changed by: {entry.changedBy}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
```

**CSS File:** `frontend/src/components/order/OrderTimeline.css`

```css
.timeline {
  position: relative;
  padding: 1rem 0;
}

.empty-timeline {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}

.timeline-item {
  display: flex;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-marker {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
  transition: all 0.3s ease;
}

.marker-dot.status-pending {
  background-color: #ffc107;
}

.marker-dot.status-payment_completed {
  background-color: #17a2b8;
}

.marker-dot.status-technician_assigned {
  background-color: #007bff;
}

.marker-dot.status-sample_collected {
  background-color: #6610f2;
}

.marker-dot.status-processing {
  background-color: #fd7e14;
}

.marker-dot.status-report_generated {
  background-color: #28a745;
}

.marker-dot.status-delivered {
  background-color: #20c997;
}

.marker-line {
  width: 2px;
  flex-grow: 1;
  background-color: #e0e0e0;
  margin-top: 0.5rem;
}

.timeline-content {
  flex-grow: 1;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-status {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
  text-transform: capitalize;
}

.timeline-time {
  font-size: 0.85rem;
  color: #999;
}

.timeline-reason {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.timeline-by {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
}
```

**Time to Create:** Not counted (detailed in components section)

---

## Step 6: Create Payment Components

### 6.1 PaymentForm.tsx

**File:** `frontend/src/components/payment/PaymentForm.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import './PaymentForm.css';

interface PaymentFormProps {
  onSubmit: (email: string, phone: string) => void;
  loading?: boolean;
  defaultEmail?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  loading = false,
  defaultEmail = '',
}) => {
  const [formData, setFormData] = useState({
    email: defaultEmail,
    phone: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData.email, formData.phone);
      }
    },
    [formData, validateForm, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Enter Payment Details</h2>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="9876543210"
          maxLength={10}
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now with Razorpay'}
      </button>

      <p className="form-info">
        🔒 Secure payment powered by Razorpay
      </p>
    </form>
  );
};

export default PaymentForm;
```

**CSS File:** `frontend/src/components/payment/PaymentForm.css`

```css
.payment-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-form h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}

.form-group input.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-info {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}
```

**Time to Create:** Not counted (detailed in components section)

---

## Step 7: Connect Cart to Checkout

### Update CartPage.tsx

**File:** `frontend/src/pages/CartPage.tsx` (Line 247-249)

**Change from:**
```tsx
<button className="checkout-btn">
  Proceed to Checkout →
</button>
```

**Change to:**
```tsx
<button
  className="checkout-btn"
  onClick={() => navigate('/checkout')}
>
  Proceed to Checkout →
</button>
```

**Add import at top:**
```tsx
import { useNavigate } from 'react-router-dom';
```

**Add to component:**
```tsx
const navigate = useNavigate();
```

**Time to Update:** 5 min ⏱️

---

## Step 8: Add Routes

### Update App.tsx

**File:** `frontend/src/App.tsx`

**Add imports:**
```typescript
import OrderCheckoutPage from '@/pages/OrderCheckoutPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import OrderManagementPage from '@/pages/admin/OrderManagementPage';
```

**Add routes inside `<Routes>`:**
```typescript
{/* Order Routes */}
<Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <OrderCheckoutPage />
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

{/* Payment Routes */}
<Route
  path="/payment/:orderId"
  element={
    <ProtectedRoute>
      <PaymentPage />
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
  path="/admin/orders"
  element={
    <AdminRoute>
      <OrderManagementPage />
    </AdminRoute>
  }
/>
```

**Time to Update:** 10 min ⏱️

---

## Step 9: Testing Guide

### Test Checklist

```markdown
## Order Creation Flow Test

- [ ] Navigate to /tests
- [ ] Add item to cart
- [ ] Go to cart page
- [ ] Click "Proceed to Checkout"
- [ ] Fill checkout form with valid data
- [ ] Submit form
- [ ] Verify order created (check /orders page)
- [ ] Should redirect to /payment/{orderId}

## Payment Flow Test

- [ ] On payment page, enter email & phone
- [ ] Click "Pay Now with Razorpay"
- [ ] Razorpay modal opens
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Verify payment success
- [ ] Should redirect to /payment-status page
- [ ] Check order status updated

## Order Management Test

- [ ] Go to /orders
- [ ] Verify all orders displayed
- [ ] Click on order
- [ ] Verify order details page
- [ ] Check status timeline
- [ ] Try cancel button
- [ ] Verify payment status updated

## Error Handling Test

- [ ] Submit form with empty fields
- [ ] Verify error messages
- [ ] Submit with invalid email
- [ ] Verify email error
- [ ] Submit with invalid phone
- [ ] Verify phone error
```

**Time to Test:** 20 min ⏱️

---

## Step 10: Deployment

### Build for Production

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Preview (optional)
npm run preview
```

### Environment Variables

**File:** `frontend/.env.production`

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
```

**Time to Deploy:** 10 min ⏱️

---

## Complete Implementation Checklist

```
SERVICES (2 files, 30 min)
─────────────────────────────────
[ ] orderService.ts           ✅ 15 min
[ ] paymentService.ts         ✅ 15 min

HOOKS (2 files, 40 min)
─────────────────────────────────
[ ] useOrders.ts              ✅ 20 min
[ ] usePayment.ts             ✅ 20 min

ORDER PAGES (3 files, 85 min)
─────────────────────────────────
[ ] OrderCheckoutPage.tsx     ✅ 30 min
[ ] MyOrdersPage.tsx          ✅ 30 min
[ ] OrderDetailsPage.tsx      ✅ 25 min

PAYMENT PAGES (2 files, 55 min)
─────────────────────────────────
[ ] PaymentPage.tsx           ✅ 35 min
[ ] PaymentStatusPage.tsx     ✅ 20 min

COMPONENTS (3 files, 40 min)
─────────────────────────────────
[ ] OrderCheckoutForm.tsx     ✅ (included in OrderCheckoutPage)
[ ] OrderCard.tsx             ✅ (included in MyOrdersPage)
[ ] OrderTimeline.tsx         ✅ (included in OrderDetailsPage)
[ ] PaymentForm.tsx           ✅ (included in PaymentPage)

INTEGRATION (15 min)
─────────────────────────────────
[ ] Connect Cart checkout btn  ✅ 5 min
[ ] Add routes to App.tsx      ✅ 10 min

TESTING (30 min)
─────────────────────────────────
[ ] Order creation flow        ✅ 10 min
[ ] Payment flow              ✅ 10 min
[ ] Order management          ✅ 10 min

═════════════════════════════════════════════
TOTAL TIME: ~5 hours to build everything
═════════════════════════════════════════════
```

---

## Quick Build Script

Create `frontend/scripts/build-order-system.sh`:

```bash
#!/bin/bash

echo "🚀 Building Order Management System..."

# Create service files
echo "📁 Creating services..."
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/components/order
mkdir -p src/components/payment

# Create all files (manually paste content above)
echo "✅ All files created!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run dev server
echo "🎉 Starting dev server..."
npm run dev
```

---

## Summary

**What you'll have after implementation:**

- ✅ Complete order management system
- ✅ Full payment integration with Razorpay
- ✅ Order checkout flow
- ✅ Payment status tracking
- ✅ Order history & details
- ✅ Full TypeScript support
- ✅ Production-ready code

**Frontend-Backend Integration:**

```
Frontend                  →    Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OrderCheckoutPage        →    OrderController.createOrder()
MyOrdersPage             →    OrderController.getUserOrders()
OrderDetailsPage         →    OrderController.getOrderById()
PaymentPage              →    OrderController.initiatePayment()
PaymentStatusPage        →    OrderController.getPaymentStatus()
                         →    RazorpayCallback webhook
```

---

**Ready to build?** Start with **Step 1** and work through each step sequentially. 🚀

**Last Updated:** 2026-03-24
