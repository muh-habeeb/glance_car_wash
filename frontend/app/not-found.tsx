"use client";

import Link from "next/link";
import { MoveLeft, Home } from "lucide-react";

export default function NotFound() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sleek Ambient Lighting */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-80"></div>
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mt-[-5vh]">
        
        {/* Ultra Premium Car Wash Scanner Animation */}
        <div className="relative mb-2 w-full max-w-lg flex justify-center items-center h-72">
          
          {/* Subtle 404 Text Background (Masked gradient) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-4">
            <span className="text-[14rem] md:text-[22rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary/10 via-foreground/5 to-primary/5 animate-pulse">
              404
            </span>
          </div>

          <div className="relative z-10 w-full px-8 scale-110">
            <svg
              viewBox="0 0 400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_0_25px_rgba(216,171,68,0.25)] overflow-visible"
            >
              <defs>
                <linearGradient id="headlight-grad" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#D8AB44" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#D8AB44" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Glowing Floor Reflection */}
              <ellipse cx="200" cy="115" rx="150" ry="4" fill="#D8AB44" className="opacity-20 blur-md" />

              {/* Headlight Beam */}
              <path d="M 40,68 L -120,20 L -120,110 Z" fill="url(#headlight-grad)">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />
              </path>

              {/* High-Tech Touchless Wash Laser Scanner */}
              <g>
                <line x1="-20" y1="-10" x2="-20" y2="125" stroke="#D8AB44" strokeWidth="2.5" className="drop-shadow-[0_0_15px_rgba(216,171,68,1)]">
                  <animate attributeName="x1" values="-20;420;-20" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="x2" values="-20;420;-20" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </line>
                {/* Laser intersection spark 1 */}
                <circle cx="-20" cy="40" r="3" fill="#ffffff" className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
                  <animate attributeName="cx" values="-20;420;-20" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="cy" values="85;30;85" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
                </circle>
                {/* Laser intersection spark 2 */}
                <circle cx="-20" cy="70" r="2" fill="#D8AB44" className="drop-shadow-[0_0_8px_rgba(216,171,68,1)]">
                  <animate attributeName="cx" values="-20;420;-20" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="cy" values="70;90;70" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </circle>
              </g>

              {/* Water Droplets blowing off (Car wash effect) */}
              <g fill="#D8AB44">
                <circle cx="340" cy="50" r="1.5" className="opacity-0">
                  <animateTransform attributeName="transform" type="translate" values="0 0; 40 -15" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
                  <animate attributeName="opacity" values="0;0.8;0" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
                </circle>
                <circle cx="280" cy="30" r="2" className="opacity-0">
                  <animateTransform attributeName="transform" type="translate" values="0 0; 50 -10" dur="1s" repeatCount="indefinite" begin="0.4s" />
                  <animate attributeName="opacity" values="0;0.9;0" dur="1s" repeatCount="indefinite" begin="0.4s" />
                </circle>
                <circle cx="160" cy="25" r="1.5" className="opacity-0">
                  <animateTransform attributeName="transform" type="translate" values="0 0; 60 -15" dur="0.9s" repeatCount="indefinite" begin="0.7s" />
                  <animate attributeName="opacity" values="0;0.7;0" dur="0.9s" repeatCount="indefinite" begin="0.7s" />
                </circle>
                <circle cx="380" cy="70" r="2.5" className="opacity-0">
                  <animateTransform attributeName="transform" type="translate" values="0 0; 40 -5" dur="1.1s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="opacity" values="0;0.6;0" dur="1.1s" repeatCount="indefinite" begin="0.2s" />
                </circle>
              </g>

              {/* Speed Lines moving Right (Floor) */}
              <g className="text-primary/40" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="-50" y1="105" x2="-10" y2="105">
                  <animate attributeName="x1" values="-100;500" dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="-60;540" dur="0.6s" repeatCount="indefinite" />
                </line>
                <line x1="-120" y1="112" x2="-60" y2="112">
                  <animate attributeName="x1" values="-150;500" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="x2" values="-90;560" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
                </line>
              </g>

              {/* Base Silhouette Outline */}
              <path
                d="M 45,85 C 35,85 30,80 30,70 C 30,60 45,52 65,48 C 100,40 120,38 140,32 C 160,22 185,15 220,15 C 255,15 295,28 325,40 C 350,50 375,55 385,65 C 390,72 385,85 365,85 L 320,85 A 25 25 0 0 0 270 85 L 130,85 A 25 25 0 0 0 80 85 Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/20"
              />

              {/* Premium Glow Sweep Line (Tracing the silhouette) */}
              <path
                d="M 45,85 C 35,85 30,80 30,70 C 30,60 45,52 65,48 C 100,40 120,38 140,32 C 160,22 185,15 220,15 C 255,15 295,28 325,40 C 350,50 375,55 385,65 C 390,72 385,85 365,85 L 320,85 A 25 25 0 0 0 270 85 L 130,85 A 25 25 0 0 0 80 85 Z"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_12px_rgba(216,171,68,0.9)]"
                strokeDasharray="900" strokeDashoffset="900"
              >
                <animate attributeName="stroke-dashoffset" values="900;0;900" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </path>

              {/* Windows */}
              <path
                d="M 145,32 C 165,22 185,18 220,18 C 245,18 270,25 290,32 L 270,45 L 165,45 Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40"
              />
              <line x1="220" y1="18" x2="200" y2="45" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40" />

              {/* Wheels */}
              <circle cx="105" cy="85" r="16" stroke="currentColor" strokeWidth="2.5" className="text-primary/70" />
              <circle cx="105" cy="85" r="4" fill="currentColor" className="text-primary" />
              <circle cx="295" cy="85" r="16" stroke="currentColor" strokeWidth="2.5" className="text-primary/70" />
              <circle cx="295" cy="85" r="4" fill="currentColor" className="text-primary" />
              
              {/* Wheel spokes with HIGH SPEED rotation */}
              <g className="text-primary/60">
                <path d="M 105,69 L 105,101 M 89,85 L 121,85 M 93.7,73.7 L 116.3,96.3 M 93.7,96.3 L 116.3,73.7" stroke="currentColor" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 105 85" to="-360 105 85" dur="0.4s" repeatCount="indefinite" />
                </path>
                <path d="M 295,69 L 295,101 M 279,85 L 311,85 M 283.7,73.7 L 306.3,96.3 M 283.7,96.3 L 306.3,73.7" stroke="currentColor" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 295 85" to="-360 295 85" dur="0.4s" repeatCount="indefinite" />
                </path>
              </g>

              {/* Headlight LED */}
              <path d="M 32,69 L 45,61 L 52,65 L 35,74 Z" fill="#ffffff" className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]" />
              
              {/* Taillight LED */}
              <path d="M 378,61 L 388,64 L 387,70 L 376,66 Z" fill="#ef4444" className="drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
            </svg>
          </div>
        </div>

        <div className="space-y-6 mt-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.2em] uppercase text-foreground">
            Lost <span className="font-bold text-primary">Signal</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            The coordinates you provided don't exist. Let's realign your trajectory back to our premium services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-14 w-full sm:w-auto relative z-10 justify-center">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 text-sm font-bold tracking-[0.15em] uppercase text-primary bg-background border border-primary/40 overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_40px_rgba(216,171,68,0.4)] hover:text-primary-foreground"
            style={{ borderRadius: '3px' }}
          >
            {/* Premium Animated Fill */}
            <div className="absolute inset-0 w-full h-full bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
            
            {/* High-speed Shimmer Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%] transition-all duration-[1.2s] ease-in-out"></div>

            <Home className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110" />
            <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 text-sm font-semibold tracking-[0.15em] uppercase text-muted-foreground transition-all hover:text-foreground"
          >
            {/* Sleek Expanding Underline */}
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:w-3/4 opacity-0 group-hover:opacity-100"></span>
            
            <MoveLeft className="w-4 h-4 transition-transform duration-500 group-hover:-translate-x-2 group-hover:text-primary" />
            <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
