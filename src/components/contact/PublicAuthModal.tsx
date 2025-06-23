import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { usePublicAuth } from '../../context/PublicAuthContext';
import { initiateRegistration, verifyUser, loginPublicUser, forgotPublicUserPassword, resetPublicUserPassword } from '../../services/publicUserService';
import AuthInput from '../ui/AuthInput';
import Button from '../ui/Button';
import { FiX, FiMail, FiLock, FiUser, FiKey, FiCheckCircle, FiLogIn, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

// --- Local Type Definitions ---
type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset' | 'success';
interface LoginFormData { email: string; password: string; rememberMe: boolean; }
interface RegisterFormData { name: string; email: string; password: string; }
interface VerifyFormData { otp: string; }
interface ForgotFormData { email: string; }
interface ResetFormData { otp: string; password: string; }

interface PublicAuthModalProps { isOpen: boolean; onClose: () => void; }

export default function PublicAuthModal({ isOpen, onClose }: PublicAuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [authData, setAuthData] = useState({ email: '', name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { login } = usePublicAuth();

    const { register: RLogin, handleSubmit: HLogin } = useForm<LoginFormData>({defaultValues: { rememberMe: true }});
    const { register: RRegister, handleSubmit: HRegister, reset: resetRegister } = useForm<RegisterFormData>();
    const { register: RVerify, handleSubmit: HVerify, reset: resetVerify } = useForm<VerifyFormData>();
    const { register: RForgot, handleSubmit: HForgot, reset: resetForgot } = useForm<ForgotFormData>();
    const { register: RReset, handleSubmit: HReset, reset: resetReset } = useForm<ResetFormData>();

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setMode('login');
                setShowPassword(false);
                resetRegister(); resetVerify(); resetForgot(); resetReset();
            }, 300);
        }
    }, [isOpen, resetRegister, resetVerify, resetForgot, resetReset]);

    const loginMutation = useMutation({ mutationFn: loginPublicUser, onSuccess: (res, vars) => { login(res.token, res.user, vars.rememberMe); toast.success("Welcome!"); onClose(); }, onError: (err: any) => toast.error(err.response?.data?.message || 'Login failed.'),});
    const registerMutation = useMutation({ mutationFn: initiateRegistration, onSuccess: (_, vars) => { toast.success("Verification code sent to your email."); setAuthData({ email: vars.email, name: vars.name }); setMode('verify'); }, onError: (err: any) => toast.error(err.response?.data?.message || 'Registration failed.'),});
    const verifyMutation = useMutation({ mutationFn: verifyUser, onSuccess: () => { toast.success("Email verified! Please log in."); setMode('login'); }, onError: (err: any) => toast.error(err.response?.data?.message || 'Verification failed.'),});
    const forgotMutation = useMutation({ mutationFn: forgotPublicUserPassword, onSuccess: (_, vars) => { toast.success("If an account exists, a reset code has been sent."); setAuthData(prev => ({ ...prev, email: vars.email })); setMode('reset'); }, onError: (err: any) => toast.error(err.response?.data?.message || 'Request failed.'),});
    const resetMutation = useMutation({ mutationFn: resetPublicUserPassword, onSuccess: () => { toast.success("Password reset!"); setMode('success'); }, onError: (err: any) => toast.error(err.response?.data?.message || 'Reset failed.'),});
    
    const onLogin: SubmitHandler<LoginFormData> = data => loginMutation.mutate(data);
    const onRegister: SubmitHandler<RegisterFormData> = data => registerMutation.mutate(data);
    const onVerify: SubmitHandler<VerifyFormData> = data => verifyMutation.mutate({ email: authData.email, otp: data.otp });
    const onForgot: SubmitHandler<ForgotFormData> = data => forgotMutation.mutate(data);
    const onReset: SubmitHandler<ResetFormData> = data => resetMutation.mutate({ token: data.otp, password: data.password });

    const formVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }};

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                            <button onClick={onClose} className="cursor-pointer absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 transition-colors"><FiX size={20}/></button>
                            <AnimatePresence mode="wait">
                                {mode === 'login' && (
                                    <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <h3 className="text-2xl font-bold text-center text-slate-800">Welcome Back</h3>
                                        <p className="text-center text-slate-500 mt-2 text-sm">Please sign in to send a message.</p>
                                        <form className="mt-8 space-y-4" onSubmit={HLogin(onLogin)}>
                                            <AuthInput id="email" label="Email Address" type="email" icon={<FiMail/>} register={RLogin('email', { required: true })} />
                                            <div className="relative"><AuthInput id="password" label="Password" type={showPassword ? "text" : "password"} icon={<FiLock/>} register={RLogin('password', { required: true })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-800 z-20">{showPassword ? <FiEyeOff/> : <FiEye/>}</button></div>
                                            <div className="flex items-center justify-between text-sm"><div className="flex items-center"><input id="remember-me" {...RLogin('rememberMe')} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="remember-me" className="ml-2 text-slate-600">Remember me</label></div><button type="button" onClick={() => setMode('forgot')} className="font-medium text-blue-600 hover:underline cursor-pointer">Forgot password?</button></div>
                                            <Button type="submit" isLoading={loginMutation.isPending} className="w-full !py-2.5 !text-base">Sign In</Button>
                                            <p className="text-center text-sm text-slate-500">Need an account? <button type="button" onClick={() => setMode('register')} className="font-semibold text-blue-600 hover:underline cursor-pointer">Register Here</button></p>
                                        </form>
                                    </motion.div>
                                )}
                                {mode === 'register' && (
                                    <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <h3 className="text-2xl font-bold text-center text-slate-800">Create Account</h3>
                                        <p className="text-center text-slate-500 mt-2 text-sm">Create an account to get in touch.</p>
                                        <form className="mt-8 space-y-4" onSubmit={HRegister(onRegister)}>
                                            <AuthInput id="reg-name" label="Full Name" type="text" icon={<FiUser/>} register={RRegister('name', { required: true })} />
                                            <AuthInput id="reg-email" label="Email Address" type="email" icon={<FiMail/>} register={RRegister('email', { required: true })} />
                                            <AuthInput id="reg-password" label="Password" type="password" icon={<FiLock/>} register={RRegister('password', { required: true })} />
                                            <Button type="submit" isLoading={registerMutation.isPending} className="w-full !py-2.5 !text-base cursor-pointer">Create Account</Button>
                                            <p className="text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={() => setMode('login')} className="cursor-pointer font-semibold text-blue-600 hover:underline">Login</button></p>
                                        </form>
                                    </motion.div>
                                )}
                                {mode === 'verify' && (
                                    <motion.div key="verify" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <h3 className="text-2xl font-bold text-center text-slate-800">Verify Your Email</h3>
                                        <p className="text-center text-slate-500 mt-2 text-sm">Enter the 6-digit code sent to <strong className="text-slate-700">{authData.email}</strong>.</p>
                                        <form className="mt-8 space-y-6" onSubmit={HVerify(onVerify)}>
                                            <AuthInput id="otp-verify" label="6-Digit Code" type="text" icon={<FiKey/>} register={RVerify('otp', { required: true, minLength: 6, maxLength: 6 })}/>
                                            <Button type="submit" isLoading={verifyMutation.isPending} className="w-full !py-2.5 !text-base">Verify Account</Button>
                                        </form>
                                    </motion.div>
                                )}
                                {mode === 'forgot' && (
                                    <motion.div key="forgot" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <h3 className="text-2xl font-bold text-center text-slate-800">Reset Password</h3>
                                        <p className="text-slate-500 mt-2 text-center text-sm">Enter your email to receive a reset code.</p>
                                        <form className="mt-8 space-y-6" onSubmit={HForgot(onForgot)}>
                                            <AuthInput id="forgot-email" label="Email Address" type="email" icon={<FiMail/>} register={RForgot('email', { required: true })}/>
                                            <Button type="submit" isLoading={forgotMutation.isPending} className="w-full !py-2.5 !text-base">Send Reset Code</Button>
                                            <div className="text-center text-sm"><button type="button" onClick={() => setMode('login')} className="font-medium text-slate-500 hover:text-blue-600 flex items-center mx-auto cursor-pointer"><FiArrowLeft className="mr-1"/>Back to Login</button></div>
                                        </form>
                                    </motion.div>
                                )}
                                {mode === 'reset' && (
                                    <motion.div key="reset" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                        <h3 className="text-2xl font-bold text-center text-slate-800">Set New Password</h3>
                                        <p className="text-slate-500 mt-2 text-center text-sm">A code was sent to <strong className="text-slate-700">{emailForReset || authData.email}</strong>.</p>
                                        <form className="mt-8 space-y-6" onSubmit={HReset(onReset)}>
                                            <AuthInput id="otp" label="6-Digit Reset Code" type="text" icon={<FiKey/>} register={RReset('otp', { required: true, minLength: 6, maxLength: 6 })}/>
                                            <AuthInput id="new-password" label="New Password" type="password" icon={<FiLock/>} register={RReset('password', { required: true })}/>
                                            <Button type="submit" isLoading={resetMutation.isPending} className="w-full !py-2.5 !text-base">Set New Password</Button>
                                        </form>
                                    </motion.div>
                                )}
                                {mode === 'success' && (
                                    <motion.div key="success" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><FiCheckCircle className="text-emerald-500" size={32}/></div>
                                        <h2 className="text-2xl font-bold text-slate-800 mt-6">Success!</h2>
                                        <p className="text-slate-500 mt-2">Your password has been reset. You can now log in.</p>
                                        <Button onClick={() => setMode('login')} className="w-full mt-8 !py-2.5">Back to Login</Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}