import React, { useState } from 'react';
import { supabase } from "../supabase";
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { 
      alert(error.message); 
      setLoading(false); 
      return; 
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    if (profileError || profile?.role !== 'admin') {
      alert(profileError ? `Database Profile Error: ${profileError.message}` : 'Access denied: Akun Anda belum memiliki role admin.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle Ambient Highlight */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-40 blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200, 180, 138, 0.4) 0%, rgba(237, 231, 218, 0.6) 50%, transparent 80%)"
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-8 shadow-[0_16px_40px_rgba(30,59,47,0.06)] space-y-7">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7DA] border border-[#D8CFBE]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7F8C6A]" />
              <span className="text-[#1E3B2F] text-xs font-mono font-medium">Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E3B2F]">Welcome Back</h1>
            <p className="text-[#5A6650] text-sm">Sign in to manage portfolio and analytics</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">Email</label>
              <div className="flex items-center bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl overflow-hidden focus-within:border-[#1E3B2F] focus-within:ring-1 focus-within:ring-[#1E3B2F] transition-all">
                <Mail className="w-4 h-4 text-[#7F8C6A] ml-3.5 shrink-0" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-3 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#5A6650] uppercase tracking-wider font-medium">Password</label>
              <div className="flex items-center bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl overflow-hidden focus-within:border-[#1E3B2F] focus-within:ring-1 focus-within:ring-[#1E3B2F] transition-all">
                <Lock className="w-4 h-4 text-[#7F8C6A] ml-3.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-3 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="mr-3 shrink-0 text-[#5A6650] hover:text-[#1E3B2F] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-11 bg-[#1E3B2F] hover:bg-[#2A5241] text-[#F5F0E6] rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#F5F0E6]/30 border-t-[#F5F0E6] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4 text-[#C8B48A]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#D8CFBE]">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A6650] hover:text-[#1E3B2F] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
