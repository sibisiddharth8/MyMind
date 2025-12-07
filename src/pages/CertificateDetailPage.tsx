import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiExternalLink, FiAward, FiCheckCircle, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { getCertificateById } from '../services/certificateService';
import Loader from '../components/ui/Loader';
import ScrollToTop from '../components/ui/ScrollToTop';
import toast from 'react-hot-toast';

interface Certificate {
    id: string;
    name: string;
    issuer?: string;
    issueDate?: string;
    certificateFile: string;
    verificationLink?: string;
    category: { name: string };
}

export default function CertificateDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: certResponse, isLoading, isError } = useQuery({
        queryKey: ['certificate', id],
        queryFn: () => getCertificateById(id!),
        enabled: !!id,
    });

    const certificate: Certificate | null = certResponse?.data || null;

    const handleShare = () => {
        const shareData = {
            title: certificate?.name || 'Certificate',
            text: `Check out this certification: ${certificate?.name}`,
            url: window.location.href
        };
        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.error(err));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    if (isLoading) return <Loader />;

    if (isError || !certificate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <FiAward size={32} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Certificate Not Found</h2>
                <Link to="/certificates" className="mt-4 text-blue-600 hover:underline font-medium">Back to All Certifications</Link>
            </div>
        );
    }

    const formattedDate = certificate.issueDate 
        ? new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        : 'N/A';

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <ScrollToTop />

            <main className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
                >
                    <div className="grid lg:grid-cols-5 min-h-[600px]">
                        
                        <div className="lg:col-span-3 bg-slate-100 p-8 md:p-12 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-200">

                            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]" />
                            
                            <motion.div 
                                layoutId={`cert-img-${certificate.id}`}
                                className="relative z-10 w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden bg-white ring-1 ring-black/5"
                            >
                                {certificate.certificateFile ? (
                                    <img 
                                        src={certificate.certificateFile} 
                                        alt={certificate.name} 
                                        className="w-full h-auto object-contain max-h-[70vh]" 
                                    />
                                ) : (
                                    <div className="h-64 bg-slate-50 flex items-center justify-center text-slate-300">
                                        <FiAward size={64} />
                                    </div>
                                )}
                            </motion.div>
                        </div>

  
                        <div className="lg:col-span-2 p-4 md:p-12 flex flex-col justify-center bg-white relative">
 
                            <div className="mb-6 flex items-center justify-between">
                                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full border border-blue-100">
                                    {certificate.category.name}
                                </span>
                                 <button 
                                onClick={handleShare}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                                title="Share"
                            >
                                <FiShare2 size={20} />
                            </button>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-8">
                                {certificate.name}
                            </h1>


                            <div className="space-y-8 mb-12">
               
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                        <FiAward size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Issued By</p>
                                        <p className="text-lg font-bold text-slate-800">{certificate.issuer || 'Unknown Organization'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                        <FiCalendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Issue Date</p>
                                        <p className="text-lg font-bold text-slate-800">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100">
                                {certificate.verificationLink ? (
                                    <a 
                                        href={certificate.verificationLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                                    >
                                        Verify Credential 
                                        <FiExternalLink className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold py-4 rounded-2xl border border-slate-100 cursor-not-allowed select-none">
                                        <FiCheckCircle /> Verified Offline
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}