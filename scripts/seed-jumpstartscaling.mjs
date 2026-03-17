#!/usr/bin/env node
/**
 * jumpstartscaling.com seed - jss_seed + jss_content + jss_articles.
 * Run: DATABASE_URL=... node scripts/seed-jumpstartscaling.mjs
 */
import pg from 'pg';

const { Pool } = pg;

const THEME = {
  palette: 'emerald',
  nav: {
    portfolio: [
      { name: 'Home', href: '/' },
      { name: 'Intel', href: '/blog' },
      { name: 'Tools', href: '/tools' },
      { name: 'Calculators', href: '/resources/calculators' },
      { name: 'Contact', href: '/contact' },
      { name: 'Search', href: '/search' },
    ],
    custom_apps: [
      { name: 'Paid Acquisition', href: '/services/paid-acquisition' },
      { name: 'Funnel Architecture', href: '/services/funnel-architecture' },
      { name: 'CRM Transformation', href: '/services/crm-transformation' },
      { name: 'Data Attribution', href: '/services/data-attribution' },
      { name: 'Authority Engine', href: '/services/authority-engine' },
      { name: 'Growth Retainer', href: '/services/growth-retainer' },
    ],
    growth_tools: [
      { name: 'News-Inspired Tools', href: '/tools' },
      { name: 'Moat Audit', href: '/audit' },
      { name: 'ROI Calculators', href: '/resources/calculators' },
    ],
    cta: { label: 'START_FREE_AUDIT', href: '/audit' },
  },
  footer: {
    tagline: 'Growth engineering for companies serious about predictable revenue.',
    copyright: 'Jumpstart Scaling',
    resources: [
      { label: 'Free Audit', href: '/audit' },
      { label: 'Calculator Hub', href: '/resources/calculators' },
      { label: 'Market Intel', href: '/blog' },
    ],
    direct_links: [
      { label: 'Book a Strategy Call', href: '/contact' },
    ],
    legal_links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
    email: 'hello@jumpstartscaling.com',
    theme: {
      bg_deep: '#050505',
      neon_green: '#E8C677',
      neon_blue: '#6EB3FF',
      neon_pink: '#D889FF',
      accent: '#E8C677',
      text_muted: 'rgba(255,255,255,0.74)',
      border_subtle: 'rgba(232,198,119,0.22)',
    },
  },
};

const TOOL_PAGES = [
  { slug: 'ecommerce-sales-projector', title: 'E-Commerce Sales Growth Projector', description: "Forecast quarterly revenue with online vs total mix. Model retail growth like Walmart's 24% e-com surge.", category: 'ecommerce' },
  { slug: 'company-sales-comparison', title: 'Company Sales Comparison Analyzer', description: 'Side-by-side revenue projections. See when one company surpasses another, like Amazon vs Walmart in 2025.', category: 'ecommerce' },
  { slug: 'labor-dispute-risk-analyzer', title: 'Labor Dispute Risk and Salary Cap Analyzer', description: 'Simulate strike impacts and cap fights. Model player earnings during labor disputes.', category: 'labor' },
  { slug: 'ai-ip-risk-estimator', title: 'AI IP Infringement Risk Estimator', description: 'Project legal risk and cost exposure. Compare safe and risky AI deployment scenarios.', category: 'ai' },
  { slug: 'startup-valuation-calculator', title: 'Startup Valuation and Funding Round Simulator', description: "Model post-money valuation, dilution, and cap table scenarios inspired by today's largest rounds.", category: 'finance' },
  { slug: 'ai-music-royalty-calculator', title: 'AI Music Royalty and Generation Cost Calculator', description: 'Estimate royalties and creation costs for AI-assisted music output.', category: 'ai' },
  { slug: 'acquisition-value-estimator', title: 'Acquisition Value Estimator', description: 'Calculate fair purchase price and post-acquisition upside using scenario modeling.', category: 'finance' },
  { slug: 'unemployment-impact-simulator', title: 'Unemployment Impact Simulator', description: 'Project personal runway, cash burn, and macro scenarios during job loss.', category: 'labor' },
  { slug: 'interest-rate-cut-calculator', title: 'Interest Rate Cut Impact Calculator', description: 'Model savings and mortgage outcomes under multiple rate-cut scenarios.', category: 'finance' },
  { slug: 'loyalty-rewards-optimizer', title: 'Loyalty Program Rewards Optimizer', description: 'Estimate points economics, discount impact, and loyalty breakevens.', category: 'loyalty' },
];

