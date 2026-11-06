import React, { memo } from "react";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[#F5F0E6] overflow-hidden">
      {/* Subtle top warm sand/cream ambient highlight */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] opacity-40 blur-[140px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200, 180, 138, 0.45) 0%, rgba(237, 231, 218, 0.6) 45%, transparent 80%)"
        }}
      />

      {/* Editorial Grid Matrix in Warm Muted Tone */}
      <div 
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D8CFBE 1px, transparent 1px),
            linear-gradient(to bottom, #D8CFBE 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Gentle vignette mask */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, transparent 50%, #F5F0E6 95%)"
        }}
      />
    </div>
  );
};

export default memo(AnimatedBackground);
