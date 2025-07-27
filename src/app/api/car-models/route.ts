import { NextRequest, NextResponse } from 'next/server';
import { CarModelService } from '@/lib/services/CarModelService';
import { CarBrandService } from '@/lib/services/CarBrandService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const brandName = searchParams.get('brandName');
    const bodyType = searchParams.get('bodyType');
    const engineType = searchParams.get('engineType');
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');

    const filters: any = {};
    
    if (brandId) {
      filters.brandId = parseInt(brandId);
    } else if (brandName) {
      // Jeśli podano nazwę marki, najpierw znajdź jej ID
      const brand = await CarBrandService.getCarBrandByName(brandName);
      if (brand) {
        filters.brandId = brand.id;
      } else {
        // Jeśli marka nie istnieje, zwróć pustą listę
        return NextResponse.json([]);
      }
    }
    
    if (bodyType) filters.bodyType = bodyType;
    if (engineType) filters.engineType = engineType;
    if (yearFrom) filters.yearFrom = parseInt(yearFrom);
    if (yearTo) filters.yearTo = parseInt(yearTo);

    const carModels = await CarModelService.getCarModelsWithFilters(filters);
    
    return NextResponse.json(carModels);
  } catch (error) {
    console.error('Błąd podczas pobierania modeli aut:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania modeli aut' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const carModel = await CarModelService.createCarModel(body);
    
    return NextResponse.json(carModel, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas tworzenia modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas tworzenia modelu auta' },
      { status: 500 }
    );
  }
} 