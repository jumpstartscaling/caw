"""Pydantic models for request/response validation."""
from typing import Any, Optional
from pydantic import BaseModel


# --- Lead (generic contact / audit survey / n8n) ---
class LeadCreate(BaseModel):
    """Payload for submit-lead. All fields optional except validation passes."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    website: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    revenue: Optional[str] = None
    budget: Optional[str] = None
    problem: Optional[str] = None
    # Survey fields
    industry: Optional[str] = None
    team: Optional[str] = None
    bottleneck: Optional[str] = None
    # Metadata
    formType: Optional[str] = None
    source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    page_url: Optional[str] = None
    submittedAt: Optional[str] = None
    userAgent: Optional[str] = None
    # Allow extra fields for full JSON capture
    model_config = {"extra": "allow"}


class LeadResponse(BaseModel):
    success: bool = True
    message: str = "Lead captured"
    lead_id: Optional[int] = None


# --- Scaling Survey (Moat Audit) ---
class ScalingSurveyCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    role: Optional[str] = None
    currentRevenue: Optional[str] = None
    targetRevenue: Optional[str] = None
    teamSize: Optional[str] = None
    industry: Optional[str] = None
    challenges: Optional[list[str]] = None
    marketingSpend: Optional[str] = None
    channels: Optional[list[str]] = None
    biggestGoal: Optional[str] = None
    model_config = {"extra": "allow"}


class ScalingSurveyResponse(BaseModel):
    success: bool = True
    message: str = "Survey submitted successfully"


# --- Health ---
class HealthResponse(BaseModel):
    status: str = "active"
    service: str = "God Mode API"
