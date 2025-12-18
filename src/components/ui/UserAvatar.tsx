import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function UserAvatar({ src, alt, size = 'md', className = '' }: UserAvatarProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Size mappings
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-xl'
    };

    return (
        <div 
            className={`
                relative rounded-full overflow-hidden shrink-0 
                bg-slate-200 flex items-center justify-center 
                border border-slate-100 shadow-sm
                ${sizeClasses[size]} 
                ${className}
            `}
        >
            {src && !hasError ? (
                <>
                    {/* The Image: Hidden until loaded to prevent alt-text flash */}
                    <img 
                        src={src} 
                        alt={alt || "User"} 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        referrerPolicy="no-referrer"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    
                    {/* Fallback Skeleton: Shown while loading */}
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">
                             <FiUser />
                        </div>
                    )}
                </>
            ) : (
                <span className="font-bold text-slate-500 uppercase">
                    {alt ? alt.charAt(0) : <FiUser />}
                </span>
            )}
        </div>
    );
}