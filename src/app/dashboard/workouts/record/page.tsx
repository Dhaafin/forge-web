import React, { Suspense } from "react";
import { WorkoutSessionBuilder } from "../../../../components/organisms/workouts/WorkoutSessionBuilder";

export default function RecordWorkoutPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <Suspense fallback={
        <div className="flex flex-col gap-8 w-full animate-pulse">
          <div className="flex flex-col gap-2 pb-6 border-b border-border-subtle">
            <div className="h-3 w-36 bg-surface-subtle rounded-sm" />
            <div className="h-9 w-64 bg-surface-subtle rounded-sm mt-2" />
          </div>
          <div className="h-48 w-full bg-surface-subtle rounded-md" />
        </div>
      }>
        <WorkoutSessionBuilder />
      </Suspense>
    </main>
  );
}

