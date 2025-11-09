export class PricingService {
  private static readonly SHIPPING_THRESHOLD = 300; // Free shipping above 300 PLN
  private static readonly SHIPPING_COST = 15; // Standard shipping cost
  private static readonly TAX_RATE = 0.23; // 23% VAT

  /**
   * Oblicza koszt dostawy na podstawie wartości zamówienia
   */
  static calculateShippingCost(subtotal: number): number {
    if (subtotal >= this.SHIPPING_THRESHOLD) {
      return 0; // Free shipping
    }
    return this.SHIPPING_COST;
  }

  /**
   * Oblicza podatek VAT
   */
  static calculateTax(amount: number): number {
    return Math.round(amount * this.TAX_RATE * 100) / 100;
  }

  /**
   * Oblicza cenę dywaników z konfiguracją (nowy system cenowy)
   */
  static calculateConfiguratorPrice(
    setType: 'classic' | '3d-with-rims',
    setVariant: 'front' | 'basic' | 'premium' | 'complete'
  ): { basePrice: number; discount: number; shippingCost: number; totalPrice: number } {
    const basePrices = {
      'classic': { front: 290, basic: 510, premium: 710, complete: 350 },
      '3d-with-rims': { front: 550, basic: 910, premium: 1210, complete: 350 }
    };

    const basePrice = basePrices[setType]?.[setVariant] || 0;
    
    // Rabat zależny od wartości: -30% dla ≥910 zł, -20% dla <910 zł
    const discount = basePrice >= 910 ? 0.30 : 0.20;
    const discountAmount = basePrice * discount;
    const priceAfterDiscount = basePrice - discountAmount;
    
    // Koszt wysyłki (27 zł dla 'front', darmowa dla 'basic', 'premium' i 'complete')
    const shippingCost = ['basic', 'premium', 'complete'].includes(setVariant) ? 0 : 27;
    
    const totalPrice = Math.round((priceAfterDiscount + shippingCost) * 100) / 100;

    return {
      basePrice,
      discount: discountAmount,
      shippingCost,
      totalPrice
    };
  }

  /**
   * Oblicza cenę dywaników z konfiguracją (stary system - zachowany dla kompatybilności)
   * UWAGA: Dla wariantu 'complete' (mata do bagażnika) cena bazowa już zawiera rabat!
   */
  static calculateMatPrice(basePrice: number, configuration: any): number {
    let totalPrice = basePrice;

    // Modyfikatory dla rodzaju zestawu
    const setTypeModifiers = {
      'front': 0,
      'basic': 150,
      'premium': 300,
      'complete': 0  // Mata do bagażnika - bez dodatkowych kosztów, cena bazowa już zawiera rabat
    };

    const setType = configuration?.setType;
    console.log('💰 PricingService.calculateMatPrice - Input:', {
      basePrice,
      configuration,
      setType,
      'configuration.setType': configuration?.setType
    });
    
    if (setType && setTypeModifiers[setType as keyof typeof setTypeModifiers] !== undefined) {
      totalPrice += setTypeModifiers[setType as keyof typeof setTypeModifiers];
      console.log('💰 PricingService.calculateMatPrice - Po dodaniu modyfikatora:', {
        setType,
        modifier: setTypeModifiers[setType as keyof typeof setTypeModifiers],
        totalPrice
      });
    }

    // Dla maty do bagażnika zastosuj rabat 20% jeśli jeszcze nie został zastosowany
    if (setType === 'complete' && totalPrice >= 350) {
      const discount = 0.20;
      totalPrice = totalPrice * (1 - discount);
      console.log('💰 PricingService.calculateMatPrice - Zastosowano rabat 20% dla complete:', {
        basePrice,
        totalPriceBeforeDiscount: totalPrice / (1 - discount),
        totalPriceAfterDiscount: totalPrice
      });
    }

    // Modyfikatory dla rodzaju komórek (wyzerowane)
    const cellTypeModifiers = {
      'diamonds': 0,
      'honey': 0  // Wyzerowane - nie doliczamy za personalizację
    };

    const cellType = configuration?.cellType;
    if (cellType && cellTypeModifiers[cellType as keyof typeof cellTypeModifiers] !== undefined) {
      totalPrice += cellTypeModifiers[cellType as keyof typeof cellTypeModifiers];
    }

    // Modyfikator dla ochraniacza pod piętę (wyzerowany)
    if (configuration?.heelPad === 'yes') {
      totalPrice += 0;  // Wyzerowane - nie doliczamy za personalizację
    }

    return Math.round(totalPrice * 100) / 100;
  }

  /**
   * Oblicza cenę zestawu z modyfikatorem rodzaju dywaników
   */
  static calculateSetVariantPrice(
    variantId: string, 
    matTypeId: string, 
    basePrice: number
  ): number {
    const setVariantPrices = {
      'front': 150,
      'basic': 300,
      'premium': 450,
      'complete': 600
    };

    const matTypeModifiers = {
      '3d-with-rims': 0,
      'classic': -40
    };

    const variantPrice = setVariantPrices[variantId as keyof typeof setVariantPrices] || 0;
    const modifier = matTypeModifiers[matTypeId as keyof typeof matTypeModifiers] || 0;

    return variantPrice + modifier;
  }

  /**
   * Oblicza całkowitą cenę zamówienia
   */
  static calculateOrderTotal(
    subtotal: number,
    shippingCost: number = 0,
    discount: number = 0
  ): {
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  } {
    const calculatedShippingCost = shippingCost || this.calculateShippingCost(subtotal);
    const amountBeforeTax = subtotal + calculatedShippingCost - discount;
    const tax = this.calculateTax(amountBeforeTax);
    const total = amountBeforeTax + tax;

    return {
      subtotal,
      shippingCost: calculatedShippingCost,
      tax,
      discount,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Waliduje kod rabatowy
   */
  static validateDiscountCode(code: string, subtotal: number): {
    isValid: boolean;
    discountAmount: number;
    message?: string;
  } {
    const validCodes = {
      'LISTOPAD5': { type: 'percentage', value: 5, minAmount: 0 },
      'WELCOME10': { type: 'percentage', value: 10, minAmount: 100 },
      'SAVE50': { type: 'fixed', value: 50, minAmount: 200 },
      'FREESHIP': { type: 'shipping', value: 15, minAmount: 150 }
    };

    const discount = validCodes[code.toUpperCase() as keyof typeof validCodes];
    
    if (!discount) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Nieprawidłowy kod rabatowy'
      };
    }

    if (subtotal < discount.minAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Minimalna wartość zamówienia: ${discount.minAmount} PLN`
      };
    }

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = Math.round(subtotal * (discount.value / 100) * 100) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = Math.min(discount.value, subtotal);
    }

    return {
      isValid: true,
      discountAmount,
      message: `Rabat ${discount.value}%: ${discountAmount.toFixed(2)} PLN`
    };
  }

  /**
   * Formatuje cenę do wyświetlenia
   */
  static formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined || isNaN(price)) {
      return '0.00 PLN';
    }
    return `${price.toFixed(2)} PLN`;
  }

  /**
   * Formatuje cenę z walutą
   */
  static formatPriceWithCurrency(price: number | null | undefined, currency: string = 'PLN'): string {
    if (price === null || price === undefined || isNaN(price)) {
      return `0.00 ${currency}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  }
}
