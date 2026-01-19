"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerador de Propostas</h1>
            <p className="text-muted-foreground">
              Preencha os dados para gerar sua proposta comercial
            </p>
          </div>
          <Button
            type="button"
            onClick={loadTestData}
            variant="outline"
            className="w-full sm:w-auto"
          >
            🧪 Carregar Dados de Teste
          </Button>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="João Silva"
            />
            {errors.clientName && <p className="text-sm text-destructive">{errors.clientName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Restaurante Sabor & Arte"
            />
            {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Problem & Solution */}
      <Card>
        <CardHeader>
          <CardTitle>Problema e Solução</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problemDescription">Descrição do Problema *</Label>
            <Textarea
              id="problemDescription"
              value={formData.problemDescription}
              onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
              rows={4}
              placeholder="Descreva brevemente o problema do cliente (2-3 frases)"
            />
            {errors.problemDescription && (
              <p className="text-sm text-destructive">{errors.problemDescription}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutionDescription">Descrição da Solução *</Label>
            <Textarea
              id="solutionDescription"
              value={formData.solutionDescription}
              onChange={(e) => setFormData({ ...formData, solutionDescription: e.target.value })}
              rows={4}
              placeholder="Descreva brevemente a solução proposta"
            />
            {errors.solutionDescription && (
              <p className="text-sm text-destructive">{errors.solutionDescription}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entregas</CardTitle>
            <Button type="button" onClick={addDeliverable} size="sm">
              + Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliverableItems.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <Input
                value={item.value}
                onChange={(e) => updateDeliverable(item.id, e.target.value)}
                placeholder={`Entrega ${index + 1}`}
              />
              {deliverableItems.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeDeliverable(item.id)}
                  variant="destructive"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.deliverables && <p className="text-sm text-destructive">{errors.deliverables}</p>}
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma e Investimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeline">Prazo *</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="8 semanas"
              />
              {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value || ""}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                placeholder="45000"
                min="0"
                step="0.01"
              />
              {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
            <Select
              value={formData.paymentTerms}
              onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Error */}
      {apiError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="font-semibold text-destructive">Erro ao gerar proposta</p>
            <p className="text-sm text-muted-foreground">{apiError}</p>
          </CardContent>
        </Card>
      )}

      {/* Generated Proposal */}
      {proposalSections && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">✨ Proposta Gerada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {proposalSections.map((section) => (
              <Card key={section.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.type === "heading" && Array.isArray(section.content) && (
                    <div className="space-y-1 text-muted-foreground">
                      {section.content.map((line) => (
                        <p key={line} className="text-sm">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.type === "text" && typeof section.content === "string" && (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {section.content}
                    </div>
                  )}

                  {section.type === "list" && Array.isArray(section.content) && (
                    <ul className="list-inside list-disc space-y-2 text-sm text-foreground">
                      {section.content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Gerando proposta..." : "Gerar Proposta"}
      </Button>
    </form>
  );
}
