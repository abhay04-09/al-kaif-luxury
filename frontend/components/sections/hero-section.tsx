"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

const editorialLinks = [
  { index: "01", label: "New Arrivals", href: "/products" },
  { index: "02", label: "The Atelier", href: "#story" },
  { index: "03", label: "Rare Fragrances", href: "/products?category=perfumes" }
];

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative flex min-h-[90vh] w-full select-none flex-col justify-between overflow-hidden border-b border-graphite/60 bg-onyx px-6 py-6 text-porcelain md:px-12 lg:h-[92vh] lg:py-10">
      <div className="editorial-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-10" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="relative z-10 my-auto grid flex-1 grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column */}
        <div className="hidden flex-col justify-between border-r border-graphite/40 pb-6 pr-8 lg:col-span-3 lg:flex">
          <div className="space-y-4 pt-4">
            <span className="block text-[10px] uppercase tracking-regal text-gold">
              Haute Editions
            </span>
            <p className="text-xs font-light leading-relaxed text-mist">
              Fine Jewellery &amp; Rare Fragrances formulated with Jaipur
              heritage gems and Grasse natural oils.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                Founded
              </p>
              <p className="font-accent text-lg italic text-gold-light">
                MCMXCVII
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                Location
              </p>
              <p className="font-accent text-lg italic text-porcelain">
                Global Atelier
              </p>
            </div>
          </div>
        </div>

        {/* Center Column - Text & Data */}
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center md:px-8 lg:col-span-6">
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pointer-events-none absolute -inset-4 animate-pulse rounded-full border border-gold/20" />
            <span className="rounded-full border border-gold/30 bg-obsidian/80 px-4 py-1.5 text-[10px] uppercase tracking-[0.6em] text-gold backdrop-blur-md sm:text-[11px] md:tracking-[0.8em]">
              The 2026 Archive Collection
            </span>
          </motion.div>

          <motion.h1
            className="mb-8 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl xl:text-9xl"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Timeless
            <br />
            <span className="gold-gradient-text pl-2 font-accent font-normal italic md:pl-10">
              Elegance
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 max-w-md text-xs font-light leading-relaxed tracking-wide text-mist md:text-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Discover the intersection of heritage craftsmanship and modern
            sophistication. A curated journey through the world&apos;s most
            exquisite gold, diamonds &amp; rare oud.
          </motion.p>

          <motion.div
            className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              className="group relative w-full overflow-hidden border border-gold/50 bg-black/40 px-8 py-4 sm:w-auto"
              href="/products?category=jewellery"
            >
              <div className="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative z-10 text-[10px] font-semibold uppercase tracking-imperial text-porcelain transition-colors group-hover:text-onyx md:text-xs">
                Discover Jewellery
              </span>
            </Link>

            <Link
              className="group relative w-full overflow-hidden border border-gold/50 bg-gold/10 px-8 py-4 sm:w-auto"
              href="/products?category=perfumes"
            >
              <div className="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative z-10 text-[10px] font-semibold uppercase tracking-imperial text-gold-light transition-colors group-hover:text-onyx md:text-xs">
                Exotic Perfumes
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Navigation & Embedded Brand Video Beside Data */}
        <div className="flex flex-col justify-between border-t border-graphite/40 pt-6 lg:border-t-0 lg:border-l lg:border-graphite/40 lg:pb-6 lg:pl-8 lg:pt-0 lg:col-span-3">
          <div className="hidden flex-col space-y-6 pt-4 text-right lg:flex">
            {editorialLinks.map((item) => (
              <Link className="group" href={item.href} key={item.index}>
                <p className="text-[10px] uppercase tracking-widest text-gold opacity-40 transition-opacity group-hover:opacity-100">
                  {item.index}
                </p>
                <h2 className="flex items-center justify-end gap-1 font-serif text-lg transition-colors group-hover:text-gold">
                  <span>{item.label}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </h2>
              </Link>
            ))}
          </div>

          {/* Embedded Video Card Beside Data */}
          <div className="group relative mt-6 h-52 w-full overflow-hidden border border-gold/40 bg-black p-1 shadow-2xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_25px_rgba(217,119,6,0.25)] lg:mt-0">
            <video
              ref={videoRef}
              autoPlay
              className="h-full w-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              loop
              muted={isMuted}
              playsInline
              poster="/media/al-kaif-logo.png"
            >
              <source src="/media/al-kaif-splash.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

            {/* Video Header Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/70 px-2.5 py-0.5 text-[8px] font-medium uppercase tracking-widest text-gold backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Maison Film
              </span>
            </div>

            {/* Video Footer Controls & Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="space-y-0.5 pointer-events-none">
                <span className="block text-[8px] uppercase tracking-[0.2em] text-gold-light/80">
                  AL-KAIF Luxury
                </span>
                <h3 className="font-serif text-xs text-white">
                  Signature Archive
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="rounded-full border border-gold/40 bg-black/80 p-1.5 text-gold transition-colors hover:border-gold hover:bg-gold hover:text-black focus:outline-none"
                  onClick={toggleMute}
                  type="button"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </button>
                <button
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  className="rounded-full border border-gold/40 bg-black/80 p-1.5 text-gold transition-colors hover:border-gold hover:bg-gold hover:text-black focus:outline-none"
                  onClick={togglePlay}
                  type="button"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-graphite/40 pt-4 text-[10px] uppercase tracking-imperial text-mist/70">
        <span className="hidden sm:inline">AL-KAIF Heritage Archive</span>

        <a
          className="mx-auto flex items-center gap-2 text-gold-light transition-colors hover:text-gold-bright"
          href="#story"
        >
          <span>Scroll To Explore</span>
          <ChevronDown
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-bounce"
          />
        </a>

        <span className="hidden sm:inline">Est. 1988 Jaipur</span>
      </div>
    </section>
  );
}
