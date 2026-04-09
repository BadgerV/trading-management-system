# Page Content and Layout Specification

This document defines concrete page content for a server-rendered Sales Agent Performance application.

---

## Public Pages

## 1) `/login`
**Page title:** Sign in

**Sections on the page:**
- Identity panel
- Sign-in form
- Help links

**Exact UI elements used:**
- Logo + product name text
- Email input
- Password input
- “Keep me signed in” checkbox
- Primary button
- Secondary “Sign in with SSO” button (if enabled)
- Text links for password reset and support

**Labels and text:**
- Header: “Sign in to Sales Performance”
- Email label: “Work email”
- Password label: “Password”
- Checkbox: “Keep me signed in for 7 days”
- Primary button: “Sign in”
- Link: “Forgot your password?”
- Error text: “That email or password didn’t match our records.”

**Data shown:**
- Login validation errors
- Current SSO availability status

**User actions available:**
- Submit credentials
- Start SSO login
- Open password reset

---

## 2) `/forgot-password`
**Page title:** Reset password

**Sections on the page:**
- Reset request form
- Confirmation area

**Exact UI elements used:**
- Email input
- Primary submit button
- Back link
- Inline status banner

**Labels and text:**
- Header: “Reset your password”
- Helper text: “Enter your work email and we’ll send a reset link.”
- Button: “Send reset link”
- Success text: “If that email exists, a reset link is on the way.”

**Data shown:**
- Request status

**User actions available:**
- Submit reset request
- Return to sign in

---

## 3) `/access-denied`
**Page title:** Access denied

**Sections on the page:**
- Access message
- Recovery actions

**Exact UI elements used:**
- Error icon
- Message block
- Primary and secondary buttons

**Labels and text:**
- Header: “You don’t have access to this page”
- Body: “Your account can’t open this route. Use your dashboard instead.”
- Primary button: “Go to my dashboard”
- Secondary button: “Sign out”

**Data shown:**
- User role
- Requested route path

**User actions available:**
- Navigate to allowed dashboard
- Sign out

---

## Agent Pages

## 4) `/agent/dashboard`
**Page title:** My performance

**Sections on the page:**
- Month filter bar
- KPI row
- Target progress
- Recent activity and sales tables
- Personal rank block
- Missing logs alert

**Exact UI elements used:**
- Month dropdown
- 4 KPI blocks
- Progress bars
- Two compact data tables
- Alert banner
- Action buttons

**Labels and text:**
- KPI labels: “Won revenue”, “Deals won”, “Activities logged”, “Quota attainment”
- Section title: “This month vs target”
- Table headers: “Date”, “Type”, “Notes”, “Amount”, “Status”
- Alert text: “No activity logged for today.”
- Buttons: “Log activity”, “Add sale”, “Open reports”

**Data shown:**
- Current month totals from `monthly_metrics`
- Current month targets from `targets`
- Recent rows from `sales` and `activities`
- Leaderboard rank for selected month

**User actions available:**
- Change month
- Create sale/activity
- Open reports

---

## 5) `/agent/sales`
**Page title:** My sales

**Sections on the page:**
- Filter bar
- Sales table
- Pagination footer

**Exact UI elements used:**
- Date range picker
- Status dropdown
- Search input
- Data table
- Row action menu
- “Add sale” button

**Labels and text:**
- Filters: “Month”, “Status”, “Customer”
- Empty state: “No sales match these filters.”
- Primary button: “Add sale”
- Row action: “Edit sale”

**Data shown:**
- Own sales rows: occurred date, customer, amount, status, closed date

**User actions available:**
- Filter/search
- Open new sale form
- Edit eligible sale

---

## 6) `/agent/sales/new`
**Page title:** Add sale

**Sections on the page:**
- Sale form
- Validation summary

**Exact UI elements used:**
- Text input (customer)
- Currency input (amount)
- Status select
- Date inputs
- Notes textarea
- Save/cancel buttons

**Labels and text:**
- Field labels: “Customer name”, “Deal amount”, “Deal status”, “Occurred on”, “Closed on”, “Notes”
- Primary button: “Save sale”
- Secondary button: “Cancel”
- Validation: “Closed date can’t be earlier than occurred date.”

**Data shown:**
- Input validation errors

**User actions available:**
- Create sale
- Cancel back to list

---

## 7) `/agent/sales/:id/edit`
**Page title:** Edit sale

**Sections on the page:**
- Editable form
- Change notice

**Exact UI elements used:**
- Prefilled form controls
- Locked-field indicators (if period closed)
- Save/cancel buttons

**Labels and text:**
- Banner (if locked): “This period is locked. Request a correction to make changes.”
- Primary button: “Save changes”

**Data shown:**
- Existing sale values
- Lock status

**User actions available:**
- Update allowed fields
- Cancel
- Open correction request (if locked)

---

## 8) `/agent/activities`
**Page title:** My activities

**Sections on the page:**
- Filter bar
- Activities table
- Pagination footer

