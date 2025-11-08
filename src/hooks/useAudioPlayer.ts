import { useState, useRef, useCallback } from 'react';

export const useAudioPlayer = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((audioBlob: Blob, onEnd: () => void) => {
    if (isMuted) {
      onEnd(); // Call onEnd immediately if muted
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audioUrl = URL.createObjectURL(audioBlob);
    audioRef.current.src = audioUrl;

    audioRef.current.onplay = () => setIsSpeaking(true);
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl); // Clean up
      onEnd(); // This is the crucial callback for the loop
    };
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      onEnd();
    };
    audioRef.current.play().catch(e => {
        console.error("Audio play failed:", e);
        onEnd();
    });
  }, [isMuted]);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev === true) stop(); // If muting, stop playback
      return !prev;
    });
  }, [stop]);

  return { play, stop, isSpeaking, isMuted, toggleMute };
};