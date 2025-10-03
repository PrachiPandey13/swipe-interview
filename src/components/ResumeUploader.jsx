// src/components/ResumeUploader.jsx
import React, { useState, useRef } from "react";
import { Button, Input, Space, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { extractTextFromPdf, extractFieldsFromText } from "../lib/pdfUtils";

/**
 * ResumeUploader — full uploader that extracts name/email/phone and confirms profile
 * Props:
 *  - onConfirm(profile)   // called with { name, email, phone }
 */
export default function ResumeUploader({ onConfirm = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const fileRef = useRef(null);

  // AntD Upload beforeUpload handler: intercept file and parse
  async function handleFile(file) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      message.error("Please upload a PDF file.");
      return Upload.LIST_IGNORE;
    }

    setLoading(true);
    try {
      // file is a File object available in browser
      const text = await extractTextFromPdf(file);
      setParsedText(text);
      window.__LAST_PARSED_TEXT = text; // debug helper visible in console
      console.log("=== PARSED TEXT PREVIEW ===");
      console.log(text.slice(0, 1200));
      // extract fields heuristically
      const fields = extractFieldsFromText(text || "");
      console.log("PARSED FIELDS (heuristic):", fields);
      setProfile((p) => ({ ...p, ...fields }));
      message.success("PDF parsed (preview in console). Edit fields if needed.");
    } catch (err) {
      console.error("extractTextFromPdf threw:", err);
      message.error("Failed to parse PDF. You can enter details manually.");
    } finally {
      setLoading(false);
    }

    // prevent Upload from auto-uploading anywhere
    return Upload.LIST_IGNORE;
  }

  function handleInputChange(field) {
    return (e) => setProfile({ ...profile, [field]: e.target.value });
  }

  function handleUseDemo() {
    const demo = { name: "Demo Candidate", email: "demo@example.com", phone: "9999999999" };
    setProfile(demo);
    // small delay so user sees fields populated
    setTimeout(() => onConfirm(demo), 200);
  }

  function handleConfirm() {
    // basic validation: require email at least
    if (!profile.email) {
      message.error("Please provide an email before continuing.");
      return;
    }
    onConfirm(profile);
  }

  return (
    <div style={{ border: "1px solid #eee", padding: 18, borderRadius: 8, maxWidth: 760 }}>
      <h3>Candidate — Interviewee</h3>
      <p>Upload your resume (PDF). We'll try to extract Name, Email, and Phone. After verifying/editing, click Confirm & Continue.</p>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Upload
          beforeUpload={handleFile}
          showUploadList={false}
          accept=".pdf,application/pdf"
          customRequest={({ file, onSuccess }) => {
            // We still call handleFile, but call onSuccess to keep Upload happy in AntD internals.
            handleFile(file).then(() => onSuccess && onSuccess(null, file)).catch(() => onSuccess && onSuccess(null, file));
          }}
        >
          <Button icon={<UploadOutlined />}>Upload PDF</Button>
        </Upload>

        <div>
          <small>Prefer text-based PDFs (not scanned images).</small>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Input
            placeholder="Name"
            value={profile.name}
            onChange={handleInputChange("name")}
            style={{ width: 240 }}
          />
          <Input
            placeholder="Email"
            value={profile.email}
            onChange={handleInputChange("email")}
            style={{ width: 300 }}
          />
          <Input
            placeholder="Phone"
            value={profile.phone}
            onChange={handleInputChange("phone")}
            style={{ width: 220 }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button type="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? <><Spin size="small" /> Confirming...</> : "Confirm & Continue"}
          </Button>

          <Button onClick={handleUseDemo} disabled={loading}>
            Use demo profile
          </Button>

          <Button
            onClick={() => {
              // quick debug: show last parsed text in an alert window (first 3000 chars)
              if (window.__LAST_PARSED_TEXT) {
                // open in new tab for easier reading
                const w = window.open();
                w.document.write("<pre style='white-space:pre-wrap; font-family: monospace;'>" + (window.__LAST_PARSED_TEXT || "").slice(0, 20000).replace(/</g, "&lt;") + "</pre>");
              } else {
                message.info("No parsed text found in this session.");
              }
            }}
          >
            View Parsed Text
          </Button>
        </div>

        <div>
          <small>Tip: If parsing fails for scanned PDFs, use manual entry. You can inspect the last parsed text via <code>window.__LAST_PARSED_TEXT</code> in the Console.</small>
        </div>
      </Space>
    </div>
  );
}
