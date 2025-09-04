import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
// NOTA: Em produção, essas variáveis devem estar em um arquivo .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