const SERVICE_PAGES = [
  {
    slug: 'services/paid-acquisition',
    title: 'Paid Acquisition Engineering | Jumpstart Scaling',
    description: 'Performance media buying engineered for maximum ROAS across Google, Meta, TikTok, and LinkedIn.',
    stats: [{ value: '3.2x', label: 'Avg ROAS Improvement' }, { value: '47%', label: 'Cost Per Lead Reduction' }, { value: '94%', label: 'Client Retention' }],
    bullets: ['Sandbox testing with statistical thresholds', 'Creative extraction and audience expansion', 'Domination phase with margin protection'],
  },
  {
    slug: 'services/funnel-architecture',
    title: 'Funnel Architecture | Jumpstart Scaling',
    description: 'Conversion-optimized funnels engineered to turn traffic into revenue at 2-3x industry averages.',
    stats: [{ value: '2.7x', label: 'Avg Conversion Lift' }, { value: '+185%', label: 'Revenue Per Visitor' }, { value: '68%', label: 'Funnel Completion Rate' }],
    bullets: ['Offer engineering and risk reversal', 'Mechanism clarity and proof stacking', 'Low-friction path to conversion'],
  },
  {
    slug: 'services/crm-transformation',
    title: 'CRM Transformation | Jumpstart Scaling',
    description: 'Turn your CRM into an automated revenue engine with lead scoring, lifecycle automation, and predictive intelligence.',
    stats: [{ value: '<60s', label: 'Lead Response Time' }, { value: '+220%', label: 'Pipeline Velocity' }, { value: '38%', label: 'Close Rate Lift' }],
    bullets: ['Data hygiene and architecture', 'Lifecycle automation and lead scoring', 'Predictive insights and revenue forecasting'],
  },
  {
    slug: 'services/data-attribution',
    title: 'Data Attribution | Jumpstart Scaling',
    description: 'Full-funnel attribution that connects every dollar of spend to downstream revenue.',
    stats: [{ value: '95%+', label: 'Attribution Accuracy' }, { value: '32%', label: 'Wasted Spend Identified' }, { value: '10x', label: 'Scaling Confidence' }],
    bullets: ['Server-side tracking and CAPI', 'Identity resolution across sessions', 'MER and nCPA decision dashboards'],
  },
  {
    slug: 'services/authority-engine',
    title: 'Authority Engine | Jumpstart Scaling',
    description: 'Build category authority that makes competitors irrelevant through compounding content and distribution systems.',
    stats: [{ value: '340%', label: 'Organic Traffic Growth' }, { value: '+28', label: 'Domain Authority Lift' }, { value: '5x', label: 'Brand Search Volume' }],
    bullets: ['Authority mapping and territory selection', 'Definitive content engineering', 'Third-party validation and distribution'],
  },
  {
    slug: 'services/growth-retainer',
    title: 'Growth Retainer | Jumpstart Scaling',
    description: 'A unified growth engineering retainer that integrates acquisition, funnel, CRM, attribution, and authority.',
    stats: [{ value: '4.8x', label: 'Revenue Growth' }, { value: '<30 Days', label: 'Time to ROI' }, { value: '99.9%', label: 'System Uptime' }],
    bullets: ['Dedicated cross-functional growth team', 'Weekly execution cadence with KPI reviews', 'Compounding system integration layer'],
  },
];

