/**
 * God Mode API - Shared TypeScript types.
 * Kept in sync with python-api/app/models.py and DB schema.
 */

// --- Lead (contact form, audit survey, n8n form) ---
export interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  website?: string;
  company?: string;
  role?: string;
  revenue?: string;
  budget?: string;
  problem?: string;
  industry?: string;
  team?: string;
  bottleneck?: string;
  formType?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  page_url?: string;
  submittedAt?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface LeadResponse {
  success: boolean;
  message: string;
  lead_id?: number;
}

// --- Scaling Survey (Moat Audit) ---
export interface ScalingSurveyPayload {
  name: string;
  email: string;
  company?: string;
  role?: string;
  currentRevenue?: string;
  targetRevenue?: string;
  teamSize?: string;
  industry?: string;
  challenges?: string[];
  marketingSpend?: string;
  channels?: string[];
  biggestGoal?: string;
  [key: string]: unknown;
}

export interface ScalingSurveyResponse {
  success: boolean;
  message: string;
}

// --- Health ---
export interface HealthResponse {
  status: string;
  service: string;
}
