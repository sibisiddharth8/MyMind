// src/hooks/useSpeechRecognition.ts
import { useState, useEffect, useRef } from 'react';

// Some browsers expose webkitSpeechRecognition. Use a defensive any to avoid TS window typing issues.
const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Browser doesn't support SpeechRecognition.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript(''); // Clear old transcript on start
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const newTranscript = event.results[event.results.length - 1][0].transcript;
            setTranscript(newTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event?.error ?? event);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript(''); // Clear just in case
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return { isListening, transcript, startListening, stopListening, browserSupportsSpeech: !!SpeechRecognition };
};