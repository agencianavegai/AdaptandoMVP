# Seed via NotebookLM - Fase P0.5

Este script (`seed-from-notebooklm.ts`) automatiza a geração de conteúdo (Pílulas de Leitura e Quizzes) para os 10 Mundos do app Adaptando.
Ele consulta o NotebookLM localmente através da CLI (`nlm`) preexistente na sua máquina e injeta os dados relacionalmente no Supabase.

## 🛠️ Pré-requisitos

1. **Supabase**: Você precisa ter um projeto Supabase rodando, e o banco já estar com o schema pronto (Tabelas `mundo_ceus`, `pilulas`, `quizzes`).
2. **.env**: Garanta que o `.env` na raiz do projeto (`../../.env`) contém as seguintes chaves de ambiente:
   ```env
   VITE_SUPABASE_URL=sua-url-do-supabase
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```
   > **Atenção:** Como estamos bypassando RLS via backend script em algumas partes para inserir entidades estáticas, usar a `SERVICE_ROLE_KEY` e não a ANNON KEY é altamente recomendado (porém o script tem fallback caso encontre a ANNON KEY).
3. **NotebookLM CLI**: O comando `nlm` precisa estar disponível no terminal/sistema (você já está logado).

## 🚀 Como Executar

Abra o terminal na **raiz do projeto** e execute:

```bash
npx tsx scripts/seed/seed-from-notebooklm.ts
```

*(Caso não tenha o `tsx` instalado localmente, o `npx` fará o download temporário e ele compilará o TypeScript na hora!)*

## 🛡️ Engenharia de Resiliência Inclusa

- **Prevenção de Duplicata:** O script verifica se o Mundo já possui uma "Pílula" (Mundo_ID) antes de consultar a IA. Se a conexão cair no meio, você pode rodar novamente sem duplicar tudo.
- **Formatação de JSON:** Utilizamos Prompt Engineering restritivo para pedir à IA *apenas* JSON válido, blindando o script contra textos introdutórios inconvenientes que quebrariam o parsing.
- **Exponential Backoff:** Se uma requisição para a IA falhar (piora de latência, Rate Limit, ou "Alucinação" gerando JSON corrompido), o script entra em Backoff Térmico (espera 15s na primeira tentativa, 30s na segunda) e tenta novamente. Após 3 tentativas frustradas, pula para não travar a esteira.

*Dica: Deixe rodando e acompanhe os logs coloridos pelo terminal!*
