import { useEffect, useState } from 'react';
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, Plus, ExternalLink, Database } from 'lucide-react';
import Swal from 'sweetalert2';
import { isPdfUrl } from '../../components/Certificate';
import { convertPdfFirstPageToImage } from '../../utils/pdfToImage';

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

const getLocalCerts = () => {
  try {
    const raw = localStorage.getItem('portfolio_local_certificates');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalCerts = (certs) => {
  try {
    localStorage.setItem('portfolio_local_certificates', JSON.stringify(certs));
    window.dispatchEvent(new Event('portfolioCertificatesUpdated'));
  } catch (e) {
    console.error(e);
  }
};

const CertCard = ({ cert, onDelete }) => {
  const [imgSrc, setImgSrc] = useState(cert.Img);
  const [loadingImg, setLoadingImg] = useState(false);
  const isPdf = isPdfUrl(cert.Img);

  useEffect(() => {
    let isMounted = true;
    if (isPdf) {
      setLoadingImg(true);
      convertPdfFirstPageToImage(cert.Img, 2.0)
        .then((rendered) => {
          if (isMounted) {
            setImgSrc(rendered);
            setLoadingImg(false);
          }
        })
        .catch((err) => {
          console.warn("PDF render thumbnail fallback:", err);
          if (isMounted) setLoadingImg(false);
        });
    } else {
      setImgSrc(cert.Img);
    }
    return () => { isMounted = false; };
  }, [cert.Img, isPdf]);

  return (
    <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl overflow-hidden shadow-xs hover:border-[#7F8C6A] hover:shadow-md transition-all group relative flex flex-col">
      <div className="relative w-full aspect-[16/11.5] overflow-hidden bg-[#EDE7DA]">
        {loadingImg && (
          <div className="w-full h-full bg-[#EDE7DA] animate-pulse flex items-center justify-center">
            <span className="text-xs font-mono text-[#5A6650]">Memuat Sertifikat...</span>
          </div>
        )}

        {imgSrc && !loadingImg && (
          <img
            src={imgSrc}
            alt="Certificate Full View"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* PDF Badge if from PDF */}
        {(isPdf || cert.pdfUrl) && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#1E3B2F]/90 backdrop-blur-xs text-[#F5F0E6] text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs z-10">
            <Award className="w-2.5 h-2.5 text-[#C8B48A]" />
            <span>PDF</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 gap-2 z-20">
          {(isPdf || cert.pdfUrl) && (
            <a
              href={cert.pdfUrl || cert.Img}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] text-[#1E3B2F] hover:bg-[#EDE7DA] text-xs font-mono font-semibold transition-colors shadow-xs"
              title="Buka dokumen PDF asli"
            >
              <ExternalLink className="w-3.5 h-3.5" /> PDF
            </a>
          )}
          <button
            onClick={() => onDelete(cert.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B4442E] text-white hover:bg-[#963724] text-xs font-mono font-semibold flex-1 justify-center transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [renderedPdfImage, setRenderedPdfImage] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSupabaseTable, setHasSupabaseTable] = useState(true);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setHasSupabaseTable(false);
        const local = getLocalCerts();
        setCerts(local);
      } else {
        setHasSupabaseTable(true);
        const local = getLocalCerts();
        const merged = [...(data || [])];
        local.forEach((loc) => {
          if (!merged.some((m) => m.id === loc.id)) {
            merged.push(loc);
          }
        });
        setCerts(merged);
      }
    } catch (e) {
      console.warn('Network or Supabase error:', e);
      setHasSupabaseTable(false);
      setCerts(getLocalCerts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCerts(); 
    window.addEventListener('portfolioCertificatesUpdated', fetchCerts);
    return () => window.removeEventListener('portfolioCertificatesUpdated', fetchCerts);
  }, []);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    const isFilePdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    setIsPdf(isFilePdf);

    if (isFilePdf) {
      setConverting(true);
      try {
        // Convert first page to crisp fullview image (zero toolbars)
        const highResImg = await convertPdfFirstPageToImage(f, 2.5);
        setRenderedPdfImage(highResImg);
        setPreview(highResImg);
      } catch (err) {
        console.error('Gagal merender PDF ke gambar pratinjau:', err);
        setPreview(URL.createObjectURL(f));
      } finally {
        setConverting(false);
      }
    } else {
      setRenderedPdfImage(null);
      setPreview(URL.createObjectURL(f));
    }
  };

  const uploadCertificate = async () => {
    if (!file) return;
    setUploading(true);

    try {
      let finalImgUrl = renderedPdfImage || preview;
      let originalPdfCloudUrl = '';

      // 1. Coba upload file asli ke Supabase Storage jika bucket tersedia
      try {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `cert-${Date.now()}-${sanitizedName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certificate-images')
          .upload(fileName, file, {
            contentType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('certificate-images')
            .getPublicUrl(fileName);
          
          if (isPdf) {
            originalPdfCloudUrl = urlData.publicUrl;
            // Jika ada gambar hasil render, simpan juga gambar rendernya
          } else {
            finalImgUrl = urlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, will fallback to data url:', err);
      }

      // Jika file adalah gambar biasa dan belum punya data url
      if (!finalImgUrl) {
        const reader = new FileReader();
        finalImgUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      // 2. Simpan ke Supabase DB
      let savedToDb = false;
      try {
        const { error: insertError } = await supabase
          .from('certificates')
          .insert({ 
            Img: finalImgUrl,
            // Simpan juga URL PDF asli jika kolom tersedia
          });

        if (!insertError) {
          savedToDb = true;
          setHasSupabaseTable(true);
        }
      } catch (e) {
        console.warn('Supabase insert failed:', e);
      }

      // 3. Fallback ke Local Storage jika DB belum siap
      if (!savedToDb) {
        const localList = getLocalCerts();
        const newLocalCert = {
          id: `local_${Date.now()}`,
          Img: finalImgUrl,
          pdfUrl: originalPdfCloudUrl || (isPdf ? finalImgUrl : null),
          created_at: new Date().toISOString()
        };
        const updated = [newLocalCert, ...localList];
        saveLocalCerts(updated);
        setCerts(updated);

        Swal.fire({
          icon: 'success',
          title: 'Sertifikat Tersimpan (Pratinjau Bersih)',
          text: 'Sertifikat berhasil dirender ke fullview dan disimpan. Jalankan skrip SQL di Supabase SQL Editor untuk sinkronisasi cloud.',
          confirmButtonColor: '#1E3B2F'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Sertifikat Berhasil Dipublikasikan!',
          text: 'Pratinjau fullview sertifikat telah dipublikasikan tanpa border tool.',
          confirmButtonColor: '#1E3B2F',
          timer: 1800
        });
        fetchCerts();
      }

      setFile(null); 
      setPreview(null);
      setRenderedPdfImage(null);
      setIsPdf(false);
    } catch (err) {
      console.error('Upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses Berkas',
        text: err.message || 'Terjadi kesalahan saat memproses berkas sertifikat.',
        confirmButtonColor: '#1E3B2F'
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteCert = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus sertifikat ini?',
      text: 'Berkas sertifikat akan dihapus dari portofolio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B4442E',
      cancelButtonColor: '#5A6650',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const local = getLocalCerts();
      const updatedLocal = local.filter((c) => c.id !== id);
      saveLocalCerts(updatedLocal);

      try {
        await supabase.from('certificates').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }

      Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Sertifikat berhasil dihapus.',
        timer: 1400,
        showConfirmButton: false
      });
      fetchCerts();
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
            {loading ? 'Memuat data...' : `${certs.length} sertifikat (Fullview Clean Render)`}
          </p>
        </div>
      </div>

      {/* Supabase Notice Banner if table not found */}
      {!hasSupabaseTable && (
        <div className="p-4 rounded-2xl bg-[#EDE7DA] border border-[#D8CFBE] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] shrink-0 mt-0.5">
            <Database className="w-4 h-4 text-[#C8B48A]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-[#1E3B2F] uppercase">
              Sinkronisasi Cloud Supabase Diperlukan
            </h4>
            <p className="text-xs text-[#5A6650]">
              Tabel <code className="bg-[#FFFFFF] px-1 py-0.5 rounded text-[#1E3B2F]">certificates</code> belum dibuat di Supabase SQL Editor. Sertifikat tetap dapat Anda unggah dan tampil normal via penyimpanan lokal. Untuk sinkronisasi cloud permanen, jalankan skrip SQL di Supabase Dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Upload Card */}
      <Card>
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#1E3B2F] font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#7F8C6A]" /> Unggah Sertifikat Baru (Gambar atau Dokumen PDF Fullview)
          </h2>

          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            className={`flex flex-col items-center justify-center w-full min-h-[180px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
              dragOver ? 'border-[#1E3B2F] bg-[#EDE7DA]' : 'border-[#D8CFBE] bg-[#F5F0E6] hover:border-[#1E3B2F] hover:bg-[#EDE7DA]/50'
            }`}
          >
            {converting ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#1E3B2F]/30 border-t-[#1E3B2F] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#1E3B2F]">Merender Dokumen PDF ke Fullview Bersih...</p>
              </div>
            ) : preview ? (
              /* Clean Fullview Image Preview (No border tools) */
              <div className="p-3 w-full flex flex-col items-center justify-center">
                <img
                  src={preview}
                  alt="Fullview certificate preview"
                  className="max-h-56 object-contain rounded-xl shadow-xs border border-[#D8CFBE] bg-white"
                />
                <p className="text-[11px] font-mono text-[#5A6650] mt-2">
                  Pratinjau Bersih Fullview (Bebas dari toolbar bawaan peramban)
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-10 h-10 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center mx-auto text-[#1E3B2F]">
                  <Upload className="w-5 h-5 text-[#7F8C6A]" />
                </div>
                <p className="text-sm font-medium text-[#1E3B2F]">Tarik & lepas atau klik untuk memilih berkas</p>
                <p className="text-xs text-[#5A6650] font-mono">Mendukung berkas Gambar & PDF (Otomatis dirender ke Fullview tanpa toolbar)</p>
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
                <Award className="w-4 h-4 text-[#7F8C6A] shrink-0" />
                <p className="text-xs font-mono text-[#5A6650] truncate">{file.name}</p>
                <span className="text-[10px] font-mono text-[#7F8C6A] bg-[#EDE7DA] px-2 py-0.5 rounded-full">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => { setFile(null); setPreview(null); setRenderedPdfImage(null); setIsPdf(false); }}
                  className="px-3 py-1.5 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] text-xs font-mono transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={uploadCertificate} 
                  disabled={uploading || converting} 
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-xs font-mono transition-all shadow-xs disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C8B48A]" />
                  )}
                  <span>{uploading ? 'Memproses...' : 'Publikasikan Sertifikat Fullview'}</span>
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
