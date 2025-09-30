// src/pages/Interviewee.jsx
import React, { useState } from "react";
import ResumeUploader from "../components/ResumeUploader";
import InterviewChat from "../components/InterviewChat";
import { Card, Button, Typography } from "antd";
import { saveCandidate } from "../lib/storage";

const { Text } = Typography;

export default function Interviewee() {
  const [profile, setProfile] = useState(null);
  const [finished, setFinished] = useState(null); // { score, summary, answers }

  async function handleConfirmProfile(fields) {
    setProfile(fields);
  }

  // scoring: try /api/score then fallback to heuristic
  async function handleFinish(answers) {
    // build payload
    const payload = { profile, answers };

    // try serverless scoring endpoint (if you implement one at /api/score)
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("scoring API not ok");
      const json = await res.json();
      setFinished({ score: json.score, summary: json.summary, answers });
      // persist candidate
      saveCandidate({
        id: Date.now(),
        name: profile.name || profile.email || "Unknown",
        email: profile.email,
        phone: profile.phone,
        score: json.score,
        summary: json.summary,
        answers,
        timestamp: Date.now(),
      });
      return;
    } catch (err) {
      // fallback heuristic scorer
      const score = Math.min(
        100,
        answers
          .map((a) => (a ? a.length : 0))
          .reduce((s, l) => s + Math.min(20, Math.floor(l / 20)), 0)
      );
      const summary = "Dummy summary generated (no scoring API).";
      setFinished({ score, summary, answers });
      saveCandidate({
        id: Date.now(),
        name: profile.name || profile.email || "Unknown",
        email: profile.email,
        phone: profile.phone,
        score,
        summary,
        answers,
        timestamp: Date.now(),
      });
    }
  }

  return (
    <div>
      <h3>Candidate — Interviewee</h3>

      {!profile ? (
        <Card>
          <p>Upload your resume (PDF). We'll try to extract Name, Email, and Phone. After verifying/editing, click <Text strong>Confirm & Continue</Text>.</p>
          <ResumeUploader onConfirm={handleConfirmProfile} />
        </Card>
      ) : !finished ? (
        <Card>
          <h4>Profile (confirmed)</h4>
          <div style={{ marginBottom: 12 }}>
            <div><strong>Name:</strong> {profile.name || <em>not provided</em>}</div>
            <div><strong>Email:</strong> {profile.email || <em>not provided</em>}</div>
            <div><strong>Phone:</strong> {profile.phone || <em>not provided</em>}</div>
          </div>

          <InterviewChat profile={profile} onFinish={handleFinish} />
        </Card>
      ) : (
        <Card>
          <h3>Final Score: {finished.score}</h3>
          <p>{finished.summary}</p>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" onClick={() => { setProfile(null); setFinished(null); }}>Run again / New candidate</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
