import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiTrash2, FiUser, FiAward, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import FileUpload from '../components/ui/FileUpload';
import { getAboutData, updateAboutData, deleteAboutData } from '../services/aboutService';

interface AboutFormData {
  name: string;
  roles: string;
  description: string;
  image: File | null | 'remove'; // Now supports a 'remove' state
  cv: File | null | 'remove';
}

export default function AboutPage() {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: aboutDataResponse, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: getAboutData,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  const aboutData = aboutDataResponse?.data;
  const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<AboutFormData>({
    defaultValues: { name: '', roles: '', description: '', image: null, cv: null }
  });

  useEffect(() => {
    if (aboutData) {
      reset({
        name: aboutData.name,
        roles: aboutData.roles.join(', '),
        description: aboutData.description,
        image: null, // Reset file inputs
        cv: null
      });
    }
  }, [aboutData, reset]);

  const updateMutation = useMutation({
    mutationFn: updateAboutData,
    onSuccess: (newData) => {
      toast.success(newData.message || 'Updated successfully!');
      queryClient.setQueryData(['about'], newData);
      queryClient.invalidateQueries({ queryKey: ['about-profile'] });
      reset({
        name: newData.data.name,
        roles: newData.data.roles.join(', '),
        description: newData.data.description,
        image: null,
        cv: null
      });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update.'),
  });
  
  const deleteMutation = useMutation({ /* ... same as before ... */ });

  const onSubmit: SubmitHandler<AboutFormData> = (formData) => {
    const dataToSubmit = new FormData();
    dataToSubmit.append('name', formData.name);
    dataToSubmit.append('roles', formData.roles);
    dataToSubmit.append('description', formData.description);

    // Handle new file uploads
    if (formData.image instanceof File) dataToSubmit.append('image', formData.image);
    if (formData.cv instanceof File) dataToSubmit.append('cv', formData.cv);

    // Handle individual file removal
    if (formData.image === 'remove') dataToSubmit.append('removeImage', 'true');
    if (formData.cv === 'remove') dataToSubmit.append('removeCv', 'true');

    updateMutation.mutate(dataToSubmit);
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /> <span className="ml-4 text-slate-500">Loading...</span></div>;

  return (
    <>
      {/* Add padding-bottom to the main content wrapper to make space for the fixed footer */}
      <div className="pb-18">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader title="About Section" />
        </motion.div>
        
        <motion.form 
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className=""
        >
          {/* NEW LAYOUT: Assets are now first */}
          <fieldset className="mb-8">
            <legend className="text-xl font-semibold text-slate-800 pb-4">Your Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Profile Image"
                    accept="image/*"
                    fileType="image"
                    existingFileUrl={aboutData?.image ? `${assetBaseUrl}/${aboutData.image}` : null}
                    onFileChange={(file) => field.onChange(file)}
                    onRemove={() => field.onChange('remove')} // Set value to 'remove' to signal deletion
                  />
                )}
              />
              <Controller
                name="cv"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="CV / Resume"
                    accept=".pdf"
                    fileType="pdf"
                    existingFileUrl={aboutData?.cv ? `${assetBaseUrl}/${aboutData.cv}` : null}
                    onFileChange={(file) => field.onChange(file)}
                    onRemove={() => field.onChange('remove')} // Set value to 'remove' to signal deletion
                  />
                )}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-6 border-t border-slate-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                <FiUser className="absolute top-9 left-3 text-slate-400" />
                <Controller name="name" control={control} render={({ field }) => <input {...field} id="name" className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
              </div>
              <div className="relative">
                <label htmlFor="roles" className="block text-sm font-medium text-slate-600 mb-1">Roles</label>
                <FiAward className="absolute top-9 left-3 text-slate-400" />
                <Controller name="roles" control={control} render={({ field }) => <input {...field} id="roles" className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Developer, Designer" />} />
                <p className="text-xs text-slate-400 mt-1">Separate roles with a comma.</p>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
              <Controller name="description" control={control} render={({ field }) => <textarea {...field} id="description" rows={6} className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
            </div>
          </fieldset>
        </motion.form>
      </div>

      {/* --- NEW FIXED ACTION FOOTER --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 md:left-0 right-0 p-3.25 bg-white/80 backdrop-blur-sm border-t border-slate-200"
      >
        <div className="min-w-full flex justify-end gap-4">
          <Button
            type="button"
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            disabled={!aboutData || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Spinner/> : <FiTrash2 className="mr-2" />}
            Delete All
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit(onSubmit)} // Manually trigger submit from outside the form
            isLoading={updateMutation.isPending} 
            disabled={!isDirty || updateMutation.isPending}
          >
            <FiSave className="mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={() => deleteMutation.mutate()} title="Delete About Section Data" message="Are you sure? This will permanently delete your bio, roles, image, and CV. This action cannot be undone." />
    </>
  );
}