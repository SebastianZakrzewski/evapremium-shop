/**
 * Hook useTracking - prosty interfejs do trackowania zdarzeń
 */

'use client';

import { useCallback } from 'react';
import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackRemoveFromCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackLead,
  createAddToCartData,
  createInitiateCheckoutData,
  createPurchaseData,
  createViewContentData,
} from '../events';
import type {
  PageViewData,
  ViewContentData,
  AddToCartData,
  InitiateCheckoutData,
  AddPaymentInfoData,
  PurchaseData,
  SearchData,
  LeadData,
  ProductData,
} from '../types';
import type { CartItem } from '@/lib/types/cart-new';
import type { OrderItem } from '@/lib/types/order-new';

export interface UseTrackingReturn {
  trackPageView: (data: PageViewData) => void;
  trackViewContent: (data: ViewContentData) => void;
  trackAddToCart: (data: AddToCartData) => void;
  trackRemoveFromCart: (data: AddToCartData) => void;
  trackInitiateCheckout: (data: InitiateCheckoutData) => void;
  trackAddPaymentInfo: (data: AddPaymentInfoData) => void;
  trackPurchase: (data: PurchaseData) => void;
  trackSearch: (data: SearchData) => void;
  trackLead: (data: LeadData) => void;
  // Helper functions
  createAddToCartData: (item: CartItem, cartTotal?: number) => AddToCartData;
  createInitiateCheckoutData: (items: CartItem[], total: number) => InitiateCheckoutData;
  createPurchaseData: (
    items: OrderItem[],
    orderNumber: string,
    total: number,
    transactionId: string,
    paymentMethod?: string,
    customerEmail?: string,
    customerPhone?: string
  ) => PurchaseData;
  createViewContentData: (product: ProductData, price: number) => ViewContentData;
}

/**
 * Hook do trackowania zdarzeń
 */
export function useTracking(): UseTrackingReturn {
  const handleTrackPageView = useCallback((data: PageViewData) => {
    trackPageView(data);
  }, []);

  const handleTrackViewContent = useCallback((data: ViewContentData) => {
    trackViewContent(data);
  }, []);

  const handleTrackAddToCart = useCallback((data: AddToCartData) => {
    trackAddToCart(data);
  }, []);

  const handleTrackRemoveFromCart = useCallback((data: AddToCartData) => {
    trackRemoveFromCart(data);
  }, []);

  const handleTrackInitiateCheckout = useCallback((data: InitiateCheckoutData) => {
    trackInitiateCheckout(data);
  }, []);

  const handleTrackAddPaymentInfo = useCallback((data: AddPaymentInfoData) => {
    trackAddPaymentInfo(data);
  }, []);

  const handleTrackPurchase = useCallback((data: PurchaseData) => {
    trackPurchase(data);
  }, []);

  const handleTrackSearch = useCallback((data: SearchData) => {
    trackSearch(data);
  }, []);

  const handleTrackLead = useCallback((data: LeadData) => {
    trackLead(data);
  }, []);

  return {
    trackPageView: handleTrackPageView,
    trackViewContent: handleTrackViewContent,
    trackAddToCart: handleTrackAddToCart,
    trackRemoveFromCart: handleTrackRemoveFromCart,
    trackInitiateCheckout: handleTrackInitiateCheckout,
    trackAddPaymentInfo: handleTrackAddPaymentInfo,
    trackPurchase: handleTrackPurchase,
    trackSearch: handleTrackSearch,
    trackLead: handleTrackLead,
    // Helper functions
    createAddToCartData,
    createInitiateCheckoutData,
    createPurchaseData,
    createViewContentData,
  };
}

