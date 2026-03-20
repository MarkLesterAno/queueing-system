'use client';

import { useEffect, useRef } from 'react';

type TextToSpeechProps = {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export default function TextToSpeech({
  text,
  rate = 1,
  pitch = 1,
  volume = 1,
}: TextToSpeechProps) {
  const prevTextRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!text) return;

    // ✅ Skip speaking on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevTextRef.current = text;
      return;
    }

    // ✅ Speak only if text actually changed
    if (prevTextRef.current === text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    prevTextRef.current = text;
  }, [text, rate, pitch, volume]);

  return null; // headless component
}