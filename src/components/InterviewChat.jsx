// src/components/InterviewChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Progress, Space, Typography } from "antd";
import { saveSession, loadSession, clearSession } from "../lib/storage";
import { v4 as uuidv4 } from "uuid";

const { Text } = Typography;

const QUESTIONS = [
  { text: "Explain props vs state in React.", level: "easy" },
  { text: "What is event delegation in JavaScript?", level: "easy" },
  { text: "How would you optimize a slow React app?", level: "medium" },
  { text: "Explain closure in JS with an example.", level: "medium" },
  { text: "Design a rate limiter for API requests.", level: "hard" },
  { text: "How to scale a Node.js app for high concurrency?", level: "hard" },
];

function secondsForLevel(level) {
  if (level === "easy") return 20;
  if (level === "medium") return 60;
  return 120;
}

export default function InterviewChat({ profile, onFinish }) {
  // load saved session if any
  const saved = loadSession();
  const [sessionId] = useState(() => saved?.sessionId ?? uuidv4());
  const [index, setIndex] = useState(saved?.index ?? 0);
  const [answers, setAnswers] = useState(saved?.answers ?? Array(QUESTIONS.length).fill(""));
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? secondsForLevel(QUESTIONS[index].level));
  const [running, setRunning] = useState(saved ? false : true); // don't auto-start if resuming
  const [showWelcome, setShowWelcome] = useState(Boolean(saved));
  const inputRef = useRef();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // auto-submit when timer hits 0
  useEffect(() => {
    if (running && timeLeft <= 0) {
      handleSubmit(true);
    }
  }, [timeLeft, running]); // eslint-disable-line

  // persist small session snapshot
  useEffect(() => {
    saveSession({
      sessionId,
      profile,
      index,
      answers,
      timeLeft,
      timestamp: Date.now(),
    });
  }, [sessionId, profile, index, answers, timeLeft]);

  function resumeSession() {
    setShowWelcome(false);
    setRunning(true);
    // if timeLeft undefined, set default for current index
    if (!timeLeft) setTimeLeft(secondsForLevel(QUESTIONS[index].level));
  }

  function startFresh() {
    clearSession();
    setShowWelcome(false);
    setIndex(0);
    setAnswers(Array(QUESTIONS.length).fill(""));
    setTimeLeft(secondsForLevel(QUESTIONS[0].level));
    setRunning(true);
  }

  function handleChange(e) {
    const copy = [...answers];
    copy[index] = e.target.value;
    setAnswers(copy);
  }

  function handleSubmit(isAuto = false) {
    setRunning(false);
    setAnswers((prev) => {
      const c = [...prev];
      if (!c[index] || c[index].trim() === "") c[index] = isAuto ? "(no answer - timed out)" : "";
      return c;
    });

    const next = index + 1;
    if (next >= QUESTIONS.length) {
      // finished
      clearSession();
      // small delay so last answer persistence completes
      setTimeout(() => onFinish(answers), 150);
      return;
    }
    setIndex(next);
    setTimeLeft(secondsForLevel(QUESTIONS[next].level));
    setRunning(true);
    // focus next input
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const progressPercent = Math.round(((index) / QUESTIONS.length) * 100);

  return (
    <div>
      <Modal visible={showWelcome} title="Resume found" footer={null} closable={false}>
        <p>We found an unfinished interview session. Would you like to resume?</p>
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={startFresh}>Start Fresh</Button>
          <Button type="primary" onClick={resumeSession}>Resume</Button>
        </Space>
      </Modal>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">Candidate:</Text> <strong>{profile?.name || profile?.email || "Unknown"}</strong>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Progress percent={progressPercent} />
        <div style={{ marginTop: 8 }}>
          <strong>Question {index + 1}/{QUESTIONS.length} ({QUESTIONS[index].level})</strong>
          <p>{QUESTIONS[index].text}</p>
        </div>
        <div style={{ marginTop: 8 }}>
          <Input.TextArea ref={inputRef} value={answers[index]} onChange={handleChange} rows={6} placeholder="Type your answer here..." />
        </div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>Time left: <strong>{timeLeft}s</strong></div>
          <Space>
            <Button onClick={() => { setRunning(!running); }}>{running ? "Pause" : "Resume"}</Button>
            <Button type="primary" onClick={() => handleSubmit(false)}>Submit & Next</Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
