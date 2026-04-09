(function initAppConfig() {
  if (window.__APP_CONFIG__) return;

  window.__APP_CONFIG__ = {
    supabaseUrl: window.localStorage.getItem('supabase_url') || '',
    supabaseAnonKey: window.localStorage.getItem('supabase_anon_key') || ''
  };
})();
