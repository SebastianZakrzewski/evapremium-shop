/**
 * Bitrix24 Chat Endpoint
 * 
 * Handles chat form submissions and creates deals in Bitrix24
 * POST /api/bitrix24/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/integrations/bitrix24/services/ContactService';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';
import { stageMappingService } from '@/lib/integrations/bitrix24/services/StageMappingService';
import { mapChatToDeal, ChatFormData } from '@/lib/integrations/bitrix24/mappers/chatToDeal';
import { Bitrix24Contact } from '@/lib/types/bitrix';
import { bitrix24Config } from '@/lib/integrations/bitrix24/config';

/**
 * POST - Submit chat form and create deal in Bitrix24
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, message } = body;

    console.log('💬 Chat submission received:', { name, phone, hasMessage: !!message });

    // Check if Bitrix24 is enabled
    if (!bitrix24Config.enabled) {
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 integration is disabled'
      }, { status: 400 });
    }

    // Validate input data
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Name is required and must be at least 2 characters'
      }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 });
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Prepare chat data
    const chatData: ChatFormData = {
      name: name.trim(),
      phone: normalizedPhone,
      message: message?.trim() || undefined,
    };

    // 1. Find or create contact
    console.log('📞 Finding or creating contact...');
    const contactData: Bitrix24Contact = {
      NAME: chatData.name.split(' ')[0] || chatData.name,
      LAST_NAME: chatData.name.split(' ').slice(1).join(' ') || undefined,
      PHONE: [{
        VALUE: chatData.phone,
        VALUE_TYPE: 'WORK'
      }],
      SOURCE_ID: 'CHAT',
      SOURCE_DESCRIPTION: 'Czat ze strony',
    };

    const contactResult = await contactService.findOrCreateContact(contactData, {
      sourceId: 'CHAT',
      sourceDescription: 'Czat ze strony',
    });

    if (!contactResult.id) {
      console.error('❌ Failed to create/find contact:', contactResult.error);
      return NextResponse.json({
        success: false,
        error: `Failed to create/find contact: ${contactResult.error || 'Unknown error'}`
      }, { status: 500 });
    }

    console.log('✅ Contact found/created:', {
      id: contactResult.id,
      created: contactResult.created
    });

    // 2. Resolve chat stage and category
    console.log('🎯 Resolving chat stage...');
    const stageResult = await stageMappingService.resolveStage({ type: 'chat' });
    
    if (!stageResult.stageId || !stageResult.categoryId) {
      console.error('❌ Failed to resolve chat stage:', stageResult);
      return NextResponse.json({
        success: false,
        error: 'Failed to resolve chat stage. Please check Bitrix24 configuration.'
      }, { status: 500 });
    }

    console.log('✅ Chat stage resolved:', {
      stageId: stageResult.stageId,
      categoryId: stageResult.categoryId
    });

    // 3. Map chat data to deal
    console.log('📋 Mapping chat data to deal...');
    const dealData = mapChatToDeal(chatData, {
      contactId: contactResult.id,
      stageId: stageResult.stageId,
      categoryId: stageResult.categoryId,
      currencyId: 'PLN',
    });

    // 4. Create deal in Bitrix24
    console.log('💼 Creating deal in Bitrix24...');
    const dealResult = await dealService.createDeal(dealData, {
      currencyId: 'PLN',
      contactId: contactResult.id,
    });

    if (!dealResult.success) {
      console.error('❌ Failed to create deal:', dealResult.error);
      return NextResponse.json({
        success: false,
        error: `Failed to create deal: ${dealResult.error || 'Unknown error'}`
      }, { status: 500 });
    }

    console.log('✅ Deal created successfully:', {
      dealId: dealResult.id,
      contactId: contactResult.id,
      stageId: stageResult.stageId,
      categoryId: stageResult.categoryId
    });

    return NextResponse.json({
      success: true,
      message: 'Chat submission processed successfully',
      details: {
        dealId: dealResult.id,
        contactId: contactResult.id,
        contactCreated: contactResult.created,
        stageId: stageResult.stageId,
        categoryId: stageResult.categoryId,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Chat submission failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