const pages = [
  {
    slug: '',
    title: 'Jumpstart Scaling',
    blocks: [
      {
        block_type: 'hero',
        data: {
          badge: 'GROWTH ENGINEERING',
          headline: 'Growth Engineering.<br class="hidden md:block" /><span class="text-neon">Predictable Revenue.</span>',
          subhead: 'We build the infrastructure that turns ad spend into predictable revenue. Stop guessing, start scaling.',
          cta_label: '< START_FREE_AUDIT />',
          cta_href: '/audit',
          warning_text: '// Built for serious operators, not random tactics.',
        },
      },
      {
        block_type: 'terminal_problem',
        data: {
          eyebrow: '// CHAOS_VS_ENGINEERING',
          title: 'Random Acts of Marketing Create Fragile Growth.',
          body: 'Most companies run paid media, content, and CRM in silos. Revenue becomes unpredictable and dependent on luck.',
          bullets: [
            'NO CLEAR ATTRIBUTION ACROSS CHANNELS',
            'PAID TRAFFIC LEAKS THROUGH WEAK FUNNELS',
            'LEADS STALL INSIDE UNDER-AUTOMATED CRM FLOWS',
          ],
          terminal_logs: [
            { time: '09:04', msg: '[ALERT] CAC rising while lead quality declines.' },
            { time: '09:12', msg: '[WARN] Sales follow-up latency exceeds target SLA.' },
            { time: '09:21', msg: '[CRITICAL] Attribution mismatch between ad platforms and revenue.' },
          ],
          status_text: '_ SYSTEM_UNDERPERFORMING',
        },
      },
      {
        block_type: 'solution_cards',
        data: {
          eyebrow: '// THE_GROWTH_STACK',
          title: 'A Six-System Revenue Engine',
          cards: [
            { title: '< PAID_ACQUISITION />', body: 'Engineered media buying that scales profitable winners, not guesswork.', border_color: 'neon-blue' },
            { title: '< FUNNEL_ARCHITECTURE />', body: 'Conversion paths designed to move cold traffic to qualified intent.', border_color: 'neon-green' },
            { title: '< REVENUE_OPS />', body: 'CRM automation that closes follow-up gaps and compounds pipeline velocity.', border_color: 'neon-pink' },
          ],
        },
      },
      {
        block_type: 'icon_bullets',
        data: {
          title: 'Core Service Stack',
          bullets: [
            { icon: '01', title: 'Paid Acquisition', text: 'Google, Meta, TikTok, and LinkedIn systems engineered for MER.' },
            { icon: '02', title: 'Funnel Architecture', text: 'Offer, mechanism, proof, and path optimization for conversion lift.' },
            { icon: '03', title: 'CRM Transformation', text: 'Lead scoring, routing, lifecycle automation, and predictive actions.' },
            { icon: '04', title: 'Data Attribution', text: 'Server-side tracking and full-funnel revenue clarity.' },
            { icon: '05', title: 'Authority Engine', text: 'Compounding brand authority that lowers CAC and shortens sales cycles.' },
            { icon: '06', title: 'Growth Retainer', text: 'Unified team operating all systems with weekly optimization cadence.' },
          ],
        },
      },
      {
        block_type: 'value_prop',
        data: {
          title: 'Free Growth Tools',
          body: '<p>Model CAC, LTV, churn, break-even ROAS, MRR, and retention scenarios with our calculator library.</p><p class="mt-3"><a href="/resources/calculators">Open the calculator hub</a> or explore <a href="/tools">news-inspired scenario tools</a>.</p>',
        },
      },
      {
        block_type: 'audit_form',
        data: {
          title: 'Get Your Free Moat Audit',
          subhead: 'Answer a few questions and we will map your largest growth bottleneck.',
          form_title: 'START_FREE_AUDIT',
          submit_source: 'JumpstartScaling',
        },
      },
      {
        block_type: 'survey',
        data: {
          section_title: 'Ready to turn insights into revenue?',
          primary_label: 'Fill out the audit form above',
          primary_href: '#audit',
          secondary_label: 'open the full Moat Audit',
          secondary_href: '/audit',
          connector: 'or',
        },
      },
    ],
  },
  {
    slug: 'about',
    title: 'About Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'ABOUT', headline: 'Growth Engineers, Not Marketers', subhead: 'We engineer systems, infrastructure, and automation that make scaling predictable.', cta_label: '< START_AUDIT />', cta_href: '/audit' } },
      { block_type: 'value_prop', data: { title: 'Why We Exist', body: '<p>Most agencies sell tactics. We engineer revenue systems. Our approach treats growth like an operating system problem: architecture, instrumentation, and compounding loops.</p>' } },
      { block_type: 'authority', data: { title: 'How We Operate', body: '<p>We engineer for permanence, measure everything, and compound deliberately. Every deployment becomes a reusable business asset.</p>', stats: [{ value: '6', label: 'Integrated Service Pillars' }, { value: 'Weekly', label: 'Optimization Cadence' }, { value: '24/7', label: 'System Automation Layer' }] } },
      { block_type: 'cta', data: { heading: 'Ready to Work With Growth Engineers?', text: 'Start with the free Moat Audit and see where your growth engine leaks.', href: '/audit', label: 'Start Free Audit' } },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'CONTACT', headline: "Let's Build Your Moat", subhead: 'Schedule a strategy call or send us your current growth bottlenecks.', cta_label: '< BOOK_STRATEGY_CALL />', cta_href: '/audit' } },
      { block_type: 'solution_cards', data: { eyebrow: '// CONTACT_OPTIONS', title: 'Pick Your Next Step', cards: [{ title: '< STRATEGY_CALL />', body: '30-minute architecture review focused on your immediate bottleneck.', border_color: 'neon-blue' }, { title: '< DIRECT_CONTACT />', body: 'Send your stack details and current KPIs for async review.', border_color: 'neon-green' }, { title: '< SELF_DIAGNOSE />', body: 'Take the Moat Audit and receive a roadmap before we talk.', border_color: 'neon-pink' }] } },
      { block_type: 'audit_form', data: { title: 'Start the Conversation', subhead: 'Tell us about your current revenue engine and what is blocking scale.', form_title: 'SUBMIT_BRIEF', submit_source: 'JumpstartScaling_Contact' } },
      { block_type: 'cta', data: { heading: 'Not Ready for a Call?', text: 'Run the free Moat Audit first and come back with your score.', href: '/audit', label: 'Take the Audit' } },
    ],
  },
  {
    slug: 'audit',
    title: 'Free Moat Audit | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'MOAT_AUDIT', headline: 'Is Your Growth Built on a <span class="text-neon">House of Cards</span>?', subhead: '60-second assessment. Personal roadmap. No pitch.', cta_label: '< START_ASSESSMENT />', cta_href: '#audit' } },
      { block_type: 'solution_cards', data: { eyebrow: '// WHAT_YOU_GET', title: 'What the Audit Reveals', cards: [{ title: '< LEAK_DETECTION />', body: 'Find where spend and conversion momentum are leaking.', border_color: 'neon-blue' }, { title: '< TOP_1PCT_BENCHMARK />', body: 'Compare CAC, LTV, churn, and velocity against elite operators.', border_color: 'neon-green' }, { title: '< EXECUTION_ROADMAP />', body: 'Receive prioritized actions by impact and implementation speed.', border_color: 'neon-pink' }] } },
      { block_type: 'audit_form', data: { title: 'Start the Moat Audit', subhead: 'Complete the form to get your defensibility score and roadmap.', form_title: 'START_FREE_AUDIT', submit_source: 'JumpstartScaling_Audit' } },
      { block_type: 'authority', data: { title: 'Why is this free?', body: '<p>Value first. The audit gives clarity. If you want execution support, we can build with you. If not, you still leave with a winning strategy.</p>', stats: [{ value: '60s', label: 'Assessment Time' }, { value: '5', label: 'Core Diagnostic Dimensions' }, { value: '0', label: 'Sales Pressure' }] } },
      { block_type: 'cta', data: { heading: 'Need the Full Build-Out?', text: 'After your audit, we can scope implementation across your full growth stack.', href: '/contact', label: 'Book Strategy Call' } },
    ],
  },
  {
    slug: 'audit/moat',
    title: 'Moat Strength Audit | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'MOAT_DIAGNOSTIC', headline: 'Run the Moat Strength Diagnostic', subhead: 'A focused route for founder-level defensibility scoring and next-step planning.', cta_label: '< START_DIAGNOSTIC />', cta_href: '/audit' } },
      { block_type: 'value_prop', data: { title: 'What this route is for', body: '<p>This route mirrors the full audit intent and can be used in campaigns that point directly to moat-focused diagnostics.</p>' } },
      { block_type: 'cta', data: { heading: 'Open the full audit flow', text: 'Continue to the full free Moat Audit.', href: '/audit', label: 'Go to Audit' } },
    ],
  },
  {
    slug: 'blog',
    title: 'Intel & Insights | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'INTEL_AND_INSIGHTS', headline: 'Data-Driven Playbooks for <span class="text-neon">Compounding Growth</span>', subhead: 'Deep dives on strategy, CRM automation, attribution, and market domination systems.', cta_label: '< READ_INTEL />', cta_href: '#topics' } },
      { block_type: 'solution_cards', data: { eyebrow: '// INTEL_PILLARS', title: 'What We Publish', cards: [{ title: '< STRATEGY />', body: 'Frameworks for building defensible competitive moats.', border_color: 'neon-blue' }, { title: '< GROWTH_ENGINEERING />', body: 'CRM automation, lifecycle systems, and revenue ops architecture.', border_color: 'neon-green' }, { title: '< EXECUTION_SYSTEMS />', body: 'How teams convert insights into predictable revenue outcomes.', border_color: 'neon-pink' }] } },
      { block_type: 'icon_bullets', data: { title: 'Topic Index', bullets: [{ icon: 'S', title: 'Market Domination', text: 'How to compete on systems, not tactics.' }, { icon: 'C', title: 'CRM Automation', text: 'Turn a contact database into a revenue engine.' }, { icon: 'A', title: 'Attribution', text: 'Connect spend to revenue with true source-of-truth metrics.' }, { icon: 'F', title: 'Funnels', text: 'Engineer conversion paths that reduce friction and increase yield.' }, { icon: 'R', title: 'Retainer Systems', text: 'Operate all growth pillars with one unified cadence.' }] } },
      { block_type: 'cta', data: { heading: 'Want this applied to your business?', text: 'Read the intel, then book a strategy call to apply it to your stack.', href: '/contact', label: 'Book Strategy Call' } },
    ],
  },
  {
    slug: 'intel',
    title: 'Intel | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'INTEL', headline: 'Intel has moved to <span class="text-neon">/blog</span>', subhead: 'Use the blog route for all long-form intelligence and playbooks.', cta_label: '< OPEN_BLOG />', cta_href: '/blog' } },
      { block_type: 'cta', data: { heading: 'Continue to Intel & Insights', text: 'Open the latest strategy and growth engineering articles.', href: '/blog', label: 'Open Blog' } },
    ],
  },
  {
    slug: 'tools',
    title: 'News-Inspired Calculators | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'TOOLS', headline: 'News-Inspired Calculators', subhead: 'Model the stories shaping markets: valuation rounds, retail shifts, labor risk, AI policy, and rate scenarios.', cta_label: '< RUN_SIMULATIONS />', cta_href: '#tools' } },
      { block_type: 'solution_cards', data: { eyebrow: '// CATEGORY_FILTERS', title: 'Tool Categories', cards: [{ title: '< FINANCE />', body: 'Valuation, acquisition pricing, and macro rate sensitivity.', border_color: 'neon-blue' }, { title: '< ECOMMERCE />', body: 'Sales mix, competitor projection, and channel scenarios.', border_color: 'neon-green' }, { title: '< AI_LABOR_LOYALTY />', body: 'Risk, workforce, and incentive-economics modeling.', border_color: 'neon-pink' }] } },
      { block_type: 'icon_bullets', data: { title: 'What makes these useful', bullets: [{ icon: '1', title: 'Scenario Based', text: 'Each tool maps to a real operating decision.' }, { icon: '2', title: 'No Signup', text: 'Immediate modeling and interpretation.' }, { icon: '3', title: 'Action Oriented', text: 'Outputs are designed for executive tradeoff decisions.' }] } },
      { block_type: 'cta', data: { heading: 'Need custom modeling for your pipeline?', text: 'We build bespoke tools and dashboards tied to your revenue strategy.', href: '/contact', label: 'Talk to Growth Engineering' } },
    ],
  },
  {
    slug: 'resources/calculators',
    title: 'Free Growth Calculators | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'CALCULATORS', headline: 'Premium Growth Calculators', subhead: 'CAC, LTV, churn, break-even ROAS, retention cohorts, and MRR forecast tools.', cta_label: '< OPEN_TOOLSET />', cta_href: '#calculators' } },
      {
        block_type: 'calculator',
        data: {
          section_title: 'Growth Calculator Hub',
          text: 'Choose a calculator route from the DB-defined tool map below.',
          links: [
            { label: 'Open Tools Index', href: '/tools', description: 'Browse all scenario tools and calculators.' },
            { label: 'Run a Free Audit', href: '/audit', description: 'Get a prioritized growth roadmap after using the tools.' },
          ],
        },
      },
      { block_type: 'value_prop', data: { title: 'How teams use this hub', body: '<p>Use acquisition tools to benchmark efficiency, retention tools to model compounding value, and forecasting tools to plan 12-month growth scenarios.</p>' } },
      { block_type: 'cta', data: { heading: 'Ready to turn metrics into execution?', text: 'Use the tools to diagnose. Use the audit to prioritize. Use strategy to scale.', href: '/audit', label: 'Get Your Free Audit' } },
    ],
  },
  {
    slug: 'services',
    title: 'Services | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'SERVICES', headline: 'The Growth Engineering Service Stack', subhead: 'Six integrated pillars operated as one compounding system.', cta_label: '< START_WITH_AUDIT />', cta_href: '/audit' } },
      { block_type: 'solution_cards', data: { eyebrow: '// SIX_PILLARS', title: 'Choose a Starting Point', cards: [{ title: '< ACQUISITION />', body: 'Scale profitable traffic with engineering rigor.', border_color: 'neon-blue' }, { title: '< CONVERSION_AND_CRM />', body: 'Upgrade funnel and lifecycle execution.', border_color: 'neon-green' }, { title: '< ATTRIBUTION_AND_AUTHORITY />', body: 'Build defensibility through data and category trust.', border_color: 'neon-pink' }] } },
      { block_type: 'cta', data: { heading: 'Not sure where to begin?', text: 'Take the audit and we will identify the highest-leverage pillar first.', href: '/audit', label: 'Take Moat Audit' } },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'LEGAL', headline: 'Privacy Policy', subhead: 'How Jumpstart Scaling collects, uses, and protects information.', cta_label: '< CONTACT_US />', cta_href: '/contact' } },
      { block_type: 'value_prop', data: { title: 'Policy Summary', body: '<p>We collect information you provide via forms plus usage analytics needed to improve service quality and measurement. We do not sell personal data. We may use approved processors for infrastructure, analytics, and communication.</p><p class="mt-3">To request data access or deletion, email <a href="mailto:chris@jumpstartscaling.com">chris@jumpstartscaling.com</a>.</p>' } },
      { block_type: 'cta', data: { heading: 'Questions about privacy?', text: 'Reach out directly and we will clarify data handling details.', href: '/contact', label: 'Contact Us' } },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'LEGAL', headline: 'Terms of Service', subhead: 'Terms governing use of jumpstartscaling.com and related services.', cta_label: '< CONTACT_US />', cta_href: '/contact' } },
      { block_type: 'value_prop', data: { title: 'Terms Summary', body: '<p>Service scope, deliverables, ownership, and liability limits are defined in signed service agreements. Website usage must be lawful and compliant with applicable regulations.</p><p class="mt-3">Questions can be directed to <a href="mailto:chris@jumpstartscaling.com">chris@jumpstartscaling.com</a>.</p>' } },
      { block_type: 'cta', data: { heading: 'Need contractual clarification?', text: 'We can review service scope and implementation terms together.', href: '/contact', label: 'Book Clarification Call' } },
    ],
  },
  {
    slug: 'search',
    title: 'Search | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'SEARCH', headline: 'Find the exact system you need', subhead: 'Search across service pages, tool pages, and intel articles.', cta_label: '< OPEN_INTEL />', cta_href: '/blog' } },
      { block_type: 'solution_cards', data: { eyebrow: '// QUICK_PATHS', title: 'Search Paths', cards: [{ title: '< SERVICES />', body: 'Find service implementation pages by stack layer.', border_color: 'neon-blue' }, { title: '< INTEL />', body: 'Find strategy articles by topic and category.', border_color: 'neon-green' }, { title: '< TOOLS />', body: 'Find calculators and simulators by operating question.', border_color: 'neon-pink' }] } },
      { block_type: 'cta', data: { heading: 'Need guidance?', text: 'If search results are broad, start with an audit and we will prioritize for you.', href: '/audit', label: 'Start Audit' } },
    ],
  },
  {
    slug: 'guide/how-i-build',
    title: 'How I Build | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'GUIDE', headline: 'How We Build Scalable Growth Systems', subhead: 'Architecture first. Instrumentation second. Optimization forever.', cta_label: '< READ_INTEL />', cta_href: '/blog/how-i-build-scalable-web-applications' } },
      { block_type: 'icon_bullets', data: { title: 'Build Principles', bullets: [{ icon: 'A', title: 'Architecture First', text: 'Design data flow and ownership before channel tactics.' }, { icon: 'M', title: 'Measure Everything', text: 'Tie all actions to attributable revenue outcomes.' }, { icon: 'C', title: 'Compound Deliberately', text: 'Build assets and loops that improve over time.' }] } },
      { block_type: 'cta', data: { heading: 'See the full breakdown', text: 'Read the complete article in Intel & Insights.', href: '/blog/how-i-build-scalable-web-applications', label: 'Open Article' } },
    ],
  },
  {
    slug: 'guide/scaling-secrets',
    title: 'The Ultimate Guide to Scaling Your Startup | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'SCALING_GUIDE', headline: 'The Ultimate Guide to Scaling Your Startup', subhead: 'From unit economics to systems architecture and execution cadence.', cta_label: '< READ_GUIDE />', cta_href: '/blog/scaling-secrets-ultimate-guide' } },
      { block_type: 'value_prop', data: { title: 'Guide Overview', body: '<p>This guide covers foundation metrics, retention math, automation architecture, team alignment, and capital-efficient scaling strategy.</p>' } },
      { block_type: 'cta', data: { heading: 'Read the full guide', text: 'Open the long-form article in the intel feed.', href: '/blog/scaling-secrets-ultimate-guide', label: 'Open Guide Article' } },
    ],
  },
  {
    slug: 'architect',
    title: 'The One-Stop Architect | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'ARCHITECT', headline: 'The One-Stop Architect', subhead: 'A campaign route focused on architecture-led growth implementation.', cta_label: '< START_AUDIT />', cta_href: '/audit' } },
      { block_type: 'value_prop', data: { title: 'Campaign Intent', body: '<p>This page serves paid campaign traffic that needs a direct architecture-first positioning angle before entering the audit flow.</p>' } },
      { block_type: 'cta', data: { heading: 'Move to diagnostic', text: 'Run the audit and get your first-priority implementation roadmap.', href: '/audit', label: 'Start Audit' } },
    ],
  },
  {
    slug: 'offer/blueprint',
    title: 'Predictable Revenue Blueprint | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'BLUEPRINT', headline: 'Stop Guessing. Start Scaling.', subhead: 'A direct-response blueprint route for predictable revenue system design.', cta_label: '< GET_BLUEPRINT />', cta_href: '/audit' } },
      { block_type: 'solution_cards', data: { eyebrow: '// BLUEPRINT_SYSTEM', title: 'Blueprint Layers', cards: [{ title: '< ATTRIBUTION />', body: 'Establish a source-of-truth measurement backbone.', border_color: 'neon-blue' }, { title: '< OPERATIONS />', body: 'Automate lifecycle and reduce execution lag.', border_color: 'neon-green' }, { title: '< ACQUISITION />', body: 'Scale what is profitable with confidence.', border_color: 'neon-pink' }] } },
      { block_type: 'cta', data: { heading: 'Get the full blueprint', text: 'Complete the audit and we will assemble your custom roadmap.', href: '/audit', label: 'Start Free Audit' } },
    ],
  },
  {
    slug: 'offer/framework',
    title: 'Scale to 10M+ ARR Framework | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'FRAMEWORK', headline: 'Scale to 10M+ ARR with engineered systems', subhead: 'A practical framework for moving from fragile growth to compounding execution.', cta_label: '< START_FRAMEWORK_AUDIT />', cta_href: '/audit' } },
      { block_type: 'icon_bullets', data: { title: 'Framework Pillars', bullets: [{ icon: '1', title: 'Instrumentation', text: 'Attribution and KPI truth layer.' }, { icon: '2', title: 'Acquisition', text: 'Profitable paid and organic demand.' }, { icon: '3', title: 'Conversion', text: 'Funnel architecture and friction removal.' }, { icon: '4', title: 'Operations', text: 'CRM automation and lifecycle orchestration.' }] } },
      { block_type: 'cta', data: { heading: 'Apply this framework now', text: 'Run the audit and map your first 90-day execution plan.', href: '/audit', label: 'Start Free Audit' } },
    ],
  },
  {
    slug: 'offer/n8n',
    title: 'Automation Infrastructure Offer | Jumpstart Scaling',
    blocks: [
      { block_type: 'hero', data: { badge: 'AUTOMATION', headline: 'Automation infrastructure that scales without SaaS sprawl', subhead: 'Campaign route for teams replacing brittle workflow stacks with engineered automation.', cta_label: '< START_AUDIT />', cta_href: '/audit' } },
      { block_type: 'value_prop', data: { title: 'What this route qualifies', body: '<p>Organizations with workflow debt, disconnected tools, and slow operator cycles that need an execution-grade automation layer.</p>' } },
      { block_type: 'cta', data: { heading: 'Qualify your automation stack', text: 'Use the audit to identify the highest-impact automation upgrade first.', href: '/audit', label: 'Start Audit' } },
    ],
  },
];

