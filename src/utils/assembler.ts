import type {
  AIGeneratedContent,
  ProposalContent,
  ProposalFormData,
  ProposalSection,
} from "~/types/proposal";
import { generateTemplateSections } from "./templates";

/**
 * Assemble complete proposal from form data, AI content, and templates
 */
export function assembleProposal(
  formData: ProposalFormData,
  aiContent: AIGeneratedContent
): ProposalContent {
  const templates = generateTemplateSections(formData.clientName, formData.company);

  return {
    form: formData,
    aiContent,
    templates,
  };
}

/**
 * Convert proposal content into structured sections for rendering
 */
export function createProposalSections(proposal: ProposalContent): ProposalSection[] {
  const sections: ProposalSection[] = [];

  // Cover
  sections.push({
    id: "cover",
    title: "Proposta Comercial",
    content: [
      `**Cliente:** ${proposal.form.clientName}`,
      `**Empresa:** ${proposal.form.company}`,
      `**Data:** ${proposal.templates.cover.date}`,
    ],
    type: "heading",
  });

  // Context/Problem (AI Generated)
  sections.push({
    id: "context",
    title: "Contexto e Problema",
    content: proposal.aiContent.context,
    type: "text",
  });

  // Solution (AI Generated)
  sections.push({
    id: "solution",
    title: "Solução Proposta",
    content: proposal.aiContent.solution,
    type: "text",
  });

  // Deliverables
  sections.push({
    id: "deliverables",
    title: "Entregas",
    content: proposal.form.deliverables.filter((d) => d.trim() !== ""),
    type: "list",
  });

  // Timeline
  sections.push({
    id: "timeline",
    title: "Prazo de Execução",
    content: proposal.form.timeline,
    type: "text",
  });

  // Investment
  sections.push({
    id: "investment",
    title: "Investimento",
    content: `R$ ${proposal.form.value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    type: "text",
  });

  // Payment Terms
  sections.push({
    id: "paymentTerms",
    title: "Condições de Pagamento",
    content: proposal.form.paymentTerms,
    type: "text",
  });

  // About Us (Template)
  sections.push({
    id: "aboutUs",
    title: "Sobre Nós",
    content: proposal.templates.aboutUs,
    type: "text",
  });

  // Next Steps (Template)
  sections.push({
    id: "nextSteps",
    title: "Próximos Passos",
    content: proposal.templates.nextSteps,
    type: "text",
  });

  // Validity (Template)
  sections.push({
    id: "validity",
    title: "Validade da Proposta",
    content: proposal.templates.validity,
    type: "text",
  });

  return sections;
}

/**
 * Format proposal sections as plain text (for preview/export)
 */
export function formatProposalAsText(sections: ProposalSection[]): string {
  return sections
    .map((section) => {
      let text = `## ${section.title}\n\n`;

      if (Array.isArray(section.content)) {
        text += section.content.map((item, i) => `${i + 1}. ${item}`).join("\n");
      } else {
        text += section.content;
      }

      return text;
    })
    .join("\n\n---\n\n");
}
