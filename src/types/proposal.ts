// Form data structure - what the user inputs
export interface ProposalFormData {
  clientName: string;
  company: string;
  problemDescription: string;
  solutionDescription: string;
  deliverables: string[];
  timeline: string;
  value: number;
  paymentTerms: string;
}

// AI generated content
export interface AIGeneratedContent {
  context: string; // "Contexto" section
  solution: string; // "Solução" section
}

// Template sections (fixed content)
export interface TemplateSections {
  cover: {
    logo: string;
    date: string;
  };
  aboutUs: string;
  nextSteps: string;
  validity: string;
}

// Complete proposal structure
export interface ProposalContent {
  form: ProposalFormData;
  aiContent: AIGeneratedContent;
  templates: TemplateSections;
}

// Individual proposal section
export interface ProposalSection {
  id: string;
  title: string;
  content: string | string[];
  type: "text" | "list" | "heading";
}

// Form validation errors
export interface FormErrors {
  clientName?: string;
  company?: string;
  problemDescription?: string;
  solutionDescription?: string;
  deliverables?: string;
  timeline?: string;
  value?: string;
  paymentTerms?: string;
}
