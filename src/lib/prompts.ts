import type { ProposalFormData } from "@/types/proposal";

/**
 * Generate prompt for "Contexto/Problema" section
 */
export function generateContextPrompt(formData: ProposalFormData): string {
  return `Você é um especialista em redação comercial e propostas de negócios.

Com base nas seguintes informações sobre o cliente e o projeto, escreva uma seção detalhada e profissional de "Contexto/Problema" para uma proposta comercial:

**Cliente:** ${formData.clientName}
**Empresa:** ${formData.company}
**Descrição do Problema:** ${formData.problemDescription}

**Instruções:**
- Escreva em português brasileiro, de forma clara e profissional
- Comece contextualizando a situação atual do cliente
- Destaque os desafios e dores que o cliente enfrenta
- Explique as consequências de não resolver esse problema
- Use entre 150-250 palavras
- Use tom empático e consultivo
- Não use títulos ou marcadores, apenas texto corrido e bem estruturado

Escreva apenas o texto da seção, sem introduções como "Aqui está..." ou conclusões adicionais.`;
}

/**
 * Generate prompt for "Solução" section
 */
export function generateSolutionPrompt(formData: ProposalFormData): string {
  const deliverablesList = formData.deliverables
    .filter((d) => d.trim() !== "")
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  return `Você é um especialista em redação comercial e propostas de negócios.

Com base nas seguintes informações sobre a solução proposta, escreva uma seção detalhada e profissional de "Solução" para uma proposta comercial:

**Cliente:** ${formData.clientName}
**Empresa:** ${formData.company}
**Descrição da Solução:** ${formData.solutionDescription}
**Prazo:** ${formData.timeline}
**Valor:** R$ ${formData.value}

**Entregas principais:**
${deliverablesList}

**Instruções:**
- Escreva em português brasileiro, de forma clara e profissional
- Explique como a solução resolve os problemas do cliente
- Destaque os benefícios e resultados esperados
- Conecte as entregas aos objetivos do cliente
- Mencione o prazo de forma natural no texto
- Use entre 200-300 palavras
- Use tom confiante e orientado a resultados
- Não use títulos ou marcadores, apenas texto corrido e bem estruturado
- Não mencione valores/preços nesta seção

Escreva apenas o texto da seção, sem introduções como "Aqui está..." ou conclusões adicionais.`;
}
