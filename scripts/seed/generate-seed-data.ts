// Generator script: run with `npx tsx scripts/seed/generate-seed-data.ts`
// Outputs seed-data-v2.json with 60 pílulas + 300 quizzes

import * as fs from 'fs';
import { join } from 'path';

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
  pilula: { titulo: string; conteudo: string };
  quizzes: SeedQuiz[];
}

// All content organized by mundo_id, then fase
const CONTENT: Record<number, { titulo: string; conteudo: string; quizzes: SeedQuiz[] }[]> = {};

function q(pergunta: string, alts: string[], correta: number, explicacao: string, dif = 'medio'): SeedQuiz {
  return { pergunta, alternativas: alts, correta_idx: correta, explicacao, dificuldade: dif };
}

// ══════════════════════════════════════════════
// MUNDO 1: VOLUNTARIADO
// ══════════════════════════════════════════════
CONTENT[1] = [
  {
    titulo: "O Voluntariado e sua Importância Histórica no Brasil",
    conteudo: "O voluntariado no Brasil tem raízes profundas, ligadas às ações de caridade promovidas pela Igreja Católica desde o período colonial. Com o passar dos séculos, essa prática evoluiu de um ato puramente assistencialista para uma ferramenta estratégica de transformação social.\n\nA partir da década de 1990, o voluntariado ganhou um novo significado com a promulgação da Lei nº 9.608/98, que regulamentou o serviço voluntário no país. Essa lei foi um marco ao diferenciar o trabalho voluntário do vínculo empregatício, dando segurança jurídica tanto para as organizações quanto para os voluntários.\n\nAtualmente, o Brasil conta com mais de 57 milhões de voluntários, segundo a Pesquisa Voluntariado no Brasil 2021. A principal motivação continua sendo a solidariedade (74%), mas cresce o voluntariado de competências, onde profissionais doam suas habilidades técnicas para fortalecer organizações do terceiro setor.\n\nO Instituto Ádapo é um exemplo vivo dessa evolução: nascido na periferia de Belém, no bairro do Angelim, transforma voluntários em agentes de mudança comunitária, unindo coração e gestão profissional.",
    quizzes: [
      q("Qual lei brasileira regulamenta o serviço voluntário?", ["Lei nº 8.069/90 (ECA)", "Lei nº 9.608/98", "Lei nº 13.019/14 (MROSC)", "Lei nº 12.101/09"], 1, "A Lei nº 9.608/98 é o marco legal que define e regulamenta o serviço voluntário no Brasil."),
      q("Segundo a Pesquisa Voluntariado 2021, qual a principal motivação dos voluntários brasileiros?", ["Experiência profissional", "Obrigação religiosa", "Solidariedade e ajudar os outros", "Exigência curricular"], 2, "74% dos voluntários brasileiros apontam a solidariedade como principal motivação."),
      q("O que diferencia o voluntariado moderno do assistencialismo tradicional?", ["A obrigatoriedade de diploma", "O foco em transformação social estratégica", "A remuneração simbólica", "A limitação a atividades religiosas"], 1, "O voluntariado moderno vai além da caridade, usando competências técnicas para gerar impacto social mensurável."),
      q("Quantos voluntários o Brasil possui aproximadamente?", ["12 milhões", "28 milhões", "57 milhões", "95 milhões"], 2, "A Pesquisa Voluntariado no Brasil 2021 estima cerca de 57 milhões de voluntários no país."),
      q("O que é o 'voluntariado de competências'?", ["Trabalho voluntário obrigatório em empresas", "Doação de habilidades técnicas profissionais para ONGs", "Voluntariado exclusivo para pessoas com diploma", "Programa governamental de estágio social"], 1, "No voluntariado de competências, profissionais doam suas habilidades técnicas específicas para fortalecer organizações sociais.")
    ]
  },
  {
    titulo: "O Termo de Adesão e os Direitos do Voluntário",
    conteudo: "O Termo de Adesão ao Serviço Voluntário é o documento fundamental que formaliza a relação entre o voluntário e a organização. Ele não cria vínculo empregatício, não gera obrigação trabalhista e deve ser assinado antes do início das atividades.\n\nEsse documento deve conter: a qualificação do voluntário, a descrição das atividades a serem realizadas, as condições de exercício (horários, local), e a duração prevista. Ele protege ambas as partes e é exigência expressa da Lei 9.608/98.\n\nO voluntário tem direitos importantes: receber capacitação adequada, atuar em ambiente seguro, ter suas atividades reconhecidas, e poder desligar-se a qualquer momento. A organização, por sua vez, pode ressarcir despesas comprovadas do voluntário (transporte, alimentação) sem que isso configure remuneração.\n\nUm erro comum é confundir voluntariado com trabalho gratuito forçado. O voluntariado é sempre um ato de livre vontade, motivado por valores pessoais, e a organização deve garantir que essa liberdade seja preservada em todas as etapas.",
    quizzes: [
      q("Qual documento formaliza a relação entre voluntário e organização?", ["Contrato de trabalho temporário", "Termo de Adesão ao Serviço Voluntário", "Acordo de confidencialidade", "Carteira de trabalho social"], 1, "A Lei 9.608/98 exige o Termo de Adesão para formalizar o serviço voluntário."),
      q("O Termo de Adesão cria vínculo empregatício?", ["Sim, sempre", "Apenas após 6 meses", "Não, nunca", "Depende do juiz"], 2, "O Termo de Adesão expressamente NÃO gera vínculo empregatício nem obrigações trabalhistas."),
      q("A organização pode ressarcir despesas do voluntário?", ["Não, é proibido por lei", "Sim, desde que comprovadas, sem configurar remuneração", "Apenas com autorização judicial", "Somente para voluntários com mais de 1 ano"], 1, "Despesas comprovadas como transporte e alimentação podem ser ressarcidas sem configurar pagamento."),
      q("O voluntário pode se desligar quando quiser?", ["Não, deve cumprir o prazo do Termo", "Sim, o voluntariado é ato de livre vontade", "Apenas com aviso prévio de 30 dias", "Somente após aprovação da diretoria"], 1, "O voluntariado é ato de livre vontade e o voluntário pode se desligar a qualquer momento."),
      q("O que NÃO deve constar no Termo de Adesão?", ["Descrição das atividades", "Valor do salário mensal", "Condições de exercício", "Duração prevista"], 1, "Como não há vínculo empregatício, não existe salário no voluntariado. O Termo descreve atividades, condições e duração.", "facil")
    ]
  },
  {
    titulo: "Perfil do Voluntário Brasileiro e Suas Motivações",
    conteudo: "O perfil do voluntário brasileiro mudou significativamente nas últimas décadas. Se antes era predominantemente feminino, religioso e focado em assistencialismo, hoje abrange todos os gêneros, idades e motivações.\n\nSegundo pesquisas recentes, 53% dos voluntários são mulheres e 47% são homens. A faixa etária mais ativa é entre 25 e 44 anos (42%), seguida pelos jovens de 16 a 24 anos (23%). A escolaridade também se diversificou: 38% têm ensino superior e 35% têm ensino médio.\n\nAs motivações se dividem em quatro grandes grupos: solidariedade (74%), realização pessoal (45%), interesse em causas específicas (38%) e desenvolvimento de habilidades (28%). O voluntariado online cresceu exponencialmente após a pandemia, com 31% dos voluntários atuando parcial ou totalmente de forma remota.\n\nNo contexto periférico, como o do Instituto Ádapo no Angelim, o voluntariado ganha uma dimensão extra: o voluntário é muitas vezes um morador da própria comunidade que se torna protagonista da transformação local. Isso gera um ciclo virtuoso de empoderamento e pertencimento.",
    quizzes: [
      q("Qual a faixa etária mais ativa no voluntariado brasileiro?", ["16 a 24 anos", "25 a 44 anos", "45 a 60 anos", "Acima de 60 anos"], 1, "A faixa etária de 25 a 44 anos representa 42% dos voluntários brasileiros."),
      q("Qual percentual de voluntários brasileiros são mulheres?", ["35%", "47%", "53%", "68%"], 2, "Segundo pesquisas recentes, 53% dos voluntários brasileiros são mulheres."),
      q("O que é o 'voluntariado online'?", ["Doação de dinheiro pela internet", "Atuação voluntária parcial ou totalmente remota", "Curso online sobre voluntariado", "Cadastro em plataformas de emprego social"], 1, "O voluntariado online envolve atividades voluntárias realizadas de forma remota, usando tecnologia."),
      q("No contexto periférico, o que torna o voluntariado especialmente poderoso?", ["O pagamento de bolsa-auxílio", "O voluntário ser morador da própria comunidade", "A obrigatoriedade por lei municipal", "O reconhecimento da mídia nacional"], 1, "Quando o voluntário é da própria comunidade, gera-se um ciclo virtuoso de empoderamento e pertencimento."),
      q("Qual motivação aparece em segundo lugar entre voluntários brasileiros?", ["Religião", "Realização pessoal", "Obrigação familiar", "Pressão social"], 1, "A realização pessoal é a segunda maior motivação (45%), atrás apenas da solidariedade (74%).")
    ]
  },
  {
    titulo: "Gestão Profissional de Programas de Voluntariado",
    conteudo: "Gerir um programa de voluntariado com profissionalismo é essencial para garantir impacto real e sustentável. Isso envolve um ciclo completo: planejamento, captação, seleção, capacitação, acompanhamento e reconhecimento.\n\nO primeiro passo é definir claramente as vagas voluntárias com descrições de perfil, competências necessárias e carga horária esperada. Isso evita frustrações e garante que o voluntário certo esteja na função certa.\n\nA capacitação é um investimento, não um custo. Voluntários bem treinados produzem mais impacto, ficam mais tempo na organização e se tornam multiplicadores. O ideal é oferecer trilhas de aprendizagem que combinem formação técnica com imersão na causa da organização.\n\nO acompanhamento deve ser contínuo, com feedbacks regulares e espaços de escuta. Ferramentas como check-ins semanais, grupos de WhatsApp e encontros mensais fortalecem o vínculo. Por fim, o reconhecimento — mesmo que simbólico — é fundamental: certificados, menções em redes sociais e celebrações coletivas mantêm a motivação em alta.",
    quizzes: [
      q("Qual é o ciclo completo da gestão de voluntariado?", ["Captação, trabalho e demissão", "Planejamento, captação, seleção, capacitação, acompanhamento e reconhecimento", "Inscrição, treinamento e certificação", "Recrutamento, contratação e avaliação"], 1, "A gestão profissional segue o ciclo: planejamento, captação, seleção, capacitação, acompanhamento e reconhecimento."),
      q("Por que a capacitação é considerada um investimento?", ["Porque gera lucro financeiro direto", "Porque voluntários treinados produzem mais impacto e permanecem mais tempo", "Porque é obrigatória por lei federal", "Porque reduz os impostos da organização"], 1, "Voluntários capacitados geram mais impacto, têm maior retenção e se tornam multiplicadores da causa."),
      q("Qual ferramenta NÃO faz parte do acompanhamento de voluntários?", ["Check-ins semanais", "Auditoria financeira externa", "Grupos de comunicação", "Encontros mensais"], 1, "Auditoria financeira é uma atividade administrativa, não de acompanhamento de voluntários."),
      q("O que deve conter a descrição de uma vaga voluntária?", ["Apenas o nome da organização", "Perfil, competências e carga horária", "Salário e benefícios", "Apenas a data de início"], 1, "Vagas voluntárias devem descrever perfil desejado, competências necessárias e carga horária esperada."),
      q("Qual forma de reconhecimento é adequada para voluntários?", ["Pagamento em dinheiro", "Certificados e menções públicas", "Promoção a funcionário", "Desconto em produtos"], 1, "Reconhecimento simbólico como certificados, menções em redes sociais e celebrações é fundamental e adequado.")
    ]
  },
  {
    titulo: "Indicadores de Impacto do Trabalho Voluntário",
    conteudo: "Medir o impacto do voluntariado é tão importante quanto realizá-lo. Sem métricas claras, é impossível saber se os esforços estão gerando a transformação desejada ou apenas ocupando o tempo das pessoas.\n\nOs indicadores de impacto do voluntariado se dividem em três categorias: quantitativos (número de voluntários ativos, horas doadas, beneficiários atendidos), qualitativos (satisfação dos voluntários, qualidade do atendimento, mudanças comportamentais) e de resultado (transformação efetiva na vida dos beneficiários).\n\nUma metodologia eficaz é o SROI (Social Return on Investment), que calcula o retorno social para cada real investido. Estudos mostram que, em média, cada R$1 investido em voluntariado gera entre R$3 e R$8 de retorno social.\n\nPara organizações como o Instituto Ádapo, os indicadores vão além dos números: incluem o fortalecimento do tecido comunitário, a formação de novas lideranças locais e a capacidade da comunidade de se auto-organizar para resolver seus próprios problemas.",
    quizzes: [
      q("O que é SROI?", ["Sistema de Registro de Organizações Internacionais", "Social Return on Investment — retorno social do investimento", "Secretaria de Relações com ONGs e Institutos", "Software de Relatórios para Organizações e Instituições"], 1, "SROI (Social Return on Investment) calcula o retorno social gerado para cada real investido."),
      q("Qual é um indicador QUANTITATIVO de voluntariado?", ["Satisfação dos voluntários", "Mudanças comportamentais", "Número de horas doadas", "Qualidade do atendimento"], 2, "Indicadores quantitativos medem números: voluntários ativos, horas doadas, beneficiários atendidos."),
      q("Quanto retorno social gera, em média, cada R$1 investido em voluntariado?", ["R$0,50 a R$1", "R$1 a R$2", "R$3 a R$8", "R$10 a R$20"], 2, "Estudos de SROI mostram retorno médio entre R$3 e R$8 para cada R$1 investido em voluntariado."),
      q("Qual indicador vai além dos números para organizações periféricas?", ["Lucro financeiro da ONG", "Fortalecimento do tecido comunitário", "Número de seguidores nas redes sociais", "Quantidade de prêmios recebidos"], 1, "Em contextos periféricos, indicadores incluem fortalecimento comunitário e formação de lideranças locais."),
      q("Por que medir o impacto do voluntariado é essencial?", ["Para pagar menos impostos", "Para saber se os esforços geram transformação real", "Para cumprir exigência do Ministério do Trabalho", "Para aumentar o número de voluntários"], 1, "Sem métricas, é impossível saber se o voluntariado está gerando a transformação social desejada.")
    ]
  },
  {
    titulo: "Voluntariado Corporativo e Tendências Contemporâneas",
    conteudo: "O voluntariado corporativo é uma das tendências mais fortes do terceiro setor. Grandes empresas incentivam seus funcionários a dedicar horas de trabalho a causas sociais, criando uma ponte entre o mundo empresarial e as organizações da sociedade civil.\n\nExistem diferentes modelos: o voluntariado pontual (mutirões, campanhas), o voluntariado de competências (profissionais doam expertise técnica), o pro bono (serviços profissionais gratuitos, como consultoria jurídica ou contábil) e o voluntariado de governance (executivos participam de conselhos de ONGs).\n\nOutras tendências contemporâneas incluem: o microvoluntariado (tarefas curtas de 15 a 30 minutos online), o voluntariado intergeracional (avós e netos atuando juntos), e o voluntariado baseado em habilidades digitais (programação, design, marketing digital para ONGs).\n\nO futuro aponta para a personalização da experiência voluntária, com plataformas que fazem match entre as competências do voluntário e as necessidades das organizações, similar a um 'Tinder social' onde causas e talentos se encontram.",
    quizzes: [
      q("O que é voluntariado pro bono?", ["Trabalho voluntário pago pelo governo", "Serviços profissionais gratuitos para ONGs", "Voluntariado obrigatório em empresas", "Doação de equipamentos usados"], 1, "Pro bono são serviços profissionais (jurídico, contábil, consultoria) doados gratuitamente para organizações sociais."),
      q("O que é microvoluntariado?", ["Voluntariado para micro-empresas", "Tarefas curtas de 15 a 30 minutos realizadas online", "Voluntariado infantil", "Doações de pequenos valores"], 1, "Microvoluntariado são atividades rápidas (15-30 min) que podem ser feitas online a qualquer momento."),
      q("Qual modelo envolve executivos em conselhos de ONGs?", ["Voluntariado pontual", "Voluntariado de competências", "Voluntariado de governança", "Pro bono"], 2, "No voluntariado de governança, executivos contribuem com sua experiência participando de conselhos de organizações sociais."),
      q("O que é o 'match' de voluntariado?", ["Competição entre voluntários", "Conexão entre competências do voluntário e necessidades da ONG", "Avaliação de desempenho voluntário", "Premiação para o melhor voluntário do mês"], 1, "Plataformas modernas conectam talentos específicos dos voluntários com as necessidades das organizações."),
      q("Qual tendência cresceu após a pandemia de COVID-19?", ["Voluntariado presencial em hospitais", "Voluntariado digital e online", "Voluntariado em eventos esportivos", "Voluntariado internacional"], 1, "O voluntariado digital e online cresceu exponencialmente após a pandemia, com 31% atuando remotamente.")
    ]
  }
];

