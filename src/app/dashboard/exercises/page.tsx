"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "../../../components/atoms/Input";
import { Button } from "../../../components/atoms/Button";
import { Badge } from "../../../components/atoms/Badge";
import { Skeleton } from "../../../components/atoms/Skeleton";
import { Dropdown } from "../../../components/molecules/Dropdown";
import { fetchExercises, Exercise } from "../../../services/workouts";

// Beautiful default fallback exercises in case backend is offline
const fallbackExercises: Exercise[] = [
  { id: "3fa85f64-1", name: "Barbell Back Squat", target_muscle: "Quads" },
  { id: "3fa85f64-2", name: "Conventional Deadlift", target_muscle: "Hamstrings" },
  { id: "3fa85f64-3", name: "Incline Bench Press", target_muscle: "Chest" },
  { id: "3fa85f64-4", name: "Standing Overhead Press", target_muscle: "Shoulders" },
  { id: "3fa85f64-5", name: "Weighted Pull-up", target_muscle: "Lats" },
  { id: "3fa85f64-6", name: "Bent Over Barbell Row", target_muscle: "Upper Back" },
  { id: "3fa85f64-7", name: "Incline Dumbbell Flyes", target_muscle: "Upper Chest" },
  { id: "3fa85f64-8", name: "Dumbbell Lateral Raise", target_muscle: "Lateral Delts" },
  { id: "3fa85f64-9", name: "Romanian Deadlift", target_muscle: "Hamstrings" },
  { id: "3fa85f64-10", name: "Seated Leg Press", target_muscle: "Quads" },
  { id: "3fa85f64-11", name: "Cable Triceps Pushdown", target_muscle: "Triceps" },
  { id: "3fa85f64-12", name: "Incline Dumbbell Bicep Curl", target_muscle: "Biceps" },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [order, setOrder] = useState<string>("asc");
  const [loading, setLoading] = useState(true);

  const loadExercises = async () => {
    setLoading(true);
    // Artificially wait slightly to allow skeleton animation to showcase smoothly
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const data = await fetchExercises({
        search: search || undefined,
        sort_by: sortBy as "name" | "target_muscle",
        order: order as "asc" | "desc",
      });
      // Fallback if API returned empty array and we want to show content
      if (!data || data.length === 0) {
        const filtered = fallbackExercises.filter(
          (ex) =>
            ex.name.toLowerCase().includes(search.toLowerCase()) ||
            ex.target_muscle.toLowerCase().includes(search.toLowerCase())
        );
        filtered.sort((a, b) => {
          const fieldA = sortBy === "name" ? a.name : a.target_muscle;
          const fieldB = sortBy === "name" ? b.name : b.target_muscle;
          if (order === "asc") return fieldA.localeCompare(fieldB);
          return fieldB.localeCompare(fieldA);
        });
        setExercises(filtered);
      } else {
        setExercises(data);
      }
    } catch (err: any) {
      console.warn("API request failed, utilizing fallback exercises database:", err.message);
      const filtered = fallbackExercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(search.toLowerCase()) ||
          ex.target_muscle.toLowerCase().includes(search.toLowerCase())
      );
      filtered.sort((a, b) => {
        const fieldA = sortBy === "name" ? a.name : a.target_muscle;
        const fieldB = sortBy === "name" ? b.name : b.target_muscle;
        if (order === "asc") return fieldA.localeCompare(fieldB);
        return fieldB.localeCompare(fieldA);
      });
      setExercises(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [search, sortBy, order]);

  const sortByOptions = [
    { value: "name", label: "Name" },
    { value: "target_muscle", label: "Target Muscle" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-accent tracking-widest uppercase font-mono">
            EXERCISE PROTOCOL LIBRARY
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary uppercase">
            WORKOUT EXERCISES
          </h2>
          <p className="text-xs text-text-secondary max-w-md leading-relaxed">
            Browse the library of default training movements and customized targets.
          </p>
        </div>

        {/* Quick link back */}
        <Link href="/dashboard">
          <Button variant="secondary" className="text-xs py-2">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Filter Controls Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-surface border border-border-subtle p-5 rounded-md shadow-card">
        {/* Search box */}
        <div className="md:col-span-2">
          <Input
            id="search"
            type="text"
            label="Search Movements"
            placeholder="e.g. Squat, Chest, Pull..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Custom Dropdown Sort By */}
        <Dropdown
          label="Sort By"
          options={sortByOptions}
          selectedValue={sortBy}
          onChange={(val) => setSortBy(val)}
        />

        {/* Custom Dropdown Order Direction */}
        <Dropdown
          label="Order Direction"
          options={orderOptions}
          selectedValue={order}
          onChange={(val) => setOrder(val)}
        />
      </section>

      {/* Exercises Grid List */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Render 6 sleek skeleton cards while loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[78px] w-full" />
          ))}
        </section>
      ) : exercises.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-surface border border-border-subtle p-5 rounded-md hover:border-accent-muted transition-all duration-300 flex items-center justify-between shadow-card group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] tracking-widest font-mono text-text-muted">ID: {exercise.id.slice(0, 8)}</span>
                <h4 className="text-sm font-bold text-text-primary uppercase group-hover:text-text-accent transition-colors">
                  {exercise.name}
                </h4>
              </div>
              <span className="text-[9px] bg-bg border border-border-subtle px-2.5 py-1 text-text-secondary rounded-xs uppercase font-semibold tracking-wider font-mono">
                {exercise.target_muscle}
              </span>
            </div>
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-md bg-surface/10">
          <span className="text-2xl mb-2">🔍</span>
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight">
            No Movements Found
          </h4>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-mono">
            Adjust your search keywords.
          </p>
        </div>
      )}
    </main>
  );
}
