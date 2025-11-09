import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiLoader, FiSquare } from 'react-icons/fi';

interface NyraVoiceVisualizerProps {
  state: 'listening' | 'thinking' | 'transcribing' | 'idle';
  onClick: () => void;
}

export default function NyraVoiceVisualizer({ state, onClick }: NyraVoiceVisualizerProps) {
  const isBusy = state === 'thinking' || state === 'transcribing';

  return (
    <div className="p-4 border-t border-slate-200 flex flex-col items-center justify-center bg-white rounded-b-xl h-[110px] relative">
      <motion.button
        key={state}
        onClick={onClick}
        disabled={isBusy}
        aria-pressed={state === 'listening'}
        className={`w-20 h-20 text-white rounded-full flex items-center justify-center shadow-2xl focus:outline-none relative transition-colors
          ${state === 'listening' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          ${isBusy ? 'bg-slate-400 cursor-not-allowed' : ''}
        `}
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {/* Soft pulsing rings when listening */}
        <AnimatePresence>
          {state === 'listening' && (
            <motion.div
              className="absolute w-full h-full rounded-full bg-red-500/30"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* Icon and tiny waveform indicator */}
        {isBusy ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <FiLoader size={28} />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {state === 'listening' ? <FiSquare size={22} /> : <FiMic size={22} />}
            {/* <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 animate-pulse" style={{ width: state === 'listening' ? '70%' : '20%' }} />
            </div> */}
          </div>
        )}
      </motion.button>

      <div className="text-xs text-slate-600 mt-3 flex flex-col items-center">
        <div>
          {state === 'listening' && 'Listening — auto-stops on silence'}
          {state === 'transcribing' && 'Transcribing...'}
          {state === 'thinking' && 'Nyra is thinking...'}
          {state === 'idle' && 'Tap to speak'}
        </div>
        <div className="text-[10px] text-slate-400">Tip: tap to stop, or remain silent to auto-stop</div>
      </div>
    </div>
  );
}