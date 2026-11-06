import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4 p-8">
        <div className="w-10 h-10 rounded-full border-3 border-t-transparent border-[#1E3B2F] animate-spin"></div>
        <span className="text-xs font-mono text-[#5A6650] tracking-wider uppercase">Loading</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
