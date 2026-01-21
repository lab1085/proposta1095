import type { TemplateSections } from "~/types/proposal";

/**
 * Generate template sections with dynamic data
 */
export function generateTemplateSections(
  _clientName: string,
  companyName: string
): TemplateSections {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return {
    cover: {
      logo: "", // To be filled with actual logo path/URL later
      date: formattedDate,
    },
    aboutUs: `Somos uma empresa especializada em soluções digitais, com foco em entregar resultados mensuráveis para nossos clientes. Nossa equipe combina expertise técnica com visão estratégica de negócios, garantindo que cada projeto seja executado com excelência e alinhado aos objetivos do cliente.

Com anos de experiência no mercado, já ajudamos dezenas de empresas a transformarem seus desafios em oportunidades de crescimento através da tecnologia.`,

    nextSteps: `Após a aprovação desta proposta, seguiremos com os seguintes passos:

1. **Kickoff do Projeto**: Reunião inicial para alinhamento de expectativas, apresentação da equipe e definição de canais de comunicação.

2. **Planejamento Detalhado**: Elaboração do cronograma detalhado, definição de marcos e entregas.

3. **Execução**: Desenvolvimento do projeto seguindo as melhores práticas, com atualizações regulares sobre o progresso.

4. **Entrega e Acompanhamento**: Apresentação dos resultados, treinamento (se aplicável) e suporte pós-entrega.

Estamos comprometidos em garantir o sucesso deste projeto e construir uma parceria de longo prazo com ${companyName}.`,

    validity: "Esta proposta tem validade de 30 dias a partir da data de emissão.",
  };
}

/**
 * Get section ordering for the complete proposal
 */
export function getProposalSectionOrder(): string[] {
  return [
    "cover",
    "context",
    "solution",
    "deliverables",
    "timeline",
    "investment",
    "paymentTerms",
    "aboutUs",
    "nextSteps",
    "validity",
  ];
}
