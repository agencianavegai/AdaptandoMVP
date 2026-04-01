import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface PilulaPatch {
  titulo: string;
  conteudo: string;
}

interface QuizPatch {
  pergunta: string;
  alternativas: string[];
  explicacao: string;
  correta_idx: number;
  dificuldade: string;
}

interface Mundo3FaseData {
  pilula: PilulaPatch;
  quizzes: QuizPatch[];
}

async function patchFase(ordemFase: number, jsonPath: string) {
  console.log(`\n⏳ Iniciando PATCH da Fase ${ordemFase} do Mundo 3...`);

  // 1. Ler o JSON de Origem
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  let fileContent = fs.readFileSync(jsonPath, 'utf-8');
  fileContent = fileContent.replace(/```json/g, '').replace(/```/g, '');
  
  const data: Mundo3FaseData = JSON.parse(fileContent);

  // 2. Buscar o Mundo 3
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

  // 3. Buscar a Pílula específica (Fase = ordem)
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

  // 4. Update na Pílula
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

  // 5. Deletar (Wipe) Quizzes antigos dessa Pílula
  const { error: errDeleteQuizzes } = await supabase
    .from('quizzes')
    .delete()
    .eq('pilula_id', pilulaId);

  if (errDeleteQuizzes) {
    console.error('❌ Erro deletando quizzes antigos:', errDeleteQuizzes.message);
    process.exit(1);
  }
  console.log(`🗑️ Quizzes antigos deletados.`);

  // 6. Inserir Novos Quizzes
  const novosQuizzes = data.quizzes.map((q) => ({
    pergunta: q.pergunta,
    alternativas: q.alternativas,
    explicacao: q.explicacao,
    correta_idx: q.correta_idx,
    dificuldade: q.dificuldade,
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

// Rodar para a Fase 1 usando o arquivo recém-criado
const targetPath = resolve(__dirname, '../../RAG MANUAL/Pedagogia-mundo3.md');
patchFase(1, targetPath).catch(err => {
  console.error(err);
  process.exit(1);
});
