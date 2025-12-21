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
                className={`blog-content-display prose prose-lg prose-slate max-w-none mx-auto
                    prose-headings:font-bold prose-headings:text-slate-800 
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-md
                    ${!isExpanded ? 'line-clamp-5' : ''}
                    transition-all duration-300`}
                dangerouslySetInnerHTML={{ __html: content }}
            />
            
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

            <style>{`
                .blog-content-display ul {
                    list-style-type: disc !important;
                    margin-left: 1.5rem !important;
                    padding-left: 1rem !important;
                }
                .blog-content-display ol {
                    list-style-type: decimal !important;
                    margin-left: 1.5rem !important;
                    padding-left: 1rem !important;
                }
                .blog-content-display li {
                    margin-bottom: 0.5rem !important;
                }
                .blog-content-display p {
                    white-space: pre-line !important;
                }
                .blog-content-display p:empty {
                    min-height: 1rem !important;
                }
                .blog-content-display blockquote {
                    border-left: 4px solid #3b82f6 !important;
                    background-color: #f8fafc !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 0 0.5rem 0.5rem 0 !important;
                }
                .blog-content-display a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                }
                .blog-content-display a:hover {
                    color: #1d4ed8 !important;
                }
            `}</style>
        </div>
    );
}