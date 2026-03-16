import Link from "next/link";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { ArrowLeft } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="mb-8 animate-fade-in">
          <ClassivoLogo className="w-16 h-16 text-white opacity-90" />
        </div>

        <h1 className="text-8xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          404
        </h1>

        <h2 className="text-2xl font-medium text-white mb-4">
          Page not found
        </h2>

        <p className="text-gray-400 mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <Link
          href="/app/dashboard"
          className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Footer decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </main>
  );
}