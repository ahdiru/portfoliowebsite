import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabase';
import { 
  User, 
  Upload, 
  ImageIcon, 
  CheckCircle2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Maximize2, 
  Crop as CropIcon,
  Check,
  X,
  Type,
  Quote,
  Sparkles,
  Building2,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  FileText,
  Eye,
  Save,
  Trash2,
  ExternalLink,
  Download,
  Layers,
  Terminal
} from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  getProfileData, 
  saveProfileData, 
  resetProfileData, 
  deleteResumePermanently,
  DEFAULT_PROFILE 
} from '../../utils/profileData';

const VIEWPORT_SIZE = 300; // 300x300 px crop viewport

export default function ProfileSettings() {
  // Profile form state
  const [formData, setFormData] = useState(getProfileData);
  const [currentPhoto, setCurrentPhoto] = useState(() => getProfileData().photo);
  const [activeTab, setActiveTab] = useState('display'); // 'display' | 'photo'

  // Photo crop state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [uploading, setUploading] = useState(false);
  const [savingText, setSavingText] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // CV / Resume state
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDragOver, setCvDragOver] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const [cloudUrlInput, setCloudUrlInput] = useState('');
  const cvInputRef = useRef(null);

  // Hero Image state
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const heroImageInputRef = useRef(null);

  // Crop / Transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const viewportRef = useRef(null);

  useEffect(() => {
    const data = getProfileData();
    setFormData(data);
    setCurrentPhoto(data.photo);
    if (data.resumeUrl && !data.resumeUrl.startsWith('data:')) {
      setCloudUrlInput(data.resumeUrl);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clamped pan to prevent empty borders
  const getClampedPan = useCallback((candidatePan, currentZoom, naturalW, naturalH) => {
    if (!naturalW || !naturalH) return candidatePan;
    const scale0 = Math.max(VIEWPORT_SIZE / naturalW, VIEWPORT_SIZE / naturalH);
    const renderScale = scale0 * currentZoom;
    const rw = naturalW * renderScale;
    const rh = naturalH * renderScale;
    const maxPanX = Math.max(0, (rw - VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (rh - VIEWPORT_SIZE) / 2);

    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, candidatePan.x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, candidatePan.y)),
    };
  }, []);

  // When a file is selected
  const handleFileChange = (f) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      Swal.fire({
        title: 'Berkas Terlalu Besar',
        text: 'Ukuran foto maksimal adalah 8MB.',
        icon: 'warning',
        confirmButtonColor: '#1E3B2F'
      });
      return;
    }

    const objectUrl = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setFile(f);
      setPreview(objectUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      Swal.fire({
        title: 'Format Tidak Valid',
        text: 'Gagal memuat gambar. Silakan gunakan format JPG, PNG, atau WebP.',
        icon: 'error',
        confirmButtonColor: '#1E3B2F'
      });
    };
    img.src = objectUrl;
  };

  // Zoom handler with re-clamped pan
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.min(3, Math.max(1, newZoom));
    setZoom(clampedZoom);
    setPan((prevPan) => 
      getClampedPan(prevPan, clampedZoom, naturalDimensions.width, naturalDimensions.height)
    );
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (!preview) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoomChange(zoom + delta);
  };

  // Drag listeners
  const handleMouseDown = (e) => {
    if (!preview) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const candidatePan = {
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    };
    setPan(getClampedPan(candidatePan, zoom, naturalDimensions.width, naturalDimensions.height));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile/trackpad
  const handleTouchStart = (e) => {
    if (!preview || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    const candidatePan = {
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    };
    setPan(getClampedPan(candidatePan, zoom, naturalDimensions.width, naturalDimensions.height));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Compute rendered dimensions
  const scale0 = naturalDimensions.width && naturalDimensions.height
    ? Math.max(VIEWPORT_SIZE / naturalDimensions.width, VIEWPORT_SIZE / naturalDimensions.height)
    : 1;
  const renderScale = scale0 * zoom;
  const rw = naturalDimensions.width * renderScale;
  const rh = naturalDimensions.height * renderScale;
  const imgLeft = (VIEWPORT_SIZE - rw) / 2 + pan.x;
  const imgTop = (VIEWPORT_SIZE - rh) / 2 + pan.y;

  // Render crop to canvas & return high-res blob and fallback dataUrl
  const renderCroppedMedia = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const OUTPUT_SIZE = 800; // High-res 800x800 square
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering context not available'));
          return;
        }

        const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;
        const drawLeft = imgLeft * ratio;
        const drawTop = imgTop * ratio;
        const drawW = rw * ratio;
        const drawH = rh * ratio;

        // Clean white base
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, drawLeft, drawTop, drawW, drawH);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        canvas.toBlob(
          (blob) => {
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          0.90
        );
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk proses crop'));
      img.src = preview;
    });
  };

  // CV / Resume upload handler
  const handleCvFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;

    if (uploadedFile.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: 'Berkas Terlalu Besar',
        text: 'Ukuran berkas CV maksimal 10MB.',
        icon: 'warning',
        confirmButtonColor: '#1E3B2F'
      });
      return;
    }

    const validExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = uploadedFile.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      Swal.fire({
        title: 'Format Tidak Didukung',
        text: 'Harap unggah berkas dengan format PDF, DOC, atau DOCX.',
        icon: 'warning',
        confirmButtonColor: '#1E3B2F'
      });
      return;
    }

    setCvUploading(true);

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      let finalCvUrl = dataUrl;

      // Attempt Supabase storage upload if available
      try {
        const fileName = `cv-${Date.now()}-${uploadedFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('profile-images')
          .upload(fileName, uploadedFile, { upsert: true });

        if (!uploadErr) {
          const { data: publicData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            finalCvUrl = publicData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Storage bucket not accessible, using base64 dataUrl fallback');
      }

      const updated = {
        resumeUrl: finalCvUrl,
        resumeFileName: uploadedFile.name,
      };

      setFormData((prev) => ({
        ...prev,
        ...updated,
      }));

      saveProfileData(updated);

      Swal.fire({
        title: 'CV Berhasil Diunggah!',
        text: `Berkas "${uploadedFile.name}" telah aktif dan siap diunduh oleh pengunjung website.`,
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2200,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error processing CV file:', err);
      Swal.fire({
        title: 'Gagal Mengunggah CV',
        text: err.message || 'Terjadi kesalahan saat memproses berkas CV.',
        icon: 'error',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setCvUploading(false);
    }
  };

  // Save Cloud Link (Google Drive / Dropbox / Bit.ly)
  const handleSaveCloudUrl = (e) => {
    if (e) e.preventDefault();
    if (!cloudUrlInput.trim()) {
      Swal.fire({
        title: 'Tautan Kosong',
        text: 'Harap masukkan URL tautan cloud (Google Drive, Dropbox, atau Bitly).',
        icon: 'warning',
        confirmButtonColor: '#1E3B2F'
      });
      return;
    }

    let url = cloudUrlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let detectedName = 'Resume_Cloud_Document.pdf';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('drive.google.com')) {
        detectedName = 'Google_Drive_CV.pdf';
      } else if (urlObj.hostname.includes('dropbox.com')) {
        detectedName = 'Dropbox_CV.pdf';
      } else {
        detectedName = `${urlObj.hostname.replace('www.', '')}_CV.pdf`;
      }
    } catch (err) {}

    const updated = {
      resumeUrl: url,
      resumeFileName: detectedName,
    };

    setFormData((prev) => ({
      ...prev,
      ...updated,
    }));

    saveProfileData(updated);

    Swal.fire({
      title: 'Tautan Cloud Berhasil Diterapkan!',
      text: 'Tombol download di halaman About kini langsung terhubung ke tautan cloud Anda.',
      icon: 'success',
      confirmButtonColor: '#1E3B2F',
      timer: 2200,
      timerProgressBar: true
    });
  };

  // Permanently delete CV handler
  const handleDeleteCvPermanently = async () => {
    const result = await Swal.fire({
      title: 'Hapus CV Permanen?',
      text: 'Berkas CV akan dihapus secara permanen dari sistem dan tombol download di website utama tidak akan ditampilkan lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#B4442E',
      cancelButtonColor: '#7F8C6A'
    });

    if (result.isConfirmed) {
      deleteResumePermanently();
      setFormData((prev) => ({
        ...prev,
        resumeUrl: '',
        resumeFileName: '',
      }));
      setCloudUrlInput('');
      setShowCvPreview(false);

      Swal.fire({
        title: 'CV Berhasil Dihapus',
        text: 'Berkas CV telah dihapus permanen. Tombol download di website utama telah dinonaktifkan.',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2200,
        timerProgressBar: true
      });
    }
  };

  // Hero Custom Image Upload
  const handleHeroImageUpload = async (f) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      Swal.fire({
        title: 'Berkas Terlalu Besar',
        text: 'Ukuran gambar hero maksimal 8MB.',
        icon: 'warning',
        confirmButtonColor: '#1E3B2F'
      });
      return;
    }

    setHeroImageUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

      let finalUrl = dataUrl;
      try {
        const fileName = `hero-${Date.now()}-${f.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('profile-images')
          .upload(fileName, f, { upsert: true });

        if (!uploadErr) {
          const { data: publicData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);
          if (publicData?.publicUrl) finalUrl = publicData.publicUrl;
        }
      } catch (err) {}

      const updated = { heroImage: finalUrl };
      setFormData((prev) => ({ ...prev, ...updated }));
      saveProfileData(updated);

      Swal.fire({
        title: 'Gambar Hero Berhasil Diperbarui!',
        text: 'Gambar pada sisi kanan hero halaman depan telah aktif.',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        title: 'Gagal Mengunggah',
        text: err.message || 'Terjadi kesalahan saat memproses gambar hero.',
        icon: 'error',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setHeroImageUploading(false);
    }
  };

  const handleResetHeroImage = () => {
    const updated = { heroImage: '' };
    setFormData((prev) => ({ ...prev, ...updated }));
    saveProfileData(updated);
    Swal.fire({
      title: 'Kembali ke Bento Card',
      text: 'Visual sisi kanan hero dikembalikan ke tampilan interactive Bento Card.',
      icon: 'info',
      confirmButtonColor: '#1E3B2F',
      timer: 2000,
    });
  };

  // Save Text / Public Display Data
  const handleSaveTextData = async (e) => {
    if (e) e.preventDefault();
    setSavingText(true);

    try {
      saveProfileData(formData);

      Swal.fire({
        title: 'Data Profil Tersimpan!',
        text: 'Informasi publik (nama, caption, bio, quotes) langsung aktif di website Anda.',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error saving profile data:', err);
      Swal.fire({
        title: 'Gagal Menyimpan',
        text: 'Terjadi kesalahan saat menyimpan data profil.',
        icon: 'error',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setSavingText(false);
    }
  };

  // Save Cropped Photo
  const handleSavePhoto = async () => {
    if (!file || !preview) return;
    setUploading(true);

    try {
      const { blob: croppedBlob, dataUrl } = await renderCroppedMedia();
      let photoUrl = '';
      let savedToCloud = false;

      // Attempt upload to Supabase Storage
      try {
        const fileName = `avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, croppedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);

          if (data?.publicUrl) {
            photoUrl = data.publicUrl;
            savedToCloud = true;
          }
        }
      } catch (storageErr) {
        console.warn('Storage bucket upload not ready, using dataUrl fallback');
      }

      if (!photoUrl) {
        photoUrl = dataUrl;
      }

      // Update state and persistence
      saveProfileData({ photo: photoUrl });
      setCurrentPhoto(photoUrl);
      setFormData((prev) => ({ ...prev, photo: photoUrl }));
      setFile(null);
      setPreview(null);

      Swal.fire({
        title: 'Foto Berhasil Diperbarui!',
        text: savedToCloud 
          ? 'Posisi crop telah diproses dan foto tersimpan di cloud storage.' 
          : 'Posisi crop telah diproses dan foto profil baru langsung aktif di website Anda.',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2200,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error saving cropped profile photo:', error);
      Swal.fire({
        title: 'Gagal Menyimpan',
        text: error.message || 'Terjadi kesalahan saat memproses crop foto.',
        icon: 'error',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setUploading(false);
    }
  };

  // Reset entire profile to initial default CV
  const handleResetAll = async () => {
    const result = await Swal.fire({
      title: 'Reset ke Data Default?',
      text: 'Semua perubahan nama, caption, bio, quotes, dan foto akan dikembalikan ke data awal CV.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Kembalikan ke Default',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#B4442E',
      cancelButtonColor: '#7F8C6A'
    });

    if (result.isConfirmed) {
      resetProfileData();
      setFormData(DEFAULT_PROFILE);
      setCurrentPhoto(DEFAULT_PROFILE.photo);
      setPreview(null);
      setFile(null);

      Swal.fire({
        title: 'Reset Selesai',
        text: 'Data profil telah dikembalikan ke pengaturan default CV.',
        icon: 'info',
        confirmButtonColor: '#1E3B2F',
        timer: 2000
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl flex items-center justify-center text-[#1E3B2F] shadow-2xs">
            <User className="w-5 h-5 text-[#1E3B2F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3B2F] font-mono">
              Profile & Public Display
            </h1>
            <p className="text-[#5A6650] text-xs font-mono">
              Kelola foto profil, identitas publik, quotes, serta bio yang tampil pada website utama
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono text-[#B4442E] hover:bg-[#EDE7DA] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Default CV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8CFBE] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'display'
              ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
              : 'text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Informasi Publik (Teks & Quotes)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'photo'
              ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
              : 'text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]'
          }`}
        >
          <CropIcon className="w-3.5 h-3.5" />
          <span>Foto Profil & Framing Crop</span>
        </button>
      </div>

      {/* TAB 1: PUBLIC DISPLAY FORM */}
      {activeTab === 'display' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-[#D8CFBE] pb-4">
              <h2 className="text-base font-bold text-[#1E3B2F] font-mono">Informasi Identitas & Editorial</h2>
              <p className="text-xs text-[#5A6650] mt-0.5 font-mono">
                Ubah informasi ini untuk memperbarui bagian <strong>Header, About Me, dan Bento Card</strong> secara instan.
              </p>
            </div>

            <form onSubmit={handleSaveTextData} className="space-y-6">
              {/* SECTION: HERO KONTEN & GAMBAR (SESUAI SCREENSHOT) */}
              <div className="p-5 rounded-2xl bg-[#F5F0E6] border border-[#D8CFBE] space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8CFBE] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1E3B2F]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E3B2F]">
                      Hero Section (Halaman Depan Utama)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5A6650] bg-[#EDE7DA] px-2 py-0.5 rounded">
                    Home Page Top
                  </span>
                </div>

                {/* Headline Judul Utama */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold">
                    Headline Judul Utama
                  </label>
                  <textarea
                    rows={2}
                    name="heroHeadline"
                    value={formData.heroHeadline || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: Engineering end-to-end web platforms & data pipelines."
                    className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl p-3 text-[#1E3B2F] text-sm font-semibold outline-none focus:border-[#1E3B2F] transition-all"
                  />
                </div>

                {/* Deskripsi Hero / Tagline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold">
                    Deskripsi Hero / Tagline
                  </label>
                  <textarea
                    rows={3}
                    name="heroSubdescription"
                    value={formData.heroSubdescription || ''}
                    onChange={handleInputChange}
                    placeholder="Deskripsi keahlian pada pembuka halaman utama..."
                    className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl p-3 text-[#1E3B2F] text-xs font-mono leading-relaxed outline-none focus:border-[#1E3B2F] transition-all"
                  />
                </div>

                {/* Core Capabilities / Tech Stack Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold">
                    Core Capabilities / Tech Stack Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    name="heroTechStack"
                    value={formData.heroTechStack || ''}
                    onChange={handleInputChange}
                    placeholder="React.js, Python, PostgreSQL, Supabase, Tailwind CSS, Tableau, Vue.js, SQL"
                    className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl px-3.5 py-2 text-[#1E3B2F] text-xs font-mono outline-none focus:border-[#1E3B2F] transition-all"
                  />
                  {formData.heroTechStack && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.heroTechStack.split(',').map((tag, idx) => tag.trim() && (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#EDE7DA] border border-[#D8CFBE] text-[10px] font-mono text-[#1E3B2F]">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gambar Hero Sisi Kanan (Bento vs Custom Image) */}
                <div className="pt-2 border-t border-[#D8CFBE] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#1E3B2F] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#7F8C6A]" />
                      <span>Visual Sisi Kanan Hero (Bento Card vs Gambar Khusus)</span>
                    </span>
                    {formData.heroImage ? (
                      <span className="text-[10px] font-mono text-[#4F7A3A] bg-[#4F7A3A]/10 px-2 py-0.5 rounded font-semibold">
                        Gambar Khusus Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#1E3B2F] bg-[#EDE7DA] px-2 py-0.5 rounded font-semibold">
                        Interactive Bento Card
                      </span>
                    )}
                  </div>

                  {formData.heroImage ? (
                    <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D8CFBE] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EDE7DA] border border-[#D8CFBE] shrink-0">
                          <img src={formData.heroImage} alt="Hero" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-[#1E3B2F]">Gambar Hero Kustom</p>
                          <p className="text-[10px] text-[#5A6650] font-mono">Tampil di sisi kanan hero section</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => heroImageInputRef.current?.click()}
                          disabled={heroImageUploading}
                          className="px-3 py-1.5 rounded-lg border border-[#D8CFBE] text-xs font-mono text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                        >
                          Ganti Gambar
                        </button>
                        <button
                          type="button"
                          onClick={handleResetHeroImage}
                          className="px-3 py-1.5 rounded-lg border border-[#B4442E]/30 text-xs font-mono text-[#B4442E] hover:bg-[#B4442E]/10 transition-colors"
                        >
                          Gunakan Bento Card
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#FFFFFF] rounded-xl border border-[#D8CFBE]">
                      <div className="flex items-center gap-2.5">
                        <Terminal className="w-4 h-4 text-[#7F8C6A]" />
                        <span className="text-xs font-mono text-[#5A6650]">
                          Saat ini menggunakan interactive Bento Card (kode verified).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => heroImageInputRef.current?.click()}
                        disabled={heroImageUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3B2F] text-[#F5F0E6] text-xs font-mono hover:bg-[#2A5241] transition-colors shadow-2xs shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C8B48A]" />
                        <span>{heroImageUploading ? 'Mengunggah...' : 'Unggah Gambar Hero'}</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHeroImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* SECTION: IDENTITAS & ABOUT ME */}
              <div className="border-t border-[#D8CFBE] pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1E3B2F]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E3B2F]">
                    Identitas Publik & About Me
                  </span>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: Ahmad Jordan"
                    className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all font-medium"
                  />
                </div>

              {/* Caption / Headline Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Caption / Subtitle Utama
                </label>
                <input
                  type="text"
                  name="caption"
                  value={formData.caption || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Web Developer & Data Analyst • Bridging Systems & Intelligence"
                  className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all font-medium"
                />
              </div>

              {/* Role Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Afiliasi / Organisasi
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    value={formData.affiliation || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: TVRI Pusat Data Strategi"
                    className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Pendidikan / Akreditasi
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: BINUS CS (IPK 3.79 / 4.00)"
                    className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] transition-all"
                  />
                </div>
              </div>

              {/* Personal Quotes */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Quotes / Filosofi Profesional
                </label>
                <textarea
                  name="quote"
                  rows={2}
                  value={formData.quote || ''}
                  onChange={handleInputChange}
                  placeholder="Kutipan filosofi atau prinsip kerja Anda..."
                  className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl p-3.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] transition-all"
                />
              </div>

              {/* Bio Deskripsi Singkat */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Biografi Singkat (About Section)
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Deskripsi ringkas mengenai keahlian dan rekam jejak Anda..."
                  className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl p-3.5 text-[#1E3B2F] text-sm outline-none focus:border-[#1E3B2F] transition-all leading-relaxed"
                />
              </div>

              {/* Domisili / Lokasi */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  Domisili / Lokasi
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder="Jakarta, ID"
                  className="w-full bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl px-4 py-2 text-[#1E3B2F] text-xs font-mono outline-none focus:border-[#1E3B2F] transition-all"
                />
              </div>
            </div>

              {/* CV / Resume Management Section */}
              <div className="space-y-4 pt-4 border-t border-[#D8CFBE]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    Berkas Resume / CV (Tombol Download di Halaman About)
                  </label>
                  {formData.resumeUrl ? (
                    <span className="text-[11px] font-mono text-[#4F7A3A] bg-[#4F7A3A]/10 border border-[#4F7A3A]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> CV Aktif
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#B4442E] bg-[#B4442E]/10 border border-[#B4442E]/20 px-2.5 py-0.5 rounded-md font-semibold">
                      Belum Ada CV
                    </span>
                  )}
                </div>

                {formData.resumeUrl ? (
                  /* Active CV Card - Full Width, No Truncation */
                  <div className="p-5 rounded-2xl bg-[#EDE7DA] border border-[#D8CFBE] space-y-4 shadow-xs">
                    {/* File Header with Full Filename */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#D8CFBE] pb-3.5">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <FileText className="w-5 h-5 text-[#C8B48A]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-mono font-bold text-[#1E3B2F] break-all leading-snug">
                            {formData.resumeFileName || 'Ahmad_Jordan_CV.pdf'}
                          </p>
                          <p className="text-xs text-[#5A6650] font-mono break-all mt-1">
                            {formData.resumeUrl.startsWith('data:') 
                              ? 'Berkas Dokumen Terunggah (Data Stream / Siap Unduh Langsung)' 
                              : formData.resumeUrl}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-[11px] font-mono text-[#1E3B2F] bg-[#FFFFFF] border border-[#D8CFBE] px-2.5 py-1 rounded-lg self-start sm:self-auto font-medium shrink-0 shadow-2xs">
                        {formData.resumeUrl.startsWith('data:') ? '📄 Berkas Lokal' : '🔗 Tautan Cloud'}
                      </span>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowCvPreview(!showCvPreview)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all shadow-2xs ${
                            showCvPreview
                              ? 'bg-[#1E3B2F] text-[#F5F0E6]'
                              : 'bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] hover:bg-[#F5F0E6]'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#7F8C6A]" />
                          <span>{showCvPreview ? 'Tutup Pratinjau' : 'Pratinjau Dokumen'}</span>
                        </button>

                        <a
                          href={formData.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={formData.resumeFileName || "Ahmad_Jordan_CV.pdf"}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono font-medium text-[#1E3B2F] hover:bg-[#F5F0E6] transition-colors shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#7F8C6A]" />
                          <span>Buka / Unduh</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => cvInputRef.current?.click()}
                          disabled={cvUploading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono font-medium text-[#1E3B2F] hover:bg-[#F5F0E6] transition-colors shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#7F8C6A]" />
                          <span>Ganti Berkas</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteCvPermanently}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#B4442E]/30 bg-[#B4442E]/10 text-xs font-mono font-medium text-[#B4442E] hover:bg-[#B4442E] hover:text-[#FFFFFF] transition-colors shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus CV Permanen</span>
                      </button>
                    </div>

                    {/* Inline Document Preview Box */}
                    {showCvPreview && (
                      <div className="mt-3 p-3.5 bg-[#FFFFFF] rounded-xl border border-[#D8CFBE] shadow-xs space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-[#D8CFBE]">
                          <span className="text-xs font-mono font-bold text-[#1E3B2F] flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#7F8C6A]" />
                            <span>Pratinjau Isi Dokumen ({formData.resumeFileName || 'CV'})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCvPreview(false)}
                            className="text-xs font-mono text-[#5A6650] hover:text-[#1E3B2F]"
                          >
                            Tutup ✕
                          </button>
                        </div>

                        <div className="w-full h-[480px] rounded-lg overflow-hidden border border-[#D8CFBE] bg-[#F5F0E6]">
                          <iframe
                            src={
                              formData.resumeUrl.includes('drive.google.com/file/d/')
                                ? formData.resumeUrl.replace(/\/view.*$/, '/preview')
                                : formData.resumeUrl
                            }
                            className="w-full h-full"
                            title="Pratinjau Dokumen CV"
                          />
                        </div>

                        <p className="text-[11px] text-[#5A6650] font-mono text-center pt-1">
                          Jika pratinjau browser terhalang kebijakan keamanan file, klik{' '}
                          <a
                            href={formData.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E3B2F] underline font-semibold"
                          >
                            Buka di Tab Baru
                          </a>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upload CV Dropzone when no CV is active */
                  <label
                    onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
                    onDragLeave={() => setCvDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCvDragOver(false);
                      handleCvFileUpload(e.dataTransfer.files[0]);
                    }}
                    className={`flex flex-col items-center justify-center w-full p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      cvDragOver
                        ? 'border-[#1E3B2F] bg-[#EDE7DA]'
                        : 'border-[#D8CFBE] bg-[#F5F0E6] hover:border-[#1E3B2F] hover:bg-[#EDE7DA]/50'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center mx-auto text-[#1E3B2F]">
                        <FileText className="w-6 h-6 text-[#7F8C6A]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1E3B2F] font-mono">
                        {cvUploading ? 'Sedang memproses berkas CV...' : 'Klik atau Drag & Drop Berkas CV Baru (PDF / DOCX)'}
                      </p>
                      <p className="text-xs text-[#5A6650] font-mono">
                        Mendukung PDF, DOC, DOCX hingga 10MB. Berkas akan otomatis terhubung ke tombol download di About Me.
                      </p>
                    </div>
                  </label>
                )}

                {/* Hidden input for file picking */}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleCvFileUpload(e.target.files[0])}
                  className="hidden"
                />

                {/* Dukungan Tautan Cloud Alternatif (Always Visible & Accessible) */}
                <div className="p-4 bg-[#F5F0E6] rounded-2xl border border-[#D8CFBE] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#7F8C6A]" />
                      <span>Dukungan Tautan Cloud Alternatif (Google Drive, Dropbox, Bit.ly)</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A6650] font-mono leading-relaxed">
                    Jika CV Anda di-host di Google Drive atau penyimpanan cloud lain, tempelkan tautan publiknya di sini:
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="url"
                      value={cloudUrlInput}
                      onChange={(e) => setCloudUrlInput(e.target.value)}
                      placeholder="Contoh: https://drive.google.com/file/d/XYZ... atau https://bit.ly/..."
                      className="w-full sm:flex-1 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl px-4 py-2.5 text-[#1E3B2F] text-xs font-mono outline-none focus:border-[#1E3B2F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCloudUrl}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] text-xs font-mono font-medium hover:bg-[#2A5241] transition-colors shrink-0 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#C8B48A]" />
                      <span>Terapkan Tautan Cloud</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8CFBE] flex justify-end">
                <button
                  type="submit"
                  disabled={savingText}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] text-xs font-mono font-medium shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#C8B48A]" />
                  <span>{savingText ? 'Menyimpan...' : 'Simpan Perubahan Teks'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card Column */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#5A6650]">
              <Eye className="w-3.5 h-3.5 text-[#7F8C6A]" />
              <span>Pratinjau Live (Tampilan Publik)</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EDE7DA] border border-[#D8CFBE] shrink-0">
                  <img
                    src={currentPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E3B2F] text-base font-mono">
                    {formData.name || 'Ahmad Jordan'}
                  </h3>
                  <p className="text-xs text-[#5A6650] font-mono">
                    {formData.affiliation || 'TVRI Pusat Data Strategi'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#EDE7DA] text-[10px] font-mono text-[#1E3B2F]">
                    {formData.location || 'Jakarta, ID'}
                  </span>
                </div>
              </div>

              {/* Hero Live Preview Snippet */}
              <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-xs text-[#1E3B2F] space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold font-mono text-[#7F8C6A] text-[11px]">HERO PREVIEW:</p>
                  <span className="text-[10px] font-mono text-[#5A6650]">
                    {formData.heroImage ? '📷 Custom Image' : '💻 Bento Card'}
                  </span>
                </div>
                <p className="font-bold text-sm text-[#1E3B2F] leading-snug">
                  {formData.heroHeadline || 'Engineering end-to-end web platforms & data pipelines.'}
                </p>
                <p className="text-[11px] text-[#5A6650] line-clamp-2">
                  {formData.heroSubdescription || 'Versatile Web Developer & Data Analyst...'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-xs text-[#1E3B2F]">
                <p className="font-semibold font-mono text-[#7F8C6A] text-[11px] mb-1">CAPTION / HEADLINE:</p>
                <p>{formData.caption || 'Web Developer & Data Analyst'}</p>
              </div>

              {formData.quote && (
                <div className="border-l-2 border-[#7F8C6A] pl-3 py-1 italic text-xs text-[#5A6650]">
                  "{formData.quote}"
                </div>
              )}

              {formData.bio && (
                <div className="text-xs text-[#1E3B2F] leading-relaxed line-clamp-4">
                  {formData.bio}
                </div>
              )}

              <div className="pt-3 border-t border-[#D8CFBE] flex flex-wrap gap-2 text-[10px] font-mono text-[#5A6650]">
                <span className="px-2 py-1 bg-[#EDE7DA] rounded-md">
                  {formData.education || 'BINUS CS'}
                </span>
                <span className={`px-2 py-1 rounded-md font-semibold ${
                  formData.resumeUrl 
                    ? 'bg-[#4F7A3A]/15 text-[#4F7A3A]' 
                    : 'bg-[#B4442E]/10 text-[#B4442E]'
                }`}>
                  {formData.resumeUrl ? '✓ CV Siap Diunduh' : '✗ CV Tidak Tersedia'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTO & CROP SETTINGS */}
      {activeTab === 'photo' && (
        <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#1E3B2F] font-mono">Profile Photo & Framing Crop</h2>
            <p className="text-xs text-[#5A6650] mt-0.5">
              Sesuaikan posisi foto (*pan & zoom*) agar komposisi wajah berada tepat di tengah frame sebelum disimpan.
            </p>
          </div>

          {!preview ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Active Photo Card */}
              <div className="md:col-span-5 flex flex-col items-center p-6 bg-[#F5F0E6] border border-[#D8CFBE] rounded-2xl text-center space-y-4">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-[#FFFFFF] border-2 border-[#D8CFBE] shadow-sm">
                  <img
                    src={currentPhoto}
                    alt="Active Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-xs font-mono font-bold text-[#1E3B2F]">{formData.name || 'Ahmad Jordan'}</p>
                  <p className="text-[11px] text-[#5A6650] font-mono">{formData.affiliation || 'Web Developer & Data Analyst'}</p>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="md:col-span-7 space-y-4">
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                  className={`flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-[#1E3B2F] bg-[#EDE7DA]' 
                      : 'border-[#D8CFBE] bg-[#F5F0E6] hover:border-[#1E3B2F] hover:bg-[#EDE7DA]/50'
                  }`}
                >
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center mx-auto text-[#1E3B2F]">
                      <CropIcon className="w-6 h-6 text-[#7F8C6A]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1E3B2F]">
                      Pilih atau Drag & Drop foto baru di sini
                    </p>
                    <p className="text-xs text-[#5A6650] font-mono">
                      JPG, PNG, WEBP hingga 8MB. Anda dapat menggeser posisi & zoom setelah memilih berkas.
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Interactive Custom Cropper View */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#EDE7DA] border border-[#D8CFBE] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-[#1E3B2F]" />
                  <span className="text-xs font-mono font-medium text-[#1E3B2F]">
                    Klik & geser (drag) foto untuk mengubah posisi. Gunakan slider atau scroll mouse untuk zoom.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#5A6650] hover:text-[#1E3B2F] rounded-lg hover:bg-[#D8CFBE]/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal / Pilih Gambar Lain</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Viewport */}
                <div className="lg:col-span-6 flex flex-col items-center">
                  <div
                    ref={viewportRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                    style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
                    className={`relative overflow-hidden rounded-2xl bg-[#1E3B2F]/10 border-2 border-[#1E3B2F] shadow-md select-none touch-none ${
                      isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    <img
                      src={preview}
                      alt="Crop Subject"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        left: `${imgLeft}px`,
                        top: `${imgTop}px`,
                        width: `${rw}px`,
                        height: `${rh}px`,
                        maxWidth: 'none',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Rule of Thirds Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 hover:opacity-50 transition-opacity">
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div className="border-b border-[#FFFFFF]" />
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div className="border-b border-[#FFFFFF]" />
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div className="border-r border-b border-[#FFFFFF]" />
                      <div />
                    </div>

                    {/* Corner Target Accents */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C8B48A] pointer-events-none" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C8B48A] pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C8B48A] pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C8B48A] pointer-events-none" />

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#1E3B2F]/80 backdrop-blur-xs text-[#F5F0E6] text-[10px] font-mono pointer-events-none">
                      {Math.round(zoom * 100)}%
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5A6650] font-mono mt-2 flex items-center gap-1.5">
                    <Move className="w-3 h-3 text-[#7F8C6A]" />
                    <span>Drag & pan freely inside frame</span>
                  </p>
                </div>

                {/* Controls */}
                <div className="lg:col-span-6 space-y-6 bg-[#F5F0E6] p-6 rounded-2xl border border-[#D8CFBE]">
                  {/* Zoom Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-medium text-[#1E3B2F]">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-[#7F8C6A]" />
                        Zoom Level
                      </span>
                      <span className="text-[#5A6650]">{zoom.toFixed(2)}x</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleZoomChange(zoom - 0.1)}
                        className="p-1.5 rounded-lg border border-[#D8CFBE] bg-[#FFFFFF] text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                        className="flex-1 accent-[#1E3B2F] cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => handleZoomChange(zoom + 0.1)}
                        className="p-1.5 rounded-lg border border-[#D8CFBE] bg-[#FFFFFF] text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reset Center */}
                  <div className="pt-2 border-t border-[#D8CFBE] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8CFBE] bg-[#FFFFFF] text-xs font-mono text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#7F8C6A]" />
                      <span>Reset Center</span>
                    </button>
                  </div>

                  {/* Confirm Actions */}
                  <div className="pt-4 border-t border-[#D8CFBE] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="px-4 py-2.5 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] text-xs font-mono font-medium bg-[#FFFFFF] hover:bg-[#EDE7DA] transition-colors"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] text-xs font-mono font-medium shadow-sm transition-all disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 text-[#C8B48A]" />
                      )}
                      <span>{uploading ? 'Memproses & Menyimpan...' : 'Terapkan & Simpan Foto'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
