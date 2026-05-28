import { Shield, Sparkles, Droplets } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-wider">GLANZ</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all shadow-[0_0_20px_rgba(216,171,68,0.2)] hover:shadow-[0_0_30px_rgba(216,171,68,0.4)]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-24 text-center md:pt-48 md:pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-8">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Premium Detailing Studio
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          The Ultimate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
            Spa For Your Car
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12 leading-relaxed">
          Experience unmatched brilliance with our luxury hand-wash and ceramic coating services. 
          We treat every vehicle like a masterpiece.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Explore Services
          </Link>
          <Link 
            href="#video" 
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-border font-semibold hover:bg-muted transition-colors"
          >
            Watch Video
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all">
            <Droplets className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3">Foam Cannon Wash</h3>
            <p className="text-muted-foreground">Thick, lubricating snow foam safely lifts dirt and grime without scratching your delicate clear coat.</p>
          </div>
          
          <div className="p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all">
            <Shield className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3">Ceramic Coating</h3>
            <p className="text-muted-foreground">Long-lasting hydrophobic protection that makes washing easier and keeps your car looking glossy for years.</p>
          </div>

          <div className="p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all">
            <Sparkles className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3">Interior Detailing</h3>
            <p className="text-muted-foreground">Deep extraction cleaning and UV conditioning to restore your interior to a factory-fresh scent and feel.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
