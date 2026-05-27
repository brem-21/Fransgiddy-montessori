"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&auto=format&q=75",
    title: "Welcome to Fransgiddy Royal School",
    subtitle: "Nurturing curious minds through child-centred Montessori education",
  },
  {
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&auto=format&q=75",
    title: "Excellence in Every Classroom",
    subtitle: "Carefully prepared environments where children flourish at their own pace",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&auto=format&q=75",
    title: "A World of Knowledge",
    subtitle: "Rich resources and hands-on materials supporting every learner's journey",
  },
  {
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&auto=format&q=75",
    title: "Happy, Confident Children",
    subtitle: "We celebrate every child's unique talents and achievements every day",
  },
  {
    image:
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1400&auto=format&q=75",
    title: "Enrolment Open — 2025/2026",
    subtitle: "Apply today and begin your child's extraordinary learning journey with us",
  },
];

const INTERVAL_MS = 10000;

export function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setProgress(0);
      setFading(false);
    }, 350);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  // Progress bar — updates every 100ms
  useEffect(() => {
    if (paused) {
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (100 / (INTERVAL_MS / 100)), 100));
    }, 100);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, paused]);

  // Auto-advance
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % SLIDES.length;
        setFading(true);
        setTimeout(() => {
          setCurrent(next);
          setProgress(0);
          setFading(false);
        }, 350);
        return c;
      });
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full h-[480px] sm:h-[580px] overflow-hidden bg-indigo-900 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Photo gallery slideshow"
    >
      {/* Slide image with fade */}
      <div
        className={`absolute inset-0 transition-opacity duration-[350ms] ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Caption */}
      <div
        className={`absolute bottom-16 left-0 right-0 px-6 sm:px-16 transition-opacity duration-[350ms] ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="text-white text-2xl sm:text-4xl font-bold drop-shadow-lg leading-tight mb-2">
          {slide.title}
        </h2>
        <p className="text-white/80 text-sm sm:text-base drop-shadow max-w-2xl">
          {slide.subtitle}
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-indigo-400 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => { prev(); setProgress(0); }}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={() => { next(); setProgress(0); }}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Pause indicator */}
      {paused && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 text-white/70 text-xs rounded backdrop-blur-sm">
          Paused
        </div>
      )}
    </section>
  );
}