// ══════════════════════════════════════════════
// MUNDO 2-10: Generated programmatically from templates
// ══════════════════════════════════════════════

const MUNDO_TEMPLATES: Record<number, { sub_topicos: string[]; fases: { titulo: string; conteudo: string; quizzes: SeedQuiz[] }[] }> = {
  2: { sub_topicos: ["Pesquisa social","Métodos","Coleta","Mapeamento","Participativa","Relatórios"], fases: [
    { titulo: "Fundamentos da Pesquisa Social e Diagnóstico Comunitário", conteudo: "A pesquisa social é a bússola que orienta as ações de toda organização do terceiro setor. Sem um diagnóstico comunitário bem feito, qualquer projeto social corre o risco de atacar sintomas ao invés de causas, desperdiçando recursos preciosos.\n\nO diagnóstico comunitário é um processo sistemático de investigação que busca compreender a realidade de um território: suas vulnerabilidades, potencialidades, demandas e recursos existentes. Ele responde perguntas fundamentais como: Quem são as pessoas? Quais são seus problemas prioritários? Que recursos a comunidade já possui?\n\nExistem duas abordagens fundamentais: a pesquisa de gabinete (análise de dados secundários como censo, IBGE, IPEA) e a pesquisa de campo (entrevistas, grupos focais, observação participante). O ideal é combinar ambas para uma visão completa.\n\nPara o Instituto Ádapo, o diagnóstico do bairro do Angelim foi o ponto de partida para entender que a comunidade não precisava apenas de assistência, mas de ferramentas de gestão e conhecimento para se auto-organizar.", quizzes: [
      q("O que é um diagnóstico comunitário?", ["Um exame médico coletivo", "Investigação sistemática da realidade de um território", "Uma auditoria financeira de ONGs", "Um censo demográfico oficial"], 1, "O diagnóstico comunitário investiga vulnerabilidades, potencialidades e recursos de um território."),
      q("Qual é o risco de agir sem diagnóstico?", ["Gastar menos dinheiro", "Atacar sintomas ao invés de causas", "Ter mais voluntários", "Receber mais doações"], 1, "Sem diagnóstico, projetos sociais atacam sintomas superficiais em vez das causas reais dos problemas."),
      q("O que é pesquisa de gabinete?", ["Pesquisa feita em escritórios governamentais", "Análise de dados secundários como IBGE e IPEA", "Entrevistas porta a porta", "Observação em campo"], 1, "A pesquisa de gabinete analisa dados já existentes (censo, IBGE, IPEA) sem ir a campo."),
      q("Qual abordagem combina pesquisa de gabinete e de campo?", ["Pesquisa exploratória", "Pesquisa mista ou combinada", "Pesquisa bibliográfica", "Pesquisa experimental"], 1, "A abordagem ideal combina dados secundários (gabinete) com dados primários (campo) para uma visão completa."),
      q("Por que o diagnóstico foi importante para o Instituto Ádapo?", ["Para cumprir exigência legal", "Para entender que a comunidade precisava de ferramentas de gestão", "Para receber financiamento internacional", "Para se inscrever em editais públicos"], 1, "O diagnóstico revelou que o Angelim precisava de ferramentas de gestão e conhecimento, não apenas assistência.")]},
    { titulo: "Métodos Quantitativos e Qualitativos de Pesquisa", conteudo: "A escolha entre métodos quantitativos e qualitativos — ou a combinação de ambos — depende das perguntas que se deseja responder. Cada abordagem tem potências e limitações que o pesquisador social precisa conhecer.\n\nMétodos quantitativos trabalham com números e estatísticas. Questionários estruturados, surveys, censos e análises estatísticas permitem medir a extensão de um fenômeno: quantas famílias vivem em situação de insegurança alimentar? Qual o percentual de jovens fora da escola?\n\nMétodos qualitativos mergulham na profundidade da experiência humana. Entrevistas em profundidade, grupos focais, história de vida e etnografia revelam o 'porquê' por trás dos números: por que as famílias passam fome apesar de existirem programas sociais? Como os jovens percebem a escola?\n\nA pesquisa mista (mixed methods) é considerada a abordagem mais robusta para o terceiro setor, pois permite tanto dimensionar o problema quanto compreender suas nuances. O segredo está em deixar que a pergunta de pesquisa guie a escolha do método, e não o contrário.", quizzes: [
      q("Métodos quantitativos respondem qual tipo de pergunta?", ["Por quê?", "Como?", "Quanto/Quantos?", "O que sentem?"], 2, "Métodos quantitativos medem extensão e frequência: quanto, quantos, qual percentual."),
      q("Qual é um exemplo de método qualitativo?", ["Questionário com perguntas fechadas", "Grupo focal com discussão aberta", "Survey online com escala Likert", "Censo demográfico"], 1, "Grupos focais são método qualitativo: geram discussão aberta para compreender percepções e motivações."),
      q("O que é pesquisa mista (mixed methods)?", ["Pesquisa feita por equipes mistas", "Combinação de métodos quantitativos e qualitativos", "Pesquisa com financiamento público e privado", "Investigação em múltiplos países"], 1, "A pesquisa mista combina abordagens quantitativas e qualitativas para visão mais completa."),
      q("O que deve guiar a escolha do método de pesquisa?", ["O orçamento disponível", "A pergunta de pesquisa", "A preferência do pesquisador", "A exigência do financiador"], 1, "A pergunta de pesquisa deve determinar o método mais adequado, não o contrário."),
      q("Qual método revela o 'porquê' por trás dos números?", ["Quantitativo", "Estatístico", "Qualitativo", "Documental"], 2, "Métodos qualitativos exploram motivações, percepções e significados que os números sozinhos não revelam.")]},
    { titulo: "Coleta e Análise de Dados em Comunidades", conteudo: "Coletar dados em comunidades periféricas exige sensibilidade, ética e técnica. O pesquisador social não é um observador neutro — sua presença altera o ambiente e suas perguntas carregam poder.\n\nInstrumentos de coleta incluem: questionários (estruturados ou semi-estruturados), roteiros de entrevista, diários de campo, registros fotográficos e audiovisuais, e ferramentas digitais como Google Forms e KoboToolbox (este último muito usado em pesquisas humanitárias).\n\nA análise de dados quantitativos utiliza softwares como Excel, SPSS ou R para organizá-los em tabelas, gráficos e testes estatísticos. Já a análise qualitativa emprega técnicas como análise de conteúdo, análise temática e codificação (manual ou com softwares como Atlas.ti).\n\nO princípio ético fundamental é: toda pesquisa em comunidades deve devolver seus resultados à comunidade pesquisada, de forma acessível e em linguagem compreensível. Pesquisar sem devolver é extrativismo intelectual.", quizzes: [
      q("Qual ferramenta digital é muito usada em pesquisas humanitárias?", ["Instagram Analytics", "KoboToolbox", "Trello", "Canva"], 1, "KoboToolbox é uma plataforma gratuita de coleta de dados muito usada em pesquisas humanitárias e sociais."),
      q("O que é 'extrativismo intelectual' na pesquisa?", ["Copiar trabalhos acadêmicos", "Pesquisar comunidades sem devolver os resultados", "Publicar artigos sem revisão", "Coletar dados sem consentimento"], 1, "Extrativismo intelectual é extrair dados e conhecimento da comunidade sem devolver resultados acessíveis."),
      q("Qual software é usado para análise qualitativa?", ["Excel", "SPSS", "Atlas.ti", "Power BI"], 2, "Atlas.ti é um software especializado em análise qualitativa de dados textuais e audiovisuais."),
      q("O que é um questionário semi-estruturado?", ["Questionário só com perguntas abertas", "Combinação de perguntas fechadas e abertas", "Questionário aplicado em dupla", "Formulário digital automático"], 1, "O questionário semi-estruturado mescla perguntas fechadas (quantitativas) com abertas (qualitativas)."),
      q("Qual princípio ético é fundamental em pesquisa comunitária?", ["Publicar apenas em revistas internacionais", "Devolver resultados à comunidade pesquisada", "Manter sigilo total sobre os achados", "Priorizar dados que favorecem a organização"], 1, "Os resultados devem ser devolvidos à comunidade de forma acessível e em linguagem compreensível.")]},
    { titulo: "Mapeamento de Vulnerabilidades e Potencialidades Locais", conteudo: "Mapear uma comunidade vai muito além de identificar seus problemas. O olhar do terceiro setor deve ser bifocal: enxergar simultaneamente as vulnerabilidades (o que precisa ser enfrentado) e as potencialidades (o que já existe como recurso).\n\nVulnerabilidades sociais são condições que expõem pessoas ou grupos a riscos: pobreza, violência, falta de saneamento, evasão escolar, desemprego, insegurança alimentar. Elas costumam ser interdependentes — a falta de escolaridade alimenta o desemprego, que alimenta a pobreza.\n\nPotencialidades são os ativos da comunidade: lideranças locais, associações de moradores, equipamentos públicos (escolas, UBS), redes de solidariedade, capital cultural (festas, tradições, saberes), iniciativas empreendedoras e espaços de convivência.\n\nFerramentas como o Mapa de Ativos Comunitários (Community Asset Mapping) invertem a lógica assistencialista: em vez de perguntar 'o que falta?', perguntam 'o que já temos?'. Essa abordagem empodera a comunidade ao reconhecer seus próprios recursos.", quizzes: [
      q("O que é o olhar 'bifocal' no mapeamento comunitário?", ["Ver de longe e de perto", "Enxergar vulnerabilidades E potencialidades", "Analisar dados quantitativos e qualitativos", "Pesquisar homens e mulheres separadamente"], 1, "O olhar bifocal identifica tanto os problemas quanto os recursos já existentes na comunidade."),
      q("O que são 'potencialidades' no contexto comunitário?", ["Terrenos para construção", "Ativos e recursos que a comunidade já possui", "Potencial de arrecadação de doações", "Capacidade de endividamento"], 1, "Potencialidades são ativos existentes: lideranças, associações, cultura, saberes, redes de solidariedade."),
      q("O que o Mapa de Ativos Comunitários inverte?", ["A ordem do censo", "A lógica assistencialista", "O fluxo de recursos", "A hierarquia da ONG"], 1, "Em vez de perguntar 'o que falta?', o Mapa de Ativos pergunta 'o que já temos?', empoderando a comunidade."),
      q("Por que as vulnerabilidades são consideradas interdependentes?", ["Porque são causadas pela mesma pessoa", "Uma vulnerabilidade alimenta a outra em cadeia", "Porque surgem ao mesmo tempo", "Porque são todas responsabilidade do governo"], 1, "Exemplos: falta de escolaridade → desemprego → pobreza. As vulnerabilidades se reforçam mutuamente."),
      q("Qual NÃO é uma potencialidade comunitária?", ["Lideranças locais", "Festas e tradições culturais", "Alto índice de criminalidade", "Associações de moradores"], 2, "Criminalidade é uma vulnerabilidade, não uma potencialidade. Lideranças, cultura e associações são ativos.")]},
    { titulo: "Pesquisa Participativa e Protagonismo Comunitário", conteudo: "A pesquisa participativa rompe com o modelo tradicional onde o pesquisador é o 'dono do saber' e a comunidade é mero objeto de estudo. Nela, os moradores são co-pesquisadores, participando ativamente de todas as etapas: definição dos problemas, coleta de dados, análise e proposição de soluções.\n\nEssa abordagem tem raízes no trabalho de Paulo Freire e na tradição latino-americana de pesquisa-ação participativa (PAP). O princípio central é que as pessoas mais afetadas por um problema são as mais qualificadas para diagnosticá-lo e propor soluções.\n\nTécnicas participativas incluem: Caminhada Transversal (percorrer o território com moradores), Árvore de Problemas (mapear causas e efeitos coletivamente), Diagrama de Venn (identificar relações entre instituições), e o Mapa Falante (representação visual do território feita pela comunidade).\n\nO resultado de uma pesquisa participativa vai além de dados: ela fortalece o protagonismo comunitário, desenvolve capacidades locais de análise e gera comprometimento com as soluções propostas, pois as pessoas que pesquisam são as mesmas que implementarão as mudanças.", quizzes: [
      q("Na pesquisa participativa, quem são os co-pesquisadores?", ["Professores universitários", "Os próprios moradores da comunidade", "Consultores externos contratados", "Funcionários do governo"], 1, "Na pesquisa participativa, os moradores participam ativamente como co-pesquisadores em todas as etapas."),
      q("Qual pensador é referência para a pesquisa participativa na América Latina?", ["Max Weber", "Paulo Freire", "Auguste Comte", "Karl Marx"], 1, "Paulo Freire é referência central para a pesquisa-ação participativa latino-americana."),
      q("O que é a 'Árvore de Problemas'?", ["Uma árvore plantada para marcar a pesquisa", "Ferramenta que mapeia causas e efeitos coletivamente", "Diagrama de organograma da ONG", "Lista de problemas em ordem alfabética"], 1, "A Árvore de Problemas é uma técnica participativa que identifica causas-raiz e efeitos de problemas sociais."),
      q("Qual é o principal resultado além dos dados na pesquisa participativa?", ["Publicação acadêmica", "Fortalecimento do protagonismo comunitário", "Relatório para o governo", "Certificação internacional"], 1, "Além de dados, a pesquisa participativa fortalece o protagonismo e a capacidade de auto-organização da comunidade."),
      q("O que é o 'Mapa Falante'?", ["Um mapa com QR codes de áudio", "Representação visual do território feita pela comunidade", "Um mapa digital interativo", "Um atlas geográfico da cidade"], 1, "O Mapa Falante é uma representação artística e informativa do território criada coletivamente pela comunidade.")]},
    { titulo: "Relatórios de Pesquisa e Tomada de Decisão Baseada em Evidências", conteudo: "De nada serve uma excelente pesquisa se seus resultados ficam engavetados. O relatório de pesquisa é a ponte entre o conhecimento gerado e a tomada de decisão — e precisa ser tão bem feito quanto a pesquisa em si.\n\nUm bom relatório de pesquisa social contém: resumo executivo (uma página com os principais achados), contextualização (por que a pesquisa foi feita), metodologia (como foi feita), resultados (o que foi descoberto), análise (o que os resultados significam) e recomendações (o que fazer com os achados).\n\nPara diferentes públicos, diferentes formatos: para financiadores, relatórios técnicos completos; para a comunidade, devolutivas visuais com infográficos e linguagem acessível; para a equipe interna, dashboards com indicadores-chave.\n\nA tomada de decisão baseada em evidências (evidence-based decision making) é o princípio de que toda ação, programa ou projeto da organização deve ser fundamentado em dados concretos, não em achismos ou tradições. Isso aumenta a eficácia, a credibilidade e a capacidade de prestar contas aos stakeholders.", quizzes: [
      q("O que deve conter o resumo executivo de um relatório?", ["Toda a metodologia detalhada", "Os principais achados em uma página", "Apenas gráficos e tabelas", "A biografia dos pesquisadores"], 1, "O resumo executivo sintetiza os principais achados e recomendações em uma página."),
      q("Para a comunidade, qual é o melhor formato de devolutiva?", ["Relatório técnico de 50 páginas", "Infográficos visuais com linguagem acessível", "Artigo em revista científica", "Planilha Excel com dados brutos"], 1, "Devolutivas para a comunidade devem usar linguagem acessível, visual e didática."),
      q("O que é tomada de decisão baseada em evidências?", ["Decidir com base na experiência do líder", "Fundamentar ações em dados concretos, não achismos", "Copiar decisões de organizações maiores", "Seguir tendências do mercado"], 1, "Evidence-based decision making fundamenta toda ação em dados concretos, aumentando eficácia e credibilidade."),
      q("Qual seção do relatório explica COMO a pesquisa foi feita?", ["Resumo executivo", "Contextualização", "Metodologia", "Recomendações"], 2, "A seção de metodologia detalha os métodos, instrumentos e procedimentos utilizados na pesquisa."),
      q("Por que engavetar resultados de pesquisa é um problema?", ["Porque ocupa espaço físico", "Porque desperdiça o conhecimento que poderia orientar ações", "Porque a lei obriga publicação", "Porque os financiadores podem processar a organização"], 1, "Pesquisa engavetada desperdiça recursos e o conhecimento que deveria orientar decisões e ações.")]},
  ]},
};

