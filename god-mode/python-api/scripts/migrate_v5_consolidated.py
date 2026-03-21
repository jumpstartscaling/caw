import asyncio
import json
import os
from app.db.connection import get_db, init_db, close_db

async def migrate_to_consolidated():
    # Initialize the database pool first
    await init_db()
    
    async with get_db() as conn:
        print("Starting migration to consolidated schema...")
        
        # 1. Ensure new tables exist
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS site_displays (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                domain TEXT UNIQUE NOT NULL,
                palette TEXT DEFAULT 'emerald',
                navigation JSONB DEFAULT '{}',
                footer JSONB DEFAULT '{}',
                scripts JSONB DEFAULT '[]',
                cdn_config JSONB DEFAULT '{}',
                local_seo JSONB DEFAULT '{}',
                site_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS site_contents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                site_id UUID REFERENCES site_displays(id) ON DELETE CASCADE,
                slug TEXT NOT NULL,
                content_type TEXT NOT NULL,
                title TEXT,
                meta_description TEXT,
                body_content TEXT,
                blocks_json JSONB DEFAULT '[]',
                attributes JSONB DEFAULT '{}',
                is_published BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(site_id, slug, content_type)
            );
        """)

        # 2. Migrate site displays
        sites = await conn.fetch("SELECT * FROM sites")
        for s in sites:
            tc = s.get('theme_config') or {}
            if isinstance(tc, str): tc = json.loads(tc)
            
            domain = s['url'] or s['name']
            if not domain: continue
            
            await conn.execute("""
                INSERT INTO site_displays (id, domain, palette, navigation, footer, scripts, cdn_config, local_seo, site_name, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (domain) DO UPDATE SET 
                    palette = EXCLUDED.palette, 
                    navigation = EXCLUDED.navigation, 
                    footer = EXCLUDED.footer, 
                    scripts = EXCLUDED.scripts, 
                    cdn_config = EXCLUDED.cdn_config, 
                    local_seo = EXCLUDED.local_seo, 
                    site_name = EXCLUDED.site_name
            """,
            s['id'], domain, 
            tc.get('palette', 'emerald'),
            json.dumps(tc.get('nav', {})),
            json.dumps(tc.get('footer', {})),
            json.dumps(tc.get('scripts', [])),
            json.dumps(tc.get('cdn_config', {})),
            json.dumps(tc.get('local_seo', {})),
            tc.get('site_name', s['name']),
            s['date_created']
            )
        print(f"Migrated {len(sites)} sites to site_displays.")

        # 3. Migrate pages + blocks into site_contents
        pages = await conn.fetch("SELECT * FROM pages")
        for p in pages:
            # Fetch blocks for this page
            blocks = await conn.fetch("SELECT * FROM page_blocks WHERE page_id = $1 ORDER BY sort_order", p['id'])
            blocks_data = [dict(b) for b in blocks]
            # Convert UUIDs to strings in blocks_data
            for b in blocks_data:
                for k, v in b.items():
                    if isinstance(v, (type(p['id']),)):
                        b[k] = str(v)
            
            await conn.execute("""
                INSERT INTO site_contents (id, site_id, slug, content_type, title, blocks_json, is_published, created_at)
                VALUES ($1, $2, $3, 'page', $4, $5, $6, $7)
                ON CONFLICT (site_id, slug, content_type) DO UPDATE SET 
                    title = EXCLUDED.title, 
                    blocks_json = EXCLUDED.blocks_json, 
                    is_published = EXCLUDED.is_published
            """,
            p['id'], p['site_id'], p['slug'] or '', p['title'], json.dumps(blocks_data), p['status'] == 'published', p['created_at']
            )
        print(f"Migrated {len(pages)} pages to site_contents.")

        # 4. Migrate blog posts
        posts = await conn.fetch("SELECT * FROM posts")
        for post in posts:
            await conn.execute("""
                INSERT INTO site_contents (id, site_id, slug, content_type, title, body_content, is_published, created_at)
                VALUES ($1, $2, $3, 'post', $4, $5, $6, $7)
                ON CONFLICT (site_id, slug, content_type) DO UPDATE SET 
                    title = EXCLUDED.title, 
                    body_content = EXCLUDED.body_content,
                    is_published = EXCLUDED.is_published
            """,
            post['id'], post['site_id'], post['slug'], post['title'], post['content'], post['status'] == 'published', post['created_at']
            )
        print(f"Migrated {len(posts)} posts to site_contents.")

        # 5. Migrate pSEO rows (content_matrix)
        pseo_rows = await conn.fetch("""
            SELECT cm.*, cm_master.site_id 
            FROM content_matrix cm
            JOIN pseo_services s ON cm.service_id = s.id
            CROSS JOIN (SELECT site_id FROM sites LIMIT 1) cm_master
        """)
        for row in pseo_rows:
            await conn.execute("""
                INSERT INTO site_contents (site_id, slug, content_type, title, meta_description, attributes, created_at)
                VALUES ($1, $2, 'pseo_row', $3, $4, $5, $6)
                ON CONFLICT (site_id, slug, content_type) DO NOTHING
            """,
            row['site_id'], row['slug'], row['title'], row['meta_description'], row['content_json'], row['created_at']
            )
        print(f"Migrated {len(pseo_rows)} pSEO rows to site_contents.")

        print("Migration complete!")
    
    await close_db()

if __name__ == "__main__":
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "postgresql://caw:caw_local@127.0.0.1:5433/chrisamaya"
    asyncio.run(migrate_to_consolidated())
