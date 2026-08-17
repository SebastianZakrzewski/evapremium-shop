/**
 * Bitrix24 Contact Service
 * 
 * Handles contact operations in Bitrix24 CRM
 */

import { Bitrix24Client } from '../client';
import { Bitrix24Contact, Bitrix24ApiResponse } from '@/lib/types/bitrix';
import { validateBitrix24Contact } from '@/lib/validators/bitrix24';

export interface ContactSearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface CreateContactOptions {
  sourceId?: string;
  sourceDescription?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export class ContactService {
  private client: Bitrix24Client;

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
  }

  /**
   * Create a new contact in Bitrix24
   */
  async createContact(
    contactData: Bitrix24Contact,
    options: CreateContactOptions = {}
  ): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      // Validate contact data
      const validatedData = validateBitrix24Contact(contactData);

      // Add options to contact data
      const enrichedData = {
        ...validatedData,
        SOURCE_ID: options.sourceId || validatedData.SOURCE_ID,
        SOURCE_DESCRIPTION: options.sourceDescription || validatedData.SOURCE_DESCRIPTION,
        UTM_SOURCE: options.utmSource || validatedData.UTM_SOURCE,
        UTM_MEDIUM: options.utmMedium || validatedData.UTM_MEDIUM,
        UTM_CAMPAIGN: options.utmCampaign || validatedData.UTM_CAMPAIGN,
      };

      console.log('📞 Creating Bitrix24 contact:', { name: enrichedData.NAME, email: enrichedData.EMAIL?.[0]?.VALUE });

      // Sprawdź czy mamy minimum wymagane dane
      console.log('🔍 Contact data before validation:', {
        name: enrichedData.NAME,
        hasEmail: !!enrichedData.EMAIL?.length,
        hasPhone: !!enrichedData.PHONE?.length,
        emailValue: enrichedData.EMAIL?.[0]?.VALUE,
        phoneValue: enrichedData.PHONE?.[0]?.VALUE,
        fullData: enrichedData
      });

      if (!enrichedData.NAME || (!enrichedData.EMAIL?.length && !enrichedData.PHONE?.length)) {
        throw new Error('Contact must have name and either email or phone');
      }

