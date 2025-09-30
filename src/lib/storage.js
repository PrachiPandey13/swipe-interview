// src/lib/storage.js
const KEY = "swipe_mvp_v1_session";
const CAND_KEY = "swipe_mvp_v1_candidates";

export function saveSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("saveSession failed", e);
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("loadSession failed", e);
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) { /* ignore */ }
}

export function saveCandidate(candidate) {
  try {
    const raw = localStorage.getItem(CAND_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(candidate);
    localStorage.setItem(CAND_KEY, JSON.stringify(arr));
  } catch (e) { console.warn("saveCandidate failed", e); }
}

export function loadCandidates() {
  try {
    const raw = localStorage.getItem(CAND_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("loadCandidates failed", e);
    return [];
  }
}