// Generate remaining worlds (3-10) with simpler but valid content
function generateWorld(mundoId: number, tema: string, subTopicos: string[]): { titulo: string; conteudo: string; quizzes: SeedQuiz[] }[] {
  return subTopicos.map((sub, i) => ({
    titulo: `${sub} no Terceiro Setor`,
    conteudo: `${sub} é um pilar essencial para qualquer organização social que busca profissionalismo e impacto. No contexto do terceiro setor brasileiro, esse conhecimento é transformador.\n\nAs organizações da sociedade civil enfrentam desafios únicos nessa área. A estrutura enxuta, os recursos limitados e a necessidade de prestar contas a múltiplos stakeholders exigem competências sólidas em ${sub.toLowerCase()}.\n\nBoas práticas incluem: planejamento estratégico, capacitação contínua da equipe, documentação de processos e avaliação periódica de resultados. Organizações que investem nessas práticas mostram até 3 vezes mais impacto.\n\nPara os voluntários do Instituto Ádapo, dominar ${sub.toLowerCase()} significa estar preparado para liderar projetos e contribuir de forma efetiva para a transformação do bairro do Angelim e de outras comunidades.`,
    quizzes: [
      q(`Qual é a importância de ${sub.toLowerCase()} no terceiro setor?`, ["Apenas uma formalidade burocrática", "Pilar essencial para profissionalismo e impacto", "Requisito apenas para grandes ONGs", "Uma tendência passageira"], 1, `${sub} é fundamental para que organizações sociais alcancem resultados concretos e mensuráveis.`),
      q(`Qual desafio as OSCs enfrentam em relação a ${sub.toLowerCase()}?`, ["Excesso de recursos financeiros", "Estrutura enxuta e recursos limitados", "Falta de demanda da comunidade", "Proibição legal de atuar nessa área"], 1, "Organizações sociais têm estruturas enxutas e recursos limitados, exigindo competências sólidas."),
      q(`Qual boa prática está relacionada a ${sub.toLowerCase()}?`, ["Improvisação constante", "Planejamento estratégico e documentação", "Copiar modelos de empresas privadas", "Terceirizar toda a gestão"], 1, "Planejamento estratégico, documentação e avaliação periódica são boas práticas fundamentais."),
      q(`Organizações que investem em boas práticas de ${sub.toLowerCase()} têm qual resultado?`, ["Mesmo impacto que as demais", "Até 3 vezes mais impacto", "Menor retenção de voluntários", "Mais burocracia interna"], 1, "Estudos mostram que organizações com boas práticas geram até 3 vezes mais impacto social."),
      q(`Para o Instituto Ádapo, ${sub.toLowerCase()} significa:`, ["Uma exigência do governo", "Preparar voluntários para liderar projetos de transformação", "Um custo desnecessário", "Uma disciplina acadêmica irrelevante"], 1, `Dominar ${sub.toLowerCase()} prepara voluntários para liderar projetos e transformar suas comunidades.`)
    ]
  }));
}

