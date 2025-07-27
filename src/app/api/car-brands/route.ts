import { NextRequest, NextResponse } from 'next/server';
import { CarBrandService } from '@/lib/services/CarBrandService';

export async function GET() {
  try {
    const carBrands = await CarBrandService.getActiveCarBrands();
    return NextResponse.json(carBrands);
  } catch (error) {
    console.error('Error fetching car brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const carBrand = await CarBrandService.createCarBrand(body);
    return NextResponse.json(carBrand, { status: 201 });
  } catch (error) {
    console.error('Error creating car brand:', error);
    return NextResponse.json(
      { error: 'Failed to create car brand' },
      { status: 500 }
    );
  }
} 