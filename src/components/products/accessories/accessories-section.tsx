"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Accessory } from "@/entities/product";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { useCart } from "@/features/shopping-cart/hooks/useCart";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AccessoryCard from "./accessory-card";
import AccessoryDetailsSheet from "./accessory-details-sheet";
import { formatPriceCurrency } from "@/lib/utils/formatPrice";

const MAIN_CATEGORIES = ["Organizery do Bagażnika", "Podpiętki"];

function productCountLabel(count: number) {
  if (count === 1) return "1 produkt";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} produkty`;
  }
  return `${count} produktów`;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
}

export default function AccessoriesSection() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const { 
    accessories, 
    categories, 
    isLoading, 
    error,
    getAccessoriesByCategory: getAccessoriesByCategorySlug 
  } = useAccessories();

  const { addToCart } = useCart();
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 5000],
    inStock: false
  });

  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  
  // Sprawdź które główne kategorie są wybrane
  const selectedMainCategories = useMemo(() => {
    return filters.categories.filter(cat => MAIN_CATEGORIES.includes(cat));
  }, [filters.categories]);

  // Podkategorie - pokazuj tylko te, które należą do wybranych głównych kategorii
  const availableCategories = useMemo(() => {
    let filtered = categories;
    
    // Jeśli wybrano główną kategorię, pokaż tylko podkategorie z tej głównej kategorii
    if (selectedMainCategories.length > 0) {
      filtered = categories.filter(cat => {
        // Jeśli kategoria jest główną kategorią, nie pokazuj jej w podkategoriach
        if (MAIN_CATEGORIES.includes(cat.name)) {
          return false;
        }
        
        // Sprawdź czy kategoria należy do którejś z wybranych głównych kategorii
        return selectedMainCategories.some(mainCat => {
          const catNameLower = cat.name.toLowerCase();
          const mainCatLower = mainCat.toLowerCase();
          
          if (mainCatLower.includes('organizer')) {
            return catNameLower.includes('organizer') || catNameLower.includes('bagażnik');
          } else if (mainCatLower.includes('podpięt')) {
            return catNameLower.includes('podpięt') || catNameLower.includes('podpiet');
          }
          return false;
        });
      });
    } else {
      // Jeśli nie wybrano głównej kategorii, pokaż wszystkie oprócz głównych
      filtered = categories.filter(cat => !MAIN_CATEGORIES.includes(cat.name));
    }
    
    return filtered.map(cat => cat.name).sort();
  }, [categories, selectedMainCategories]);

  const filteredAccessories = useMemo(() => {
    let filtered = accessories;

    // Filtruj po kategoriach (główne + podkategorie)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(accessory => {
        if (!accessory.category) return false;
        
        const categoryName = accessory.category.name;
        
        // Sprawdź główne kategorie przez productType (PRIORYTET)
        const hasOrganizerFilter = filters.categories.includes('Organizery do Bagażnika');
        const hasPodpietkaFilter = filters.categories.includes('Podpiętki');
        
        // Jeśli wybrano główną kategorię, sprawdź productType najpierw
        if (hasOrganizerFilter || hasPodpietkaFilter) {
          // Użyj productType jeśli jest dostępny (priorytet)
          if (accessory.productType) {
            // Debug: sprawdź wartości
            if (hasOrganizerFilter && accessory.productType === 'organizer') {
              return true;
            }
            if (hasPodpietkaFilter && accessory.productType === 'podpietka') {
              return true;
            }
            return false;
          }
          // Fallback do sprawdzania nazwy kategorii (dla produktów bez productType)
          else {
            const catNameLower = categoryName.toLowerCase();
            
            if (hasOrganizerFilter) {
              if (catNameLower.includes('organizer') || catNameLower.includes('bagażnik')) {
                return true;
              }
            }
            if (hasPodpietkaFilter) {
              if (catNameLower.includes('podpięt') || catNameLower.includes('podpiet')) {
                return true;
              }
            }
            // Jeśli nie pasuje do żadnej głównej kategorii
            return false;
          }
        }
        
        // Sprawdź czy produkt należy do wybranej kategorii (dokładne dopasowanie dla podkategorii)
        if (filters.categories.includes(categoryName)) {
          return true;
        }
        
        return false;
      });
    }

    const [minPrice, maxPrice] = filters.priceRange;
    filtered = filtered.filter(accessory => {
      return accessory.price >= minPrice && accessory.price <= maxPrice;
    });

    if (filters.inStock) {
      filtered = filtered.filter(accessory => accessory.inStock);
    }

    return filtered;
  }, [accessories, filters]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryName]
        : prev.categories.filter(cat => cat !== categoryName)
    }));
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }));
  };

  const handleInStockChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      inStock: checked
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 5000],
      inStock: false
    });
  };

  const handleAddToCart = async (accessory: Accessory, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await addToCart({
        productType: 'accessory',
        productId: accessory.id,
        quantity: 1
      });
      toast.success(`Dodano "${accessory.name}" do koszyka`);
    } catch (error) {
      console.error('Błąd dodawania do koszyka:', error);
      toast.error('Nie udało się dodać produktu do koszyka');
    }
  };

  const [categoryAccessories, setCategoryAccessories] = useState<Accessory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setLoadingCategory(true);
      getAccessoriesByCategorySlug(categoryParam).then(accessories => {
        setCategoryAccessories(accessories);
        setLoadingCategory(false);
      }).catch(() => {
        setCategoryAccessories([]);
        setLoadingCategory(false);
      });
    }
  }, [categoryParam, getAccessoriesByCategorySlug]);

  const currentAccessories = categoryParam ? categoryAccessories : filteredAccessories;
  const activeFiltersCount = filters.categories.length + (filters.inStock ? 1 : 0) + (filters.priceRange[1] < 5000 ? 1 : 0);
  const collectionTitle = categoryParam
    ? categoryParam.replace(/-/g, " ")
    : "Akcesoria samochodowe";
  const extraCategories =
    selectedMainCategories.length > 0 ? [] : availableCategories;

  const chipClass = (active: boolean) =>
    `shrink-0 border-b-2 pb-2 text-sm transition-colors ${
      active
        ? "border-red-600 text-white"
        : "border-transparent text-white/45 hover:text-white"
    }`;

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">Wystąpił błąd</div>
          <p className="text-gray-400">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="border-white/20 text-white hover:bg-white/10">
            Spróbuj ponownie
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-black pb-20 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pt-12">
        <nav className="flex items-center gap-2 text-xs tracking-wide text-white/40">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/70">Akcesoria</span>
        </nav>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-500">Kolekcja</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl">
              {collectionTitle}
            </h1>
            <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-white/55 md:text-base">
              {categoryParam
                ? `Produkty z kolekcji ${collectionTitle}.`
                : "Organizery do bagażnika i podpiętki. Dodatki, które chronią dywanik i utrzymują porządek we wnętrzu."}
            </p>
          </div>
          {!isLoading && !loadingCategory && (
            <p className="text-sm text-white/40">{productCountLabel(currentAccessories.length)}</p>
          )}
        </div>

        {!categoryParam && (
          <div className="mt-10 space-y-4 border-b border-white/10 pb-5">
            <div className="flex gap-5 overflow-x-auto">
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    categories: [],
                  }))
                }
                className={chipClass(filters.categories.length === 0)}
              >
                Wszystkie
              </button>
              {MAIN_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(category, !filters.categories.includes(category))
                  }
                  className={chipClass(filters.categories.includes(category))}
                >
                  {category}
                </button>
              ))}
              {extraCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(category, !filters.categories.includes(category))
                  }
                  className={chipClass(filters.categories.includes(category))}
                >
                  {category}
                </button>
              ))}
            </div>

            {selectedMainCategories.length > 0 && availableCategories.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pl-1">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(category, !filters.categories.includes(category))
                    }
                    className={chipClass(filters.categories.includes(category))}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-w-0 flex-1 items-center gap-4 text-sm text-white/50 sm:max-w-sm">
                <span className="shrink-0">
                  Do {formatPriceCurrency(filters.priceRange[1])}
                </span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={filters.priceRange[1]}
                  onChange={handlePriceRangeChange}
                  aria-label="Maksymalna cena"
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-red-600"
                />
              </label>

              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
                    className="border-white/20 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                  />
                  <Label htmlFor="inStock" className="cursor-pointer text-sm text-white/55">
                    Tylko dostępne
                  </Label>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs tracking-wide text-red-400 transition-colors hover:text-red-300"
                  >
                    Wyczyść
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {categoryParam && (
          <div className="mt-8">
            <Link
              href="/akcesoria"
              className="inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
              Cała kolekcja
            </Link>
          </div>
        )}

        <div className="mt-10">
          {isLoading || loadingCategory ? (
            <div className="flex flex-wrap justify-center gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-[24.5rem] w-80 max-w-full overflow-hidden rounded-2xl border border-white/10"
                >
                  <div className="h-56 animate-pulse bg-white/10" />
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-12 w-4/5 animate-pulse rounded bg-white/10" />
                    <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-8">
                {currentAccessories.map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
                    onAddToCart={(event) => handleAddToCart(accessory, event)}
                    onView={() => setSelectedAccessory(accessory)}
                  />
                ))}
              </div>

              {currentAccessories.length === 0 && (
                <div className="py-16 text-center">
                  <h2 className="text-xl font-medium text-white">Brak produktów</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                    Zmień kategorię albo wyczyść filtry, żeby zobaczyć resztę kolekcji.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-6 border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    Wyczyść filtry
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AccessoryDetailsSheet
        accessory={selectedAccessory}
        isOpen={!!selectedAccessory}
        onClose={() => setSelectedAccessory(null)}
      />
    </div>
  );
}
