"use client";

import { useEffect, useRef } from "react";

type TextToSpeechProps = {
  recall: number;
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export default function TextToSpeech({
  recall,
  text,
  rate = 0.9,
  pitch = 1,
  volume = 1,
}: TextToSpeechProps) {
  const prevRecallRef = useRef<number>(0);
  const prevTextRef = useRef<string>("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!text) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevRecallRef.current = recall;
      prevTextRef.current = text;
      return;
    }

    const isNewTicket = prevTextRef.current !== text;
    const isRecall = prevRecallRef.current !== recall;

    if (!isNewTicket && !isRecall) return;

    window.speechSynthesis.cancel();

    const parts = text.split("-");
    const prefix = parts[0] ?? "";
    const num = parts[1] ?? "";
    const message = isRecall && !isNewTicket
      ? `Re-calling ${prefix} ${num}`
      : `Now serving ${prefix} ${num}`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    prevRecallRef.current = recall;
    prevTextRef.current = text;
  }, [recall, text, rate, pitch, volume]);

  return null;
}
