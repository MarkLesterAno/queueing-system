"use client";

import { useEffect, useRef } from "react";

type TextToSpeechProps = {
  text: string;
  isActive: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export default function TextToSpeech({
  text,
  isActive,
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechProps) {
  const prevTextRef = useRef<string | null>(null);
  const prevActiveRef = useRef<boolean>(false);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!text) return;
    
    // Skip on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevTextRef.current = text;
      prevActiveRef.current = isActive;
      return;
    }

    // Speak if:
    // 1. Ticket number changed (new ticket called)
    // 2. OR same ticket became active again (recall)
    const textChanged = prevTextRef.current !== text;
    const becameActive = !prevActiveRef.current && isActive;

    if (!textChanged && !becameActive) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    prevTextRef.current = text;
    prevActiveRef.current = isActive;
  }, [text, isActive, rate, pitch, volume]);

  return null; // headless component
}
