export interface Contact {
  id: string;
  user_id: string;
  application_id: string | null;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  company: string | null;
  email: string | null;
  email_verified: boolean;
  email_confidence: number | null;
  linkedin_url: string | null;
  is_alumni: boolean;
  university: string | null;
  seniority: string | null;
  department: string | null;
  source: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ContactDiscoveryRequest {
  userId: string;
  applicationId: string;
  company: string;
  userUniversity?: string;
}

export interface ContactDiscoveryResponse {
  contacts: Contact[];
  totalFound: number;
  verifiedCount: number;
  alumniCount: number;
}
