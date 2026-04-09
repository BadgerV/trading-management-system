import { supabase } from './supabase.js';

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/web/index.html';
}

export async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}/web/index.html`;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getAppUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function requireRole(expectedRole) {
  const authUser = await getSessionUser();
  if (!authUser) {
    window.location.href = '/web/index.html';
    return null;
  }

  let appUser;
  try {
    appUser = await getAppUser(authUser.id);
  } catch {
    window.location.href = '/web/access-denied.html';
    return null;
  }

  if (!appUser || appUser.status !== 'active') {
    window.location.href = '/web/access-denied.html';
    return null;
  }

  if (expectedRole && appUser.role !== expectedRole) {
    window.location.href = '/web/access-denied.html';
    return null;
  }

  return { authUser, appUser };
}
