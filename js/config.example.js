// ============================================
// CONFIGURAÇÃO DO SUPABASE - EXEMPLO
// ============================================
// INSTRUÇÕES: Copie este arquivo para config.js 
// e preencha com suas credenciais do Supabase

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-public-aqui';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogado = null;
