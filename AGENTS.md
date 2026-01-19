# Agent Rules - PropostaAI

## Project Overview

PropostaAI is an AI-powered commercial proposal generator built with Next.js 15+, designed to help create professional business proposals quickly using AI assistance.

## Tech Stack

### Core Framework
- **Next.js 16.1.3** - React framework with App Router
- **React 19.2.3** - UI library with React Compiler enabled
- **TypeScript 5** - Strict type checking enabled
- **Tailwind CSS v4** - Utility-first styling with @tailwindcss/postcss

### AI Integration
- **Vercel AI SDK v6** (`ai` package) - AI generation framework
- **OpenRouter Provider** (`@openrouter/ai-sdk-provider`) - Community provider for accessing multiple AI models
- **Model**: `anthropic/claude-3.5-sonnet` - Primary AI model for content generation

### Tooling
- **Biome v2.3.11** - Fast linter and formatter (replaces ESLint + Prettier)
- **Commitlint v20.3.1** - Conventional commit message validation
- **Husky v9.1.7** - Git hooks management
- **lint-staged v16.2.7** - Run linters on staged files

### Development
- **npm** - Package manager (NEVER use yarn, pnpm, or bun for installations)
- **Port 3800** - Development server port

## Code Style & Conventions

### General Rules
1. **Use TypeScript for everything** - No `.js` or `.jsx` files
2. **Strict type safety** - No `any` types, always define proper interfaces
3. **ES Modules only** - Project has `"type": "module"` in package.json
4. **Client Components** - Mark interactive components with `"use client"`
5. **English for code ONLY** - All code, variables, functions, types, and comments MUST be in English. Only user-facing text (UI strings, AI prompts) should be in Portuguese

### File Naming
- Components: `kebab-case.tsx` (e.g., `proposal-form.tsx`)
- Types: `kebab-case.ts` (e.g., `proposal.ts`)
- API routes: Follow Next.js convention (e.g., `route.ts`)

### Import Organization
```typescript
// 1. External dependencies
import { useState } from "react";
import { generateText } from "ai";

// 2. Internal aliases
import type { ProposalFormData } from "@/types/proposal";
import { someUtil } from "@/lib/utils";

// 3. Relative imports (avoid if possible)
import { LocalComponent } from "./local-component";
```

### Component Structure
- Use functional components with hooks
- Interfaces at the top of the file
- Helper functions before the main component
- Export component at the bottom

### TypeScript
- Define interfaces in `src/types/`
- Use `type` for unions, `interface` for object shapes
- Export all reusable types
- No implicit `any` - enable strict mode

## Linting & Formatting

### Biome Configuration
- **Line width**: 100 characters
- **Indentation**: 2 spaces (NOT tabs)
- **Tailwind directives**: Enabled in CSS
- **Domains**: Next.js and React rules enabled
- **No array index keys** - Use unique IDs (crypto.randomUUID())

### Commands
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Check formatting
npm run format:fix    # Auto-format files
npm run type-check    # TypeScript validation
```

### Pre-commit Hooks
- **Type check** must pass
- **Lint-staged** runs Biome on staged files
- **Commit message** validated by commitlint

## Git Workflow

### Commit Messages
Follow conventional commits with custom rules:

```
<type>(<scope>): <subject>

<optional body>
```

**Rules:**
- Scope is **REQUIRED** (kebab-case, max 20 chars)
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Subject: lowercase, no period at end

**Examples:**
```bash
git commit -m "feat(phase-2): integrate openrouter ai sdk"
git commit -m "fix(form-validation): handle empty deliverables"
git commit -m "docs(readme): add setup instructions"
```

### Workflow
1. Make changes
2. Run `npm run type-check` and `npm run lint`
3. Stage files: `git add .`
4. Commit with proper format
5. Pre-commit hooks will run automatically
6. **NEVER use `--no-verify`** to bypass hooks

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-proposal/
│   │       └── route.ts          # API endpoint for AI generation
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   └── proposal-form.tsx         # Main form component
├── lib/
│   ├── prompts.ts                # AI prompt templates
│   └── utils.ts                  # Utility functions (cn, etc.)
└── types/
    ├── proposal.ts               # Proposal-related types
    └── env.d.ts                  # Environment variable types
```

