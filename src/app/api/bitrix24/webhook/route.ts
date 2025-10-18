/**
 * Bitrix24 Webhook Endpoint
 * 
 * Receives webhooks from Bitrix24 for bidirectional synchronization
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateBitrix24WebhookEvent } from '@/lib/validators/bitrix24';
import { OrderService } from '@/lib/services/OrderService';
import { contactService } from '@/lib/integrations/bitrix24/services/ContactService';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';
import { leadService } from '@/lib/integrations/bitrix24/services/LeadService';
import { bitrix24Config } from '@/lib/integrations/bitrix24/config';

const orderService = new OrderService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Bitrix24 webhook received');

    // Check if webhooks are enabled
    if (!bitrix24Config.enabled) {
      console.log('⚠️ Bitrix24 integration is disabled, ignoring webhook');
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 integration is disabled'
      }, { status: 400 });
    }

    // Parse webhook data
    const body = await request.json();
    console.log('🔔 Webhook data:', { event: body.event, dataKeys: Object.keys(body.data || {}) });

    // Validate webhook event
    try {
      const webhookEvent = validateBitrix24WebhookEvent(body);
      console.log('✅ Webhook event validated');
    } catch (error) {
      console.error('❌ Invalid webhook event:', error);
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook event format'
      }, { status: 400 });
    }

    // Process webhook based on event type
    const result = await processWebhookEvent(body);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      details: result
    });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Process webhook event
 */
async function processWebhookEvent(webhookData: any): Promise<any> {
  const { event, data } = webhookData;
  const fields = data?.FIELDS || {};

  console.log(`🔔 Processing webhook event: ${event}`);

  switch (event) {
    case 'ONCRMCONTACTUPDATE':
      return await handleContactUpdate(fields);
    
    case 'ONCRMCONTACTADD':
      return await handleContactAdd(fields);
    
    case 'ONCRMDEALUPDATE':
      return await handleDealUpdate(fields);
    
    case 'ONCRMDEALADD':
      return await handleDealAdd(fields);
    
    case 'ONCRMLEADUPDATE':
      return await handleLeadUpdate(fields);
    
    case 'ONCRMLEADADD':
      return await handleLeadAdd(fields);
    
    case 'ONCRMLEADDELETE':
      return await handleLeadDelete(fields);
    
    default:
      console.log(`⚠️ Unhandled webhook event: ${event}`);
      return {
        event,
        status: 'unhandled',
        message: 'Event type not supported'
      };
  }
}

/**
 * Handle contact update
 */
async function handleContactUpdate(fields: any) {
  try {
    console.log('👤 Contact updated in Bitrix24:', fields.ID);

    // Check if we have an order with this contact
    const contact = await contactService.getContact(fields.ID);
    if (!contact) {
      return {
        event: 'ONCRMCONTACTUPDATE',
        status: 'skipped',
        message: 'Contact not found in our system'
      };
    }

    // Update local order if needed (if contact data affects order)
    // This is a placeholder - in a real implementation, you might want to
    // update order customer data based on contact changes
    console.log('✅ Contact update processed:', contact.id);

    return {
      event: 'ONCRMCONTACTUPDATE',
      status: 'processed',
      contactId: fields.ID,
      message: 'Contact update processed'
    };

  } catch (error) {
    console.error('❌ Failed to handle contact update:', error);
    throw error;
  }
}

/**
 * Handle contact add
 */
async function handleContactAdd(fields: any) {
  try {
    console.log('👤 Contact added in Bitrix24:', fields.ID);

    // Log the new contact for monitoring
    console.log('✅ New contact logged:', {
      id: fields.ID,
      name: fields.NAME,
      email: fields.EMAIL?.[0]?.VALUE,
      phone: fields.PHONE?.[0]?.VALUE
    });

    return {
      event: 'ONCRMCONTACTADD',
      status: 'processed',
      contactId: fields.ID,
      message: 'New contact logged'
    };

  } catch (error) {
    console.error('❌ Failed to handle contact add:', error);
    throw error;
  }
}

/**
 * Handle deal update
 */
