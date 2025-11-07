/**
 * Chat to Bitrix24 Deal Mapper
 * 
 * Maps chat form data to Bitrix24 Deal format
 */

import { Bitrix24Deal } from '@/lib/types/bitrix';

export interface ChatFormData {
  name: string;
  phone: string;
  message?: string;
}

export interface ChatToDealMappingOptions {
  contactId?: string;
  stageId: string;
  categoryId: number;
  currencyId?: string;
}

/**
 * Map Chat form data to Bitrix24 Deal
 */
export function mapChatToDeal(
  chatData: ChatFormData,
  options: ChatToDealMappingOptions
): Bitrix24Deal {
  console.log('🔍 mapChatToDeal: Starting mapping for chat:', {
    name: chatData.name,
    phone: chatData.phone,
    hasMessage: !!chatData.message,
    options
  });

  // Build deal data
  const deal: Bitrix24Deal = {
    TITLE: `Czat - ${chatData.name}`,
    STAGE_ID: options.stageId,
    CATEGORY_ID: options.categoryId,
    OPPORTUNITY: 0.01, // Minimal value (validator requires positive number)
    CURRENCY_ID: options.currencyId || 'PLN',
    CONTACT_ID: options.contactId,
    
    // Source identification
    ORIGINATOR_ID: 'EVA Website',
    SOURCE_ID: 'CHAT',
    SOURCE_DESCRIPTION: 'Czat ze strony',
    
    // Comments with chat message
    COMMENTS: buildDealComments(chatData),
  };

  console.log('🔍 mapChatToDeal: Built deal object:', deal);

  // Remove undefined values
  const cleanedDeal = removeUndefinedValues(deal);
  console.log('🔍 mapChatToDeal: Final deal object after cleaning:', cleanedDeal);
  
  return cleanedDeal;
}

/**
 * Build deal comments from chat data
 */
function buildDealComments(chatData: ChatFormData): string {
  const comments: string[] = [];
  
  comments.push(`Źródło: Czat ze strony`);
  comments.push(`Data: ${new Date().toISOString().split('T')[0]}`);
  comments.push(`Klient: ${chatData.name}`);
  comments.push(`Telefon: ${chatData.phone}`);
  
  if (chatData.message) {
    comments.push(`\nWiadomość:`);
    comments.push(chatData.message);
  }

  return comments.join('\n');
}

/**
 * Remove undefined values from object
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

