"use client";
import React, { memo, useState } from 'react';
import Image from 'next/image';
import { CartItemV2 as CartItemType, isMatCartConfiguration } from '@/lib/types';
import { Minus, Plus } from 'lucide-react';
import { PricingService } from '@/lib/services/PricingService';
import type { MatConfiguration } from '@/features/vehicle-catalog/model/matConfiguration';
import {
  getMatConfigurationLabelContext,
  getMatSetVariantLabel,
  getMatTypeLabel,
  isSinglePriceSetType,
} from '@/shared/mat-set-labels';
import {
  getPodpietkaMountingLabel,
  isPodpietkaMounting,
} from '@/features/car-configurator/domain/podpietkaMounting';
import type { AccessoryCartConfiguration } from '@/lib/types/cart-new';

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

const getMatVariantLabel = (matConfig: MatConfiguration): string =>
  getMatSetVariantLabel(getMatConfigurationLabelContext(matConfig));

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

function ProductPlate({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          width={128}
          height={128}
          className="h-full w-full object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[11px] font-medium tracking-[0.16em] text-neutral-400">EVA</span>
      )}
    </div>
  )
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number
  onChange: (quantity: number) => void
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
      <button
        type="button"
        aria-label="Zmniejsz ilość"
        onClick={() => onChange(quantity - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-200"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
      <span className="w-7 text-center text-[15px] font-medium tabular-nums text-neutral-950">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Zwiększ ilość"
        onClick={() => onChange(quantity + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-200"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-[13px] text-neutral-500">{label}</dt>
      <dd className="max-w-[68%] text-right text-[13px] font-medium leading-snug text-neutral-950">
        {value}
      </dd>
    </div>
  )
}

function PriceBlock({
  subtotal,
  unitPrice,
  quantity,
}: {
  subtotal: number
  unitPrice: number
  quantity: number
}) {
  return (
    <div className="shrink-0 text-right">
      <p className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-neutral-950 tabular-nums">
        {PricingService.formatPrice(subtotal)}
      </p>
      {quantity > 1 && (
        <p className="mt-0.5 whitespace-nowrap text-[12px] text-neutral-500 tabular-nums">
          {PricingService.formatPrice(unitPrice)} × {quantity}
        </p>
      )}
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Usuń z koszyka"
      className="shrink-0 text-[13px] font-medium text-[#ff453a] transition-opacity hover:opacity-70"
    >
      Usuń
    </button>
  )
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
  const config = isMatCartConfiguration(item.configuration)
    ? item.configuration
    : null
  const carDetails = config?.carDetails
  const vehicleName = carDetails
    ? [carDetails.brand, carDetails.model, carDetails.generation].filter(Boolean).join(" ")
    : ""
  const vehicleMeta = carDetails
    ? [carDetails.year, carDetails.bodyType, carDetails.gearbox].filter(Boolean).join(" · ")
    : ""

  return (
    <article className="rounded-[20px] border border-neutral-200 bg-white p-3.5">
      <div className="flex gap-3">
        <ProductPlate src={item.productImage} alt="Dywaniki samochodowe" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-950">
              Dywaniki samochodowe
            </h3>
            <RemoveButton onClick={onRemove} />
          </div>
          {vehicleName && (
            <p className="mt-0.5 text-[13px] leading-snug text-neutral-700">{vehicleName}</p>
          )}
          {vehicleMeta && (
            <p className="mt-0.5 text-[12px] capitalize leading-snug text-neutral-500">{vehicleMeta}</p>
          )}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <QuantityStepper quantity={item.quantity} onChange={onUpdateQuantity} />
            <PriceBlock
              subtotal={item.subtotal}
              unitPrice={item.unitPrice}
              quantity={item.quantity}
            />
          </div>
        </div>
      </div>

      {config && (
        <dl className="mt-3 divide-y divide-neutral-200 border-t border-neutral-200">
          <SpecRow label="Zestaw" value={getMatVariantLabel(config)} />
          {!isSinglePriceSetType(config.setType) && (
            <SpecRow label="Typ" value={getMatTypeLabel(config.setType)} />
          )}
          <SpecRow label="Struktura" value={getPolishCellType(config.cellType)} />
          <SpecRow
            label="Kolor"
            value={`${getPolishColor(config.materialColor)} · obszycie ${getPolishColor(config.edgeColor)}`}
          />
          {config.heelPad === "yes" && (
            <SpecRow label="Dodatki" value="Ochraniacze pod piętę" />
          )}
        </dl>
      )}
    </article>
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
  const accessoryConfig = item.configuration as AccessoryCartConfiguration | undefined
  const mountingLabel =
    accessoryConfig?.mounting && isPodpietkaMounting(accessoryConfig.mounting)
      ? getPodpietkaMountingLabel(accessoryConfig.mounting)
      : ""
  const colorLabel = accessoryConfig?.color

  return (
    <article className="rounded-[20px] border border-neutral-200 bg-white p-3.5">
      <div className="flex gap-3">
        <ProductPlate src={item.productImage} alt={item.productName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-950">
              {item.productName}
            </h3>
            <RemoveButton onClick={onRemove} />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <QuantityStepper quantity={item.quantity} onChange={onUpdateQuantity} />
            <PriceBlock
              subtotal={item.subtotal}
              unitPrice={item.unitPrice}
              quantity={item.quantity}
            />
          </div>
        </div>
      </div>

      {(colorLabel || mountingLabel) && (
        <dl className="mt-3 divide-y divide-neutral-200 border-t border-neutral-200">
          {colorLabel && <SpecRow label="Kolor" value={colorLabel} />}
          {mountingLabel && <SpecRow label="Montaż" value={mountingLabel} />}
        </dl>
      )}
    </article>
  );
}

export const CartItem = memo(CartItemComponent);

