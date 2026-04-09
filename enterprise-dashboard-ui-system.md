# UI System for Internal Sales Performance Dashboard

This UI system is built for high-frequency operational use by managers and agents. It prioritizes reading speed, scanability, and reliable interaction over visual novelty.

## 1) Design Principles

## 1. Clarity over decoration
- Every element must answer: what is it, why does it matter, what can I do next?
- Labels should be explicit (`Won Revenue`, not `Revenue+`).
- Prefer plain language over branded jargon.

## 2. Information hierarchy before density
- Primary metrics first, then supporting context, then detailed records.
- Use grouping and whitespace, not heavy borders, to separate sections.
- Only one primary action per section.

## 3. Visual restraint
- Default UI should be neutral (grays + one accent).
- Color indicates meaning, not style preference.
- Avoid decorative patterns, gradients, and oversized shadows.

## 4. Operational consistency
- Same entity uses same label across pages (`Agent`, `Target`, `Period`).
- Same action placement across pages (e.g., create action top-right).
- Table and form behavior should feel identical in admin and agent views.

## 5. Accessible readability
- Base font sizes and contrast must support long daily use.
- Keyboard-first navigation is mandatory for all critical actions.
- Do not rely on color alone to communicate status.

---

## 2) Typography System

## Font stack
- Primary: `Inter` (or system fallback: `-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`)
- Use a single family for UI and data tables.

## Type scale
- `12px` – auxiliary metadata (timestamps, hints)
- `14px` – default body, table text, form labels
- `16px` – emphasized body / high-value row text
- `20px` – section headers
- `24px` – page title
- `28px` – key KPI number (only in KPI blocks)

## Weight usage
- `400` regular: most content
- `500` medium: labels and secondary headers
- `600` semibold: section titles, table headers
- `700` bold: page title and KPI values only

## Line height
- Body/table: `1.45`
- Headers: `1.25`
- KPI numerics: `1.1`

## What not to do (typography)
- Do not mix multiple font families.
- Do not use all-caps for body/table labels.
- Do not use font sizes below `12px`.
- Do not use light gray text for critical data.

---

## 3) Spacing System

Use an 8-point spacing base.

## Spacing tokens
- `4` (micro alignment only)
- `8` (tight element spacing)
- `12` (form label-to-input spacing)
- `16` (default component internal padding)
- `24` (section spacing)
- `32` (major layout blocks)
- `40/48` (page-level vertical rhythm)

## Layout rules
- Page content max width: `1440px` with responsive behavior.
- Sidebar width: `240px` desktop, collapsible mobile/tablet.
- Standard card padding: `16px`.
- Table row height: `44px` default.

## What not to do (spacing)
- Do not use arbitrary pixel values outside token scale unless required for 1px borders.
- Do not compress sections to fit more widgets.
- Do not exceed three stacked density levels on one screen.

---

## 4) Color Usage (Minimal and Purposeful)

## Core palette
- **Neutral background:** `#F7F8FA`
- **Surface:** `#FFFFFF`
- **Primary text:** `#111827`
- **Secondary text:** `#4B5563`
- **Border:** `#D1D5DB`

## Semantic colors
- **Primary action / link:** `#1D4ED8` (blue)
- **Success:** `#15803D`
- **Warning:** `#B45309`
- **Error:** `#B91C1C`
- **Info:** `#0369A1`

## Usage rules
- Neutral colors should dominate (>85% of visible UI).
- Semantic colors only for state, alerts, or key actions.
- KPI delta colors must include icon/text indicator (`↑`, `↓`, `On track`) in addition to color.

## What not to do (color)
- No gradients.
- No neon accent colors.
- No multiple accent colors competing in one panel.
- No colored card backgrounds for routine data.

---

## 5) Component Standards

## A) Tables
**Purpose:** Primary interface for operational data (sales, activities, targets).

**Structure**
- Sticky header row
- Sortable key columns only (date, amount, status)
- Left-aligned text, right-aligned numeric values
- Optional row-level action menu (Edit, View, Correct)

