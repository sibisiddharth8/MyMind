import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

interface PageHeaderProps {
  title: string;
  // New optional prop for a back link
  backLink?: {
    to: string;
    label: string;
  };
  children?: ReactNode;
}

export default function PageHeader({ title, backLink, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {/* If a backLink is provided, render it */}
        {backLink && (
          <Link to={backLink.to} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold mb-2 group">
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1"/> 
            {backLink.label}
          </Link>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h1>
      </div>
      {children && <div className=''>{children}</div>}
    </div>
  );
}