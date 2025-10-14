import { NextRequest, NextResponse } from 'next/server';
import { AccessoryService } from '@/lib/services/AccessoryService';

const accessoryService = new AccessoryService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const accessory = await accessoryService.getAccessoryBySlug(slug);
    
    if (!accessory) {
      return NextResponse.json(
        { success: false, error: 'Accessory not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: accessory
    });
  } catch (error) {
    console.error('Error fetching accessory by slug:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
