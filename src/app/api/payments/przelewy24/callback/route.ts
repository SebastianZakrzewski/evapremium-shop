import { NextRequest, NextResponse } from 'next/server';
import { Przelewy24Service } from '@/lib/services/Przelewy24Service';
import { OrderService } from '@/lib/services/OrderService';
import { P24CallbackPayload } from '@/lib/types/przelewy24';

const orderService = new OrderService();
const p24Service = new Przelewy24Service();

export async function POST(request: NextRequest) {
  try {
    // Pobierz dane z callback
    const formData = await request.formData();
    const callbackData: P24CallbackPayload = {
      merchantId: parseInt(formData.get('merchantId') as string),
      posId: parseInt(formData.get('posId') as string),
      sessionId: formData.get('sessionId') as string,
      amount: parseInt(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      orderId: parseInt(formData.get('orderId') as string),
      method: parseInt(formData.get('method') as string),
      statement: formData.get('statement') as string,
      sig: formData.get('sig') as string
    };

    console.log('🔄 P24 Callback: Received callback data:', {
      sessionId: callbackData.sessionId,
      orderId: callbackData.orderId,
      amount: callbackData.amount,
      merchantId: callbackData.merchantId
    });

    // Waliduj podpis CRC
    if (!p24Service.validateCallbackSignature(callbackData)) {
      console.error('❌ P24 Callback: Invalid CRC signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Znajdź zamówienie po sessionId
    const order = await orderService.getOrderBySessionId(callbackData.sessionId);
    if (!order) {
      console.error('❌ P24 Callback: Order not found for sessionId:', callbackData.sessionId);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('🔄 P24 Callback: Found order:', order.id);

    // Weryfikuj transakcję przez API P24
    const verificationResult = await p24Service.verifyTransaction({
      sessionId: callbackData.sessionId,
      orderId: callbackData.orderId,
      amount: callbackData.amount,
      currency: callbackData.currency
    });

    console.log('🔄 P24 Callback: Verification result:', verificationResult);

    // Aktualizuj status płatności w zależności od wyniku weryfikacji
    if (verificationResult.status === 'OK') {
      // Płatność potwierdzona
      await orderService.updatePaymentStatus(order.id, 'paid');
      await orderService.updateP24Data(order.id, {
        p24SessionId: callbackData.sessionId,
        p24OrderId: callbackData.orderId,
        p24TransactionId: callbackData.orderId // w P24 orderId to transactionId
      });

      console.log('✅ P24 Callback: Payment confirmed for order:', order.id);
    } else {
      // Płatność nieudana
      await orderService.updatePaymentStatus(order.id, 'failed');
      console.log('❌ P24 Callback: Payment failed for order:', order.id, verificationResult.error);
    }

    // Zwróć odpowiedź 200 OK (P24 wymaga tego)
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ P24 Callback: Error:', error);
    
    // Zwróć 200 OK nawet w przypadku błędu (P24 nie będzie ponawiał)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 200 }
    );
  }
}
