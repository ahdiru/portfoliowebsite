import { useEffect, useState } from 'react';
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, ImageIcon, Plus } from 'lucide-react';

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

  return (
    <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl overflow-hidden shadow-xs hover:border-[#7F8C6A] hover:shadow-md transition-all group relative">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button
            onClick={() => onDelete(cert.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] text-[#B4442E] hover:bg-[#B4442E] hover:text-white border border-[#B4442E]/30 text-xs font-mono font-medium w-full justify-center transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCerts = async () => {
    setLoading(true);
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    setCerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadImage = async () => {
    if (!file) return;
    setUploading(true);
    const fileName = `cert-${Date.now()}-${file.name}`;
    await supabase.storage.from('certificate-images').upload(fileName, file);
    const { data } = supabase.storage.from('certificate-images').getPublicUrl(fileName);
    await supabase.from('certificates').insert({ Img: data.publicUrl });
    setFile(null); 
    setPreview(null); 
    setUploading(false);
    fetchCerts();
  };

  const deleteCert = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    await supabase.from('certificates').delete().eq('id', id);
    fetchCerts();
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
            {loading ? 'Loading...' : `${certs.length} certificates validated`}
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <Card>
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#1E3B2F] font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#7F8C6A]" /> Upload New Certificate
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
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-10 h-10 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center justify-center mx-auto text-[#1E3B2F]">
                  <ImageIcon className="w-5 h-5 text-[#7F8C6A]" />
                </div>
                <p className="text-sm font-medium text-[#1E3B2F]">Drag & drop or click to upload</p>
                <p className="text-xs text-[#5A6650] font-mono">PNG, JPG, WEBP supported</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} className="hidden" />
          </label>

          {file && (
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#D8CFBE]">
              <p className="text-xs font-mono text-[#5A6650] truncate flex-1">{file.name}</p>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="px-3 py-1.5 rounded-xl border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] text-xs font-mono transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={uploadImage} 
                  disabled={uploading} 
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-xs font-mono transition-all shadow-xs disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C8B48A]" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Publish Certificate'}</span>
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
            <p className="text-[#1E3B2F] font-semibold text-sm">No certificates uploaded yet.</p>
            <p className="text-[#5A6650] text-xs mt-1">Upload certificates like Apple Academy, BPS, or Dicoding above.</p>
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
