import { NextRequest, NextResponse } from 'next/server';
import { AccessoryService } from '@/lib/services/AccessoryService';
import { AccessoryFilters } from '@/lib/types/accessory';

const accessoryService = new AccessoryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: AccessoryFilters = {};
    
    const category = searchParams.get('category');
    if (category) {
      filters.categories = [category];
    }
    
    const inStock = searchParams.get('inStock');
    if (inStock !== null) {
      filters.inStock = inStock === 'true';
    }
    
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    if (priceMin || priceMax) {
      filters.priceRange = [
        priceMin ? parseFloat(priceMin) : 0,
        priceMax ? parseFloat(priceMax) : 999999
      ];
    }
    
    const orderBy = searchParams.get('orderBy') as any;
    if (orderBy) {
      filters.orderBy = orderBy;
    }
    
    const orderDirection = searchParams.get('orderDirection') as any;
    if (orderDirection) {
      filters.orderDirection = orderDirection;
    }
    
    const accessories = await accessoryService.getAccessories(filters);
    
    return NextResponse.json({
      success: true,
      data: accessories,
      count: accessories.length
    });
  } catch (error) {
    console.error('Error fetching accessories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, price, categoryId' 
        },
        { status: 400 }
      );
    }
    
    const accessory = await accessoryService.createAccessory(body);
    
    return NextResponse.json({
      success: true,
      data: accessory
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating accessory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}
