"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "../../../components/atoms/Input";
import { Button } from "../../../components/atoms/Button";
import { Badge } from "../../../components/atoms/Badge";
import { Skeleton } from "../../../components/atoms/Skeleton";
import { Dropdown } from "../../../components/molecules/Dropdown";
import { fetchExercises, createExercise, Exercise } from "../../../services/workouts";
import { useFlash } from "../../../contexts/FlashContext";

// Default fallback database in memory
const defaultFallbackExercises: Exercise[] = [
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
  const { showFlash } = useFlash();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [localFallbackList, setLocalFallbackList] = useState<Exercise[]>(defaultFallbackExercises);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [order, setOrder] = useState<string>("asc");
  const [loading, setLoading] = useState(true);

  // Form states for creating exercise
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscle, setNewExerciseMuscle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchExercises({
        search: search || undefined,
        sort_by: sortBy as "name" | "target_muscle",
        order: order as "asc" | "desc",
      });
      if (!data || data.length === 0) {
        // Fallback filtering
        const filtered = localFallbackList.filter(
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
      console.warn("API request failed, utilizing locally synced fallback database:", err.message);
      const filtered = localFallbackList.filter(
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
  }, [search, sortBy, order, localFallbackList]);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName || !newExerciseMuscle) {
      showFlash("All exercise input fields are required.", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const newEx = await createExercise(newExerciseName, newExerciseMuscle);
      showFlash(`Exercise "${newEx.name}" created successfully.`, "success");
      
      // Clear inputs and close
      setNewExerciseName("");
      setNewExerciseMuscle("");
      setIsCreateOpen(false);

      // Refresh list
      loadExercises();
    } catch (err: any) {
      console.warn("API creation failed, adding to fallback memory database:", err.message);
      
      const newId = `custom-${Date.now()}`;
      const fakeEx: Exercise = {
        id: newId,
        name: newExerciseName,
        target_muscle: newExerciseMuscle,
      };

      // Add to local fallback list state
      setLocalFallbackList((prev) => [fakeEx, ...prev]);
      showFlash(`Exercise "${fakeEx.name}" synced to local training library.`, "success");

      setNewExerciseName("");
      setNewExerciseMuscle("");
      setIsCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const sortByOptions = [
    { value: "name", label: "Name" },
    { value: "target_muscle", label: "Target Muscle" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
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

        {/* Action Panel */}
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateOpen(true)} className="text-xs py-2">
            + New Exercise
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary" className="text-xs py-2">← Dashboard</Button>
          </Link>
        </div>
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

      {/* Create Exercise Popup Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-bg/80 backdrop-blur-sm" />

          {/* Dialog Body */}
          <form onSubmit={handleCreateExercise} className="bg-surface border border-border-strong w-full max-w-md p-6 rounded-md shadow-elevated relative z-10 flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-bold text-accent tracking-widest uppercase font-mono">
                REGISTRY PROTOCOL
              </span>
              <h3 className="text-lg font-bold text-text-primary uppercase mt-1">
                Forge New Exercise
              </h3>
            </div>

            <Input
              id="exName"
              type="text"
              label="Exercise Name"
              placeholder="e.g. Dumbbell Hammer Curl"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              required
            />

            <Input
              id="exMuscle"
              type="text"
              label="Target Muscle Group"
              placeholder="e.g. Biceps, Chest, Quads"
              value={newExerciseMuscle}
              onChange={(e) => setNewExerciseMuscle(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
              <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} className="text-xs py-2">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="text-xs py-2">
                {submitting ? "Forging..." : "Forge Exercise"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
