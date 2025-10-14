import { NextRequest, NextResponse } from 'next/server';
import { AccessoryService } from '@/lib/services/AccessoryService';

const accessoryService = new AccessoryService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const accessory = await accessoryService.getAccessoryById(id);
    
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
    console.error('Error fetching accessory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const accessory = await accessoryService.updateAccessory(id, body);
    
    return NextResponse.json({
      success: true,
      data: accessory
    });
  } catch (error) {
    console.error('Error updating accessory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await accessoryService.deleteAccessory(id);
    
    return NextResponse.json({
      success: true,
      message: 'Accessory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accessory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
