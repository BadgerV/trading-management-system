import { requireRole, signOut } from '../modules/auth.js';
import { buildSidebar, renderTable, asCurrency, asDate, asPct, setFlash, downloadCsv, renderKeyValuePanel } from '../modules/ui.js';
import { getMonthlyMetrics, getSales, getActivities, getTargets, getAgents, upsertTarget } from '../modules/data.js';
import { supabase } from '../modules/supabase.js';

const month = getMonthFromQuery();

(async () => {
  try {
    const session = await requireRole('admin');
    if (!session) return;

    initShell(session.appUser, 'admin');
    await renderPage(session.appUser);
  } catch (err) {
    setFlash('page-flash', err.message || 'Unable to load page.', 'error');
  }
})();

function initShell(user, role) {
  const sidebar = document.getElementById('sidebar');
  const headerUser = document.getElementById('header-user');
  const signout = document.getElementById('signout-btn');

  if (sidebar) sidebar.innerHTML = buildSidebar(role, window.location.pathname);
  if (headerUser) headerUser.textContent = `${user.full_name} (${user.role})`;
  if (signout) signout.addEventListener('click', signOut);
}

async function renderPage(appUser) {
  const page = document.body.dataset.page;

  if (page === 'admin-dashboard') return renderDashboard(month);
  if (page === 'admin-agents') return renderAgents();
  if (page === 'admin-targets') return renderTargets(month);
  if (page === 'admin-sales') return renderSales(month);
  if (page === 'admin-activities') return renderActivities(month);
  if (page === 'admin-leaderboard') return renderLeaderboard(month);
  if (page === 'admin-reports') return renderReports();
  if (page === 'admin-approvals') return renderApprovals();
  if (page === 'admin-audit-log') return renderAuditLog();
  if (page === 'admin-settings') return renderSettings();
}

async function renderDashboard(periodMonth) {
  const [metrics] = await Promise.all([getMonthlyMetrics({ month: periodMonth })]);
  const totals = metrics.reduce((acc, row) => {
    acc.revenue += Number(row.won_revenue || 0);
    acc.deals += Number(row.won_deals_count || 0);
    acc.activities += Number(row.activities_count || 0);
    return acc;
  }, { revenue: 0, deals: 0, activities: 0 });
  const avgAttainment = metrics.length ? metrics.reduce((a, r) => a + Number(r.quota_attainment_pct || 0), 0) / metrics.length : 0;

  document.getElementById('kpi-revenue').textContent = asCurrency(totals.revenue);
  document.getElementById('kpi-deals').textContent = totals.deals;
  document.getElementById('kpi-activities').textContent = totals.activities;
  document.getElementById('kpi-attainment').textContent = asPct(avgAttainment);

  renderTable('data-table', ['Rank', 'Agent ID', 'Revenue', 'Attainment'], metrics.map((r, i) => [i + 1, r.agent_id, asCurrency(r.won_revenue), asPct(r.quota_attainment_pct)]));
}

async function renderAgents() {
  const agents = await getAgents();
  renderTable('data-table', ['Name', 'Email', 'Team', 'Territory', 'Status'], agents.map((a) => [a.users?.full_name, a.users?.email, a.team_name, a.territory, a.users?.status]));
}

async function renderTargets(periodMonth) {
  const targets = await getTargets({ month: periodMonth });
  renderTable('data-table', ['Agent ID', 'Metric', 'Month', 'Target'], targets.map((t) => [t.agent_id, t.metric, asDate(t.period_month), t.target_value]));

  const form = document.getElementById('target-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await upsertTarget({
          agent_id: form.agent_id.value,
          metric: form.metric.value,
          period_month: form.period_month.value,
          target_value: Number(form.target_value.value)
        });
        window.location.reload();
      } catch (err) {
        setFlash('page-flash', err.message || 'Could not save target.', 'error');
      }
    });
  }
}

async function renderSales(periodMonth) {
  const sales = await getSales({ month: periodMonth });
  renderTable(
    'data-table',
    ['Agent ID', 'Date', 'Customer', 'Amount', 'Status'],
    sales.map((s) => [s.agent_id, asDate(s.occurred_at), s.customer_name, asCurrency(s.amount), s.status]),
    { emptyMessage: 'No sales records found for this month.' }
  );
}

