export function setFlash(targetId, message, kind = 'success') {
  const node = document.getElementById(targetId);
  if (!node) return;
  node.className = `flash ${kind}`;
  node.textContent = message;
  node.classList.remove('hidden');
}

export function clearFlash(targetId) {
  const node = document.getElementById(targetId);
  if (!node) return;
  node.textContent = '';
  node.className = 'flash hidden';
}

export function asCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));
}

export function asPct(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(2)}%`;
}

export function asDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US');
}

export function renderTable(targetId, headers, rows, options = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const emptyMessage = options.emptyMessage || 'Nothing to show for the selected filters.';

  if (!rows.length) {
    target.innerHTML = `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
    return;
  }

  const head = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const body = rows
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c ?? '—')}</td>`).join('')}</tr>`)
    .join('');
  target.innerHTML = `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

export function renderKeyValuePanel(targetId, title, rows) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const content = rows
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value ?? '—')}</p>`)
    .join('');
  target.innerHTML = `<div class="panel"><h2>${escapeHtml(title)}</h2>${content}</div>`;
}

export function downloadCsv(filename, headers, rows) {
  const csvRows = [headers, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildSidebar(role, activePath) {
  const links = role === 'admin'
    ? [
        ['/web/admin/dashboard.html', 'Dashboard'],
        ['/web/admin/agents.html', 'Agents'],
        ['/web/admin/targets.html', 'Targets'],
        ['/web/admin/sales.html', 'Sales'],
        ['/web/admin/activities.html', 'Activities'],
        ['/web/admin/leaderboard.html', 'Leaderboard'],
        ['/web/admin/reports.html', 'Reports'],
        ['/web/admin/approvals.html', 'Approvals'],
        ['/web/admin/audit-log.html', 'Audit Log'],
        ['/web/admin/settings.html', 'Settings']
      ]
    : [
        ['/web/agent/dashboard.html', 'Dashboard'],
        ['/web/agent/sales.html', 'Sales'],
        ['/web/agent/activities.html', 'Activities'],
        ['/web/agent/targets.html', 'Targets'],
        ['/web/agent/leaderboard.html', 'Leaderboard'],
        ['/web/agent/reports.html', 'Reports'],
        ['/web/agent/profile.html', 'Profile']
      ];

  return `
    <h3>${role === 'admin' ? 'Admin' : 'Agent'} Menu</h3>
    <nav>
      ${links
        .map(([href, label]) => `<a href="${href}" class="${activePath.endsWith(href) ? 'active' : ''}">${label}</a>`)
        .join('')}
    </nav>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll(\"'\", '&#39;');
}

function csvCell(value) {
  const text = String(value ?? '');
  return `\"${text.replaceAll('\"', '\"\"')}\"`;
}
