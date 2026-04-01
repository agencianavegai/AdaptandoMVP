import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

async function runAudit() {
  console.log('🔍 Iniciando Auditoria do Mundo 3 (Pedagogia)...\n');
  
  // 1. Achar o Mundo 3
  const { data: mundo, error: errMundo } = await supabase
    .from('mundo_ceus')
    .select('id, nome_tema')
    .eq('ordem', 3)
    .single();

  if (errMundo || !mundo) {
    console.error('Erro ao achar o Mundo 3:', errMundo?.message);
    return;
  }
  
  console.log(`🌍 MUNDO: ${mundo.nome_tema} (ID: ${mundo.id})`);

  // 2. Buscar Pílulas
  const { data: pilulas, error: errPilulas } = await supabase
    .from('pilulas')
    .select('id, titulo, conteudo, ordem')
    .eq('mundo_id', mundo.id)
    .order('ordem', { ascending: true });

  if (errPilulas) {
    console.error('Erro ao buscar pílulas:', errPilulas.message);
    return;
  }

  console.log(`💊 PÍLULAS ENCONTRADAS: ${pilulas?.length}`);
  
  if (pilulas && pilulas.length > 0) {
    // Pegar o conteúdo da Fase 1
    const amostraConteudo1 = pilulas[0].conteudo.slice(0, 100).replace(/\n/g, ' ');
    // Pegar o conteúdo da Fase 2
    const amostraConteudo2 = pilulas[1]?.conteudo.slice(0, 100).replace(/\n/g, ' ');
    
    console.log(`\nFase 1: "${pilulas[0].titulo}"\nConteúdo inicia com: "${amostraConteudo1}..."`);
    console.log(`Fase 2: "${pilulas[1]?.titulo}"\nConteúdo inicia com: "${amostraConteudo2}..."`);
    
    // Comparar
    if (amostraConteudo1 === amostraConteudo2) {
      console.log('\n🚨 TRÊS SIRENES! As pílulas estão idênticas no texto principal (Template Genérico Detectado).');
    }
  }

  // 3. Buscar Quizzes da Pilula 1 e 2 para verificação
  if (pilulas && pilulas.length >= 2) {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, pergunta, pilula_id')
      .in('pilula_id', [pilulas[0].id, pilulas[1].id]);
      
    console.log(`\n❓ QUIZZES CADASTRADOS (amostragem fases 1 e 2): ${quizzes?.length}`);
  }

}

runAudit();
