/**
 * Bitrix24 Sync Endpoint
 * 
 * Manual synchronization of orders and leads to Bitrix24
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { contactService } from '@/lib/integrations/bitrix24/services/ContactService';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';
import { leadService } from '@/lib/integrations/bitrix24/services/LeadService';
import { mapOrderToContact } from '@/lib/integrations/bitrix24/mappers/orderToContact';
import { mapOrderToDeal, createDealProducts } from '@/lib/integrations/bitrix24/mappers/orderToDeal';
import { mapFormToLead } from '@/lib/integrations/bitrix24/mappers/formToLead';
import { bitrix24Config } from '@/lib/integrations/bitrix24/config';

const orderService = new OrderService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      orderId, 
      orderNumber, 
      dateFrom, 
      dateTo, 
      formData,
      force = false 
    } = body;

    console.log('🔄 Bitrix24 sync request:', { type, orderId, orderNumber, dateFrom, dateTo, force });

    // Check if Bitrix24 is enabled
    if (!bitrix24Config.enabled) {
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 integration is disabled'
      }, { status: 400 });
    }

    switch (type) {
      case 'order':
        return await syncOrder(orderId, orderNumber, force);
      
      case 'orders':
        return await syncOrders(dateFrom, dateTo, force);
      
      case 'lead':
        return await syncLead(formData);
      
      case 'all':
        return await syncAll(dateFrom, dateTo, force);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid sync type. Available: order, orders, lead, all'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Bitrix24 sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Sync single order
 */
