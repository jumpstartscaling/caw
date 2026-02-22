// Harris matrix (pSEO) types - aligned with PostgreSQL schema

export interface Location {
  id: number;
  city: string;
  state: string;
  zip?: string | null;
  neighborhood?: string | null;
  slug?: string | null;
  created_at?: string;
}

export interface PseoService {
  id: number;
  service_type: string;
  sub_niche?: string | null;
  slug?: string | null;
  created_at?: string;
}

export interface ContentMatrix {
  id: number;
  location_id?: number | null;
  service_id?: number | null;
  slug: string;
  title?: string | null;
  meta_description?: string | null;
  content_json?: Record<string, unknown> | null;
  created_at?: string;
}

export interface MatrixPermutation {
  slug: string;
  title?: string | null;
  meta_description?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  service_type?: string | null;
}
