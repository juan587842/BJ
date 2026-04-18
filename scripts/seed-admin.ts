// Script para criar usuário admin inicial
// Execute: npx tsx scripts/seed-admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@bancadojonas.com',
    password: 'admin123',
  });

  if (error) {
    console.error('Erro ao criar admin:', error.message);
    return;
  }

  console.log('Admin criado com sucesso!');
  console.log('Email:', data.user?.email);
  console.log('Senha: admin123');
  console.log('\nAltere a senha após o primeiro login!');
}

seedAdmin();
