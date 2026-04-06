import api from './api';
import type {
  PromoCode,
  PromoCodeValidation,
  PromoCodeError,
  PromoValidationRequest,
  PromoCodeResponse,
  AppliedCoupon,
  CouponBenefit
} from '../types/promo';

const PROMO_API_BASE = '/api/promo-codes';

class PromoCodeService {
  /**
   * Get all available promo codes
   */
  async getAvailablePromoCodes(): Promise<PromoCode[]> {
    try {
      const response = await api.get(`${PROMO_API_BASE}/available`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return [];
    }
  }

  /**
   * Get promo code details by code
   */
  async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    try {
      const response = await api.get(`${PROMO_API_BASE}/${code}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching promo code ${code}:`, error);
      return null;
    }
  }

  /**
   * Validate promo code for cart
   * POST /api/promo-codes/validate
   * Body: { code, cartValue, testIds[] }
   */
  async validatePromoCode(
    code: string,
    cartValue: number,
    testIds?: string[]
  ): Promise<PromoCodeValidation | null> {
    try {
      const request: PromoValidationRequest = {
        code,
        cartValue,
        testIds
      };

      const response = await api.post(`${PROMO_API_BASE}/validate`, request);
      
      if (response.data.success) {
        return {
          isValid: true,
          code: response.data.data.code,
          discountType: response.data.data.discount_type,
          discountValue: response.data.data.discount_value,
          discountAmount: response.data.data.discount_amount,
          maxDiscount: response.data.data.max_discount,
          minCartValue: response.data.data.min_cart_value,
          message: response.data.data.message,
          termsAndConditions: response.data.data.terms_and_conditions
        };
      } else {
        return {
          isValid: false,
          code,
          discountType: 'FLAT',
          discountValue: 0,
          discountAmount: 0,
          message: response.data.error?.message || 'Invalid promo code'
        };
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      return {
        isValid: false,
        code,
        discountType: 'FLAT',
        discountValue: 0,
        discountAmount: 0,
        message: error.response?.data?.error?.message || 'Failed to validate promo code'
      };
    }
  }

  /**
   * Apply promo code to cart (backend will calculate discount)
   * POST /api/promo-codes/apply
   */
  async applyPromoCode(
    code: string,
    cartValue: number,
    testIds?: string[]
  ): Promise<AppliedCoupon | PromoCodeError> {
    try {
      const response = await api.post(`${PROMO_API_BASE}/apply`, {
        code,
        cartValue,
        testIds
      });

      if (response.data.success) {
        const data = response.data.data;
        return {
          code: data.code,
          benefit: {
            type: data.discount_type,
            value: data.discount_value,
            maxDiscount: data.max_discount,
            applicableItems: data.applicable_tests
          },
          message: data.message || `Promo code applied successfully! You saved ₹${data.discount_amount}`
        };
      } else {
        const error = response.data.error;
        return {
          code: error.code || 'INVALID_CODE',
          message: error.message,
          details: error.details
        };
      }
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      return {
        code: 'APPLICATION_ERROR',
        message: error.response?.data?.error?.message || 'Failed to apply promo code',
        details: error.response?.data?.error?.details
      };
    }
  }

  /**
   * Remove applied promo code from cart
   * POST /api/promo-codes/remove
   */
  async removePromoCode(code: string): Promise<boolean> {
    try {
      const response = await api.post(`${PROMO_API_BASE}/remove`, { code });
      return response.data.success;
    } catch (error) {
      console.error('Error removing promo code:', error);
      return false;
    }
  }

  /**
   * Get user's promo code history (used codes)
   */
  async getUserPromoHistory(): Promise<PromoCode[]> {
    try {
      const response = await api.get(`${PROMO_API_BASE}/history`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching promo history:', error);
      return [];
    }
  }

  /**
   * Search promo codes by category or type
   */
  async searchPromoCodes(query: string, category?: string): Promise<PromoCode[]> {
    try {
      const params: Record<string, string> = { q: query };
      if (category) params.category = category;
      
      const response = await api.get(`${PROMO_API_BASE}/search`, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching promo codes:', error);
      return [];
    }
  }

  /**
   * Get featured/trending promo codes
   */
  async getFeaturedPromoCodes(limit: number = 5): Promise<PromoCode[]> {
    try {
      const response = await api.get(`${PROMO_API_BASE}/featured`, {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching featured promo codes:', error);
      return [];
    }
  }

  /**
   * Calculate discount for a given cart value and promo code
   */
  calculateDiscount(
    cartValue: number,
    discount: number,
    discountType: 'PERCENTAGE' | 'FLAT',
    maxDiscount?: number
  ): number {
    let discountAmount = 0;

    if (discountType === 'PERCENTAGE') {
      discountAmount = (cartValue * discount) / 100;
      if (maxDiscount) {
        discountAmount = Math.min(discountAmount, maxDiscount);
      }
    } else {
      discountAmount = discount;
    }

    return Math.round(discountAmount);
  }

  /**
   * Get final price after applying discount
   */
  getFinalPrice(cartValue: number, discountAmount: number, taxPercentage: number = 0): number {
    const afterDiscount = cartValue - discountAmount;
    const tax = (afterDiscount * taxPercentage) / 100;
    return Math.round(afterDiscount + tax);
  }
}

export const promoCodeService = new PromoCodeService();
