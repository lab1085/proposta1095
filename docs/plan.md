# PropostaAI - Execution Plan

This document outlines the phased approach to building the PropostaAI application based on the requirements in the PRD.

---

## **Phase 1: Foundation & Data Flow** ⚙️

**Goal:** Establish the basic form structure and data types that will drive the entire application.

### Tasks:
- [ ] Define TypeScript types/interfaces for all proposal data
  - `ProposalFormData` (form inputs)
  - `ProposalContent` (complete proposal structure)
  - `ProposalSection` types
- [ ] Create form component with all required inputs:
  - Nome do cliente
  - Empresa
  - Descrição do problema (textarea)
  - Descrição da solução (textarea)
  - Entregas (dynamic list with add/remove)
  - Prazo
  - Valor
  - Condições de pagamento
- [ ] Implement form validation
  - Required field checks
  - Input format validation
- [ ] Set up state management for form data
- [ ] Create form submission handler

**Deliverable:** ✅ Working form that collects all necessary data with validation.

**Files Created:**
- `src/types.ts` - All TypeScript interfaces and types
- `src/ProposalForm.tsx` - Complete form component with validation

**Files Updated:**
- `src/App.tsx` - Now renders ProposalForm

---

## **Phase 2: AI Integration** 🤖

**Goal:** Connect to OpenRouter and implement AI content generation for "Contexto" and "Solução" sections.

### Tasks:
- [ ] Set up OpenRouter configuration
  - API key management
  - Model selection
- [ ] Create API route `/api/generate-proposal`
  - Handle form data input
  - Call OpenRouter API
- [ ] Implement prompt templates:
  - Contexto/Problema prompt
  - Solução prompt
- [ ] Build prompt injection logic with form data
- [ ] Handle AI responses and error cases
- [ ] Implement loading state UI during generation
- [ ] Add retry logic for failed API calls

**Deliverable:** Working AI generation endpoint that produces "Contexto" and "Solução" content.

---

## **Phase 3: Content Assembly** 📄

**Goal:** Combine AI-generated content with templates and user inputs into a complete proposal document.

### Tasks:
- [ ] Create template sections:
  - Capa (logo, client name, date)
  - Sobre nós (fixed institutional text)
  - Próximos passos (fixed CTA text)
  - Validade (30 days standard)
- [ ] Build content assembly function:
  - Merge AI content
  - Insert user inputs (entregas, prazo, valor, condições)
  - Insert template sections
- [ ] Define proposal structure/order
- [ ] Format content for BlockNote consumption
- [ ] Create helper functions for content transformation

**Deliverable:** Complete proposal content structure ready for editor.

---

## **Phase 4: BlockNote Editor Integration** ✏️

**Goal:** Integrate BlockNote editor and enable content editing functionality.

### Tasks:
- [ ] Install BlockNote dependencies
  ```bash
  bun add @blocknote/core @blocknote/react
  ```
- [ ] Create BlockNote editor component
- [ ] Convert proposal structure to BlockNote schema
- [ ] Initialize editor with generated content
- [ ] Enable full editing capabilities
- [ ] Implement "Regenerar" button:
  - Keep form data
  - Re-call AI API
  - Update editor content
- [ ] Handle editor state management

**Deliverable:** Fully functional editor with generated content that users can modify.

---

## **Phase 5: Preview & PDF Export** 🖨️

**Goal:** Create preview functionality and implement PDF export using browser print.

### Tasks:
- [ ] Build split-view layout:
  - Editor pane (50%)
  - Preview pane (50%)
  - Toggle for mobile
- [ ] Create preview component:
  - Render BlockNote content as HTML
  - Apply print-ready styling
- [ ] Implement CSS `@media print` rules:
  - A4 page size
  - Proper margins
  - Hide UI elements (`.no-print`)
  - Page break rules
  - Section formatting
- [ ] Add "Exportar PDF" button
- [ ] Implement `window.print()` functionality
- [ ] Test PDF output formatting

**Deliverable:** Working preview and PDF export with proper formatting.

---

## **Phase 6: Polish & Testing** ✨

**Goal:** Refine UX, handle edge cases, and ensure quality.

### Tasks:
- [ ] Responsive design:
  - Mobile layout
  - Tablet layout
  - Desktop layout
- [ ] Error handling:
  - AI API failures
  - Network errors
  - Invalid inputs
  - User-friendly error messages
- [ ] UX improvements:
  - Loading animations
  - Smooth transitions
  - Success feedback
  - Clear instructions
- [ ] End-to-end testing:
  - Form submission flow
  - AI generation
  - Content editing
  - PDF export
- [ ] Cross-browser testing:
  - Chrome
  - Safari
  - Firefox
- [ ] Performance optimization
- [ ] Accessibility considerations

**Deliverable:** Production-ready application.

---

## Success Criteria

The project is complete when:

✅ User fills form and clicks "Gerar"
✅ AI generates content for "Contexto" and "Solução" sections
✅ Complete proposal appears in BlockNote editor
✅ User can edit any part of the content
✅ Preview shows accurate PDF representation
✅ "Exportar PDF" generates properly formatted document

---

## Technical Stack Reference

| Technology | Purpose |
|------------|---------|
| Next.js | Fullstack framework |
| BlockNote | WYSIWYG editor (Notion-style) |
| OpenRouter | LLM gateway |
| CSS @media print | PDF generation via browser |

---

## Out of Scope

❌ No database/persistence
❌ No authentication/login
❌ No proposal history
❌ No multiple templates
❌ No logo upload (hardcoded)
❌ No email sending

---

## Next Steps

**Start with Phase 1:** Foundation & Data Flow

Begin by defining the TypeScript types and creating the form component. This establishes the data structure that all other phases will build upon.
