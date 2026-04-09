# Server-Rendered Page Structure (HTML/CSS/JS)

This structure is designed for a server-rendered internal application with minimal client-side JavaScript. Routing is simple and role-separated.

## 1) Full List of Pages

## Public Pages

### 1. `/login`
- **Purpose:** Authenticate user into the system.
- **Data displayed:** Company name, login form, SSO button (if enabled), authentication errors.
- **Actions available:** Submit credentials, start SSO, go to password reset.

### 2. `/forgot-password`
- **Purpose:** Request password reset.
- **Data displayed:** Email input, reset status message.
- **Actions available:** Submit reset request, return to login.

### 3. `/access-denied`
- **Purpose:** Display unauthorized access message when role is insufficient.
- **Data displayed:** Error message, user role summary, link back to allowed dashboard.
- **Actions available:** Go to dashboard, logout.

## Agent Pages

### 4. `/agent/dashboard`
- **Purpose:** Daily operating view for the signed-in agent.
- **Data displayed:**
  - Current month target(s)
  - Current month actuals (won revenue, won deals, activities)
  - Recent sales and recent activities (last 7–14 days)
  - Personal leaderboard rank for selected month
  - Missing data alerts (e.g., no activity logged today)
- **Actions available:**
  - Add sale
  - Add activity
  - Open personal reports
  - Change month filter

### 5. `/agent/sales`
- **Purpose:** View and manage own sales records.
- **Data displayed:** Table of own sales with date, amount, status, customer, created date.
- **Actions available:** Create sale, edit allowed sale fields, filter by month/status, paginate.

### 6. `/agent/sales/new`
- **Purpose:** Create a new sale record.
- **Data displayed:** Form fields (customer, amount, status, occurred date, closed date).
- **Actions available:** Save draft (optional), submit, cancel back to sales list.

### 7. `/agent/sales/:id/edit`
- **Purpose:** Update an existing own sale (if period is open).
- **Data displayed:** Existing sale fields and validation messages.
- **Actions available:** Save changes, cancel.

### 8. `/agent/activities`
- **Purpose:** View and manage own activity records.
- **Data displayed:** Table of own activities with type, date, notes, related sale (if any).
- **Actions available:** Create activity, edit activity, filter by date/type, paginate.

### 9. `/agent/activities/new`
- **Purpose:** Create new activity entry.
- **Data displayed:** Form fields (type, date, notes, related sale).
- **Actions available:** Submit, cancel.

### 10. `/agent/activities/:id/edit`
- **Purpose:** Update existing own activity (if period is open).
- **Data displayed:** Existing activity fields and validation messages.
- **Actions available:** Save changes, cancel.

### 11. `/agent/targets`
- **Purpose:** Show own monthly targets vs actuals.
- **Data displayed:** Target rows by metric/month, attainment %, variance.
- **Actions available:** Change month range, export personal target report.

### 12. `/agent/leaderboard`
- **Purpose:** Show leaderboard in read-only mode.
- **Data displayed:** Ranked list for selected month and metric (limited columns only).
- **Actions available:** Change metric/month filter.

### 13. `/agent/reports`
- **Purpose:** Access personal downloadable reports.
- **Data displayed:** Report types, selected period, generated-at timestamp.
- **Actions available:** Generate CSV/PDF, download latest.

### 14. `/agent/profile`
- **Purpose:** Manage own profile/security settings.
- **Data displayed:** Name, email, MFA status, password update form.
- **Actions available:** Update profile, change password, configure MFA.

## Admin Pages

### 15. `/admin/dashboard`
- **Purpose:** Management summary for team performance.
- **Data displayed:**
  - Team totals for current month (revenue, deals, activities)
  - At-risk agents list (low attainment/missing logs)
  - Recent corrections/approvals queue
  - Top/bottom performers for selected metric
- **Actions available:** Drill into agents, open approvals, switch month/team filters.

### 16. `/admin/agents`
- **Purpose:** Manage agent directory and status.
- **Data displayed:** Agent list with team, territory, manager, status.
- **Actions available:** Create agent, edit agent, deactivate/reactivate, search/filter.

### 17. `/admin/agents/new`
- **Purpose:** Add new agent account and profile.
- **Data displayed:** User + agent setup form (identity, team, manager, territory).
- **Actions available:** Create user+agent, cancel.

### 18. `/admin/agents/:id/edit`
- **Purpose:** Update agent account/profile.
- **Data displayed:** Existing agent and linked user details.
- **Actions available:** Save changes, deactivate/reactivate.

### 19. `/admin/targets`
- **Purpose:** Set and review agent/team monthly targets.
- **Data displayed:** Target table by agent, metric, period month.
- **Actions available:** Add target, edit target, bulk upload CSV, filter by month/team.

