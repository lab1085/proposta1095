import type { ProposalFormData } from "~/types/proposal";

/**
 * Generate prompt for "Contexto/Problema" section
 */
export function generateContextPrompt(formData: ProposalFormData): string {
  return `Você é um redator de propostas comerciais. Seu estilo é direto, claro e profissional.

Escreva a seção "Contexto e Problema" para uma proposta comercial.

**Dados do cliente:**
- Empresa: ${formData.company}
- Contato: ${formData.clientName}
- Problema relatado: ${formData.problemDescription}

**Formato obrigatório:**
- 2 a 3 parágrafos curtos (3-4 frases cada)
- Máximo 100 palavras no total
- Português brasileiro

**Estrutura:**
1. Primeiro parágrafo: situação atual do cliente
2. Segundo parágrafo: impacto do problema no negócio
3. (Opcional) Terceiro parágrafo: consequência de não agir

**Regras de estilo:**
- Tom profissional e direto, sem exageros
- NUNCA invente estatísticas, porcentagens ou dados não fornecidos
- NUNCA use frases genéricas de marketing como "em um mundo cada vez mais digitalizado"
- Evite adjetivos desnecessários e linguagem emocional
- Seja específico ao problema descrito, não generalize

Responda APENAS com o texto da seção, sem comentários.`;
}

/**
 * Generate prompt for "Solução" section
 */
export function generateSolutionPrompt(formData: ProposalFormData): string {
  const deliverablesList = formData.deliverables
    .filter((d) => d.trim() !== "")
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  return `Você é um redator de propostas comerciais. Seu estilo é direto, claro e profissional.

Escreva a seção "Solução Proposta" para uma proposta comercial.

**Dados do projeto:**
- Empresa: ${formData.company}
- Solução descrita: ${formData.solutionDescription}
- Prazo: ${formData.timeline}

**Entregas previstas:**
${deliverablesList}

**Formato obrigatório:**
- 2 a 3 parágrafos curtos (3-4 frases cada)
- Máximo 120 palavras no total
- Português brasileiro

**Estrutura:**
1. Primeiro parágrafo: o que será entregue e como resolve o problema
2. Segundo parágrafo: benefícios concretos para o cliente
3. (Opcional) Mencione o prazo naturalmente

**Regras de estilo:**
- Tom profissional e confiante, sem exageros
- NUNCA invente estatísticas, projeções ou promessas de resultado (ex: "aumento de 40%")
- NUNCA use frases genéricas como "solução completa e inovadora"
- Foque nas entregas concretas listadas, não invente funcionalidades
- NÃO mencione valores ou preços
- Seja específico, não genérico

Responda APENAS com o texto da seção, sem comentários.`;
}
