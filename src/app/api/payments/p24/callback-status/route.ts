/**
 * Endpoint do sprawdzania czy webhook dociera
 * GET /api/payments/p24/callback-status
 */

import { NextRequest, NextResponse } from 'next/server'
import { OrderRepository } from '@/lib/repositories/OrderRepository'

const orderRepository = new OrderRepository()

export async function GET(request: NextRequest) {
  try {
    // Pobierz ostatnie zamówienia z P24
    const { data: orders, error } = await orderRepository.supabase
      .from('orders')
      .select('id, order_number, status, payment_status, p24_session_id, p24_token, p24_order_id, created_at, updated_at')
      .not('p24_session_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sprawdź konfigurację URL
    const statusUrl = process.env.P24_URL_STATUS
    const returnUrl = process.env.P24_URL_RETURN
    const environment = process.env.P24_ENVIRONMENT || 'sandbox'

    return NextResponse.json({
      configuration: {
        environment,
        statusUrl,
        returnUrl,
        callbackUrl: statusUrl ? `${statusUrl}` : 'BRAK'
      },
      recentOrders: orders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        p24SessionId: order.p24_session_id,
        hasToken: !!order.p24_token,
        hasOrderId: !!order.p24_order_id,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        timeSinceCreated: order.created_at ? 
          Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000) + ' sekund temu' : 
          'N/A'
      })) || [],
      summary: {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.payment_status === 'pending').length || 0,
        paid: orders?.filter(o => o.payment_status === 'paid').length || 0,
        withWebhook: orders?.filter(o => o.p24_order_id).length || 0
      }
    })

  } catch (error) {
    console.error('❌ Callback Status: Błąd', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nieoczekiwany błąd' },
      { status: 500 }
    )
  }
}

