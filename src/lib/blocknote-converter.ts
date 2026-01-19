import type { Block, PartialBlock } from "@blocknote/core";
import type { ProposalSection } from "@/types/proposal";

/**
 * Parse markdown inline styles (bold, italic) and convert to BlockNote format
 */
function parseMarkdownText(text: string): Array<{
  type: "text";
  text: string;
  styles: {
    bold?: boolean;
    italic?: boolean;
  };
}> {
  const result: Array<{
    type: "text";
    text: string;
    styles: { bold?: boolean; italic?: boolean };
  }> = [];

  // Regex to match **bold** and *italic*
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|([^*]+)/g;
  let match: RegExpExecArray | null = null;

  match = regex.exec(text);
  while (match !== null) {
    if (match[2]) {
      // Bold text (**text**)
      result.push({
        type: "text",
        text: match[2],
        styles: { bold: true },
      });
    } else if (match[4]) {
      // Italic text (*text*)
      result.push({
        type: "text",
        text: match[4],
        styles: { italic: true },
      });
    } else if (match[5]) {
      // Plain text
      const plainText = match[5];
      if (plainText) {
        result.push({
          type: "text",
          text: plainText,
          styles: {},
        });
      }
    }

    match = regex.exec(text);
  }

  return result.length > 0 ? result : [{ type: "text", text: text, styles: {} }];
}

/**
 * Create heading block
 */
function createHeadingBlock(title: string): PartialBlock {
  return {
    type: "heading",
    props: {
      level: 2,
    },
    content: parseMarkdownText(title),
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
      content: parseMarkdownText(item),
    }));
}

/**
 * Create paragraph blocks from text content
 * Also handles numbered lists embedded in text
 */
function createParagraphBlocks(content: string): PartialBlock[] {
  const blocks: PartialBlock[] = [];
  const lines = content.split("\n").filter((l) => l.trim());

  let currentParagraph: string[] = [];
  let inNumberedList = false;
  const numberedListItems: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if line is a numbered list item (e.g., "1. Item" or "2. **Bold**: text")
    const numberedListMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);

    if (numberedListMatch) {
      // If we were building a paragraph, finish it first
      if (currentParagraph.length > 0) {
        blocks.push({
          type: "paragraph",
          content: parseMarkdownText(currentParagraph.join(" ")),
        });
        currentParagraph = [];
      }

      // Add to numbered list items
      numberedListItems.push(numberedListMatch[1]);
      inNumberedList = true;
    } else if (trimmedLine === "") {
      // Empty line - end current context
      if (inNumberedList && numberedListItems.length > 0) {
        // Create numbered list blocks
        blocks.push(
          ...numberedListItems.map((item) => ({
            type: "numberedListItem" as const,
            content: parseMarkdownText(item),
          }))
        );
        numberedListItems.length = 0;
        inNumberedList = false;
      } else if (currentParagraph.length > 0) {
        blocks.push({
          type: "paragraph",
          content: parseMarkdownText(currentParagraph.join(" ")),
        });
        currentParagraph = [];
      }
    } else {
      // Regular line
      if (inNumberedList) {
        // End numbered list, start paragraph
        if (numberedListItems.length > 0) {
          blocks.push(
            ...numberedListItems.map((item) => ({
              type: "numberedListItem" as const,
              content: parseMarkdownText(item),
            }))
          );
          numberedListItems.length = 0;
        }
        inNumberedList = false;
      }
      currentParagraph.push(trimmedLine);
    }
  }

  // Finish any remaining content
  if (inNumberedList && numberedListItems.length > 0) {
    blocks.push(
      ...numberedListItems.map((item) => ({
        type: "numberedListItem" as const,
        content: parseMarkdownText(item),
      }))
    );
  } else if (currentParagraph.length > 0) {
    blocks.push({
      type: "paragraph",
      content: parseMarkdownText(currentParagraph.join(" ")),
    });
  }

  return blocks;
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
