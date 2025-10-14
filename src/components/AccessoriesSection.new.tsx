"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { useAccessories } from '@/hooks/useAccessories';
import { useCart } from '@/hooks/useCart.new';
import { PricingService } from '@/lib/services/PricingService';
import { debugLog } from '@/lib/config/features';

interface AccessoriesSectionProps {
  className?: string;
}

/**
 * Nowy AccessoriesSection używający V2 backendu
 * 
 * Różnice względem starej wersji:
 * - Używa useAccessories hook do pobierania danych z API
 * - Używa useCart.new.ts (V2) do dodawania do koszyka
 * - Używa PricingService do formatowania cen
 * - Dynamiczne pobieranie kategorii i produktów z backendu
 * - Zachowuje identyczny wygląd i funkcjonalność
 */
export default function AccessoriesSectionNew({ className = '' }: AccessoriesSectionProps) {
  const { 
    accessories, 
    categories, 
    isLoading, 
    error,
    getAccessoriesByCategory,
    getAllCategories 
  } = useAccessories();
  
  const { addToCart, isLoading: cartLoading } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredAccessories, setFilteredAccessories] = useState(accessories);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Load categories on mount
  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  // Filter accessories based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredAccessories(accessories);
    } else {
      const categoryAccessories = accessories.filter(accessory => 
        accessory.category?.slug === selectedCategory
      );
      setFilteredAccessories(categoryAccessories);
    }
  }, [selectedCategory, accessories]);

  const handleAddToCart = async (accessory: any) => {
    try {
      await addToCart({
        productType: 'accessory',
        productId: accessory.id,
        quantity: 1,
        productName: accessory.name,
        productSku: accessory.sku,
        productImage: accessory.imageUrl || accessory.imageSrc,
        unitPrice: accessory.price,
      });

      debugLog('AccessoriesSection: Added to cart', accessory);
      
      // Show success message or open cart modal
      window.dispatchEvent(new CustomEvent('openCartModal'));
    } catch (error) {
      console.error('Error adding accessory to cart:', error);
    }
  };

  const toggleWishlist = (accessoryId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(accessoryId)) {
        newWishlist.delete(accessoryId);
      } else {
        newWishlist.add(accessoryId);
      }
      return newWishlist;
    });
  };

  const handleCategoryChange = async (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    
    if (categorySlug === 'all') {
      setFilteredAccessories(accessories);
    } else {
      try {
        const categoryAccessories = await getAccessoriesByCategory(categorySlug);
        setFilteredAccessories(categoryAccessories);
      } catch (error) {
        console.error('Error fetching accessories by category:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Ładowanie akcesoriów...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Błąd ładowania akcesoriów
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Akcesoria Samochodowe
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uzupełnij swój samochód o wysokiej jakości akcesoria, które podniosą komfort i funkcjonalność
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('all')}
            className="px-6 py-2"
          >
            Wszystkie
          </Button>
          {categories.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(category.slug)}
              className="px-6 py-2"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Accessories Grid */}
        {filteredAccessories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Brak akcesoriów w tej kategorii
            </h3>
            <p className="text-gray-500">
              Sprawdź inne kategorie lub wróć później
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAccessories.map((accessory) => (
              <Card key={accessory.id} className="group hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    {(accessory.imageUrl || accessory.imageSrc) ? (
                      <Image
                        src={accessory.imageUrl || accessory.imageSrc || ''}
                        alt={accessory.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(accessory.id)}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          wishlist.has(accessory.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </button>

                    {/* Stock Badge */}
                    {accessory.stockQuantity !== undefined && accessory.stockQuantity > 0 && (
                      <Badge 
                        variant={accessory.stockQuantity < 10 ? "destructive" : "default"}
                        className="absolute top-2 left-2"
                      >
                        {accessory.stockQuantity < 10 ? 'Ostatnie sztuki' : 'Dostępne'}
                      </Badge>
                    )}

                    {/* Out of Stock Overlay */}
                    {accessory.stockQuantity !== undefined && accessory.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-white bg-gray-600">
                          Niedostępne
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {accessory.name}
                    </h3>

                    {/* Description */}
                    {accessory.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {accessory.description}
                      </p>
                    )}

                    {/* SKU */}
                    {accessory.sku && (
                      <p className="text-xs text-gray-500 mb-3">
                        SKU: {accessory.sku}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {PricingService.formatPrice(accessory.price)}
                        </span>
                        {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {PricingService.formatPrice(accessory.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {accessory.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {accessory.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(accessory)}
                        disabled={cartLoading || (accessory.stockQuantity !== undefined && accessory.stockQuantity === 0)}
                        className="flex-1"
                      >
                        {cartLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {accessory.stockQuantity === 0 ? 'Niedostępne' : 'Dodaj do koszyka'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredAccessories.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Pokaż więcej akcesoriów
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