async function renderActivities(periodMonth) {
  const activities = await getActivities({ month: periodMonth });
  renderTable(
    'data-table',
    ['Agent ID', 'Date', 'Type', 'Notes'],
    activities.map((a) => [a.agent_id, asDate(a.activity_date), a.activity_type, a.notes]),
    { emptyMessage: 'No activities logged for this month.' }
  );
}

async function renderLeaderboard(periodMonth) {
  const rows = await getMonthlyMetrics({ month: periodMonth });
  renderTable('data-table', ['Rank', 'Agent ID', 'Won Revenue', 'Deals', 'Attainment'], rows.map((r, i) => [i + 1, r.agent_id, asCurrency(r.won_revenue), r.won_deals_count, asPct(r.quota_attainment_pct)]));
}

function renderReports() {
  renderTable('data-table', ['Report', 'Month', 'Status'], [
    ['Team performance', month.slice(0, 7), 'Ready'],
    ['Activity compliance', month.slice(0, 7), 'Ready']
  ]);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = '<h2>Exports</h2><p class=\"muted\">Download operational exports for the selected month.</p>';

  const salesBtn = document.createElement('button');
  salesBtn.className = 'primary';
  salesBtn.textContent = 'Export sales CSV';
  salesBtn.addEventListener('click', async () => {
    const sales = await getSales({ month, limit: 500 });
    downloadCsv(
      `team-sales-${month.slice(0, 7)}.csv`,
      ['agent_id', 'occurred_at', 'customer_name', 'amount', 'status'],
      sales.map((s) => [s.agent_id, s.occurred_at, s.customer_name, s.amount, s.status])
    );
  });

  const activitiesBtn = document.createElement('button');
  activitiesBtn.className = 'secondary';
  activitiesBtn.textContent = 'Export activities CSV';
  activitiesBtn.addEventListener('click', async () => {
    const activities = await getActivities({ month, limit: 500 });
    downloadCsv(
      `team-activities-${month.slice(0, 7)}.csv`,
      ['agent_id', 'activity_date', 'activity_type', 'notes'],
      activities.map((a) => [a.agent_id, a.activity_date, a.activity_type, a.notes])
    );
  });

  const row = document.createElement('div');
  row.className = 'form-actions';
  row.append(salesBtn, activitiesBtn);
  panel.appendChild(row);
  document.querySelector('.page')?.appendChild(panel);
}

async function renderApprovals() {
  const { data, error } = await supabase
    .from('sales')
    .select('id, agent_id, customer_name, occurred_at, status')
    .eq('status', 'pending')
    .order('occurred_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  renderTable(
    'data-table',
    ['Sale ID', 'Agent ID', 'Customer', 'Occurred', 'Status'],
    (data || []).map((s) => [s.id, s.agent_id, s.customer_name, asDate(s.occurred_at), s.status]),
    { emptyMessage: 'No pending sales require approval right now.' }
  );
}

async function renderAuditLog() {
  const [sales, activities, targets] = await Promise.all([
    supabase.from('sales').select('id, updated_at').order('updated_at', { ascending: false }).limit(20),
    supabase.from('activities').select('id, updated_at').order('updated_at', { ascending: false }).limit(20),
    supabase.from('targets').select('id, updated_at').order('updated_at', { ascending: false }).limit(20)
  ]);

  const rows = [
    ...(sales.data || []).map((r) => ({ when: r.updated_at, table: 'sales', id: r.id })),
    ...(activities.data || []).map((r) => ({ when: r.updated_at, table: 'activities', id: r.id })),
    ...(targets.data || []).map((r) => ({ when: r.updated_at, table: 'targets', id: r.id }))
  ]
    .sort((a, b) => new Date(b.when) - new Date(a.when))
    .slice(0, 50)
    .map((r) => [asDate(r.when), 'System', 'UPDATE', r.table, r.id]);

  renderTable('data-table', ['When', 'Actor', 'Action', 'Table', 'Record'], rows, {
    emptyMessage: 'No audit events available yet.'
  });
}

function renderSettings() {
  renderKeyValuePanel('settings-content', 'Current system settings', [
    ['Lock period on day', '3'],
    ['Allow backdated entries', 'No'],
    ['Default report range', '3 months']
  ]);
}

function getMonthFromQuery() {
  const monthParam = new URLSearchParams(window.location.search).get('month');
  if (monthParam && /^\d{4}-\d{2}(-01)?$/.test(monthParam)) {
    return monthParam.length === 7 ? `${monthParam}-01` : monthParam;
  }
  return `${new Date().toISOString().slice(0, 7)}-01`;
}
