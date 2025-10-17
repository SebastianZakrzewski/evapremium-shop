import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Przelewy24Service } from '@/lib/services/Przelewy24Service';
import { OrderService } from '@/lib/services/OrderService';
import { InitPaymentRequest, InitPaymentResponse } from '@/lib/types/przelewy24';

const initPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format')
});

const orderService = new OrderService();
const p24Service = new Przelewy24Service();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const { orderId } = initPaymentSchema.parse(body);
    
    console.log('🔄 P24 Init: Processing payment for order:', orderId);
    
    // Pobierz zamówienie z bazy danych (orderId to UUID, nie orderNumber)
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Sprawdź czy zamówienie nie zostało już opłacone
    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order already paid' 
        },
        { status: 400 }
      );
    }

    // Sprawdź czy zamówienie ma już sesję P24
    if (order.p24SessionId) {
      console.log('🔄 P24 Init: Order already has P24 session, checking status...');
      const status = await p24Service.getTransactionStatus(order.p24SessionId);
      
      if (status === 'paid') {
        // Aktualizuj status w bazie
        await orderService.updatePaymentStatus(order.id, 'paid');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Order already paid' 
          },
          { status: 400 }
        );
      }
    }

    // Generuj unikalny sessionId dla P24
    const sessionId = `eva_${orderId}_${Date.now()}`;
    
    // Przygotuj dane do rejestracji transakcji
    const amount = Math.round(Number(order.total) * 100); // konwersja na grosze
    const description = `Zamówienie ${order.orderNumber} - Dywaniki EVA`;
    const email = (order.customer as any).email;
    
    // URL-e powrotu
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const urlReturn = `${baseUrl}/payment/success?sessionId=${sessionId}`;
    const urlStatus = `${baseUrl}/api/payments/przelewy24/callback`;

    console.log('🔄 P24 Init: Registering transaction with P24:', {
      sessionId,
      amount,
      orderNumber: order.orderNumber,
      email
    });

    // Zarejestruj transakcję w P24
    const p24Result = await p24Service.registerTransaction({
      sessionId,
      amount,
      currency: 'PLN',
      description,
      email,
      urlReturn,
      urlStatus
    });

    // Zaktualizuj zamówienie o dane P24
    await orderService.updateP24Data(order.id, {
      p24SessionId: sessionId,
      p24OrderId: null, // będzie ustawiony po callback
      p24TransactionId: null
    });

    // Zbuduj URL do płatności
    const paymentUrl = p24Service.buildPaymentUrl(p24Result.token);

    console.log('✅ P24 Init: Payment URL generated:', paymentUrl);

    const response: InitPaymentResponse = {
      paymentUrl,
      sessionId
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ P24 Init: Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
