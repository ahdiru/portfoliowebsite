import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Code2, LineChart } from 'lucide-react';

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 500);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  const containerVariants = {
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F5F0E6] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-40 blur-[100px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(200, 180, 138, 0.4) 0%, rgba(237, 231, 218, 0.6) 50%, transparent 80%)"
            }}
          />

          {/* Minimalist Centered Brand Reveal */}
          <div className="relative text-center px-4 max-w-md w-full">
            
            {/* Engineering Icons: Web, Database, Analytics */}
            <motion.div 
              className="flex justify-center items-center gap-3 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] shadow-2xs">
                <Code2 className="w-4 h-4 text-[#1E3B2F]" />
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] shadow-2xs">
                <Database className="w-4 h-4 text-[#7F8C6A]" />
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8CFBE] text-[#1E3B2F] shadow-2xs">
                <LineChart className="w-4 h-4 text-[#C8B48A]" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1E3B2F] flex items-center justify-center gap-2 font-mono">
                <span>Ahmad Jordan</span>
                <span className="w-2 h-2 rounded-full bg-[#7F8C6A] inline-block"></span>
              </h1>
              <p className="text-xs sm:text-sm font-mono text-[#5A6650] mt-2 tracking-wider uppercase">
                Web Developer & Data Analyst
              </p>
            </motion.div>

            {/* Crisp Loading Progress Indicator */}
            <motion.div 
              className="mt-8 max-w-[150px] mx-auto h-[2px] bg-[#D8CFBE] rounded-full overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <motion.div 
                className="h-full bg-[#1E3B2F] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
