"use client";

import React, { useState, useEffect } from "react";
import { WorkoutSession } from "../../services/workouts";

interface WorkoutDay {
  dayName: string;
  dayShort: string;
  date: number;
  status: "completed" | "scheduled" | "rest";
  workoutName?: string;
  duration?: string;
  time?: string;
  muscleGroups?: string[];
  exercises?: string[];
}

interface WeekViewProps {
  sessions: WorkoutSession[];
}

export const WeekView: React.FC<WeekViewProps> = ({ sessions }) => {
  const [weekData, setWeekData] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [timeframeText, setTimeframeText] = useState("");

  useEffect(() => {
    // Get start of current week (Monday)
    const today = new Date();
    const day = today.getDay();
    // Adjust so Monday is first day of week. If Sunday (0), go back 6 days.
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    // Timeframe text
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    setTimeframeText(
      `${monday.toLocaleDateString("en-US", options)} – ${sunday.toLocaleDateString(
        "en-US",
        options
      )}, ${sunday.getFullYear()}`
    );

    const weekDays: WorkoutDay[] = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayShorts = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      // Match sessions by YYYY-MM-DD
      const dateString = currentDate.toLocaleDateString("en-CA");
      const matchingSession = sessions.find(
        (s) => new Date(s.start_time).toLocaleDateString("en-CA") === dateString
      );

      const muscleGroups = matchingSession
        ? (Array.from(
            new Set(matchingSession.sets.map((s) => s.exercise?.target_muscle || s.target_muscle).filter(Boolean))
          ) as string[])
        : [];

      const exercises = matchingSession
        ? (Array.from(
            new Set(
              matchingSession.sets.map(
                (s) => `${s.exercise?.name || s.exercise_name || "Exercise"} (${s.weight_kg}kg × ${s.reps} reps)`
              )
            )
          ) as string[])
        : [];

      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      weekDays.push({
        dayName: dayNames[currentDate.getDay()],
        dayShort: dayShorts[currentDate.getDay()],
        date: currentDate.getDate(),
        status: matchingSession ? "completed" : isWeekend ? "rest" : "scheduled",
        workoutName: matchingSession
          ? matchingSession.title
          : isWeekend
          ? undefined
          : "Scheduled Routine",
        duration: matchingSession ? `${matchingSession.duration_minutes} mins` : undefined,
        time: matchingSession
          ? new Date(matchingSession.start_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        muscleGroups: matchingSession ? muscleGroups : undefined,
        exercises: matchingSession ? exercises : undefined,
      });
    }

    // Rearrange so it starts on Monday: MON, TUE, WED, THU, FRI, SAT, SUN
    const sortedDays = [...weekDays];
    const sun = sortedDays.shift(); // remove Sunday from the front
    if (sun) sortedDays.push(sun); // append Sunday to the back

    setWeekData(sortedDays);

    // Default select today's day if possible, or Monday
    const todayDate = new Date().getDate();
    const todayDayObj = sortedDays.find((d) => d.date === todayDate) || sortedDays[0];
    setSelectedDay(todayDayObj);
  }, [sessions]);

  if (weekData.length === 0 || !selectedDay) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Calendar Header Row */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
            Weekly Schedule
          </h3>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase font-mono">
            {timeframeText}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-text-muted uppercase font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full border border-accent" /> Sched
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-border-strong" /> Rest
          </span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => {
          const isSelected = selectedDay.date === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xs border transition-all duration-300 outline-none cursor-pointer ${
                isSelected
                  ? "bg-accent-glow border-accent shadow-accent"
                  : "bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-hover"
              }`}
            >
              <span className="text-[9px] font-bold tracking-wider text-text-secondary">
                {day.dayShort}
              </span>
              <span
                className={`font-display text-2xl leading-none ${
                  isSelected ? "text-text-accent" : "text-text-primary"
                }`}
              >
                {day.date}
              </span>

              {/* Day Status Indicator */}
              <span className="mt-1 flex items-center justify-center h-2.5">
                {day.status === "completed" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                )}
                {day.status === "scheduled" && (
                  <span className="w-1.5 h-1.5 rounded-full border border-accent" />
                )}
                {day.status === "rest" && <span className="w-2.5 h-0.5 bg-border-strong" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail Workout Card */}
      <div className="bg-surface-raised border border-border-strong p-6 rounded-md shadow-elevated transition-all duration-300">
        {selectedDay.workoutName ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-subtle pb-4">
              <div>
                <span className="text-[9px] font-bold text-accent tracking-widest uppercase">
                  {selectedDay.dayName} Lineup
                </span>
                <h4 className="text-xl font-bold text-text-primary tracking-tight uppercase">
                  {selectedDay.workoutName}
                </h4>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-text-secondary">
                {selectedDay.duration && (
                  <span className="flex items-center gap-1.5">⏱ {selectedDay.duration}</span>
                )}
                {selectedDay.time && (
                  <span className="flex items-center gap-1.5">🔔 {selectedDay.time}</span>
                )}
              </div>
            </div>

            {/* Muscle groups targeted */}
            {selectedDay.muscleGroups && selectedDay.muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDay.muscleGroups.map((group) => (
                  <span
                    key={group}
                    className="px-2.5 py-0.5 bg-surface border border-border-subtle text-[8px] font-bold tracking-wider text-text-secondary uppercase rounded-xs"
                  >
                    {group}
                  </span>
                ))}
              </div>
            )}

            {/* Exercises lineup */}
            {selectedDay.exercises && selectedDay.exercises.length > 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] font-bold tracking-widest text-text-muted uppercase">
                  PERFORMANCE SETS
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedDay.exercises.map((exercise, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-surface border border-border-subtle rounded-xs text-xs text-text-primary hover:border-accent-muted transition-colors duration-200"
                    >
                      <span className="font-mono text-[10px] text-accent">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="font-sans text-text-secondary">{exercise}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No specific sets recorded.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-2xl mb-2">🧘‍♂️</span>
            <h4 className="text-base font-bold text-text-primary tracking-tight uppercase">
              Recovery & Rest
            </h4>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mt-1 max-w-xs leading-relaxed">
              No training scheduled. Prioritize premium hydration, recovery protocols, and deep sleep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
