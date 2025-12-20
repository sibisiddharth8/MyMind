import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCamera, FiSave, FiMail, FiUser as FiUserIcon } from 'react-icons/fi';
import { updatePublicProfile } from '../../services/publicUserService';
import Button from '../ui/Button';
import UserAvatar from '../ui/UserAvatar';
import SettingsInput from './SettingsInput';

interface ProfileSettingsProps {
  user: any;
  refreshUser: (user: any) => void;
}

export default function ProfileSettings({ user, refreshUser }: ProfileSettingsProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: updatePublicProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully! 🎉');
      if (data?.user) {
        // Ensure profileImage has the full URL
        const updatedUser = {
          ...data.user,
          profileImage: data.user.profileImage?.startsWith('http') 
            ? data.user.profileImage 
            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${data.user.profileImage}`
        };
        refreshUser(updatedUser);
      }
      setPreview(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (fileInputRef.current?.files?.[0]) {
      formData.append('profileImage', fileInputRef.current.files[0]);
    }
    mutation.mutate(formData);
  };

  const handleCancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-slate-200 pb-5 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-sm text-slate-600 mt-1">
          Manage your public profile information and avatar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-100 transition-all duration-300 group-hover:ring-blue-300">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <UserAvatar
                  src={user?.profileImage ? `${user.profileImage}?t=${Date.now()}` : user?.profileImage}
                  alt={user?.name}
                  size="xl"
                  className="w-full h-full text-4xl"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <FiCamera className="text-white text-2xl" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-slate-900 text-base sm:text-lg flex items-center justify-center sm:justify-start gap-2">
              <FiUserIcon className="text-blue-600" />
              <span>Profile Photo</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-3">
              Click avatar to upload. 400x400px recommended
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 bg-white rounded border border-slate-200">JPG</span>
              <span className="px-2 py-1 bg-white rounded border border-slate-200">PNG</span>
              <span className="px-2 py-1 bg-white rounded border border-slate-200">GIF</span>
              <span className="px-2 py-1 bg-white rounded border border-slate-200">Max 5MB</span>
            </div>
            {preview && (
              <button
                type="button"
                onClick={handleCancelPreview}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cancel Preview
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <SettingsInput
            label="Display Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiMail className="text-slate-400" />
              </div>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed for security reasons
            </p>
          </div>

          {user?.googleId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ℹ️ Google Account:</span> You're signed in with Google. 
                Your profile is managed by Google services.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end border-t pt-4 gap-4 border-slate-200">
            <button
            type="button"
            onClick={() => {
              setName(user?.name || '');
              handleCancelPreview();
            }}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            className="flex items-center justify-center sm:justify-start gap-2  sm:flex-none"
          >
            <FiSave className="text-lg" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
