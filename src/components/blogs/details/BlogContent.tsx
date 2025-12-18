import parse from 'html-react-parser';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function BlogContent({ content }: { content: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`prose prose-lg prose-slate max-w-none mx-auto
                    prose-headings:font-bold prose-headings:text-slate-800 
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-md
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                    ${!isExpanded ? 'line-clamp-5' : ''}
                    transition-all duration-300`}
            >
                {parse(content)}
            </motion.div>
            
            {/* Glassmorphic Fade Overlay (only when collapsed) */}
            {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
            
            {/* Read More / Show Less Button */}
            <div className="relative mt-8 flex justify-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group flex items-center gap-2 px-5 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                    {isExpanded ? (
                        <>
                            <FiChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
                            Show Less
                        </>
                    ) : (
                        <>
                            Read Full Article
                            <FiChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}