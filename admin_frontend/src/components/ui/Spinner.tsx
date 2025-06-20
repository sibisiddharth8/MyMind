interface SpinnerProps {
  className?: string;
  overlay?: boolean;
  text?: string;
}

export default function Spinner({ className = '', overlay = false, text }: SpinnerProps) {
  // The visual spinning element
  const spinnerIcon = (
    <div 
      // THE FIX: Changed 'border-blue-600' to 'border-current'
      // It now inherits its color from the parent's text color.
      className={`w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin ${className}`} 
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  // The overlay logic remains the same
  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {/* We adjust the size and color for the overlay version */}
        <div className={`w-6 h-6 border-2 border-dashed border-blue-600 border-t-transparent rounded-full animate-spin ${className}`}></div>
        {text && <p className="mt-4 text-sm font-semibold text-slate-600">{text}</p>}
      </div>
    );
  }

  // By default, return the small inline spinner
  return spinnerIcon;
}