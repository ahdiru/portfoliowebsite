import React, { useEffect, useState, memo, useMemo } from "react";
import { FileText, Code, Award, Globe, ArrowUpRight, Sparkles, GraduationCap, Building2 } from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useProfile } from "../utils/profileData";

// Memoized Header
const Header = memo(({ name, caption }) => (
  <div className="text-center lg:mb-12 mb-6 px-[5%]">
    <div className="inline-block relative">
      <h2 
        className="text-4xl md:text-5xl font-bold text-[#1E3B2F] tracking-tight" 
        data-aos="fade-up"
        data-aos-duration="600"
      >
        About {name || "Ahmad Jordan"}
      </h2>
    </div>
    <p 
      className="mt-3 text-[#5A6650] max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2 font-normal"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <Sparkles className="w-4 h-4 text-[#7F8C6A] shrink-0" />
      <span>{caption || "Web Developer & Data Analyst • Bridging Systems & Intelligence"}</span>
      <Sparkles className="w-4 h-4 text-[#7F8C6A] shrink-0" />
    </p>
  </div>
));

// Profile Image Component with Editorial Framing
const ProfileImage = memo(({ src, badge }) => (
  <div className="flex justify-center lg:justify-end items-center sm:p-6 p-2">
    <div 
      className="relative" 
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-[#FFFFFF] border-2 border-[#D8CFBE] shadow-[0_16px_40px_rgba(30,59,47,0.08)]">
        <img
          src={src || "/Photo.jpeg"}
          alt="Ahmad Jordan"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-lg bg-[#EDE7DA] border border-[#D8CFBE] text-[11px] font-mono text-[#1E3B2F] shadow-sm hidden sm:block">
        {badge || "TVRI Pusat Data Strategi"}
      </div>
    </div>
  </div>
));

const StatCard = memo(({ icon: Icon, value, label, description, animation }) => (
  <div data-aos={animation} data-aos-duration={1000} className="relative group">
    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#D8CFBE] shadow-[0_8px_24px_rgba(30,59,47,0.04)] hover:border-[#7F8C6A] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EDE7DA] text-[#1E3B2F] transition-transform group-hover:scale-105">
          <Icon className="w-6 h-6 text-[#1E3B2F]" />
        </div>
        <span 
          className="text-4xl font-bold text-[#1E3B2F] tracking-tight font-mono"
          data-aos="fade-up-left"
          data-aos-duration="1000"
        >
          {value}
        </span>
      </div>

      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#5A6650] mb-1.5 font-medium">
          {label}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#5A6650]">
            {description}
          </p>
          <ArrowUpRight className="w-4 h-4 text-[#7F8C6A] group-hover:text-[#1E3B2F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </div>
  </div>
));

const AboutPage = () => {
  const profile = useProfile();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertificates: 0,
    YearExperience: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]");
      
      const startDate = new Date("2023-11-01");
      const today = new Date();
      const experience = today.getFullYear() - startDate.getFullYear() -
        (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate()) ? 1 : 0);

      setStats({
        totalProjects: storedProjects.length || 6,
        totalCertificates: storedCertificates.length || 5,
        YearExperience: Math.max(experience, 2)
      });
    };

    updateStats();

    window.addEventListener('storage', updateStats);
    window.addEventListener('portfolioDataUpdated', updateStats);

    return () => {
      window.removeEventListener('storage', updateStats);
      window.removeEventListener('portfolioDataUpdated', updateStats);
    };
  }, []);

  const { totalProjects, totalCertificates, YearExperience } = stats;

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const statsData = useMemo(() => [
    {
      icon: Code,
      value: totalProjects,
      label: "Engineered Projects",
      description: "Platforms, Dashboards & Pipelines",
      animation: "fade-right",
    },
    {
      icon: Award,
      value: totalCertificates,
      label: "Verified Credentials",
      description: "Apple Academy, BPS, Kominfo",
      animation: "fade-up",
    },
    {
      icon: Globe,
      value: `${YearExperience}+ Yrs`,
      label: "Industry Experience",
      description: "Public Sector & Enterprise",
      animation: "fade-left",
    },
  ], [totalProjects, totalCertificates, YearExperience]);

  return (
    <div
      className="h-auto pb-20 text-[#1E3B2F] overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] pt-16" 
      id="About"
      itemScope
      itemType="https://schema.org/Person"
    >
      <Header name={profile.name} caption={profile.caption} />

      <div className="w-full mx-auto pt-6 sm:pt-8 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Biography & Principles */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E3B2F]"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span>Hello, I'm </span>
              <span className="block mt-1 text-[#1E3B2F]" itemProp="name">
                {profile.name || "Ahmad Jordan"}
              </span>
            </h2>
            
            <p 
              className="text-base sm:text-lg text-[#1E3B2F] leading-relaxed text-justify sm:text-left font-normal"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              {profile.bio || "Versatile Web Developer & Data Analyst berbasis di Jakarta, berpengalaman dalam merancang platform web end-to-end, arsitektur database relasional PostgreSQL (Supabase), serta otomasi data pipeline menggunakan Python dan Tableau."}
            </p>

            {/* Quick Education & Role Pills */}
            <div className="flex flex-col sm:flex-row gap-3 text-xs font-mono text-[#5A6650]">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] shadow-2xs">
                <Building2 className="w-4 h-4 text-[#7F8C6A]" />
                <span>{profile.affiliation || "TVRI Pusat Data Strategi"}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] shadow-2xs">
                <GraduationCap className="w-4 h-4 text-[#7F8C6A]" />
                <span>{profile.education || "BINUS CS (IPK 3.79 / 4.00)"}</span>
              </div>
            </div>

            {/* Editorial Quote Card */}
            {profile.quote && (
              <div 
                className="relative bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl p-5 my-6 shadow-xs overflow-hidden"
                data-aos="fade-up"
                data-aos-duration="1400"
              >
                <blockquote className="text-[#5A6650] text-center lg:text-left italic font-medium text-sm">
                  "{profile.quote}"
                </blockquote>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 w-full">
              {profile.resumeUrl ? (
                <a 
                  href={profile.resumeUrl} 
                  download={profile.resumeFileName || "Ahmad_Jordan_CV.pdf"}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto"
                >
                  <button 
                    data-aos="fade-up"
                    data-aos-duration="800"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1E3B2F] text-[#F5F0E6] font-medium text-sm hover:bg-[#2A5241] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Download Resume / CV
                  </button>
                </a>
              ) : null}
              <a href="#Portofolio" className="w-full sm:w-auto">
                <button 
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] font-medium text-sm hover:bg-[#EDE7DA] hover:border-[#7F8C6A] transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Code className="w-4 h-4 text-[#7F8C6A]" /> View Showcase
                </button>
              </a>
            </div>
          </div>

          <ProfileImage src={profile.photo} badge={profile.affiliation} />
        </div>

        {/* Stats Grid */}
        <a href="#Portofolio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 cursor-pointer">
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </a>
      </div>
    </div>
  );
};

export default memo(AboutPage);
