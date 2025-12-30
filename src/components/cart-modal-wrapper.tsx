"use client";

import React from "react";
import CartModal from "./cart-modal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wrapper komponentu CartModal
 * 
 * Uproszczony wrapper - używa tylko jednej wersji CartModal (V2)
 */
export default function CartModalWrapper({ isOpen, onClose }: CartModalProps) {
  return <CartModal isOpen={isOpen} onClose={onClose} />;
}
