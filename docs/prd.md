# PRD: PropostaAI

## Visão Geral

**Produto:** Gerador de Propostas Comerciais com AI

**Problema:** Times comerciais gastam horas escrevendo propostas manualmente. Copiam templates, adaptam texto, formatam documento. Trabalho repetitivo que poderia ser automatizado.

**Solução:** Aplicação web que recebe inputs básicos do cliente/projeto e gera proposta comercial completa, editável e exportável como PDF.

**Valor:** Proposta que levava 1-2 horas sai em minutos. Texto personalizado, não genérico.

---

## Stack Técnica

| Tecnologia | Função |
|------------|--------|
| Next.js | Framework fullstack |
| BlockNote | Editor WYSIWYG (estilo Notion) |
| OpenRouter | Gateway para LLM |
| CSS @media print | Geração de PDF via browser |

---

## Estrutura da Proposta

| Seção | Origem | Descrição |
|-------|--------|-----------|
| **Capa** | Template + Input | Logo (hardcoded), nome do cliente, data |
| **Sobre nós** | Template | Texto institucional fixo |
| **Contexto** | AI | Usuário descreve problema em 2-3 frases, AI expande |
| **Solução** | AI | Usuário descreve solução brevemente, AI detalha escopo e approach |
| **Entregas** | Input | Lista de deliverables |
| **Cronograma** | Input | Prazo estimado |
| **Investimento** | Input | Valor do projeto |
| **Condições** | Template + Input | Padrão (ex: 50% entrada, 50% entrega), editável |
| **Próximos passos** | Template | Texto padrão de CTA |
| **Validade** | Template | 30 dias |

---

## Fluxo do Usuário

```
┌─────────────────────────────────────────────────────────────┐
│  1. FORMULÁRIO                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cliente: [nome, empresa]                            │   │
│  │ Problema: [textarea - descrição breve]              │   │
│  │ Solução: [textarea - descrição breve]               │   │
│  │ Entregas: [lista de items]                          │   │
│  │ Prazo: [input]                                      │   │
│  │ Valor: [input]                                      │   │
│  │ Condições: [select ou input]                        │   │
│  │                                                     │   │
│  │              [Gerar Proposta]                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. LOADING                                                 │
│                                                             │
│  AI gerando proposta...                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. EDITOR + PREVIEW                                        │
│  ┌──────────────────────┬──────────────────────────────┐   │
│  │                      │                              │   │
│  │  BlockNote Editor    │     Preview (como PDF)       │   │
│  │                      │                              │   │
│  │  [edita conteúdo]    │     [visualiza resultado]    │   │
│  │                      │                              │   │
│  └──────────────────────┴──────────────────────────────┘   │
│                                                             │
│  [Regenerar com AI]                    [Exportar PDF]       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. EXPORTAR                                                │
│                                                             │
│  window.print() → Diálogo do browser → Salvar como PDF      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Inputs do Formulário

| Campo | Tipo | Obrigatório | Exemplo |
|-------|------|-------------|---------|
| Nome do cliente | text | Sim | "João Silva" |
| Empresa | text | Sim | "Restaurante Sabor & Arte" |
| Descrição do problema | textarea | Sim | "Restaurante perde clientes por não ter delivery próprio, depende de iFood" |
| Descrição da solução | textarea | Sim | "App de delivery white-label integrado ao sistema atual" |
| Entregas | lista (adicionar/remover) | Sim | "App iOS", "App Android", "Painel admin" |
| Prazo | text | Sim | "8 semanas" |
| Valor | number | Sim | 45000 |
| Condições de pagamento | select/text | Não | "50% entrada, 50% entrega" |

---

## Geração com AI

**Prompt para Contexto/Problema:**
```
Você é um redator de propostas comerciais.

Dado o problema descrito pelo cliente, escreva uma seção "Contexto" para uma proposta comercial.
- Tom profissional mas acessível
- Demonstre entendimento do problema
- 2-3 parágrafos
- Não invente dados, use apenas o que foi fornecido

Cliente: {empresa}
Problema descrito: {problema_input}
```

**Prompt para Solução:**
```
Você é um redator de propostas comerciais.

Dado a solução proposta, escreva uma seção "Solução" para uma proposta comercial.
- Tom profissional mas acessível
- Detalhe o approach e benefícios
- 2-3 parágrafos
- Não invente dados, use apenas o que foi fornecido

Problema: {problema_input}
Solução descrita: {solucao_input}
Entregas: {entregas_lista}
```

---

## Telas

### Tela 1: Formulário
- Header com logo
- Formulário com todos os inputs
- Botão "Gerar Proposta"
- Validação básica (campos obrigatórios)

### Tela 2: Editor + Preview
- Split view (50/50 ou toggle mobile)
- Esquerda: BlockNote com conteúdo gerado
- Direita: Preview estilizado (como ficará no PDF)
- Botão "Regenerar" (chama AI de novo)
- Botão "Exportar PDF" (abre print dialog)

---

## CSS para Print

```css
@media print {
  /* Esconde elementos de UI */
  .no-print { display: none; }

  /* Reset para impressão */
  body { margin: 0; }

  /* Configuração de página */
  @page {
    size: A4;
    margin: 2cm;
  }

  /* Quebras de página */
  .section { page-break-inside: avoid; }
  h2 { page-break-after: avoid; }
}
```

---

## Escopo Negativo (não faz)

- ❌ Não salva propostas (sem DB)
- ❌ Não tem login/autenticação
- ❌ Não tem histórico
- ❌ Não tem múltiplos templates
- ❌ Não faz upload de logo (hardcoded)
- ❌ Não envia proposta por email

---

## Critérios de Sucesso

O projeto está completo quando:
1. Usuário preenche form e clica "Gerar"
2. AI gera conteúdo das seções Contexto e Solução
3. Proposta aparece no editor BlockNote
4. Usuário pode editar qualquer parte
5. Preview mostra como ficará o PDF
6. Exportar PDF gera documento formatado corretamente