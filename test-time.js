const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('voluntarios').select('last_heart_lost').eq('email', 'adapomarketing@gmail.com').single();
  console.log("Raw from DB:", data.last_heart_lost);
  const safeDateStr = data.last_heart_lost.endsWith('Z') || data.last_heart_lost.includes('+') ? data.last_heart_lost : `${data.last_heart_lost}Z`;
  console.log("Safe string:", safeDateStr);
  console.log("Date parsing:", new Date(safeDateStr));
  console.log("Parsed time:", new Date(safeDateStr).getTime());
  console.log("Date.now() :", Date.now());
  console.log("Diff (sec) :", (Date.now() - new Date(safeDateStr).getTime()) / 1000);
}
run();
