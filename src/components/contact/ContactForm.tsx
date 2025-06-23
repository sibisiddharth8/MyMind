import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePublicAuth } from '../../context/PublicAuthContext';
import { sendMessage } from '../../services/contactService';
import Button from '../ui/Button';

interface ContactFormData { subject: string; message: string; }

export default function ContactForm() {
    const queryClient = useQueryClient();
    const { user, token } = usePublicAuth(); // Now correctly gets the token
    const { control, handleSubmit, reset } = useForm<ContactFormData>({
        // FIX: Provide default values to prevent the console warning
        defaultValues: { subject: '', message: '' }
    });

    const mutation = useMutation({
        // FIX: The mutation now correctly passes the valid token from the context
        mutationFn: (data: ContactFormData) => {
            if (!token) throw new Error("User not authenticated.");
            return sendMessage(data, token);
        },
        onSuccess: () => {
            toast.success("Your message has been sent successfully!");
            reset();
        },
        onError: () => toast.error("Failed to send message. Please try again."),
    });

    const onSubmit: SubmitHandler<ContactFormData> = data => mutation.mutate(data);

    return (
        <div className="text-center">
            <p className="text-slate-600">Welcome, <span className="font-semibold text-slate-800">{user?.name}</span>!</p>
            <p className="text-slate-500 text-sm mt-1">Please fill out the form below to get in touch.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 max-w-lg mx-auto">
                <Controller name="subject" control={control} rules={{required: true}} render={({field}) => <input {...field} placeholder="Subject" className="w-full p-3 border border-slate-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                <Controller name="message" control={control} rules={{required: true}} render={({field}) => <textarea {...field} placeholder="Your message..." rows={5} className="w-full p-3 border border-slate-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />} />
                <Button type="submit" isLoading={mutation.isPending} className="w-full !py-3">Send Message</Button>
            </form>
        </div>
    );
}