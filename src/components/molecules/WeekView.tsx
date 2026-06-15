"use client";

import React, { useState } from "react";

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

export const WeekView: React.FC = () => {
  const mockWeekData: WorkoutDay[] = [
    {
      dayName: "Monday",
      dayShort: "MON",
      date: 15,
      status: "completed",
      workoutName: "Hypertrophy Push I",
      duration: "75 mins",
      time: "07:30 AM",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: ["Flat DB Bench Press (4x8)", "Incline Smith Press (3x10)", "Lateral Raises (4x15)", "Cable Pushdowns (3x12)"],
    },
    {
      dayName: "Tuesday",
      dayShort: "TUE",
      date: 16,
      status: "completed",
      workoutName: "Posterior Chain Pull I",
      duration: "80 mins",
      time: "08:00 AM",
      muscleGroups: ["Back", "Biceps", "Rear Delts"],
      exercises: ["Barbell Deadlifts (4x5)", "Weighted Pull-ups (3x8)", "Seated Cable Rows (3x12)", "Hammer Curls (4x10)"],
    },
    {
      dayName: "Wednesday",
      dayShort: "WED",
      date: 17,
      status: "rest",
      workoutName: "Active Recovery & Mobility",
      duration: "45 mins",
      time: "09:00 AM",
      muscleGroups: ["Mobility", "Core"],
      exercises: ["Dynamic Stretching Flow", "Deep Squat Holds", "Plank Variations (3x60s)"],
    },
    {
      dayName: "Thursday",
      dayShort: "THU",
      date: 18,
      status: "scheduled",
      workoutName: "Quad Focus Lower I",
      duration: "90 mins",
      time: "06:30 PM",
      muscleGroups: ["Quads", "Hamstrings", "Calves"],
      exercises: ["Barbell Back Squats (4x6)", "Romanian Deadlifts (3x10)", "Leg Extensions (3x15)", "Standing Calf Raises (4x12)"],
    },
    {
      dayName: "Friday",
      dayShort: "FRI",
      date: 19,
      status: "scheduled",
      workoutName: "Upper Body Aesthetics",
      duration: "70 mins",
      time: "07:00 AM",
      muscleGroups: ["Chest", "Back", "Arms"],
      exercises: ["Incline DB Flyes (3x12)", "Chest-Supported Rows (3x10)", "Overhead DB Extensions (3x12)", "Incline Bicep Curls (3x12)"],
    },
    {
      dayName: "Saturday",
      dayShort: "SAT",
      date: 20,
      status: "rest",
    },
    {
      dayName: "Sunday",
      dayShort: "SUN",
      date: 21,
      status: "scheduled",
      workoutName: "Conditioning & Zone 2 Cardio",
      duration: "60 mins",
      time: "08:30 AM",
      muscleGroups: ["Cardio", "Endurance"],
      exercises: ["Incline Rucking / Walk", "Sled Pushes (5 rounds)", "Assault Bike Intervals"],
    },
  ];

  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(mockWeekData[3]); // Default select Thursday (Active Day)

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Calendar Header Row */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
            Weekly Schedule
          </h3>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase font-mono">
            June 15 – June 21, 2026
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-text-muted uppercase font-mono">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success" /> Done</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-accent" /> Sched</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-border-strong" /> Rest</span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {mockWeekData.map((day) => {
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
              <span className={`font-display text-2xl leading-none ${isSelected ? "text-text-accent" : "text-text-primary"}`}>
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
                {day.status === "rest" && (
                  <span className="w-2.5 h-0.5 bg-border-strong" />
                )}
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
                <span className="flex items-center gap-1.5">⏱ {selectedDay.duration}</span>
                <span className="flex items-center gap-1.5">🔔 {selectedDay.time}</span>
              </div>
            </div>

            {/* Muscle groups targeted */}
            <div className="flex flex-wrap gap-2">
              {selectedDay.muscleGroups?.map((group) => (
                <span key={group} className="px-2.5 py-0.5 bg-surface border border-border-subtle text-[8px] font-bold tracking-wider text-text-secondary uppercase rounded-xs">
                  {group}
                </span>
              ))}
            </div>

            {/* Exercises lineup */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] font-bold tracking-widest text-text-muted uppercase">
                PERFORMANCE SETS
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedDay.exercises?.map((exercise, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-surface border border-border-subtle rounded-xs text-xs text-text-primary hover:border-accent-muted transition-colors duration-200"
                  >
                    <span className="font-mono text-[10px] text-accent">0{idx + 1}</span>
                    <span className="font-sans text-text-secondary">{exercise}</span>
                  </li>
                ))}
              </ul>
            </div>
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
