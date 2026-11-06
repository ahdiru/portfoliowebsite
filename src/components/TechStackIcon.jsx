import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { normalizeIconPath } from '../utils/techStackData';

const TechStackIcon = ({ TechStackIcon: rawIcon, Language }) => {
  const [imgError, setImgError] = useState(false);
  const iconSrc = normalizeIconPath(rawIcon);

  return (
    <div className="group p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8CFBE] hover:border-[#7F8C6A] hover:bg-[#EDE7DA]/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-3 hover:-translate-y-1 cursor-pointer shadow-xs hover:shadow-md h-full">
      <div className="relative h-14 w-14 md:h-16 md:w-16 flex items-center justify-center">
        {!imgError && iconSrc ? (
          <img 
            src={iconSrc} 
            alt={`${Language} icon`} 
            className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center text-[#1E3B2F]">
            <Code2 className="w-6 h-6 text-[#7F8C6A]" />
          </div>
        )}
      </div>
      <span className="text-[#1E3B2F] font-mono font-medium text-xs md:text-sm tracking-wide text-center">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;
