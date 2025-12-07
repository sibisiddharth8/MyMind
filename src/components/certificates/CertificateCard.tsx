import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiAward, FiArrowUpRight } from 'react-icons/fi';

interface Certificate {
    id: string;
    name: string;
    certificateFile: string;
    // category: { name: string };
    issuer?: string;
}

export default function CertificateCard({ certificate }: { certificate: Certificate }) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            className="group relative h-[260px] w-full rounded-2xl overflow-hidden cursor-pointer"
        >
            <Link to={`/certificates/${certificate.id}`} className="block h-full w-full">
                
                <div className="absolute inset-0 bg-slate-50">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl group-hover:bg-blue-300/50 transition-colors duration-500" />
                    <div className="absolute top-20 -left-10 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl group-hover:bg-purple-300/50 transition-colors duration-500" />
                    <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]" />
                </div>

                <div className="absolute inset-0 pb-16 flex items-center justify-center p-6">
                    <motion.div 
                        variants={{
                            hover: { y: -5, scale: 1.05, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" },
                            rest: { y: 0, scale: 1, filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }
                        }}
                        initial="rest"
                        transition={{ duration: 0.3 }}
                        className="relative z-10 w-full h-full flex items-center justify-center"
                    >
                        {certificate.certificateFile ? (
                            <img 
                                src={certificate.certificateFile} 
                                alt={certificate.name} 
                                className="max-w-full max-h-full object-contain rounded-lg border border-white/50"
                            />
                        ) : (
                            <FiAward className="text-slate-400/50 text-6xl" />
                        )}
                    </motion.div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 h-[72px] bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-sm p-3 flex flex-col justify-center transition-colors duration-300 group-hover:bg-white/90">

                    <div className='pt-7 p-1'>
                        <h3 className="text-xs sm:text-sm text-center font-bold text-slate-800 leading-tight line-clamp-2" title={certificate.name}>
                            {certificate.name}
                        </h3>

                        <div className="text-[9px] sm:text-[10px] text-center font-bold uppercase tracking-widest text-blue-600 mb-1">
                            {certificate.issuer}
                        </div>
                    </div>
                </div>
                <div>
                    <motion.div 
                        className="absolute top-3 right-3 bg-white/70 backdrop-blur-md rounded-full p-2 border border-white/60 shadow-sm transition-opacity duration-300"
                    >
                        <FiArrowUpRight className="text-slate-600" />
                    </motion.div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none z-20" />
            
            </Link>
        </motion.div>
    );
}