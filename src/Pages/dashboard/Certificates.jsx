import { useEffect, useState } from 'react';
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, ImageIcon, Plus, FileText, ExternalLink, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { isPdfUrl } from '../../components/Certificate';

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs overflow-hidden ${className}`}>
    {children}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl overflow-hidden p-2 shadow-xs">
    <div className="w-full aspect-[16/11.5] bg-[#EDE7DA] animate-pulse rounded-xl" />
  </div>
);

const CertCard = ({ cert, onDelete }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isPdf = isPdfUrl(cert.Img);

  return (
    <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl overflow-hidden shadow-xs hover:border-[#7F8C6A] hover:shadow-md transition-all group relative flex flex-col">
      {isPdf ? (
        /* PDF Thumbnail */
        <div className="w-full aspect-[16/11.5] bg-[#F5F0E6] flex flex-col items-center justify-center p-4 relative group-hover:bg-[#EDE7DA] transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center shadow-xs mb-2">
            <FileText className="w-6 h-6 text-[#C8B48A]" />
          </div>
          <span className="text-xs font-mono font-bold text-[#1E3B2F] uppercase tracking-wider text-center">
            PDF Document
          </span>
          <span className="text-[10px] text-[#5A6650] font-mono mt-0.5 truncate max-w-full px-2 text-center">
            {cert.Img.split('/').pop().slice(0, 24)}...
          </span>

          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#1E3B2F] text-[#F5F0E6] text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs">
            <Award className="w-2.5 h-2.5 text-[#C8B48A]" />
            <span>PDF</span>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-[#1E3B2F]/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 gap-2">
            <a
              href={cert.Img}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] text-[#1E3B2F] hover:bg-[#EDE7DA] text-xs font-mono font-semibold w-full justify-center transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7F8C6A]" /> Buka PDF
            </a>
            <button
              onClick={() => onDelete(cert.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B4442E] text-white hover:bg-[#963724] text-xs font-mono font-semibold w-full justify-center transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
        </div>
      ) : (
        /* Image Thumbnail */
        <div className="relative w-full aspect-[16/11.5] overflow-hidden">
          {!imgLoaded && (
            <div className="w-full aspect-[16/11.5] bg-[#EDE7DA] animate-pulse" />
          )}
          <img
            src={cert.Img}
            alt="Certificate"
            onLoad={() => setImgLoaded(true)}
            className={`w-full aspect-[16/11.5] object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'block' : 'hidden'}`}
          />
          {imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <button
                onClick={() => onDelete(cert.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] text-[#B4442E] hover:bg-[#B4442E] hover:text-white border border-[#B4442E]/30 text-xs font-mono font-medium w-full justify-center transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Sertifikat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase fetch error, fallback to local storage if available:', error);
      }
      setCerts(data || []);
    } catch (e) {
      console.error(e);
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const isFilePdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    setIsPdf(isFilePdf);
    if (!isFilePdf) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const uploadCertificate = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `cert-${Date.now()}-${sanitizedName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificate-images')
        .upload(fileName, file, {
          contentType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          upsert: true
        });

      let publicUrl = '';

      if (uploadError) {
        console.warn('Storage upload error, attempting base64 fallback:', uploadError);
        // Fallback: convert to base64 data URI if bucket issue
        const reader = new FileReader();
        publicUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      } else {
        const { data: urlData } = supabase.storage.from('certificate-images').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('certificates').insert({ Img: publicUrl });

      if (insertError) {
        throw insertError;
      }

      Swal.fire({
        icon: 'success',
        title: 'Sertifikat Berhasil Diunggah!',
        text: isPdf ? 'Dokumen PDF sertifikat telah dipublikasikan.' : 'Foto sertifikat telah dipublikasikan.',
        confirmButtonColor: '#1E3B2F',
        timer: 1800
      });

      setFile(null); 
      setPreview(null);
      setIsPdf(false);
      fetchCerts();
    } catch (err) {
      console.error('Upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah',
        text: err.message || 'Terjadi kesalahan saat mengunggah berkas sertifikat.',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteCert = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus sertifikat ini?',
      text: 'Berkas sertifikat akan dihapus permanen dari portofolio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B4442E',
      cancelButtonColor: '#5A6650',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (!error) {
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Sertifikat berhasil dihapus.',
          timer: 1400,
          showConfirmButton: false
        });
        fetchCerts();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: error.message,
          confirmButtonColor: '#1E3B2F'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl flex items-center justify-center text-[#1E3B2F] shadow-2xs">
          <Award className="w-5 h-5 text-[#1E3B2F]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3B2F] font-mono">Certificates</h1>
          <p className="text-[#5A6650] text-xs font-mono">
            {loading ? 'Memuat data...' : `${certs.length} sertifikat (Gambar & Dokumen PDF) tervalidasi`}
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <Card>
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#1E3B2F] font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#7F8C6A]" /> Unggah Sertifikat Baru (Gambar atau Dokumen PDF)
          </h2>

          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            className={`flex flex-col items-center justify-center w-full min-h-[160px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver ? 'border-[#1E3B2F] bg-[#EDE7DA]' : 'border-[#D8CFBE] bg-[#F5F0E6] hover:border-[#1E3B2F] hover:bg-[#EDE7DA]/50'
            }`}
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-40 object-contain rounded-lg p-2" />
            ) : isPdf && file ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center shadow-xs mb-2">
                  <FileText className="w-6 h-6 text-[#C8B48A]" />
                </div>
                <p className="text-sm font-bold text-[#1E3B2F] font-mono">{file.name}</p>
                <p className="text-xs text-[#5A6650] font-mono mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Dokumen PDF Terdeteksi
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-10 h-10 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center mx-auto text-[#1E3B2F]">
                  <Upload className="w-5 h-5 text-[#7F8C6A]" />
                </div>
                <p className="text-sm font-medium text-[#1E3B2F]">Tarik & lepas atau klik untuk memilih berkas</p>
                <p className="text-xs text-[#5A6650] font-mono">Mendukung berkas Gambar (PNG, JPG, WEBP) & Dokumen PDF</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*,application/pdf,.pdf" 
              onChange={e => handleFile(e.target.files[0])} 
              className="hidden" 
            />
          </label>

          {file && (
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#D8CFBE]">
              <div className="flex items-center gap-2 min-w-0">
                {isPdf ? <FileText className="w-4 h-4 text-[#7F8C6A] shrink-0" /> : <ImageIcon className="w-4 h-4 text-[#7F8C6A] shrink-0" />}
                <p className="text-xs font-mono text-[#5A6650] truncate">{file.name}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => { setFile(null); setPreview(null); setIsPdf(false); }}
                  className="px-3 py-1.5 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] text-xs font-mono transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={uploadCertificate} 
                  disabled={uploading} 
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-xs font-mono transition-all shadow-xs disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C8B48A]" />
                  )}
                  <span>{uploading ? 'Mengunggah...' : (isPdf ? 'Publikasikan Sertifikat PDF' : 'Publikasikan Sertifikat')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <Award className="w-10 h-10 text-[#7F8C6A] mx-auto mb-3 opacity-60" />
            <p className="text-[#1E3B2F] font-semibold text-sm">Belum ada sertifikat yang diunggah.</p>
            <p className="text-[#5A6650] text-xs mt-1">Unggah berkas sertifikat (gambar atau PDF) melalui form di atas.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {certs.map(cert => (
            <CertCard key={cert.id} cert={cert} onDelete={deleteCert} />
          ))}
        </div>
      )}
    </div>
  );
}
