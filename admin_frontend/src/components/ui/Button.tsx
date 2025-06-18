import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger'; // <-- Add 'danger' variant
  children: React.ReactNode;
}

export default function Button({
  children,
  isLoading = false,
  variant = 'primary',
  className = '', // Allow for additional classes
  ...props
}: ButtonProps) {
  const baseClasses = "flex items-center justify-center px-4 py-2 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // Define styles for each variant
  const variantClasses = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'text-slate-700 bg-slate-200 hover:bg-slate-300 focus:ring-slate-400',
    // --- NEW DANGER VARIANT ---
    danger: 'text-red-600 bg-white border border-red-500 hover:bg-red-50 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}