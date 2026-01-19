import type { Block, PartialBlock } from "@blocknote/core";
import type { ProposalSection } from "@/types/proposal";

/**
 * Create heading block
 */
function createHeadingBlock(title: string): PartialBlock {
  return {
    type: "heading",
    props: {
      level: 2,
    },
    content: [
      {
        type: "text",
        text: title,
        styles: { bold: true },
      },
    ],
  };
}

/**
 * Create bullet list blocks
 */
function createBulletListBlocks(items: string[]): PartialBlock[] {
  return items
    .filter((item) => item.trim())
    .map((item) => ({
      type: "bulletListItem",
      content: [
        {
          type: "text",
          text: item,
          styles: {},
        },
      ],
    }));
}

/**
 * Create paragraph blocks from text content
 */
function createParagraphBlocks(content: string): PartialBlock[] {
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return paragraphs.map((para) => {
    const lines = para.split("\n").filter((l) => l.trim());
    const text = lines.join(" ");

    return {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: text,
          styles: {},
        },
      ],
    };
  });
}

/**
 * Create empty paragraph block
 */
function createEmptyParagraph(): PartialBlock {
  return {
    type: "paragraph",
    content: [],
  };
}

/**
 * Convert ProposalSection[] to BlockNote block format
 */
export function convertProposalToBlocks(sections: ProposalSection[]): PartialBlock[] {
  const blocks: PartialBlock[] = [];

  for (const section of sections) {
    // Add section title as heading
    blocks.push(createHeadingBlock(section.title));

    // Add content based on type
    if (section.type === "list" && Array.isArray(section.content)) {
      blocks.push(...createBulletListBlocks(section.content));
    } else if (section.type === "text" && typeof section.content === "string") {
      blocks.push(...createParagraphBlocks(section.content));
    }

    // Add spacing between sections
    blocks.push(createEmptyParagraph());
  }

  return blocks;
}

/**
 * Extract plain text from BlockNote blocks for API submission
 */
export function extractTextFromBlocks(blocks: Block[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    if (block.type === "heading" && block.content) {
      const text = block.content.map((c) => ("text" in c ? c.text : "")).join("");
      lines.push(`\n## ${text}\n`);
    } else if (block.type === "paragraph" && block.content) {
      const text = block.content.map((c) => ("text" in c ? c.text : "")).join("");
      if (text.trim()) {
        lines.push(text);
      }
    } else if (block.type === "bulletListItem" && block.content) {
      const text = block.content.map((c) => ("text" in c ? c.text : "")).join("");
      lines.push(`• ${text}`);
    }
  }

  return lines.join("\n");
}
