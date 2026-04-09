import { requestPasswordReset } from '../modules/auth.js';
import { setFlash, clearFlash } from '../modules/ui.js';
import { hasSupabaseConfig } from '../modules/supabase.js';

const form = document.getElementById('forgot-form');
if (form) {
  if (!hasSupabaseConfig) {
    form.querySelector('button[type=\"submit\"]').disabled = true;
    setFlash('flash', 'Supabase config is missing. Add supabase_url and supabase_anon_key to localStorage.', 'warn');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFlash('flash');
    const email = form.email.value.trim();
    const { error } = await requestPasswordReset(email);

    if (error) {
      setFlash('flash', error.message, 'error');
      return;
    }

    setFlash('flash', 'If that email exists, a reset link is on the way.', 'success');
  });
}
