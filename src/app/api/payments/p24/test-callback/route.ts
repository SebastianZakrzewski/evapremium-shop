/**
 * Testowy endpoint do ręcznego wywołania callback P24
 * Używa rzeczywistych danych z bazy do testowania
 * 
 * POST /api/payments/p24/test-callback
 * Body: { orderId: string } - ID zamówienia do testowania
 */

import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/services/OrderService'

const orderService = new OrderService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Brak orderId' },
        { status: 400 }
      )
    }

    // Pobierz zamówienie z bazy
    const order = await orderService.getOrderById(orderId)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Zamówienie nie zostało znalezione' },
        { status: 404 }
      )
    }

    if (!order.p24SessionId) {
      return NextResponse.json(
        { error: 'Zamówienie nie ma p24SessionId' },
        { status: 400 }
      )
    }

    // Symuluj webhook z rzeczywistymi danymi
    const mockWebhookData = {
      merchantId: parseInt(process.env.P24_MERCHANT_ID || '0'),
      posId: parseInt(process.env.P24_POS_ID || '0'),
      sessionId: order.p24SessionId,
      amount: Math.round(Number(order.total) * 100), // W groszach
      originAmount: Math.round(Number(order.total) * 100),
      currency: 'PLN',
      orderId: order.p24OrderId || '123456789', // Mock orderId jeśli nie ma
      methodId: order.p24MethodId || 31, // Mock methodId
      statement: `Zamówienie ${order.orderNumber}`,
      sign: 'test-signature' // Mock signature
    }

    console.log('🧪 Test Callback: Symuluję webhook z danymi:', mockWebhookData)

    // Wywołaj rzeczywisty callback endpoint
    const callbackUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/payments/p24/callback`
    
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockWebhookData)
    })

    const responseText = await response.text()
    
    console.log('🧪 Test Callback: Odpowiedź:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    })

    return NextResponse.json({
      success: response.status === 200,
      status: response.status,
      response: responseText,
      webhookData: mockWebhookData,
      orderBefore: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        p24SessionId: order.p24SessionId,
        p24OrderId: order.p24OrderId
      }
    })

  } catch (error) {
    console.error('❌ Test Callback: Błąd', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nieoczekiwany błąd' },
      { status: 500 }
    )
  }
}





