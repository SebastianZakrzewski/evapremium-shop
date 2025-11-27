"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Accessory } from "@/lib/types/accessory";
import { useAccessories } from "@/hooks/useAccessories";
import { useCart } from "@/hooks/useCart.new";
import { toast } from "react-hot-toast";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import AccessoryCard from "./accessory-card";
import AccessoryDetailsSheet from "./accessory-details-sheet";

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

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  // Główne kategorie (Organizery vs Podpiętki)
  const MAIN_CATEGORIES = ['Organizery do Bagażnika', 'Podpiętki'];
  
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
            // Jeśli productType istnieje ale nie pasuje do żadnej wybranej głównej kategorii
            // Debug: loguj niepasujące produkty
            console.log('ProductType mismatch:', {
              name: accessory.name,
              productType: accessory.productType,
              hasOrganizerFilter,
              hasPodpietkaFilter
            });
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

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-neutral-950">
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
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      {/* Hero Header */}
      <div className="relative bg-[#0a0a0a] border-b border-white/5 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Akcesoria</span>
          </nav>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {categoryParam ? (
                <>AKCESORIA <span className="text-red-600">{categoryParam.toUpperCase()}</span></>
              ) : (
                <>WYPOSAŻENIE <span className="text-red-600">PREMIUM</span></>
              )}
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              {categoryParam 
                ? `Dedykowane akcesoria z kolekcji ${categoryParam}. Podkreśl styl swojego samochodu.`
                : 'Odkryj naszą wyselekcjonowaną kolekcję akcesoriów samochodowych. Od kosmetyków po elektronikę – wszystko, czego potrzebuje Twój samochód.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              variant="outline" 
              className="w-full flex items-center justify-between border-white/20 bg-transparent text-white hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtry
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700 border-none">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`
            lg:w-72 shrink-0 space-y-8
            ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtrowanie</h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    WYCZYŚĆ
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Kategorie</h4>
                <div className="space-y-3">
                  {/* Główne kategorie */}
                  {categories
                    .filter(cat => MAIN_CATEGORIES.includes(cat.name))
                    .map((category) => (
                      <div key={category.name} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`category-${category.name}`}
                          checked={filters.categories.includes(category.name)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.name, checked as boolean)
                          }
                          className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label 
                          htmlFor={`category-${category.name}`}
                          className="text-gray-300 group-hover:text-white cursor-pointer transition-colors font-medium"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  
                  {/* Podkategorie - pokazuj tylko jeśli wybrano główną kategorię */}
                  {selectedMainCategories.length > 0 && availableCategories.length > 0 && (
                    <>
                      <div className="pt-2 border-t border-white/10 mt-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">
                          Podkategorie
                        </div>
                        <div className="space-y-2 pl-4">
                          {availableCategories.map((category) => (
                            <div key={category} className="flex items-center space-x-3 group">
                              <Checkbox
                                id={`subcategory-${category}`}
                                checked={filters.categories.includes(category)}
                                onCheckedChange={(checked) => 
                                  handleCategoryChange(category, checked as boolean)
                                }
                                className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                              />
                              <Label 
                                htmlFor={`subcategory-${category}`}
                                className="text-gray-400 group-hover:text-gray-300 cursor-pointer transition-colors text-sm"
                              >
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Jeśli nie wybrano głównej kategorii, pokaż inne kategorie */}
                  {selectedMainCategories.length === 0 && availableCategories.length > 0 && (
                    <>
                      {availableCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={(checked) => 
                              handleCategoryChange(category, checked as boolean)
                            }
                            className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                          />
                          <Label 
                            htmlFor={`category-${category}`}
                            className="text-gray-300 group-hover:text-white cursor-pointer transition-colors"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cena</h4>
                  <span className="text-sm font-mono text-white">
                    do {filters.priceRange[1]} PLN
                  </span>
                </div>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={handlePriceRangeChange}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0 PLN</span>
                    <span>5000+ PLN</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Availability */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Dostępność</h4>
                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label 
                    htmlFor="inStock"
                    className="text-gray-300 group-hover:text-white cursor-pointer transition-colors"
                  >
                    Tylko dostępne produkty
                  </Label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <p className="text-gray-400">
                Znaleziono <span className="text-white font-semibold">{currentAccessories.length}</span> produktów
              </p>
              
              {categoryParam && (
                <Link 
                  href="/akcesoria" 
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Wyczyść kategorię
                </Link>
              )}
            </div>

            {/* Loading State */}
            {(isLoading || loadingCategory) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentAccessories.map((accessory) => (
                    <AccessoryCard 
                      key={accessory.id} 
                      accessory={accessory}
                      onAddToCart={(e) => handleAddToCart(accessory, e)}
                      onView={() => setSelectedAccessory(accessory)}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {currentAccessories.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nie znaleziono produktów</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Spróbuj zmienić kryteria wyszukiwania lub usuń filtry, aby zobaczyć więcej wyników.
                    </p>
                    <Button onClick={clearFilters} variant="secondary">
                      Wyczyść wszystkie filtry
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
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
