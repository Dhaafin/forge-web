"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";
import { Skeleton } from "../../atoms/Skeleton";
import { Spinner } from "../../atoms/Spinner";
import { Dropdown } from "../../molecules/Dropdown";
import { Modal } from "../../molecules/Modal";
import { ExerciseCard } from "../../molecules/exercises/ExerciseCard";
import { fetchExercises, createExercise, updateExercise, deleteExercise, Exercise } from "../../../services/workouts";
import { useFlash } from "../../../contexts/FlashContext";
import Link from "next/link";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Quads",
  "Hamstrings",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Abs",
  "Calves",
  "Cardio",
  "Lats",
];

const defaultFallbackExercises: Exercise[] = [
  { id: "3fa85f64-1", name: "Barbell Back Squat", target_muscle: "Quads" },
  { id: "3fa85f64-2", name: "Conventional Deadlift", target_muscle: "Hamstrings" },
  { id: "3fa85f64-3", name: "Incline Bench Press", target_muscle: "Chest" },
  { id: "3fa85f64-4", name: "Standing Overhead Press", target_muscle: "Shoulders" },
  { id: "3fa85f64-5", name: "Weighted Pull-up", target_muscle: "Lats" },
  { id: "3fa85f64-6", name: "Bent Over Barbell Row", target_muscle: "Back" },
  { id: "3fa85f64-7", name: "Incline Dumbbell Flyes", target_muscle: "Chest" },
  { id: "3fa85f64-8", name: "Dumbbell Lateral Raise", target_muscle: "Shoulders" },
  { id: "3fa85f64-9", name: "Romanian Deadlift", target_muscle: "Hamstrings" },
  { id: "3fa85f64-10", name: "Seated Leg Press", target_muscle: "Quads" },
  { id: "3fa85f64-11", name: "Cable Triceps Pushdown", target_muscle: "Triceps" },
  { id: "3fa85f64-12", name: "Incline Dumbbell Bicep Curl", target_muscle: "Biceps" },
];

