import Image from "next/image";
import { LoginForm } from "../components/organisms/LoginForm";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-bg md:flex-row md:items-stretch overflow-y-auto py-8 md:py-0">
      {/* Mobile background image (only visible below md) */}
      <div className="absolute inset-0 md:hidden z-0 select-none pointer-events-none">
        <Image
          src="/login_bg.png"
          alt="Forge Private Gym Background"
          fill
          priority
          className="object-cover object-center brightness-40"
        />
        {/* Dark overlay and subtle blur for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/20" />
      </div>

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

      {/* Right Pane - LoginForm portal (40% on desktop, glass container on mobile) */}
      <div className="relative z-10 flex w-full max-w-[90%] sm:max-w-md md:max-w-none md:w-[40%] flex-col items-center justify-center p-6 sm:p-10 md:p-16 rounded-xl bg-surface/70 backdrop-blur-md border border-accent/15 shadow-accent md:shadow-none md:bg-bg md:backdrop-blur-none md:border-0 md:rounded-none my-auto">
        {/* Mobile branding */}
        <div className="mb-8 md:hidden flex flex-col items-center gap-2 select-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-[0.3em] text-text-primary">
              FORGE
            </span>
            <span className="px-1.5 py-0.5 border border-accent text-[8px] font-bold tracking-widest text-text-accent rounded-xs">
              ATHLETIC
            </span>
          </div>
          <span className="text-[10px] tracking-[0.2em] text-text-muted uppercase font-semibold">
            PRIVATE ATHLETIC CLUB
          </span>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

