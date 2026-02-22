"""CRUD routes for pseo_services (Harris matrix). No auth."""
import re
from fastapi import APIRouter, HTTPException
from app.db.connection import get_db
from app.schemas.matrix import PseoServiceCreate, PseoServiceUpdate, PseoServiceRead

router = APIRouter(prefix="/api", tags=["pseo_services"])


def _slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


@router.get("/pseo-services", response_model=list[PseoServiceRead])
async def list_services(skip: int = 0, limit: int = 100):
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT id, service_type, sub_niche, slug FROM pseo_services ORDER BY service_type OFFSET $1 LIMIT $2",
            skip, limit,
        )
        return [PseoServiceRead(**dict(r)) for r in rows]


@router.post("/pseo-services", response_model=PseoServiceRead)
async def create_service(body: PseoServiceCreate):
    slug = body.slug or _slugify(body.service_type)
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO pseo_services (service_type, sub_niche, slug)
            VALUES ($1, $2, $3)
            ON CONFLICT (slug) DO UPDATE SET service_type = EXCLUDED.service_type
            RETURNING id, service_type, sub_niche, slug
            """,
            body.service_type, body.sub_niche, slug,
        )
        return PseoServiceRead(**dict(row))


@router.get("/pseo-services/{svc_id}", response_model=PseoServiceRead)
async def get_service(svc_id: int):
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id, service_type, sub_niche, slug FROM pseo_services WHERE id = $1", svc_id
        )
        if not row:
            raise HTTPException(404, "Service not found")
        return PseoServiceRead(**dict(row))


@router.patch("/pseo-services/{svc_id}", response_model=PseoServiceRead)
async def update_service(svc_id: int, body: PseoServiceUpdate):
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id, service_type, sub_niche, slug FROM pseo_services WHERE id = $1", svc_id
            )
            if not row:
                raise HTTPException(404, "Service not found")
            return PseoServiceRead(**dict(row))
    set_clause = ", ".join(f"{k} = ${i}" for i, k in enumerate(updates.keys(), 2))
    values = list(updates.values()) + [svc_id]
    async with get_db() as conn:
        await conn.execute(
            f"UPDATE pseo_services SET {set_clause} WHERE id = ${len(values)}",
            *values,
        )
        row = await conn.fetchrow(
            "SELECT id, service_type, sub_niche, slug FROM pseo_services WHERE id = $1", svc_id
        )
        return PseoServiceRead(**dict(row))


@router.delete("/pseo-services/{svc_id}", status_code=204)
async def delete_service(svc_id: int):
    async with get_db() as conn:
        r = await conn.execute("DELETE FROM pseo_services WHERE id = $1", svc_id)
        if r == "DELETE 0":
            raise HTTPException(404, "Service not found")
