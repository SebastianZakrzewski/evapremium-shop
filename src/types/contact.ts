export interface ContactInfo {
  id: string;
  name: string;
  phone: string;
  message?: string;
  timestamp: Date;
  source: 'chatbot';
}

export interface ContactFormData {
  name: string;
  phone: string;
  message?: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  contactId?: string;
  error?: string;
}
