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
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechProps) {
  text = text ? text.split("-")[1] : "";

  const prevRecallRef = useRef<number | null>(null);
  const prevTextRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!text) return;

    // ✅ Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (prevTextRef.current === text) return;

    if (prevRecallRef.current === recall) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    prevRecallRef.current = recall;
  }, [
    recall, // ✅ always present
    text,
    rate,
    pitch,
    volume,
  ]);

  return null;
}
