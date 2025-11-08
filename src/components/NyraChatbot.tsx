import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiX, FiSend, FiLoader, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { askNyra } from '../services/nyraService';
import type { ChatMessage } from '../services/nyraService';
import { transcribeAudio } from '../services/sttService';
import { getSpeechAudio } from '../services/ttsService';
import nyraLogo from '../assets/NyraAI.png';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

// Import all the custom hooks and components
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import NyraVoiceVisualizer from './NyraVoiceVisualizer';

interface UIMessage {
    id: number;
    text: string;
    sender: 'user' | 'nyra';
}

// Helper to clean markdown for the speech engine
const cleanTextForSpeech = (text: string) => {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
        .replace(/(\*|_)(.*?)\1/g, '$2')   // Remove italic
        .replace(/`([^`]+)`/g, '$1')       // Remove inline code
        .replace(/#+\s/g, '')             // Remove headings
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
};

const NyraChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<UIMessage[]>([
        { id: 1, text: "Hello! I'm Nyra. Feel free to ask me anything about MyMind", sender: 'nyra' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [apiLoading, setApiLoading] = useState(false); // For Nyra's AI
    const [isTranscribing, setIsTranscribing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(
        () => localStorage.getItem('nyraFullScreen') === 'true'
    );

    const { isRecording, startRecording, stopRecording, setOnRecordingStop, browserSupportsRecording } = useAudioRecorder();
    const { play, stop: stopSpeaking, isSpeaking, isMuted, toggleMute } = useAudioPlayer();
    
    // Combined loading state for UI (not used directly here)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('nyraFullScreen', String(isFullScreen));
    }, [isFullScreen]);

    // --- Core Logic ---
    const handleSend = async (messageText: string, isFromVoice: boolean) => {
        if (!messageText.trim() || apiLoading || isSpeaking) return;

        setApiLoading(true);
        const userMessage: UIMessage = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        
        // Add a "thinking" message
        const thinkingMessage: UIMessage = { id: Date.now() + 1, text: "...", sender: 'nyra' };
        setMessages(prev => [...prev, thinkingMessage]);

        try {
            const history: ChatMessage[] = messages
                .filter(m => m.id !== thinkingMessage.id) 
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    content: msg.text
                }));

            const data = await askNyra(messageText, history);
            const nyraReply = data.reply;

            // Update the "thinking" message with the final text
            setMessages(prev => prev.map(m => m.id === thinkingMessage.id ? { ...m, text: nyraReply } : m));
            console.debug('[NyraChatbot] handleSend - nyraReply received', { thinkingMessageId: thinkingMessage.id, nyraReply });

            // Only speak if we are in voice mode
            if (isFromVoice) {
                const textToSpeak = cleanTextForSpeech(nyraReply);
                const audioBlob = await getSpeechAudio(textToSpeak);
                play(audioBlob, () => {
                    // --- SEAMLESS LOOP ---
                    // This callback runs *after* the audio finishes.
                    // Small delay to avoid immediately capturing silence or TTS tail
                    setTimeout(() => { if (isVoiceMode) startRecording(); }, 300);
                });
            }

        } catch (error) {
            console.error("Error in handleSend:", error);
            const errorMessage = "Sorry, I'm having a little trouble connecting.";
            console.debug('[NyraChatbot] handleSend - setting error on thinking message', { thinkingMessageId: thinkingMessage.id, error });
            setMessages(prev => prev.map(m => m.id === thinkingMessage.id ? { ...m, text: errorMessage } : m));
            
            if (isFromVoice) {
                const audioBlob = await getSpeechAudio(cleanTextForSpeech(errorMessage));
                play(audioBlob, () => {
                    if (isVoiceMode) startRecording(); // Auto-listen even on error
                });
            }
        } finally {
            setApiLoading(false);
        }
    };

    // --- Event Handlers ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(inputValue, false); // false = not from voice
        setInputValue('');
    };

    // Process a recorded audio blob (shared between manual and auto-stop)
    const processRecordedBlob = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        console.debug('[NyraChatbot] processRecordedBlob - blob', { size: audioBlob.size, type: audioBlob.type });

        if (audioBlob.size < 1000) { // too small -> consider no speech
            console.warn("Empty audio blob, not transcribing.");
            setIsTranscribing(false);
            // No audio captured — disable voice mode to save resources
            setIsVoiceMode(false);
            // If suppression is enabled (user explicitly turned off voice mode),
            // don't append messages or play TTS.
            if (suppressErrorsRef.current) return;

            const errorMessage: UIMessage = { id: Date.now() + 1, text: "I couldn't detect any speech — voice mode has been turned off.", sender: 'nyra' };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        try {
            const transcribedText = await transcribeAudio(audioBlob);
            console.debug('[NyraChatbot] processRecordedBlob - transcribedText', { transcribedText });
            setIsTranscribing(false);
            if (transcribedText) {
                handleSend(transcribedText, true);
            } else {
                // No words detected — disable voice mode to save resources
                setIsTranscribing(false);
                setIsVoiceMode(false);
                if (suppressErrorsRef.current) {
                    try { stopRecording(); } catch (e) { /* ignore */ }
                    return;
                }
                const errorMessage: UIMessage = { id: Date.now() + 1, text: "I didn't hear anything — voice mode has been turned off.", sender: 'nyra' };
                setMessages(prev => [...prev, errorMessage]);
                try { stopRecording(); } catch (e) { /* ignore */ }
            }
        } catch (error) {
            setIsTranscribing(false);
            console.error("Transcription failed:", error);
            console.debug('[NyraChatbot] processRecordedBlob - transcription error', { error });
            // If we're intentionally suppressing errors (user explicitly
            // turned off voice mode), don't append the apology message.
            if (suppressErrorsRef.current) {
                return;
            }

            const errorMessage: UIMessage = { id: Date.now() + 1, text: "Sorry, I couldn't understand that.", sender: 'nyra' };
            console.debug('[NyraChatbot] processRecordedBlob - appending error message', { errorMessage });
            setMessages(prev => [...prev, errorMessage]);
            const audioBlobErr = await getSpeechAudio(cleanTextForSpeech(errorMessage.text));
            play(audioBlobErr, () => {
                setTimeout(() => { if (isVoiceMode) startRecording(); }, 300);
            });
        }
    };

    // Register automatic stop handler so auto-stop (silence) triggers processing
    useEffect(() => {
        if (setOnRecordingStop) {
            // Use a simple wrapper so we don't depend on the async function identity
            const handler = (b: Blob) => { void processRecordedBlob(b); };
            setOnRecordingStop(handler);
            return () => { setOnRecordingStop(null); };
        }
    }, [setOnRecordingStop]);

    // When we explicitly turn off voice mode (user pressed the toggle), we
    // want to suppress follow-up error messages that may be generated by the
    // recorder's onstop handling (for example a tiny/empty blob causing a
    // "Sorry, I couldn't understand that." append). This ref is checked by
    // the transcription/error handlers.
    const suppressErrorsRef = useRef(false);

    // This is the "Tap-to-Talk / Tap-to-Stop" handler
    const handleVoiceTap = async () => {
        if (isSpeaking) {
            stopSpeaking(); // Allow user to interrupt bot
            return;
        }

        if (isRecording) {
            // --- User finished speaking, stop recording ---
            setIsTranscribing(true); // Show "Transcribing..."
            const audioBlob = await stopRecording();
            console.debug('[NyraChatbot] handleVoiceTap - stopped recording, blob', { size: audioBlob.size, type: audioBlob.type });
            
            if (audioBlob.size < 1000) { // Check for tiny, empty audio file
                console.warn("Empty audio blob, not transcribing.");
                setIsTranscribing(false);
                // No audio captured — disable voice mode to save resources
                setIsVoiceMode(false);
                if (suppressErrorsRef.current) {
                    return;
                }
                const errorMessage: UIMessage = { id: Date.now() + 1, text: "I couldn't detect any speech — voice mode has been turned off.", sender: 'nyra' };
                setMessages(prev => [...prev, errorMessage]);
                return;
            }

            try {
                const transcribedText = await transcribeAudio(audioBlob);
                setIsTranscribing(false);
                if (transcribedText) {
                    handleSend(transcribedText, true); // true = from voice
                } else {
                    // No words detected — disable voice mode to save resources
                    setIsTranscribing(false);
                    setIsVoiceMode(false);
                    if (suppressErrorsRef.current) {
                        return;
                    }
                    const errorMessage: UIMessage = { id: Date.now() + 1, text: "I didn't hear anything — voice mode has been turned off.", sender: 'nyra' };
                    setMessages(prev => [...prev, errorMessage]);
                    try { stopRecording(); } catch (e) { /* ignore */ }
                }
            } catch (error) {
                setIsTranscribing(false);
                console.error("Transcription failed:", error);
                console.debug('[NyraChatbot] handleVoiceTap - transcription error', { error });
                if (suppressErrorsRef.current) {
                    return;
                }

                const errorMessage: UIMessage = { id: Date.now() + 1, text: "Sorry, I couldn't understand that.", sender: 'nyra' };
                console.debug('[NyraChatbot] handleVoiceTap - appending error message', { errorMessage });
                setMessages(prev => [...prev, errorMessage]);
                const audioBlob = await getSpeechAudio(cleanTextForSpeech(errorMessage.text));
                play(audioBlob, () => {
                    setTimeout(() => { if (isVoiceMode) startRecording(); }, 300);
                });
            }
        } else if (!apiLoading && !isSpeaking) {
            // --- User wants to start speaking ---
            startRecording();
        }
    };

    const toggleVoiceMode = async () => {
        const nextIsVoiceMode = !isVoiceMode;
        if (nextIsVoiceMode) {
            // Entering voice mode: start listening if possible
            setIsVoiceMode(true);
            if (!isRecording && !apiLoading && !isSpeaking) {
                startRecording();
            }
            return;
        }

        // Exiting voice mode: prevent any onstop handlers from appending
        // error messages while we cleanly stop recording and speaking.
        suppressErrorsRef.current = true;
        try {
            if (isRecording) {
                await stopRecording();
            }
        } catch (e) {
            // ignore
        }
        stopSpeaking();
        setIsVoiceMode(false);
        setTimeout(() => { suppressErrorsRef.current = false; }, 500);
    };

    const getVoiceState = (): 'listening' | 'thinking' | 'transcribing' | 'idle' => {
        if (apiLoading || isSpeaking) return 'thinking';
        if (isTranscribing) return 'transcribing';
        if (isRecording) return 'listening';
        return 'idle';
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 ring ring-blue-500 bg-white text-white p-1.5 rounded-full shadow-lg z-50 transition-colors cursor-pointer"
                aria-label="Open Chat"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <img src={nyraLogo} alt="" className='w-8 h-8 rounded-full' />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={`fixed ${isFullScreen 
                            ? 'inset-0 w-full h-full rounded-none' 
                            : 'bottom-0 right-0 sm:bottom-24 sm:right-6 w-full h-full sm:w-[400px] sm:h-[73vh] sm:max-h-[600px] sm:rounded-xl'
                        } bg-white border border-slate-200 shadow-2xl flex flex-col z-50`}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sm:rounded-t-xl">
                            <div onClick={() => navigate('/nyra')} className="flex items-center gap-1 hover:cursor-pointer hover:underline">
                                <img src={nyraLogo} alt="Nyra Logo" className="w-7 h-7"/>
                                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-1">
                                    Nyra.ai
                                    <FiInfo className="inline ml-1 text-slate-800 h-4 w-4" title="Nyra (Beta) is still learning and could make mistakes." />
                                </h2>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                                {browserSupportsRecording && (
                                    <button 
                                        onClick={toggleVoiceMode} 
                                        className={`p-2 rounded-full ${isVoiceMode ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200'} transition-colors`} 
                                        aria-label="Toggle Voice Mode"
                                    >
                                        {isVoiceMode ? <FiMicOff size={18} /> : <FiMic size={18} />}
                                    </button>
                                )}
                                <button 
                                    onClick={toggleMute} 
                                    className={`p-2 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-slate-200'} transition-colors`} 
                                    aria-label="Toggle Mute"
                                >
                                    {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                                </button>
                                <button 
                                    onClick={() => setIsFullScreen(prev => !prev)} 
                                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors hidden sm:block" 
                                    aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                                >
                                    {isFullScreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800" aria-label="Close Chat">
                                    <FiX size={24} />
                                </button>
                            </div>
                        </header>

                        {/* Message List */}
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-100/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg'}`}>
                                        {apiLoading && msg.text === "..." ? (
                                            <motion.div 
                                                className="flex items-center gap-2 text-slate-500"
                                                initial={{ opacity: 0 }} 
                                                animate={{ opacity: 1 }}
                                            >
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                    <FiLoader />
                                                </motion.div>
                                                Nyra is thinking...
                                            </motion.div>
                                        ) : (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area (Text vs. Voice) */}
                        <AnimatePresence mode="wait">
                            {isVoiceMode ? (
                                <motion.div
                                    key="voice"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <NyraVoiceVisualizer
                                        state={getVoiceState()}
                                        onClick={handleVoiceTap}
                                    />
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="text"
                                    onSubmit={handleSubmit}
                                    className="p-4 border-t border-slate-200 flex items-center gap-2 bg-white sm:rounded-b-xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask me a question..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        disabled={apiLoading}
                                    />
                                    <button
                                        type="submit"
                                        className="cursor-pointer bg-blue-600 text-white p-3 rounded-lg disabled:bg-slate-400 hover:bg-blue-700 transition-colors"
                                        disabled={apiLoading || !inputValue.trim()}
                                        aria-label="Send Message"
                                    >
                                        <FiSend />
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NyraChatbot;