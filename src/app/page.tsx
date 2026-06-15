import Image from "next/image";
import { LoginForm } from "../components/organisms/LoginForm";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Left Pane - Atmospheric Visuals (60%) */}
      <div className="relative hidden md:flex w-[60%] flex-col justify-between p-16 overflow-hidden border-r border-border-subtle select-none">
        {/* Background Image */}
        <Image
          src="/login_bg.png"
          alt="Forge Private Gym Background"
          fill
          priority
          className="object-cover object-center brightness-75 transition-transform duration-[10000ms] hover:scale-105"
        />

        {/* Dark subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-bg/10 mix-blend-multiply pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-xl font-bold tracking-[0.3em] text-text-primary">
            FORGE
          </span>
          <span className="px-2 py-0.5 border border-accent text-[9px] font-bold tracking-widest text-text-accent rounded-xs">
            ATHLETIC
          </span>
        </div>

        {/* Large atmospheric statement */}
        <div className="relative z-10 flex flex-col gap-4 max-w-xl">
          <h1 className="font-display text-7xl lg:text-8xl tracking-wide text-text-primary leading-none">
            FORGED,<br />NOT BORN.
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed font-sans max-w-sm">
            Welcome to the elite tier of personal performance. Experience bespoke tracking, high-end analytics, and community integration.
          </p>
        </div>

        {/* Fine-print / Status */}
        <div className="relative z-10 flex items-center justify-between text-[10px] tracking-widest text-text-muted uppercase">
          <span>PRIVATE ATHLETIC CLUB</span>
          <span>EST. 2026</span>
        </div>
      </div>

      {/* Right Pane - LoginForm portal (40%) */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-bg relative">
        {/* Mobile branding */}
        <div className="absolute top-12 left-8 md:hidden flex items-center gap-3">
          <span className="text-lg font-bold tracking-[0.3em] text-text-primary">
            FORGE
          </span>
          <span className="px-1.5 py-0.5 border border-accent text-[8px] font-bold tracking-widest text-text-accent rounded-xs">
            ATHLETIC
          </span>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
