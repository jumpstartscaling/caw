"""CRUD routes for locations (Harris matrix). No auth."""
import re
from fastapi import APIRouter, HTTPException
from app.db.connection import get_db
from app.schemas.matrix import LocationCreate, LocationUpdate, LocationRead

router = APIRouter(prefix="/api", tags=["locations"])


def _slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


@router.get("/locations", response_model=list[LocationRead])
async def list_locations(skip: int = 0, limit: int = 100):
    async with get_db() as conn:
        rows = await conn.fetch(
            "SELECT id, city, state, zip, neighborhood, slug FROM locations ORDER BY city, state OFFSET $1 LIMIT $2",
            skip, limit,
        )
        return [LocationRead(**dict(r)) for r in rows]


@router.post("/locations", response_model=LocationRead)
async def create_location(body: LocationCreate):
    slug = body.slug or _slugify(f"{body.city}-{body.state}-{body.zip or ''}-{body.neighborhood or ''}".strip("-"))
    if not slug:
        slug = _slugify(f"{body.city}-{body.state}")
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO locations (city, state, zip, neighborhood, slug)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (slug) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state
            RETURNING id, city, state, zip, neighborhood, slug
            """,
            body.city, body.state, body.zip, body.neighborhood, slug,
        )
        return LocationRead(**dict(row))


@router.get("/locations/{loc_id}", response_model=LocationRead)
async def get_location(loc_id: int):
    async with get_db() as conn:
        row = await conn.fetchrow("SELECT id, city, state, zip, neighborhood, slug FROM locations WHERE id = $1", loc_id)
        if not row:
            raise HTTPException(404, "Location not found")
        return LocationRead(**dict(row))


@router.patch("/locations/{loc_id}", response_model=LocationRead)
async def update_location(loc_id: int, body: LocationUpdate):
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        async with get_db() as conn:
            row = await conn.fetchrow("SELECT id, city, state, zip, neighborhood, slug FROM locations WHERE id = $1", loc_id)
            if not row:
                raise HTTPException(404, "Location not found")
            return LocationRead(**dict(row))
    set_clause = ", ".join(f"{k} = ${i}" for i, k in enumerate(updates.keys(), 2))
    values = list(updates.values()) + [loc_id]
    async with get_db() as conn:
        await conn.execute(
            f"UPDATE locations SET {set_clause} WHERE id = ${len(values)}",
            *values,
        )
        row = await conn.fetchrow("SELECT id, city, state, zip, neighborhood, slug FROM locations WHERE id = $1", loc_id)
        return LocationRead(**dict(row))


@router.delete("/locations/{loc_id}", status_code=204)
async def delete_location(loc_id: int):
    async with get_db() as conn:
        r = await conn.execute("DELETE FROM locations WHERE id = $1", loc_id)
        if r == "DELETE 0":
            raise HTTPException(404, "Location not found")
