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

async function patchBulk(jsonPath, startFase = 2) {
  console.log(`\n⏳ Iniciando PATCH em LOTE a partir da Fase ${startFase}...`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  let fileContent = fs.readFileSync(jsonPath, 'utf-8');
  fileContent = fileContent.replace(/```json/g, '').replace(/```/g, '');
  
  const data = JSON.parse(fileContent);

  if (!data.versoes || !Array.isArray(data.versoes)) {
    console.error('❌ JSON não contém a propriedade "versoes" como array.');
    process.exit(1);
  }

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

  let currentFase = startFase;

  for (const faseData of data.versoes) {
    console.log(`\n${'-'.repeat(40)}`);
    console.log(`🔄 Processando Fase ${currentFase}...`);

    const { data: pilula, error: errPilula } = await supabase
      .from('pilulas')
      .select('id, titulo')
      .eq('mundo_id', mundoId)
      .eq('ordem', currentFase)
      .single();

    if (errPilula || !pilula) {
      console.error(`❌ Pílula da Fase ${currentFase} não encontrada. Criando Nova se não existir? (Abortando proteção de integridade).`, errPilula?.message);
      // Pular caso não exista fase 6 por algum motivo
      currentFase++;
      continue;
    }

    const pilulaId = pilula.id;
    console.log(`💊 Pílula encontrada: ID ${pilulaId}`);

    const { error: errUpdatePilula } = await supabase
      .from('pilulas')
      .update({ 
        titulo: faseData.pilula.titulo,
        conteudo: faseData.pilula.conteudo 
      })
      .eq('id', pilulaId);

    if (errUpdatePilula) {
      console.error(`❌ Erro atualizando pílula ${currentFase}:`, errUpdatePilula.message);
      continue;
    }
    console.log(`✅ Pílula atualizada -> "${faseData.pilula.titulo}"`);

    // Wipe old quizzes
    const { error: errDeleteQuizzes } = await supabase
      .from('quizzes')
      .delete()
      .eq('pilula_id', pilulaId);

    if (errDeleteQuizzes) {
      console.error(`❌ Erro deletando quizzes antigos da fase ${currentFase}:`, errDeleteQuizzes.message);
      continue;
    }

    // Insert new quizzes
    const novosQuizzes = faseData.quizzes.map((q, i) => ({
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
      console.error(`❌ Erro inserindo quizzes da fase ${currentFase}:`, errInsertQuizzes.message);
      continue;
    }

    console.log(`✅ ${novosQuizzes.length} Quizzes inseridos.`);
    console.log(`🎉 PATCH da Fase ${currentFase} concluído com sucesso!`);
    
    currentFase++;
  }

  console.log(`\n======================================================`);
  console.log(`🚀 PATCH EM LOTE FINALIZADO (Fases atualizadas: ${startFase} até ${currentFase - 1}).`);
  process.exit(0);
}

const targetPath = resolve(__dirname, '../../RAG MANUAL/Pedagogia-mundo3.md');
patchBulk(targetPath, 2).catch(err => {
  console.error(err);
  process.exit(1);
});
