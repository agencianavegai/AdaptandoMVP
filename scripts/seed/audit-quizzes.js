const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function audit() {
  console.log('🔍 AUDITORIA DE INTEGRIDADE - Mundos 3, 4 e 5\n');

  // 1. Buscar mundos 3 a 9
  const { data: mundos } = await supabase
    .from('mundo_ceus')
    .select('id, ordem, nome_tema')
    .in('ordem', [3, 4, 5, 6, 7, 8, 9])
    .order('ordem');

  for (const mundo of mundos) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🌍 MUNDO ${mundo.ordem}: ${mundo.nome_tema}`);
    console.log('='.repeat(50));

    const { data: pilulas } = await supabase
      .from('pilulas')
      .select('id, ordem, titulo')
      .eq('mundo_id', mundo.id)
      .order('ordem');

    let totalQuizzesMundo = 0;

    for (const pilula of pilulas) {
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('id, pergunta')
        .eq('pilula_id', pilula.id);

      const count = quizzes ? quizzes.length : 0;
      totalQuizzesMundo += count;
      const status = count === 5 ? '✅' : '❌';
      console.log(`  Fase ${pilula.ordem}: ${status} ${count} quizzes → "${pilula.titulo}"`);

      if (count !== 5) {
        console.log(`    ⚠️  ALERTA: Esperado 5 quizzes, encontrado ${count}!`);
      }
    }

    console.log(`  📊 Total do Mundo: ${totalQuizzesMundo} quizzes (esperado: ${pilulas.length * 5})`);
  }

  // 2. Verificar quizzes órfãos (dados mortos globais)
  console.log(`\n${'='.repeat(50)}`);
  console.log('🧹 VERIFICANDO QUIZZES ÓRFÃOS (dados mortos)...');
  console.log('='.repeat(50));

  const { data: allQuizzes } = await supabase
    .from('quizzes')
    .select('id, pilula_id, pergunta');

  const { data: allPilulas } = await supabase
    .from('pilulas')
    .select('id');

  const pilulaIds = new Set(allPilulas.map(p => p.id));
  const orphans = allQuizzes.filter(q => !pilulaIds.has(q.pilula_id));

  if (orphans.length === 0) {
    console.log('✅ Nenhum quiz órfão encontrado. Base 100% limpa!');
  } else {
    console.log(`❌ ${orphans.length} QUIZZES ÓRFÃOS encontrados:`);
    orphans.forEach(o => console.log(`   - ID: ${o.id} | Pergunta: "${o.pergunta?.substring(0, 60)}..."`));
  }

  // 3. Verificar duplicatas
  console.log(`\n${'='.repeat(50)}`);
  console.log('🔁 VERIFICANDO QUIZZES DUPLICADOS...');
  console.log('='.repeat(50));

  const seen = new Map();
  let dupeCount = 0;
  for (const q of allQuizzes) {
    const key = `${q.pilula_id}::${q.pergunta}`;
    if (seen.has(key)) {
      dupeCount++;
      console.log(`  ❌ DUPLICATA: "${q.pergunta?.substring(0, 70)}..."`);
    }
    seen.set(key, true);
  }

  if (dupeCount === 0) {
    console.log('✅ Nenhuma duplicata encontrada. Conteúdo 100% único!');
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('📋 RESUMO FINAL');
  console.log(`   Total de quizzes no banco: ${allQuizzes.length}`);
  console.log(`   Quizzes órfãos: ${orphans.length}`);
  console.log(`   Duplicatas: ${dupeCount}`);
  console.log('='.repeat(50));

  process.exit(0);
}

audit().catch(err => { console.error(err); process.exit(1); });
