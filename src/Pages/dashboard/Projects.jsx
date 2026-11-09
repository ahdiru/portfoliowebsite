import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import {
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Pencil,
  FileText,
  Presentation,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import { convertPdfFirstPageToImage } from "../../utils/pdfToImage";

const Card = ({ children, className = "" }) => (
  <div className={`relative bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs overflow-hidden ${className}`}>
    {children}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
    <div className="w-full aspect-[16/8] bg-[#EDE7DA] animate-pulse rounded-xl" />
    <div className="h-4 bg-[#EDE7DA] animate-pulse rounded-lg w-2/3" />
    <div className="h-3 bg-[#EDE7DA] animate-pulse rounded-lg w-full" />
    <div className="h-3 bg-[#EDE7DA] animate-pulse rounded-lg w-4/5" />
    <div className="flex gap-1.5 mt-1">
      <div className="h-5 w-16 bg-[#EDE7DA] animate-pulse rounded-md" />
      <div className="h-5 w-12 bg-[#EDE7DA] animate-pulse rounded-md" />
    </div>
  </div>
);

const parseProjectPdf = (project) => {
  if (project?.PdfUrl) return project.PdfUrl;
  if (Array.isArray(project?.Features)) {
    const found = project.Features.find(
      (f) => typeof f === "string" && f.startsWith("__pdf:")
    );
    if (found) {
      return found.replace("__pdf:", "").replace(/__$/, "");
    }
  }
  return "";
};

const cleanProjectFeatures = (features) => {
  if (!Array.isArray(features)) return [];
  return features.filter(
    (f) => typeof f === "string" && !f.startsWith("__pdf:")
  );
};

const ProjectCard = ({ project, onDelete, onEdit }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const pdfDeck = parseProjectPdf(project);
  const displayFeatures = cleanProjectFeatures(project.Features);

  return (
    <Card>
      <div className="p-4 flex flex-col h-full">
        {project.Img && (
          <div className="relative w-full aspect-[16/8] rounded-xl mb-3 border border-[#D8CFBE]/60 overflow-hidden bg-[#EDE7DA]">
            {!imgLoaded && (
              <div className="w-full h-full animate-pulse bg-[#EDE7DA]" />
            )}
            <img
              src={project.Img}
              alt={project.Title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0 absolute"
              }`}
            />
            {pdfDeck && (
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#1E3B2F]/90 backdrop-blur-xs text-[#F5F0E6] text-[10px] font-mono font-semibold flex items-center gap-1 shadow-xs">
                <Presentation className="w-3 h-3 text-[#C8B48A]" />
                <span>PDF Deck</span>
              </div>
            )}
          </div>
        )}

        <h3 className="font-bold text-[#1E3B2F] text-base mb-1 tracking-tight">
          {project.Title}
        </h3>

        {project.Description && (
          <p className="text-[#5A6650] text-xs mb-3 line-clamp-2 leading-relaxed">
            {project.Description}
          </p>
        )}

        {project.TechStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.TechStack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-[#EDE7DA] border border-[#D8CFBE] text-[#1E3B2F] text-[11px] font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-[#D8CFBE]">
          <div className="flex items-center gap-1.5">
            {project.Link && (
              <a
                href={project.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                title="Live Demo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.Github && (
              <a
                href={project.Github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {pdfDeck && (
              <a
                href={pdfDeck}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#1E3B2F] bg-[#EDE7DA] hover:bg-[#1E3B2F] hover:text-[#F5F0E6] transition-colors"
                title="Buka Dokumen PDF Presentasi"
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D8CFBE] text-[#1E3B2F] bg-[#EDE7DA] hover:bg-[#1E3B2F] hover:text-[#F5F0E6] text-xs font-mono transition-all"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#B4442E]/30 text-[#B4442E] hover:bg-[#B4442E] hover:text-white text-xs font-mono transition-all"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    />
    <div
      className="relative z-10 w-full max-w-2xl flex flex-col"
      style={{ maxHeight: "calc(100vh - 24px)" }}
    >
      <div className="relative bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8CFBE] shrink-0">
          <h2 className="text-base font-bold text-[#1E3B2F] font-mono">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
  uploading,
}) => {
  const initialPdf = parseProjectPdf(initial);
  const initialFeatures = cleanProjectFeatures(initial?.Features);

  const [form, setForm] = useState({
    Title: initial?.Title || "",
    Description: initial?.Description || "",
    TechStack: Array.isArray(initial?.TechStack)
      ? initial.TechStack.join(", ")
      : initial?.TechStack || "",
    Features: initialFeatures.join(", "),
    Link: initial?.Link || "",
    Github: initial?.Github || "",
    PdfUrl: initialPdf || "",
  });

  // Cover Image / Cover PDF
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.Img || null);
  const [coverConverting, setCoverConverting] = useState(false);

  // Dedicated Presentation PDF Deck
  const [deckFile, setDeckFile] = useState(null);
  const [deckPreview, setDeckPreview] = useState(initialPdf || null);
  const [deckConverting, setDeckConverting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Handle Cover Upload (Supports Images & PDF presentations)
  const handleCoverChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);

    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      setCoverConverting(true);
      try {
        const slideOne = await convertPdfFirstPageToImage(f, 2.5);
        setCoverPreview(slideOne);
        // Jika belum ada deckFile terpisah, jadikan juga berkas ini sebagai presentation deck
        if (!deckFile && !form.PdfUrl) {
          setDeckFile(f);
          setDeckPreview(slideOne);
        }
      } catch (err) {
        console.error("Failed to render PDF cover slide:", err);
        setCoverPreview(URL.createObjectURL(f));
      } finally {
        setCoverConverting(false);
      }
    } else {
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  // Handle Dedicated Presentation PDF File
  const handleDeckChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setDeckFile(f);

    setDeckConverting(true);
    try {
      const slideThumb = await convertPdfFirstPageToImage(f, 2.0);
      setDeckPreview(slideThumb);
    } catch (err) {
      console.warn("PDF thumbnail rendering:", err);
      setDeckPreview(URL.createObjectURL(f));
    } finally {
      setDeckConverting(false);
    }
  };

  const handleClearDeck = () => {
    setDeckFile(null);
    setDeckPreview(null);
    setForm((f) => ({ ...f, PdfUrl: "" }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, { coverFile, deckFile, coverPreview });
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <InputField
            label="Project Title *"
            value={form.Title}
            onChange={set("Title")}
            placeholder="Contoh: TVRI Analytics Dashboard / Executive KPI Platform"
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">
            Description
          </label>
          <textarea
            value={form.Description}
            onChange={set("Description")}
            placeholder="Jelaskan arsitektur platform, pipeline data, dan dampak teknis..."
            rows={3}
            className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all resize-none"
          />
        </div>

        {/* Tech Stack & Features */}
        <InputField
          label="Tech Stack (comma separated)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="e.g. React.js, Tailwind CSS, Supabase, Python"
        />
        <InputField
          label="Key Features (comma separated)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="e.g. Realtime KPI, DPR Reporting, Geospatial"
        />

        {/* Links */}
        <InputField
          label="Live URL"
          value={form.Link}
          onChange={set("Link")}
          placeholder="https://monitoring-kpi.netlify.app"
        />
        <InputField
          label="GitHub URL"
          value={form.Github}
          onChange={set("Github")}
          placeholder="https://github.com/ahdiru/project-name"
        />

        {/* 1. PROJECT COVER IMAGE / COVER PDF */}
        <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-[#D8CFBE]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#1E3B2F] uppercase tracking-wider font-bold">
              Project Cover Image (Gambar atau PDF Slide)
            </label>
            <span className="text-[11px] font-mono text-[#7F8C6A]">
              Mendukung PNG, JPG, WEBP, atau PDF
            </span>
          </div>

          <label className="flex items-center gap-4 w-full bg-[#F5F0E6] border border-dashed border-[#D8CFBE] rounded-xl px-4 py-4 cursor-pointer hover:border-[#1E3B2F] hover:bg-[#EDE7DA] transition-all">
            {coverConverting ? (
              <div className="w-24 h-16 rounded-lg bg-[#EDE7DA] flex flex-col items-center justify-center border border-[#D8CFBE]">
                <div className="w-5 h-5 border-2 border-[#1E3B2F]/30 border-t-[#1E3B2F] rounded-full animate-spin" />
              </div>
            ) : coverPreview ? (
              <img
                src={coverPreview}
                className="h-16 w-24 object-cover rounded-lg border border-[#D8CFBE] shadow-2xs"
                alt="cover preview"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-[#EDE7DA] flex items-center justify-center border border-[#D8CFBE]">
                <ImageIcon className="w-5 h-5 text-[#7F8C6A]" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#1E3B2F]">
                {coverPreview ? "Ganti Gambar / PDF Cover" : "Klik untuk unggah Cover Proyek"}
              </p>
              <p className="text-xs text-[#5A6650] mt-0.5 font-mono">
                Jika berkas PDF diunggah, Slide 1 otomatis dijadikan Cover beresolusi tinggi
              </p>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf,.pdf"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
        </div>

        {/* 2. DEDICATED PRESENTATION PDF DECK UPLOAD */}
        <div className="sm:col-span-2 space-y-2 pt-3 border-t border-[#D8CFBE]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#1E3B2F] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Presentation className="w-4 h-4 text-[#7F8C6A]" />
              <span>Dokumen Presentasi / Pitch Deck (PDF)</span>
            </label>
            <span className="text-[11px] font-mono text-[#5A6650]">
              Opsional • Tampil sebagai tombol "View Deck"
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] space-y-3">
            {/* File Upload Box */}
            <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#FFFFFF] border border-dashed border-[#D8CFBE] hover:border-[#1E3B2F] cursor-pointer transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#EDE7DA] text-[#1E3B2F] shrink-0">
                  <FileText className="w-4 h-4 text-[#7F8C6A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1E3B2F] font-mono truncate">
                    {deckFile ? deckFile.name : (form.PdfUrl ? form.PdfUrl.split("/").pop() : "Pilih atau Tarik Berkas PDF Presentasi")}
                  </p>
                  <p className="text-[11px] text-[#5A6650] font-mono">
                    {deckFile ? `${(deckFile.size / (1024 * 1024)).toFixed(2)} MB • PDF siap diunggah` : "Mendukung format .pdf slide deck"}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-[#1E3B2F] text-[#F5F0E6] text-xs font-mono font-medium shrink-0">
                {deckFile || form.PdfUrl ? "Ganti File" : "Pilih PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleDeckChange}
                className="hidden"
              />
            </label>

            {/* Alternatif Link Online */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#5A6650]">
                Atau masukkan tautan slide online (Google Slides / Canva / Cloud Link):
              </label>
              <input
                type="text"
                value={form.PdfUrl}
                onChange={set("PdfUrl")}
                placeholder="https://docs.google.com/presentation/... atau https://.../deck.pdf"
                className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-lg px-3 py-2 text-xs text-[#1E3B2F] font-mono placeholder-[#5A6650]/60 outline-none focus:border-[#1E3B2F]"
              />
            </div>

            {/* Indicator / Preview if attached */}
            {(deckFile || form.PdfUrl || deckPreview) && (
              <div className="flex items-center justify-between pt-2 border-t border-[#D8CFBE]/60 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#1E3B2F]">
                  <Check className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  <span>Presentasi PDF Terpasang</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearDeck}
                  className="text-[#B4442E] hover:underline"
                >
                  Hapus Berkas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-[#D8CFBE]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] text-sm font-mono transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || coverConverting || deckConverting}
          className="flex items-center gap-2 px-5 py-2 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-sm transition-all shadow-xs disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-[#C8B48A]" />
          )}
          <span>{uploading ? "Menyimpan Proyek..." : submitLabel}</span>
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getLocalProjects = () => {
    try {
      const raw = localStorage.getItem("portfolio_local_projects");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalProjects = (items) => {
    try {
      localStorage.setItem("portfolio_local_projects", JSON.stringify(items));
      localStorage.setItem("projects", JSON.stringify(items));
      window.dispatchEvent(new Event("portfolioProjectsUpdated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch error, fallback to local:", error);
        setProjects(getLocalProjects());
      } else {
        const local = getLocalProjects();
        const merged = [...(data || [])];
        local.forEach((loc) => {
          if (!merged.some((m) => m.id === loc.id)) {
            merged.push(loc);
          }
        });
        setProjects(merged);
        localStorage.setItem("projects", JSON.stringify(merged));
      }
    } catch (e) {
      setProjects(getLocalProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    window.addEventListener("portfolioProjectsUpdated", fetchProjects);
    return () => window.removeEventListener("portfolioProjectsUpdated", fetchProjects);
  }, []);

  const uploadFileToStorage = async (f, prefix = "proj") => {
    try {
      const sanitizedName = f.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${prefix}-${Date.now()}-${sanitizedName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, f, {
          contentType: f.type || (f.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data } = supabase.storage
          .from("project-images")
          .getPublicUrl(fileName);
        return data.publicUrl;
      }
    } catch (err) {
      console.warn("Storage upload failed, falling back to data URL:", err);
    }

    // Fallback Data URL
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(f);
    });
  };

  const handleCreate = async (form, { coverFile, deckFile, coverPreview }) => {
    setUploading(true);

    try {
      // 1. Cover Image
      let imgUrl = coverPreview || "";
      if (coverFile) {
        const isPdf = coverFile.type === "application/pdf" || coverFile.name.endsWith(".pdf");
        if (isPdf) {
          imgUrl = coverPreview; // Slide 1 rendered data URL
        } else {
          imgUrl = await uploadFileToStorage(coverFile, "cover");
        }
      }

      // 2. Presentation Deck PDF
      let pdfUrl = form.PdfUrl || "";
      if (deckFile) {
        pdfUrl = await uploadFileToStorage(deckFile, "deck");
      }

      // Parse tags
      const techStack = form.TechStack.split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let features = form.Features.split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Embed PDF Deck cleanly into features array so it persists on any Supabase table
      if (pdfUrl) {
        features = [...features, `__pdf:${pdfUrl}__`];
      }

      // 3. Insert to Supabase with fallback
      let savedToDb = false;
      try {
        const { error: insertError } = await supabase.from("projects").insert({
          Title: form.Title,
          Description: form.Description,
          Img: imgUrl,
          TechStack: techStack,
          Features: features,
          Link: form.Link,
          Github: form.Github,
        });

        if (!insertError) {
          savedToDb = true;
        }
      } catch (err) {
        console.warn("DB insert error, fallback to local:", err);
      }

      // 4. Save to Local fallback
      if (!savedToDb) {
        const localList = getLocalProjects();
        const newProj = {
          id: `local_proj_${Date.now()}`,
          Title: form.Title,
          Description: form.Description,
          Img: imgUrl,
          TechStack: techStack,
          Features: features,
          Link: form.Link,
          Github: form.Github,
          PdfUrl: pdfUrl,
          created_at: new Date().toISOString(),
        };
        saveLocalProjects([newProj, ...localList]);
      }

      Swal.fire({
        icon: "success",
        title: "Proyek Berhasil Disimpan!",
        text: pdfUrl ? "Proyek & Berkas Presentasi PDF berhasil dipublikasikan." : "Proyek berhasil dipublikasikan.",
        confirmButtonColor: "#1E3B2F",
        timer: 1800,
      });

      setShowCreate(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan Proyek",
        text: error.message,
        confirmButtonColor: "#1E3B2F",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (form, { coverFile, deckFile, coverPreview }) => {
    setUploading(true);

    try {
      let imgUrl = coverPreview || editProject.Img || "";
      if (coverFile) {
        const isPdf = coverFile.type === "application/pdf" || coverFile.name.endsWith(".pdf");
        if (isPdf) {
          imgUrl = coverPreview;
        } else {
          imgUrl = await uploadFileToStorage(coverFile, "cover");
        }
      }

      let pdfUrl = form.PdfUrl || parseProjectPdf(editProject) || "";
      if (deckFile) {
        pdfUrl = await uploadFileToStorage(deckFile, "deck");
      }

      const techStack = form.TechStack.split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let features = form.Features.split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (pdfUrl) {
        features = [...features, `__pdf:${pdfUrl}__`];
      }

      let updatedInDb = false;
      try {
        const { error } = await supabase
          .from("projects")
          .update({
            Title: form.Title,
            Description: form.Description,
            Img: imgUrl,
            TechStack: techStack,
            Features: features,
            Link: form.Link,
            Github: form.Github,
          })
          .eq("id", editProject.id);

        if (!error) updatedInDb = true;
      } catch (e) {
        console.warn(e);
      }

      // Update local storage
      const local = getLocalProjects();
      const updatedLocal = local.map((p) =>
        p.id === editProject.id
          ? {
              ...p,
              Title: form.Title,
              Description: form.Description,
              Img: imgUrl,
              TechStack: techStack,
              Features: features,
              Link: form.Link,
              Github: form.Github,
              PdfUrl: pdfUrl,
            }
          : p
      );
      saveLocalProjects(updatedLocal);

      Swal.fire({
        icon: "success",
        title: "Perubahan Disimpan",
        text: "Data proyek & dokumen presentasi telah diperbarui.",
        confirmButtonColor: "#1E3B2F",
        timer: 1600,
        showConfirmButton: false,
      });

      setEditProject(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui Proyek",
        text: error.message,
        confirmButtonColor: "#1E3B2F",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async (id) => {
    const result = await Swal.fire({
      title: "Hapus proyek ini?",
      text: "Proyek akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#B4442E",
      cancelButtonColor: "#5A6650",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await supabase.from("projects").delete().eq("id", id);
      } catch (e) {
        console.warn(e);
      }

      const local = getLocalProjects();
      saveLocalProjects(local.filter((p) => p.id !== id));

      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Proyek berhasil dihapus.",
        timer: 1400,
        showConfirmButton: false,
      });
      fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl flex items-center justify-center text-[#1E3B2F] shadow-2xs">
            <FolderGit2 className="w-5 h-5 text-[#1E3B2F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3B2F] font-mono">
              Projects
            </h1>
            <p className="text-[#5A6650] text-xs font-mono">
              {loading ? "Loading..." : `${projects.length} projects published`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-sm transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C8B48A]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add New Project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(null)}>
          <ProjectForm
            initial={editProject}
            onSubmit={handleEdit}
            onCancel={() => setEditProject(null)}
            submitLabel="Update Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <FolderGit2 className="w-10 h-10 text-[#7F8C6A] mx-auto mb-3 opacity-60" />
            <p className="text-[#1E3B2F] font-semibold text-sm">No projects published yet</p>
            <p className="text-[#5A6650] text-xs mt-1">Click the "New Project" button above to publish your first showcase with presentation deck.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              onEdit={setEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
