const SUPABASE_URL = 'https://bjsblfofrlacnlrqfcal.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqc2JsZm9mcmxhY25scnFmY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDAyMzEsImV4cCI6MjEwNjI3NjIzMX0.uuiLDjsHgc5xRWhMkXD8xEYzymMvH_rL52nhFA6jj54';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogado = null;