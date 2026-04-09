import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { config } from './config.js';

export const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn('Supabase config missing. Set window.__APP_CONFIG__ in HTML.');
}

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});
