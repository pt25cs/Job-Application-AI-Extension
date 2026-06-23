export type OutreachStatus =
  | 'drafted'
  | 'approved'
  | 'sending'
  | 'sent'
  | 'follow_up_scheduled'
  | 'follow_up_sent'
  | 'replied'
  | 'bounced';

export interface Outreach {
  id: string;
  user_id: string;
  contact_id: string | null;
  application_id: string | null;
  email_subject: string | null;
  email_body: string | null;
  email_html: string | null;
  status: OutreachStatus;
  sent_at: string | null;
  follow_up_at: string | null;
  follow_up_body: string | null;
  resend_message_id: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachDraftRequest {
  userId: string;
  applicationId: string;
  contactIds: string[];
}

export interface OutreachDraftResponse {
  drafted: Outreach[];
  count: number;
}
