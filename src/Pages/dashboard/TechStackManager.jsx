import React, { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  RotateCcw, 
  Code2, 
  Check, 
  X, 
  Upload, 
  ImageIcon, 
  Layers,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import Swal from "sweetalert2";
import { 
  getTechStacks, 
  saveTechStacks, 
  resetTechStacks, 
  normalizeIconPath,
  PRESET_TECH_ICONS, 
  DEFAULT_TECH_STACKS 
} from "../../utils/techStackData";
import TechStackIcon from "../../components/TechStackIcon";

export default function TechStackManager() {
  const [techStacks, setTechStacks] = useState(getTechStacks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ language: "", icon: "" });
  const [iconUploading, setIconUploading] = useState(false);
  const fileInputRef = useRef(null);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ language: "", icon: "" });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id || item.language);
    setForm({ language: item.language, icon: item.icon });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ language: "", icon: "" });
  };

  const handleSelectPreset = (preset) => {
    setForm({
      language: preset.name,
      icon: preset.icon,
    });
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: "Berkas Terlalu Besar",
        text: "Ikon maksimal berukuran 2MB.",
        icon: "warning",
        confirmButtonColor: "#1E3B2F",
      });
      return;
    }

    setIconUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        icon: reader.result,
      }));
      setIconUploading(false);
    };
    reader.onerror = () => {
      setIconUploading(false);
      Swal.fire({
        title: "Gagal Membaca Berkas",
        text: "Terjadi kesalahan saat membaca file ikon.",
        icon: "error",
        confirmButtonColor: "#1E3B2F",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.language.trim() || !form.icon.trim()) {
      Swal.fire({
        title: "Data Belum Lengkap",
        text: "Harap isi nama teknologi dan pilih/unggah ikon.",
        icon: "warning",
        confirmButtonColor: "#1E3B2F",
      });
      return;
    }

    let updatedList;
    if (editingId) {
      updatedList = techStacks.map((item) =>
        (item.id === editingId || item.language === editingId)
          ? { ...item, language: form.language.trim(), icon: form.icon.trim() }
          : item
      );
    } else {
      const newItem = {
        id: `tech-${Date.now()}`,
        language: form.language.trim(),
        icon: form.icon.trim(),
      };
      updatedList = [...techStacks, newItem];
    }

    saveTechStacks(updatedList);
    setTechStacks(updatedList);
    closeModal();

    Swal.fire({
      title: editingId ? "Tech Stack Diperbarui!" : "Tech Stack Ditambahkan!",
      text: `Teknologi "${form.language}" kini aktif pada Showcase Portofolio.`,
      icon: "success",
      confirmButtonColor: "#1E3B2F",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: `Hapus "${item.language}"?`,
      text: "Teknologi ini akan dihapus dari daftar Tech Stack portofolio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#B4442E",
      cancelButtonColor: "#7F8C6A",
    });

    if (result.isConfirmed) {
      const updatedList = techStacks.filter(
        (t) => (t.id ? t.id !== item.id : t.language !== item.language)
      );
      saveTechStacks(updatedList);
      setTechStacks(updatedList);

      Swal.fire({
        title: "Dihapus!",
        text: `"${item.language}" telah dihapus.`,
        icon: "success",
        confirmButtonColor: "#1E3B2F",
        timer: 1800,
      });
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Kembalikan ke Default CV?",
      text: "Daftar Tech Stack akan di-reset ke 12 keahlian teknologi awal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Reset Default",
      cancelButtonText: "Batal",
      confirmButtonColor: "#B4442E",
      cancelButtonColor: "#7F8C6A",
    });

    if (result.isConfirmed) {
      const resetList = resetTechStacks();
      setTechStacks(resetList);

      Swal.fire({
        title: "Reset Berhasil",
        text: "Daftar Tech Stack telah dikembalikan ke default CV.",
        icon: "info",
        confirmButtonColor: "#1E3B2F",
        timer: 2000,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl flex items-center justify-center text-[#1E3B2F] shadow-2xs">
            <Code2 className="w-5 h-5 text-[#1E3B2F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3B2F] font-mono">
              Tech Stack Manager
            </h1>
            <p className="text-[#5A6650] text-xs font-mono">
              Kelola daftar bahasa, framework, dan tools yang tampil pada Showcase Portofolio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono text-[#5A6650] hover:text-[#B4442E] hover:bg-[#EDE7DA] transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] text-xs font-mono font-medium hover:bg-[#2A5241] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C8B48A]" />
            <span>Tambah Tech Stack</span>
          </button>
        </div>
      </div>

      {/* Grid of Tech Stacks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {techStacks.map((item, index) => (
          <div
            key={item.id || index}
            className="group relative p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8CFBE] hover:border-[#7F8C6A] hover:bg-[#EDE7DA]/30 transition-all flex flex-col items-center justify-center gap-3 shadow-2xs hover:shadow-xs"
          >
            {/* Action Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                title="Edit"
              >
                <Pencil className="w-3 h-3 text-[#7F8C6A]" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#B4442E] hover:bg-[#B4442E]/10 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={item.icon}
                alt={item.language}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "code.svg";
                }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#1E3B2F] text-center truncate w-full">
              {item.language}
            </span>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH / EDIT TECH STACK */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8CFBE] pb-3.5">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#1E3B2F]" />
                <h2 className="text-base font-bold font-mono text-[#1E3B2F]">
                  {editingId ? "Edit Tech Stack" : "Tambah Tech Stack Baru"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Teknologi */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold">
                  Nama Teknologi / Bahasa / Framework
                </label>
                <input
                  type="text"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  placeholder="Contoh: Python, Docker, Next.js, Tableau"
                  required
                  className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-sm font-medium outline-none focus:border-[#1E3B2F] transition-all"
                />
              </div>

              {/* Preset Icon Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Pilih Dari Preset Populer (1-Klik Isi)
                  </label>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE]">
                  {PRESET_TECH_ICONS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-mono transition-all border ${
                        form.language.toLowerCase() === preset.name.toLowerCase()
                          ? "bg-[#1E3B2F] text-[#F5F0E6] border-[#1E3B2F]"
                          : "bg-[#FFFFFF] text-[#1E3B2F] border-[#D8CFBE] hover:bg-[#EDE7DA]"
                      }`}
                    >
                      <img src={preset.icon} alt={preset.name} className="w-6 h-6 object-contain" />
                      <span className="truncate w-full text-center">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Icon URL / Upload */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Atau Masukkan URL Ikon / Unggah File Sendiri
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="URL gambar ikon (SVG, PNG) atau pilih preset di atas..."
                    className="flex-1 bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2 text-[#1E3B2F] text-xs font-mono outline-none focus:border-[#1E3B2F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={iconUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    <span>{iconUploading ? "Memproses..." : "Upload File"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              {form.language && form.icon && (
                <div className="p-4 rounded-xl bg-[#EDE7DA] border border-[#D8CFBE] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#FFFFFF] border border-[#D8CFBE] p-2 flex items-center justify-center shrink-0">
                    <img src={form.icon} alt={form.language} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#5A6650] uppercase">Pratinjau Kartu:</span>
                    <p className="text-sm font-bold font-mono text-[#1E3B2F]">{form.language}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8CFBE]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-[#D8CFBE] text-xs font-mono text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] text-xs font-mono font-medium shadow-sm transition-all"
                >
                  <Check className="w-4 h-4 text-[#C8B48A]" />
                  <span>{editingId ? "Simpan Perubahan" : "Tambahkan ke Portofolio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
