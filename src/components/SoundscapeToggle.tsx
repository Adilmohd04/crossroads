'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundscapeToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const windIntervalRef = useRef<any>(null);
  const chimeIntervalRef = useRef<any>(null);

  const startSoundscape = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Gain node
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.06, ctx.currentTime); // keep it low and ambient
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // 1. Synthetic Wind Generator (Pink Noise + Lowpass Filter)
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate pinkish-brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // compensation
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter to shape wind sound
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(300, ctx.currentTime);
      windFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      noiseSource.connect(windFilter);
      windFilter.connect(mainGain);
      noiseSource.start(0);
      windNodeRef.current = windFilter;

      // Wind modulation loop (gusts of wind)
      let baseFreq = 300;
      windIntervalRef.current = setInterval(() => {
        if (!ctx || ctx.state === 'suspended') return;
        const targetFreq = baseFreq + Math.random() * 200 - 80;
        const time = ctx.currentTime + 3 + Math.random() * 3;
        try {
          windFilter.frequency.exponentialRampToValueAtTime(Math.max(120, targetFreq), time);
        } catch { /* safety check */ }
      }, 4000);

      // 2. Chimes (Synthesized using sine waves)
      const playChime = () => {
        if (!ctx || ctx.state === 'suspended') return;
        const frequencies = [261.63, 329.63, 392.00, 440.00, 523.25, 659.25]; // Pentatonic scale (C, E, G, A)
        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        try {
          const osc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Chime gain envelope (fast attack, slow decay)
          chimeGain.gain.setValueAtTime(0, ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.05); // low volume
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

          osc.connect(chimeGain);
          chimeGain.connect(mainGain);
          
          osc.start();
          osc.stop(ctx.currentTime + 3.2);
        } catch { /* safety check */ }
      };

      // Play chimes every 6-12 seconds
      const chimeLoop = () => {
        playChime();
        const nextTime = 5000 + Math.random() * 6000;
        chimeIntervalRef.current = setTimeout(chimeLoop, nextTime);
      };
      chimeLoop();
      
      setIsPlaying(true);
    } catch (e) {
      console.error('Failed to start soundscape:', e);
    }
  };

  const stopSoundscape = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch { /* ignore */ }
    if (windIntervalRef.current) clearInterval(windIntervalRef.current);
    if (chimeIntervalRef.current) clearTimeout(chimeIntervalRef.current);
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopSoundscape();
    } else {
      startSoundscape();
    }
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (windIntervalRef.current) clearInterval(windIntervalRef.current);
      if (chimeIntervalRef.current) clearTimeout(chimeIntervalRef.current);
      try {
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
        }
      } catch { /* ignore */ }
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-full glass border border-teal-500/25 text-teal-600 hover:text-teal-700 shadow-lg transition-all duration-300"
      style={{
        boxShadow: isPlaying ? '0 0 15px rgba(13, 148, 136, 0.2)' : 'var(--shadow)',
      }}
      title="Toggle Nature Soundscape"
    >
      {isPlaying ? (
        <div className="flex items-center gap-1.5 px-1">
          <Volume2 className="h-4 w-4 animate-pulse text-teal-600" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase pr-1 text-teal-600">Ambient On</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-1">
          <VolumeX className="h-4 w-4 text-slate-500" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase pr-1 text-slate-500">Ambient Off</span>
        </div>
      )}
    </button>
  );
}