for (const svc of SERVICE_PAGES) {
  pages.push({
    slug: svc.slug,
    title: svc.title,
    blocks: [
      {
        block_type: 'hero',
        data: {
          badge: 'SERVICE',
          headline: svc.title.replace(' | Jumpstart Scaling', ''),
          subhead: svc.description,
          cta_label: '< START_FREE_AUDIT />',
          cta_href: '/audit',
        },
      },
      {
        block_type: 'terminal_problem',
        data: {
          eyebrow: '// SCALING_GAP',
          title: 'Most teams run this function as isolated execution.',
          body: `Without system integration, ${svc.title.replace(' | Jumpstart Scaling', '')} creates temporary spikes instead of compounding growth.`,
          bullets: [
            'SILOED DATA FLOWS ACROSS CHANNELS',
            'NO FEEDBACK LOOPS INTO CRM AND FORECASTING',
            'DECISIONS MADE WITHOUT FULL-FUNNEL CONTEXT',
          ],
          terminal_logs: [
            { time: '10:01', msg: '[WARN] Growth actions not linked to revenue source-of-truth.' },
            { time: '10:11', msg: '[WARN] Channel optimization disconnected from lifecycle automation.' },
            { time: '10:17', msg: '[CRITICAL] Scaling variance exceeds operating threshold.' },
          ],
          status_text: '_ REQUIRES_SYSTEM_ENGINEERING',
        },
      },
      {
        block_type: 'solution_cards',
        data: {
          eyebrow: '// EXECUTION_MODEL',
          title: 'Delivery Framework',
          cards: [
            { title: '< DIAGNOSE />', body: 'Audit current process, instrumentation, and leak points.', border_color: 'neon-blue' },
            { title: '< ENGINEER />', body: 'Implement workflows, dashboards, and operating standards.', border_color: 'neon-green' },
            { title: '< COMPOUND />', body: 'Run weekly optimization loops tied to downstream revenue.', border_color: 'neon-pink' },
          ],
        },
      },
      { block_type: 'authority', data: { title: 'Performance Benchmarks', body: `<p>${svc.description}</p>`, stats: svc.stats } },
      {
        block_type: 'icon_bullets',
        data: {
          title: 'Implementation Highlights',
          bullets: svc.bullets.map((text, i) => ({ icon: `${i + 1}`, title: `Module ${i + 1}`, text })),
        },
      },
      {
        block_type: 'audit_form',
        data: {
          title: `${svc.title.replace(' | Jumpstart Scaling', '')} Audit`,
          subhead: 'Tell us your current constraints and we will map the highest-leverage fix.',
          form_title: 'START_FREE_AUDIT',
          submit_source: `JumpstartScaling_${svc.slug.replace(/\//g, '_')}`,
        },
      },
      { block_type: 'cta', data: { heading: 'Ready to deploy this system?', text: 'Start with the audit and we will prioritize your first 90-day plan.', href: '/audit', label: 'Start Free Audit' } },
    ],
  });
}

