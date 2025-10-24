/**
 * API Endpoint: Rejestracja płatności Przelewy24
 * 
 * POST /api/payments/p24/register
 * Body: { orderId: string }
 * Response: { paymentUrl: string, token: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { OrderService } from '@/lib/services/OrderService'
import { P24Error } from '@/lib/types/przelewy24'

const orderService = new OrderService()

export async function POST(request: NextRequest) {
  try {
    if (!env.features?.p24Enabled) {
      return NextResponse.json({ error: 'P24 disabled' }, { status: 503 })
    }
    console.log('🔄 P24 Register API: Rozpoczęcie rejestracji płatności')
    console.log('🔍 P24 Register API: Environment Variables Debug:')
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV)
    console.log('🔍 VERCEL:', process.env.VERCEL)
    console.log('🔍 VERCEL_ENV:', process.env.VERCEL_ENV)
    console.log('🔍 P24_MERCHANT_ID:', process.env.P24_MERCHANT_ID)
    console.log('🔍 P24_POS_ID:', process.env.P24_POS_ID)
    console.log('🔍 P24_CRC_KEY:', process.env.P24_CRC_KEY)
    console.log('🔍 P24_API_KEY:', process.env.P24_API_KEY)
    console.log('🔍 P24_REPORT_KEY:', process.env.P24_REPORT_KEY)
    console.log('🔍 P24_ENVIRONMENT:', process.env.P24_ENVIRONMENT)
    console.log('🔍 P24_URL_RETURN:', process.env.P24_URL_RETURN)
    console.log('🔍 P24_URL_STATUS:', process.env.P24_URL_STATUS)

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
          // Tymczasowo bez zależności od serwisu; zachowaj zgodność odpowiedzi
          paymentUrl: `${process.env.P24_API_URL_PRODUCTION?.replace('/api/v1','')}/trnRequest/${order.p24Token}`
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

    // Tymczasowo brak rejestracji – serwis wyłączony podczas refaktoru
    return NextResponse.json(
      { success: false, error: 'P24 disabled' },
      { status: 503 }
    )

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
