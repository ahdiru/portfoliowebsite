import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Code2,
  Star,
  ChevronRight,
  Layers,
  Layout,
  Globe,
  Package,
  Cpu,
  Code,
  FileText,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import { toSlug } from "../utils/slug";
import { resolvePdfUrl } from "../utils/pdfStorage";
import { supabase } from "../supabase";

const TECH_ICONS = {
  React: Globe,
  Tailwind: Layout,
  Express: Cpu,
  Python: Code,
  Javascript: Code,
  HTML: Code,
  CSS: Code,
  Figma: Layout,
  Supabase: Layers,
  default: Package,
};

const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];
  return (
    <div className="group relative overflow-hidden px-3.5 py-2 bg-[#FFFFFF] border border-[#D8CFBE] hover:border-[#7F8C6A] hover:bg-[#EDE7DA] rounded-xl transition-all duration-200 shadow-2xs cursor-default">
      <div className="relative flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#7F8C6A] group-hover:text-[#1E3B2F] transition-colors" />
        <span className="text-xs font-mono font-medium text-[#1E3B2F]">
          {tech}
        </span>
      </div>
    </div>
  );
};

const FeatureItem = ({ feature }) => {
  return (
    <li className="group flex items-start space-x-3 p-3 rounded-xl bg-[#F5F0E6]/70 border border-[#D8CFBE]/60 hover:bg-[#EDE7DA] transition-all duration-200">
      <div className="mt-1.5 shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#7F8C6A] group-hover:bg-[#1E3B2F] transition-colors" />
      </div>
      <span className="text-xs sm:text-sm text-[#1E3B2F] font-sans leading-relaxed">
        {feature}
      </span>
    </li>
  );
};

const ProjectStats = ({ project }) => {
  const techStackCount = project?.TechStack?.length || 0;
  const featuresCount = project?.Features?.length || 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs">
      <div className="flex items-center space-x-3 bg-[#EDE7DA] p-3 rounded-xl border border-[#D8CFBE]">
        <div className="bg-[#1E3B2F] p-2 rounded-lg text-[#F5F0E6] shrink-0">
          <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C8B48A]" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-bold font-mono text-[#1E3B2F]">
            {techStackCount}
          </div>
          <div className="text-[11px] font-mono text-[#5A6650] uppercase tracking-wider">
            Teknologi
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 bg-[#EDE7DA] p-3 rounded-xl border border-[#D8CFBE]">
        <div className="bg-[#7F8C6A] p-2 rounded-lg text-[#F5F0E6] shrink-0">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5F0E6]" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-bold font-mono text-[#1E3B2F]">
            {featuresCount}
          </div>
          <div className="text-[11px] font-mono text-[#5A6650] uppercase tracking-wider">
            Fitur Utama
          </div>
        </div>
      </div>
    </div>
  );
};

