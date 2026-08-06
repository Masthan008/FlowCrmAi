import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Smartphone, Sparkles, Shield, Zap } from "lucide-react";

export interface ImageItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export type { ImageItem as ImageItemType };

export interface PhoneCarouselProps {
  images: ImageItem[];
  autoPlayInterval?: number;
}

export const PhoneCarousel: React.FC<PhoneCarouselProps> = ({
  images,
  autoPlayInterval = 4000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="relative flex flex-col items-center justify-center py-8 w-full max-w-4xl mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[580px] bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* iPhone Device Frame */}
      <div className="relative w-[300px] sm:w-[320px] h-[600px] sm:h-[640px] bg-slate-950 rounded-[50px] p-3 border-4 border-slate-800 shadow-2xl shadow-indigo-500/20 ring-1 ring-slate-700/50 backdrop-blur-2xl flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-30 flex items-center justify-between px-3 border border-slate-800 shadow-inner">
          <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-500/80" />
          </div>
          <div className="w-10 h-1.5 rounded-full bg-slate-800" />
        </div>

        {/* Screen Container */}
        <div className="relative w-full h-full rounded-[40px] bg-slate-900 overflow-hidden flex flex-col border border-slate-800/80">
          {/* Status Bar */}
          <div className="h-10 pt-3 px-6 flex items-center justify-between text-[11px] font-bold text-slate-400 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-indigo-400" />
              <div className="w-4 h-2 rounded-sm border border-slate-400 p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Screen Content Carousel */}
          <div className="relative flex-1 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col"
              >
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="w-full h-full object-cover object-top"
                />

                {/* Glassmorphic Overlay Badge */}
                {(currentImage.title || currentImage.subtitle) && (
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl space-y-1 shadow-xl">
                    {currentImage.title && (
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        {currentImage.title}
                      </h4>
                    )}
                    {currentImage.subtitle && (
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-2">
                        {currentImage.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Home Indicator Bar */}
          <div className="h-6 flex items-center justify-center z-20">
            <div className="w-32 h-1 rounded-full bg-slate-600/60" />
          </div>
        </div>
      </div>

      {/* External Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-xs mt-6 px-4">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
                  : "w-2 bg-slate-800 hover:bg-slate-700"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
