interface PageHeaderProps {
  title: string;
  children?: React.ReactNode; // For action buttons like "Add New"
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <h1 className="text-3xl font-bold text-slate-800 pb-4">
        {title}
      </h1>
      <div className="">
        {children}
      </div>
    </div>
  );
}