interface SpinnerProps {
  className?: string;
  /** If true, the spinner will render as a full-page overlay. */
  overlay?: boolean;
  /** Optional text to display below the spinner in overlay mode. */
  text?: string;
}

export default function Spinner({ className = '', overlay = false, text }: SpinnerProps) {
  // --- Part 1: The visual spinning icon itself ---
  const spinnerIcon = (
    <div 
      className={`w-5 h-5 border-2 border-dashed border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} 
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  // --- Part 2: The logic to create the overlay ---
  // If you use the 'overlay={true}' prop, it wraps the icon in a full-page, centered container.
  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {spinnerIcon}
        {text && <p className="mt-4 text-sm font-semibold text-slate-600">{text}</p>}
      </div>
    );
  }

  // --- Part 3: The Default Behavior ---
  // If you don't use the 'overlay' prop, it just returns the small spinning icon.
  return spinnerIcon;
}