// src/pages/TestUploaderSafe.jsx
import React from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import ResumeUploader from "../components/ResumeUploader";

export default function TestUploaderSafe() {
  return (
    <div style={{ padding: 24 }}>
      <h2>ResumeUploader — Safe Test</h2>
      <ErrorBoundary>
        <ResumeUploader onConfirm={(p) => {
          console.log("Confirmed profile:", p);
          alert("Confirmed: " + JSON.stringify(p));
        }} />
      </ErrorBoundary>
      <p>Open DevTools → Console. Upload a PDF and copy any red errors here.</p>
    </div>
  );
}
