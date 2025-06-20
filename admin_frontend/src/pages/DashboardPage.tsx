import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiUsers, FiCheckSquare, FiSend, FiLayers, FiFileText } from 'react-icons/fi';

import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/dashboard/StatCard';
import ContentSummaryChart from '../components/dashboard/ContentSummaryChart';
import { getDashboardStats } from '../services/dashboardService';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // --- THIS IS THE FIX ---
  // The page now handles loading and error states before trying to render the data.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Spinner overlay={true} text="Loading Dashboard Details..." />
        <span className="ml-4 text-slate-500">Loading Dashboard Data...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 rounded-md bg-red-50 text-red-700">Error loading dashboard data. Please ensure the backend is running and try refreshing the page.</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  
  return (
    <div>
      <motion.div initial="hidden" animate="visible" variants={itemVariants}>
        <PageHeader title="Dashboard" />
      </motion.div>

      {/* Stat Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- THIS IS THE FIX ---
          - We use optional chaining (?.) and a fallback value (|| 0) for safety.
          - This prevents crashes if `data` or `data.contactStats` is undefined.
        */}
        <motion.div variants={itemVariants}>
          <StatCard title="Total Messages" value={data?.contactStats?.total || 0} icon={FiMessageSquare} color="bg-blue-500" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Unread Messages" value={data?.contactStats?.unread || 0} icon={FiSend} color="bg-amber-500" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Unique Senders" value={data?.contactStats?.uniqueSenderCount || 0} icon={FiUsers} color="bg-emerald-500" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Responded" value={data?.contactStats?.responded || 0} icon={FiCheckSquare} color="bg-slate-500" />
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="lg:col-span-2">
            <ContentSummaryChart 
                skillSummary={data?.skillSummary || []} 
                projectSummary={data?.projectSummary || []} 
            />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
            <ul className="space-y-4">
                {(data?.recentMessages || []).length > 0 ? data.recentMessages.map((msg: any) => (
                    <li key={msg.id} className="flex items-start space-x-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                           {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{msg.name}</p>
                            <p className="text-sm text-slate-500 truncate">{msg.subject}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            msg.status === 'UNREAD' ? 'bg-amber-100 text-amber-800' : 
                            msg.status === 'RESPONDED' ? 'bg-slate-200 text-slate-600' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {msg.status}
                        </span>
                    </li>
                )) : <p className="text-sm text-slate-500">No recent messages.</p>}
            </ul>
        </div>
      </motion.div>
    </div>
  );
}