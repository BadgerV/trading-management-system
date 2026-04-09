import { supabase } from './supabase.js';

export async function getAgentIdByUserId(userId) {
  const { data, error } = await supabase.from('agents').select('id, team_name').eq('user_id', userId).single();
  if (error) throw error;
  return data;
}

export async function getMonthlyMetrics({ agentId, month }) {
  let query = supabase.from('monthly_metrics').select('*').eq('period_month', month);
  if (agentId) query = query.eq('agent_id', agentId);
  const { data, error } = await query.order('won_revenue', { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}

export async function getSales({ agentId, month, limit = 50 }) {
  let query = supabase.from('sales').select('id, customer_name, amount, status, occurred_at, closed_at, agent_id').order('occurred_at', { ascending: false }).limit(limit);
  if (agentId) query = query.eq('agent_id', agentId);
  if (month) {
    query = query.gte('occurred_at', month).lt('occurred_at', nextMonth(month));
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActivities({ agentId, month, limit = 50 }) {
  let query = supabase.from('activities').select('id, activity_type, activity_date, notes, agent_id').order('activity_date', { ascending: false }).limit(limit);
  if (agentId) query = query.eq('agent_id', agentId);
  if (month) {
    query = query.gte('activity_date', month).lt('activity_date', nextMonth(month));
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTargets({ agentId, month }) {
  let query = supabase.from('targets').select('id, metric, period_month, target_value, agent_id').eq('period_month', month);
  if (agentId) query = query.eq('agent_id', agentId);
  const { data, error } = await query.order('metric', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertSale(payload) {
  const createdBy = await currentUserId();
  const row = { ...payload, created_by: createdBy };
  const { error } = await supabase.from('sales').insert(row);
  if (error) throw error;
}

export async function insertActivity(payload) {
  const createdBy = await currentUserId();
  const row = { ...payload, created_by: createdBy };
  const { error } = await supabase.from('activities').insert(row);
  if (error) throw error;
}

export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, user_id, team_name, territory, employee_code, users!agents_user_fk(full_name, email, status)')
    .order('team_name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertTarget(row) {
  const createdBy = await currentUserId();
  const safeRow = { ...row, created_by: createdBy };
  const { error } = await supabase.from('targets').upsert(safeRow, { onConflict: 'agent_id,metric,period_month' });
  if (error) throw error;
}

function nextMonth(monthStart) {
  const [year, month] = monthStart.split('-').map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;
  return `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-01`;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) throw new Error('No authenticated user found.');
  return data.user.id;
}
