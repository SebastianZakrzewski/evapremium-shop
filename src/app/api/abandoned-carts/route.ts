import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { abandonedCartUpsertInputSchema } from '@/lib/validators/abandonedCart';
import { OrderRepository } from '@/lib/repositories/OrderRepository';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
const orderRepository = new OrderRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = abandonedCartUpsertInputSchema.parse(body);
    
    console.log('[AbandonedCart:Heartbeat] Received heartbeat', { 
      sessionId: input.sessionId?.substring(0, 8) + '...', 
      stage: input.stage,
      cartHasItems: input.cartHasItems 
    });

    if (!input.sessionId || input.sessionId.length < 8) {
      console.warn('[AbandonedCart:Heartbeat] Invalid sessionId');
      return NextResponse.json({ success: false, error: 'Invalid sessionId' }, { status: 400 });
    }

    // Enforce conditions: checkout step 2 or 3 and cart must have items
    if ((input.stage !== 'checkout_step2' && input.stage !== 'checkout_step3') || !input.cartHasItems) {
      console.log('[AbandonedCart:Heartbeat] Not eligible', { stage: input.stage, cartHasItems: input.cartHasItems });
      return NextResponse.json({ success: false, error: 'Not eligible (stage/cart)' }, { status: 400 });
    }

    // Sprawdź czy istnieje opłacone zamówienie dla tego klienta (zapobiega tworzeniu abandoned cart po opłaceniu)
    if (input.contact?.email) {
      try {
        const recentPaidOrders = await orderRepository.supabase
          .from('orders')
          .select('id, order_number, payment_status, total, created_at')
          .eq('payment_status', 'paid')
          .eq('customer->>email', input.contact.email)
          .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Ostatnie 30 minut
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentPaidOrders.data && recentPaidOrders.data.length > 0) {
          const paidOrder = recentPaidOrders.data[0];
          // Sprawdź czy kwota jest podobna (różnica mniejsza niż 10%)
          const orderTotal = Number(paidOrder.total);
          const cartTotal = input.totalAmount || 0;
          const difference = Math.abs(orderTotal - cartTotal);
          const tolerance = Math.max(orderTotal, cartTotal) * 0.1; // 10% tolerancji

          if (difference <= tolerance) {
            console.log('[AbandonedCart:Heartbeat] Found paid order for this customer, skipping abandoned cart', {
              orderId: paidOrder.id,
              orderNumber: paidOrder.order_number,
              orderTotal,
              cartTotal,
              email: input.contact.email
            });
            return NextResponse.json({ 
              success: true, 
              skipped: true, 
              reason: 'order_already_paid',
              orderId: paidOrder.id 
            }, { status: 200 });
          }
        }
      } catch (checkError) {
        console.error('[AbandonedCart:Heartbeat] Error checking for paid orders', checkError);
        // Kontynuuj przetwarzanie - nie blokuj jeśli sprawdzenie się nie powiodło
      }
    }

    const now = new Date();
    const expireAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Find existing pending record for this session (not yet exported)
    const { data: existingList, error: findError } = await supabase
      .from('abandoned_carts')
      .select('id, metadata')
      .eq('session_id', input.sessionId)
      .eq('status', 'pending')
      .is('bitrix_deal_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      console.error('[AbandonedCart:Heartbeat] Error finding existing cart', findError);
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    const existing = Array.isArray(existingList) && existingList.length > 0 ? existingList[0] : null;

    if (existing) {
      // Sprawdź ponownie czy zamówienie zostało opłacone (dla istniejącego rekordu)
      if (input.contact?.email) {
        try {
          const recentPaidOrders = await orderRepository.supabase
            .from('orders')
            .select('id, order_number, payment_status, total, created_at')
            .eq('payment_status', 'paid')
            .eq('customer->>email', input.contact.email)
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Ostatnia godzina (rozszerzone okno)
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentPaidOrders.data && recentPaidOrders.data.length > 0) {
            const paidOrder = recentPaidOrders.data[0];
            const orderTotal = Number(paidOrder.total);
            const cartTotal = input.totalAmount || 0;
            const difference = Math.abs(orderTotal - cartTotal);
            const tolerance = Math.max(orderTotal, cartTotal) * 0.1;

            if (difference <= tolerance) {
              console.log('[AbandonedCart:Heartbeat] Found paid order for existing cart, marking as converted', {
                cartId: existing.id,
                orderId: paidOrder.id,
                orderNumber: paidOrder.order_number,
                email: input.contact.email
              });
              
              // Oznacz abandoned cart jako converted (zamówienie zostało opłacone)
              const existingMetadata = (existing.metadata as Record<string, unknown>) || {};
              await supabase
                .from('abandoned_carts')
                .update({ 
                  status: 'converted',
                  metadata: { 
                    ...existingMetadata, 
                    converted_reason: 'order_paid',
                    converted_order_id: paidOrder.id,
                    converted_at: new Date().toISOString()
                  }
                })
                .eq('id', existing.id);
              
              return NextResponse.json({ 
                success: true, 
                skipped: true, 
                reason: 'order_already_paid',
                orderId: paidOrder.id 
              }, { status: 200 });
            }
          }
        } catch (checkError) {
          console.error('[AbandonedCart:Heartbeat] Error checking for paid orders (existing cart)', checkError);
        }
      }

      console.log('[AbandonedCart:Heartbeat] Updating existing cart', { cartId: existing.id });
      const { data: updated, error: updateError } = await supabase
        .from('abandoned_carts')
        .update({
          utm: input.utm || {},
          contact: input.contact || {},
          car: input.car || {},
          configuration: input.configuration || {},
          items: input.items || [],
          currency: input.currency || 'PLN',
          total_amount: input.totalAmount ?? 0,
          ip: input.ip,
          user_agent: input.userAgent,
          metadata: { ...(input.metadata || {}), stage: input.stage, address: input.address || {} },
          last_activity_at: new Date().toISOString(),
          expire_at: expireAt,
        })
        .eq('id', existing.id)
        .is('bitrix_deal_id', null) // Only update if deal_id is still null
        .select()
        .single();

      if (updateError) {
        console.error('[AbandonedCart:Heartbeat] Error updating cart', updateError);
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      if (!updated) {
        // Cart was already exported by another process
        console.log('[AbandonedCart:Heartbeat] Cart already exported, skipping update');
        return NextResponse.json({ success: true, skipped: true, reason: 'already_exported' }, { status: 200 });
      }

      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    console.log('[AbandonedCart:Heartbeat] Creating new cart');
    const { data: inserted, error: insertError } = await supabase
      .from('abandoned_carts')
      .insert({
        session_id: input.sessionId,
        status: 'pending',
        utm: input.utm || {},
        contact: input.contact || {},
        car: input.car || {},
        configuration: input.configuration || {},
        items: input.items || [],
        currency: input.currency || 'PLN',
        total_amount: input.totalAmount ?? 0,
        ip: input.ip,
        user_agent: input.userAgent,
        metadata: { ...(input.metadata || {}), stage: input.stage, address: input.address || {} },
        last_activity_at: new Date().toISOString(),
        expire_at: expireAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[AbandonedCart:Heartbeat] Error inserting cart', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    console.log('[AbandonedCart:Heartbeat] Successfully created cart', { cartId: inserted.id });
    return NextResponse.json({ success: true, data: inserted }, { status: 200 });
  } catch (error) {
    console.error('[AbandonedCart:Heartbeat] Unexpected error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}


