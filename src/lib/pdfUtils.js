// src/lib/pdfUtils.js
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Use the .mjs worker file via Vite ?url so it becomes a served asset in production.
// The mjs worker file exists in node_modules/pdfjs-dist/build/.
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
} catch (err) {
  // Fallback (last resort) — avoids fatal runtime crash in case import resolution fails on the host
  console.warn("pdfUtils: workerUrl import failed, falling back to CDN. Error:", err);
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
}

/**
 * Extract readable text from a PDF File object
 * @param {File} file - File from input (PDF)
 * @returns {Promise<string>} concatenated text of all pages
 */
export async function extractTextFromPdf(file) {
  if (!file) throw new Error("No file provided to extractTextFromPdf");
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((it) => it.str).join(" ");
      fullText += "\n" + pageText;
    }
    return (fullText || "").trim();
  } catch (err) {
    console.error("extractTextFromPdf error:", err);
    throw new Error("Failed to parse PDF (pdfjs error). See console for details.");
  }
}

/* --- extractFieldsFromText (heuristic) --- */
export function extractFieldsFromText(text) {
  if (!text) return { name: "", email: "", phone: "" };

  const cleaned = text.replace(/\r/g, "\n"); // normalize
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1) EMAIL (robust)
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const email = emailMatch ? emailMatch[0].trim() : "";

  // 2) PHONE (improved)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\d{10}|\d{5}[-.\s]\d{5}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // 3) NAME heuristics (better)
  let name = "";

  for (let i = 0; i < Math.min(lines.length, 8) && !name; i++) {
    const ln = lines[i];
    if (!ln) continue;
    if (ln.includes("@")) continue;
    if (/\d/.test(ln)) continue;
    const words = ln.split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
      const capCount = words.reduce((s, w) => s + (/^[A-Z]/.test(w) ? 1 : 0), 0);
      if (capCount / words.length >= 0.5 && !/[|:;<>~}{]/.test(ln)) {
        name = ln;
        break;
      }
    }
  }

  if (!name) {
    for (let i = 0; i < Math.min(lines.length, 20) && !name; i++) {
      const ln = lines[i];
      if (!ln) continue;
      if (ln.includes("@")) continue;
      if (/\d/.test(ln)) continue;
      const words = ln.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-z][a-zA-Z.'-]{1,}$/.test(w))) {
        name = ln;
        break;
      }
    }
  }

  if (!name && email) {
    const local = email.split("@")[0];
    const parts = local.split(/[._\-]/).filter(Boolean).map((p) => p.replace(/[^a-zA-Z]/g, ""));
    if (parts.length) {
      name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    }
  }

  return {
    name: (name || "").trim(),
    email: (email || "").trim(),
    phone: (phone || "").trim(),
  };
}
