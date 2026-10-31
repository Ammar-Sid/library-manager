import Link from 'next/link';
import { BookOpen, ArrowRight, Shield, Upload, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LibraryOS</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/auth/signin" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="pt-20 pb-16 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 font-medium mb-6">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            PDF Library Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Your Digital
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {' '}Library{' '}
            </span>
            Awaits
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload, discover, and read PDF books directly in your browser. A premium library
            experience with role-based access, secure storage, and an elegant reading interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary text-base px-8 py-3">
              Start Reading Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-base px-8 py-3">
              Browse Library
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Upload,
              title: 'Secure PDF Upload',
              description:
                'Upload PDF books with strict MIME validation and magic byte verification. Files are stored on Vercel Blob.',
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
              border: 'border-indigo-500/20',
            },
            {
              icon: Search,
              title: 'Discovery Portal',
              description:
                'Browse the full library with search and pagination. Read books directly in-browser with our PDF viewer.',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
              border: 'border-violet-500/20',
            },
            {
              icon: Shield,
              title: 'Role-Based Access',
              description:
                'Super Admin controls for user management, banning, and content moderation with secure JWT sessions.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
            },
          ].map(({ icon: Icon, title, description, color, bg, border }) => (
            <div
              key={title}
              className={`card p-6 border ${border} hover:border-opacity-80 transition-all duration-300`}
            >
              <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>© 2024 LibraryOS. Built with Next.js, Prisma & Vercel.</p>
        </footer>
      </div>
    </main>
  );
}
