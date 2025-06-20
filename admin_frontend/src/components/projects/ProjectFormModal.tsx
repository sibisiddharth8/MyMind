import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSave, FiPlus, FiTrash2, FiLink, FiTag, FiCalendar, FiFileText } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';

import { createProject, updateProject, getProjectCategories, createProjectCategory } from '../../services/projectService';
import { getAllMembersSimple } from '../../services/memberService';
import Button from '../ui/Button';
import FileUpload from '../ui/FileUpload';
import Spinner from '../ui/Spinner';

// --- Local Type Definitions to avoid import errors ---
interface Project { id: string; name: string; projectImage: string | null; categoryId: string; description: string; tags: string[]; startDate: string; endDate?: string | null; githubLink?: string; liveLink?: string; members: { memberId: string; role: string; member: { id: string; name: string; } }[]; }
interface ProjectFormData { name: string; categoryId: string; description: string; tags: string; startDate: string; endDate: string; githubLink: string; liveLink: string; projectImage?: File | null | 'remove'; members: { memberId: string; role: string }[]; }
interface Category { id: string; name: string; }
interface Member { id: string; name: string; }

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    try { return new Date(dateString).toISOString().split('T')[0]; } 
    catch (error) { return ''; }
};

export default function ProjectFormModal({ isOpen, onClose, projectToEdit }: ProjectFormModalProps) {
    const queryClient = useQueryClient();
    const [newCategoryName, setNewCategoryName] = useState("");
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({ queryKey: ['projectCategories'], queryFn: getProjectCategories });
    const { data: membersResponse, isLoading: isLoadingMembers } = useQuery({ queryKey: ['allMembersSimple'], queryFn: getAllMembersSimple });

    const { control, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm<ProjectFormData>({
        defaultValues: { name: '', categoryId: '', tags: '', members: [], description: '', startDate: '', endDate: 'present', githubLink: '', liveLink: '' }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "members" });
    
    const isCurrentProject = watch('endDate') === 'present';

    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                reset({
                    name: projectToEdit.name,
                    categoryId: projectToEdit.categoryId,
                    tags: projectToEdit.tags.join(', '),
                    description: projectToEdit.description,
                    startDate: formatDateForInput(projectToEdit.startDate),
                    endDate: projectToEdit.endDate ? formatDateForInput(projectToEdit.endDate) : 'present',
                    githubLink: projectToEdit.githubLink || '',
                    liveLink: projectToEdit.liveLink || '',
                    members: projectToEdit.members.map(pm => ({ memberId: pm.member.id, role: pm.role })),
                    projectImage: null
                });
            } else {
                reset({ name: '', categoryId: '', tags: '', members: [], description: '', startDate: '', endDate: 'present', githubLink: '', liveLink: '', projectImage: null });
            }
        }
    }, [projectToEdit, isOpen, reset]);

    const mutation = useMutation({
        mutationFn: (data: { formData: FormData, id?: string }) => data.id ? updateProject({ id: data.id, formData: data.formData }) : createProject(data.formData),
        onSuccess: (res) => { toast.success(res.message); queryClient.invalidateQueries({ queryKey: ['projects'] }); onClose(); },
        onError: (err: any) => toast.error(err.response?.data?.message || "An error occurred."),
    });

    const categoryMutation = useMutation({
        mutationFn: createProjectCategory,
        onSuccess: (newCategoryResponse) => {
            toast.success(newCategoryResponse.message);
            queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
            setValue('categoryId', newCategoryResponse.data.id, { shouldDirty: true });
            setNewCategoryName('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create category."),
    });

    const handleCreateCategory = () => { if (newCategoryName.trim()) categoryMutation.mutate(newCategoryName.trim()); };

    const onSubmit: SubmitHandler<ProjectFormData> = (data) => {
        const formData = new FormData();
        (Object.keys(data) as (keyof ProjectFormData)[]).forEach(key => {
            const value = data[key];
            if (key === 'projectImage' && value instanceof File) formData.append(key, value);
            else if (key === 'projectImage' && value === 'remove') formData.append('removeProjectImage', 'true');
            else if (key === 'members' && Array.isArray(value)) formData.append(key, JSON.stringify(value));
            else if (value !== null && value !== undefined) formData.append(key, value as string);
        });
        mutation.mutate({ formData, id: projectToEdit?.id });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-3xl transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 flex justify-between items-center p-5 border-b border-slate-300 flex-shrink-0">
                                {projectToEdit ? 'Edit Project' : 'Add New Project'}
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><FiX /></button>
                            </Dialog.Title>
                            
                            <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-grow">
                                <div className="space-y-6">
                                    <fieldset>
                                        <legend className="text-base font-semibold text-slate-700 mb-4">Core Details</legend>
                                        <div className="space-y-4">
                                            <Controller name="name" control={control} rules={{required: true}} render={({field}) => <div className="relative"><FiFileText className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Project Name" className="w-full p-2 pl-10 border border-slate-300 rounded-lg"/></div>} />
                                            <div>
                                                <label className="text-sm font-medium text-slate-600">Category</label>
                                                <div className="mt-1">
                                                    <Controller name="categoryId" control={control} rules={{required: true}} render={({field}) => (
                                                        <select {...field} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                                                            <option value="">Select Category</option>
                                                            {isLoadingCategories ? <option>Loading...</option> : categoriesResponse?.data?.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                        </select>
                                                    )} />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                                                <p className="text-xs font-medium text-slate-500">Or, create a new category</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name..." className="w-full p-2 border border-slate-300 rounded-lg"/>
                                                    <Button type="button" onClick={handleCreateCategory} disabled={!newCategoryName.trim() || categoryMutation.isPending} isLoading={categoryMutation.isPending}>Create</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    
                                    <fieldset className="space-y-4 pt-4 border-t">
                                        <legend className="text-base font-semibold text-slate-700 pr-2">Duration & Links</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Controller name="startDate" control={control} rules={{required: true}} render={({field}) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400"/><input {...field} type="date" title="Start Date" className="border-slate-300 w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>} />
                                            <div className={`${isCurrentProject && 'opacity-40'}`}><Controller name="endDate" control={control} render={({field}) => <div className="relative"><FiCalendar className="absolute top-3 left-3 text-slate-400" /><input {...field} type="date" disabled={isCurrentProject} title="End Date" className="w-full p-2 pl-10 border rounded-lg text-slate-500"/></div>}/></div>
                                        </div>
                                        <div className="flex items-center gap-2"><input id="currentProject" type="checkbox" checked={isCurrentProject} onChange={(e) => setValue('endDate', e.target.checked ? 'present' : formatDateForInput(new Date().toISOString()), { shouldDirty: true })} className="h-4 w-4 rounded"/><label htmlFor="currentProject">I am currently working on this</label></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Controller name="githubLink" control={control} render={({field}) => <div className="relative"><FaGithub className="absolute top-3 left-3 text-slate-400" /><input {...field} value={field.value || ''} placeholder="GitHub Link" className="w-full p-2 pl-10 border rounded-lg border-slate-300"/></div>} />
                                            <Controller name="liveLink" control={control} render={({field}) => <div className="relative"><FiLink className="absolute top-3 left-3 text-slate-400" /><input {...field} value={field.value || ''} placeholder="Live Project Link" className="w-full p-2 pl-10 border rounded-lg border-slate-300"/></div>} />
                                        </div>
                                    </fieldset>

                                    <fieldset className="space-y-4 pt-4 border-t">
                                        <legend className="text-base font-semibold text-slate-700 pr-2">Project Assets</legend>
                                        <Controller name="description" control={control} render={({field}) => <textarea {...field} rows={4} placeholder="Project description..." className="w-full p-2 border border-slate-300 rounded-lg"/>}/>
                                        <Controller name="tags" control={control} render={({field}) => <div className="relative"><FiTag className="absolute top-3 left-3 text-slate-400" /><input {...field} placeholder="Tags (comma-separated, max 5)" className="w-full p-2 pl-10 border border-slate-300 rounded-lg"/></div>} />
                                        <Controller name="projectImage" control={control} rules={{required: !projectToEdit}} render={({field: { onChange }}) => (<FileUpload label="Project Image" accept="image/*" fileType="image" existingFileUrl={projectToEdit?.projectImage ? `${assetBaseUrl}/${projectToEdit.projectImage}` : null} onFileChange={onChange} onRemove={() => onChange('remove')} />)} />
                                    </fieldset>
                                    
                                    <fieldset className="p-4 border border-slate-300 rounded-lg bg-slate-50">
                                        <legend className="text-base font-semibold text-slate-700 px-2">Team Members</legend>
                                        <div className="space-y-2 mt-2">
                                            {fields.map((field, index) => (<div key={field.id} className="flex items-center gap-2"><Controller name={`members.${index}.memberId`} control={control} rules={{required: true}} render={({field}) => (<select {...field} className="w-1/2 p-2 border border-slate-300 rounded-lg bg-white"><option value="">Select Member</option>{isLoadingMembers ? <option>Loading...</option> : membersResponse?.data?.map((mem: Member) => <option key={mem.id} value={mem.id}>{mem.name}</option>)}</select>)}/><Controller name={`members.${index}.role`} control={control} rules={{required: true}} render={({field}) => <input {...field} placeholder="Role in project" className="w-1/2 p-2 border border-slate-300 rounded-lg"/>}/><Button type="button" variant="danger" onClick={() => remove(index)} className="!p-2.5"><FiTrash2/></Button></div>))}
                                        </div>
                                        <Button type="button" variant="secondary" onClick={() => append({ memberId: '', role: '' })} className="mt-3 text-sm"><FiPlus className="mr-2"/> Add Team Member</Button>
                                    </fieldset>
                                </div>
                            </form>
                            
                            <div className="flex-shrink-0 p-4 flex justify-end gap-4 border-t border-slate-300 bg-slate-50 rounded-b-2xl">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button form="project-form" type="submit" isLoading={mutation.isPending} disabled={!isDirty && !control._formValues.projectImage && !control._formValues.members?.some(m => (m as any).isDirty)}>
                                    <FiSave className="mr-2"/>
                                    {projectToEdit ? 'Save Changes' : 'Create Project'}
                                </Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}