/**
 * API Endpoint: Rejestracja płatności Przelewy24
 * 
 * POST /api/payments/p24/register
 * Body: { orderId: string }
 * Response: { paymentUrl: string, token: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { p24Service } from '@/lib/services/Przelewy24Service'
import { OrderService } from '@/lib/services/OrderService'
import { P24Error } from '@/lib/types/przelewy24'

const orderService = new OrderService()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 P24 Register API: Rozpoczęcie rejestracji płatności')

    // Parsuj dane żądania
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      console.error('❌ P24 Register API: Brak orderId w żądaniu')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brak orderId w żądaniu' 
        },
        { status: 400 }
      )
    }

    console.log('🔄 P24 Register API: OrderId', orderId)

    // Pobierz zamówienie z bazy danych
    const order = await orderService.getOrderById(orderId)
    
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zamówienie nie zostało znalezione' 
        },
        { status: 404 }
      )
    }

    console.log('🔄 P24 Register API: Znaleziono zamówienie', {
      orderNumber: order.orderNumber,
      total: order.total,
      customer: order.customer
    })

    // Sprawdź czy zamówienie nie ma już zarejestrowanej płatności
    if (order.p24Token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Płatność dla tego zamówienia została już zarejestrowana',
          paymentUrl: p24Service.getPaymentUrl(order.p24Token)
        },
        { status: 400 }
      )
    }

    // Przygotuj dane dla P24
    const customerData = order.customer as any
    
    // Generuj sessionId zgodny z wymaganiami P24 (max 100 znaków, alfanumeryczne)
    const sessionId = `eva_${order.orderNumber}_${Date.now()}`.substring(0, 100)
    
    const transactionData = {
      sessionId: sessionId,
      amount: Number(order.total),
      currency: 'PLN',
      description: `Zamówienie ${order.orderNumber} - Dywaniki EVA`,
      email: customerData.email,
      country: 'PL'
    }

    console.log('🔄 P24 Register API: Dane transakcji', transactionData)

    // Zarejestruj transakcję w P24
    const result = await p24Service.registerTransaction(transactionData)

    if (!result.success) {
      console.error('❌ P24 Register API: Błąd rejestracji', result.error)
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Błąd rejestracji płatności w P24' 
        },
        { status: 500 }
      )
    }

    console.log('✅ P24 Register API: Transakcja zarejestrowana', {
      token: result.token,
      paymentUrl: result.paymentUrl
    })

    // Zaktualizuj zamówienie w bazie danych
    await orderService.updateOrderP24Data(orderId, {
      p24SessionId: sessionId,
      p24Token: result.token!
    })

    // Zwróć URL płatności
    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      token: result.token,
      orderId: orderId
    })

  } catch (error) {
    console.error('❌ P24 Register API: Nieoczekiwany błąd', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Nieoczekiwany błąd serwera' 
      },
      { status: 500 }
    )
  }
}
