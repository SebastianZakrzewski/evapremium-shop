import { NextRequest, NextResponse } from 'next/server';
import { MatService } from '@/lib/services/MatService';

const matService = new MatService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { brandSlug, modelSlug, generation, bodyType } = body;
    
    if (!brandSlug || !modelSlug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: brandSlug, modelSlug' 
        },
        { status: 400 }
      );
    }
    
    const mat = await matService.findMatForCar({
      brandSlug,
      modelSlug,
      generation,
      bodyType
    });
    
    if (!mat) {
      return NextResponse.json(
        { success: false, error: 'Mat not found for this car' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: mat
    });
  } catch (error) {
    console.error('Error finding mat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
