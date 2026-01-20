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

const STORAGE_KEY = "proposal-editor-content";

function loadFromStorage(): Block[] | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Block[];
    }
  } catch (err) {
    console.error("Failed to load from localStorage:", err);
  }
  return undefined;
}

function saveToStorage(blocks: Block[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

interface ProposalEditorProps {
  sections: ProposalSection[];
}

export interface ProposalEditorRef {
  getBlocks: () => Block[];
  exportToPDF: () => Promise<void>;
  clearStorage: () => void;
}

export const ProposalEditor = forwardRef<ProposalEditorRef, ProposalEditorProps>(
  ({ sections }, ref) => {
    // Load initial content: localStorage first, then convert sections
    // Parent clears localStorage before regeneration, so if saved content exists, use it
    const getInitialContent = () => {
      const saved = loadFromStorage();
      if (saved && saved.length > 0) {
        return saved;
      }
      return convertProposalToBlocks(sections);
    };

    // Create editor instance with image upload support
    const editor = useCreateBlockNote({
      initialContent: getInitialContent(),
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
        clearStorage: () => {
          localStorage.removeItem(STORAGE_KEY);
        },
      }),
      [editor]
    );

    // Save to localStorage on every change
    useEffect(() => {
      const unsubscribe = editor.onChange(() => {
        saveToStorage(editor.document);
      });
      return unsubscribe;
    }, [editor]);

    // Update editor when sections change (for regeneration)
    // Parent calls clearStorage() before setting new sections, so localStorage will be empty
    // This effect detects when sections change and replaces editor content if localStorage is empty
    useEffect(() => {
      if (editor && sections.length > 0) {
        const saved = loadFromStorage();
        if (!saved || saved.length === 0) {
          // No saved content means this is a regeneration - use new sections
          const newBlocks = convertProposalToBlocks(sections);
          editor.replaceBlocks(editor.document, newBlocks);
        }
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
