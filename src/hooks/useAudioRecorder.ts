import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSoundTimestampRef = useRef<number>(0);

  const onStopRef = useRef<((b: Blob) => void) | null>(null);
  const stopResolveRef = useRef<((b: Blob) => void) | null>(null);
  const manualStopRef = useRef<boolean>(false);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Choose a supported mimeType for MediaRecorder at runtime.
      // Browsers usually support 'audio/webm;codecs=opus' or 'audio/ogg'.
      let options: MediaRecorderOptions | undefined;
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          options = { mimeType: 'audio/ogg;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else {
          // Let the browser decide the default codec
          options = undefined;
        }
      }

      const mediaRecorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

      console.debug('[useAudioRecorder] startRecording - mediaRecorder created, options=', options, 'mimeType=', (mediaRecorder as any).mimeType);

      // cleanup any previously running analyser/timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current as number);
        silenceTimerRef.current = null;
      }
      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch (e) {}
        analyserRef.current = null;
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup WebAudio analyser for silence detection
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.fftSize);

        const SILENCE_THRESHOLD = 0.01; // tuned threshold; may adjust per device
        const SILENCE_TIMEOUT_MS = 2000; // ms of quiet to auto-stop

        const checkSilence = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          // compute root-mean-square (RMS)
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / dataArray.length);

          const now = Date.now();

          if (rms > SILENCE_THRESHOLD) {
            lastSoundTimestampRef.current = now;
          } else {
            // if we've been silent for longer than timeout, stop recording
            if (now - lastSoundTimestampRef.current > SILENCE_TIMEOUT_MS) {
              // stop recorder if active
              console.debug('[useAudioRecorder] silence timeout reached (ms)=', now - lastSoundTimestampRef.current);
              try {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                }
              } catch (e) {
                console.warn('[useAudioRecorder] error stopping MediaRecorder on silence:', e);
              }
            }
          }

          // schedule next check
          silenceTimerRef.current = window.setTimeout(checkSilence, 200);
        };

        // initialize last sound timestamp as now so short initial silence doesn't stop
        lastSoundTimestampRef.current = Date.now();
        silenceTimerRef.current = window.setTimeout(checkSilence, 200);
      } catch (err) {
        console.warn('WebAudio silence detector unavailable:', err);
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
        try {
          console.debug('[useAudioRecorder] ondataavailable - chunk size=', event.data?.size, 'chunks=', audioChunksRef.current.length);
        } catch (e) {}
      };

      // onstop handler is set here so both manual stop and auto-stop (silence)
      // trigger the same behavior.
      mediaRecorder.onstop = () => {
        const blobType = (mediaRecorderRef.current && (mediaRecorderRef.current as any).mimeType) || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

        // cleanup audio chunks immediately to free memory
        audioChunksRef.current = [];
        setIsRecording(false);
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

        // cleanup audio context and timers
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current as number);
          silenceTimerRef.current = null;
        }
        if (analyserRef.current) {
          try { analyserRef.current.disconnect(); } catch(e) {}
          analyserRef.current = null;
        }
        if (audioContextRef.current) {
          try { audioContextRef.current.close(); } catch(e) {}
          audioContextRef.current = null;
        }

        console.debug('[useAudioRecorder] onstop - resolving/dispatching blob size=', audioBlob.size, 'type=', audioBlob.type, 'manualStop=', manualStopRef.current);

        // If a consumer is awaiting stopRecording(), resolve its promise
        if (stopResolveRef.current) {
          stopResolveRef.current(audioBlob);
          stopResolveRef.current = null;
        }

        // If this was an automatic stop (not manual), notify the onStop callback
        if (!manualStopRef.current && onStopRef.current) {
          try { onStopRef.current(audioBlob); } catch (e) { console.warn('[useAudioRecorder] onStop callback error', e); }
        }

        // reset manual flag
        manualStopRef.current = false;
      };
      mediaRecorder.onstart = () => {
        setIsRecording(true);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        setIsRecording(false);
        return resolve(new Blob());
      }

      // Mark this as a manual stop so the onstop handler won't call onStop callback
      manualStopRef.current = true;
      // Save resolver so the onstop handler can resolve this promise
      stopResolveRef.current = resolve;

      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('[useAudioRecorder] stopRecording error calling mediaRecorder.stop():', e);
        stopResolveRef.current = null;
        manualStopRef.current = false;
        setIsRecording(false);
        return resolve(new Blob());
      }
    });
  };

  const setOnRecordingStop = (fn: ((b: Blob) => void) | null) => { onStopRef.current = fn; };

  return { isRecording, startRecording, stopRecording, setOnRecordingStop, browserSupportsRecording: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) };
};