**Exact UI elements used:**
- Date filter
- Type filter
- Search notes input
- Data table
- Add button

**Labels and text:**
- Filters: “Date”, “Activity type”, “Notes contains”
- Primary button: “Log activity”
- Empty state: “No activities found for this period.”

**Data shown:**
- Own activities: date, type, related sale, notes

**User actions available:**
- Filter/search
- Add activity
- Edit eligible activity

---

## 9) `/agent/activities/new`
**Page title:** Log activity

**Sections on the page:**
- Activity form

**Exact UI elements used:**
- Activity type select
- Date input
- Related sale select (optional)
- Notes textarea
- Save/cancel buttons

**Labels and text:**
- Field labels: “Activity type”, “Activity date”, “Related sale (optional)”, “What happened?”
- Primary button: “Save activity”

**Data shown:**
- Validation errors

**User actions available:**
- Create activity
- Cancel

---

## 10) `/agent/activities/:id/edit`
**Page title:** Edit activity

**Sections on the page:**
- Editable activity form

**Exact UI elements used:**
- Prefilled inputs
- Save/cancel buttons

**Labels and text:**
- Primary button: “Save changes”
- Locked notice: “This entry is in a locked period.”

**Data shown:**
- Existing activity data

**User actions available:**
- Update allowed fields
- Cancel
- Request correction (locked period)

---

## 11) `/agent/targets`
**Page title:** My targets

**Sections on the page:**
- Month range filter
- Target vs actual table
- Variance summary

**Exact UI elements used:**
- Month range controls
- Data table
- Badge status indicators
- Export button

**Labels and text:**
- Table headers: “Metric”, “Target”, “Actual”, “Attainment”, “Variance”
- Status badges: “On track”, “At risk”, “Below target”
- Button: “Export my targets”

**Data shown:**
- Own targets and computed actuals per month

**User actions available:**
- Change period range
- Export report

---

## 12) `/agent/leaderboard`
**Page title:** Leaderboard

**Sections on the page:**
- Leaderboard filters
- Ranking table

**Exact UI elements used:**
- Month filter
- Metric filter
- Team filter (if allowed)
- Rank table

**Labels and text:**
- Filters: “Month”, “Rank by”
- Column headers: “Rank”, “Agent”, “Value”
- Note: “You can view rankings but can’t edit scoring rules.”

**Data shown:**
- Ranked rows for selected month/metric

**User actions available:**
- Change filters
- Open own detailed report

---

## 13) `/agent/reports`
**Page title:** My reports

**Sections on the page:**
- Report generator
- Generated files list

**Exact UI elements used:**
- Report type dropdown
- Date range picker
- Generate button
- Download links table

**Labels and text:**
- Report type options: “Performance summary”, “Activity log”, “Sales history”
- Button: “Generate report”
- Table headers: “Report”, “Period”, “Created”, “Download”

**Data shown:**
- Generated report metadata and file links

**User actions available:**
- Generate report
- Download report

---

## 14) `/agent/profile`
**Page title:** My profile

**Sections on the page:**
- Account details
- Security settings

**Exact UI elements used:**
- Read-only email field
- Editable name field
- Password update form
- MFA status row + action

**Labels and text:**
- Section titles: “Account details”, “Security”
- Buttons: “Save profile”, “Change password”, “Set up MFA”

**Data shown:**
- User profile fields
- MFA enabled status

**User actions available:**
- Update name
- Change password
- Configure MFA

---

## Admin Pages

## 15) `/admin/dashboard`
**Page title:** Team performance

**Sections on the page:**
- Filter bar (month/team)
- KPI row
- At-risk agents list
- Leaderboard snapshot
- Pending approvals panel

**Exact UI elements used:**
- Month/team filters
- KPI blocks
- Two data tables
- Alert badges
- Quick action buttons

**Labels and text:**
- KPI labels: “Team won revenue”, “Deals won”, “Activities logged”, “Avg attainment”
- Section title: “Agents needing attention”
- Button: “Review approvals”

**Data shown:**
- Team aggregate metrics
- Low-attainment or missing-log agents
- Top/bottom performers
- Pending correction requests

**User actions available:**
- Filter by month/team
- Open agent records
- Open approvals queue

---

## 16) `/admin/agents`
**Page title:** Agents

**Sections on the page:**
- Search/filter bar
- Agents table

**Exact UI elements used:**
- Search input
- Team/status filters
- Data table
- Row action menu
- Primary add button

**Labels and text:**
- Filters: “Search name or email”, “Team”, “Status”
- Table headers: “Agent”, “Team”, “Territory”, “Manager”, “Status”
- Button: “Add agent”

**Data shown:**
- All agent directory data

**User actions available:**
- Create agent
- Edit agent
- Deactivate/reactivate

---

## 17) `/admin/agents/new`
**Page title:** Add agent

**Sections on the page:**
- User account details
- Agent assignment details

**Exact UI elements used:**
- Name/email inputs
- Role display (fixed to agent)
- Team/territory inputs
- Manager select
- Save/cancel buttons

