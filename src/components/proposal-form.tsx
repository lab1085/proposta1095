"use client";

import { useState } from "react";
import type {
  FormErrors,
  ProposalContent,
  ProposalFormData,
  ProposalSection,
} from "@/types/proposal";

const PAYMENT_TERMS_OPTIONS = [
  "50% entrada, 50% entrega",
  "30% entrada, 40% meio, 30% entrega",
  "100% entrada",
  "Personalizado",
];

interface DeliverableItem {
  id: string;
  value: string;
}

export function ProposalForm() {
  const [formData, setFormData] = useState<ProposalFormData>({
    clientName: "",
    company: "",
    problemDescription: "",
    solutionDescription: "",
    deliverables: [""],
    timeline: "",
    value: 0,
    paymentTerms: PAYMENT_TERMS_OPTIONS[0],
  });

  const [deliverableItems, setDeliverableItems] = useState<DeliverableItem[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_proposal, setProposal] = useState<ProposalContent | null>(null);
  const [proposalSections, setProposalSections] = useState<ProposalSection[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (data: ProposalFormData = formData): boolean => {
    const newErrors: FormErrors = {};

    if (!data.clientName.trim()) {
      newErrors.clientName = "Nome do cliente é obrigatório";
    }

    if (!data.company.trim()) {
      newErrors.company = "Nome da empresa é obrigatório";
    }

    if (!data.problemDescription.trim()) {
      newErrors.problemDescription = "Descrição do problema é obrigatória";
    }

    if (!data.solutionDescription.trim()) {
      newErrors.solutionDescription = "Descrição da solução é obrigatória";
    }

    const validDeliverables = data.deliverables.filter((d) => d.trim());
    if (validDeliverables.length === 0) {
      newErrors.deliverables = "Adicione pelo menos uma entrega";
    }

    if (!data.timeline.trim()) {
      newErrors.timeline = "Prazo é obrigatório";
    }

    if (!data.value || data.value <= 0) {
      newErrors.value = "Valor deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addDeliverable = () => {
    setDeliverableItems((prev) => [...prev, { id: crypto.randomUUID(), value: "" }]);
  };

  const removeDeliverable = (id: string) => {
    setDeliverableItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDeliverable = (id: string, value: string) => {
    setDeliverableItems((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)));
  };

  const loadTestData = () => {
    const testData: ProposalFormData = {
      clientName: "Maria Silva",
      company: "Café Aroma Brasileiro",
      problemDescription:
        "A cafeteria não possui presença digital efetiva e está perdendo clientes para concorrentes que oferecem pedidos online. O sistema atual de pedidos por telefone é ineficiente e gera erros frequentes.",
      solutionDescription:
        "Desenvolver um aplicativo mobile e website integrados com sistema de pedidos online, pagamento digital e programa de fidelidade. A solução incluirá painel administrativo para gestão de pedidos e cardápio.",
      deliverables: [
        "Aplicativo mobile iOS e Android",
        "Website responsivo com sistema de pedidos",
        "Painel administrativo completo",
        "Integração com sistema de pagamento",
        "Programa de fidelidade e cupons",
        "Treinamento da equipe",
      ],
      timeline: "12 semanas",
      value: 85000,
      paymentTerms: PAYMENT_TERMS_OPTIONS[1],
    };

    setFormData(testData);
    setDeliverableItems(
      testData.deliverables.map((value) => ({
        id: crypto.randomUUID(),
        value,
      }))
    );
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sync deliverableItems to formData before validation
    const deliverables = deliverableItems.map((item) => item.value);
    const updatedFormData = { ...formData, deliverables };

    if (!validateForm(updatedFormData)) {
      return;
    }

    setFormData(updatedFormData);
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to generate proposal");
      }

      const data = await response.json();
      setProposal(data.proposal);
      setProposalSections(data.sections);
    } catch (error) {
      console.error("Error generating proposal:", error);
      setApiError(error instanceof Error ? error.message : "Failed to generate proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerador de Propostas</h1>
            <p className="text-muted-foreground">
              Preencha os dados para gerar sua proposta comercial
            </p>
          </div>
          <button
            type="button"
            onClick={loadTestData}
            className="rounded-md border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            🧪 Carregar Dados de Teste
          </button>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Informações do Cliente</h2>

        <div className="space-y-2">
          <label htmlFor="clientName" className="block text-sm font-medium">
            Nome do Cliente *
          </label>
          <input
            id="clientName"
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="João Silva"
          />
          {errors.clientName && <p className="text-sm text-red-600">{errors.clientName}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-medium">
            Empresa *
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Restaurante Sabor & Arte"
          />
          {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Problema e Solução</h2>

        <div className="space-y-2">
          <label htmlFor="problemDescription" className="block text-sm font-medium">
            Descrição do Problema *
          </label>
          <textarea
            id="problemDescription"
            value={formData.problemDescription}
            onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
            rows={4}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Descreva brevemente o problema do cliente (2-3 frases)"
          />
          {errors.problemDescription && (
            <p className="text-sm text-red-600">{errors.problemDescription}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="solutionDescription" className="block text-sm font-medium">
            Descrição da Solução *
          </label>
          <textarea
            id="solutionDescription"
            value={formData.solutionDescription}
            onChange={(e) => setFormData({ ...formData, solutionDescription: e.target.value })}
            rows={4}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Descreva brevemente a solução proposta"
          />
          {errors.solutionDescription && (
            <p className="text-sm text-red-600">{errors.solutionDescription}</p>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Entregas</h2>
          <button
            type="button"
            onClick={addDeliverable}
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            + Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {deliverableItems.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateDeliverable(item.id, e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Entrega ${index + 1}`}
              />
              {deliverableItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeliverable(item.id)}
                  className="rounded-md border px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>

        {errors.deliverables && <p className="text-sm text-red-600">{errors.deliverables}</p>}
      </div>

      {/* Timeline & Budget */}
      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Cronograma e Investimento</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="timeline" className="block text-sm font-medium">
              Prazo *
            </label>
            <input
              id="timeline"
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="8 semanas"
            />
            {errors.timeline && <p className="text-sm text-red-600">{errors.timeline}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="value" className="block text-sm font-medium">
              Valor (R$) *
            </label>
            <input
              id="value"
              type="number"
              value={formData.value || ""}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="45000"
              min="0"
              step="0.01"
            />
            {errors.value && <p className="text-sm text-red-600">{errors.value}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="paymentTerms" className="block text-sm font-medium">
            Condições de Pagamento
          </label>
          <select
            id="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PAYMENT_TERMS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="font-semibold text-red-800">Erro ao gerar proposta</p>
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {/* Generated Proposal */}
      {proposalSections && (
        <div className="space-y-6 rounded-lg border bg-gradient-to-br from-green-50 to-blue-50 p-6">
          <h2 className="text-2xl font-bold text-green-800">✨ Proposta Gerada</h2>

          <div className="space-y-6">
            {proposalSections.map((section) => (
              <div key={section.id} className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">{section.title}</h3>

                {section.type === "heading" && Array.isArray(section.content) && (
                  <div className="space-y-1 text-gray-700">
                    {section.content.map((line) => (
                      <p key={line} className="text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {section.type === "text" && typeof section.content === "string" && (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {section.content}
                  </div>
                )}

                {section.type === "list" && Array.isArray(section.content) && (
                  <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                    {section.content.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Gerando proposta..." : "Gerar Proposta"}
      </button>
    </form>
  );
}
