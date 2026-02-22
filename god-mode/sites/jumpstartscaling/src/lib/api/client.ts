/**
 * God Mode API client.
 * When PUBLIC_GOD_MODE_API_URL is set, posts directly to godmode API.
 * Use for jumpstartscaling.com (separate Coolify app with no router).
 * When not set, uses same-origin /api (factory router proxies to FastAPI).
 */

import type {
  LeadPayload,
  LeadResponse,
  ScalingSurveyPayload,
  ScalingSurveyResponse,
  HealthResponse,
} from "./types";

const getBaseUrl = (): string => {
  const apiUrl =
    typeof import.meta !== "undefined" &&
    (import.meta as any).env?.PUBLIC_GOD_MODE_API_URL;
  if (apiUrl) return String(apiUrl).replace(/\/$/, "");
  if (typeof window !== "undefined") return "";
  return "";
};

export async function submitLead(payload: LeadPayload): Promise<LeadResponse> {
  const res = await fetch(`${getBaseUrl()}/api/submit-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      submittedAt: payload.submittedAt ?? new Date().toISOString(),
      userAgent:
        payload.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
      page_url:
        payload.page_url ??
        (typeof window !== "undefined" ? window.location.href : undefined),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Submit failed: ${res.status}`);
  }
  return res.json();
}

export async function submitScalingSurvey(
  payload: ScalingSurveyPayload
): Promise<ScalingSurveyResponse> {
  const res = await fetch(`${getBaseUrl()}/api/submit-scaling-survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Submit failed: ${res.status}`);
  }
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${getBaseUrl()}/`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}
