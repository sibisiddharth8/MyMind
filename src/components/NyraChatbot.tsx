import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { askNyra } from '../services/nyraService';
import type { ChatMessage } from '../services/nyraService';
import nyraLogo from '../assets/NyraAI.png';
import ReactMarkdown from 'react-markdown';

import { useNavigate } from 'react-router-dom';

interface UIMessage {
    id: number;
    text: string;
    sender: 'user' | 'nyra';
}

const NyraChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<UIMessage[]>([
        { id: 1, text: "Hello! I'm Nyra. Feel free to ask me anything about MyMind", sender: 'nyra' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: UIMessage = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const history: ChatMessage[] = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                content: msg.text
            }));

            const data = await askNyra(userMessage.text, history);

            const nyraMessage: UIMessage = { id: Date.now() + 1, text: data.reply, sender: 'nyra' };
            setMessages(prev => [...prev, nyraMessage]);
        } catch (error) {
            console.error("Failed to get response from Nyra:", error);
            const errorMessage: UIMessage = { id: Date.now() + 1, text: "Sorry, I'm having a little trouble connecting. Please try again in a moment.", sender: 'nyra' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
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
                        className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full h-full sm:w-[400px] sm:h-[73vh] sm:max-h-[600px] bg-white border border-slate-200 rounded-none sm:rounded-xl shadow-2xl flex flex-col z-50"
                    >
                        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                            <div onClick={() => navigate('/nyra')} className="flex items-center gap-1 hover:cursor-pointer hover:underline">
                                <img src={nyraLogo} alt="Nyra Logo" className="w-7 h-7"/>
                                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-1">
                                    <div className=''>Nyra.ai</div>
                                    <FiInfo className="inline ml-1 text-slate-800 h-4 w-4" title="Nyra (Beta) is still learning and could make mistakes." />
                                </h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 cursor-pointer" aria-label="Close Chat">
                                <FiX size={24} />
                            </button>
                        </header>

                        <div className="flex-1 p-4 overflow-y-auto bg-slate-100/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-lg'
                                                : 'bg-slate-200 text-slate-800 rounded-bl-lg'
                                        }`}
                                    >
                                        {msg.sender === 'nyra' ? (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-slate-200 text-slate-500 p-3 rounded-2xl rounded-bl-lg flex items-center gap-2">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <FiLoader />
                                        </motion.div>
                                        Nyra is thinking...
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex items-center gap-2 bg-white rounded-b-xl">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me a question..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="cursor-pointer bg-blue-600 text-white p-3 rounded-lg disabled:bg-slate-400 hover:bg-blue-700 transition-colors"
                                disabled={isLoading}
                                aria-label="Send Message"
                            >
                                <FiSend />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NyraChatbot;