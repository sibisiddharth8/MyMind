import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiTrash2, FiLinkedin, FiGithub, FiInstagram, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/modals/ConfirmationModal';
// THE FIX: 'LinksData' is no longer imported from the service
import { getLinksData, updateLinksData, deleteLinksData } from '../services/linksService';

// THE FIX: The type is now defined directly in the page component
interface LinksFormData {
  linkedin?: string;
  github?: string;
  instagram?: string;
  portal?: string;
}

export default function LinksPage() {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // 1. Data Fetching
  const { data: linksDataResponse, isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: getLinksData,
    retry: false,
  });
  const linksData = linksDataResponse?.data;

  // 2. Form Management
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<LinksFormData>({
    defaultValues: { linkedin: '', github: '', instagram: '', portal: '' }
  });

  // 3. Populate form with fetched data
  useEffect(() => {
    if (linksData) {
      reset(linksData);
    }
  }, [linksData, reset]);

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: updateLinksData,
    onSuccess: (newData) => {
      toast.success(newData.message || 'Links updated successfully!');
      queryClient.setQueryData(['links'], newData);
      reset(newData.data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update links.');
    },
  });
  
  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLinksData,
    onSuccess: () => {
      toast.success('Links document deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      reset({ linkedin: '', github: '', instagram: '', portal: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete links.');
    },
  });

  const onSubmit: SubmitHandler<LinksFormData> = (formData) => {
    updateMutation.mutate(formData);
  };
  
  if (isLoading) return <Spinner overlay={true} text="Loading Link Details..." />;

  return (
    <>
      <div className="pb-18">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='flex-shrink-0 sticky top-0 bg-slate-50 z-10 py-2 border-b border-slate-200'>
          <PageHeader title="Social Links" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4"
        >
          <form id="links-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Enter the full URLs for your profiles. The form will save automatically when you click the "Save Changes" button in the action bar below.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-slate-600 mb-1">LinkedIn Profile</label>
                  <FiLinkedin className="absolute top-9 left-3 text-slate-400" />
                  <Controller name="linkedin" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="linkedin" placeholder="https://linkedin.com/in/..." className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                </div>
                
                <div className="relative">
                  <label htmlFor="github" className="block text-sm font-medium text-slate-600 mb-1">GitHub Profile</label>
                  <FiGithub className="absolute top-9 left-3 text-slate-400" />
                  <Controller name="github" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="github" placeholder="https://github.com/..." className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                </div>

                <div className="relative">
                  <label htmlFor="instagram" className="block text-sm font-medium text-slate-600 mb-1">Instagram Profile</label>
                  <FiInstagram className="absolute top-9 left-3 text-slate-400" />
                  <Controller name="instagram" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="instagram" placeholder="https://instagram.com/..." className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                </div>

                <div className="relative">
                  <label htmlFor="portal" className="block text-sm font-medium text-slate-600 mb-1">Personal Portfolio/Website</label>
                  <FiGlobe className="absolute top-9 left-3 text-slate-400" />
                  <Controller name="portal" control={control} render={({ field }) => <input {...field} value={field.value || ''} id="portal" placeholder="https://your-domain.com" className="w-full p-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="fixed bottom-0 left-0 w-full z-10"
      >
        <div className="flex justify-end gap-4 p-3.25 bg-white/80 backdrop-blur-sm border-t border-slate-200">
          <Button
            type="button"
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            disabled={!linksData || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Spinner/> : <FiTrash2 className="mr-2" />}
            Delete All
          </Button>
          <Button 
            type="submit" 
            form="links-form"
            isLoading={updateMutation.isPending} 
            disabled={!isDirty || updateMutation.isPending}
          >
            <FiSave className="mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={() => deleteMutation.mutate()} 
        title="Delete All Links" 
        message="Are you sure you want to delete all links? This action cannot be undone." 
      />
    </>
  );
}