async function handleDealUpdate(fields: any) {
  try {
    console.log('💼 Deal updated in Bitrix24:', fields.ID);

    // Check if this deal corresponds to an order
    const orderNumber = fields.UF_CRM_ORDER_NUMBER;
    if (!orderNumber) {
      return {
        event: 'ONCRMDEALUPDATE',
        status: 'skipped',
        message: 'No order number found in deal'
      };
    }

    // Find the order
    const order = await orderService.getOrderByNumber(orderNumber);
    if (!order) {
      return {
        event: 'ONCRMDEALUPDATE',
        status: 'skipped',
        message: 'Order not found in our system'
      };
    }

    // Update order status based on deal stage
    const newStatus = mapDealStageToOrderStatus(fields.STAGE_ID);
    if (newStatus && newStatus !== order.status) {
      await orderService.updateOrderStatus(order.id, newStatus as any);
      console.log('✅ Order status updated:', { orderNumber, newStatus });
    }

    // Update payment status if deal has payment info
    if (fields.UF_CRM_PAYMENT_STATUS && fields.UF_CRM_PAYMENT_STATUS !== order.paymentStatus) {
      await orderService.updatePaymentStatus(order.id, fields.UF_CRM_PAYMENT_STATUS as any);
      console.log('✅ Order payment status updated:', { orderNumber, paymentStatus: fields.UF_CRM_PAYMENT_STATUS });
    }

    return {
      event: 'ONCRMDEALUPDATE',
      status: 'processed',
      dealId: fields.ID,
      orderNumber,
      updates: {
        status: newStatus,
        paymentStatus: fields.UF_CRM_PAYMENT_STATUS
      },
      message: 'Deal update processed and order updated'
    };

  } catch (error) {
    console.error('❌ Failed to handle deal update:', error);
    throw error;
  }
}

/**
 * Handle deal add
 */
async function handleDealAdd(fields: any) {
  try {
    console.log('💼 Deal added in Bitrix24:', fields.ID);

    // Log the new deal for monitoring
    console.log('✅ New deal logged:', {
      id: fields.ID,
      title: fields.TITLE,
      stageId: fields.STAGE_ID,
      opportunity: fields.OPPORTUNITY,
      orderNumber: fields.UF_CRM_ORDER_NUMBER
    });

    return {
      event: 'ONCRMDEALADD',
      status: 'processed',
      dealId: fields.ID,
      message: 'New deal logged'
    };

  } catch (error) {
    console.error('❌ Failed to handle deal add:', error);
    throw error;
  }
}

/**
 * Handle lead update
 */
async function handleLeadUpdate(fields: any) {
  try {
    console.log('🎯 Lead updated in Bitrix24:', fields.ID);

    // Log lead update for monitoring
    console.log('✅ Lead update logged:', {
      id: fields.ID,
      title: fields.TITLE,
      statusId: fields.STATUS_ID,
      sourceId: fields.SOURCE_ID
    });

    return {
      event: 'ONCRMLEADUPDATE',
      status: 'processed',
      leadId: fields.ID,
      message: 'Lead update processed'
    };

  } catch (error) {
    console.error('❌ Failed to handle lead update:', error);
    throw error;
  }
}

/**
 * Handle lead add
 */
async function handleLeadAdd(fields: any) {
  try {
    console.log('🎯 Lead added in Bitrix24:', fields.ID);

    // Log the new lead for monitoring
    console.log('✅ New lead logged:', {
      id: fields.ID,
      title: fields.TITLE,
      name: fields.NAME,
      email: fields.EMAIL?.[0]?.VALUE,
      phone: fields.PHONE?.[0]?.VALUE,
      sourceId: fields.SOURCE_ID
    });

    return {
      event: 'ONCRMLEADADD',
      status: 'processed',
      leadId: fields.ID,
      message: 'New lead logged'
    };

  } catch (error) {
    console.error('❌ Failed to handle lead add:', error);
    throw error;
  }
}

/**
 * Handle lead delete
 */
async function handleLeadDelete(fields: any) {
  try {
    console.log('🎯 Lead deleted in Bitrix24:', fields.ID);

    // Log lead deletion for monitoring
    console.log('✅ Lead deletion logged:', {
      id: fields.ID,
      title: fields.TITLE
    });

    return {
      event: 'ONCRMLEADDELETE',
      status: 'processed',
      leadId: fields.ID,
      message: 'Lead deletion logged'
    };

  } catch (error) {
    console.error('❌ Failed to handle lead delete:', error);
    throw error;
  }
}

/**
 * Map Bitrix24 deal stage to order status
 */
function mapDealStageToOrderStatus(stageId: string): string | null {
  const stageMap: Record<string, string> = {
    'NEW': 'pending',
    'PREPARATION': 'confirmed',
    'PREPARATION_INVOICE': 'confirmed',
    'PREPARATION_DEAL': 'confirmed',
    'WON': 'delivered',
    'LOSE': 'cancelled',
    'APOLOGY': 'cancelled',
  };

  return stageMap[stageId] || null;
}

/**
 * GET - Webhook health check
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Bitrix24 webhook endpoint is active',
      timestamp: new Date().toISOString(),
      config: {
        enabled: bitrix24Config.enabled,
        webhookUrl: bitrix24Config.webhookUrl ? 'configured' : 'not configured'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT - Update webhook configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, events } = body;

    if (action === 'test') {
      // Test webhook by sending a test event
      const testResult = await processWebhookEvent({
        event: 'ONCRMCONTACTADD',
        data: {
          FIELDS: {
            ID: 'test-123',
            NAME: 'Test Contact',
            EMAIL: [{ VALUE: 'test@example.com', VALUE_TYPE: 'WORK' }]
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Webhook test completed',
        details: testResult
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Available: test'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Webhook configuration update failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
