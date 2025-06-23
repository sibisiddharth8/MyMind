import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

// Local Type Definition for a generic timeline item
interface TimelineItemData {
  id: string; logo: string | null; role?: string; companyName?: string; companyLink?: string;
  courseName?: string; institutionName?: string; institutionLink?: string; grade?: string;
  startDate: string; endDate?: string | null; description: string; skills?: string[]; type: 'experience' | 'education';
}
interface TimelineItemProps { item: TimelineItemData; isLast: boolean; }

export default function TimelineItem({ item, isLast }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const isDescriptionLong = item.description && item.description.length > 200;
  const isExperience = item.type === 'experience';

  return (
    <div className="flex gap-4 sm:gap-6">
      {/* The Timeline's Dot and Line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
          {item.logo && <img src={item.logo} alt={isExperience ? item.companyName : item.institutionName} className="w-8 h-8 object-contain"/>}
        </div>
        {!isLast && <div className="w-px h-full bg-slate-200 mt-2"></div>}
      </div>

      {/* The Content */}
      <div className="pb-12 flex-grow min-w-0">
        <p className="text-sm font-semibold text-blue-600">
          {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
        </p>
        
        {isExperience ? (
          <>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1">{item.role}</h3>
            <a href={item.companyLink || '#'} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 mt-1 font-semibold text-slate-600 ${item.companyLink && 'hover:text-blue-600 transition-colors'}`}>
              {item.companyName}
              {item.companyLink && <FiExternalLink size={14} />}
            </a>
          </>
        ) : (
          <>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-1">{item.courseName}</h3>
            <a href={item.institutionLink || '#'} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 mt-1 font-semibold text-slate-600 ${item.institutionLink && 'hover:text-blue-600 transition-colors'}`}>
              {item.institutionName}
              {item.institutionLink && <FiExternalLink size={14} />}
            </a>
          </>
        )}
        
        {item.description && (
          <>
            <p className={`mt-4 text-slate-600 leading-relaxed ${!isExpanded && 'line-clamp-3'}`}>
              {item.description}
            </p>
            {isDescriptionLong && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-semibold text-blue-600 hover:underline mt-2">
                {isExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </>
        )}

        {isExperience && item.skills && item.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
              {item.skills.map((skill: string) => (
                  <span key={skill} className="text-xs bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded-full">{skill}</span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}