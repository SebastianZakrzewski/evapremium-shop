/**
 * API Endpoint: Webhook callback Przelewy24
 * 
 * POST /api/payments/p24/callback
 * Body: P24 webhook data
 * Response: "OK" | Error
 * 
 * Ten endpoint jest wywoływany przez P24 po zakończeniu płatności
 */

import { NextRequest, NextResponse } from 'next/server'
import { p24Service } from '@/lib/services/Przelewy24Service'
import { OrderService } from '@/lib/services/OrderService'
import { P24WebhookData, P24Error } from '@/lib/types/przelewy24'

const orderService = new OrderService()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 P24 Callback API: Otrzymano webhook')

    // Parsuj dane webhook
    const webhookData: P24WebhookData = await request.json()
    
    console.log('🔄 P24 Callback API: Dane webhook', {
      sessionId: webhookData.sessionId,
      orderId: webhookData.orderId,
      amount: webhookData.amount,
      methodId: webhookData.methodId
    })

    // Weryfikuj podpis webhook (zabezpieczenie!)
    const isValidSignature = p24Service.verifyWebhookSignature(webhookData)
    
    if (!isValidSignature) {
      console.error('❌ P24 Callback API: Nieprawidłowy podpis webhook')
      return NextResponse.json(
        { error: 'Nieprawidłowy podpis' },
        { status: 400 }
      )
    }

    console.log('✅ P24 Callback API: Podpis webhook zweryfikowany')

    // Znajdź zamówienie po sessionId (orderNumber)
    const order = await orderService.getOrderBySessionId(webhookData.sessionId)
    
    if (!order) {
      console.error('❌ P24 Callback API: Nie znaleziono zamówienia', webhookData.sessionId)
      return NextResponse.json(
        { error: 'Zamówienie nie zostało znalezione' },
        { status: 404 }
      )
    }

    console.log('🔄 P24 Callback API: Znaleziono zamówienie', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.paymentStatus
    })

    // Sprawdź czy płatność nie została już przetworzona
    if (order.paymentStatus === 'paid') {
      console.log('⚠️ P24 Callback API: Płatność już przetworzona')
      return new Response('OK', { status: 200 })
    }

    // Weryfikuj transakcję w P24
    const verificationResult = await p24Service.verifyTransaction(
      webhookData.sessionId,
      webhookData.orderId,
      webhookData.amount / 100 // Konwertuj z groszy
    )

    if (!verificationResult.success || !verificationResult.verified) {
      console.error('❌ P24 Callback API: Błąd weryfikacji', verificationResult.error)
      
      // Aktualizuj status na failed
      await orderService.updatePaymentStatus(order.id, 'failed', {
        p24OrderId: webhookData.orderId,
        p24MethodId: webhookData.methodId,
        error: verificationResult.error
      })

      return NextResponse.json(
        { error: 'Błąd weryfikacji płatności' },
        { status: 400 }
      )
    }

    console.log('✅ P24 Callback API: Płatność zweryfikowana', {
      orderId: verificationResult.orderId,
      methodId: verificationResult.methodId
    })

    // Aktualizuj status zamówienia na "paid"
    await orderService.updatePaymentStatus(order.id, 'paid', {
      p24OrderId: webhookData.orderId,
      p24MethodId: webhookData.methodId
    })

    console.log('✅ P24 Callback API: Status zamówienia zaktualizowany na "paid"')

    // TODO: Wyślij email potwierdzenia do klienta
    // await sendOrderConfirmationEmail(order)

    // Zwróć "OK" aby P24 nie ponawiało webhook
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('❌ P24 Callback API: Nieoczekiwany błąd', error)
    
    // Zwróć błąd, ale nie 500 - P24 może ponowić
    return NextResponse.json(
      { error: 'Błąd przetwarzania webhook' },
      { status: 400 }
    )
  }
}

// Obsługa innych metod HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Metoda GET nie jest obsługiwana' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Metoda PUT nie jest obsługiwana' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Metoda DELETE nie jest obsługiwana' },
    { status: 405 }
  )
}