for (const tool of TOOL_PAGES) {
  pages.push({
    slug: `tools/${tool.slug}`,
    title: `${tool.title} | Jumpstart Scaling`,
    blocks: [
      {
        block_type: 'hero',
        data: {
          badge: 'TOOL',
          headline: tool.title,
          subhead: tool.description,
          cta_label: '< RUN_SCENARIO />',
          cta_href: '#calculators',
        },
      },
      {
        block_type: 'value_prop',
        data: {
          title: 'How to use this simulator',
          body: `<p>This ${tool.category} model is designed for fast scenario planning. Run multiple assumptions, compare outputs, and use the results to guide tactical decisions.</p><p class="mt-3">For full implementation support, pair this with a free Moat Audit.</p>`,
        },
      },
      {
        block_type: 'calculator',
        data: {
          section_title: tool.title,
          text: tool.description,
          links: [
            { label: 'Back to all tools', href: '/tools', description: 'Explore more scenario calculators by category.' },
            { label: 'Get implementation help', href: '/contact', description: 'Turn this model into an execution plan.' },
          ],
        },
      },
      {
        block_type: 'icon_bullets',
        data: {
          title: 'Interpretation Guide',
          bullets: [
            { icon: 'A', title: 'Baseline', text: 'Run your current-state numbers first.' },
            { icon: 'B', title: 'Scenario Range', text: 'Model conservative, expected, and aggressive outcomes.' },
            { icon: 'C', title: 'Decision', text: 'Choose the strategy with best risk-adjusted upside.' },
          ],
        },
      },
      { block_type: 'cta', data: { heading: 'Need this integrated into your growth stack?', text: 'We can operationalize this model in your dashboards and workflows.', href: '/contact', label: 'Talk to an Engineer' } },
    ],
  });
}

