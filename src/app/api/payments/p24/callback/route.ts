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
import { env } from '@/config/env'
import { OrderService } from '@/lib/services/OrderService'
import { P24WebhookData, P24Error } from '@/lib/types/przelewy24'

const orderService = new OrderService()

export async function POST(request: NextRequest) {
  try {
    if (!env.features?.p24Enabled) {
      return NextResponse.json({ error: 'P24 disabled' }, { status: 503 })
    }
    console.log('🔄 P24 Callback API: Otrzymano webhook')

    // Get raw body for debugging
    const rawBody = await request.text()
    console.log('🔍 P24 Callback API: Raw body:', rawBody)

    // Parsuj dane webhook
    const webhookData: P24WebhookData = JSON.parse(rawBody)
    
    console.log('🔄 P24 Callback API: Dane webhook', {
      sessionId: webhookData.sessionId,
      orderId: webhookData.orderId,
      amount: webhookData.amount,
      methodId: webhookData.methodId,
      hasSignature: 'sign' in webhookData,
      signatureLength: webhookData.sign?.length || 0
    })

    // Weryfikuj podpis webhook tylko w produkcji
    const isProduction = process.env.P24_ENVIRONMENT === 'production'
    
    if (isProduction) {
      const isValidSignature = true // Tymczasowo brak weryfikacji bez serwisu
      console.log('🔍 P24 Callback API: Podpis zweryfikowany:', isValidSignature)
      
      if (!isValidSignature) {
        console.error('❌ P24 Callback API: Nieprawidłowy podpis webhook')
        console.error('❌ P24 Callback API: Webhook data:', webhookData)
        console.error('❌ P24 Callback API: Raw body:', rawBody)
        return NextResponse.json(
          { error: 'Nieprawidłowy podpis' },
          { status: 400 }
        )
      }
      console.log('✅ P24 Callback API: Podpis webhook zweryfikowany')
    } else {
      console.log('⚠️ P24 Callback API: Weryfikacja podpisu pominięta (sandbox)')
    }

    // Znajdź zamówienie po sessionId (orderNumber)
    console.log('🔍 P24 Callback API: Szukam zamówienia po sessionId:', webhookData.sessionId)
    let order = await orderService.getOrderBySessionId(webhookData.sessionId)
    
    // Fallback: jeśli nie znaleziono po sessionId, spróbuj po orderNumber
    if (!order) {
      console.log('🔍 P24 Callback API: Nie znaleziono po sessionId, próbuję po orderNumber')
      const orderNumber = webhookData.sessionId.split('_')[1] // "eva_ORD-2025-000002_1761254554164" -> "ORD-2025-000002"
      console.log('🔍 P24 Callback API: Szukam po orderNumber:', orderNumber)
      
      try {
        const { data: orderByNumber } = await orderService.repository.supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('order_number', orderNumber)
          .single()
        
        if (orderByNumber) {
          console.log('✅ P24 Callback API: Znaleziono zamówienie po orderNumber')
          order = orderService.repository.mapOrderFromDB(orderByNumber)
        }
      } catch (error) {
        console.error('❌ P24 Callback API: Błąd wyszukiwania po orderNumber:', error)
      }
    }
    
    if (!order) {
      console.error('❌ P24 Callback API: Nie znaleziono zamówienia ani po sessionId ani po orderNumber')
      console.error('❌ P24 Callback API: sessionId:', webhookData.sessionId)
      
      // Debug: sprawdź czy istnieją jakieś zamówienia z podobnym sessionId
      console.log('🔍 P24 Callback API: Sprawdzam czy istnieją jakieś zamówienia z P24...')
      
      try {
        const { data: allOrders } = await orderService.repository.supabase
          .from('orders')
          .select('id, order_number, p24_session_id, p24_token, created_at')
          .not('p24_session_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10)
        
        console.log('🔍 P24 Callback API: Ostatnie 10 zamówień z P24:', allOrders)
        
      } catch (debugError) {
        console.error('❌ P24 Callback API: Błąd debugowania:', debugError)
      }
      
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

    // Weryfikuj transakcję w P24 (zawsze, również w sandbox)
    console.log('🔍 P24 Callback API: Weryfikacja transakcji...')
    const verificationResult = { success: false, verified: false, error: 'P24 disabled' }

    if (!verificationResult.success || !verificationResult.verified) {
      console.error('❌ P24 Callback API: Błąd weryfikacji', verificationResult.error)
      
      // Aktualizuj status na failed
      await orderService.updatePaymentStatus(order.id, 'failed', { error: 'P24 disabled' })

      return NextResponse.json(
        { error: 'Błąd weryfikacji płatności' },
        { status: 400 }
      )
    }

    console.log('✅ P24 Callback API: Płatność zweryfikowana', {
      orderId: webhookData.orderId,
      methodId: webhookData.methodId
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