**Behavior**
- Server-side pagination
- Filter bar above table (month/team/status)
- Empty row placeholders avoided; use real empty state panel

**Do not**
- Do not use dense 11px text tables.
- Do not make every column sortable.
- Do not freeze more than first column unless critical.

## B) Forms
**Purpose:** Reliable entry and correction of operational records.

**Structure**
- Single-column form for create/edit pages
- Label above input, helper text below
- Inline validation near field + summary at top on submit fail

**Behavior**
- Preserve entered values on validation failure
- Disable submit only during request
- Show explicit success confirmation and redirect target

**Do not**
- Do not hide required fields behind accordions.
- Do not rely on placeholder text as label.
- Do not use ambiguous CTA labels (`Submit` everywhere).

## C) Cards
**Purpose:** Group related information blocks, not decoration.

**Structure**
- Title + optional supporting metric
- Body with concise content list/table snippet
- Optional footer with one secondary action

**Do not**
- Do not use card carousels.
- Do not stack more than 4 cards per row on desktop.
- Do not duplicate data already visible in nearby tables.

## D) KPI Blocks
**Purpose:** Communicate current period performance at a glance.

**Structure**
- Metric label
- Primary value (large)
- Context line (target, variance, last refresh)

**Rules**
- Max 4 KPI blocks above the fold.
- Every KPI must map to actionable drill-down.
- Keep units explicit (`$`, `%`, count).

**Do not**
- Do not show vanity KPIs without decisions attached.
- Do not show animated counters.

## E) Charts
**Purpose:** Trend and comparison, not decoration.

**Chart set allowed**
- Line chart: monthly trend
- Bar chart: agent comparison
- Stacked bar: activity composition (limited categories)

**Rules**
- Always include labeled axes and units.
- Keep to 1–2 charts per dashboard section.
- Provide table fallback view for exact values.

**Do not**
- Do not use pie/donut charts for multi-agent comparisons.
- Do not use 3D effects.
- Do not place 6+ mini charts on one screen.

---

## 6) Interaction Patterns

## Navigation
- Role-specific sidebar with persistent active state.
- Breadcrumbs for nested pages.
- URL query params reflect filters for shareable state.

## Actions
- Primary action: right-aligned in page header.
- Destructive actions require confirmation modal with explicit object name.
- Batch actions appear only when rows are selected.

## Feedback
- Inline field errors + top summary for form failures.
- Toast for non-critical success messages.
- Persistent alert banner for critical data issues.

## Keyboard and focus
- Logical tab order across filters/table/actions.
- Visible focus ring on all interactive elements.
- Enter submits focused form; Escape closes modal.

## What not to do (interactions)
- Do not hide critical actions in kebab menus if used frequently.
- Do not auto-refresh tables while user is editing.
- Do not silently fail background operations.

---

## 7) Empty States and Loading States

## Empty states
Each empty state must include:
1. Clear reason (`No sales found for March 2026`)
2. Suggested next step (`Add your first sale`)
3. Primary action button (if user has permission)

Use cases:
- No records yet
- Filters produce no results
- Permission-restricted section

## Loading states
- Table pages: skeleton rows matching final table structure.
- KPI blocks: fixed-height placeholders to prevent layout shift.
- Charts: loading frame + short status text (`Loading monthly trend...`).

## Timeout/error states
- Show retry action and last known successful refresh time.
- Use non-technical language first; keep technical details behind “View details”.

## What not to do (states)
- Do not use infinite spinners without timeout messaging.
- Do not show blank panels with no explanation.
- Do not remove filters or page context while loading.

---

## Explicit Anti-Patterns (Do Not Implement)

1. “Wall of widgets” dashboards with 10+ mixed cards.
2. Multi-color KPI tiles with inconsistent semantics.
3. Template-style marketing visuals (hero banners, large illustrations).
4. Hidden role switching inside same page shell.
5. Over-nested navigation (more than 2 levels in sidebar).
6. Charts without corresponding tabular drill-down.
7. Action labels that do not specify outcome (`Apply`, `Run`, `Do`).
8. Any UI choice that prioritizes novelty over scanability.
