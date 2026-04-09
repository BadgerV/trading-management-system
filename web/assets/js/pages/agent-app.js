import { requireRole, signOut } from '../modules/auth.js';
import { buildSidebar, renderTable, asCurrency, asDate, asPct, setFlash, downloadCsv, renderKeyValuePanel } from '../modules/ui.js';
import { getAgentIdByUserId, getMonthlyMetrics, getSales, getActivities, getTargets, insertSale, insertActivity } from '../modules/data.js';

const month = getMonthFromQuery();

(async () => {
  try {
    const session = await requireRole('agent');
    if (!session) return;

    initShell(session.appUser, 'agent');
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
  const agent = await getAgentIdByUserId(appUser.id);

  if (page === 'agent-dashboard') return renderDashboard(agent.id, month);
  if (page === 'agent-sales') return renderSales(agent.id, month);
  if (page === 'agent-activities') return renderActivities(agent.id, month);
  if (page === 'agent-targets') return renderTargets(agent.id, month);
  if (page === 'agent-leaderboard') return renderLeaderboard(month);
  if (page === 'agent-reports') return renderReports();
  if (page === 'agent-profile') return renderProfile(appUser);
}

async function renderDashboard(agentId, periodMonth) {
  const [metrics, sales, activities] = await Promise.all([
    getMonthlyMetrics({ agentId, month: periodMonth }),
    getSales({ agentId, month: periodMonth, limit: 5 }),
    getActivities({ agentId, month: periodMonth, limit: 5 })
  ]);

  const metric = metrics[0] || { won_revenue: 0, won_deals_count: 0, activities_count: 0, quota_attainment_pct: 0 };
  document.getElementById('kpi-revenue').textContent = asCurrency(metric.won_revenue);
  document.getElementById('kpi-deals').textContent = metric.won_deals_count;
  document.getElementById('kpi-activities').textContent = metric.activities_count;
  document.getElementById('kpi-attainment').textContent = asPct(metric.quota_attainment_pct);

  renderTable('sales-table', ['Date', 'Customer', 'Amount', 'Status'], sales.map((s) => [asDate(s.occurred_at), s.customer_name, asCurrency(s.amount), s.status]));
  renderTable('activities-table', ['Date', 'Type', 'Notes'], activities.map((a) => [asDate(a.activity_date), a.activity_type, a.notes]));

  bindQuickForms(agentId);
}

async function renderSales(agentId, periodMonth) {
  const sales = await getSales({ agentId, month: periodMonth });
  renderTable(
    'data-table',
    ['Date', 'Customer', 'Amount', 'Status', 'Closed'],
    sales.map((s) => [asDate(s.occurred_at), s.customer_name, asCurrency(s.amount), s.status, asDate(s.closed_at)]),
    { emptyMessage: 'No sales recorded for this month yet.' }
  );
}

async function renderActivities(agentId, periodMonth) {
  const rows = await getActivities({ agentId, month: periodMonth });
  renderTable(
    'data-table',
    ['Date', 'Type', 'Notes'],
    rows.map((a) => [asDate(a.activity_date), a.activity_type, a.notes]),
    { emptyMessage: 'No activity logs found for this month.' }
  );
}

async function renderTargets(agentId, periodMonth) {
  const [targets, metrics] = await Promise.all([
    getTargets({ agentId, month: periodMonth }),
    getMonthlyMetrics({ agentId, month: periodMonth })
  ]);
  const metric = metrics[0] || {};

  renderTable('data-table', ['Metric', 'Target', 'Actual'], targets.map((t) => {
    const actual = t.metric === 'revenue' ? asCurrency(metric.won_revenue) : t.metric === 'closed_deals' ? metric.won_deals_count : metric.activities_count;
    const target = t.metric === 'revenue' ? asCurrency(t.target_value) : t.target_value;
    return [t.metric, target, actual];
  }), { emptyMessage: 'No targets assigned for this month.' });
}

async function renderLeaderboard(periodMonth) {
  const rows = await getMonthlyMetrics({ month: periodMonth });
  renderTable(
    'data-table',
    ['Rank', 'Agent ID', 'Won Revenue', 'Attainment'],
    rows.map((r, i) => [i + 1, r.agent_id, asCurrency(r.won_revenue), asPct(r.quota_attainment_pct)]),
    { emptyMessage: 'Leaderboard has no data for this month.' }
  );
}

async function renderReports() {
  const [sales, activities] = await Promise.all([
    getSales({ month, limit: 200 }),
    getActivities({ month, limit: 200 })
  ]);

  const rows = [
    ['Performance summary', month.slice(0, 7), 'Ready'],
    ['Activity log', month.slice(0, 7), 'Ready']
  ];
  renderTable('data-table', ['Report', 'Month', 'Status'], rows);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = '<h2>Exports</h2><p class=\"muted\">Download your current month sales or activities.</p>';

  const salesBtn = document.createElement('button');
  salesBtn.className = 'primary';
  salesBtn.textContent = 'Download sales CSV';
  salesBtn.addEventListener('click', () => {
    downloadCsv(
      `my-sales-${month.slice(0, 7)}.csv`,
      ['occurred_at', 'customer_name', 'amount', 'status', 'closed_at'],
      sales.map((s) => [s.occurred_at, s.customer_name, s.amount, s.status, s.closed_at])
    );
  });

  const activityBtn = document.createElement('button');
  activityBtn.className = 'secondary';
  activityBtn.textContent = 'Download activities CSV';
  activityBtn.addEventListener('click', () => {
    downloadCsv(
      `my-activities-${month.slice(0, 7)}.csv`,
      ['activity_date', 'activity_type', 'notes'],
      activities.map((a) => [a.activity_date, a.activity_type, a.notes])
    );
  });

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  actions.append(salesBtn, activityBtn);
  panel.appendChild(actions);
  document.querySelector('.page')?.appendChild(panel);
}

function renderProfile(appUser) {
  renderKeyValuePanel('profile-content', 'Profile details', [
    ['Name', appUser.full_name],
    ['Email', appUser.email],
    ['Role', appUser.role]
  ]);
}

function bindQuickForms(agentId) {
  const saleForm = document.getElementById('quick-sale-form');
  if (saleForm) {
    saleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await insertSale({
          agent_id: agentId,
          customer_name: saleForm.customer_name.value,
          amount: Number(saleForm.amount.value),
          status: saleForm.status.value,
          occurred_at: saleForm.occurred_at.value,
          closed_at: saleForm.closed_at.value || null
        });
        window.location.reload();
      } catch (err) {
        setFlash('page-flash', err.message || 'Could not save sale.', 'error');
      }
    });
  }

  const activityForm = document.getElementById('quick-activity-form');
  if (activityForm) {
    activityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await insertActivity({
          agent_id: agentId,
          activity_type: activityForm.activity_type.value,
          activity_date: activityForm.activity_date.value,
          notes: activityForm.notes.value
        });
        window.location.reload();
      } catch (err) {
        setFlash('page-flash', err.message || 'Could not save activity.', 'error');
      }
    });
  }
}

function getMonthFromQuery() {
  const monthParam = new URLSearchParams(window.location.search).get('month');
  if (monthParam && /^\d{4}-\d{2}(-01)?$/.test(monthParam)) {
    return monthParam.length === 7 ? `${monthParam}-01` : monthParam;
  }
  return `${new Date().toISOString().slice(0, 7)}-01`;
}
