/**
 * Bitrix24 API Service
 * 
 * Centralized API calls for Bitrix24 integration endpoints
 */

import { apiPost, ApiError } from './client';

export interface ChatMessageData {
  name: string;
  phone: string;
  message?: string;
}

export interface ChatResponse {
  success: boolean;
  dealId?: string;
  contactId?: string;
  message?: string;
  details?: {
    dealId?: string;
    contactId?: string;
    contactCreated?: boolean;
    stageId?: string;
    categoryId?: number;
    syncedAt?: string;
  };
}

/**
 * Send chat message to Bitrix24
 */
export async function sendChatMessage(data: ChatMessageData): Promise<ChatResponse> {
  try {
    const response = await apiPost<ChatResponse & { error?: string }>(
      '/api/bitrix24/chat',
      data
    );
    
    if (!response.success) {
      throw new ApiError(
        response.error || 'Failed to submit contact form',
        400,
        response
      );
    }
    
    return {
      success: true,
      dealId: response.details?.dealId,
      contactId: response.details?.contactId,
      message: response.message,
      details: response.details,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Nieznany błąd',
      500,
      error
    );
  }
}

/**
 * Bitrix24 API object with all methods
 */
export const bitrix24Api = {
  sendChatMessage,
};

