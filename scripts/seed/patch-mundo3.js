const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { resolve } = require('path');
const fs = require('fs');

dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function patchFase(ordemFase, jsonPath) {
  console.log(`\n⏳ Iniciando PATCH da Fase ${ordemFase} do Mundo 3...`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  let fileContent = fs.readFileSync(jsonPath, 'utf-8');
  fileContent = fileContent.replace(/```json/g, '').replace(/```/g, '');
  
  const data = JSON.parse(fileContent);

  const { data: mundo, error: errMundo } = await supabase
    .from('mundo_ceus')
    .select('id')
    .eq('ordem', 3)
    .single();

  if (errMundo || !mundo) {
    console.error('❌ Mundo 3 não encontrado:', errMundo?.message);
    process.exit(1);
  }

  const mundoId = mundo.id;

  const { data: pilula, error: errPilula } = await supabase
    .from('pilulas')
    .select('id, titulo')
    .eq('mundo_id', mundoId)
    .eq('ordem', ordemFase)
    .single();

  if (errPilula || !pilula) {
    console.error(`❌ Pílula da Fase ${ordemFase} não encontrada:`, errPilula?.message);
    process.exit(1);
  }

  const pilulaId = pilula.id;
  console.log(`💊 Pílula alvo encontrada: ID ${pilulaId} (Título atual: ${pilula.titulo})`);

  const { error: errUpdatePilula } = await supabase
    .from('pilulas')
    .update({ 
      titulo: data.pilula.titulo,
      conteudo: data.pilula.conteudo 
    })
    .eq('id', pilulaId);

  if (errUpdatePilula) {
    console.error('❌ Erro atualizando pílula:', errUpdatePilula.message);
    process.exit(1);
  }
  console.log(`✅ Pílula atualizada com sucesso para: "${data.pilula.titulo}"`);

  const { error: errDeleteQuizzes } = await supabase
    .from('quizzes')
    .delete()
    .eq('pilula_id', pilulaId);

  if (errDeleteQuizzes) {
    console.error('❌ Erro deletando quizzes antigos:', errDeleteQuizzes.message);
    process.exit(1);
  }
  console.log(`🗑️ Quizzes antigos deletados.`);

  const novosQuizzes = data.quizzes.map((q, i) => ({
    pergunta: q.pergunta,
    alternativas: q.alternativas.map((texto, idx) => ({
      texto,
      correta: idx === q.correta_idx,
    })),
    explicacao: q.explicacao || null,
    ordem: i + 1,
    dificuldade: ['facil', 'medio', 'dificil'].includes(q.dificuldade)
      ? q.dificuldade
      : 'medio',
    pilula_id: pilulaId
  }));

  const { error: errInsertQuizzes } = await supabase
    .from('quizzes')
    .insert(novosQuizzes);

  if (errInsertQuizzes) {
    console.error('❌ Erro inserindo quizzes:', errInsertQuizzes.message);
    process.exit(1);
  }

  console.log(`✅ ${novosQuizzes.length} Quizzes novos inseridos com sucesso!`);
  console.log(`🎉 PATCH da Fase ${ordemFase} concluído!`);
  process.exit(0);
}

const targetPath = resolve(__dirname, '../../RAG MANUAL/Pedagogia-mundo3.md');
patchFase(1, targetPath).catch(err => {
  console.error(err);
  process.exit(1);
});
