# Promo Code System - Frontend Integration Guide

## Overview

This guide documents the complete promo code system integrated into the healthcare lab testing platform. The system allows users to apply discount codes during checkout and provides administrative interfaces for managing promo codes.

## Architecture

### Components

- **PromoCodeInput** - Enhanced input component with validation and suggestions
- **PromotionalOffersWidget** - Dashboard widget displaying featured offers
- **PromoCodesPage** - Full-page promo code browsing and management

### Services

- **PromoCodeService** - Centralized API service for all promo code operations
- **usePromoCodes** - Custom React hook for promo code management

### Types

- **PromoCode** - Database model
- **PromoCodeValidation** - Validation response
- **AppliedCoupon** - Applied coupon state
- **PromoCodeError** - Error details

## Usage

### 1. Using PromoCodeInput Component

The main component for promo code input with validation and suggestions.

```typescript
import PromoCodeInput from '@/components/payment/PromoCodeInput';

<PromoCodeInput
  cartValue={1500}
  appliedCoupon={undefined}
  onApplyPromo={async (coupon) => {
    console.log('Applied:', coupon.code);
  }}
  onRemovePromo={async () => {
    console.log('Removed');
  }}
  testIds={['test1', 'test2']}
  showSuggestions={true}
  showFeatured={false}
/>
```

### 2. Using usePromoCodes Hook

Custom hook for managing promo codes programmatically.

```typescript
import { usePromoCodes } from '@/hooks/usePromoCodes';

const MyComponent = () => {
  const {
    appliedCoupon,
    validationError,
    isValidating,
    applyPromoCode,
    removePromoCode,
    getDiscountedPrice
  } = usePromoCodes();

  const handleApply = async () => {
    const coupon = await applyPromoCode('SAVE20', 1500);
    if (coupon) {
      console.log(`Saved: ₹${coupon.benefit.value}`);
    }
  };

  return (
    <div>
      <button onClick={handleApply}>Apply SAVE20</button>
      {appliedCoupon && (
        <p>Final Price: ₹{getDiscountedPrice(1500)}</p>
      )}
    </div>
  );
};
```

### 3. Displaying Promotional Offers

Add the widget to your dashboard.

```typescript
import PromotionalOffersWidget from '@/components/dashboard/PromotionalOffersWidget';

<PromotionalOffersWidget
  limit={4}
  onPromoSelect={(code) => {
    // Navigate to cart with promo code
    navigate(`/cart?promo=${code}`);
  }}
  showViewAll={true}
/>
```

### 4. Promo Codes Page

Full-page promo code browsing.

```typescript
import PromoCodesPage from '@/pages/PromoCodesPage';

// In your router configuration
{
  path: '/promos',
  element: <PromoCodesPage />
}
```

## PromoCodeService API

### Methods

#### `getAvailablePromoCodes()`
Fetch all active promo codes.

```typescript
const codes = await promoCodeService.getAvailablePromoCodes();
```

#### `getPromoCodeByCode(code: string)`
Get details of a specific promo code.

```typescript
const promo = await promoCodeService.getPromoCodeByCode('SAVE20');
```

#### `validatePromoCode(code: string, cartValue: number, testIds?: string[])`
Validate if a promo code is applicable.

```typescript
const validation = await promoCodeService.validatePromoCode(
  'SAVE20',
  1500,
  ['test1', 'test2']
);

if (validation?.isValid) {
  console.log(`Discount: ₹${validation.discountAmount}`);
}
```

#### `applyPromoCode(code: string, cartValue: number, testIds?: string[])`
Apply promo code and get discount details.

```typescript
const result = await promoCodeService.applyPromoCode(
  'SAVE20',
  1500,
  ['test1']
);

if ('benefit' in result) {
  console.log('Success:', result.message);
} else {
  console.log('Error:', result.message);
}
```

#### `removePromoCode(code: string)`
Remove applied promo code.

```typescript
const success = await promoCodeService.removePromoCode('SAVE20');
```

#### `getFeaturedPromoCodes(limit?: number)`
Get featured/trending promo codes.

```typescript
const featured = await promoCodeService.getFeaturedPromoCodes(5);
```

#### `calculateDiscount(cartValue, discount, discountType, maxDiscount?)`
Calculate discount amount locally.

```typescript
const discount = promoCodeService.calculateDiscount(
  1500,        // cart value
  20,          // discount value
  'PERCENTAGE', // type
  300          // max discount
);
// Result: 300 (min of 20% of 1500 and max 300)
```

#### `getFinalPrice(cartValue, discountAmount, taxPercentage?)`
Calculate final price after discount and tax.