      const response = await this.client.post<{ id: string }>('crm.contact.add', {
        fields: enrichedData
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      // Bitrix24 returns contact ID directly as result, not as result.id
      const contactId = typeof response.result === 'string' || typeof response.result === 'number' 
        ? String(response.result) 
        : response.result?.id ? String(response.result.id) : null;
      
      console.log('🔍 Contact creation response analysis:', {
        hasResult: !!response.result,
        resultType: typeof response.result,
        resultValue: response.result,
        extractedId: contactId,
        isIdValid: !!contactId && contactId !== '0',
        fullResponse: response
      });

      if (!contactId) {
        console.error('❌ No contact ID in response:', {
          fullResponse: response,
          result: response.result,
          error: response.error,
          enrichedData: enrichedData
        });
        throw new Error('No contact ID returned from Bitrix24');
      }

      console.log('✅ Contact created successfully:', { id: contactId, name: enrichedData.NAME });

      return {
        id: String(contactId), // Convert to string for consistency
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to create contact:', error);
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing contact in Bitrix24
   */
  async updateContact(
    contactId: string,
    contactData: Partial<Bitrix24Contact>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📞 Updating Bitrix24 contact:', { id: contactId });

      const response = await this.client.post<{ id: string }>('crm.contact.update', {
        id: contactId,
        fields: contactData,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Contact updated successfully:', { id: contactId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to update contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find contact by email address
   */
  async findByEmail(email: string): Promise<ContactSearchResult | null> {
    try {
      console.log('🔍 Searching contact by email:', email);

      const response = await this.client.get('crm.contact.list', {
        filter: {
          'EMAIL': email,
        },
        select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const contacts = response.result || [];
      if (contacts.length === 0) {
        console.log('📞 No contact found with email:', email);
        return null;
      }

      const contact = contacts[0];
      const result: ContactSearchResult = {
        id: contact.ID,
        name: `${contact.NAME || ''} ${contact.LAST_NAME || ''}`.trim(),
        email: contact.EMAIL?.[0]?.VALUE,
        phone: contact.PHONE?.[0]?.VALUE,
        company: contact.COMPANY_TITLE,
      };

      console.log('✅ Contact found by email:', { id: result.id, name: result.name });

      return result;

    } catch (error) {
      console.error('❌ Failed to find contact by email:', error);
      throw error;
    }
  }

  /**
   * Find contact by phone number
   */
  async findByPhone(phone: string): Promise<ContactSearchResult | null> {
    try {
      console.log('🔍 Searching contact by phone:', phone);

      const response = await this.client.get('crm.contact.list', {
        filter: {
          'PHONE': phone,
        },
        select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const contacts = response.result || [];
      if (contacts.length === 0) {
        console.log('📞 No contact found with phone:', phone);
        return null;
      }

      const contact = contacts[0];
      const result: ContactSearchResult = {
        id: contact.ID,
        name: `${contact.NAME || ''} ${contact.LAST_NAME || ''}`.trim(),
        email: contact.EMAIL?.[0]?.VALUE,
        phone: contact.PHONE?.[0]?.VALUE,
        company: contact.COMPANY_TITLE,
      };

      console.log('✅ Contact found by phone:', { id: result.id, name: result.name });

      return result;

    } catch (error) {
      console.error('❌ Failed to find contact by phone:', error);
      throw error;
    }
  }

  /**
   * Create or find contact from abandoned cart data
   */
  async createOrFindContactFromAbandonedCart(
    cart: any
  ): Promise<{ id: string | null; created: boolean; error?: string }> {
    try {
      const contact = cart.contact || {};
      // Address is stored in metadata now (since there's no address column in DB)
      const address = (cart.metadata?.address as any) || cart.address || {};
      
      // Build contact data from cart
      const contactData: Bitrix24Contact = {
        NAME: contact.firstName || '',
        LAST_NAME: contact.lastName || '',
        EMAIL: contact.email ? [{ VALUE: contact.email, VALUE_TYPE: 'WORK' }] : undefined,
        PHONE: contact.phone ? [{ VALUE: contact.phone, VALUE_TYPE: 'WORK' }] : undefined,
        SOURCE_ID: 'WEB',
        SOURCE_DESCRIPTION: 'EVA Website - Porzucony koszyk',
      };

      // Add address data if available
      if (address.street || address.city || address.postalCode || address.country) {
        const addressParts: string[] = [];
        if (address.street) addressParts.push(address.street);
        if (address.city) addressParts.push(address.city);
        if (address.postalCode) addressParts.push(address.postalCode);
        if (address.country) addressParts.push(address.country);
        
        contactData.ADDRESS = addressParts.length > 0 ? addressParts.join(', ') : undefined;
        if (address.city) contactData.ADDRESS_CITY = address.city;
        if (address.postalCode) contactData.ADDRESS_POSTAL_CODE = address.postalCode;
        if (address.country) contactData.ADDRESS_COUNTRY = address.country;
      }

      // Extract UTM data if available
      if (cart.utm) {
        if (cart.utm.source) contactData.UTM_SOURCE = String(cart.utm.source);
        if (cart.utm.medium) contactData.UTM_MEDIUM = String(cart.utm.medium);
        if (cart.utm.campaign) contactData.UTM_CAMPAIGN = String(cart.utm.campaign);
      }

      // Validate we have at least name and email or phone
      if (!contactData.NAME || (!contactData.EMAIL?.length && !contactData.PHONE?.length)) {
        console.warn('[ContactService] Insufficient contact data for abandoned cart', { 
          hasName: !!contactData.NAME,
          hasEmail: !!contactData.EMAIL?.length,
          hasPhone: !!contactData.PHONE?.length
        });
        return { id: null, created: false, error: 'Insufficient contact data' };
      }

      // Use existing findOrCreateContact method
      const result = await this.findOrCreateContact(contactData, {
        sourceId: 'WEB',
        sourceDescription: 'EVA Website - Porzucony koszyk',
        utmSource: contactData.UTM_SOURCE,
        utmMedium: contactData.UTM_MEDIUM,
        utmCampaign: contactData.UTM_CAMPAIGN,
      });

      return {
        id: result.id || null,
        created: result.created,
        error: result.error,
      };

    } catch (error) {
      console.error('[ContactService] Failed to create or find contact from abandoned cart:', error);
      return {
        id: null,
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find contact by email or phone (create if not found)
   */
  async findOrCreateContact(
    contactData: Bitrix24Contact,
    options: CreateContactOptions = {}
  ): Promise<{ id: string; created: boolean; error?: string }> {
    try {
      // First, try to find by email
      if (contactData.EMAIL?.[0]?.VALUE) {
        const existingContact = await this.findByEmail(contactData.EMAIL[0].VALUE);
        if (existingContact) {
          console.log('📞 Found existing contact by email:', { id: existingContact.id, name: existingContact.name });
          return {
            id: existingContact.id,
            created: false,
          };
        }
      }

      // Then, try to find by phone
      if (contactData.PHONE?.[0]?.VALUE) {
        const existingContact = await this.findByPhone(contactData.PHONE[0].VALUE);
        if (existingContact) {
          console.log('📞 Found existing contact by phone:', { id: existingContact.id, name: existingContact.name });
          return {
            id: existingContact.id,
            created: false,
          };
        }
      }

      // If not found, create new contact
      console.log('📞 Creating new contact (not found by email/phone)');
      const createResult = await this.createContact(contactData, options);
      
      if (!createResult.success) {
        return {
          id: '',
          created: false,
          error: createResult.error,
        };
      }

      return {
        id: createResult.id,
        created: true,
      };

    } catch (error) {
      console.error('❌ Failed to find or create contact:', error);
      return {
        id: '',
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId: string): Promise<ContactSearchResult | null> {
    try {
      console.log('🔍 Getting contact by ID:', contactId);

      const response = await this.client.get('crm.contact.get', {
        id: contactId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const contact = response.result;
      if (!contact) {
        console.log('📞 Contact not found:', contactId);
        return null;
      }

      const result: ContactSearchResult = {
        id: contact.ID,
        name: `${contact.NAME || ''} ${contact.LAST_NAME || ''}`.trim(),
        email: contact.EMAIL?.[0]?.VALUE,
        phone: contact.PHONE?.[0]?.VALUE,
        company: contact.COMPANY_TITLE,
      };

      console.log('✅ Contact retrieved:', { id: result.id, name: result.name });

      return result;

    } catch (error) {
      console.error('❌ Failed to get contact:', error);
      throw error;
    }
  }

  /**
   * Search contacts by name
   */
  async searchByName(name: string): Promise<ContactSearchResult[]> {
    try {
      console.log('🔍 Searching contacts by name:', name);

      const response = await this.client.get('crm.contact.list', {
        filter: {
          '%NAME': name,
        },
        select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const contacts = response.result || [];
      const results: ContactSearchResult[] = contacts.map((contact: any) => ({
        id: contact.ID,
        name: `${contact.NAME || ''} ${contact.LAST_NAME || ''}`.trim(),
        email: contact.EMAIL?.[0]?.VALUE,
        phone: contact.PHONE?.[0]?.VALUE,
        company: contact.COMPANY_TITLE,
      }));

      console.log('✅ Found contacts by name:', { count: results.length, name });

      return results;

    } catch (error) {
      console.error('❌ Failed to search contacts by name:', error);
      return [];
    }
  }

  /**
   * Delete contact by ID
   */
  async deleteContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting contact:', contactId);

      const response = await this.client.post('crm.contact.delete', {
        id: contactId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Contact deleted successfully:', contactId);

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to delete contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const contactService = new ContactService();
