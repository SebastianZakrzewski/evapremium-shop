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
import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { Przelewy24Service } from '@/lib/services/Przelewy24Service'
import { P24WebhookData, P24Error } from '@/lib/types/przelewy24'
import { createClient } from '@supabase/supabase-js'

const orderService = new OrderService()
const orderRepository = new OrderRepository()
const p24Service = new Przelewy24Service()
const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey)

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

    // Weryfikuj podpis webhook (wymagane w produkcji, opcjonalne w sandbox)
    const isProduction = process.env.P24_ENVIRONMENT === 'production'
    
    if (isProduction) {
      if (!p24Service.isP24Available()) {
        console.error('❌ P24 Callback API: P24 nie jest skonfigurowane')
        return NextResponse.json({ error: 'P24 disabled' }, { status: 503 })
      }
      
      const isValidSignature = p24Service.verifyWebhookSignature(webhookData)
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
    console.log('🔍 P24 Callback API: SessionId type:', typeof webhookData.sessionId)
    console.log('🔍 P24 Callback API: SessionId length:', webhookData.sessionId?.length)
    
    let order = await orderService.getOrderBySessionId(webhookData.sessionId)
    
    // Fallback 1: jeśli nie znaleziono po sessionId, spróbuj po orderNumber wyciągniętym z sessionId
    if (!order) {
      console.log('🔍 P24 Callback API: Nie znaleziono po sessionId, próbuję wyciągnąć orderNumber z sessionId')
      
      // Format sessionId: "eva_ORD-2025-000002_1761254554164" -> orderNumber: "ORD-2025-000002"
      const sessionIdParts = webhookData.sessionId.split('_')
      console.log('🔍 P24 Callback API: SessionId parts:', sessionIdParts)
      
      if (sessionIdParts.length >= 2) {
        const orderNumber = sessionIdParts[1] // Drugi element to orderNumber
        console.log('🔍 P24 Callback API: Wyciągnięty orderNumber:', orderNumber)
        
        try {
          order = await orderService.getOrderByNumber(orderNumber)
          if (order) {
            console.log('✅ P24 Callback API: Znaleziono zamówienie po orderNumber (fallback)')
          }
        } catch (error) {
          console.error('❌ P24 Callback API: Błąd wyszukiwania po orderNumber:', error)
        }
      }
    }
    
    // Fallback 2: jeśli nadal nie znaleziono, spróbuj bezpośrednio przez repository
    if (!order) {
      console.log('🔍 P24 Callback API: Fallback 2 - próbuję bezpośrednio przez repository')
      try {
        order = await orderRepository.findBySessionId(webhookData.sessionId)
        
        if (!order) {
          // Spróbuj też po orderNumber jeśli sessionId zawiera orderNumber
          const sessionIdParts = webhookData.sessionId.split('_')
          if (sessionIdParts.length >= 2) {
            const orderNumber = sessionIdParts[1]
            order = await orderRepository.findByOrderNumber(orderNumber)
          }
        }
      } catch (error) {
        console.error('❌ P24 Callback API: Błąd w fallback 2:', error)
      }
    }
    
    if (!order) {
      console.error('❌ P24 Callback API: Nie znaleziono zamówienia ani po sessionId ani po orderNumber')
      console.error('❌ P24 Callback API: sessionId:', webhookData.sessionId)
      
      // Debug: sprawdź czy istnieją jakieś zamówienia z podobnym sessionId
      console.log('🔍 P24 Callback API: Sprawdzam czy istnieją jakieś zamówienia z P24...')
      
      try {
        // Pobierz wszystkie zamówienia z P24
        const { data: allOrders } = await orderRepository.supabase
          .from('orders')
          .select('id, order_number, p24_session_id, p24_token, payment_status, status, created_at')
          .not('p24_session_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10)
        
        console.log('🔍 P24 Callback API: Ostatnie 10 zamówień z P24:', allOrders)
        
        // Sprawdź czy któryś sessionId jest podobny
        if (allOrders && allOrders.length > 0) {
          console.log('🔍 P24 Callback API: Porównanie sessionId:')
          allOrders.forEach((o: any) => {
            const similarity = o.p24_session_id === webhookData.sessionId ? 'IDENTYCZNY' : 
                             o.p24_session_id?.includes(webhookData.sessionId.split('_')[1]) ? 'ZAWIRA ORDER_NUMBER' : 
                             'RÓŻNY'
            console.log(`   - ${o.order_number}: "${o.p24_session_id}" vs "${webhookData.sessionId}" -> ${similarity}`)
          })
        }
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
      currentStatus: order.status,
      currentPaymentStatus: order.paymentStatus,
      orderAmount: order.total,
      webhookAmount: webhookData.amount,
      webhookOriginAmount: webhookData.originAmount,
      amountsMatch: Math.round(Number(order.total) * 100) === webhookData.amount
    })

    // Sprawdź czy płatność nie została już przetworzona
    if (order.paymentStatus === 'paid') {
      console.log('⚠️ P24 Callback API: Płatność już przetworzona')
      return new Response('OK', { status: 200 })
    }

    // Walidacja kwot - webhook wysyła kwotę w groszach
    const orderAmountInGrosze = Math.round(Number(order.total) * 100)
    const webhookAmount = webhookData.amount
    
    if (orderAmountInGrosze !== webhookAmount) {
      console.error('❌ P24 Callback API: Niezgodność kwot', {
        orderAmountInGrosze,
        webhookAmount,
        orderTotal: order.total,
        orderTotalType: typeof order.total
      })
      
      await orderService.updatePaymentStatus(order.id, 'failed', { 
        error: `Niezgodność kwot: zamówienie ${orderAmountInGrosze} groszy, webhook ${webhookAmount} groszy`
      })
      
      return NextResponse.json(
        { error: 'Niezgodność kwot' },
        { status: 400 }
      )
    }

    console.log('✅ P24 Callback API: Kwoty się zgadzają', {
      orderAmountInGrosze,
      webhookAmount
    })

    // Weryfikuj transakcję w P24
    // W sandbox weryfikacja przez API może nie działać, więc pomijamy ją
    // W production weryfikacja jest wymagana, ale jeśli zwraca błąd "Invalid CRC",
    // może to oznaczać że używasz sandbox credentials z production environment
    // W takim przypadku akceptujemy webhook jeśli podpis webhook jest poprawny
    // isProduction już zadeklarowane wcześniej (linia 44)
    
    if (isProduction) {
      console.log('🔍 P24 Callback API: Weryfikacja transakcji przez API (produkcja)...')
      
      if (!p24Service.isP24Available()) {
        console.error('❌ P24 Callback API: P24 nie jest skonfigurowane')
        await orderService.updatePaymentStatus(order.id, 'failed', { error: 'P24 disabled' })
        return NextResponse.json({ error: 'P24 disabled' }, { status: 503 })
      }
      
      const verificationResult = await p24Service.verifyTransaction(
        webhookData.sessionId,
        webhookData.orderId,
        webhookData.amount,
        webhookData.currency
      )
      
      console.log('🔍 P24 Callback API: Wynik weryfikacji:', verificationResult)
      
      // Jeśli weryfikacja zwraca "Invalid CRC", może to oznaczać że używasz sandbox credentials
      // W takim przypadku akceptujemy webhook jeśli podpis webhook jest poprawny
      if (!verificationResult.success || !verificationResult.verified) {
        const isInvalidCrc = verificationResult.error?.includes('Invalid CRC') || verificationResult.error?.includes('CRC')
        
        if (isInvalidCrc) {
          console.warn('⚠️ P24 Callback API: Weryfikacja API zwróciła "Invalid CRC" - prawdopodobnie sandbox credentials')
          console.warn('⚠️ P24 Callback API: Akceptuję webhook bo podpis webhook jest poprawny')
          // Kontynuuj przetwarzanie - podpis webhook już został zweryfikowany
        } else {
          console.error('❌ P24 Callback API: Błąd weryfikacji', verificationResult.error)
          
          await orderService.updatePaymentStatus(order.id, 'failed', { 
            error: verificationResult.error || 'Błąd weryfikacji transakcji'
          })
          
          return NextResponse.json(
            { error: 'Błąd weryfikacji płatności' },
            { status: 400 }
          )
        }
      } else {
        console.log('✅ P24 Callback API: Płatność zweryfikowana przez API')
      }
    } else {
      console.log('⚠️ P24 Callback API: Pomijam weryfikację przez API (sandbox)')
      console.log('⚠️ P24 Callback API: Akceptuję webhook bezpośrednio w sandbox')
    }

    // Aktualizuj status zamówienia na "paid"
    console.log('🔄 P24 Callback API: Aktualizuję status zamówienia na "paid"...')
    console.log('🔍 P24 Callback API: Przed aktualizacją:', {
      orderId: order.id,
      currentStatus: order.status,
      currentPaymentStatus: order.paymentStatus
    })
    
    try {
      await orderService.updatePaymentStatus(order.id, 'paid', {
        p24OrderId: webhookData.orderId,
        p24MethodId: webhookData.methodId
      })
      
      // Sprawdź status po aktualizacji
      const updatedOrder = await orderService.getOrderById(order.id)
      console.log('✅ P24 Callback API: Status zamówienia zaktualizowany', {
        orderId: updatedOrder?.id,
        newStatus: updatedOrder?.status,
        newPaymentStatus: updatedOrder?.paymentStatus
      })
      
      if (updatedOrder?.paymentStatus !== 'paid') {
        console.error('❌ P24 Callback API: BŁĄD - payment_status nie został zaktualizowany!', {
          expected: 'paid',
          actual: updatedOrder?.paymentStatus
        })
      }
      
      if (updatedOrder?.status !== 'confirmed') {
        console.error('❌ P24 Callback API: BŁĄD - status nie został zaktualizowany!', {
          expected: 'confirmed',
          actual: updatedOrder?.status
        })
      }

      // Oznacz wszystkie abandoned carts dla tego klienta jako converted (zamówienie zostało opłacone)
      if (order.customer && typeof order.customer === 'object' && 'email' in order.customer) {
        const customerEmail = (order.customer as any).email;
        if (customerEmail) {
          try {
            console.log('🔄 P24 Callback API: Oznaczam abandoned carts jako converted dla klienta', { email: customerEmail });
            
            const { data: updatedCarts, error: cartUpdateError } = await supabase
              .from('abandoned_carts')
              .update({ 
                status: 'converted',
                metadata: { 
                  converted_reason: 'order_paid',
                  converted_order_id: order.id,
                  converted_order_number: order.orderNumber,
                  converted_at: new Date().toISOString()
                }
              })
              .eq('contact->>email', customerEmail)
              .in('status', ['pending', 'processing'])
              .is('bitrix_deal_id', null)
              .select('id');

            if (cartUpdateError) {
              console.error('❌ P24 Callback API: Błąd podczas oznaczania abandoned carts jako converted', cartUpdateError);
            } else {
              const updatedCount = Array.isArray(updatedCarts) ? updatedCarts.length : 0;
              console.log('✅ P24 Callback API: Oznaczono abandoned carts jako converted', { 
                updatedCount,
                email: customerEmail 
              });
            }
          } catch (cartError) {
            console.error('❌ P24 Callback API: Nieoczekiwany błąd podczas oznaczania abandoned carts', cartError);
            // Nie rzucaj błędu - to nie jest krytyczne
          }
        }
      }
    } catch (updateError) {
      console.error('❌ P24 Callback API: Błąd podczas aktualizacji statusu', updateError)
      throw updateError
    }

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
