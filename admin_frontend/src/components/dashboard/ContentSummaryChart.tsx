import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Update the interface to mark props as potentially optional
interface ContentSummaryChartProps {
  skillSummary?: { name: string, skillCount: number }[];
  projectSummary?: { name: string, projectCount: number }[];
}

// THIS IS THE FIX: We provide default empty arrays for the props
export default function ContentSummaryChart({ skillSummary = [], projectSummary = [] }: ContentSummaryChartProps) {
  
  // Now, even if undefined is passed, skillSummary and projectSummary will be []
  const categoryNames = [...new Set([...skillSummary.map(s => s.name), ...projectSummary.map(p => p.name)])];
  
  const data = categoryNames.map(name => ({
    name,
    skills: skillSummary.find(s => s.name === name)?.skillCount || 0,
    projects: projectSummary.find(p => p.name === name)?.projectCount || 0,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-96">
        <h3 className="font-semibold text-slate-800 mb-4">Content Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-lg !shadow-lg" cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
                <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
                <Bar dataKey="projects" fill="#2563EB" name="Projects" radius={[4, 4, 0, 0]}/>
                <Bar dataKey="skills" fill="#93C5FD" name="Skills" radius={[4, 4, 0, 0]}/>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}