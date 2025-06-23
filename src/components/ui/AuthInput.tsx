import type { UseFormRegisterReturn } from 'react-hook-form';
import type { ReactNode } from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  icon: ReactNode;
  error?: boolean;
}

export default function AuthInput({ id, label, register, icon, error, ...props }: AuthInputProps) {
  return (
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-300 ${error ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
        {icon}
      </div>
      <input
        id={id}
        {...register}
        {...props}
        placeholder=" " // The space is crucial for the floating label to work
        className={`block w-full rounded-lg border py-3 px-4 pl-10 text-base appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300 ${error ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-blue-600'}`}
      />
      {/* THIS IS THE FIX: The label now uses peer-focus and peer-[:not(:placeholder-shown)]
          to correctly stay floated up when the input has a value. */}
      <label
        htmlFor={id}
        className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-8 ${error ? 'text-red-600' : 'text-slate-500 peer-focus:text-blue-600'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-75 peer-focus:-translate-y-4`}
      >
        {label}
      </label>
    </div>
  );
}