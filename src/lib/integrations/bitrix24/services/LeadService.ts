/**
 * Bitrix24 Lead Service
 * 
 * Handles lead operations in Bitrix24 CRM
 */

import { Bitrix24Client } from '../client';
import { Bitrix24Lead, Bitrix24ApiResponse } from '@/lib/types/bitrix';
import { validateBitrix24Lead } from '@/lib/validators/bitrix24';

export interface LeadSearchResult {
  id: string;
  title: string;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  sourceId?: string;
  statusId?: string;
}

export interface CreateLeadOptions {
  sourceId?: string;
  statusId?: string;
}

export interface ConvertToDealOptions {
  stageId?: string;
  currencyId?: string;
  opportunity?: number;
  contactId?: string;
}

export class LeadService {
  private client: Bitrix24Client;

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
  }

  /**
   * Create a new lead in Bitrix24
   */
  async createLead(
    leadData: Bitrix24Lead,
    options: CreateLeadOptions = {}
  ): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      // Validate lead data
      const validatedData = validateBitrix24Lead(leadData);

      // Add options to lead data
      const enrichedData = {
        ...validatedData,
        SOURCE_ID: options.sourceId || validatedData.SOURCE_ID,
        STATUS_ID: options.statusId || validatedData.STATUS_ID,
      };

      console.log('🎯 Creating Bitrix24 lead:', { title: enrichedData.TITLE, name: enrichedData.NAME });

      const response = await this.client.post<{ id: string }>('crm.lead.add', enrichedData);

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const leadId = response.result?.id;
      if (!leadId) {
        throw new Error('No lead ID returned from Bitrix24');
      }

      console.log('✅ Lead created successfully:', { id: leadId, title: enrichedData.TITLE });

      return {
        id: leadId,
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to create lead:', error);
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing lead in Bitrix24
   */
  async updateLead(
    leadId: string,
    leadData: Partial<Bitrix24Lead>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🎯 Updating Bitrix24 lead:', { id: leadId });

      const response = await this.client.post<{ id: string }>('crm.lead.update', {
        id: leadId,
        fields: leadData,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Lead updated successfully:', { id: leadId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to update lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update lead status
   */
  async updateStatus(
    leadId: string,
    statusId: string,
    comment?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🎯 Updating lead status:', { id: leadId, statusId });

      const updateData: any = {
        STATUS_ID: statusId,
      };

      if (comment) {
        updateData.COMMENTS = comment;
      }

      const response = await this.client.post('crm.lead.update', {
        id: leadId,
        fields: updateData,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Lead status updated successfully:', { id: leadId, statusId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to update lead status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Convert lead to deal
   */
  async convertToDeal(
    leadId: string,
    options: ConvertToDealOptions = {}
  ): Promise<{ dealId: string; contactId?: string; success: boolean; error?: string }> {
    try {
      console.log('🎯 Converting lead to deal:', { leadId, options });

      const convertData: any = {
        LEAD_ID: leadId,
        IS_RETURN_CUSTOMER: 'N',
        SEND_EMAIL: 'N',
      };

      if (options.stageId) {
        convertData.STAGE_ID = options.stageId;
      }

      if (options.currencyId) {
        convertData.CURRENCY_ID = options.currencyId;
      }

      if (options.opportunity) {
        convertData.OPPORTUNITY = options.opportunity;
      }

      if (options.contactId) {
        convertData.CONTACT_ID = options.contactId;
      }

      const response = await this.client.post<{
        DEAL_ID: string;
        CONTACT_ID?: string;
      }>('crm.lead.convert', convertData);

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const dealId = response.result?.DEAL_ID;
      const contactId = response.result?.CONTACT_ID;

      if (!dealId) {
        throw new Error('No deal ID returned from lead conversion');
      }

      console.log('✅ Lead converted to deal successfully:', { leadId, dealId, contactId });

      return {
        dealId,
        contactId,
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to convert lead to deal:', error);
      return {
        dealId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find lead by email address
   */
  async findByEmail(email: string): Promise<LeadSearchResult | null> {
    try {
      console.log('🔍 Searching lead by email:', email);

      const response = await this.client.get('crm.lead.list', {
        filter: {
          'EMAIL': email,
        },
        select: ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE', 'SOURCE_ID', 'STATUS_ID'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const leads = response.result || [];
      if (leads.length === 0) {
        console.log('🎯 No lead found with email:', email);
        return null;
      }

      const lead = leads[0];
      const result: LeadSearchResult = {
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        email: lead.EMAIL?.[0]?.VALUE,
        phone: lead.PHONE?.[0]?.VALUE,
        company: lead.COMPANY_TITLE,
        sourceId: lead.SOURCE_ID,
        statusId: lead.STATUS_ID,
      };

      console.log('✅ Lead found by email:', { id: result.id, title: result.title });

      return result;

    } catch (error) {
      console.error('❌ Failed to find lead by email:', error);
      return null;
    }
  }

  /**
   * Find lead by phone number
   */
  async findByPhone(phone: string): Promise<LeadSearchResult | null> {
    try {
      console.log('🔍 Searching lead by phone:', phone);

      const response = await this.client.get('crm.lead.list', {
        filter: {
          'PHONE': phone,
        },
        select: ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE', 'SOURCE_ID', 'STATUS_ID'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const leads = response.result || [];
      if (leads.length === 0) {
        console.log('🎯 No lead found with phone:', phone);
        return null;
      }

      const lead = leads[0];
      const result: LeadSearchResult = {
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        email: lead.EMAIL?.[0]?.VALUE,
        phone: lead.PHONE?.[0]?.VALUE,
        company: lead.COMPANY_TITLE,
        sourceId: lead.SOURCE_ID,
        statusId: lead.STATUS_ID,
      };

      console.log('✅ Lead found by phone:', { id: result.id, title: result.title });

      return result;

    } catch (error) {
      console.error('❌ Failed to find lead by phone:', error);
      return null;
    }
  }

  /**
   * Find lead by email or phone (create if not found)
   */
  async findOrCreateLead(
    leadData: Bitrix24Lead,
    options: CreateLeadOptions = {}
  ): Promise<{ id: string; created: boolean; error?: string }> {
    try {
      // First, try to find by email
      if (leadData.EMAIL?.[0]?.VALUE) {
        const existingLead = await this.findByEmail(leadData.EMAIL[0].VALUE);
        if (existingLead) {
          console.log('🎯 Found existing lead by email:', { id: existingLead.id, title: existingLead.title });
          return {
            id: existingLead.id,
            created: false,
          };
        }
      }

      // Then, try to find by phone
      if (leadData.PHONE?.[0]?.VALUE) {
        const existingLead = await this.findByPhone(leadData.PHONE[0].VALUE);
        if (existingLead) {
          console.log('🎯 Found existing lead by phone:', { id: existingLead.id, title: existingLead.title });
          return {
            id: existingLead.id,
            created: false,
          };
        }
      }

      // If not found, create new lead
      console.log('🎯 Creating new lead (not found by email/phone)');
      const createResult = await this.createLead(leadData, options);
      
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
      console.error('❌ Failed to find or create lead:', error);
      return {
        id: '',
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get lead by ID
   */
  async getLead(leadId: string): Promise<LeadSearchResult | null> {
    try {
      console.log('🔍 Getting lead by ID:', leadId);

      const response = await this.client.get('crm.lead.get', {
        id: leadId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const lead = response.result;
      if (!lead) {
        console.log('🎯 Lead not found:', leadId);
        return null;
      }

      const result: LeadSearchResult = {
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        email: lead.EMAIL?.[0]?.VALUE,
        phone: lead.PHONE?.[0]?.VALUE,
        company: lead.COMPANY_TITLE,
        sourceId: lead.SOURCE_ID,
        statusId: lead.STATUS_ID,
      };

      console.log('✅ Lead retrieved:', { id: result.id, title: result.title });

      return result;

    } catch (error) {
      console.error('❌ Failed to get lead:', error);
      return null;
    }
  }

  /**
   * Search leads by name
   */
  async searchByName(name: string): Promise<LeadSearchResult[]> {
    try {
      console.log('🔍 Searching leads by name:', name);

      const response = await this.client.get('crm.lead.list', {
        filter: {
          '%NAME': name,
        },
        select: ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE', 'SOURCE_ID', 'STATUS_ID'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const leads = response.result || [];
      const results: LeadSearchResult[] = leads.map((lead: any) => ({
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        email: lead.EMAIL?.[0]?.VALUE,
        phone: lead.PHONE?.[0]?.VALUE,
        company: lead.COMPANY_TITLE,
        sourceId: lead.SOURCE_ID,
        statusId: lead.STATUS_ID,
      }));

      console.log('✅ Found leads by name:', { count: results.length, name });

      return results;

    } catch (error) {
      console.error('❌ Failed to search leads by name:', error);
      return [];
    }
  }

  /**
   * Get lead sources
   */
  async getLeadSources(): Promise<Array<{ id: string; name: string }>> {
    try {
      console.log('🔍 Getting lead sources');

      const response = await this.client.get('crm.status.list', {
        filter: {
          ENTITY_ID: 'SOURCE',
        },
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const sources = response.result || [];
      const results = sources.map((source: any) => ({
        id: source.STATUS_ID,
        name: source.NAME,
      }));

      console.log('✅ Retrieved lead sources:', { count: results.length });

      return results;

    } catch (error) {
      console.error('❌ Failed to get lead sources:', error);
      return [];
    }
  }

  /**
   * Get lead statuses
   */
  async getLeadStatuses(): Promise<Array<{ id: string; name: string }>> {
    try {
      console.log('🔍 Getting lead statuses');

      const response = await this.client.get('crm.status.list', {
        filter: {
          ENTITY_ID: 'STATUS',
        },
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const statuses = response.result || [];
      const results = statuses.map((status: any) => ({
        id: status.STATUS_ID,
        name: status.NAME,
      }));

      console.log('✅ Retrieved lead statuses:', { count: results.length });

      return results;

    } catch (error) {
      console.error('❌ Failed to get lead statuses:', error);
      return [];
    }
  }

  /**
   * Delete lead by ID
   */
  async deleteLead(leadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting lead:', leadId);

      const response = await this.client.post('crm.lead.delete', {
        id: leadId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Lead deleted successfully:', leadId);

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to delete lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const leadService = new LeadService();
