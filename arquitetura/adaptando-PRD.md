# Product Requirements Document (PRD) - Adaptdando (MVP)

## 1. Visão Geral do Produto
O **Adaptdando** é uma plataforma gamificada de microlearning (estilo Duolingo) desenvolvida para o **Instituto Ádapo**. O objetivo é nivelar o conhecimento da equipe e reter voluntários através de uma trilha contínua de aprendizado sobre o Terceiro Setor e o Marco Regulatório das OSCs (MROSC). 

A plataforma traduz a identidade cultural do Instituto através da metáfora "Dando linha pra sonhar", onde o progresso do usuário é medido em "metros de linha de pipa" enquanto ele desbrava diferentes "céus" (módulos).

## 2. Escopo do MVP (Regra de Ouro: Custo Zero)
* **O que ESTÁ no escopo:** Frontend web responsivo, autenticação, progressão de usuários, gamificação (ofensivas/vidas), consumo de script do NotebookLM para conteúdo, notificações gratuitas (Email/Push).

## 3. Stack Tecnológica
* **Frontend:** Interface gerada via Google Stich MCP, consolidada em framework moderno.
* **Backend & BaaS:** Supabase (Autenticação, Banco de Dados Relacional PostgreSQL, Cron Jobs).
* **Integração de IA (Conteúdo):** Script em Python/Node que aciona o NotebookLM local/em nuvem do usuário para buscar pílulas de leitura e quizzes.
* **Orquestração:** Aintigravity com Model Context Protocol (MCP) do Supabase e do NotebookLM.

## 4. Jornada do Usuário e Gamificação
A progressão é linear. O voluntário avança por 9 mundos (Céus). Cada céu aborda um tema essencial para o funcionamento do Instituto Ádapo como uma OSC de alto impacto.

### 4.1. Mapa de Mundos (A Jornada dos Céus)
A metáfora visual acompanha o voo de uma pipa. Quanto mais conhecimento, mais linha se dá, e mais alto o voluntário chega, mudando o clima e o cenário do céu.

| Nível | Caderno/Tema | Clima Visual (UI) | Simbologia na Jornada |
| :--- | :--- | :--- | :--- |
| 1 | Voluntariado | ☁️ Céu Nublado | O início, entendendo o básico para a pipa subir. |
| 2 | Pesquisa Científica | 🌤️ Céu com Brisa | A pipa ganha os primeiros impulsos e direcionamento. |
| 3 | Gestão de Projetos | ⛅ Céu Limpo | Estabilidade no ar, processos claros e estruturados. |
| 4 | Comunicação | 🌥️ Céu de Vento Bom | A mensagem se espalha, a pipa sobe rápido. |
| 5 | Tecnologia | 🌬️ Céu de Vento Intenso | Ferramentas ágeis, lidando com alta velocidade. |
| 6 | Indicadores Sociais | ☀️ Céu Ensolarado | Visibilidade total, clareza sobre o impacto gerado. |
| 7 | Captação de Recursos | 🌤️ Céu Azul Aberto | Expansão de horizontes, sem limites para crescer. |
| 8 | Financeiro | 🌈 Céu com Arco-íris | A organização e a sustentabilidade (o pote de ouro/recursos bem geridos). |
| 9 | Diretoria | 🌌 Céu Estrelado | O ápice do voo (Visão macro, governança, guiando o Ádapo pelas estrelas). |

### 4.2. Mecânicas Core
* **Moeda/XP:** "Metros de linha" (ganhos ao acertar quizzes).
* **Vidas (Corações):** O usuário perde uma vida ao errar uma questão. Restauram-se com o tempo.
* **Ofensiva (A Chama):** Contador de dias consecutivos de acesso. Se não acessar e fazer uma missão no dia, a ofensiva zera.
* **Ranking:** Placar geral ranqueando os voluntários pela quantidade de "metros de linha" acumulados. (top 3 em destaque)

## 5. Arquitetura do Banco de Dados (Supabase Schema Draft)

### Tabela: `voluntarios`
- `id` (uuid, PK)
- `nome` (text)
- `email` (text)
- `metros_linha` (int, default 0)
- `ofensiva_atual` (int, default 0)
- `vidas_atuais` (int, default 5)
- `ultimo_acesso` (timestamp)

### Tabela: `mundo_ceus`
- `id` (int, PK)
- `nome_tema` (text)
- `clima` (text)
- `ordem` (int)

### Tabela: `progresso`
- `id` (uuid, PK)
- `voluntario_id` (uuid, FK)
- `mundo_id` (int, FK)
- `status` (enum: 'bloqueado', 'ativo', 'concluido')
- `pontuacao_local` (int)

## 6. Fluxos de Tela (Wireframing Mental para a IA)
1. **Onboarding/Login:** Autenticação simples (Magic Link ou Email/Senha via Supabase). Acolhimento com a identidade do Instituto Ádapo.
2. **Dashboard (O Mapa):** Visão vertical. A pipa do usuário no nível atual. Céus acima ficam em tons de cinza/bloqueados. Topbar com contadores de Vidas, Ofensiva e Metros de Linha.
3. **Arena de Quiz:**
   - Tela 1: Pílula de conhecimento (Texto curto puxado do NotebookLM).
   - Tela 2, 3 e 4: Perguntas de múltipla escolha. Feedback imediato (cor verde para acerto + sombreado, vermelho para erro com perda de coração visual).
4. **Ranking:** Lista vertical mostrando a classificação da equipe.

## 7. Retenção e Notificações (Zero-Cost)
* Implementação de rotina no Supabase (Cron Job) que roda diariamente às 18h.
* Regra: Se `ultimo_acesso` do usuário for menor que a data atual (não logou hoje) E `ofensiva_atual` > 0, disparar Web Push Notification ou E-mail (via Resend/Supabase Auth) com a copy: *"Sua pipa está caindo! Entre no Adaptdando para salvar sua ofensiva de X dias."*

## 8. Diretrizes para o Agente de IA (Dev Instructions)
1. **Sempre priorize código limpo e componentizado.**
2. **Design Mobile-First:** A equipe acessará majoritariamente via celular.
3. **Não crie tabelas SQL manualmente:** Utilize o MCP do Supabase para refletir o schema estruturado no item 5.
4. **Mock de Dados:** Enquanto o script do NotebookLM não estiver totalmente plugado, crie um *mock* (JSON estático) de 1 pílula e 3 perguntas para o Mundo 1, apenas para testar o fluxo do frontend.