```typescript
const final = promoCodeService.getFinalPrice(
  1500,   // cart value
  300,    // discount amount
  18      // tax percentage (GST)
);
```

## Backend API Integration

### Validation Endpoint
```
POST /api/promo-codes/validate

Request:
{
  "code": "SAVE20",
  "cartValue": 1500,
  "testIds": ["test1", "test2"]
}

Response:
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discount_type": "PERCENTAGE",
    "discount_value": 20,
    "discount_amount": 300,
    "max_discount": null,
    "min_cart_value": 500,
    "message": "Valid code",
    "terms_and_conditions": { ... }
  }
}
```

### Apply Endpoint
```
POST /api/promo-codes/apply

Request:
{
  "code": "SAVE20",
  "cartValue": 1500,
  "testIds": ["test1"]
}

Response:
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discount_type": "PERCENTAGE",
    "discount_value": 20,
    "discount_amount": 300,
    "message": "Promo code applied successfully!"
  }
}
```

### List Available Endpoint
```
GET /api/promo-codes/available

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "SAVE20",
      "description": "Save 20% on all tests",
      "discount_type": "PERCENTAGE",
      "discount_value": 20,
      "expiry_date": "2025-12-31",
      "is_active": true,
      ...
    }
  ]
}
```

## Features

### ✅ Implemented Features

1. **Code Validation**
   - Real-time validation before application
   - Error handling for expired/invalid codes
   - Minimum cart value checks

2. **Smart Suggestions**
   - Dropdown suggestions while typing
   - Featured offers widget
   - Recently used promos

3. **User Experience**
   - Copy-to-clipboard functionality
   - Instant visual feedback
   - Toast notifications
   - Loading states

4. **Filtering & Browsing**
   - Search by code or description
   - Filter by discount type
   - Sort by discount/expiry
   - Browse all available codes

5. **Discount Calculation**
   - Percentage-based discounts
   - Flat amount discounts
   - Max discount caps
   - Tax calculation

6. **Integration**
   - Seamless Cart integration
   - Dashboard widget
   - Dedicated promo page
   - URL parameter support (`/cart?promo=SAVE20`)

## Styling

All components use modern CSS with:
- Gradient backgrounds
- Smooth animations
- Responsive design
- Dark mode support (if configured)
- Accessibility features

### CSS Files

- `PromoCodeInput.css` - Input component styling
- `PromotionalOffersWidget.css` - Widget styling
- `PromoCodesPage.css` - Full-page styling

## Error Handling

The system handles various error scenarios:

```typescript
// Expired codes
{
  code: 'EXPIRED',
  message: 'This promo code has expired',
  details: { reason: 'EXPIRED' }
}

// Minimum cart value not met
{
  code: 'MIN_CART_VALUE',
  message: 'Minimum cart value not met',
  details: {
    reason: 'MIN_CART_VALUE',
    minCartValue: 500,
    currentCartValue: 300
  }
}

// Usage limit exceeded
{
  code: 'USAGE_LIMIT',
  message: 'This code has reached its usage limit',
  details: { reason: 'USAGE_LIMIT' }
}

// Not applicable to cart
{
  code: 'NOT_APPLICABLE',
  message: 'This code is not applicable to your cart',
  details: { reason: 'NOT_APPLICABLE' }
}
```

## Development Tips

### Mock Data
During development, use the mock data in `PromoCodesPage.tsx`:

```typescript
const mockCodes = [
  {
    id: '1',
    code: 'SAVE20',
    description: 'Save 20% on all tests',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    ...
  }
];
```

### Testing
Test the integration with these scenarios:

1. Valid promo code application
2. Expired code rejection
3. Minimum cart value validation
4. Not applicable code handling
5. Code removal and re-application
6. Multiple discount types
7. Max discount capping

### Performance
- Debounce search inputs
- Memoize component props
- Lazy load promo lists
- Cache validation results

## Future Enhancements

1. **User Promo History**
   - Track used promo codes
   - Show previously used codes
   - Suggest based on usage pattern

2. **Referral System**
   - Generate unique codes for users
   - Track referral discounts
   - Reward programs

3. **A/B Testing**
   - Test different discount amounts
   - Measure conversion impact
   - Optimize code performance

4. **Analytics**
   - Track promo code usage
   - Monitor conversion rates
   - Identify popular codes

5. **Admin Dashboard**
   - Create/edit/delete codes
   - Set expiry dates
   - View usage statistics
   - Manage test applicability

## Support

For issues or questions:
1. Check component props and types
2. Review error messages
3. Check backend API responses
4. Enable debug logging
5. Contact DevOps team

---

**Last Updated:** 2024
**Maintainer:** Frontend Team
