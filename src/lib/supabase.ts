import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface LoginOperacional {
  id: number;
  created_at: string;
  email: string;
  senha: string;
  funcao: 'admin' | 'membro';
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase
    .from('login_operacional')
    .select('*')
    .eq('email', email)
    .eq('senha', password)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Credenciais inválidas');

  return data as LoginOperacional;
}