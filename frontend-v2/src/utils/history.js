// src/utils/history.js

const KEY = "carbonsight_history";

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(messages) {
  localStorage.setItem(KEY, JSON.stringify(messages));
}
