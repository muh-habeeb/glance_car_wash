"use client";

import Link from "next/link";
import { MoveLeft, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse tracking for Parallax 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  // 3D Rotation calculations (clamped)
  const rotateX = mousePos.y * -15; // Vertical tilt
  const rotateY = mousePos.x * 25;  // Horizontal tilt

  // Generate random bubble configs on mount to avoid hydration mismatch
  const [bubbles, setBubbles] = useState<Array<{size: number, left: number, delay: number, duration: number}>>([]);
  useEffect(() => {
    setBubbles(Array.from({ length: 20 }).map(() => ({
      size: Math.random() * 80 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6,
    })));
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden selection:bg-primary selection:text-primary-foreground"
      style={{ perspective: '1200px' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8) rotate(0deg); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(-120vh) scale(1.5) rotate(360deg); opacity: 0; }
        }
        @keyframes shieldPulse {
          0% { opacity: 0; stroke-dashoffset: 1000; }
          40% { opacity: 0.7; stroke-dashoffset: 0; }
          60% { opacity: 0.7; stroke-dashoffset: 0; }
          100% { opacity: 0; stroke-dashoffset: -1000; }
        }
      `}} />

      {/* Deep Space / Ambient Lighting */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-100 shadow-[0_0_30px_rgba(216,171,68,1)]"></div>
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-primary/10 rounded-[100%] blur-[150px] pointer-events-none"></div>

      {/* Floating 3D Soap Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {bubbles.map((b, i) => (
          <div 
            key={i}
            className="absolute rounded-full border border-primary/40 bg-gradient-to-tr from-primary/10 to-transparent backdrop-blur-[2px]"
            style={{
              width: b.size, 
              height: b.size, 
              left: `${b.left}%`, 
              bottom: '-100px',
              animation: `floatUp ${b.duration}s infinite linear ${b.delay}s`,
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2), 0 0 15px rgba(216,171,68,0.1)'
            }}
          >
             {/* Bubble reflection/glint */}
             <div className="absolute top-[15%] left-[20%] w-1/4 h-1/4 bg-white/50 rounded-full blur-[2px]"></div>
             <div className="absolute bottom-[20%] right-[20%] w-1/5 h-1/5 border-r-2 border-b-2 border-white/30 rounded-full blur-[1px]"></div>
          </div>
        ))}
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mt-[-5vh] pointer-events-none">
        
        {/* PARALLAX CONTAINER: 3D Holographic Car */}
        <div 
          className="relative mb-6 w-full max-w-3xl flex justify-center items-center h-80 transition-transform duration-[400ms] ease-out drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.1, 1.1, 1.1)` }}
        >
          
          {/* 3D Depth 404 Text */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-10 transition-transform duration-[400ms] ease-out"
            style={{ transform: 'translateZ(-100px)' }}
          >
            <span className="text-[16rem] md:text-[26rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary/15 via-primary/5 to-transparent filter blur-[1px]">
              404
            </span>
          </div>

          <div 
            className="relative z-10 w-full px-8 transition-transform duration-[400ms] ease-out"
            style={{ transform: 'translateZ(50px)' }}
          >
            <svg
              viewBox="0 0 400 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_0_35px_rgba(216,171,68,0.3)] overflow-visible"
            >
              <defs>
                <linearGradient id="headlight-grad" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="20%" stopColor="#D8AB44" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#D8AB44" stopOpacity="0" />
                </linearGradient>
                
                {/* Ceramic Coating Hex Shield Pattern */}
                <pattern id="hex" x="0" y="0" width="16" height="27.7" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                  <path d="M8 0 L16 4.6 L16 13.8 L8 18.4 L0 13.8 L0 4.6 Z" fill="none" stroke="#D8AB44" strokeWidth="1" opacity="0.6"/>
                  <path d="M8 27.7 L16 23.1 L16 13.8 L8 18.4 L0 13.8 L0 23.1 Z" fill="none" stroke="#D8AB44" strokeWidth="1" opacity="0.6"/>
                </pattern>
              </defs>

              {/* Holographic Grid Floor Reflection */}
              <ellipse cx="200" cy="118" rx="180" ry="8" fill="#D8AB44" className="opacity-30 blur-xl">
                 <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <path d="M 20,118 L 380,118 M 100,115 L 300,115 M 150,112 L 250,112" stroke="#D8AB44" strokeWidth="1" className="opacity-20" />

              {/* Headlight Intense Beam */}
              <path d="M 40,68 L -150,0 L -150,130 Z" fill="url(#headlight-grad)">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="d" values="M 40,68 L -150,0 L -150,130 Z; M 40,68 L -160,-10 L -160,140 Z; M 40,68 L -150,0 L -150,130 Z" dur="2s" repeatCount="indefinite" />
              </path>

              {/* High-Tech Touchless Wash Laser Scanner (Intense) */}
              <g>
                <line x1="-30" y1="-20" x2="-30" y2="135" stroke="#ffffff" strokeWidth="3" className="drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                  <animate attributeName="x1" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="x2" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </line>
                {/* Laser core intense glow */}
                <line x1="-30" y1="-20" x2="-30" y2="135" stroke="#D8AB44" strokeWidth="8" className="opacity-40 blur-md">
                  <animate attributeName="x1" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="x2" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </line>
                
                {/* Dynamic Laser Intersection Sparks */}
                <circle cx="-30" cy="40" r="4" fill="#ffffff" className="drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                  <animate attributeName="cx" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="cy" values="85;20;85" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </circle>
                <circle cx="-30" cy="70" r="3" fill="#D8AB44" className="drop-shadow-[0_0_15px_rgba(216,171,68,1)]">
                  <animate attributeName="cx" values="-30;430;-30" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                  <animate attributeName="cy" values="70;95;70" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                </circle>
              </g>

              {/* Ceramic Coating Hex Shield (The Magic Effect) */}
              <path
                d="M 45,85 C 35,85 30,80 30,70 C 30,60 45,52 65,48 C 100,40 120,38 140,32 C 160,22 185,15 220,15 C 255,15 295,28 325,40 C 350,50 375,55 385,65 C 390,72 385,85 365,85 L 320,85 A 25 25 0 0 0 270 85 L 130,85 A 25 25 0 0 0 80 85 Z"
                fill="url(#hex)"
                style={{ animation: 'shieldPulse 4s infinite cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Water Droplets blowing off rapidly */}
              <g fill="#ffffff" className="drop-shadow-[0_0_5px_rgba(216,171,68,0.8)]">
                <circle cx="340" cy="50" r="1.5" className="opacity-0"><animateTransform attributeName="transform" type="translate" values="0 0; 80 -20" dur="0.4s" repeatCount="indefinite" begin="0.1s" /><animate attributeName="opacity" values="0;1;0" dur="0.4s" repeatCount="indefinite" begin="0.1s" /></circle>
                <circle cx="280" cy="30" r="2" className="opacity-0"><animateTransform attributeName="transform" type="translate" values="0 0; 100 -15" dur="0.5s" repeatCount="indefinite" begin="0.2s" /><animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" begin="0.2s" /></circle>
                <circle cx="220" cy="18" r="1.5" className="opacity-0"><animateTransform attributeName="transform" type="translate" values="0 0; 90 -25" dur="0.45s" repeatCount="indefinite" begin="0.3s" /><animate attributeName="opacity" values="0;1;0" dur="0.45s" repeatCount="indefinite" begin="0.3s" /></circle>
                <circle cx="120" cy="35" r="2.5" className="opacity-0"><animateTransform attributeName="transform" type="translate" values="0 0; 70 -10" dur="0.6s" repeatCount="indefinite" begin="0.15s" /><animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.15s" /></circle>
                <circle cx="380" cy="70" r="2" className="opacity-0"><animateTransform attributeName="transform" type="translate" values="0 0; 60 -5" dur="0.55s" repeatCount="indefinite" begin="0.05s" /><animate attributeName="opacity" values="0;1;0" dur="0.55s" repeatCount="indefinite" begin="0.05s" /></circle>
              </g>

              {/* Speed Lines moving Right (Hyper-speed Floor) */}
              <g stroke="#D8AB44" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(216,171,68,0.8)]">
                <line x1="-50" y1="105" x2="-10" y2="105">
                  <animate attributeName="x1" values="-150;600" dur="0.3s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="-110;640" dur="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="0.3s" repeatCount="indefinite" />
                </line>
                <line x1="-120" y1="112" x2="-60" y2="112">
                  <animate attributeName="x1" values="-200;600" dur="0.4s" repeatCount="indefinite" begin="0.1s" />
                  <animate attributeName="x2" values="-140;660" dur="0.4s" repeatCount="indefinite" begin="0.1s" />
                  <animate attributeName="opacity" values="0;1;0" dur="0.4s" repeatCount="indefinite" begin="0.1s" />
                </line>
                <line x1="-80" y1="98" x2="-30" y2="98">
                  <animate attributeName="x1" values="-100;600" dur="0.35s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="x2" values="-50;650" dur="0.35s" repeatCount="indefinite" begin="0.2s" />
                  <animate attributeName="opacity" values="0;1;0" dur="0.35s" repeatCount="indefinite" begin="0.2s" />
                </line>
              </g>

              {/* Base Silhouette Outline (Ultra Thick Glow) */}
              <path
                d="M 45,85 C 35,85 30,80 30,70 C 30,60 45,52 65,48 C 100,40 120,38 140,32 C 160,22 185,15 220,15 C 255,15 295,28 325,40 C 350,50 375,55 385,65 C 390,72 385,85 365,85 L 320,85 A 25 25 0 0 0 270 85 L 130,85 A 25 25 0 0 0 80 85 Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"
              />

              {/* Premium Glow Sweep Line */}
              <path
                d="M 45,85 C 35,85 30,80 30,70 C 30,60 45,52 65,48 C 100,40 120,38 140,32 C 160,22 185,15 220,15 C 255,15 295,28 325,40 C 350,50 375,55 385,65 C 390,72 385,85 365,85 L 320,85 A 25 25 0 0 0 270 85 L 130,85 A 25 25 0 0 0 80 85 Z"
                stroke="#D8AB44" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_15px_rgba(216,171,68,1)]"
                strokeDasharray="900" strokeDashoffset="900"
              >
                <animate attributeName="stroke-dashoffset" values="900;0;900" dur="3.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
              </path>

              {/* Windows */}
              <path
                d="M 145,32 C 165,22 185,18 220,18 C 245,18 270,25 290,32 L 270,45 L 165,45 Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"
              />
              <line x1="220" y1="18" x2="200" y2="45" stroke="currentColor" strokeWidth="2" className="text-white/30" />

              {/* Wheels Background */}
              <circle cx="105" cy="85" r="16" fill="#0B0B0B" stroke="#D8AB44" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(216,171,68,0.5)]" />
              <circle cx="295" cy="85" r="16" fill="#0B0B0B" stroke="#D8AB44" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(216,171,68,0.5)]" />
              
              {/* Wheel Center Caps */}
              <circle cx="105" cy="85" r="4" fill="#ffffff" className="drop-shadow-[0_0_5px_rgba(255,255,255,1)]" />
              <circle cx="295" cy="85" r="4" fill="#ffffff" className="drop-shadow-[0_0_5px_rgba(255,255,255,1)]" />
              
              {/* Wheel spokes with BLUR-SPEED rotation */}
              <g stroke="#D8AB44" strokeWidth="2" className="opacity-80">
                <path d="M 105,69 L 105,101 M 89,85 L 121,85 M 93.7,73.7 L 116.3,96.3 M 93.7,96.3 L 116.3,73.7">
                  <animateTransform attributeName="transform" type="rotate" from="0 105 85" to="-360 105 85" dur="0.15s" repeatCount="indefinite" />
                </path>
                <path d="M 295,69 L 295,101 M 279,85 L 311,85 M 283.7,73.7 L 306.3,96.3 M 283.7,96.3 L 306.3,73.7">
                  <animateTransform attributeName="transform" type="rotate" from="0 295 85" to="-360 295 85" dur="0.15s" repeatCount="indefinite" />
                </path>
              </g>

              {/* High-Intensity Headlight LED */}
              <path d="M 32,69 L 45,61 L 52,65 L 35,74 Z" fill="#ffffff" className="drop-shadow-[0_0_15px_rgba(255,255,255,1)]" />
              
              {/* High-Intensity Taillight LED */}
              <path d="M 378,61 L 388,64 L 387,70 L 376,66 Z" fill="#ef4444" className="drop-shadow-[0_0_15px_rgba(239,68,68,1)]" />
            </svg>
          </div>
        </div>

        <div className="space-y-6 mt-8 relative z-10 pointer-events-auto">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.15em] uppercase text-foreground drop-shadow-xl">
            Destination <span className="font-bold text-primary drop-shadow-[0_0_20px_rgba(216,171,68,0.5)]">Unknown</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            It looks like you took a wrong turn. Let's get you back on track to our premium car wash services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-14 w-full sm:w-auto relative z-10 justify-center pointer-events-auto">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 text-sm font-bold tracking-[0.2em] uppercase text-primary bg-background border border-primary/50 overflow-hidden transition-all hover:border-primary hover:shadow-[0_0_40px_rgba(216,171,68,0.5)] hover:text-primary-foreground"
            style={{ borderRadius: '3px' }}
          >
            {/* Premium Animated Fill */}
            <div className="absolute inset-0 w-full h-full bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
            
            {/* High-speed Shimmer Effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%] transition-all duration-[1s] ease-in-out"></div>

            <Home className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110" />
            <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground transition-all hover:text-foreground"
          >
            {/* Sleek Expanding Underline */}
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:w-3/4 opacity-0 group-hover:opacity-100"></span>
            
            <MoveLeft className="w-4 h-4 transition-transform duration-500 group-hover:-translate-x-2 group-hover:text-primary" />
            <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
