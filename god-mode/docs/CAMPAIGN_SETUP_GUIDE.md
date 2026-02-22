# Spark Platform: Master Data & Campaign Manual

This manual provides comprehensive instructions for managing the "Brains" of your content factory. It covers data import formats, advanced Spintax usage, Geo-Intelligence configuration, and full Content Framework management.

---

## 📚 1. Content Intelligence Mastery

### A. Spintax & Variables Guide
Spintax (Spin Syntax) allows you to create dynamic variations of text. The engine processes this *before* it processes variables.

#### **Basic Syntax**
*   **Format:** `{Option A|Option B|Option C}`
*   **Example:** `{Best|Top Rated|Premier}` Solar Installer
*   **Output:** Randomly selects one option.

#### **Nested Spintax (Advanced)**
You can nest options inside others for exponential variations.
*   **Example:** `{Get {Started|Going}|Start Your Journey}` today.
*   **Logic:**
    *   50% Direct: "Start Your Journey today"
    *   50% Nested:
        *   25%: "Get Started today"
        *   25%: "Get Going today"

#### **System Variables**
These are placeholders that the Generator replaces automatically based on the context (Campaign settings, Location, or Current Time).

| Variable | Description | Example Output |
| :--- | :--- | :--- |
| `{City}` | Target City Name | "Austin" |
| `{State}` | Full State Name | "Texas" |
| `{State_Abbr}` | 2-Letter Code | "TX" |
| `{County}` | Target County | "Travis County" |
| `{Year}` | Current Year | "2025" |
| `{Month}` | Current Month | "December" |
| `{Niche}` | Campaign Niche (if set) | "Solar" |
| `{Avatar_Name}` | Targeted Avatar | "The Skeptic" |

#### **Example Usage in a Headline:**
`"{Top Rated|Best} {Niche} Services in {City}, {State_Abbr} - {Year} Update"`
*   *Output 1:* "Top Rated Solar Services in Austin, TX - 2025 Update"
*   *Output 2:* "Best Solar Services in Miami, FL - 2025 Update"

---

## 🛠 2. Data Import Templates (JSON)

Use the **Import / Export** feature in the Directus Admin sidebar for each collection. Ensure you import as **JSON**.

### A. Headline Inventory
*Collection:* `headline_inventory`
*Advanced Feature:* You can include variables in your headlines.

```json
[
  {
    "final_title_text": "The {Ultimate|Definitive} Guide to {Niche} in {City}",
    "status": "available",
    "notes": "Good for long-form SEO landers"
  },
  {
    "final_title_text": "How {City} Residents Are Saving Money in {Year}",
    "status": "available"
  }
]
```

### B. Content Fragments (With HTML & Lists)
*Collection:* `content_fragments`
*Power User Tip:* You can use full HTML, including bullet lists `<ul>`, bolding `<strong>`, and Spintax within the HTML.

```json
[
  {
    "fragment_type": "pillar_advantages",
    "content_body": "<h3>Why Choose Us In {City}?</h3><p>We provide:</p><ul><li><strong>Speed:</strong> {Fast|Quick} installation.</li><li><strong>Value:</strong> Best rates in {State}.</li><li><strong>Trust:</strong> 5-Star rated.</li></ul>",
    "word_count": 50
  },
  {
    "fragment_type": "intro_hook",
    "content_body": "<p>Are you tired of high energy bills in <strong>{City}</strong>? You aren't alone. {Thousands|Hundreds} of homeowners have made the switch.</p>"
  }
]
```

### C. Geo Intelligence (Counties, Landmarks & Metadata)
*Collection:* `geo_intelligence`
*Advanced Feature:* You can add arbitrary metadata like `landmarks`, `neighborhoods`, or `weather_zone` to the `data` blob. The engine (if configured) can read these.

**Example: Bulk Importing a County with City Landmarks**
```json
[
  {
    "cluster_key": "orange_county_ca_attractions",
    "data": {
      "cluster_name": "Orange County Metro",
      "region_type": "county_cluster",
      "cities": [
        {
          "city": "Anaheim",
          "state": "CA",
          "zip_focus": "92801",
          "landmarks": ["Disneyland", "Angel Stadium", "Honda Center"],
          "population": "346,000"
        },
        {
          "city": "Irvine",
          "state": "CA",
          "zip_focus": "92602",
          "landmarks": ["UC Irvine", "Spectrum Center", "Great Park"],
          "population": "307,000"
        }
      ]
    }
  }
]
```
*Note: This allows you to write Spintax like "Located near {Landmark}" if your engine logic supports picking a random landmark from the current city data.*

### D. Complete Frameworks (Article Templates)
*Collection:* `article_templates`
*Concept:* A "Framework" is a blueprint that tells the engine which Fragments to assemble and in what order.

**Example: "The Authority Framework"**
```json
[
  {
    "name": "Authority SEO Framework",
    "structure_json": [
        "intro_hook",
        "image_hero",
        "pillar_1_keyword",
        "ad_block_mid",
        "pillar_2_uniqueness",
        "pillar_3_relevance",
        "faq_section",
        "cta_footer"
    ],
    "description": "Standard high-ranking structure for local service pages."
  },
  {
    "name": "Quick Lead Magnet Framework",
    "structure_json": [
        "intro_hook_aggressive",
        "form_embed_top",
        "social_proof_slider",
        "pillar_benefits_bullets",
        "cta_sticky_bottom"
    ],
    "description": "Short form page designed for PPC traffic."
  }
]
```
*To use this, you would ensure you have `content_fragments` matching these types (e.g., `intro_hook`, `pillar_1_keyword`) available in the library.*

---

## ⚙️ 3. Managing Your Data (CRUD)

### How to Import
1.  Navigate to the Collection in Directus (e.g., "Geo Intelligence").
2.  Look for the **Import / Export** option in the right sidebar (often a box arrow icon).
3.  Select **Import**.
4.  Upload your `.json` file.
5.  Click **Start Import**. The system will notify you of success or errors.

### How to Edit
1.  Click on any row in the Collection list.
2.  Edit the fields directly in the form (e.g., fix a typo in `final_title_text`).
3.  Click the **Checkmark** (Save) in the top right.

### How to Delete
1.  **Single:** Click the item, then click the **Trash Can** (Delete) icon in the toolbar.
2.  **Bulk:** Select multiple checkboxes on the left side of the list view. A red "Delete" button will appear in the header. Click specific items or "Select All" to wipe a test batch.

### How to Export (Backup)
1.  Using the same **Import / Export** menu, select **Export**.
2.  Choose **JSON**.
3.  Dowload the file. Use this to backup your "Frameworks" or "Geo Clusters" before making bulk changes.

---

## 🚀 4. Workflow: Importing a Complete Campaign Strategy

If you want to move a strategy from one environment (e.g., Test) to another (e.g., Prod), follow this order:

1.  **Step 1: Import Avatars** (`avatar_intelligence`) - Defines WHO you are targeting.
2.  **Step 2: Import Geo Data** (`geo_intelligence`) - Defines WHERE you are targeting.
3.  **Step 3: Import Fragments** (`content_fragments`) - Imports the raw text blocks.
4.  **Step 4: Import Templates** (`article_templates`) - Defines the structure (HOW to assemble Fragments).
5.  **Step 5: Create Campaign** (`campaign_masters`) - Link the Template, Geo Cluster, and Avatar together to start generating.
