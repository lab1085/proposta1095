import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { assembleProposal, createProposalSections } from "@/lib/assembler";
import { generateContextPrompt, generateSolutionPrompt } from "@/lib/prompts";
import type { AIGeneratedContent, ProposalFormData } from "@/types/proposal";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const MODEL = "anthropic/claude-3.5-sonnet";

/**
 * Generate AI content using Vercel AI SDK with OpenRouter
 */
async function callOpenRouter(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openrouter.chat(MODEL),
    prompt,
    temperature: 0.7,
  });

  return text;
}

/**
 * Generate AI content for both Contexto and Solução sections
 */
async function generateAIContent(formData: ProposalFormData): Promise<AIGeneratedContent> {
  // Generate both sections in parallel for faster response
  const [context, solution] = await Promise.all([
    callOpenRouter(generateContextPrompt(formData)),
    callOpenRouter(generateSolutionPrompt(formData)),
  ]);

  return {
    context,
    solution,
  };
}

/**
 * POST /api/generate-proposal
 * Generate complete assembled proposal with AI content
 */
export async function POST(request: NextRequest) {
  try {
    const formData: ProposalFormData = await request.json();

    // Validate required fields
    if (!formData.clientName || !formData.problemDescription || !formData.solutionDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate AI content
    const aiContent = await generateAIContent(formData);

    // Assemble complete proposal
    const proposal = assembleProposal(formData, aiContent);
    const sections = createProposalSections(proposal);

    return NextResponse.json({
      proposal,
      sections,
    });
  } catch (error) {
    console.error("Error generating proposal:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to generate proposal", details: errorMessage },
      { status: 500 }
    );
  }
}
