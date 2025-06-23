import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicAuth } from '../context/PublicAuthContext';
import SectionHeader from './ui/SectionHeader';
import ActionButton from './ui/ActionButton';
import PublicAuthModal from './contact/PublicAuthModal';
import ContactForm from './contact/ContactForm';
import { FiMessageSquare } from 'react-icons/fi';

export default function ContactSection() {
    const { isAuthenticated, user, logout } = usePublicAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    return (
        <>
            <section 
                id="contact" 
                className="py-20 md:py-28 bg-slate-100 border-t border-slate-200"
            >
                <div className="container mx-auto px-6 text-center">
                    <SectionHeader 
                        title="Get In Touch"
                        description="Have a project in mind or just want to connect? I'm always open to discussing new ideas and opportunities."
                    />
                    <div className="mt-10 max-w-xl mx-auto">
                        <AnimatePresence mode="wait">
                            {isAuthenticated ? (
                                <motion.div 
                                    key="contact-form"
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <ContactForm />
                                    <button 
                                        onClick={logout} 
                                        className="text-xs text-slate-500 hover:text-blue-600 hover:underline mt-6"
                                    >
                                        Sign out
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="login-prompt"
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-4 flex flex-col items-center"
                                >
                                    <ActionButton onClick={() => setIsAuthModalOpen(true)}>
                                        <FiMessageSquare className="mr-2"/>
                                        Login or Register
                                    </ActionButton>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        The best way to ensure I see your message is through the portal. It's quick, secure, and helps me keep track of all our conversations.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
            <PublicAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}