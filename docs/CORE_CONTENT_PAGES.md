# Core Content Pages

The active site is a Fastify + EJS application backed by PostgreSQL. Core pages are records in `caw_content`; they are not separate route files and do not require an Astro build.

## Recommended core routes

Use long-form, content-first records for:

- `/about`
- `/architect`
- `/audit`
- `/contact`
- `/search`
- `/services`
- `/resources/calculators`
- `/tools`
- `/intel`
- `/local-intel`

Offer pages should stay under `/services/{offer-slug}`. State variants should stay under `/services/{offer-slug}/{state}`. City generation should remain disabled unless the publishing strategy is intentionally changed.

## Page record shape

Each row in `caw_content` should contain:

- `slug`: URL path without a leading slash
- `title`: page title used by the renderer
- `blocks`: ordered JSON array of `{ block_type, data }`
- `palette`: approved visual palette identifier
- `nav`: shared navigation JSON
- `footer`: shared footer JSON
- `local_seo`: optional structured location data

Example:

```json
{
  "slug": "about",
  "title": "About Chris Amaya",
  "palette": "emerald",
  "blocks": [
    {
      "block_type": "hero",
      "data": {
        "badge": "SYSTEM ARCHITECT",
        "headline": "I turn fragmented software into operating systems.",
        "subhead": "Architecture, recovery, automation, and governed AI systems.",
        "cta_label": "Review the process",
        "cta_href": "#process"
      }
    },
    {
      "block_type": "value_prop",
      "data": {
        "title": "What I actually do",
        "body": "<p>Long-form, useful page content goes here.</p>"
      }
    },
    {
      "block_type": "audit_form",
      "data": {
        "title": "Build the growth plan",
        "submit_source": "ChrisAmayaWork-About"
      }
    }
  ]
}
```

## Publishing workflow

1. Write the full page brief and final copy before inserting the record.
2. Reuse approved block types from `server/blocks.js`.
3. Insert or update the `caw_content` row through a controlled seed or CLI command.
4. Run `npm run check`.
5. Verify the page, canonical metadata, navigation links, form submission, mobile layout, and 404 behavior.
6. Publish navigation and sitemap changes only after the route passes review.

## Content rules

- Pages must be content-first and complete.
- No placeholders, art prompts, fake charts, empty funnel sections, or generic filler.
- Do not send primary CTAs to `/contact`; primary page CTAs should target the page's conversion section such as `#growth-plan`.
- Use full-width sections with square edges. Avoid glass cards, translucent panels, pill buttons, and decorative rounded containers.
- Forms must write to the site's controlled PostgreSQL/Spark lead path, not n8n or GoHighLevel.
- Unknown routes must not silently become production content.

## Structural improvement

The next refactor should introduce a typed page registry or validated page manifest that controls:

- slug and publication state
- title and metadata
- block schema validation
- navigation inclusion
- sitemap inclusion
- CTA source tracking
- geographic scope

That registry should be the source of truth for core pages and offers, while PostgreSQL remains the runtime content store.