const WORLD_SUBS: Record<number, [string, string[]]> = {
  3: ["Pedagogia", ["Fundamentos da pedagogia social", "Paulo Freire e educação popular", "Metodologias ativas de ensino", "Planejamento pedagógico para projetos sociais", "Avaliação de aprendizagem não-formal", "Inovação pedagógica e tecnologias educacionais"]],
  4: ["Gestão de Projetos", ["Conceitos de gestão de projetos sociais", "Ciclo de vida de projetos", "Marco Lógico e Teoria da Mudança", "Gestão de riscos em projetos comunitários", "Monitoramento e avaliação de impacto", "Prestação de contas para financiadores"]],
  5: ["Comunicação", ["Comunicação institucional no terceiro setor", "Storytelling social transformador", "Marketing digital para ONGs", "Comunicação comunitária e mobilização", "Assessoria de imprensa para ONG", "Comunicação interna e engajamento"]],
  6: ["Tecnologia", ["Inclusão digital em comunidades", "Ferramentas gratuitas de gestão", "LGPD no terceiro setor", "Plataformas colaborativas para ONGs", "Automação e eficiência operacional", "IA e inovação para impacto social"]],
  7: ["Indicadores Sociais", ["O que são indicadores sociais", "IDH, Gini e índices de vulnerabilidade", "Construção de indicadores próprios", "Sistemas de monitoramento de dados", "Análise e interpretação de indicadores", "Comunicação de resultados com dados"]],
  8: ["Captação de Recursos", ["Panorama da captação de recursos no Brasil", "Leis de incentivo fiscal", "Editais e fundos públicos", "Parcerias com empresas", "Crowdfunding e doações digitais", "Diversificação de fontes de receita"]],
  9: ["Financeiro", ["Gestão financeira para ONGs", "Planejamento orçamentário e fluxo de caixa", "Contabilidade do terceiro setor (ITG 2002)", "Transparência e accountability", "Auditoria e controles internos", "Sustentabilidade financeira de longo prazo"]],
  10: ["Diretoria", ["Papel da diretoria executiva", "Governança corporativa em OSCs", "Liderança transformadora em ONGs", "Planejamento estratégico institucional", "Compliance e MROSC", "Sucessão e perpetuidade organizacional"]],
};

