import { NextRequest, NextResponse } from 'next/server';
import { MatService } from '@/lib/services/MatService';

const matService = new MatService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const brandSlug = searchParams.get('brandSlug');
    const modelSlug = searchParams.get('modelSlug');
    
    if (!brandSlug || !modelSlug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: brandSlug, modelSlug' 
        },
        { status: 400 }
      );
    }
    
    const bodyTypes = await matService.getAvailableBodyTypes(brandSlug, modelSlug);
    
    return NextResponse.json({
      success: true,
      data: bodyTypes
    });
  } catch (error) {
    console.error('Error fetching body types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