async function syncOrder(orderId?: string, orderNumber?: string, force = false) {
  try {
    if (!orderId && !orderNumber) {
      return NextResponse.json({
        success: false,
        error: 'Either orderId or orderNumber is required'
      }, { status: 400 });
    }

    // Get order
    let order;
    if (orderId) {
      order = await orderService.getOrderById(orderId);
    } else {
      order = await orderService.getOrderByNumber(orderNumber!);
    }

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    console.log('🔄 Syncing order:', order.orderNumber);

    // Check if deal already exists (unless force)
    if (!force) {
      const existingDeal = await dealService.findByOrderNumber(order.orderNumber);
      if (existingDeal) {
        return NextResponse.json({
          success: false,
          error: 'Deal already exists for this order. Use force=true to update.',
          details: {
            orderNumber: order.orderNumber,
            dealId: existingDeal.id,
            dealTitle: existingDeal.title
          }
        }, { status: 409 });
      }
    }

    // Sync order to Bitrix24
    await syncOrderToBitrix24(order);

    return NextResponse.json({
      success: true,
      message: 'Order synced successfully',
      details: {
        orderNumber: order.orderNumber,
        orderId: order.id,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to sync order:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Sync multiple orders
 */
async function syncOrders(dateFrom?: string, dateTo?: string, force = false) {
  try {
    console.log('🔄 Syncing multiple orders:', { dateFrom, dateTo, force });

    // Get orders by status (all pending/confirmed orders)
    const orders = await orderService.getOrdersByStatus('pending');
    const confirmedOrders = await orderService.getOrdersByStatus('confirmed');
    const allOrders = [...orders, ...confirmedOrders];

    // Filter by date range if provided
    let filteredOrders = allOrders;
    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const toDate = dateTo ? new Date(dateTo) : new Date();
      
      filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    console.log(`🔄 Found ${filteredOrders.length} orders to sync`);

    const results = {
      total: filteredOrders.length,
      synced: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    // Sync each order
    for (const order of filteredOrders) {
      try {
        // Check if deal already exists (unless force)
        if (!force) {
          const existingDeal = await dealService.findByOrderNumber(order.orderNumber);
          if (existingDeal) {
            results.skipped++;
            results.details.push({
              orderNumber: order.orderNumber,
              status: 'skipped',
              reason: 'Deal already exists',
              dealId: existingDeal.id
            });
            continue;
          }
        }

        await syncOrderToBitrix24(order);
        results.synced++;
        results.details.push({
          orderNumber: order.orderNumber,
          status: 'synced',
          syncedAt: new Date().toISOString()
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          orderNumber: order.orderNumber,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Failed to sync order ${order.orderNumber}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${results.synced} synced, ${results.skipped} skipped, ${results.errors} errors`,
      details: results
    });

  } catch (error) {
    console.error('❌ Failed to sync orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Sync lead from form data
 */
async function syncLead(formData: any) {
  try {
    if (!formData) {
      return NextResponse.json({
        success: false,
        error: 'Form data is required'
      }, { status: 400 });
    }

    console.log('🔄 Syncing lead from form data');

    // Map form data to lead
    const leadData = mapFormToLead(formData, {
      sourceId: 'CONTACT_FORM',
      statusId: 'NEW'
    });

    // Create lead
    const leadResult = await leadService.createLead(leadData, {
      sourceId: 'CONTACT_FORM',
      statusId: 'NEW'
    });

    if (!leadResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to create lead: ${leadResult.error}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead synced successfully',
      details: {
        leadId: leadResult.id,
        title: leadData.TITLE,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to sync lead:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Sync all (orders + leads)
 */
async function syncAll(dateFrom?: string, dateTo?: string, force = false) {
  try {
    console.log('🔄 Running full sync:', { dateFrom, dateTo, force });

    // Sync orders
    const ordersResult = await syncOrders(dateFrom, dateTo, force);
    const ordersData = await ordersResult.json();

    // Note: Leads sync would require form data, so we skip it in full sync
    // In a real implementation, you might want to sync leads from a database

    return NextResponse.json({
      success: ordersData.success,
      message: 'Full sync completed',
      details: {
        orders: ordersData.details,
        leads: {
          message: 'Lead sync requires form data - use /api/bitrix24/sync with type=lead'
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to run full sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Sync order to Bitrix24 (reused from OrderService)
 */
async function syncOrderToBitrix24(order: any): Promise<void> {
  try {
    console.log('🔄 Syncing order to Bitrix24:', order.orderNumber);

    // Sprawdź konfigurację Bitrix24
    console.log('🔍 Bitrix24 configuration check:', {
      enabled: bitrix24Config.enabled,
      hasWebhookUrl: !!bitrix24Config.webhookUrl,
      config: bitrix24Config
    });

    // 1. Map order to contact
    console.log('🔍 Order data for contact mapping:', {
      orderNumber: order.orderNumber,
      customer: order.customer,
      hasCustomerName: !!(order.customer as any)?.name,
      hasCustomerEmail: !!(order.customer as any)?.email,
      hasCustomerPhone: !!(order.customer as any)?.phone,
      customerName: (order.customer as any)?.name,
      customerEmail: (order.customer as any)?.email,
      customerPhone: (order.customer as any)?.phone,
      shippingAddress: order.shippingAddress
    });

    const contactData = mapOrderToContact(order, {
      sourceId: 'WEB',
      sourceDescription: 'EVA Website',
      utmSource: order.utmSource,
      utmMedium: order.utmMedium,
      utmCampaign: order.utmCampaign,
    });

    console.log('🔍 Mapped contact data:', {
      name: contactData.NAME,
      lastName: contactData.LAST_NAME,
      hasEmail: !!contactData.EMAIL?.length,
      hasPhone: !!contactData.PHONE?.length,
      emailValue: contactData.EMAIL?.[0]?.VALUE,
      phoneValue: contactData.PHONE?.[0]?.VALUE,
      fullContactData: contactData
    });

    // 2. Create or find contact
    console.log('🔍 Contact data before findOrCreateContact:', {
      contactData,
      orderNumber: order.orderNumber,
      customer: order.customer
    });

    const contactResult = await contactService.findOrCreateContact(contactData, {
      sourceId: 'WEB',
      sourceDescription: 'EVA Website',
      utmSource: order.utmSource,
      utmMedium: order.utmMedium,
      utmCampaign: order.utmCampaign,
    });

    console.log('🔍 Contact creation result:', {
      hasId: !!contactResult.id,
      id: contactResult.id,
      error: contactResult.error,
      created: contactResult.created
    });

    if (!contactResult.id) {
      console.error('❌ Contact creation failed:', {
        contactData,
        options: {
          sourceId: 'WEB',
          sourceDescription: 'EVA Website',
          utmSource: order.utmSource,
          utmMedium: order.utmMedium,
          utmCampaign: order.utmCampaign,
        },
        result: contactResult
      });
      throw new Error(`Failed to create/find contact: ${contactResult.error || 'No contact ID returned'}`);
    }

    // 3. Check if deal already exists
    const existingDeal = await dealService.findByOrderNumber(order.orderNumber);
    if (existingDeal) {
      console.log('📋 Deal already exists, updating:', existingDeal.id);
      console.log('🔍 Existing deal details:', {
        id: existingDeal.id,
        stageId: existingDeal.stageId,
        orderNumber: existingDeal.orderNumber
      });
      
      // Update existing deal
      const dealData = mapOrderToDeal(order, contactResult.id);
      await dealService.updateDeal(existingDeal.id, dealData);
      
      // Update deal stage
      const dealStage = getDealStageFromOrderStatus(order.status, order.paymentStatus);
      console.log('🎯 API: Calculated deal stage:', dealStage);
      await dealService.updateDealStage(existingDeal.id, {
        stageId: dealStage,
        comment: `Zamówienie zaktualizowane: ${order.status} (płatność: ${order.paymentStatus})`
      });

      console.log('✅ Deal updated successfully');
      return;
    }

    // 4. Create new deal
    const dealStage = getDealStageFromOrderStatus(order.status, order.paymentStatus);
    const dealData = mapOrderToDeal(order, contactResult.id, { stageId: dealStage });
    const dealResult = await dealService.createDeal(dealData, {
      // Usuń stageId z options - jest już w dealData
      currencyId: 'PLN',
      contactId: contactResult.id,
    });

    if (!dealResult.success) {
      throw new Error(`Failed to create deal: ${dealResult.error}`);
    }

    // 5. Add products to deal
    const products = createDealProducts(order);
    if (products.length > 0) {
      // Convert products to Bitrix24DealProduct format
      const dealProducts = products.map(product => ({
        PRODUCT_ID: product.PRODUCT_NAME, // Use product name as ID for now
        QUANTITY: product.QUANTITY,
        PRICE: product.PRICE,
      }));
      
      const productResult = await dealService.addProductsToDeal(dealResult.id, dealProducts);
      if (!productResult.success) {
        console.warn('⚠️ Failed to add products to deal:', productResult.error);
      }
    }

    console.log('✅ Order synced to Bitrix24 successfully:', {
      orderNumber: order.orderNumber,
      contactId: contactResult.id,
      dealId: dealResult.id,
      productsCount: products.length
    });

  } catch (error) {
    console.error('❌ Failed to sync order to Bitrix24:', error);
    throw error;
  }
}

/**
 * Get deal stage from order status
 */
function getDealStageFromOrderStatus(orderStatus: string, paymentStatus: string): string {
  console.log('🎯 API: getDealStageFromOrderStatus called:', {
    orderStatus,
    paymentStatus
  });

  if (paymentStatus === 'paid') {
    console.log('✅ API: Payment is paid -> UC_DMBNNJ');
    return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone (Przelewy24)
  }
  
  if (paymentStatus === 'failed') {
    return 'LOSE';
  }

  if (paymentStatus === 'refunded') {
    return 'LOSE';
  }

  switch (orderStatus) {
    case 'pending':
      return 'NEW'; // Czeka na opłatę
    case 'confirmed':
      return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
    case 'processing':
      return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
    case 'shipped':
      return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
    case 'delivered':
      return 'WON';
    case 'cancelled':
      return 'LOSE';
    default:
      return 'NEW';
  }
}

/**
 * GET - Get sync status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (orderNumber) {
      // Check if specific order is synced
      const deal = await dealService.findByOrderNumber(orderNumber);
      return NextResponse.json({
        success: true,
        synced: !!deal,
        details: deal ? {
          dealId: deal.id,
          dealTitle: deal.title,
          stageId: deal.stageId,
          opportunity: deal.opportunity,
          contactId: deal.contactId
        } : null
      });
    }

    // Get general sync statistics
    const stats = await getSyncStatistics();

    return NextResponse.json({
      success: true,
      message: 'Sync status retrieved',
      details: stats
    });

  } catch (error) {
    console.error('❌ Failed to get sync status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get sync statistics
 */
async function getSyncStatistics() {
  try {
    // Get recent orders
    const recentOrders = await orderService.getOrdersByStatus('pending');
    const confirmedOrders = await orderService.getOrdersByStatus('confirmed');
    
    // Check how many are synced
    let syncedCount = 0;
    let notSyncedCount = 0;

    for (const order of [...recentOrders, ...confirmedOrders]) {
      const deal = await dealService.findByOrderNumber(order.orderNumber);
      if (deal) {
        syncedCount++;
      } else {
        notSyncedCount++;
      }
    }

    const totalOrders = recentOrders.length + confirmedOrders.length;
    
    return {
      totalOrders,
      syncedOrders: syncedCount,
      notSyncedOrders: notSyncedCount,
      syncRate: totalOrders > 0 ? (syncedCount / totalOrders * 100).toFixed(1) + '%' : '0%',
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Failed to get sync statistics:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
