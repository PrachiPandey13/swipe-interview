// src/pages/TestUploader.jsx
import React from "react";
import ResumeUploader from "../components/ResumeUploader";

export default function TestUploader() {
  return (
    <div style={{ padding: 24 }}>
      <h2>ResumeUploader Test</h2>
      <ResumeUploader onConfirm={(p) => {
        console.log("Confirmed profile:", p);
        alert("Confirmed: " + JSON.stringify(p));
      }} />
      <p>Open DevTools → Console and upload a sample PDF to see parsing logs.</p>
    </div>
  );
}
