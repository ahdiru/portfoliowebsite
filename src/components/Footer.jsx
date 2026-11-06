import React from "react";
import { useProfile } from "../utils/profileData";

const Footer = () => {
  const profile = useProfile();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#F5F0E6] border-t border-[#D8CFBE] py-8 text-center">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5A6650]">
        <div className="flex items-center gap-2 font-bold text-[#1E3B2F]">
          <span>{profile?.name || "Ahmad Jordan"}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7F8C6A] inline-block"></span>
          <span className="font-normal text-[#5A6650]">{profile?.roleTitle || "Web Developer & Data Analyst"}</span>
        </div>

        <div>
          © {currentYear} {profile?.name || "Ahmad Jordan"}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
