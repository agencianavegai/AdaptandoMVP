# Prompt para NotebookLM — Geração de Cruzada Mundo 1: Voluntariado

Preciso criar uma cruzada (palavras cruzadas) estilo revista Coquetel/Passatempo sobre o tema **VOLUNTARIADO** para um jogo educativo mobile.

---

## PARTE 1 — PALAVRAS DA CRUZADA

Gere uma lista de **exatamente 20 palavras** relacionadas a voluntariado e trabalho voluntário no Brasil.

### REGRAS OBRIGATÓRIAS:
- Cada palavra deve ter entre **3 e 7 letras** (NÃO MAIS que 7)
- Todas em **MAIÚSCULAS**
- **SEM acentos** (ex: ACAO e não AÇÃO, DOACAO e não DOAÇÃO, UNIAO e não UNIÃO)
- Apenas **UMA palavra** (sem espaços, hífens ou caracteres especiais)
- Devem usar **letras comuns** (A, E, O, S, R, I, N, T, D, C, L, M) para facilitar cruzamentos entre palavras
- Todas devem estar diretamente relacionadas ao universo do voluntariado conforme os documentos fornecidos

### Para CADA palavra, forneça:

| Campo | Descrição |
|-------|-----------|
| `palavra` | A palavra em MAIÚSCULAS, sem acento |
| `dica_curta` | 2-4 palavras (para caber visualmente dentro de uma célula pequena do grid) |
| `dica_completa` | 1 frase, máximo 15 palavras (aparece quando o jogador toca na célula da dica) |
| `letras` | Número de letras da palavra |

### Formato de saída EXATO (copie esta estrutura):

```
PALAVRA | dica_curta | dica_completa | letras
--------|-----------|---------------|-------
AJUDA   | Dar suporte | Prestar auxílio voluntário a quem precisa de apoio | 5
CAUSA   | Motivo nobre | Propósito social que motiva o voluntário a agir | 5
ONG     | Entidade civil | Organização não governamental que coordena voluntários | 3
```

### EXEMPLOS do tipo de palavras que espero (use como inspiração, não copie):
AJUDA, CAUSA, ACAO, REDES, DOAR, ONG, TEMPO, GRUPO, AMOR, SOCIAL, SERVIR, GESTO, META, AGIR, ATIVO, DEVER, CUIDAR, UNIAO, VIDA, REDE, BEM, LAR, SER, DAR, PAZ

### IMPORTANTE sobre tamanhos:
- Pelo menos **4 palavras de 3 letras** (ex: ONG, DAR, SER, BEM)
- Pelo menos **5 palavras de 4 letras** (ex: ACAO, DOAR, AMOR, META, AGIR)
- Pelo menos **6 palavras de 5 letras** (ex: AJUDA, CAUSA, GRUPO, GESTO, REDES)
- Pelo menos **3 palavras de 6 letras** (ex: SOCIAL, SERVIR, CUIDAR)
- No máximo **2 palavras de 7 letras** (ex: ADESAO, IMPACTO)
- **ZERO palavras com 8+ letras**

---

## PARTE 2 — PÍLULA DE CONHECIMENTO

Escreva um **parágrafo educativo de 4-5 frases** sobre voluntariado no Brasil.

### Regras:
- O texto **DEVE usar naturalmente TODAS as 20 palavras** da lista acima (integradas nas frases, não listadas)
- Tom inspirador e informativo, como se estivesse ensinando um jovem sobre a importância do voluntariado
- Baseie-se exclusivamente no conteúdo dos documentos fornecidos
- Máximo 150 palavras no total

---

## CONTEXTO DO PROJETO

Este conteúdo será usado em um jogo educativo gamificado (estilo Duolingo) para formação de voluntários. O jogador verá a pílula de texto primeiro (aprendizado), depois resolverá a cruzada onde as respostas são as palavras que ele acabou de ler. É essencial que texto e cruzada se complementem pedagogicamente.
