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
}

export function ProposalEditor({ sections }: ProposalEditorProps) {
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
    <div id="proposal-content">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
