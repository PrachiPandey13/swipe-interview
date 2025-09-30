// src/pages/TestParser.jsx
import React from "react";
import { Button } from "antd";
import { extractTextFromPdf } from "../lib/pdfUtils";

export default function TestParser() {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Selected file:", file.name, file.type, file.size);

    try {
      const text = await extractTextFromPdf(file);
      console.log("=== PARSED TEXT PREVIEW ===");
      console.log(text.slice(0, 1200)); // print first 1200 chars
      alert("Parsed text logged to console (first 1200 chars).");
    } catch (err) {
      console.error("extractTextFromPdf threw:", err);
      alert("Parser threw an error — check console for details.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>TestParser — PDF text extraction</h2>
      <p>Select a PDF file (preferably a simple text-based resume) — the parser will try to extract text and log the result to the console.</p>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <div style={{ marginTop: 12 }}>
        <Button onClick={() => console.log("Manual debug tick")}>Debug tick</Button>
      </div>
      <p>Open DevTools → Console before choosing the file.</p>
    </div>
  );
}
