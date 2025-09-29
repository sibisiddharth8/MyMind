import React from 'react';
import { FiTool, FiCalendar, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Props {
  message: string;
  endTime?: string | null;
}

const formatExpectedTime = (isoString: string | undefined | null): { date: string, time: string, timezone: string } | null => {
  if (!isoString) return null;
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const timezoneFormatter = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'shortOffset',
  });

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
    timezone: timezoneFormatter.format(date).split(' ').pop() || '',
  };
};

const currentYear = new Date().getFullYear();

const MaintenanceSection: React.FC<Props> = ({ message, endTime }) => {
  const defaultMessage =
    "We're currently performing essential updates to improve your experience. Thank you for your patience!";
  const displayMessage = message || defaultMessage;
  const formattedEndTime = formatExpectedTime(endTime);

  return (
    <div className='h-screen'>
    <div className="flex items-center justify-center bg-slate-50 p-6 font-sans text-slate-800 overflow-auto h-[calc(100vh-32px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 100 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600"
        >
          <FiTool className="h-10 w-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
        >
          Under Maintenance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-4 max-w-prose text-lg leading-relaxed text-slate-600 md:text-xl"
        >
          {displayMessage}
        </motion.p>

        {formattedEndTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/50 p-4"
          >
            <div className="flex items-center gap-3 text-left">
              <FiCalendar className="h-6 w-6 text-sky-500" />
              <div>
                <p className="text-sm font-medium text-slate-500">Expected Date</p>
                <p className="text-lg font-semibold text-slate-800">{formattedEndTime.date}</p>
              </div>
            </div>
            <div className="h-full w-px bg-sky-200 hidden md:block" aria-hidden="true"></div>
            <div className="flex items-center gap-3 text-left">
              <FiClock className="h-6 w-6 text-sky-500" />
              <div>
                <p className="text-sm font-medium text-slate-500">Expected Time</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formattedEndTime.time}{' '}
                  <span className="text-sm font-normal text-slate-500">({formattedEndTime.timezone})</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-sm text-slate-500"
        >
          We apologize for any inconvenience this may cause.
        </motion.p>
      </motion.div>
    </div>

    <p className="text-xs text-slate-500 w-full text-center sm:text-start p-2">
        &copy; {currentYear} Sibi Siddharth S. All Rights Reserved.
    </p>
    </div>
  );
};

export default MaintenanceSection;