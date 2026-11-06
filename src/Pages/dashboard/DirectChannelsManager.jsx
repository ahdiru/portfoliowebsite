import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  RotateCcw, 
  Share2, 
  Check, 
  X, 
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";
import Swal from "sweetalert2";
import { 
  getDirectChannels, 
  saveDirectChannels, 
  resetDirectChannels, 
  CHANNEL_ICON_MAP, 
  PRESET_CHANNELS 
} from "../../utils/directChannelsData";

export default function DirectChannelsManager() {
  const [channels, setChannels] = useState(getDirectChannels);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    subText: "",
    icon: "Globe",
    url: "",
    isPrimary: false,
    isEnabled: true
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      displayName: "",
      subText: "",
      icon: "Globe",
      url: "",
      isPrimary: false,
      isEnabled: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      displayName: item.displayName || item.name || "",
      subText: item.subText || "",
      icon: item.icon || "Globe",
      url: item.url || "",
      isPrimary: Boolean(item.isPrimary),
      isEnabled: item.isEnabled !== false
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSelectPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      displayName: preset.displayName,
      subText: preset.subText,
      icon: preset.icon,
      url: preset.url || prev.url
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.displayName.trim() || !form.url.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Nama tampilan dan URL channel wajib diisi.",
        confirmButtonColor: "#1E3B2F"
      });
      return;
    }

    let updatedList = [...channels];

    if (editingId) {
      // Edit mode
      updatedList = updatedList.map((ch) => {
        if (ch.id === editingId) {
          return {
            ...ch,
            name: form.name.trim() || form.displayName.trim(),
            displayName: form.displayName.trim(),
            subText: form.subText.trim(),
            icon: form.icon,
            url: form.url.trim(),
            isPrimary: form.isPrimary,
            isEnabled: form.isEnabled
          };
        }
        // If this one is set as primary, unmark others
        if (form.isPrimary) {
          return { ...ch, isPrimary: false };
        }
        return ch;
      });
    } else {
      // Create mode
      const newId = `channel_${Date.now()}`;
      if (form.isPrimary) {
        updatedList = updatedList.map((ch) => ({ ...ch, isPrimary: false }));
      }
      updatedList.push({
        id: newId,
        name: form.name.trim() || form.displayName.trim(),
        displayName: form.displayName.trim(),
        subText: form.subText.trim(),
        icon: form.icon,
        url: form.url.trim(),
        isPrimary: form.isPrimary,
        isEnabled: form.isEnabled
      });
    }

    // Ensure at least one primary channel exists
    if (!updatedList.some((ch) => ch.isPrimary) && updatedList.length > 0) {
      updatedList[0].isPrimary = true;
    }

    setChannels(updatedList);
    saveDirectChannels(updatedList);
    closeModal();

    Swal.fire({
      icon: "success",
      title: editingId ? "Perubahan Disimpan" : "Channel Ditambahkan",
      text: "Perubahan Direct Channels langsung aktif di halaman kontak publik.",
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleDelete = (channel) => {
    Swal.fire({
      title: `Hapus "${channel.displayName || channel.name}"?`,
      text: "Channel ini akan dihapus dari daftar kontak publik.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#B4442E",
      cancelButtonColor: "#5A6650",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        let updatedList = channels.filter((ch) => ch.id !== channel.id);
        if (channel.isPrimary && updatedList.length > 0) {
          updatedList[0].isPrimary = true;
        }
        setChannels(updatedList);
        saveDirectChannels(updatedList);
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          text: "Channel berhasil dihapus.",
          timer: 1400,
          showConfirmButton: false
        });
      }
    });
  };

  const handleToggleActive = (id) => {
    const updated = channels.map((ch) => 
      ch.id === id ? { ...ch, isEnabled: ch.isEnabled === false ? true : false } : ch
    );
    setChannels(updated);
    saveDirectChannels(updated);
  };

  const handleSetPrimary = (id) => {
    const updated = channels.map((ch) => ({
      ...ch,
      isPrimary: ch.id === id
    }));
    setChannels(updated);
    saveDirectChannels(updated);
    Swal.fire({
      icon: "success",
      title: "Primary Channel Diperbarui",
      text: "Channel ini akan disorot sebagai kartu utama pada bagian kontak.",
      timer: 1400,
      showConfirmButton: false
    });
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= channels.length) return;
    const updated = [...channels];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setChannels(updated);
    saveDirectChannels(updated);
  };

  const handleReset = () => {
    Swal.fire({
      title: "Reset ke Bawaan?",
      text: "Daftar Direct Channels akan dikembalikan ke konfigurasi standar (LinkedIn, Email, WhatsApp, Portfolio).",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E3B2F",
      cancelButtonColor: "#5A6650",
      confirmButtonText: "Ya, Reset",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        const defaults = resetDirectChannels();
        setChannels(defaults);
        Swal.fire({
          icon: "success",
          title: "Direset",
          text: "Direct Channels telah dikembalikan ke bawaan.",
          timer: 1400,
          showConfirmButton: false
        });
      }
    });
  };

  const PreviewIcon = CHANNEL_ICON_MAP[form.icon] || Globe;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7F8C6A] inline-block" />
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#5A6650]">
                Contact & Social Hub
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3B2F] font-mono tracking-tight">
              Direct Channels Manager
            </h1>
            <p className="text-sm text-[#5A6650] max-w-2xl">
              Atur tautan komunikasi langsung (LinkedIn, WhatsApp, Email, GitHub, dsb.) yang tampil pada seksi Contact di website publik secara instan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#D8CFBE] text-xs font-mono font-medium text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-all"
              title="Reset ke pengaturan awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#7F8C6A]" />
              <span>Reset</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3B2F] text-xs font-mono font-semibold text-[#F5F0E6] hover:bg-[#2A5241] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C8B48A]" />
              <span>Tambah Channel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-3">
        {channels.map((channel, idx) => {
          const IconComp = CHANNEL_ICON_MAP[channel.icon] || Globe;
          const isEnabled = channel.isEnabled !== false;

          return (
            <div
              key={channel.id || idx}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                channel.isPrimary
                  ? "bg-[#FFFFFF] border-[#1E3B2F] ring-1 ring-[#1E3B2F]/20 shadow-xs"
                  : isEnabled
                  ? "bg-[#FFFFFF] border-[#D8CFBE] shadow-2xs hover:border-[#7F8C6A]"
                  : "bg-[#F5F0E6]/60 border-[#D8CFBE] opacity-60"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  channel.isPrimary
                    ? "bg-[#1E3B2F] text-[#F5F0E6] border-[#1E3B2F]"
                    : "bg-[#F5F0E6] text-[#1E3B2F] border-[#D8CFBE]"
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-[#1E3B2F] font-mono">
                      {channel.displayName || channel.name}
                    </span>
                    {channel.isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#1E3B2F] text-[#F5F0E6] px-2 py-0.5 rounded-full font-semibold">
                        <Star className="w-3 h-3 text-[#C8B48A] fill-[#C8B48A]" />
                        Primary Card
                      </span>
                    )}
                    {!isEnabled && (
                      <span className="text-[10px] font-mono uppercase bg-[#EDE7DA] text-[#5A6650] px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#5A6650] flex-wrap">
                    <span>{channel.subText || channel.url}</span>
                    <span className="w-1 h-1 rounded-full bg-[#7F8C6A]" />
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7F8C6A] hover:text-[#1E3B2F] inline-flex items-center gap-1 underline underline-offset-2"
                    >
                      <span className="truncate max-w-[220px]">{channel.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* Reorder */}
                <button
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  className="p-2 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Pindah ke atas"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === channels.length - 1}
                  className="p-2 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Pindah ke bawah"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Primary Button */}
                {!channel.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(channel.id)}
                    className="p-2 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-all"
                    title="Jadikan Kartu Utama (Primary)"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleActive(channel.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isEnabled
                      ? "border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
                      : "border-[#D8CFBE] text-[#B4442E] bg-[#EDE7DA]"
                  }`}
                  title={isEnabled ? "Sembunyikan dari web" : "Tampilkan di web"}
                >
                  {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(channel)}
                  className="p-2 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-all"
                  title="Ubah data channel"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(channel)}
                  className="p-2 rounded-lg border border-[#D8CFBE] text-[#B4442E] hover:bg-[#B4442E]/10 transition-all"
                  title="Hapus permanen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-xl max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8CFBE]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#1E3B2F] text-[#F5F0E6]">
                  <Share2 className="w-4 h-4 text-[#C8B48A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E3B2F] font-mono">
                    {editingId ? "Ubah Direct Channel" : "Tambah Direct Channel"}
                  </h3>
                  <p className="text-xs text-[#5A6650]">
                    Pilih preset atau masukkan link kustom kontak Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#1E3B2F] uppercase tracking-wide">
                Pilih Preset Cepat
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_CHANNELS.map((preset) => {
                  const PresIcon = CHANNEL_ICON_MAP[preset.icon] || Globe;
                  const isSelected = form.name.toLowerCase() === preset.name.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                        isSelected
                          ? "bg-[#1E3B2F] text-[#F5F0E6] border-[#1E3B2F] shadow-2xs"
                          : "bg-[#F5F0E6] text-[#5A6650] border-[#D8CFBE] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
                      }`}
                    >
                      <PresIcon className="w-3.5 h-3.5" />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#1E3B2F] uppercase">
                    Nama Tampilan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LinkedIn / WhatsApp"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-sm text-[#1E3B2F] focus:outline-none focus:border-[#1E3B2F]"
                  />
                </div>

                {/* Subtext */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#1E3B2F] uppercase">
                    Subteks / Handle
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: @ahmadjordan / +62..."
                    value={form.subText}
                    onChange={(e) => setForm({ ...form, subText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-sm text-[#1E3B2F] focus:outline-none focus:border-[#1E3B2F]"
                  />
                </div>
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#1E3B2F] uppercase">
                  Tautan Link (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... atau mailto:... atau https://wa.me/..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-sm text-[#1E3B2F] font-mono focus:outline-none focus:border-[#1E3B2F]"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#1E3B2F] uppercase">
                  Pilih Ikon Lucide
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {Object.keys(CHANNEL_ICON_MAP).map((iconKey) => {
                    const CurIcon = CHANNEL_ICON_MAP[iconKey];
                    const active = form.icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setForm({ ...form, icon: iconKey })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          active
                            ? "bg-[#1E3B2F] text-[#F5F0E6] border-[#1E3B2F] shadow-2xs"
                            : "bg-[#F5F0E6] text-[#5A6650] border-[#D8CFBE] hover:bg-[#EDE7DA] hover:text-[#1E3B2F]"
                        }`}
                        title={iconKey}
                      >
                        <CurIcon className="w-4 h-4" />
                        <span className="text-[10px] font-mono truncate max-w-full">
                          {iconKey}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 border-t border-[#D8CFBE] space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1E3B2F] accent-[#1E3B2F]"
                  />
                  <div>
                    <p className="text-xs font-mono font-bold text-[#1E3B2F]">
                      Jadikan Kartu Utama (Primary)
                    </p>
                    <p className="text-[11px] text-[#5A6650]">
                      Akan ditampilkan sebagai kartu utama berukuran penuh di atas grid kontak.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1E3B2F] accent-[#1E3B2F]"
                  />
                  <div>
                    <p className="text-xs font-mono font-bold text-[#1E3B2F]">
                      Aktifkan di Website Publik
                    </p>
                    <p className="text-[11px] text-[#5A6650]">
                      Tampilkan tautan ini pada seksi Contact pengunjung.
                    </p>
                  </div>
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2 border-t border-[#D8CFBE] space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A6650]">
                  Live Preview
                </label>
                <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] shrink-0">
                      <PreviewIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#1E3B2F] truncate">
                        {form.displayName || "Nama Channel"}
                      </span>
                      <span className="text-[11px] text-[#5A6650] font-mono truncate">
                        {form.subText || form.url || "handle / tautan"}
                      </span>
                    </div>
                  </div>
                  {form.isPrimary && (
                    <span className="text-[9px] font-mono uppercase bg-[#1E3B2F] text-[#F5F0E6] px-2 py-0.5 rounded-full shrink-0 font-semibold">
                      Primary
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8CFBE]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-[#D8CFBE] text-xs font-mono font-medium text-[#5A6650] hover:bg-[#EDE7DA] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3B2F] text-xs font-mono font-semibold text-[#F5F0E6] hover:bg-[#2A5241] transition-all shadow-xs"
                >
                  <Check className="w-4 h-4 text-[#C8B48A]" />
                  <span>{editingId ? "Simpan Perubahan" : "Tambahkan Channel"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
