import type { UseFormRegisterReturn } from 'react-hook-form';
import type { ReactNode } from 'react';

// This component uses a standard and accessible floating-label pattern with the peer-[] CSS selector.
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  icon: ReactNode;
}

export default function AuthInput({ id, label, register, icon, ...props }: AuthInputProps) {
  return (
    <div className="relative">
      {/* The Icon is positioned absolutely within the container */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 peer-focus:text-blue-600 transition-colors duration-300">
        {icon}
      </div>

      <input
        id={id}
        {...register}
        {...props}
        placeholder=" " // The space is crucial for the floating label to work
        // The peer class allows the label to react to the input's state
        className="block w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors duration-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 peer"
      />
      
      {/* The Floating Label (with corrected classes) */}
      <label
        htmlFor={id}
        className="
          absolute 
          left-10 
          top-3 
          origin-[0] 
          -translate-y-1/2 
          scale-75
          transform   
          text-sm 
          text-slate-500 
          transition-all 
          duration-300
         
          peer-placeholder-shown:top-6/13 
          peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:scale-100 
          peer-focus:top-3
          peer-focus:-translate-y-4/7
          peer-focus:scale-75
          peer-focus:text-blue-600
          peer-focus:px-1
        "
      >
        {label}
      </label>
    </div>
  );
}