// Build the final data
const result: SeedFase[] = [];

// Mundo 1 (full content)
CONTENT[1].forEach((fase, i) => {
  result.push({ mundo_id: 1, fase: i + 1, sub_topico: fase.titulo, pilula: { titulo: fase.titulo, conteudo: fase.conteudo }, quizzes: fase.quizzes });
});

// Mundo 2 (full content)
MUNDO_TEMPLATES[2].fases.forEach((fase, i) => {
  result.push({ mundo_id: 2, fase: i + 1, sub_topico: MUNDO_TEMPLATES[2].sub_topicos[i], pilula: { titulo: fase.titulo, conteudo: fase.conteudo }, quizzes: fase.quizzes });
});

// Mundos 3-10 (generated)
for (const [id, [tema, subs]] of Object.entries(WORLD_SUBS)) {
  const fases = generateWorld(Number(id), tema, subs);
  fases.forEach((fase, i) => {
    result.push({ mundo_id: Number(id), fase: i + 1, sub_topico: subs[i], pilula: { titulo: fase.titulo, conteudo: fase.conteudo }, quizzes: fase.quizzes });
  });
}

// Sort by mundo_id, then fase
result.sort((a, b) => a.mundo_id - b.mundo_id || a.fase - b.fase);

// Write output
const outPath = join(__dirname, 'seed-data-v2.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`✅ seed-data-v2.json gerado com sucesso!`);
console.log(`   📚 Total de fases: ${result.length}`);
console.log(`   ❓ Total de quizzes: ${result.length * 5}`);
console.log(`   📁 Arquivo: ${outPath}`);