### 20. `/admin/sales`
- **Purpose:** Oversight of all sales records.
- **Data displayed:** Sales table across all agents with key columns and owner agent.
- **Actions available:** Filter/search, open record details, perform correction (if authorized).

### 21. `/admin/activities`
- **Purpose:** Oversight of all activities.
- **Data displayed:** Activity table across agents with type/date/owner.
- **Actions available:** Filter/search, open/edit record (authorized), export.

### 22. `/admin/leaderboard`
- **Purpose:** Full leaderboard management view.
- **Data displayed:** Ranking by month and metric with team filters.
- **Actions available:** Change ranking metric, month/team filters, export leaderboard.

### 23. `/admin/reports`
- **Purpose:** Generate and export operational reports.
- **Data displayed:** Report templates + filters (date range, team, agent, territory).
- **Actions available:** Run report, export CSV/PDF.

### 24. `/admin/approvals`
- **Purpose:** Approve/reject correction requests.
- **Data displayed:** Pending requests with requester, reason, target record, old/new values.
- **Actions available:** Approve, reject, view audit context.

### 25. `/admin/audit-log`
- **Purpose:** Trace system changes.
- **Data displayed:** Actor, action, table, row id, timestamp, before/after summary.
- **Actions available:** Filter by actor/date/table/action, export.

### 26. `/admin/settings`
- **Purpose:** Manage operational configuration.
- **Data displayed:** Period lock dates, validation settings, report defaults.
- **Actions available:** Update settings, save, rollback unsaved edits.

---

## 2) Navigation Structure

## Top-Level Routing
- Public routes: `/login`, `/forgot-password`, `/access-denied`
- Agent routes: `/agent/*`
- Admin routes: `/admin/*`

## Navigation Rules
- After login:
  - role `agent` → redirect to `/agent/dashboard`
  - role `admin` → redirect to `/admin/dashboard`
- Any route under `/admin/*` requires admin role.
- Any route under `/agent/*` requires authenticated user with agent role.
- Unauthorized route access redirects to `/access-denied`.

## Sidebar Menus
- **Agent sidebar:** Dashboard, Sales, Activities, Targets, Leaderboard, Reports, Profile
- **Admin sidebar:** Dashboard, Agents, Targets, Sales, Activities, Leaderboard, Reports, Approvals, Audit Log, Settings

---

## 3) Layout Structure (Server-Rendered)

## Global Shell
- **Header (fixed):** app name, signed-in user, role badge, logout action.
- **Sidebar (fixed on desktop / collapsible on small screens):** role-specific nav links.
- **Main content area:**
  - page title + breadcrumbs
  - filter bar (month/team/status as needed)
  - primary table/form content
  - action bar (create/export/save)

## Page Composition Rules
- Data-heavy pages use standard table layout with server pagination.
- Create/edit pages use single-column forms with clear validation.
- Dashboard pages show only operational KPIs used for decisions (no decorative cards).
- All lists include empty-state text with clear next action.

---

## 4) Data Flow from Supabase to UI

## Request/Response Pattern
1. Browser requests server route (e.g., `/agent/sales?month=2026-03`).
2. Server validates session (Supabase auth cookie/JWT).
3. Server resolves role and user id from `auth.uid()` + `public.users`.
4. Server queries Supabase Postgres using role-safe SQL/RPC (RLS enforced).
5. Server renders HTML with returned rows and pagination metadata.
6. Browser receives fully rendered page; JS is used only for minor enhancements (date picker, confirm modals).

## Write Flow (Create/Update)
1. User submits HTML form (POST).
2. Server validates input and business rules.
3. Server writes to Supabase table (`sales`, `activities`, `targets`, etc.).
4. RLS policy enforces ownership/admin override.
5. Server redirects to canonical GET page with flash status message.

## Aggregation / Leaderboard Flow
- Source of truth: `sales`, `activities`, `targets`.
- Aggregated read model: `monthly_metrics` for fast leaderboard and dashboard reads.
- Refresh cadence: scheduled server job updates monthly aggregates (or transactional update triggers if required).

## Security Flow
- RLS is always enabled for all protected tables.
- Agent requests can only return rows tied to their `agent_id`.
- Admin requests can return all rows.
- Server never trusts client-provided role; role is read from database-authenticated context.

---

## 5) Usability Guardrails

- Keep primary actions visible at top-right of each page (`Add Sale`, `Add Activity`, `Export`).
- Keep filters persistent in query string for shareable/reload-safe views.
- Use consistent table columns and terminology across agent/admin views.
- Prefer fewer, clearer pages over nested route trees.
- Do not combine admin and agent data on the same route.
