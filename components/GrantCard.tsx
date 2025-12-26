
import React from 'react';
import { Grant } from '../types';

interface GrantCardProps {
  grant: Grant;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{grant.title}</h3>
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{grant.donor}</p>
        </div>
        {grant.amount && (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-100">
            {grant.amount}
          </span>
        )}
      </div>
      
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
        {grant.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {grant.sectors.map((sector) => (
          <span key={sector} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
            {sector}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
        <div className="flex items-center text-slate-500 text-xs">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Deadline: {grant.deadline}
        </div>
        <a 
          href={grant.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center"
        >
          View details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default GrantCard;
