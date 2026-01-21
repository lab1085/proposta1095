# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proposta1095 is an AI-powered commercial proposal generator. Users fill out a form with client/project details, AI generates context and solution sections, and the result is an editable BlockNote document exportable as PDF.

## Commands

```bash
# Development (runs on port 3800)
bun dev

# Build
bun run build

# Lint and format
bun run lint          # Check with Biome
bun run lint:fix      # Fix lint issues
bun run format        # Check formatting
bun run format:fix    # Fix formatting

# Type checking
bun run type-check
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router
- **React 19** with React Compiler
- **BlockNote** - Notion-style WYSIWYG editor
- **OpenRouter** - LLM gateway (via Vercel AI SDK)
- **Biome** - Linting and formatting
- **Tailwind CSS v4** with shadcn/ui components

### Key Files

- `src/app/page.tsx` - Main page, renders ProposalForm
- `src/components/proposal-form.tsx` - Form with localStorage persistence, handles API calls, responsive layout (split view on desktop, tabs on mobile)
- `src/components/proposal-editor.tsx` - BlockNote editor wrapper with PDF export via @blocknote/xl-pdf-exporter
- `src/app/api/generate-proposal/route.ts` - API endpoint that calls OpenRouter to generate AI content
- `src/lib/prompts.ts` - LLM prompt templates for context and solution sections
- `src/lib/assembler.ts` - Combines form data, AI content, and templates into proposal structure
- `src/lib/templates.ts` - Fixed content templates (about us, next steps, validity)
- `src/lib/blocknote-converter.ts` - Converts ProposalSection[] to BlockNote blocks
- `src/types/proposal.ts` - TypeScript interfaces for all data structures

### Data Flow

1. User fills form in `ProposalForm`
2. Form submits to `/api/generate-proposal`
3. API calls OpenRouter in parallel for context and solution sections
4. `assembleProposal()` combines all data
5. `createProposalSections()` structures it for rendering
6. `ProposalEditor` displays in BlockNote, user can edit
7. PDF export uses `@blocknote/xl-pdf-exporter` with `@react-pdf/renderer`

### Environment Variables

Required in `.env.local`:
```
OPENROUTER_API_KEY=your_key_here
```

## Conventions

- Use `catch (err)` and `console.error` in try/catch blocks
- Never use the `any` type
- Keep method names concise and contextual (e.g., `create` not `createMemberWithTransaction`)
