import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiAward } from 'react-icons/fi';
import { getCertificates } from '../services/certificateService';
import SectionHeader from './ui/SectionHeader';
import CertificateCard from './certificates/CertificateCard';
import Loader from './ui/Loader';

export default function CertificatesSection() {
    const [inView, setInView] = useState(false);

    const { data: certResponse, isLoading } = useQuery({
        queryKey: ['publicCertificates', 'featured'],
        queryFn: () => getCertificates({ limit: 3 }),
        enabled: inView, 
        staleTime: 1000 * 60 * 10,
    });

    const certificates = certResponse?.data || [];

    return (
        <motion.section 
            id="certificates" 
            className="py-20 md:py-28 bg-white"
            onViewportEnter={() => setInView(true)}
            viewport={{ once: true, amount: 0.1 }}
        >
            <div className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader 
                        title="Certifications" 
                        description="Lessons I learn, certificates I earn." 
                    />
                </motion.div>

                <div className="mt-12 min-h-[10rem]">
                    {inView && isLoading && <Loader />}
                    
                    {inView && !isLoading && certificates.length > 0 && (
                        <motion.div 
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {certificates.map((cert: any) => (
                                <CertificateCard key={cert.id} certificate={cert} />
                            ))}
                        </motion.div>
                    )}

                    {inView && !isLoading && certificates.length === 0 && (
                        <div className="text-center text-slate-400 py-10">
                            <FiAward size={40} className="mx-auto mb-2 opacity-50"/>
                            <p>Certifications coming soon.</p>
                        </div>
                    )}
                </div>

                {certificates.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link to="/certificates" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                            View All Certifications &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </motion.section>
    );
}