"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MapCarouselProps {
  slides: {
    id: string;
    label: string;
    icon: string;
    content: React.ReactNode;
  }[];
}

export function MapCarousel({ slides }: MapCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // If there's only one slide, just render its content directly
  if (slides.length === 1) {
    return (
      <div className="w-full h-full flex flex-col items-center">
        {slides[0].content}
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* ─── Tabs / Pagination (Glassmorphism) ─── */}
      <div className="sticky top-[88px] z-40 mt-6 mb-2 bg-black/40 backdrop-blur-md rounded-full px-2 py-1.5 flex gap-2 border border-white/20 shadow-xl">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(idx)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 relative
              ${currentSlide === idx ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "text-white/50 hover:text-white/80 hover:bg-white/5"}
            `}
          >
            {/* Active background pill */}
            {currentSlide === idx && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[var(--color-brand)] rounded-full -z-10 opacity-80"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="text-lg drop-shadow-md">{slide.icon}</span>
            <span className="drop-shadow-md">{slide.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Swipeable Carousel Track ─── */}
      <div className="relative w-full h-full flex flex-1 items-stretch justify-center px-4 overflow-visible">
        
        {/* Left Arrow (Desktop/Tablet aid) */}
        <button 
          onClick={prevSlide}
          className="hidden md:flex absolute py-10 left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md mx-auto"
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>

        {/* Right Arrow (Desktop/Tablet aid) */}
        <button 
          onClick={nextSlide}
          className="hidden md:flex absolute py-10 right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Mobile hint */}
      <p className="mt-8 mb-24 md:hidden text-white/50 text-xs text-center">
        Toque nas abas acima para trocar de universo
      </p>

    </div>
  );
}
