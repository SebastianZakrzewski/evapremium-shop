/**
 * Form to Bitrix24 Lead Mapper
 * 
 * Maps contact form data to Bitrix24 Lead format
 */

import { Bitrix24Lead } from '@/lib/types/bitrix';

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  subject?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Additional form fields
  [key: string]: any;
}

export interface FormToLeadMappingOptions {
  sourceId?: string;
  statusId?: string;
  title?: string;
}

/**
 * Map contact form data to Bitrix24 Lead
 */
export function mapFormToLead(
  formData: ContactFormData,
  options: FormToLeadMappingOptions = {}
): Bitrix24Lead {
  // Extract name parts
  const fullName = formData.name || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Build lead data
  const lead: Bitrix24Lead = {
    TITLE: options.title || createLeadTitle(formData),
    NAME: firstName || 'Potencjalny klient',
    LAST_NAME: lastName,
    EMAIL: formData.email ? [{
      VALUE: formData.email,
      VALUE_TYPE: 'WORK'
    }] : undefined,
    PHONE: formData.phone ? [{
      VALUE: formData.phone,
      VALUE_TYPE: 'WORK'
    }] : undefined,
    COMPANY_TITLE: formData.company,
    COMMENTS: buildLeadComments(formData),
    SOURCE_ID: options.sourceId || formData.source || 'WEB',
    STATUS_ID: options.statusId || 'NEW',
    UTM_SOURCE: formData.utmSource,
    UTM_MEDIUM: formData.utmMedium,
    UTM_CAMPAIGN: formData.utmCampaign,
  };

  // Remove undefined values
  return removeUndefinedValues(lead);
}

/**
 * Create lead title from form data
 */
function createLeadTitle(formData: ContactFormData): string {
  const name = formData.name || 'Potencjalny klient';
  const company = formData.company;
  const subject = formData.subject;

  if (company) {
    return `${name} (${company})`;
  }

  if (subject) {
    return `${name} - ${subject}`;
  }

  return name;
}

/**
 * Build lead comments from form data
 */
function buildLeadComments(formData: ContactFormData): string {
  const comments: string[] = [];
  
  comments.push(`Źródło: ${formData.source || 'EVA Website'}`);
  comments.push(`Data: ${new Date().toISOString().split('T')[0]}`);
  
  if (formData.subject) {
    comments.push(`Temat: ${formData.subject}`);
  }
  
  if (formData.message) {
    comments.push(`\nWiadomość:`);
    comments.push(formData.message);
  }

  // Add UTM parameters if available
  const utmParams = [];
  if (formData.utmSource) utmParams.push(`Źródło: ${formData.utmSource}`);
  if (formData.utmMedium) utmParams.push(`Medium: ${formData.utmMedium}`);
  if (formData.utmCampaign) utmParams.push(`Kampania: ${formData.utmCampaign}`);
  
  if (utmParams.length > 0) {
    comments.push(`\nParametry UTM:`);
    comments.push(utmParams.join(', '));
  }

  // Add additional form fields
  const additionalFields = extractAdditionalFields(formData);
  if (additionalFields.length > 0) {
    comments.push(`\nDodatkowe informacje:`);
    comments.push(additionalFields.join('\n'));
  }

  return comments.join('\n');
}

/**
 * Extract additional form fields (excluding standard fields)
 */
function extractAdditionalFields(formData: ContactFormData): string[] {
  const standardFields = [
    'name', 'email', 'phone', 'company', 'message', 'subject', 'source',
    'utmSource', 'utmMedium', 'utmCampaign'
  ];

  const additionalFields: string[] = [];

  for (const [key, value] of Object.entries(formData)) {
    if (!standardFields.includes(key) && value !== undefined && value !== '') {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      additionalFields.push(`${fieldName}: ${value}`);
    }
  }

  return additionalFields;
}

/**
 * Remove undefined values from object
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Map newsletter signup to lead
 */
export function mapNewsletterSignupToLead(
  email: string,
  additionalData: Record<string, any> = {}
): Bitrix24Lead {
  return mapFormToLead({
    name: 'Newsletter Subscriber',
    email,
    subject: 'Zapis do newslettera',
    source: 'NEWSLETTER',
    ...additionalData
  }, {
    title: `Newsletter - ${email}`,
    sourceId: 'NEWSLETTER',
    statusId: 'NEW'
  });
}

/**
 * Map contact form submission to lead
 */
export function mapContactFormToLead(
  formData: ContactFormData
): Bitrix24Lead {
  return mapFormToLead(formData, {
    title: `Kontakt - ${formData.name || 'Anonimowy'}`,
    sourceId: 'CONTACT_FORM',
    statusId: 'NEW'
  });
}

/**
 * Map quote request to lead
 */
export function mapQuoteRequestToLead(
  formData: ContactFormData
): Bitrix24Lead {
  return mapFormToLead(formData, {
    title: `Zapytanie o wycenę - ${formData.name || 'Anonimowy'}`,
    sourceId: 'QUOTE_REQUEST',
    statusId: 'NEW'
  });
}

/**
 * Map callback request to lead
 */
export function mapCallbackRequestToLead(
  formData: ContactFormData
): Bitrix24Lead {
  return mapFormToLead(formData, {
    title: `Prośba o kontakt - ${formData.name || 'Anonimowy'}`,
    sourceId: 'CALLBACK_REQUEST',
    statusId: 'NEW'
  });
}
