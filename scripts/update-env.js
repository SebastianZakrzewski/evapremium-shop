const fs = require('fs');

// Read the .env file
const envPath = '.env';
let content = fs.readFileSync(envPath, 'utf8');

// Update SUPABASE_KEY
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzQ5NTMsImV4cCI6MjA3MjI1MDk1M30.wX5DkBlymfL5wDdmsWqSVpDSEdjk1qf1h7k6pnUJMf8';

content = content.replace(
  'SUPABASE_KEY="your-supabase-anon-key-here"',
  `SUPABASE_KEY="${newKey}"`
);

// Write back to file
fs.writeFileSync(envPath, content);

console.log('✅ SUPABASE_KEY zaktualizowany!');
console.log('🔑 Nowy klucz:', newKey.substring(0, 20) + '...');
