import React from "react";
import Link from "next/link";
import { StatWidget } from "../../components/molecules/StatWidget";
import { MemberCard } from "../../components/organisms/MemberCard";
import { WeekView } from "../../components/molecules/WeekView";

export default function DashboardPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-10">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-accent tracking-widest uppercase font-mono">
          DAILY PERFORMANCE PROTOCOL
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary uppercase">
          Welcome back, Dhaafin
        </h2>
        <p className="text-xs text-text-secondary max-w-lg leading-relaxed">
          Your conditioning session is ready for check-in today. Stay disciplined, forge ahead.
        </p>
      </div>

      {/* Performance Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatWidget value="14" label="Current Streak" subLabel="Consecutive Active Days" icon="🔥" />
        <StatWidget value="42" label="Completed Sessions" subLabel="Total Workouts Logged" icon="🏋️‍♂️" />
        <StatWidget value="08" label="Personal Records" subLabel="Strength Goals Achieved" icon="🏆" />
      </section>

      {/* Dashboard Panels Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Week View / Calendar Panel (2/3 width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <WeekView />
        </div>

        {/* Member Card / Membership details Panel (1/3 width on desktop) */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-border-subtle pb-4">
            <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
              Membership Pass
            </h3>
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-mono">
              Verify Club Credentials
            </span>
          </div>
          <MemberCard
            name="Dhaafin"
            memberId="FRG-98422-X"
            tier="Platinum"
            memberSince="JUNE 2026"
          />
        </div>
      </section>
    </main>
  );
}
