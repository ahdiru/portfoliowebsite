import React, { memo } from "react";
import { Helmet } from "react-helmet-async";
import { Linkedin, Mail, ArrowUpRight, Terminal, Database, LineChart, Code2, Layers } from "lucide-react";
import { useProfile } from "../utils/profileData";

const StatusBadge = memo(({ profile }) => (
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] text-xs font-mono text-[#1E3B2F] shadow-sm">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F7A3A] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F7A3A]"></span>
    </span>
    <span className="font-medium">{profile?.roleTitle || "Web Developer & Data Analyst"} • {profile?.location || "Jakarta, ID"}</span>
  </div>
));

const TechTag = memo(({ name }) => (
  <span className="px-3 py-1 rounded-md bg-[#FFFFFF] border border-[#D8CFBE] text-xs font-mono text-[#1E3B2F] hover:bg-[#EDE7DA] hover:border-[#7F8C6A] transition-colors shadow-2xs">
    {name}
  </span>
));

const SOCIAL_LINKS = [
  { icon: Linkedin, link: "https://www.linkedin.com/in/ahmadjordan", label: "LinkedIn Profile" },
  { icon: Mail, link: "mailto:ahmadjordan186@gmail.com", label: "Email Directly" },
];

const TECH_STACK = ["React.js", "Python", "PostgreSQL", "Supabase", "Tailwind CSS", "Tableau", "Vue.js", "SQL"];

const DeveloperBentoCard = memo(({ profile }) => (
  <div className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#D8CFBE] p-6 shadow-[0_16px_40px_rgba(30,59,47,0.08)] relative overflow-hidden">
    {/* Subtle Card Ambient Highlight */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8B48A]/20 blur-3xl pointer-events-none rounded-full" />
    
    {/* Terminal / Code Window Header */}
    <div className="flex items-center justify-between pb-4 border-b border-[#D8CFBE] mb-5">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#D8CFBE] inline-block" />
        <span className="w-3 h-3 rounded-full bg-[#C8B48A] inline-block" />
        <span className="w-3 h-3 rounded-full bg-[#7F8C6A] inline-block" />
        <span className="text-xs font-mono text-[#5A6650] ml-2">jordan.profile.ts</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-mono text-[#4F7A3A]">
        <Terminal className="w-3.5 h-3.5" />
        <span className="font-semibold">verified</span>
      </div>
    </div>

    {/* Code snippet / Architecture preview */}
    <div className="space-y-3 font-mono text-xs sm:text-sm text-[#1E3B2F]">
      <div className="text-[#5A6650]">{"// Professional Profile & Focus"}</div>
      <div className="pl-3 border-l-2 border-[#D8CFBE] space-y-1.5">
        <div>
          <span className="text-[#7F8C6A] font-semibold">const</span>{" "}
          <span className="text-[#1E3B2F] font-bold">engineer</span> = &#123;
        </div>
        <div className="pl-4">
          <span className="text-[#5A6650]">name:</span>{" "}
          <span className="text-[#1E3B2F]">"{profile?.name || "Ahmad Jordan"}"</span>,
        </div>
        <div className="pl-4">
          <span className="text-[#5A6650]">organization:</span>{" "}
          <span className="text-[#1E3B2F]">"{profile?.affiliation || "TVRI Pusat Data Strategi"}"</span>,
        </div>
        <div className="pl-4">
          <span className="text-[#5A6650]">education:</span>{" "}
          <span className="text-[#1E3B2F]">"{profile?.education || "BINUS Computer Science (IPK 3.79)"}"</span>,
        </div>
        <div className="pl-4">
          <span className="text-[#5A6650]">expertise:</span>{" "}
          <span className="text-[#1E3B2F]">"Web Platforms, BI & Database Architecture"</span>
        </div>
        <div>&#125;;</div>
      </div>
    </div>

    {/* Live Highlights Grid */}
    <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#D8CFBE]">
      <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-center">
        <Code2 className="w-4 h-4 mx-auto mb-1 text-[#1E3B2F]" />
        <div className="text-[11px] font-mono text-[#5A6650]">Frontend</div>
        <div className="text-xs font-semibold text-[#1E3B2F] mt-0.5">React & Vue</div>
      </div>
      <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-center">
        <Database className="w-4 h-4 mx-auto mb-1 text-[#7F8C6A]" />
        <div className="text-[11px] font-mono text-[#5A6650]">Database</div>
        <div className="text-xs font-semibold text-[#1E3B2F] mt-0.5">PostgreSQL & Supabase</div>
      </div>
      <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-center">
        <LineChart className="w-4 h-4 mx-auto mb-1 text-[#C8B48A]" />
        <div className="text-[11px] font-mono text-[#5A6650]">BI & Analytics</div>
        <div className="text-xs font-semibold text-[#1E3B2F] mt-0.5">Tableau & Python</div>
      </div>
    </div>
  </div>
));

const Home = () => {
  const profile = useProfile();
  return (
    <>
      <Helmet>
        <title>{profile?.name || "Ahmad Jordan"} — {profile?.roleTitle || "Web Developer & Data Analyst"}</title>
        <meta name="description" content={`Portfolio of ${profile?.name || "Ahmad Jordan"}, ${profile?.caption || "Web Developer & Data Analyst"}`} />
      </Helmet>

      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 py-24 sm:py-32" id="Home">
        <div className="max-w-6xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <StatusBadge profile={profile} />
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E3B2F] leading-[1.12]">
                {profile?.heroHeadline || "Engineering end-to-end web platforms & data pipelines."}
              </h1>

              <p className="text-base sm:text-lg text-[#5A6650] max-w-xl leading-relaxed">
                {profile?.heroSubdescription || "Versatile Web Developer & Data Analyst with proven experience engineering executive monitoring dashboards, optimizing relational database architectures, and deploying reliable business intelligence solutions."}
              </p>

              {/* Tech Stack */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[#5A6650]">Core Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {(profile?.heroTechStack
                    ? profile.heroTechStack.split(',').map((s) => s.trim()).filter(Boolean)
                    : TECH_STACK
                  ).map((tech) => (
                    <TechTag key={tech} name={tech} />
                  ))}
                </div>
              </div>

              {/* Action Buttons & Socials */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#Portofolio"
                  className="px-6 py-3 rounded-lg bg-[#1E3B2F] text-[#F5F0E6] font-medium text-sm hover:bg-[#2A5241] transition-all flex items-center gap-2 group shadow-sm hover:shadow-md"
                >
                  <span>Explore Projects</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#Contact"
                  className="px-6 py-3 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] hover:bg-[#EDE7DA] hover:border-[#7F8C6A] font-medium text-sm transition-all flex items-center gap-2 shadow-2xs"
                >
                  <Mail className="w-4 h-4 text-[#7F8C6A]" />
                  <span>Contact Me</span>
                </a>

                <div className="flex items-center gap-2 pl-2 border-l border-[#D8CFBE]">
                  {SOCIAL_LINKS.map(({ icon: Icon, link, label }) => (
                    <a
                      key={label}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:border-[#7F8C6A] hover:bg-[#EDE7DA] transition-all shadow-2xs"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Sleek Bento Developer Card OR Custom Hero Image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              {profile?.heroImage ? (
                <div className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#D8CFBE] p-4 shadow-[0_16px_40px_rgba(30,59,47,0.08)] relative overflow-hidden group">
                  <div className="w-full aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-[#EDE7DA] border border-[#D8CFBE]">
                    <img
                      src={profile.heroImage}
                      alt={profile?.name || "Hero Visual"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              ) : (
                <DeveloperBentoCard profile={profile} />
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default memo(Home);
