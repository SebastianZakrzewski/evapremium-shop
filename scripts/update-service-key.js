const fs = require('fs');

// Read the .env file
const envPath = '.env';
let content = fs.readFileSync(envPath, 'utf8');

// Update SUPABASE_SERVICE_ROLE_KEY
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3NDk1MywiZXhwIjoyMDcyMjUwOTUzfQ.qIW1Cg1XUQ44h9nCm0OB7jpReAULAj0RrQBwEVg36Cg';

content = content.replace(
  'SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-here"',
  `SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"`
);

// Write back to file
fs.writeFileSync(envPath, content);

console.log('✅ SUPABASE_SERVICE_ROLE_KEY zaktualizowany!');
console.log('🔑 Service key:', serviceKey.substring(0, 20) + '...');
