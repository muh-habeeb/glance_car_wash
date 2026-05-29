"use client";

import Link from "next/link";
import { MoveLeft, Home } from "lucide-react";

export default function NotFound() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sleek Ambient Lighting */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-70"></div>
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl">
        {/* Premium SVG Animation (Sleek Car Silhouette) */}
        <div className="relative mb-6 w-full max-w-lg flex justify-center items-center h-64">
          {/* Subtle 404 Text Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02]">
            <span className="text-[14rem] md:text-[20rem] font-black tracking-tighter text-foreground">
              404
            </span>
          </div>

          {/* Animated Car Silhouette */}
          <div className="relative z-10 w-full px-8">
            <svg
              viewBox="0 0 400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_0_20px_rgba(216,171,68,0.2)] overflow-visible"
            >
              <defs>
                <linearGradient id="headlight-grad" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#D8AB44" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D8AB44" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Headlight Beam */}
              <path d="M 40,68 L -100,30 L -100,105 Z" fill="url(#headlight-grad)">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </path>

              {/* Speed Lines moving Right */}
              <g className="text-primary/30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="-100" y1="105" x2="-40" y2="105">
                  <animate attributeName="x1" values="-100;500" dur="0.8s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="-40;560" dur="0.8s" repeatCount="indefinite" />
                </line>
                <line x1="-150" y1="55" x2="-80" y2="55">
                  <animate attributeName="x1" values="-150;500" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="x2" values="-80;570" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
                </line>
                <line x1="-80" y1="25" x2="-30" y2="25">
                  <animate attributeName="x1" values="-80;500" dur="1s" repeatCount="indefinite" begin="0.5s" />
                  <animate attributeName="x2" values="-30;550" dur="1s" repeatCount="indefinite" begin="0.5s" />
                </line>
              </g>

              {/* Base Silhouette Outline */}
              <path
                d="M 45,85 
                   C 35,85 30,80 30,70
                   C 30,60 45,52 65,48
                   C 100,40 120,38 140,32
                   C 160,22 185,15 220,15
                   C 255,15 295,28 325,40
                   C 350,50 375,55 385,65
                   C 390,72 385,85 365,85
                   L 320,85
                   A 25 25 0 0 0 270 85
                   L 130,85
                   A 25 25 0 0 0 80 85
                   Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/20"
              />

              {/* Premium Glow Sweep Line (Tracing the silhouette) */}
              <path
                d="M 45,85 
                   C 35,85 30,80 30,70
                   C 30,60 45,52 65,48
                   C 100,40 120,38 140,32
                   C 160,22 185,15 220,15
                   C 255,15 295,28 325,40
                   C 350,50 375,55 385,65
                   C 390,72 385,85 365,85
                   L 320,85
                   A 25 25 0 0 0 270 85
                   L 130,85
                   A 25 25 0 0 0 80 85
                   Z"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_8px_rgba(216,171,68,0.8)]"
                strokeDasharray="900" strokeDashoffset="900"
              >
                <animate attributeName="stroke-dashoffset" values="900;0;900" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </path>

              {/* Windows */}
              <path
                d="M 145,32 C 165,22 185,18 220,18 C 245,18 270,25 290,32 L 270,45 L 165,45 Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"
              />
              
              {/* Window divider */}
              <line x1="220" y1="18" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />

              {/* Wheels */}
              <circle cx="105" cy="85" r="16" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
              <circle cx="105" cy="85" r="5" fill="currentColor" className="text-primary/80" />
              <circle cx="295" cy="85" r="16" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
              <circle cx="295" cy="85" r="5" fill="currentColor" className="text-primary/80" />
              
              {/* Wheel spokes with rotation */}
              <g className="text-primary/50">
                <path d="M 105,69 L 105,101 M 89,85 L 121,85 M 93.7,73.7 L 116.3,96.3 M 93.7,96.3 L 116.3,73.7" stroke="currentColor" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 105 85" to="-360 105 85" dur="1s" repeatCount="indefinite" />
                </path>
                <path d="M 295,69 L 295,101 M 279,85 L 311,85 M 283.7,73.7 L 306.3,96.3 M 283.7,96.3 L 306.3,73.7" stroke="currentColor" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 295 85" to="-360 295 85" dur="1s" repeatCount="indefinite" />
                </path>
              </g>

              {/* Headlight LED */}
              <path d="M 32,69 L 45,61 L 52,65 L 35,74 Z" fill="currentColor" className="text-primary drop-shadow-[0_0_5px_rgba(216,171,68,1)]" />
              
              {/* Taillight LED */}
              <path d="M 378,61 L 388,64 L 387,70 L 376,66 Z" fill="#ef4444" className="drop-shadow-[0_0_5px_rgba(239,68,68,1)]" />
            </svg>
          </div>
        </div>

        <div className="space-y-6 mt-2 relative z-10">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase text-foreground">
            Destination <span className="font-semibold text-primary">Unknown</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
            The page you're looking for isn't on our roadmap. Let's redirect you back to our premium car wash services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-12 w-full sm:w-auto relative z-10 justify-center">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 text-xs sm:text-sm font-bold tracking-widest uppercase text-primary bg-background border border-primary/40 overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_30px_rgba(216,171,68,0.3)] hover:text-primary-foreground"
            style={{ borderRadius: '2px' }}
          >
            {/* Premium Animated Fill */}
            <div className="absolute inset-0 w-full h-full bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            
            {/* Shimmer Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%] transition-all duration-1000 ease-in-out"></div>

            <Home className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 text-xs sm:text-sm font-semibold tracking-widest uppercase text-muted-foreground transition-all hover:text-foreground"
          >
            {/* Sleek Expanding Underline */}
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-primary transition-all duration-300 ease-out group-hover:w-1/2 opacity-0 group-hover:opacity-100"></span>
            
            <MoveLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1.5 group-hover:text-primary" />
            <span className="relative z-10">Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
