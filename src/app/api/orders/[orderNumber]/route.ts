import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

const orderService = new OrderService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    
    // Sprawdź czy to UUID (ID) czy orderNumber
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);
    
    let order;
    if (isUuid) {
      // Wyszukaj po ID
      order = await orderService.getOrderById(orderNumber);
    } else {
      // Wyszukaj po numerze zamówienia
      order = await orderService.getOrderByNumber(orderNumber);
    }
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
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
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    
    const { status, trackingNumber } = body;
    
    if (!status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: status' 
        },
        { status: 400 }
      );
    }
    
    // Find order by number first
    const order = await orderService.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const updatedOrder = await orderService.updateOrderStatus(
      order.id,
      status,
      trackingNumber
    );
    
    return NextResponse.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}
