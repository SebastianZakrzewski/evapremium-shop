"use client";
import React from 'react';
import Image from 'next/image';
import { CartItemV2 as CartItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { PricingService } from '@/lib/services/PricingService';

// Funkcje tłumaczące angielskie opisy na polskie
function getPolishSetType(setType: string): string {
  const translations: Record<string, string> = {
    '3d': '3D',
    'classic': 'Klasyczne',
    'premium': 'Premium',
    'standard': 'Standardowe'
  };
  return translations[setType] || setType;
}

function getPolishCellType(cellType: string): string {
  const translations: Record<string, string> = {
    'diamonds': 'Diamenty',
    'squares': 'Kwadraty',
    'hexagons': 'Sześciokąty',
    'circles': 'Koła',
    'waves': 'Fale',
    'dots': 'Kropki'
  };
  return translations[cellType] || cellType;
}

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
    <div className="flex items-center space-x-4 p-4 border border-gray-600 rounded-lg bg-gray-800/40 backdrop-blur">
      {/* Obraz produktu */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="text-gray-300 text-xs text-center">
              Dywaniki
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły produktu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white leading-tight">
          {item.productName}
        </h3>
        
        {/* Szczegóły samochodu */}
        {carDetails && (
          <div className="text-sm text-gray-300 mt-1">
            <p>
              {carDetails.brand} {carDetails.model}
              {carDetails.generation && ` ${carDetails.generation}`}
              {carDetails.year && ` (${carDetails.year})`}
            </p>
            {carDetails.bodyType && (
              <p className="text-xs text-gray-400 capitalize">
                {carDetails.bodyType}
              </p>
            )}
          </div>
        )}

        {/* Konfiguracja dywaników */}
        {config && (
          <div className="mt-2 space-y-1">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-700">
                {getPolishSetType(config.setType)}
              </span>
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded border border-green-700">
                {getPolishCellType(config.cellType)}
              </span>
              <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded border border-gray-600">
                Kolor: {config.materialColor}
              </span>
              <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded border border-gray-600">
                Obszycie: {config.edgeColor}
              </span>
              {config.heelPad === 'yes' && (
                <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded border border-orange-700">
                  Ochraniacze pięt
                </span>
              )}
            </div>
          </div>
        )}

        {/* SKU */}
        {item.productSku && (
          <p className="text-xs text-gray-400 mt-1">
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
            className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center font-medium text-white">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Cena */}
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {PricingService.formatPrice(item.subtotal)}
          </p>
          <p className="text-sm text-gray-400">
            {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
          </p>
        </div>

        {/* Przycisk usuwania */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
    <div className="flex items-center space-x-4 p-4 border border-gray-600 rounded-lg bg-gray-800/40 backdrop-blur">
      {/* Obraz produktu */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="text-gray-300 text-xs text-center">
              Akcesorium
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły produktu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white leading-tight">
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
            className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center font-medium text-white">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Cena */}
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {PricingService.formatPrice(item.subtotal)}
          </p>
          <p className="text-sm text-gray-400">
            {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
          </p>
        </div>

        {/* Przycisk usuwania */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
