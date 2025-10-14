import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

const orderService = new OrderService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const email = searchParams.get('email');
    const status = searchParams.get('status') as any;
    
    let orders;
    
    if (email) {
      orders = await orderService.getCustomerOrders(email);
    } else if (status) {
      orders = await orderService.getOrdersByStatus(status);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: email or status' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
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
    if (!body.customer || !body.shippingAddress || !body.items || !body.paymentMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: customer, shippingAddress, items, paymentMethod' 
        },
        { status: 400 }
      );
    }
    
    const order = await orderService.createOrder(body);
    
    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}
