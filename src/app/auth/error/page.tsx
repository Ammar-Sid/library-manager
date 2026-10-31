import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server authentication settings. Please try again.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in or your account is restricted.',
  },
  Verification: {
    title: 'Verification Link Expired',
    description: 'The verification link has expired or has already been used.',
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The email address or password entered does not match our records.',
  },
  SessionRequired: {
    title: 'Sign In Required',
    description: 'Please sign in to access this page.',
  },
  Default: {
    title: 'Authentication Notice',
    description: 'An unexpected issue occurred during sign in. Please try signing in again.',
  },
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const rawError = params.error;
  const isInvalid = !rawError || rawError === 'undefined' || rawError === 'null';
  const errorInfo = isInvalid
    ? errorMessages.Default
    : (errorMessages[rawError] ?? errorMessages.Default);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <section className="card w-full max-w-md p-8 text-center relative z-10 border border-slate-800 shadow-2xl">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{errorInfo.title}</h1>
        <p role="alert" className="text-slate-400 text-sm leading-relaxed mb-6">
          {errorInfo.description}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/signin"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Go to Sign In
          </Link>

          <Link
            href="/"
            className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
