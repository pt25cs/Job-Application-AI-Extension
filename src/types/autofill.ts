import type { ATSPlatform } from './platform';

export type FieldCategory =
  | 'first_name' | 'last_name' | 'full_name' | 'email' | 'phone'
  | 'phone_country_code' | 'phone_extension'
  | 'location' | 'address_line1' | 'address_line2' | 'city' | 'state' | 'country' | 'zip'
  | 'linkedin_url' | 'github_url' | 'portfolio_url' | 'website'
  | 'current_company' | 'current_title' | 'years_of_experience'
  | 'university' | 'degree' | 'graduation_year' | 'field_of_study'
  | 'cover_letter' | 'salary_expectation' | 'start_date'
  | 'work_authorization' | 'gender' | 'ethnicity' | 'veteran_status'
  | 'disability_status' | 'pronouns' | 'resume_file'
  | 'previous_employer' | 'unknown';

export type FieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'select'
  | 'radio' | 'checkbox' | 'file' | 'textarea' | 'number';

export interface FormField {
  element: HTMLElement;
  type: FieldType;
  category: FieldCategory;
  label: string | null;
  name: string | null;
  confidence: number;
}

export interface FieldMapping {
  field: FormField;
  value: string | File | null;
  status: 'filled' | 'skipped' | 'error';
  reason?: string;
  confidence: number;
  /** The format variant that was ultimately accepted (may differ from raw profile value). */
  acceptedFormat?: string;
  /** All format variants that were tried before one was accepted. */
  attemptedFormats?: string[];
}

export interface AutoFillAdapter {
  platform: ATSPlatform;
  discoverFields(doc: Document): FormField[];
  getNextPageButton(doc: Document): HTMLElement | null;
}
