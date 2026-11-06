import React, { useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDirectChannels, CHANNEL_ICON_MAP } from "../utils/directChannelsData";

const SocialLinks = () => {
  const channels = useDirectChannels();
  const activeChannels = (channels || []).filter((ch) => ch.isEnabled !== false);
  const primaryChannel = activeChannels.find((link) => link.isPrimary) || activeChannels[0];
  const otherLinks = activeChannels.filter((link) => link !== primaryChannel);

  useEffect(() => {
    AOS.init({ offset: 10 });
  }, []);

  if (!activeChannels || activeChannels.length === 0) {
    return null;
  }

  const PrimaryIcon = (primaryChannel && CHANNEL_ICON_MAP[primaryChannel.icon]) || Globe;

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 py-8 shadow-xs">
      <h3
        className="text-lg font-bold text-[#1E3B2F] mb-6 flex items-center gap-2 font-mono"
        data-aos="fade-down" 
      >
        <span className="inline-block w-2 h-2 bg-[#7F8C6A] rounded-full"></span>
        Direct Channels
      </h3>

      <div className="flex flex-col gap-4">
        {/* Primary Row */}
        {primaryChannel && (
          <a
            href={primaryChannel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 rounded-xl 
                       bg-[#F5F0E6] border border-[#D8CFBE]
                       hover:border-[#7F8C6A] hover:bg-[#EDE7DA] transition-all duration-200 shadow-2xs"
            data-aos="fade-up"
            data-aos-delay="100" 
          >
            <div className="relative flex items-center gap-4 min-w-0">
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] group-hover:scale-105 transition-transform shrink-0">
                <PrimaryIcon className="w-5 h-5 text-[#1E3B2F]" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#1E3B2F] truncate">
                    {primaryChannel.displayName || primaryChannel.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-[#1E3B2F] text-[#F5F0E6] px-2 py-0.5 rounded-full font-semibold">
                    Primary
                  </span>
                </div>
                <span className="text-xs text-[#5A6650] font-mono truncate">
                  {primaryChannel.subText || primaryChannel.url}
                </span>
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-[#7F8C6A] group-hover:text-[#1E3B2F] transition-colors shrink-0 ml-3" />
          </a>
        )}

        {/* Other Links Grid */}
        {otherLinks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherLinks.map((link, index) => {
              const IconComponent = CHANNEL_ICON_MAP[link.icon] || Globe;
              return (
                <a
                  key={link.id || link.name || index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3.5 rounded-xl 
                             bg-[#F5F0E6] border border-[#D8CFBE]
                             hover:border-[#7F8C6A] hover:bg-[#EDE7DA] transition-all duration-200 shadow-2xs"
                  data-aos="fade-up" 
                  data-aos-delay={150 + index * 50} 
                >
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] shrink-0">
                    <IconComponent className="w-4 h-4 text-[#1E3B2F]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#1E3B2F] truncate">
                      {link.displayName || link.name}
                    </span>
                    <span className="text-[11px] text-[#5A6650] truncate font-mono">
                      {link.subText || link.url}
                    </span>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-[#7F8C6A] group-hover:text-[#1E3B2F] ml-auto shrink-0 transition-colors" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;
