"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProposalEditor, type ProposalEditorRef } from "@/components/proposal-editor";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const STORAGE_KEYS = {
  formData: "proposal-form-data",
  deliverables: "proposal-deliverables",
  sections: "proposal-sections",
};

interface DeliverableItem {
  id: string;
  value: string;
}

export function ProposalForm() {
  const editorRef = useRef<ProposalEditorRef>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem(STORAGE_KEYS.formData);
      const savedDeliverables = localStorage.getItem(STORAGE_KEYS.deliverables);
      const savedSections = localStorage.getItem(STORAGE_KEYS.sections);

      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
      if (savedDeliverables) {
        setDeliverableItems(JSON.parse(savedDeliverables));
      }
      if (savedSections) {
        setProposalSections(JSON.parse(savedSections));
      }
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
    }
    setIsHydrated(true);
  }, []);

  // Save formData to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(formData));
    } catch (err) {
      console.error("Failed to save formData:", err);
    }
  }, [formData, isHydrated]);

  // Save deliverableItems to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.deliverables, JSON.stringify(deliverableItems));
    } catch (err) {
      console.error("Failed to save deliverables:", err);
    }
  }, [deliverableItems, isHydrated]);

  // Save proposalSections to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (proposalSections) {
        localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(proposalSections));
      }
    } catch (err) {
      console.error("Failed to save sections:", err);
    }
  }, [proposalSections, isHydrated]);

  // Detect screen size - only render one layout at a time
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const clearAllStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.formData);
    localStorage.removeItem(STORAGE_KEYS.deliverables);
    localStorage.removeItem(STORAGE_KEYS.sections);
    editorRef.current?.clearStorage();
  };

  const resetAll = () => {
    clearAllStorage();
    setFormData({
      clientName: "",
      company: "",
      problemDescription: "",
      solutionDescription: "",
      deliverables: [""],
      timeline: "",
      value: 0,
      paymentTerms: PAYMENT_TERMS_OPTIONS[0],
    });
    setDeliverableItems([{ id: crypto.randomUUID(), value: "" }]);
    setProposal(null);
    setProposalSections(null);
    setErrors({});
    setApiError(null);
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

    // Clear existing proposal when loading test data
    setProposalSections(null);
    clearAllStorage();

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
      // Clear editor storage before setting new sections (regeneration)
      editorRef.current?.clearStorage();
      setProposal(data.proposal);
      setProposalSections(data.sections);
    } catch (error) {
      console.error("Error generating proposal:", error);
      setApiError(error instanceof Error ? error.message : "Failed to generate proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Content Component (reusable for both split view and tabs)
  const FormContent = () => (
    <>
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

      {/* Submit Button - only show if no proposal generated */}
      {!proposalSections && (
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Gerando proposta..." : "Gerar Proposta"}
        </Button>
      )}
    </>
  );

  // Single Proposal Card - renders editor only once
  const ProposalCard = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl sm:text-2xl">✨ Proposta Gerada</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => editorRef.current?.exportToPDF()}
              variant="outline"
              size="sm"
            >
              📄 Exportar PDF
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="outline"
              size="sm"
            >
              🔄 Regenerar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {proposalSections && <ProposalEditor ref={editorRef} sections={proposalSections} />}
      </CardContent>
    </Card>
  );

  // Header component shared across layouts
  const Header = () => (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Proposal1095</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Preencha os dados para gerar sua proposta comercial
        </p>
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          type="button"
          onClick={loadTestData}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          🧪 Teste
        </Button>
        <Button type="button" onClick={resetAll} variant="ghost" className="flex-1 sm:flex-none">
          🗑️ Limpar
        </Button>
      </div>
    </div>
  );

  // Desktop split-view layout with independent scroll areas
  if (proposalSections && isDesktop) {
    return (
      <form onSubmit={handleSubmit} className="fixed inset-0 flex flex-col">
        <div className="shrink-0 border-b bg-background px-6 py-4">
          <div className="mx-auto max-w-7xl">
            <Header />
          </div>
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-6 px-6">
          <div className="w-[45%] overflow-y-auto pr-4 pt-4">
            <div className="space-y-8 pb-6">
              <FormContent />
            </div>
          </div>
          <div className="w-[55%] overflow-y-auto pl-2 pt-4">
            <div className="pb-6">
              <ProposalCard />
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Default layout (no proposal or mobile/tablet)
  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 flex flex-col">
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <Header />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6">
        <div className="mx-auto max-w-7xl space-y-6 py-6">
          {/* Before proposal is generated - single column form */}
          {!proposalSections && (
            <div className="mx-auto max-w-3xl space-y-8">
              <FormContent />
            </div>
          )}

          {/* Mobile/Tablet Tabs */}
          {proposalSections && !isDesktop && (
            <Tabs defaultValue="proposal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form">Formulário</TabsTrigger>
                <TabsTrigger value="proposal">Proposta</TabsTrigger>
              </TabsList>
              <TabsContent value="form" className="space-y-8">
                <FormContent />
              </TabsContent>
              <TabsContent value="proposal">
                <ProposalCard />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </form>
  );
}
