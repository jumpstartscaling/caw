"""CRUD and matrix permutation routes for content_matrix. No auth."""
import json
import html
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse
from app.db.connection import get_db
from app.schemas.matrix import (
    ContentMatrixCreate,
    ContentMatrixUpdate,
    ContentMatrixRead,
    MatrixPermutation,
)

router = APIRouter(prefix="/api", tags=["content_matrix"])


@router.get("/matrix/permutations", response_model=list[MatrixPermutation])
async def get_permutations():
    """Return all content_matrix rows with location/service denormalized for pSEO pages."""
    async with get_db() as conn:
        rows = await conn.fetch(
            """
            SELECT cm.slug, cm.title, cm.meta_description, l.city AS location_city, l.state AS location_state, ps.service_type
            FROM content_matrix cm
            LEFT JOIN locations l ON cm.location_id = l.id
            LEFT JOIN pseo_services ps ON cm.service_id = ps.id
            ORDER BY cm.slug
            """
        )
        return [
            MatrixPermutation(
                slug=r["slug"],
                title=r["title"],
                meta_description=r["meta_description"],
                location_city=r["location_city"],
                location_state=r["location_state"],
                service_type=r["service_type"],
            )
            for r in rows
        ]


@router.get("/matrix/by-slug/{slug}", response_model=ContentMatrixRead)
async def get_by_slug(slug: str):
    """Fetch a single content_matrix row by slug (for pSEO page render)."""
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id, location_id, service_id, slug, title, meta_description, content_json FROM content_matrix WHERE slug = $1",
            slug,
        )
        if not row:
            raise HTTPException(404, "Content not found")
        return ContentMatrixRead(**dict(row))


@router.get("/preview/{slug}", response_class=HTMLResponse)
async def preview_content(slug: str):
    """Return minimal HTML preview — headless, page-speed optimized. Shows tenants how content looks on a fast site."""
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT slug, title, meta_description, content_json FROM content_matrix WHERE slug = $1",
            slug,
        )
        if not row:
            raise HTTPException(404, "Content not found")

    title = row["title"] or slug
    meta_desc = row["meta_description"] or ""
    content_json = row["content_json"] or {}
    html_content = (content_json.get("html") if isinstance(content_json, dict) else None) or "<p>Content coming soon.</p>"
    escaped_title = html.escape(title)
    escaped_desc = html.escape(meta_desc)

    # Minimal HTML — no external deps, inline critical CSS, perfect for PageSpeed
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escaped_title}</title>
<meta name="description" content="{escaped_desc}">
<style>
*{{box-sizing:border-box}}body{{margin:0;font-family:system-ui,sans-serif;font-size:1.125rem;line-height:1.7;color:#111;background:#fff;padding:2rem 1.5rem}}
main{{max-width:720px;margin:0 auto}}
h1{{font-size:2rem;font-weight:700;margin:0 0 1.5rem;line-height:1.2}}
article{{color:#333}}
article p{{margin:0 0 1rem}}
article h2{{font-size:1.5rem;margin:2rem 0 0.75rem}}
article h3{{font-size:1.25rem;margin:1.5rem 0 0.5rem}}
article ul,article ol{{margin:0 0 1rem;padding-left:1.5rem}}
.badge{{display:inline-block;font-size:.75rem;background:#f0f0f0;padding:.25rem .5rem;border-radius:4px;margin-bottom:1rem;color:#666}}
</style>
</head>
<body>
<main>
<span class="badge">Preview — Headless pSEO</span>
<h1>{escaped_title}</h1>
<article>{html_content}</article>
</main>
</body>
</html>"""


@router.get("/content-matrix", response_model=list[ContentMatrixRead])
async def list_content_matrix(skip: int = 0, limit: int = Query(default=100, le=5000)):
    async with get_db() as conn:
        rows = await conn.fetch(
            """
            SELECT id, location_id, service_id, slug, title, meta_description, content_json
            FROM content_matrix ORDER BY slug OFFSET $1 LIMIT $2
            """,
            skip, limit,
        )
        return [ContentMatrixRead(**dict(r)) for r in rows]


@router.post("/content-matrix", response_model=ContentMatrixRead)
async def create_content(body: ContentMatrixCreate):
    content_json = json.dumps(body.content_json) if body.content_json else None
    async with get_db() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO content_matrix (location_id, service_id, slug, title, meta_description, content_json)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb)
            ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, meta_description = EXCLUDED.meta_description, content_json = EXCLUDED.content_json
            RETURNING id, location_id, service_id, slug, title, meta_description, content_json
            """,
            body.location_id, body.service_id, body.slug, body.title, body.meta_description, content_json,
        )
        return ContentMatrixRead(**dict(row))


@router.get("/content-matrix/{cm_id}", response_model=ContentMatrixRead)
async def get_content(cm_id: int):
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT id, location_id, service_id, slug, title, meta_description, content_json FROM content_matrix WHERE id = $1",
            cm_id,
        )
        if not row:
            raise HTTPException(404, "Content not found")
        return ContentMatrixRead(**dict(row))


@router.patch("/content-matrix/{cm_id}", response_model=ContentMatrixRead)
async def update_content(cm_id: int, body: ContentMatrixUpdate):
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        async with get_db() as conn:
            row = await conn.fetchrow(
                "SELECT id, location_id, service_id, slug, title, meta_description, content_json FROM content_matrix WHERE id = $1",
                cm_id,
            )
            if not row:
                raise HTTPException(404, "Content not found")
            return ContentMatrixRead(**dict(row))
    if "content_json" in updates and updates["content_json"] is not None:
        updates["content_json"] = json.dumps(updates["content_json"])
    cols = list(updates.keys())
    def _col(c: str, i: int) -> str:
        return f"{c} = ${i+2}::jsonb" if c == "content_json" else f"{c} = ${i+2}"
    set_clause = ", ".join(_col(c, i) for i, c in enumerate(cols))
    values = [updates[c] for c in cols] + [cm_id]
    async with get_db() as conn:
        await conn.execute(
            f"UPDATE content_matrix SET {set_clause} WHERE id = ${len(values)}",
            *values,
        )
        row = await conn.fetchrow(
            "SELECT id, location_id, service_id, slug, title, meta_description, content_json FROM content_matrix WHERE id = $1",
            cm_id,
        )
        return ContentMatrixRead(**dict(row))


@router.delete("/content-matrix/{cm_id}", status_code=204)
async def delete_content(cm_id: int):
    async with get_db() as conn:
        r = await conn.execute("DELETE FROM content_matrix WHERE id = $1", cm_id)
        if r == "DELETE 0":
            raise HTTPException(404, "Content not found")
