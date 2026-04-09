import { signIn } from '../modules/auth.js';
import { clearFlash, setFlash } from '../modules/ui.js';
import { hasSupabaseConfig } from '../modules/supabase.js';

const form = document.getElementById('login-form');
if (form) {
  if (!hasSupabaseConfig) {
    form.querySelector('button[type=\"submit\"]').disabled = true;
    setFlash('flash', 'Supabase config is missing. Add supabase_url and supabase_anon_key to localStorage.', 'warn');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFlash('flash');
    const email = form.email.value.trim();
    const password = form.password.value;

    const { error } = await signIn(email, password);
    if (error) {
      setFlash('flash', 'That email or password didn’t match our records.', 'error');
      return;
    }

    window.location.href = '/web/route-after-login.html';
  });
}
