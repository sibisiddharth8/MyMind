import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';

// We now ONLY import the function, not the type.
import { loginUser } from '../services/authService';

// We define the type again, directly inside this file.
interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginCredentials>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      login(response.token);
      toast.success(response.message || 'Login Successful!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login Failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-slate-800">
          Admin Portal Login
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-600">Email address</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full px-4 py-2 mt-2 text-base text-slate-800 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="w-full px-4 py-2 mt-2 text-base text-slate-800 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}