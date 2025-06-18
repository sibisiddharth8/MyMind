import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface Skill {
    id: string;
    name: string;
    image: string;
}

interface SkillCardProps {
    skill: Skill;
    onEdit: () => void;
    onDelete: () => void;
}

export default function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
    const assetBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    return (
        <div className="relative group bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
            <img src={`${assetBaseUrl}/${skill.image}`} alt={skill.name} className="w-12 h-12 object-contain mb-2"/>
            <p className="text-sm font-semibold text-slate-700">{skill.name}</p>
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-1.5 bg-white rounded-full shadow-md hover:bg-slate-100"><FiEdit2 size={12}/></button>
                <button onClick={onDelete} className="p-1.5 bg-white rounded-full shadow-md hover:bg-slate-100"><FiTrash2 size={12} className="text-red-500"/></button>
            </div>
        </div>
    );
}