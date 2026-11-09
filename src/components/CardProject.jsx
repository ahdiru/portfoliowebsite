import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, FileText } from "lucide-react";
import { toSlug } from "../utils/slug";

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id, PdfUrl }) => {
  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      e.preventDefault();
      alert("Live demo link is not available");
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      e.preventDefault();
      alert("Project details are not available");
    }
  };

  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-xl bg-[#FFFFFF] border border-[#D8CFBE] shadow-[0_8px_24px_rgba(30,59,47,0.05)] transition-all duration-300 hover:border-[#7F8C6A] hover:shadow-md">
        <div className="relative p-5 z-10">
          <div className="relative overflow-hidden rounded-lg bg-[#EDE7DA] border border-[#D8CFBE]/60">
            <img
              src={Img}
              alt={Title}
              className="w-full h-full object-cover aspect-[16/9] transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {PdfUrl && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#1E3B2F]/90 backdrop-blur-xs text-[#F5F0E6] text-[10px] font-mono font-semibold flex items-center gap-1 shadow-xs">
                <FileText className="w-3 h-3 text-[#C8B48A]" />
                <span>PDF Deck</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1E3B2F]">
              {Title}
            </h3>

            <p className="text-[#5A6650] text-sm leading-relaxed line-clamp-2">
              {Description}
            </p>

            <div className="pt-4 flex items-center justify-between border-t border-[#D8CFBE]/60">
              {ProjectLink ? (
                <a
                  href={ProjectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLiveDemo}
                  className="inline-flex items-center space-x-1.5 text-sm font-semibold text-[#1E3B2F] hover:text-[#7F8C6A] transition-colors"
                >
                  <span>Live Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[#5A6650]/60 text-xs font-mono">
                  Demo Not Available
                </span>
              )}

              {id ? (
                <Link
                  to={`/project/${toSlug(Title)}`}
                  onClick={handleDetails}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#EDE7DA] hover:bg-[#1E3B2F] text-[#1E3B2F] hover:text-[#F5F0E6] text-xs font-mono font-medium transition-all"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-[#5A6650]/60 text-xs font-mono">
                  Details Not Available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardProject;