## Environment Variables

### Required
- `OPENROUTER_API_KEY` - OpenRouter API key (in `.env.local`)

### Optional
- `NEXT_PUBLIC_APP_URL` - App URL for OpenRouter metadata

**IMPORTANT**: Never commit `.env.local` - it's gitignored

## AI Integration Rules

### OpenRouter Setup
```typescript
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const model = openrouter.chat("anthropic/claude-3.5-sonnet");
```

### Prompt Engineering
- Store prompts in `src/lib/prompts.ts`
- Use clear, structured prompts with:
  - Role definition
  - Context/data injection
  - Clear instructions
  - Output format specification
- Prompts should be in Portuguese (BR)
- Never include example outputs in prompts

### API Route Patterns
```typescript
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate input
    if (!data.requiredField) {
      return NextResponse.json(
        { error: "Message" },
        { status: 400 }
      );
    }

    // Process with AI
    const result = await generateText({ ... });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Message", details: error.message },
      { status: 500 }
    );
  }
}
```

## Development Phases

The project follows a 6-phase development plan:

1. **Phase 1** ✅ - Foundation & Data Flow
2. **Phase 2** ✅ - AI Integration (current)
3. **Phase 3** - Content Assembly
4. **Phase 4** - BlockNote Editor Integration
5. **Phase 5** - Preview & PDF Export
6. **Phase 6** - Polish & Testing

Track progress in `docs/plan-progress.md`

## Key Principles

### 1. Type Safety First
- Always define interfaces before implementing
- No runtime type assertions without validation
- Use TypeScript's type system, don't fight it

### 2. User Experience
- Always validate form inputs
- Show loading states during async operations
- Display clear error messages
- Never silently fail

### 3. Code Quality
- Lint and type-check must pass before commit
- Fix issues, don't bypass with flags
- Keep functions small and focused
- Use descriptive variable names

### 4. AI Content
- Generate content in Portuguese (BR)
- Professional, business-appropriate tone
- Clear, concise, actionable content
- No AI-generated fluff or filler

### 5. Performance
- Use parallel Promise.all() for independent operations
- Minimize re-renders with proper state management
- Lazy load components when appropriate

## Common Patterns

### Form State Management
```typescript
const [formData, setFormData] = useState<FormType>({ ... });
const [errors, setErrors] = useState<ErrorType>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### Dynamic Lists with Unique IDs
```typescript
interface Item {
  id: string;  // Use crypto.randomUUID()
  value: string;
}

const [items, setItems] = useState<Item[]>([
  { id: crypto.randomUUID(), value: "" }
]);

// Render with unique keys
{items.map(item => (
  <div key={item.id}>...</div>
))}
```

### Error Handling
```typescript
try {
  setIsLoading(true);
  setError(null);

  const result = await operation();

  // Handle success
} catch (error) {
  console.error("Context:", error);
  setError(error instanceof Error ? error.message : "Generic message");
} finally {
  setIsLoading(false);
}
```

## Don'ts

❌ **NEVER:**
- Use `--no-verify` to bypass git hooks
- Use package managers other than npm
- Commit without running type-check and lint
- Use array indices as React keys
- Use `any` type
- Hardcode API keys in code
- Create files without proper TypeScript types
- Bypass Biome rules (fix the code instead)
- Use console.log in production (use proper error handling)
- Mix Portuguese and English in user-facing text

## Testing Checklist

Before committing:
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (no errors/warnings)
- [ ] Test the feature manually
- [ ] Error states are handled
- [ ] Loading states are visible
- [ ] Form validation works
- [ ] Commit message follows convention

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Biome Docs](https://biomejs.dev)
- [Conventional Commits](https://www.conventionalcommits.org)
