import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import * as fs from 'fs';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TOTAL_FASES = 6;

// Sub-tópicos progressivos para cada fase de cada mundo
const SUB_TOPICOS: Record<number, string[]> = {
  1: [
    "O que é voluntariado e sua importância histórica no Brasil",
    "Lei do Voluntariado (9.608/98) e o Termo de Adesão",
    "Perfil do voluntário brasileiro e suas motivações",
    "Gestão profissional de programas de voluntariado",
    "Indicadores de impacto e avaliação do trabalho voluntário",
    "Voluntariado corporativo e tendências contemporâneas"
  ],
  2: [
    "Fundamentos da pesquisa social e diagnóstico comunitário",
    "Métodos quantitativos e qualitativos de pesquisa",
    "Coleta e análise de dados em comunidades periféricas",
    "Mapeamento de vulnerabilidades e potencialidades locais",
    "Pesquisa participativa e protagonismo comunitário",
    "Relatórios de pesquisa e tomada de decisão baseada em evidências"
  ],
  3: [
    "Fundamentos da pedagogia social e educação popular",
    "Paulo Freire e a pedagogia do oprimido aplicada ao terceiro setor",
    "Metodologias ativas de ensino-aprendizagem",
    "Planejamento pedagógico para projetos sociais",
    "Avaliação de aprendizagem em contextos não-formais",
    "Inovação pedagógica e tecnologias educacionais sociais"
  ],
  4: [
    "Conceitos fundamentais de gestão de projetos sociais",
    "Ciclo de vida de projetos: da concepção ao encerramento",
    "Ferramentas de planejamento: Marco Lógico e Teoria da Mudança",
    "Gestão de riscos e cronograma em projetos comunitários",
    "Monitoramento e avaliação de resultados e impacto",
    "Relatórios de prestação de contas para financiadores"
  ],
  5: [
    "Fundamentos da comunicação institucional no terceiro setor",
    "Storytelling social: contando histórias que transformam",
    "Marketing digital e redes sociais para ONGs",
    "Comunicação comunitária e mobilização social",
    "Relacionamento com a imprensa e assessoria de comunicação",
    "Comunicação interna e engajamento de equipes voluntárias"
  ],
  6: [
    "Inclusão digital e letramento tecnológico em comunidades",
    "Ferramentas gratuitas de gestão para organizações sociais",
    "Proteção de dados pessoais (LGPD) no terceiro setor",
    "Plataformas colaborativas e trabalho remoto para ONGs",
    "Automação de processos e eficiência operacional",
    "Inteligência Artificial e inovação para impacto social"
  ],
  7: [
    "O que são indicadores sociais e por que eles importam",
    "Principais indicadores: IDH, Gini, IDHM e índices de vulnerabilidade",
    "Construção de indicadores próprios para projetos sociais",
    "Coleta de dados e sistemas de monitoramento",
    "Análise e interpretação de indicadores para gestores sociais",
    "Comunicação de resultados e prestação de contas com dados"
  ],
  8: [
    "Panorama da captação de recursos no Brasil",
    "Leis de incentivo fiscal: Rouanet, Lei do Esporte, FIA/FMDCA",
    "Editais e fundos públicos para organizações do terceiro setor",
    "Captação junto a empresas: responsabilidade social e parcerias",
    "Crowdfunding e doações individuais: estratégias digitais",
    "Sustentabilidade financeira: diversificação de fontes de receita"
  ],
  9: [
    "Fundamentos de gestão financeira para organizações sem fins lucrativos",
    "Planejamento orçamentário e fluxo de caixa",
    "Contabilidade do terceiro setor: normas e obrigações legais (ITG 2002)",
    "Transparência financeira e accountability",
    "Auditoria e controles internos em ONGs",
    "Sustentabilidade financeira e planejamento de longo prazo"
  ],
  10: [
    "Papel e responsabilidades da diretoria executiva no terceiro setor",
    "Governança corporativa aplicada a organizações sociais",
    "Liderança transformadora e gestão de pessoas em ONGs",
    "Planejamento estratégico institucional",
    "Compliance, ética e marcos regulatórios (MROSC)",
    "Sucessão, legado e perpetuidade organizacional"
  ],
};