**Labels and text:**
- Header note: “This creates both user and agent records.”
- Primary button: “Create agent”

**Data shown:**
- Manager options
- Validation errors

**User actions available:**
- Create agent account
- Cancel

---

## 18) `/admin/agents/:id/edit`
**Page title:** Edit agent

**Sections on the page:**
- Account status
- Profile assignment

**Exact UI elements used:**
- Editable fields
- Status toggle
- Save button
- Deactivate/reactivate action

**Labels and text:**
- Buttons: “Save changes”, “Deactivate agent”, “Reactivate agent”
- Confirmation text: “Deactivating removes access but keeps history.”

**Data shown:**
- Current agent/user details

**User actions available:**
- Update assignment fields
- Change active status

---

## 19) `/admin/targets`
**Page title:** Targets

**Sections on the page:**
- Period/team filters
- Targets table
- Bulk upload block

**Exact UI elements used:**
- Month picker
- Team filter
- Editable table rows
- CSV upload control
- Add target button

**Labels and text:**
- Button: “Add target”
- Upload label: “Upload targets CSV”
- Table headers: “Agent”, “Metric”, “Month”, “Target value”, “Updated”

**Data shown:**
- All targets for selected scope

**User actions available:**
- Create/edit targets
- Bulk import
- Filter results

---

## 20) `/admin/sales`
**Page title:** Sales records

**Sections on the page:**
- Global filters
- Sales table

**Exact UI elements used:**
- Team/agent/date/status filters
- Search input
- Data table
- Row detail drawer

**Labels and text:**
- Filters: “Team”, “Agent”, “Month”, “Status”, “Customer”
- Action: “Open details”, “Correct record”

**Data shown:**
- Organization-wide sales rows and owner

**User actions available:**
- Filter/search
- Review and correct records

---

## 21) `/admin/activities`
**Page title:** Activity records

**Sections on the page:**
- Global filters
- Activities table

**Exact UI elements used:**
- Team/agent/date/type filters
- Data table
- Export button

**Labels and text:**
- Filters: “Team”, “Agent”, “Date”, “Activity type”
- Button: “Export activities”

**Data shown:**
- Organization-wide activity logs

**User actions available:**
- Filter/search
- Edit authorized entries
- Export filtered results

---

## 22) `/admin/leaderboard`
**Page title:** Leaderboard

**Sections on the page:**
- Ranking filters
- Leaderboard table
- Metric notes

**Exact UI elements used:**
- Month filter
- Metric filter
- Team filter
- Rank table
- Export button

**Labels and text:**
- Metric label: “Rank by”
- Button: “Export leaderboard”
- Info text: “Ranking uses monthly metrics refreshed nightly.”

**Data shown:**
- Ranked agents by selected metric

**User actions available:**
- Change ranking scope
- Export snapshot

---

## 23) `/admin/reports`
**Page title:** Reports

**Sections on the page:**
- Report builder
- Recent exports

**Exact UI elements used:**
- Report type select
- Date range picker
- Team/agent filters
- Generate button
- Export history table

**Labels and text:**
- Report types: “Team performance”, “Agent performance”, “Activity compliance”, “Target vs actual”
- Button: “Run report”

**Data shown:**
- Generated report files with run metadata

**User actions available:**
- Build/export reports
- Download prior reports

---

## 24) `/admin/approvals`
**Page title:** Correction approvals

**Sections on the page:**
- Queue filters
- Pending requests list
- Request detail panel

**Exact UI elements used:**
- Status filter
- Request table
- Diff view (old vs requested values)
- Approve/reject buttons

**Labels and text:**
- Columns: “Requested by”, “Record”, “Reason”, “Submitted”, “Status”
- Buttons: “Approve change”, “Reject request”

**Data shown:**
- Correction request records and field-level diffs

**User actions available:**
- Approve or reject requests
- Leave reviewer note

---

## 25) `/admin/audit-log`
**Page title:** Audit log

**Sections on the page:**
- Filter bar
- Audit events table
- Event detail panel

**Exact UI elements used:**
- Actor/date/table/action filters
- Search input
- Data table
- JSON/detail viewer
- Export button

**Labels and text:**
- Headers: “When”, “Actor”, “Action”, “Table”, “Record”, “Details”
- Button: “Export audit log”

**Data shown:**
- Immutable change history entries

**User actions available:**
- Filter/search events
- Open event details
- Export log subset

---

## 26) `/admin/settings`
**Page title:** System settings

**Sections on the page:**
- Period controls
- Validation rules
- Reporting defaults

**Exact UI elements used:**
- Date input for lock date
- Toggle switches
- Numeric threshold inputs
- Save/reset buttons

**Labels and text:**
- Labels: “Lock period on day”, “Allow backdated entries”, “Default report range (months)”
- Save button: “Save settings”
- Reset button: “Discard changes”
- Warning text: “Changes apply to all teams immediately.”

**Data shown:**
- Current org-wide operational settings

**User actions available:**
- Update settings
- Save or discard edits
