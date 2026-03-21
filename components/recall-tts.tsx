"use client";

import { useEffect, useRef } from "react";

type RecallTTSProps = {
  ticketId: string | null;
  status: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export default function RecallTTS({
  ticketId,
  status,
  rate = 1,
  pitch = 1,
  volume = 1,
}: RecallTTSProps) {
  const prevStatusRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ticketId) return;

    // Skip on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevStatusRef.current = status;
      return;
    }

    // Detect recall: when status changes from something else back to "called"
    // This happens when recall button is clicked
    const wasNotCalled = prevStatusRef.current && prevStatusRef.current !== "called";
    const isNowCalled = status === "called";
    const isRecall = wasNotCalled && isNowCalled;

    if (!isRecall) {
      prevStatusRef.current = status;
      return;
    }

    // Extract number from ticket id like "HR-001"
    const num = ticketId.split("-")[1];
    const announceText = `${num} recalled`;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(announceText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    prevStatusRef.current = status;
  }, [ticketId, status, rate, pitch, volume]);

  return null; // headless component
}