interface SeedPilula {
  titulo: string;
  conteudo: string;
}

interface SeedQuiz {
  pergunta: string;
  alternativas: string[];
  correta_idx: number;
  explicacao: string;
  dificuldade: string;
}

interface SeedFase {
  mundo_id: number;
  fase: number;
  sub_topico: string;
  pilula: SeedPilula;
  quizzes: SeedQuiz[];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSeed() {
  console.log('🚀 Seed v2 — 6 Fases por Mundo (Pré-Cache JSON)\n');

  const seedDataPath = join(__dirname, 'seed-data-v2.json');
  if (!fs.existsSync(seedDataPath)) {
    console.error('❌ seed-data-v2.json não encontrado.');
    console.error('Gere o arquivo com os dados das 60 pílulas + 300 quizzes primeiro.');
    console.error('Formato esperado: Array de objetos { mundo_id, fase, sub_topico, pilula: {titulo, conteudo}, quizzes: [{pergunta, alternativas, correta_idx, explicacao}] }');
    process.exit(1);
  }

  const seedData: SeedFase[] = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
  console.log(`📦 JSON carregado: ${seedData.length} fases encontradas.\n`);

  const { data: mundos, error: errMundos } = await supabase
    .from('mundo_ceus')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (errMundos || !mundos) {
    console.error('❌ Erro ao buscar mundos:', errMundos);
    return;
  }

  console.log(`🌍 ${mundos.length} mundos ativos encontrados.\n`);

  let totalPilulas = 0;
  let totalQuizzes = 0;

  for (const mundo of mundos) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📖 MUNDO ${mundo.ordem}: ${mundo.nome_tema}`);
    console.log(`${'═'.repeat(50)}`);

    for (let fase = 1; fase <= TOTAL_FASES; fase++) {
      const data = seedData.find(
        (d) => d.mundo_id === mundo.ordem && d.fase === fase
      );

      if (!data || !data.pilula || !data.quizzes) {
        console.error(`  ❌ Dados não encontrados para Mundo ${mundo.ordem}, Fase ${fase}`);
        continue;
      }

      try {
        // Check if already seeded
        const { data: existing } = await supabase
          .from('pilulas')
          .select('id')
          .eq('mundo_id', mundo.id)
          .eq('ordem', fase)
          .maybeSingle();

        if (existing) {
          console.log(`  ⏭️ Fase ${fase} já existe. Pulando...`);
          continue;
        }

        // Insert Pilula
        const { data: pilulaResult, error: errPilula } = await supabase
          .from('pilulas')
          .insert({
            mundo_id: mundo.id,
            titulo: data.pilula.titulo,
            conteudo: data.pilula.conteudo,
            ordem: fase,
            source_notebook_id: mundo.notebook_id,
          })
          .select('id')
          .single();

        if (errPilula) throw errPilula;
        totalPilulas++;

        // Insert Quizzes
        const quizzesFormatted = data.quizzes.map((q, i) => ({
          pilula_id: pilulaResult.id,
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
        }));

        const { error: errQuizzes } = await supabase
          .from('quizzes')
          .insert(quizzesFormatted);

        if (errQuizzes) throw errQuizzes;
        totalQuizzes += quizzesFormatted.length;

        console.log(`  ✅ Fase ${fase}: "${data.pilula.titulo}" + ${quizzesFormatted.length} quizzes`);
        await wait(200);
      } catch (error: any) {
        console.error(`  ❌ Erro Fase ${fase}:`, error.message);
      }
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🎉 Seed v2 finalizado!`);
  console.log(`   📚 Pílulas inseridas: ${totalPilulas}`);
  console.log(`   ❓ Quizzes inseridos: ${totalQuizzes}`);
  console.log(`${'═'.repeat(50)}`);
}

runSeed();
