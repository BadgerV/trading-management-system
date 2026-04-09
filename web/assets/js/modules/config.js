export const config = {
  supabaseUrl:
    window.__APP_CONFIG__?.supabaseUrl ||
    window.localStorage.getItem('supabase_url') ||
    '',
  supabaseAnonKey:
    window.__APP_CONFIG__?.supabaseAnonKey ||
    window.localStorage.getItem('supabase_anon_key') ||
    ''
};
