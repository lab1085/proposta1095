"use client";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import { convertProposalToBlocks } from "@/lib/blocknote-converter";
import type { ProposalSection } from "@/types/proposal";

interface ProposalEditorProps {
  sections: ProposalSection[];
  onContentChange?: (content: string) => void;
}

export function ProposalEditor({ sections, onContentChange }: ProposalEditorProps) {
  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: convertProposalToBlocks(sections),
  });

  // Update editor when sections change (for regeneration)
  useEffect(() => {
    if (editor && sections.length > 0) {
      const newBlocks = convertProposalToBlocks(sections);
      editor.replaceBlocks(editor.document, newBlocks);
    }
  }, [sections, editor]);

  return (
    <div className="min-h-[600px] rounded-lg border border-border bg-card">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
