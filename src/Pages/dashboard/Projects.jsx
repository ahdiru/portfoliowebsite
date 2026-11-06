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
} from "lucide-react";

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

const ProjectCard = ({ project, onDelete, onEdit }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Card>
      <div className="p-4 flex flex-col h-full">
        {project.Img && (
          <div className="w-full aspect-[16/8] rounded-xl mb-3 border border-[#D8CFBE]/60 overflow-hidden bg-[#EDE7DA]">
            {!imgLoaded && (
              <div className="w-full h-full animate-pulse bg-[#EDE7DA]" />
            )}
            <img
              src={project.Img}
              alt={project.Title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            />
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
          <div className="flex flex-wrap gap-1.5 mb-4">
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
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-[#D8CFBE]">
          <div className="flex gap-1.5">
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
        {/* Fixed header */}
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
        {/* Scrollable content */}
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
  const [form, setForm] = useState({
    Title: initial?.Title || "",
    Description: initial?.Description || "",
    TechStack: Array.isArray(initial?.TechStack)
      ? initial.TechStack.join(", ")
      : initial?.TechStack || "",
    Features: Array.isArray(initial?.Features)
      ? initial.Features.join(", ")
      : initial?.Features || "",
    Link: initial?.Link || "",
    Github: initial?.Github || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.Img || null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, file);
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Project Title"
            value={form.Title}
            onChange={set("Title")}
            placeholder="e.g. Employee KPI Dashboard"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">
            Description
          </label>
          <textarea
            value={form.Description}
            onChange={set("Description")}
            placeholder="Describe the platform architecture, data flow, and key impact..."
            rows={3}
            className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all resize-none"
          />
        </div>

        <InputField
          label="Tech Stack (comma separated)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="e.g. React.js, Tailwind CSS, Supabase"
        />
        <InputField
          label="Key Features (comma separated)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="e.g. Realtime KPI, DPR Reporting, Geospatial"
        />
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
          placeholder="https://github.com/username/repo"
        />

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">
            Project Cover Image
          </label>
          <label className="flex items-center gap-4 w-full bg-[#F5F0E6] border border-dashed border-[#D8CFBE] rounded-xl px-4 py-4 cursor-pointer hover:border-[#1E3B2F] hover:bg-[#EDE7DA] transition-all">
            {preview ? (
              <img
                src={preview}
                className="h-16 w-24 object-cover rounded-lg border border-[#D8CFBE]"
                alt="preview"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-[#EDE7DA] flex items-center justify-center border border-[#D8CFBE]">
                <ImageIcon className="w-5 h-5 text-[#7F8C6A]" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#1E3B2F]">
                {preview ? "Change cover image" : "Click to upload project cover"}
              </p>
              <p className="text-xs text-[#5A6650] mt-0.5 font-mono">
                PNG, JPG, WEBP supported
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#D8CFBE]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] text-sm font-mono transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={uploading} 
          className="flex items-center gap-2 px-5 py-2 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-sm transition-all shadow-xs disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-[#C8B48A]" />
          )}
          <span>{uploading ? "Saving..." : submitLabel}</span>
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

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const uploadImage = async (f) => {
    const fileName = `${Date.now()}-${f.name}`;
    await supabase.storage.from("project-images").upload(fileName, f);
    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreate = async (form, file) => {
    setUploading(true);
    let imgUrl = "";
    if (file) imgUrl = await uploadImage(file);
    await supabase.from("projects").insert({
      Title: form.Title,
      Description: form.Description,
      Img: imgUrl,
      TechStack: form.TechStack.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      Features: form.Features.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      Link: form.Link,
      Github: form.Github,
    });
    setShowCreate(false);
    setUploading(false);
    fetchProjects();
  };

  const handleEdit = async (form, file) => {
    setUploading(true);
    let imgUrl = editProject.Img || "";
    if (file) imgUrl = await uploadImage(file);
    await supabase
      .from("projects")
      .update({
        Title: form.Title,
        Description: form.Description,
        Img: imgUrl,
        TechStack: form.TechStack.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Features: form.Features.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Link: form.Link,
        Github: form.Github,
      })
      .eq("id", editProject.id);
    setEditProject(null);
    setUploading(false);
    fetchProjects();
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
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
            <p className="text-[#5A6650] text-xs mt-1">Click the "New Project" button above to publish your first showcase.</p>
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
