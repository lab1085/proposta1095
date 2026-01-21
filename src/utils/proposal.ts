import { env } from "cloudflare:workers";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import type { ProposalFormData } from "~/types/proposal";
import { assembleProposal, createProposalSections } from "~/utils/assembler";
import { generateContextPrompt, generateSolutionPrompt } from "~/utils/prompts";

const MODEL = "x-ai/grok-4.1-fast";

async function callOpenRouter(prompt: string): Promise<string> {
  const openrouter = createOpenRouter({
    apiKey: (env as { OPENROUTER_API_KEY: string }).OPENROUTER_API_KEY,
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