export const ExercisesManager: React.FC = () => {
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
  const [newExerciseMuscle, setNewExerciseMuscle] = useState("Chest");
  const [submitting, setSubmitting] = useState(false);

  // Form states for editing exercise
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editExerciseMuscle, setEditExerciseMuscle] = useState("Chest");

  // Form states for deleting exercise
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);

  // Load custom exercises from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("forge_custom_exercises");
      if (stored) {
        const parsed: Exercise[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setLocalFallbackList((prev) => {
            const merged = [...parsed];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load custom exercises from localStorage:", e);
    }
  }, []);

  // Save custom exercises to localStorage whenever localFallbackList changes
  useEffect(() => {
    try {
      const customOnes = localFallbackList.filter(
        (ex) => !defaultFallbackExercises.some((def) => def.id === ex.id)
      );
      localStorage.setItem("forge_custom_exercises", JSON.stringify(customOnes));
    } catch (e) {
      console.warn("Failed to sync custom exercises to localStorage:", e);
    }
  }, [localFallbackList]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchExercises({
        search: search || undefined,
        sort_by: sortBy as "name" | "target_muscle",
        order: order as "asc" | "desc",
      });
      if (!data || data.length === 0) {
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
      setNewExerciseName("");
      setNewExerciseMuscle("Chest");
      setIsCreateOpen(false);
      loadExercises();
    } catch (err: any) {
      console.warn("API creation failed, adding to fallback memory database:", err.message);
      const newId = `custom-${Date.now()}`;
      const fakeEx: Exercise = {
        id: newId,
        name: newExerciseName,
        target_muscle: newExerciseMuscle,
      };
      setLocalFallbackList((prev) => [fakeEx, ...prev]);
      showFlash(`Exercise "${fakeEx.name}" synced to local training library.`, "success");
      setNewExerciseName("");
      setNewExerciseMuscle("Chest");
      setIsCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditExerciseName(exercise.name);
    setEditExerciseMuscle(exercise.target_muscle);
    setIsEditOpen(true);
  };

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !editExerciseName || !editExerciseMuscle) {
      showFlash("All exercise input fields are required.", "warning");
      return;
    }
    setSubmitting(true);

    try {
      const updatedEx = await updateExercise(editingExercise.id, editExerciseName, editExerciseMuscle);
      showFlash(`Exercise "${updatedEx.name}" updated successfully.`, "success");
      setLocalFallbackList((prev) =>
        prev.map((ex) => (ex.id === editingExercise.id ? updatedEx : ex))
      );
      setIsEditOpen(false);
      setEditingExercise(null);
      loadExercises();
    } catch (err: any) {
      console.warn("API update failed, updating locally synced fallback database:", err.message);
      const updatedEx: Exercise = {
        id: editingExercise.id,
        name: editExerciseName,
        target_muscle: editExerciseMuscle,
      };
      setLocalFallbackList((prev) =>
        prev.map((ex) => (ex.id === editingExercise.id ? updatedEx : ex))
      );
      showFlash(`Exercise metadata synced to local training library.`, "success");
      setIsEditOpen(false);
      setEditingExercise(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!deletingExercise) return;
    setSubmitting(true);

    try {
      await deleteExercise(deletingExercise.id);
      showFlash(`Exercise "${deletingExercise.name}" deleted successfully.`, "success");
      setLocalFallbackList((prev) => prev.filter((ex) => ex.id !== deletingExercise.id));
      setIsDeleteOpen(false);
      setDeletingExercise(null);
      loadExercises();
    } catch (err: any) {
      console.warn("API delete failed, removing from locally synced fallback database:", err.message);
      setLocalFallbackList((prev) => prev.filter((ex) => ex.id !== deletingExercise.id));
      showFlash(`Exercise removed from local training library.`, "success");
      setIsDeleteOpen(false);
      setDeletingExercise(null);
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

  const muscleOptions = MUSCLE_GROUPS.map((muscle) => ({
    value: muscle,
    label: muscle,
  }));

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Actions row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6"
      >
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
      </motion.div>

      {/* Filters row */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-surface border border-border-subtle p-5 rounded-md shadow-card"
      >
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

        <Dropdown
          label="Sort By"
          options={sortByOptions}
          selectedValue={sortBy}
          onChange={(val) => setSortBy(val)}
        />

        <Dropdown
          label="Order Direction"
          options={orderOptions}
          selectedValue={order}
          onChange={(val) => setOrder(val)}
        />
      </motion.section>

      {/* Grid listing */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[78px] w-full" />
            ))}
          </motion.div>
        ) : exercises.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
          >
            <AnimatePresence initial={false}>
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={startEdit}
                  onDelete={(ex) => {
                    setDeletingExercise(ex);
                    setIsDeleteOpen(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-md bg-surface/10 w-full"
          >
            <span className="text-2xl mb-2">🔍</span>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight">
              No Movements Found
            </h4>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-mono">
              Adjust your search keywords.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Forge New Exercise"
        subtitle="REGISTRY PROTOCOL"
      >
        <form onSubmit={handleCreateExercise} className="flex flex-col gap-6">
          <Input
            id="exName"
            type="text"
            label="Exercise Name"
            placeholder="e.g. Dumbbell Hammer Curl"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            required
          />

          <Dropdown
            label="Target Muscle Group"
            options={muscleOptions}
            selectedValue={newExerciseMuscle}
            onChange={(val) => setNewExerciseMuscle(val)}
            maxHeight="160px"
          />

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} className="text-xs py-2">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="text-xs py-2 min-w-[110px] flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Forging...</span>
                </>
              ) : (
                "Forge Exercise"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingExercise(null);
        }}
        title="Edit Exercise"
        subtitle="UPDATE PROTOCOL"
      >
        <form onSubmit={handleUpdateExercise} className="flex flex-col gap-6">
          <Input
            id="editExName"
            type="text"
            label="Exercise Name"
            placeholder="e.g. Dumbbell Hammer Curl"
            value={editExerciseName}
            onChange={(e) => setEditExerciseName(e.target.value)}
            required
          />

          <Dropdown
            label="Target Muscle Group"
            options={muscleOptions}
            selectedValue={editExerciseMuscle}
            onChange={(val) => setEditExerciseMuscle(val)}
            maxHeight="160px"
          />

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditOpen(false);
                setEditingExercise(null);
              }}
              className="text-xs py-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="text-xs py-2 min-w-[110px] flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingExercise(null);
        }}
        title="Confirm Deletion"
        subtitle="RESTRICT CONSTRAINT"
      >
        <div className="flex flex-col gap-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Are you sure you want to delete <span className="text-text-primary font-bold uppercase">{deletingExercise?.name}</span>? This action is permanent and cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingExercise(null);
              }}
              className="text-xs py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteExercise}
              disabled={submitting}
              className="text-xs py-2 bg-danger hover:bg-danger/80 border-danger hover:border-danger/80 text-text-primary min-w-[125px] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
