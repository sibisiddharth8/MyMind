import { forwardRef } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

const SettingsInput = forwardRef<HTMLInputElement, SettingsInputProps>(
  ({ label, error, register, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          ref={ref}
          {...register}
          {...props}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border rounded-lg text-slate-900 placeholder:text-slate-400 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'} 
            ${props.disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white hover:border-slate-400'}
            ${className}`}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

SettingsInput.displayName = 'SettingsInput';

export default SettingsInput;
