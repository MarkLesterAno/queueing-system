'use client';

import { useEffect, useRef, useState } from 'react';

export type TTSOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
};

export function useTextToSpeech(options: TTSOptions = {}) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string) => {
    if (!text || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    if (options.voiceURI) {
      const voice = voices.find(v => v.voiceURI === options.voiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return {
    speak,
    stop,
    speaking,
    voices,
  };
}