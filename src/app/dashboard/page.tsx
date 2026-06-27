"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { StatWidget } from "../../components/molecules/StatWidget";
import { MemberCard } from "../../components/organisms/MemberCard";
import { WeekView } from "../../components/molecules/WeekView";
import { Skeleton } from "../../components/atoms/Skeleton";
import { fetchWorkoutHistory, WorkoutSession } from "../../services/workouts";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed stats
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [personalRecordsCount, setPersonalRecordsCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const historyData = await fetchWorkoutHistory();
        setSessions(historyData);

        // Calculate Completed Sessions
        setCompletedSessionsCount(historyData.length);

        // Calculate Personal Records
        const prs = historyData.reduce(
          (acc, session) => acc + (session.sets?.filter((s) => s.is_pr).length || 0),
          0
        );
        setPersonalRecordsCount(prs);

        // Calculate Streak
        const streak = calculateStreak(historyData);
        setStreakCount(streak);
      } catch (err) {
        console.warn("Failed to load dashboard data from API, using fallback", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const calculateStreak = (history: WorkoutSession[]): number => {
    if (history.length === 0) return 0;

    // Extract unique local dates (YYYY-MM-DD) sorted descending
    const activeDates = Array.from(
      new Set(history.map((s) => new Date(s.start_time).toLocaleDateString("en-CA")))
    ).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    let expectedDate = new Date();

    // Check if the most recent active date is either today or yesterday
    const todayStr = expectedDate.toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    if (activeDates[0] !== todayStr && activeDates[0] !== yesterdayStr) {
      return 0;
    }

    // Set expected date to the most recent active date
    expectedDate = new Date(activeDates[0]);

    for (const dateStr of activeDates) {
      const currentExpectedStr = expectedDate.toLocaleDateString("en-CA");
      if (dateStr === currentExpectedStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const formatStatValue = (val: number): string => {
    return val < 10 ? `0${val}` : `${val}`;
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-10 relative">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-10 w-full"
          >
            {/* Welcome Section Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-subtle pb-6 animate-pulse">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-36" />
                <Skeleton className="h-10 w-full sm:w-36" />
              </div>
            </div>

            {/* Performance Stats Row Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Panels Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="flex flex-col gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-10 w-full"
          >
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-subtle pb-6">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link href="/dashboard/workouts/record?mode=live" className="w-full sm:w-auto">
                  <button className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-bg text-[10px] font-bold tracking-widest uppercase rounded-xs transition-all duration-200 shadow-accent select-none cursor-pointer text-center">
                    ⚡ Start Live Session
                  </button>
                </Link>
                <Link href="/dashboard/workouts/record?mode=past" className="w-full sm:w-auto">
                  <button className="w-full px-4 py-2.5 bg-surface border border-border-subtle hover:border-accent-muted text-text-primary text-[10px] font-bold tracking-widest uppercase rounded-xs transition-all duration-200 select-none cursor-pointer text-center">
                    Log Past Session
                  </button>
                </Link>
              </div>
            </div>

            {/* Performance Stats row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatWidget
                value={formatStatValue(streakCount)}
                label="Current Streak"
                subLabel="Consecutive Active Days"
                icon="🔥"
              />
              <StatWidget
                value={formatStatValue(completedSessionsCount)}
                label="Completed Sessions"
                subLabel="Total Workouts Logged"
                icon="🏋️‍♂️"
              />
              <StatWidget
                value={formatStatValue(personalRecordsCount)}
                label="Personal Records"
                subLabel="Strength Goals Achieved"
                icon="🏆"
              />
            </section>

            {/* Dashboard Panels Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Week View / Calendar Panel (2/3 width on desktop) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <WeekView sessions={sessions} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
