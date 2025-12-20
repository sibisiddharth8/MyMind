import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiCheckCircle } from 'react-icons/fi';
import { changePublicPassword } from '../../services/publicUserService';
import Button from '../ui/Button';
import SettingsInput from './SettingsInput';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettings() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>();

  const mutation = useMutation({
    mutationFn: changePublicPassword,
    onSuccess: () => {
      toast.success('Password changed successfully! 🔒');
      reset();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const onSubmit = (data: PasswordFormData) => {
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const newPassword = watch('newPassword');

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiShield className="text-blue-600 flex-shrink-0" />
          <span>Security Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Keep your account secure by using a strong password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Security Notice */}
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs sm:text-sm text-amber-800">
            <span className="font-semibold flex items-center gap-2 mb-1">
              <FiLock className="flex-shrink-0" /> <span>Password Requirements:</span>
            </span>
            <ul className="list-disc list-inside space-y-1 ml-6 text-xs">
              <li>Minimum 6 characters long</li>
              <li>Include uppercase and lowercase letters (recommended)</li>
              <li>Include numbers and special characters (recommended)</li>
            </ul>
          </p>
        </div>

        {/* Current Password */}
        <SettingsInput
          label="Current Password"
          type="password"
          placeholder="Enter your current password"
          register={register('currentPassword', {
            required: 'Current password is required',
          })}
          error={errors.currentPassword?.message}
        />

        {/* New Password */}
        <div>
          <SettingsInput
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            register={register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            error={errors.newPassword?.message}
          />
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">
                  Password Strength:
                </span>
                <span className={`text-xs font-semibold ${
                  passwordStrength.strength <= 2 ? 'text-red-600' : 
                  passwordStrength.strength <= 3 ? 'text-yellow-600' :
                  passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${passwordStrength.color} rounded-full`}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <SettingsInput
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter your new password"
          register={register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val: string) =>
              val === watch('newPassword') || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        {/* Success Message */}
        {watch('newPassword') &&
          watch('confirmPassword') &&
          watch('newPassword') === watch('confirmPassword') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <FiCheckCircle />
              <span>Passwords match!</span>
            </motion.div>
          )}

        {/* Action Buttons */}
        <div className="flex justify-end border-t pt-4 gap-4 border-slate-200">
            <button
            type="button"
            onClick={() => reset()}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Clear Form
          </button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            className="flex items-center justify-center sm:justify-start gap-2 sm:flex-none"
          >
            <FiLock className="text-lg" />
            <span className="hidden sm:inline">Update Password</span>
            <span className="sm:hidden">Update</span>
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
