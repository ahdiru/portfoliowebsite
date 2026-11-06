import React, { useEffect } from "react";
import {
  Linkedin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const socialLinks = [
  {
    name: "LinkedIn",
    displayName: "LinkedIn",
    subText: "linkedin.com/in/ahmadjordan",
    icon: Linkedin,
    url: "https://www.linkedin.com/in/ahmadjordan",
    isPrimary: true,
  },
  {
    name: "Email",
    displayName: "Email Inbox",
    subText: "ahmadjordan186@gmail.com",
    icon: Mail,
    url: "mailto:ahmadjordan186@gmail.com",
  },
  {
    name: "WhatsApp",
    displayName: "Direct Contact",
    subText: "+62 899-7493-736",
    icon: Phone,
    url: "https://wa.me/628997493736",
  },
  {
    name: "Portfolio",
    displayName: "Live Portfolio",
    subText: "bit.ly/Jordansportfolio",
    icon: Globe,
    url: "https://bit.ly/Jordansportfolio",
  },
];

const SocialLinks = () => {
  const linkedIn = socialLinks.find((link) => link.isPrimary);
  const otherLinks = socialLinks.filter((link) => !link.isPrimary);

  useEffect(() => {
    AOS.init({ offset: 10 });
  }, []);

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
        {/* Primary Row: LinkedIn */}
        {linkedIn && (
          <a
            href={linkedIn.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 rounded-xl 
                       bg-[#F5F0E6] border border-[#D8CFBE]
                       hover:border-[#7F8C6A] hover:bg-[#EDE7DA] transition-all duration-200 shadow-2xs"
            data-aos="fade-up"
            data-aos-delay="100" 
          >
            <div className="relative flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] group-hover:scale-105 transition-transform">
                <linkedIn.icon className="w-5 h-5 text-[#1E3B2F]" />
              </div>

              <div className="flex flex-col">
                <span className="text-base font-bold text-[#1E3B2F]">
                  {linkedIn.displayName}
                </span>
                <span className="text-xs text-[#5A6650] font-mono">
                  {linkedIn.subText}
                </span>
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-[#7F8C6A] group-hover:text-[#1E3B2F] transition-colors" />
          </a>
        )}

        {/* Other Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {otherLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3.5 rounded-xl 
                         bg-[#F5F0E6] border border-[#D8CFBE]
                         hover:border-[#7F8C6A] hover:bg-[#EDE7DA] transition-all duration-200 shadow-2xs"
              data-aos="fade-up" 
              data-aos-delay={150 + index * 50} 
            >
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F]">
                <link.icon className="w-4 h-4 text-[#1E3B2F]" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1E3B2F]">
                  {link.displayName}
                </span>
                <span className="text-[11px] text-[#5A6650] truncate font-mono">
                  {link.subText}
                </span>
              </div>

              <ExternalLink className="w-3.5 h-3.5 text-[#7F8C6A] group-hover:text-[#1E3B2F] ml-auto transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
