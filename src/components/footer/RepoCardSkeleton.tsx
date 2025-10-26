import React from 'react';

const SkeletonBar = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);


export default function RepoCardSkeleton() {
    return (
        <div className="block bg-white p-4 rounded-lg border border-slate-200 h-full">
            <div className="flex items-center gap-2 mb-3">
                <SkeletonBar className="h-4 w-4" />
                <SkeletonBar className="h-4 w-1/2" />
            </div>

            <div className="space-y-2 mb-3 h-10"> 
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-3/4" />
            </div>
            
            <div className="flex items-center gap-4 text-xs mt-auto">
                <SkeletonBar className="h-4 w-8" />
                <SkeletonBar className="h-4 w-8" />
                <SkeletonBar className="h-4 w-12" />
            </div>
        </div>
    );
}