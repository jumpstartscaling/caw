"""Lead capture and scaling survey routes."""
import json
from fastapi import APIRouter, Request
from app.models import LeadResponse, ScalingSurveyResponse
from app.db.connection import get_db

router = APIRouter(prefix="/api", tags=["leads"])


@router.get("/leads")
async def list_leads(limit: int = 500, offset: int = 0):
    """List leads (for admin UI). No auth."""
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            min(limit, 500),
            max(0, offset),
        )
    return {"success": True, "leads": [dict(r) for r in rows]}


def _infer_source(host: str, data: dict) -> str:
    if data.get("source"):
        return data["source"]
    return "portfolio" if "chris" in host.lower() else "jumpstart"


async def _parse_body(request: Request) -> dict:
    ct = request.headers.get("content-type", "")
    if "application/json" in ct:
        try:
            return await request.json()
        except Exception:
            return {}
    if "application/x-www-form-urlencoded" in ct:
        from urllib.parse import parse_qs
        body = await request.body()
        return {k: v[0] if len(v) == 1 else v for k, v in parse_qs(body.decode()).items()}
    return {}


@router.post("/submit-lead", response_model=LeadResponse)
async def submit_lead(request: Request):
    """Capture lead from contact form, audit survey, n8n form, etc."""
    data = await _parse_body(request)

    host = request.headers.get("host", "")
    source = _infer_source(host, data)
    form_type = data.get("formType") or data.get("form_type") or "unknown"

    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO leads (source, name, email, phone, website, revenue, budget, problem, form_type, data_json)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
            """,
            source,
            data.get("name", ""),
            data.get("email", ""),
            data.get("phone"),
            data.get("website"),
            data.get("revenue"),
            data.get("budget"),
            data.get("problem") or data.get("bottleneck"),
            form_type,
            json.dumps(data) if data else "{}",
        )
        return LeadResponse(lead_id=row["id"])


@router.post("/submit-scaling-survey", response_model=ScalingSurveyResponse)
async def submit_scaling_survey(request: Request):
    """Capture Moat Audit scaling survey."""
    data = await _parse_body(request)

    async with get_db() as conn:
        await conn.execute(
            """
            INSERT INTO scaling_survey_submissions
            (name, email, company, role, current_revenue, target_revenue, team_size, industry,
             challenges, marketing_spend, channels, biggest_goal, raw_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            """,
            data.get("name"),
            data.get("email"),
            data.get("company"),
            data.get("role"),
            data.get("currentRevenue"),
            data.get("targetRevenue"),
            data.get("teamSize"),
            data.get("industry"),
            json.dumps(data.get("challenges") or []),
            data.get("marketingSpend"),
            json.dumps(data.get("channels") or []),
            data.get("biggestGoal"),
            json.dumps(data) if data else "{}",
        )
        return ScalingSurveyResponse()


@router.get("/scaling-surveys")
async def list_scaling_surveys(limit: int = 500, offset: int = 0):
    """List scaling survey submissions (for admin UI). No auth."""
    async with get_db() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM scaling_survey_submissions
            ORDER BY created_at DESC LIMIT $1 OFFSET $2
            """,
            min(limit, 500),
            max(0, offset),
        )
    return {"success": True, "surveys": [dict(r) for r in rows]}
