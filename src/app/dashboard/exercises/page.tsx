import React from "react";
import { ExercisesManager } from "../../../components/organisms/exercises/ExercisesManager";

export default function ExercisesPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <ExercisesManager />
    </main>
  );
}
