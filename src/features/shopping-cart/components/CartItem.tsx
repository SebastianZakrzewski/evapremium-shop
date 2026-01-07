"use client";
import React, { memo } from 'react';
import Image from 'next/image';
import { CartItemV2 as CartItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { PricingService } from '@/lib/services/PricingService';

// Funkcje tłumaczące angielskie opisy na polskie
function getPolishSetType(setType: string): string {
  const translations: Record<string, string> = {
    '3d-with-rims': '3D z rantami',
    'classic': '3D bez rantów',
    'premium': 'Premium',
    'standard': 'Standardowe'
  };
  return translations[setType] || setType;
}

function getPolishCellType(cellType: string): string {
  const translations: Record<string, string> = {
    'diamonds': 'Romby',
    'honey': 'Plaster miodu',
    'squares': 'Kwadraty',
    'hexagons': 'Sześciokąty',
    'circles': 'Koła',
    'waves': 'Fale',
    'dots': 'Kropki',
    'rombs': 'Romby'
  };
  return translations[cellType] || cellType;
}

function getPolishSetVariant(setVariant: string): string {
  const translations: Record<string, string> = {
    'front': 'Starter (przód)',
    'basic': 'Podstawowy (przód + tył)',
    'premium': 'Premium (przód + tył + bagażnik)',
    'complete': 'Mata do bagażnika'
  };
  return translations[setVariant] || setVariant;
}

function getPolishColor(color: string): string {
  const translations: Record<string, string> = {
    // Kolory podstawowe
    'black': 'Czarny',
    'white': 'Biały',
    'grey': 'Szary',
    'gray': 'Szary',
    'brown': 'Brązowy',
    'beige': 'Beżowy',
    'red': 'Czerwony',
    'blue': 'Niebieski',
    'green': 'Zielony',
    'yellow': 'Żółty',
    'pink': 'Różowy',
    'purple': 'Fioletowy',
    'orange': 'Pomarańczowy',
    'lime': 'Limonkowy',
    
    // Kolory z polskimi nazwami
    'niebieski': 'Niebieski',
    'czerwony': 'Czerwony',
    'żółty': 'Żółty',
    'kość słoniowa': 'Kość słoniowa',
    'ciemnoniebieski': 'Ciemnoniebieski',
    'bordowy': 'Bordowy',
    'pomarańczowy': 'Pomarańczowy',
    'jasnobeżowy': 'Jasnobeżowy',
    'ciemnoszary': 'Ciemnoszary',
    'fioletowy': 'Fioletowy',
    'limonkowy': 'Limonkowy',
    'beżowy': 'Beżowy',
    'różowy': 'Różowy',
    'czarny': 'Czarny',
    'ciemnozielony': 'Ciemnozielony',
    'brązowy': 'Brązowy',
    'biały': 'Biały',
    'jasnoszary': 'Jasnoszary',
    'zielony': 'Zielony',
    
    // Kolory angielskie z mapowaniem
    'ivory': 'Kość słoniowa',
    'darkblue': 'Ciemnoniebieski',
    'maroon': 'Bordowy',
    'lightbeige': 'Jasnobeżowy',
    'darkgrey': 'Ciemnoszary',
    'lightgrey': 'Jasnoszary',
    'darkgreen': 'Ciemnozielony'
  };
  return translations[color] || color;
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
function CartItemComponent({ item, onRemove, onUpdateQuantity }: CartItemProps) {
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
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header z nazwą produktu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            Dywaniki samochodowe
          </h3>
          
          {/* Szczegóły samochodu */}
          {carDetails && (
            <div className="text-sm text-neutral-300">
              <p className="font-medium">
                {carDetails.brand} {carDetails.model}
                {carDetails.generation && ` ${carDetails.generation}`}
                {carDetails.year && ` (${carDetails.year})`}
              </p>
              {carDetails.bodyType && (
                <p className="text-xs text-neutral-400 capitalize mt-1">
                  {carDetails.bodyType}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Obraz produktu */}
        <div className="ml-4">
          <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center overflow-hidden">
            {item.productImage ? (
              <Image
                src={item.productImage}
                alt="Dywaniki samochodowe"
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="text-neutral-400 text-xs text-center">
                🚗
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Konfiguracja dywaników */}
      {config && (
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Wariant zestawu */}
            <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-300">Zestaw:</span>
              <span className="text-sm font-medium text-white">
                {getPolishSetVariant(config.setVariant)}
              </span>
            </div>

            {/* Typ dywaników */}
            <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-300">Typ:</span>
              <span className="text-sm font-medium text-white">
                {getPolishSetType(config.setType)}
              </span>
            </div>

            {/* Struktura komórek */}
            <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-300">Struktura:</span>
              <span className="text-sm font-medium text-white">
                {getPolishCellType(config.cellType)}
              </span>
            </div>

            {/* Kolory */}
            <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-300">Kolor:</span>
              <span className="text-sm font-medium text-white">
                {getPolishColor(config.materialColor)} + {getPolishColor(config.edgeColor)} obszycie
              </span>
            </div>

            {/* Ochraniacze pięt */}
            {config.heelPad === 'yes' && (
              <div className="flex items-center justify-between py-2 px-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                <span className="text-sm text-orange-300">Dodatki:</span>
                <span className="text-sm font-medium text-orange-200">
                  Ochraniacze pod piętę
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer z kontrolkami i ceną */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
        {/* Kontrolki ilości */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="h-9 w-9 p-0 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-8 text-center font-semibold text-white text-lg">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="h-9 w-9 p-0 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Cena i przycisk usuwania */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xl font-bold text-white">
              {PricingService.formatPrice(item.subtotal)}
            </p>
            <p className="text-sm text-neutral-400">
              {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
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

export const CartItem = memo(CartItemComponent);

