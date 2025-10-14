"use client";

import React from "react";
import { isFeatureEnabled } from "@/lib/config/features";
import CartModalOld from "./cart-modal";
import CartModalNew from "./cart-modal.new";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wrapper komponentu CartModal z automatycznym przełączaniem między V1 a V2
 * 
 * Używa feature flag USE_V2_CART do decydowania, którą wersję użyć.
 * Pozwala na stopniowe wdrażanie nowej wersji.
 */
export default function CartModalWrapper({ isOpen, onClose }: CartModalProps) {
  // Sprawdź feature flag
  const useV2Cart = isFeatureEnabled('USE_V2_CART');

  if (useV2Cart) {
    return <CartModalNew isOpen={isOpen} onClose={onClose} />;
  }

  return <CartModalOld isOpen={isOpen} onClose={onClose} />;
}