const handleGithubClick = (githubLink) => {
  if (githubLink === "Private" || !githubLink) {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "Maaf, source code untuk proyek ini bersifat privat.",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#1E3B2F",
      background: "#F5F0E6",
      color: "#1E3B2F",
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProject = async () => {
      setLoading(true);

      // 1. Cek dari localStorage terlebih dahulu
      let found = null;
      try {
        const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
        const localProjects = JSON.parse(localStorage.getItem("portfolio_local_projects")) || [];
        const combined = [...storedProjects, ...localProjects];

        found = combined.find((p) => toSlug(p.Title) === slug);
      } catch (e) {
        console.warn("Local project lookup failed:", e);
      }

      // 2. Jika belum ditemukan di localStorage, fetch langsung dari Supabase
      if (!found) {
        try {
          const { data, error } = await supabase.from("projects").select("*");
          if (!error && Array.isArray(data)) {
            found = data.find((p) => toSlug(p.Title) === slug);
          }
        } catch (err) {
          console.warn("Supabase direct project lookup failed:", err);
        }
      }

      if (found) {
        const rawFeatures = Array.isArray(found.Features) ? found.Features : [];
        const pdfFromFeatures = rawFeatures
          .find((f) => typeof f === "string" && f.startsWith("__pdf:"))
          ?.replace("__pdf:", "")
          ?.replace(/__$/, "");
        const cleanFeatures = rawFeatures.filter(
          (f) => typeof f === "string" && !f.startsWith("__pdf:")
        );
        const pdfUrl = found.PdfUrl || pdfFromFeatures || null;

        const enhancedProject = {
          ...found,
          Features: cleanFeatures,
          TechStack: Array.isArray(found.TechStack) ? found.TechStack : [],
          Github: found.Github || "https://github.com/ahdiru",
          PdfUrl: pdfUrl,
        };
        setProject(enhancedProject);
      }

      setLoading(false);
    };

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-3 border-[#D8CFBE] border-t-[#1E3B2F] rounded-full animate-spin" />
          <h2 className="text-base font-mono font-bold text-[#1E3B2F]">
            Memuat Data Proyek...
          </h2>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7DA] text-[#1E3B2F] flex items-center justify-center">
            <Package className="w-6 h-6 text-[#7F8C6A]" />
          </div>
          <h2 className="text-lg font-mono font-bold text-[#1E3B2F]">
            Proyek Tidak Ditemukan
          </h2>
          <p className="text-xs text-[#5A6650] leading-relaxed">
            Proyek dengan tautan ini tidak tersedia atau telah diperbarui. Silakan kembali ke katalog portofolio.
          </p>
          <button
            onClick={() => navigate("/#projects")}
            className="px-4 py-2 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-mono text-xs font-medium transition-all shadow-xs"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const projectUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://github.com/ahdiru/portfoliowebsite#${toSlug(project.Title)}`;

  return (
    <>
      <Helmet>
        <title>{project.Title} — Ahmad Jordan</title>
        <meta name="description" content={project.Description} />
        <meta property="og:title" content={`${project.Title} — Ahmad Jordan`} />
        <meta
          property="og:description"
          content={project.Description?.slice(0, 155)}
        />
        <meta property="og:url" content={projectUrl} />
        <meta property="og:type" content="website" />
        {project.Img && <meta property="og:image" content={project.Img} />}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": "${project.Title}",
            "description": "${project.Description?.replace(/"/g, '\\"')}",
            "url": "${projectUrl}",
            "author": {
              "@type": "Person",
              "name": "Ahmad Jordan",
              "url": "https://github.com/ahdiru"
            }
          }
        `}</script>
      </Helmet>

      <div className="min-h-screen bg-[#F5F0E6] text-[#1E3B2F] relative overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-10">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center space-x-2 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#EDE7DA] border border-[#D8CFBE] rounded-xl text-[#1E3B2F] text-xs font-mono font-medium transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#5A6650] min-w-0">
              <span
                onClick={() => navigate("/")}
                className="hover:text-[#1E3B2F] cursor-pointer"
              >
                Projects
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D8CFBE] shrink-0" />
              <span className="text-[#1E3B2F] font-bold truncate">
                {project.Title}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Project Overview, Stats, Actions & Tech */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] text-[#1E3B2F] text-[11px] font-mono font-semibold">
                  <Sparkles className="w-3 h-3 text-[#7F8C6A]" />
                  <span>Project Showcase</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1E3B2F] font-mono leading-tight">
                  {project.Title}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#1E3B2F] via-[#7F8C6A] to-[#C8B48A] rounded-full" />
              </div>

              {/* Description */}
              <div className="p-5 sm:p-6 bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#5A6650] font-bold mb-2">
                  Tentang Proyek
                </h3>
                <p className="text-sm sm:text-base text-[#1E3B2F] leading-relaxed">
                  {project.Description}
                </p>
              </div>

              {/* Stats Card */}
              <ProjectStats project={project} />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {project.Link && (
                  <a
                    href={project.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-mono text-xs font-medium transition-all shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4 text-[#C8B48A]" />
                    <span>Live Demo</span>
                  </a>
                )}

                {project.Github && (
                  <a
                    href={project.Github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) =>
                      !handleGithubClick(project.Github) && e.preventDefault()
                    }
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#EDE7DA] border border-[#D8CFBE] text-[#1E3B2F] rounded-xl font-mono text-xs font-medium transition-all shadow-xs"
                  >
                    <Github className="w-4 h-4" />
                    <span>Source Code</span>
                  </a>
                )}

                {project.PdfUrl && (
                  <a
                    href={project.PdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async (e) => {
                      if (project.PdfUrl.startsWith("indexeddb:")) {
                        e.preventDefault();
                        const resolved = await resolvePdfUrl(project.PdfUrl);
                        if (resolved) window.open(resolved, "_blank");
                      }
                    }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] border border-[#C8B48A]/50 rounded-xl font-mono text-xs font-medium transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#C8B48A]" />
                    <span>View Presentation Deck (PDF)</span>
                  </a>
                )}
              </div>

              {/* Technologies Used */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#5A6650] font-bold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#7F8C6A]" />
                  <span>Teknologi yang Digunakan</span>
                </h3>
                {project.TechStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.TechStack.map((tech, index) => (
                      <TechBadge key={index} tech={tech} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[#5A6650]">
                    Tidak ada teknologi yang ditambahkan.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Cover Image & Key Features */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cover Card */}
              {project.Img && (
                <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-2.5 shadow-xs">
                  <div className="relative rounded-xl overflow-hidden bg-[#EDE7DA] border border-[#D8CFBE]/60">
                    <img
                      src={project.Img}
                      alt={project.Title}
                      className="w-full object-cover aspect-[16/10] transform hover:scale-105 transition-transform duration-500"
                      onLoad={() => setIsImageLoaded(true)}
                    />
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#1E3B2F] flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#C8B48A]" />
                  <span>Fitur & Sorotan Utama</span>
                </h3>
                {project.Features.length > 0 ? (
                  <ul className="space-y-2">
                    {project.Features.map((feature, index) => (
                      <FeatureItem key={index} feature={feature} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-mono text-[#5A6650]">
                    Belum ada sorotan fitur yang dicatat.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
