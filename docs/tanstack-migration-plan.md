# Migration Plan: Next.js to TanStack Start (In-Place)

**Branch:** `tanstack`

## Objective

Migrate Proposta1095 from Next.js 16 to TanStack Start for native Cloudflare Workers deployment.

---

## Phase 1: Update Dependencies

### 1.1 Remove Next.js dependencies

```bash
bun remove next @opennextjs/cloudflare
```

### 1.2 Add TanStack Start dependencies

```bash
bun add @tanstack/react-start @tanstack/react-router
bun add -D @cloudflare/vite-plugin @vitejs/plugin-react vite-tsconfig-paths
```

---

## Phase 2: Update Configuration

### 2.1 Update package.json scripts

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "npm run build && vite preview",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types"
  }
}
```

### 2.2 Replace next.config.ts with vite.config.ts

```ts
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3800 },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsConfigPaths(),
    tanstackStart(),
    viteReact(),
  ],
});
```

### 2.3 Update wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "proposta1095",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "observability": { "enabled": true },
  "placement": { "mode": "smart" }
}
```

### 2.4 Update tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "skipLibCheck": true,
    "strictNullChecks": true,
    "strict": true,
    "paths": { "~/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

---

## Phase 3: Restructure src/

### 3.1 New structure (follows official TanStack patterns)

```
src/
├── routes/
│   ├── __root.tsx       # Root layout (replaces app/layout.tsx)
│   └── index.tsx        # Main page (replaces app/page.tsx)
├── components/          # Keep as-is
│   ├── ui/
│   ├── proposal-form.tsx
│   └── proposal-editor.tsx
├── utils/               # Renamed from lib/ - server functions live here too
│   ├── proposal.ts      # Server function (replaces app/api/generate-proposal/route.ts)
│   ├── prompts.ts
│   ├── assembler.ts
│   ├── templates.ts
│   ├── blocknote-converter.ts
│   └── cn.ts            # Renamed from utils.ts
├── styles/              # Directory, not single file
│   └── app.css
├── types/
│   └── proposal.ts
├── router.tsx           # New: router config
└── routeTree.gen.ts     # Auto-generated
```

### 3.2 Path alias

TanStack uses `~` instead of `@`:
```json
// tsconfig.json
"paths": { "~/*": ["./src/*"] }
```

### 3.3 Delete Next.js files

- `src/app/` (entire directory)
- `next.config.ts`
- `open-next.config.ts`
- `next-env.d.ts`

---

## Phase 4: Create New Files

### 4.1 src/router.tsx

```tsx
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true });
}
```

### 4.2 src/routes/__root.tsx

```tsx
/// <reference types="vite/client" />
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "~/styles/app.css?url";
import mantineCss from "@mantine/core/styles.css?url";
import blocknoteFonts from "@blocknote/core/fonts/inter.css?url";
import blocknoteStyles from "@blocknote/mantine/style.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Proposta1095" },
    ],
    links: [
      { rel: "stylesheet", href: mantineCss },
      { rel: "stylesheet", href: blocknoteFonts },
      { rel: "stylesheet", href: blocknoteStyles },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### 4.3 src/routes/index.tsx

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ProposalForm } from "~/components/proposal-form";

export const Route = createFileRoute("/")({
  component: () => <ProposalForm />,
});
```

### 4.4 src/utils/proposal.ts (server function)

```tsx
import { createServerFn } from "@tanstack/react-start";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { env } from "cloudflare:workers";
import { assembleProposal, createProposalSections } from "~/utils/assembler";
import { generateContextPrompt, generateSolutionPrompt } from "~/utils/prompts";
import type { ProposalFormData } from "~/types/proposal";

const MODEL = "x-ai/grok-4.1-fast";

async function callOpenRouter(prompt: string): Promise<string> {
  const openrouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY || "",
  });
  const { text } = await generateText({
    model: openrouter.chat(MODEL),
    prompt,
    temperature: 0.7,
  });
  return text;
}

export const generateProposal = createServerFn({ method: "POST" })
  .inputValidator((data: ProposalFormData) => data)
  .handler(async ({ data: formData }) => {
    if (!formData.clientName || !formData.problemDescription || !formData.solutionDescription) {
      throw new Error("Missing required fields");
    }

    const [context, solution] = await Promise.all([
      callOpenRouter(generateContextPrompt(formData)),
      callOpenRouter(generateSolutionPrompt(formData)),
    ]);

    const proposal = assembleProposal(formData, { context, solution });
    const sections = createProposalSections(proposal);

    return { proposal, sections };
  });
```

---

## Phase 5: Update Components

### 5.1 proposal-form.tsx

Replace API call:

```tsx
// Before
const response = await fetch("/api/generate-proposal", { ... });
const data = await response.json();

// After
import { generateProposal } from "@/server/proposal";
const data = await generateProposal({ data: updatedFormData });
```

Remove `"use client"` directive.

### 5.2 proposal-editor.tsx

Remove `"use client"` directive. Rest stays the same.

### 5.3 UI components

Remove `"use client"` from all shadcn components.

---

## Phase 6: Styles

Move `src/app/globals.css` to `src/styles.css`.

---

## Migration Checklist

- [ ] Remove Next.js deps, add TanStack deps
- [ ] Delete next.config.ts, open-next.config.ts
- [ ] Create vite.config.ts
- [ ] Update wrangler.jsonc
- [ ] Update tsconfig.json
- [ ] Update package.json scripts
- [ ] Create src/router.tsx
- [ ] Create src/routes/__root.tsx
- [ ] Create src/routes/index.tsx
- [ ] Create src/server/proposal.ts
- [ ] Move globals.css to src/styles.css
- [ ] Update proposal-form.tsx (server function call)
- [ ] Remove "use client" from all components
- [ ] Delete src/app/ directory
- [ ] Test with `bun run dev`
- [ ] Deploy with `bun run deploy`