const ARTICLES = [
  {
    slug: 'market-domination-strategy-playbook',
    title: 'The Market Domination Strategy Playbook',
    excerpt: 'A framework for building defensible moats through data infrastructure, automation, authority, and customer ecosystem design.',
    category: 'strategy',
    tags: ['strategy', 'market-domination', 'moat', 'growth', 'scaling'],
    author: 'Jumpstart Scaling',
    published_at: '2026-01-15T00:00:00.000Z',
    content: `<h2>Why most growth strategies fail at scale</h2><p>Most companies attempt to out-execute competitors with the same channel tactics. This creates a race won by whoever can burn the most budget, not whoever builds the strongest system.</p><p>Market domination requires structural advantages that compound: infrastructure, instrumentation, and operating loops that become harder to replicate every quarter.</p><h2>The four moat model</h2><p><strong>Data Infrastructure:</strong> Own the measurement layer and decision context.</p><p><strong>System Automation:</strong> Encode repeatable work into operating workflows.</p><p><strong>Brand Authority:</strong> Become the default choice before the sales conversation starts.</p><p><strong>Customer Ecosystem:</strong> Increase switching costs through integrations, community, and process lock-in.</p><h2>Roadmap phases</h2><p><strong>Foundation (0-3 months):</strong> instrumentation, attribution, lifecycle basics.</p><p><strong>Acceleration (3-6 months):</strong> scale validated channels with stronger conversion and ops loops.</p><p><strong>Domination (6-12+ months):</strong> compounding effects across all moats.</p><p>The objective is not temporary growth. The objective is durable, defensible growth that improves as the system matures.</p><p><a href="/audit">Run the Moat Audit</a> to identify your highest-leverage moat gap first.</p>`,
  },
  {
    slug: 'crm-automation-revenue-growth',
    title: 'CRM Automation and Revenue Growth',
    excerpt: 'How high-growth teams transform CRM from a contact database into an automated revenue operating system.',
    category: 'growth-engineering',
    tags: ['crm', 'automation', 'revenue', 'scaling'],
    author: 'Jumpstart Scaling',
    published_at: '2026-02-01T00:00:00.000Z',
    content: `<h2>The shift from passive CRM to active revenue operations</h2><p>Passive CRM captures history. Active CRM triggers action. The highest-performing teams move from manual updates to automated decision workflows tied to lead intent and pipeline risk.</p><h2>Five pillars of CRM automation</h2><p><strong>1) Instant engagement:</strong> sub-minute lead response workflows.</p><p><strong>2) Intelligent scoring and routing:</strong> fit + intent based prioritization.</p><p><strong>3) Pipeline automation:</strong> stage transitions and SLA enforcement.</p><p><strong>4) Lifecycle management:</strong> expansion and churn-prevention triggers.</p><p><strong>5) Revenue intelligence:</strong> closed-loop analysis from acquisition through retention.</p><h2>Implementation sequence</h2><p>Start with process audit and data cleanup. Deploy three high-impact workflows first: instant response, scoring/routing, and stage-triggered follow-up. Expand only after measurable gains appear in velocity and close rates.</p><p>Automation is not a software project. It is a revenue strategy encoded into systems.</p><p><a href="/services/crm-transformation">See CRM Transformation service</a> or <a href="/audit">start with the audit</a>.</p>`,
  },
  {
    slug: 'how-i-build-scalable-web-applications',
    title: 'How I Build Scalable, Beautiful Web Applications',
    excerpt: 'A practical engineering philosophy for shipping quickly without compromising design quality or long-term scalability.',
    category: 'engineering',
    tags: ['architecture', 'systems', 'delivery', 'scaling'],
    author: 'Jumpstart Scaling',
    published_at: '2025-10-15T00:00:00.000Z',
    content: `<h2>Fast, beautiful, scalable</h2><p>Most teams optimize for one or two of these dimensions. High-leverage engineering architecture makes all three possible by choosing constraints early and reducing complexity later.</p><h2>Build principles</h2><p><strong>Architecture before implementation:</strong> define data flow and ownership first.</p><p><strong>Design systems over one-off pages:</strong> reduce UI entropy and speed iteration.</p><p><strong>Measure and iterate:</strong> connect every feature to user and business outcomes.</p><h2>Execution rhythm</h2><p>Work in vertical slices: problem, UX, data, implementation, deployment, measurement. This creates frequent feedback loops and prevents late integration failure.</p><p>The tools change over time. The principles do not.</p><p><a href="/contact">Talk to Jumpstart Scaling</a> if you need this engineering rigor applied to your growth stack.</p>`,
  },
  {
    slug: 'scaling-secrets-ultimate-guide',
    title: 'The Ultimate Guide to Scaling Your Startup',
    excerpt: 'A long-form playbook covering unit economics, retention, automation architecture, and operating cadence for sustainable scale.',
    category: 'strategy',
    tags: ['startup', 'scaling', 'unit-economics', 'automation'],
    author: 'Jumpstart Scaling',
    published_at: '2026-02-12T00:00:00.000Z',
    content: `<h2>Foundation before velocity</h2><p>Scale amplifies existing conditions. If your economics or operating systems are unstable, growth increases fragility instead of value creation.</p><h2>Core metrics</h2><p>Track CAC, payback window, gross margin, retention, and net revenue growth as one connected model. Any scaling decision disconnected from this model is speculation.</p><h2>System pillars for scale</h2><p><strong>Attribution:</strong> trustworthy source-of-truth metrics.</p><p><strong>Conversion architecture:</strong> reliable funnel progression.</p><p><strong>Lifecycle automation:</strong> consistent post-acquisition execution.</p><p><strong>Forecasting:</strong> scenario planning tied to operational constraints.</p><h2>Operating cadence</h2><p>Weekly execution reviews, monthly strategic reallocation, and quarterly architecture refreshes keep the system aligned with market reality.</p><p><a href="/audit">Start with the free Moat Audit</a> to map your first 90-day scaling plan.</p>`,
  },
];

