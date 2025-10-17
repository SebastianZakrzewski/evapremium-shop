import { NextRequest, NextResponse } from 'next/server';
import { Przelewy24Service } from '@/lib/services/Przelewy24Service';
import { OrderService } from '@/lib/services/OrderService';
import { PaymentStatusResponse } from '@/lib/types/przelewy24';

const orderService = new OrderService();
const p24Service = new Przelewy24Service();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing sessionId parameter' 
        },
        { status: 400 }
      );
    }

    console.log('🔄 P24 Status: Checking status for sessionId:', sessionId);

    // Znajdź zamówienie po sessionId
    const order = await orderService.getOrderBySessionId(sessionId);
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Sprawdź status w P24
    const p24Status = await p24Service.getTransactionStatus(sessionId);
    
    // Mapuj status P24 na nasz status
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' = 'pending';
    
    switch (p24Status) {
      case 'paid':
        paymentStatus = 'paid';
        // Aktualizuj status w bazie jeśli jeszcze nie został zaktualizowany
        if (order.paymentStatus !== 'paid') {
          await orderService.updatePaymentStatus(order.id, 'paid');
        }
        break;
      case 'failed':
        paymentStatus = 'failed';
        if (order.paymentStatus !== 'failed') {
          await orderService.updatePaymentStatus(order.id, 'failed');
        }
        break;
      case 'cancelled':
        paymentStatus = 'cancelled';
        if (order.paymentStatus !== 'failed') {
          await orderService.updatePaymentStatus(order.id, 'failed');
        }
        break;
      default:
        paymentStatus = 'pending';
    }

    console.log('✅ P24 Status: Status checked:', {
      sessionId,
      p24Status,
      paymentStatus,
      orderId: order.id
    });

    const response: PaymentStatusResponse = {
      status: paymentStatus,
      orderId: order.id,
      transactionId: order.p24TransactionId || undefined
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ P24 Status: Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
