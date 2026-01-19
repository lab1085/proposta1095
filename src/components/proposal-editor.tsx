"use client";

import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { PDFExporter, pdfDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { convertProposalToBlocks } from "@/lib/blocknote-converter";
import type { ProposalSection } from "@/types/proposal";

interface ProposalEditorProps {
  sections: ProposalSection[];
}

export interface ProposalEditorRef {
  getBlocks: () => Block[];
  exportToPDF: () => Promise<void>;
}

export const ProposalEditor = forwardRef<ProposalEditorRef, ProposalEditorProps>(
  ({ sections }, ref) => {
    // Create editor instance with image upload support
    const editor = useCreateBlockNote({
      initialContent: convertProposalToBlocks(sections),
      uploadFile: async (file: File) => {
        // Convert image to base64 data URL (no server upload needed)
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      },
    });

    // Expose editor methods to parent
    useImperativeHandle(
      ref,
      () => ({
        getBlocks: () => editor.document,
        exportToPDF: async () => {
          // Get current editor content (live state)
          const currentBlocks = editor.document;

          // Create PDF exporter
          const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

          // Convert blocks to React-PDF document
          const pdfDocument = await exporter.toReactPDFDocument(currentBlocks);

          // Generate PDF blob and trigger download
          const blob = await ReactPDF.pdf(pdfDocument).toBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "proposta-comercial.pdf";
          link.click();
          URL.revokeObjectURL(url);
        },
      }),
      [editor]
    );

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
);

ProposalEditor.displayName = "ProposalEditor";