const JSS_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS jss_seed (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS jss_content (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]',
  palette TEXT NOT NULL DEFAULT 'emerald',
  nav JSONB,
  footer JSONB,
  local_seo JSONB,
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jss_articles (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'strategy',
  tags        JSONB NOT NULL DEFAULT '[]',
  author      TEXT NOT NULL DEFAULT 'Jumpstart Scaling',
  og_image    TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jss_articles_status ON jss_articles (status);
CREATE INDEX IF NOT EXISTS idx_jss_articles_category ON jss_articles (category);
CREATE INDEX IF NOT EXISTS idx_jss_articles_published ON jss_articles (published_at DESC)
  WHERE status = 'published';
`;

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }

  const ssl = url.includes('sslmode=require') || url.includes('sslmode=verify')
    ? { rejectUnauthorized: false }
    : false;

  const pool = new Pool({ connectionString: url, ssl });
  const client = await pool.connect();

  try {
    await client.query(JSS_TABLES_SQL);

    const pagesMap = {};
    for (const page of pages) {
      pagesMap[page.slug] = { title: page.title, blocks: page.blocks };
    }

    await client.query(
      `INSERT INTO jss_seed (key, value)
       VALUES ('theme', $1::jsonb), ('homepage_blocks', $2::jsonb), ('pages', $3::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [
        JSON.stringify({ palette: THEME.palette, nav: THEME.nav, footer: THEME.footer }),
        JSON.stringify(pages.find((p) => p.slug === '')?.blocks || []),
        JSON.stringify(pagesMap),
      ]
    );

    for (const page of pages) {
      await client.query(
        `INSERT INTO jss_content (slug, title, blocks, palette, nav, footer, source, created_at)
         VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6::jsonb, 'seed-jss', NOW())
         ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             blocks = EXCLUDED.blocks,
             palette = EXCLUDED.palette,
             nav = EXCLUDED.nav,
             footer = EXCLUDED.footer,
             source = EXCLUDED.source`,
        [page.slug, page.title, JSON.stringify(page.blocks), THEME.palette, JSON.stringify(THEME.nav), JSON.stringify(THEME.footer)]
      );
    }

    for (const article of ARTICLES) {
      await client.query(
        `INSERT INTO jss_articles (slug, title, excerpt, content, category, tags, author, status, published_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'published', $8::timestamptz, NOW())
         ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             excerpt = EXCLUDED.excerpt,
             content = EXCLUDED.content,
             category = EXCLUDED.category,
             tags = EXCLUDED.tags,
             author = EXCLUDED.author,
             status = 'published',
             published_at = EXCLUDED.published_at,
             updated_at = NOW()`,
        [
          article.slug,
          article.title,
          article.excerpt,
          article.content,
          article.category,
          JSON.stringify(article.tags),
          article.author,
          article.published_at,
        ]
      );
    }

    console.log(JSON.stringify({
      message: 'jumpstartscaling.com seed complete (jss_seed + jss_content + jss_articles).',
      pages: pages.length,
      articles: ARTICLES.length,
      tools: TOOL_PAGES.length,
      services: SERVICE_PAGES.length,
    }, null, 2));
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
