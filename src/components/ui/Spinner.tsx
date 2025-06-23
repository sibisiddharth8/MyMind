// This is the small, inline spinner for buttons.
// It uses `currentColor` to automatically match the button's text color (e.g., white).
export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`w-5 h-5 border-2 border-dashed border-current border-t-transparent rounded-full animate-spin ${className}`} 
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}