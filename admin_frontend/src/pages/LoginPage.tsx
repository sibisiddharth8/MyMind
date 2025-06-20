import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiMail, FiLock, FiArrowLeft, FiKey, FiCheckCircle, FiEye, FiEyeOff, FiBox } from 'react-icons/fi';

import { loginAdmin, forgotAdminPassword, resetAdminPassword } from '../services/authService';
import Button from '../components/ui/Button';
import AuthInput from '../components/ui/AuthInput';
import bg_img from '../assets/login_background.jpg';

// --- Local Type Definitions ---
type AuthMode = 'login' | 'forgot' | 'reset' | 'success';
interface LoginFormData { email: string; password: string; }
interface ForgotFormData { email: string; }
interface ResetFormData { otp: string; password: string; }

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [emailForReset, setEmailForReset] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register: RLogin, handleSubmit: HLogin } = useForm<LoginFormData>();
  const { register: RForgot, handleSubmit: HForgot } = useForm<ForgotFormData>();
  const { register: RReset, handleSubmit: HReset } = useForm<ResetFormData>();

  // --- Mutations and onSubmit handlers ---
  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response) => {
        login(response.token, response.user);
        toast.success(response.message);
        navigate('/');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Login Failed.'),
  });
  
  const forgotMutation = useMutation({
      mutationFn: forgotAdminPassword,
      onSuccess: (_, variables) => {
          toast.success("If an account exists, a reset code has been sent.");
          setEmailForReset(variables.email);
          setMode('reset');
      },
      onError: (error: any) => toast.error(error.response?.data?.message || 'Request failed.'),
  });

  const resetMutation = useMutation({
      mutationFn: (data: { token: string, password: string }) => resetAdminPassword(data),
      onSuccess: () => {
          toast.success("Password reset successfully!");
          setMode('success');
      },
      onError: (error: any) => toast.error(error.response?.data?.message || 'Reset failed.'),
  });
  
  const onLogin: SubmitHandler<LoginFormData> = (data) => loginMutation.mutate(data);
  const onForgot: SubmitHandler<ForgotFormData> = (data) => forgotMutation.mutate(data);
  const onReset: SubmitHandler<ResetFormData> = (data) => resetMutation.mutate({ token: data.otp, password: data.password });

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen w-full flex md:grid md:grid-cols-2">      

      {/* Left Decorative Panel (hidden on mobile) */}
      <div className="hidden md:block relative h-full">
        <img src={bg_img} alt="MyMind Admin Panel Background" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="relative z-10 flex flex-col justify-between h-full p-12 bg-gradient-to-br from-blue-700/80 to-indigo-800/80">
          <div>
            <div className="flex items-center gap-3 text-white">
              <FiBox size={32}/>
              <span className="text-2xl font-bold">MyMind</span>
            </div>
          </div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-white leading-tight"
            >
              Manage Your Digital <br/>Presence with Precision.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-indigo-200 mt-4"
            >
              Your central hub for content administration.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Form Panel (takes full screen on mobile) */}
      <div className="flex items-center justify-center w-full p-6 sm:p-12 bg-slate-50 relative">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
                  <p className="text-slate-500 mt-2">Please sign in to continue.</p>
                </div>
                <form className="space-y-5" onSubmit={HLogin(onLogin)}>
                  <AuthInput id="email" label="Email Address" type="email" icon={<FiMail/>} register={RLogin('email', { required: true })} autoComplete="username"/>
                  <div className="relative">
                    <AuthInput id="password" label="Password" type={showPassword ? "text" : "password"} icon={<FiLock/>} register={RLogin('password', { required: true })} autoComplete="current-password"/>
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-800 z-20 cursor-pointer">
                      {showPassword ? <FiEyeOff/> : <FiEye/>}
                    </button>
                  </div>
                  <div className="text-right text-sm"><button type="button" onClick={() => setMode('forgot')} className="font-medium text-blue-600 hover:underline cursor-pointer">Forgot password?</button></div>
                  <Button type="submit" isLoading={loginMutation.isPending} className="w-full !py-3 !text-base shadow-lg cursor-pointer"><FiLogIn className="mr-2"/>Sign In</Button>
                </form>
              </motion.div>
            )}

            {mode === 'forgot' && (
              <motion.div key="forgot" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Reset Password</h2>
                    <p className="text-slate-500 mt-2">Enter your email to receive a 6-digit reset code.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={HForgot(onForgot)}>
                  <AuthInput id="forgot-email" label="Email Address" type="email" icon={<FiMail/>} register={RForgot('email', { required: true })}/>
                  <Button type="submit" isLoading={forgotMutation.isPending} className="w-full !py-3 !text-base">Send Reset Code</Button>
                  <div className="text-center text-sm"><button type="button" onClick={() => setMode('login')} className="font-medium text-slate-500 hover:text-blue-600 flex items-center mx-auto"><FiArrowLeft className="mr-1 cursor-pointer"/>Back to Login</button></div>
                </form>
              </motion.div>
            )}

            {mode === 'reset' && (
             <motion.div key="reset" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Enter Code</h2>
                    <p className="text-slate-500 mt-2">A 6-digit code was sent to <strong className="text-slate-700">{emailForReset}</strong>.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={HReset(onReset)}>
                    <AuthInput id="otp" label="6-Digit Reset Code" type="text" icon={<FiKey/>} register={RReset('otp', { required: true, minLength: 6, maxLength: 6 })}/>
                    <AuthInput id="new-password" label="New Password" type="password" icon={<FiLock/>} register={RReset('password', { required: true })}/>
                    <Button type="submit" isLoading={resetMutation.isPending} className="w-full !py-3 !text-base">Set New Password</Button>
                </form>
            </motion.div>
            )}
            
            {mode === 'success' && (
                <motion.div key="success" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><FiCheckCircle className="text-emerald-500" size={32}/></div>
                    <h2 className="text-2xl font-bold text-slate-800 mt-6">Password Reset!</h2>
                    <p className="text-slate-500 mt-2">You can now sign in with your new password.</p>
                    <Button onClick={() => setMode('login')} className="w-full mt-8 !py-3 cursor-pointer">Back to Login</Button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 w-full text-center text-sm text-slate-500 p-3 bg-white">
          <p>&copy; {new Date().getFullYear()} Sibi Siddharth S. All rights reserved.</p>
        </div>
      </div>
      
    </div>
  );
}