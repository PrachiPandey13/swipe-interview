// src/components/ResumeUploader.jsx (TEMP STUB — safe)
import React from "react";
import { Button } from "antd";

/**
 * Temporary stub to prevent runtime crashes.
 * Replaces the real uploader while we debug parsing issues.
 */
export default function ResumeUploader({ onConfirm = () => {} }) {
  return (
    <div style={{ border: "1px dashed #ddd", padding: 16, borderRadius: 8 }}>
      <p><strong>Uploader (stub)</strong></p>
      <p>This is a temporary safe stub. Click the button to confirm a demo profile.</p>
      <Button
        type="primary"
        onClick={() => onConfirm({ name: "Demo User", email: "demo@example.com", phone: "9999999999" })}
      >
        Confirm Demo Profile
      </Button>
    </div>
  );
}
