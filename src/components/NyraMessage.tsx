// src/components/NyraMessage.tsx
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

interface NyraMessageProps {
  fullText: string;
  isTyping: boolean;
  onTypingComplete: () => void;
  typingSpeed?: number;
}

// Helper to clean markdown for the speech engine
export const cleanTextForSpeech = (text: string) => {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
        .replace(/(\*|_)(.*?)\1/g, '$2')   // Remove italic
        .replace(/`([^`]+)`/g, '$1')       // Remove inline code
        .replace(/#+\s/g, '')             // Remove headings
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
};

const NyraMessage = ({ fullText, isTyping, onTypingComplete, typingSpeed = 100 }: NyraMessageProps) => {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    setTypedText(''); // Reset on new message
    if (!isTyping || fullText === "...") {
      // If it's a "thinking" message or not supposed to type, show it
      setTypedText(fullText);
      onTypingComplete();
      return;
    }

    const words = fullText.split(' ');
    let i = 0;
    const timer = setInterval(() => {
      if (i < words.length) {
        setTypedText(prev => prev + words[i] + ' ');
        i++;
      } else {
        clearInterval(timer);
        onTypingComplete();
      }
    }, typingSpeed);

    return () => {
      clearInterval(timer);
    };
  }, [fullText, isTyping, onTypingComplete, typingSpeed]);

  // Show "thinking" spinner
  if (fullText === "...") {
    return (
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
    );
  }

  // Show text (typed or final)
  return <ReactMarkdown>{typedText}</ReactMarkdown>;
};

export default NyraMessage;