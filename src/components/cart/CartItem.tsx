"use client";
import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/lib/types/cart-new';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { PricingService } from '@/lib/services/PricingService';

interface CartItemProps {
  item: CartItemType;
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

/**
 * Komponent wyświetlający pojedynczą pozycję w koszyku
 * 
 * Obsługuje zarówno dywaniki (z konfiguracją) jak i akcesoria.
 * Automatycznie wybiera odpowiedni layout na podstawie productType.
 */
export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  // Różne renderowanie dla dywaników vs akcesoriów
  if (item.productType === 'mat') {
    return <MatCartItem item={item} onRemove={handleRemove} onUpdateQuantity={handleQuantityChange} />;
  }

  return <AccessoryCartItem item={item} onRemove={handleRemove} onUpdateQuantity={handleQuantityChange} />;
}

/**
 * Komponent dla dywaników w koszyku
 */
function MatCartItem({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}: { 
  item: CartItemType; 
  onRemove: () => void; 
  onUpdateQuantity: (quantity: number) => void; 
}) {
  const config = item.configuration;
  const carDetails = config?.carDetails;

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
      {/* Obraz produktu */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="text-gray-400 text-xs text-center">
              Dywaniki
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły produktu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {item.productName}
        </h3>
        
        {/* Szczegóły samochodu */}
        {carDetails && (
          <div className="text-sm text-gray-600 mt-1">
            <p>
              {carDetails.brand} {carDetails.model}
              {carDetails.generation && ` ${carDetails.generation}`}
              {carDetails.year && ` (${carDetails.year})`}
            </p>
            {carDetails.bodyType && (
              <p className="text-xs text-gray-500 capitalize">
                {carDetails.bodyType}
              </p>
            )}
          </div>
        )}

        {/* Konfiguracja dywaników */}
        {config && (
          <div className="mt-2 space-y-1">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {config.setType}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                {config.cellType}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                {config.materialColor}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                {config.edgeColor}
              </span>
              {config.heelPad === 'yes' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                  Ochraniacze pięt
                </span>
              )}
            </div>
          </div>
        )}

        {/* SKU */}
        {item.productSku && (
          <p className="text-xs text-gray-500 mt-1">
            SKU: {item.productSku}
          </p>
        )}
      </div>

      {/* Kontrolki ilości i cena */}
      <div className="flex flex-col items-end space-y-2">
        {/* Kontrolki ilości */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Cena */}
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {PricingService.formatPrice(item.subtotal)}
          </p>
          <p className="text-sm text-gray-500">
            {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
          </p>
        </div>

        {/* Przycisk usuwania */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Komponent dla akcesoriów w koszyku
 */
function AccessoryCartItem({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}: { 
  item: CartItemType; 
  onRemove: () => void; 
  onUpdateQuantity: (quantity: number) => void; 
}) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
      {/* Obraz produktu */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="text-gray-400 text-xs text-center">
              Akcesorium
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły produktu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {item.productName}
        </h3>
        
        {/* SKU */}
        {item.productSku && (
          <p className="text-sm text-gray-500 mt-1">
            SKU: {item.productSku}
          </p>
        )}
      </div>

      {/* Kontrolki ilości i cena */}
      <div className="flex flex-col items-end space-y-2">
        {/* Kontrolki ilości */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Cena */}
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {PricingService.formatPrice(item.subtotal)}
          </p>
          <p className="text-sm text-gray-500">
            {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
          </p>
        </div>

        {/* Przycisk usuwania */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
