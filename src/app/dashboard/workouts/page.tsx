"use client";

import React from "react";
import { WorkoutHistoryList } from "../../../components/organisms/workouts/WorkoutHistoryList";

export default function WorkoutHistoryPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <WorkoutHistoryList />
    </main>
  );
}


