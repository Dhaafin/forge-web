import React from "react";
import { WorkoutSessionBuilder } from "../../../../components/organisms/workouts/WorkoutSessionBuilder";

export default function RecordWorkoutPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <WorkoutSessionBuilder />
    </main>
  );
}
