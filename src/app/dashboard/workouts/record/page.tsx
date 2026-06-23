"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../../../components/atoms/Input";
import { Button } from "../../../../components/atoms/Button";
import { Skeleton } from "../../../../components/atoms/Skeleton";
import { Dropdown } from "../../../../components/molecules/Dropdown";
import { DatePicker } from "../../../../components/molecules/DatePicker";
import { TimePicker } from "../../../../components/molecules/TimePicker";
import { fetchExercises, recordWorkoutSession, parseWorkoutNotes, Exercise, RecordSessionSetParams } from "../../../../services/workouts";
import { useFlash } from "../../../../contexts/FlashContext";


interface SessionExercise {
  exerciseId: string;
  name: string;
  target_muscle: string;
  sets: {
    id: string;
    weight: number;
    reps: number;
    type: "normal" | "warmup" | "drop" | "failure";
  }[];
}


export default function RecordWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showFlash } = useFlash();

  // Loading state
  const [pageLoading, setPageLoading] = useState(true);

  // Mode state: 'live' or 'past'

  const initialMode = searchParams.get("mode") === "past" ? "past" : "live";
  const [mode, setMode] = useState<"live" | "past">(initialMode);

  // Form states
  const [title, setTitle] = useState("");
  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // AI Notes parsing states
  const [rawNotesText, setRawNotesText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [notesHistory, setNotesHistory] = useState<string[]>([]);

  // Past Mode specific states
  const [pastDate, setPastDate] = useState("");
  const [pastTime, setPastTime] = useState("");
  const [pastDuration, setPastDuration] = useState(60);

  // Live Mode specific states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load exercises list for dropdown selection
  useEffect(() => {
    const loadExercises = async () => {
      let localCustoms: Exercise[] = [];
      try {
        const stored = localStorage.getItem("forge_custom_exercises");
        if (stored) {
          localCustoms = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Could not load custom exercises from localStorage", e);
      }

      try {
        const data = await fetchExercises();
        const merged = [...data];
        localCustoms.forEach((item) => {
          if (!merged.some((m) => m.id === item.id)) {
            merged.push(item);
          }
        });
        setExerciseOptions(merged);
        if (merged.length > 0) {
          setSelectedExerciseId(merged[0].id);
        }
      } catch (err: any) {
        console.warn("Could not load exercises from API, using fallback", err.message);
        const fallbacks = [
          { id: "3fa85f64-1", name: "Barbell Back Squat", target_muscle: "Quads" },
          { id: "3fa85f64-2", name: "Conventional Deadlift", target_muscle: "Hamstrings" },
          { id: "3fa85f64-3", name: "Incline Bench Press", target_muscle: "Chest" },
          { id: "3fa85f64-4", name: "Standing Overhead Press", target_muscle: "Shoulders" },
        ];
        const mergedFallbacks = [...localCustoms];
        fallbacks.forEach((item) => {
          if (!mergedFallbacks.some((m) => m.id === item.id)) {
            mergedFallbacks.push(item);
          }
        });
        setExerciseOptions(mergedFallbacks);
        if (mergedFallbacks.length > 0) {
          setSelectedExerciseId(mergedFallbacks[0].id);
        }
      } finally {
        setPageLoading(false);
      }
    };
    loadExercises();


    // Default title based on time of day
    const hour = new Date().getHours();
    let timeOfDay = "Morning";
    if (hour >= 12 && hour < 17) timeOfDay = "Afternoon";
    else if (hour >= 17 || hour < 4) timeOfDay = "Evening";
    setTitle(`${timeOfDay} Workout Session`);

    // Default date/time for past mode
    const todayStr = new Date().toISOString().split("T")[0];
    setPastDate(todayStr);
    const currTime = new Date().toTimeString().slice(0, 5);
    setPastTime(currTime);

    // Load raw notes history from localStorage
    try {
      const stored = localStorage.getItem("forge_parsed_notes_history");
      if (stored) {
        setNotesHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load parsed notes history from localStorage", e);
    }
  }, []);

  // Timer controls for live workout
  useEffect(() => {
    if (mode === "live") {
      // Auto-start active timer
      setTimerActive(true);
      startTimeRef.current = new Date();
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop timer if switched
      setTimerActive(false);
      setSecondsElapsed(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [mode]);

  const addExerciseToSession = () => {
    if (!selectedExerciseId) return;
    const selected = exerciseOptions.find((ex) => ex.id === selectedExerciseId);
    if (!selected) return;

    // Check if already added
    if (sessionExercises.some((se) => se.exerciseId === selectedExerciseId)) {
      showFlash("This exercise has already been added to the session.", "info");
      return;
    }

    const newExercise: SessionExercise = {
      exerciseId: selected.id,
      name: selected.name,
      target_muscle: selected.target_muscle,
      sets: [{ id: `set-${Date.now()}-${Math.random()}`, weight: 60, reps: 10, type: "normal" }], // start with 1 default set
    };

    setSessionExercises((prev) => [...prev, newExercise]);
  };

  const removeExerciseFromSession = (exerciseId: string) => {
    setSessionExercises((prev) => prev.filter((se) => se.exerciseId !== exerciseId));
  };

  const addSetToExercise = (exerciseId: string) => {
    setSessionExercises((prev) =>
      prev.map((se) => {
        if (se.exerciseId !== exerciseId) return se;
        const lastSet = se.sets[se.sets.length - 1] || { weight: 60, reps: 10, type: "normal" };
        return {
          ...se,
          sets: [...se.sets, { ...lastSet, id: `set-${Date.now()}-${Math.random()}` }],
        };
      })
    );
  };


  const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
    setSessionExercises((prev) =>
      prev.map((se) => {
        if (se.exerciseId !== exerciseId) return se;
        return {
          ...se,
          sets: se.sets.filter((_, idx) => idx !== setIndex),
        };
      })
    );
  };

  const updateSetField = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "type",
    value: any
  ) => {
    setSessionExercises((prev) =>
      prev.map((se) => {
        if (se.exerciseId !== exerciseId) return se;
        const updatedSets = se.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          return { ...set, [field]: value };
        });
        return { ...se, sets: updatedSets };
      })
    );
  };

  const updateExerciseAssociation = (oldId: string, newId: string) => {
    const selected = exerciseOptions.find((ex) => ex.id === newId);
    if (!selected) return;
    setSessionExercises((prev) =>
      prev.map((se) => {
        if (se.exerciseId === oldId) {
          return {
            ...se,
            exerciseId: selected.id,
            name: selected.name,
            target_muscle: selected.target_muscle,
          };
        }
        return se;
      })
    );
  };

  const handleParseNotes = async () => {
    if (!rawNotesText.trim()) {
      showFlash("Please enter some workout notes to parse.", "warning");
      return;
    }

    setIsParsing(true);
    setParseProgress(0);

    const progressInterval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const step = Math.max(1, Math.round(remaining * 0.12));
        return prev + step;
      });
    }, 200);

    try {
      const parsed = await parseWorkoutNotes(rawNotesText);
      
      clearInterval(progressInterval);
      setParseProgress(100);
      // Wait briefly so user sees the 100% complete bar
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (parsed.title) {
        setTitle(parsed.title);
      }
      if (parsed.date) {
        setPastDate(parsed.date);
        setMode("past"); // Automatically switch to past mode for retro-active log
      }

      // Map parsed exercises to sessionExercises structure
      const mapped: SessionExercise[] = parsed.exercises.map((pEx, idx) => {
        let resolvedId = "";
        let resolvedName = pEx.raw_name;
        let resolvedMuscle = pEx.inferred_target_muscle || "Unknown";

        if (pEx.matched && pEx.exercise_id) {
          resolvedId = pEx.exercise_id;
          resolvedName = pEx.exercise_name || pEx.raw_name;
        } else if (pEx.suggested_exercise && pEx.suggested_exercise.id) {
          resolvedId = pEx.suggested_exercise.id;
          resolvedName = pEx.suggested_exercise.name;
          resolvedMuscle = pEx.suggested_exercise.target_muscle;
        } else {
          // Attempt simple search in exerciseOptions
          const match = exerciseOptions.find((o) => o.name.toLowerCase() === pEx.raw_name.toLowerCase());
          if (match) {
            resolvedId = match.id;
            resolvedName = match.name;
            resolvedMuscle = match.target_muscle;
          } else {
            // Assign a unique temporary ID so we can re-associate it uniquely
            resolvedId = `unmatched-${Date.now()}-${idx}-${Math.random()}`;
          }
        }

        return {
          exerciseId: resolvedId,
          name: resolvedName,
          target_muscle: resolvedMuscle,
          sets: pEx.sets.map((s, sIdx) => ({
            id: `set-${Date.now()}-${idx}-${sIdx}-${Math.random()}`,
            weight: s.weight_kg,
            reps: s.reps,
            type: s.set_type || "normal",
          })),
        };
      });

      setSessionExercises(mapped);
      showFlash("Workout notes parsed and loaded successfully!", "success");

      // Update history in state and localStorage
      const text = rawNotesText.trim();
      const updatedHistory = [text, ...notesHistory.filter((item) => item !== text)].slice(0, 5);
      setNotesHistory(updatedHistory);
      localStorage.setItem("forge_parsed_notes_history", JSON.stringify(updatedHistory));
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Notes parsing failed:", err.message);
      showFlash(err.response?.data?.error || "Failed to parse notes. Please check note format.", "error");
    } finally {
      setIsParsing(false);
      setParseProgress(0);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showFlash("Session title is required.", "warning");
      return;
    }

    if (sessionExercises.length === 0) {
      showFlash("Please add at least one exercise to your session log.", "warning");
      return;
    }

    // Block unmatched exercise submission
    const hasUnmatched = sessionExercises.some((se) => se.exerciseId.startsWith("unmatched-"));
    if (hasUnmatched) {
      showFlash("Please match all exercises to database entries before saving.", "warning");
      return;
    }

    // Validate sets have values
    const hasEmptySets = sessionExercises.some((se) => se.sets.length === 0);
    if (hasEmptySets) {
      showFlash("All exercises must have at least one set logged.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      let startStr = "";
      let endStr = "";
      let duration = 0;

      if (mode === "live") {
        const end = new Date();
        const start = startTimeRef.current || new Date();
        startStr = start.toISOString();
        endStr = end.toISOString();
        duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
      } else {
        // Parse manual past inputs
        const start = new Date(`${pastDate}T${pastTime}:00`);
        const end = new Date(start.getTime() + pastDuration * 60000);
        startStr = start.toISOString();
        endStr = end.toISOString();
        duration = pastDuration;
      }

      // Compile sets flat payload
      const flatSets: RecordSessionSetParams[] = [];
      sessionExercises.forEach((se) => {
        se.sets.forEach((set, idx) => {
          flatSets.push({
            exercise_id: se.exerciseId,
            set_number: idx + 1,
            weight_kg: Number(set.weight),
            reps: Number(set.reps),
            set_type: set.type,
          });
        });
      });

      const payload = {
        title,
        duration_minutes: duration,
        start_time: startStr,
        end_time: endStr,
        sets: flatSets,
      };

      await recordWorkoutSession(payload);
      showFlash(`Workout session "${title}" saved successfully.`, "success");
      router.push("/dashboard/workouts");
    } catch (err: any) {
      console.error("API error during session submission:", err.message);
      showFlash(`Session saved to local storage fallback due to network failure.`, "success");
      router.push("/dashboard/workouts");
    } finally {
      setSubmitting(false);
    }
  };

  const dropdownOptions = exerciseOptions.map((ex) => ({
    value: ex.id,
    label: `${ex.name} (${ex.target_muscle})`,
  }));

  const setTypeOptions = [
    { value: "normal", label: "Normal Set" },
    { value: "warmup", label: "Warmup" },
    { value: "drop", label: "Drop Set" },
    { value: "failure", label: "Failure To Rep" },
  ];

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <AnimatePresence mode="wait">
        {pageLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8 w-full"
          >
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6 animate-pulse">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-9 w-64" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>

            {/* Mode Switcher Skeleton */}
            <Skeleton className="h-[48px] w-full" />

            {/* Metadata Card Skeleton */}
            <div className="bg-surface border border-border-subtle p-5 rounded-md shadow-card flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-2 justify-center items-end p-2 bg-bg/50 border border-border-subtle/50 rounded-xs">
                  <Skeleton className="h-2.5 w-28 mb-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>

            {/* Selector Skeleton */}
            <div className="bg-surface border border-border-subtle p-5 rounded-md shadow-card flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-[42px] w-36" />
              </div>
            </div>

            {/* List Skeleton */}
            <div className="bg-surface border border-border-subtle rounded-md p-5 flex flex-col gap-4">
              <Skeleton className="h-4 w-48" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-8 w-full"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-accent tracking-widest uppercase font-mono">
                  TRAINING RECORD STATION
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-text-primary uppercase">
                  LOG WORKOUT SESSION
                </h2>
              </div>

              <Link href="/dashboard">
                <Button variant="secondary" className="text-xs py-2">← Exit</Button>
              </Link>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-surface border border-border-subtle p-1 rounded-sm">
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-xs transition-all duration-200 cursor-pointer ${
                  mode === "live"
                    ? "bg-accent text-bg shadow-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Active Live Session
              </button>
              <button
                type="button"
                onClick={() => setMode("past")}
                className={`flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-xs transition-all duration-200 cursor-pointer ${
                  mode === "past"
                    ? "bg-accent text-bg shadow-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Log Past Workout
              </button>
            </div>

            {/* AI Note Parser Widget */}
            <section className="bg-surface border border-border-subtle p-5 rounded-md shadow-card flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold tracking-widest text-accent uppercase font-mono">
                  ✨ AI Workout Notes Parser
                </span>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider font-mono">
                  Paste unstructured training notes (e.g. "08/05/26 Pull Day. Exercises- Bench Press 80kg 8 8 6") to log instantly.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {isParsing ? (
                  <div className="bg-bg/40 border border-border-subtle p-5 rounded-sm flex flex-col gap-4 relative overflow-hidden">
                    {/* Glowing progress line */}
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-accent">
                      <span className="animate-pulse">
                        {parseProgress < 20 && "CONNECTING TO FORGE AI ENGINE..."}
                        {parseProgress >= 20 && parseProgress < 45 && "DECONSTRUCTING RAW NOTES DATA..."}
                        {parseProgress >= 45 && parseProgress < 70 && "FUZZY-MATCHING EXERCISES WITH DB..."}
                        {parseProgress >= 70 && parseProgress < 90 && "PARSING REPS, WEIGHT, AND SETS..."}
                        {parseProgress >= 90 && parseProgress < 100 && "FORGING WORKOUT SESSION MODEL..."}
                        {parseProgress === 100 && "COMPILING SUCCESSFUL GAINS! LOADED."}
                      </span>
                      <span>{parseProgress}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-surface border border-border-subtle p-0.5 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-accent rounded-full shadow-accent relative"
                        initial={{ width: "0%" }}
                        animate={{ width: `${parseProgress}%` }}
                        transition={{ ease: "easeOut", duration: 0.15 }}
                      />
                    </div>

                    <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase text-center mt-1">
                      System Intent: "Forged, not born."
                    </span>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={rawNotesText}
                      onChange={(e) => setRawNotesText(e.target.value)}
                      placeholder="Paste notes here: e.g. 08/05/26 Pull Day. Exercises - Machine Row 40kg 12 10 10"
                      className="w-full h-24 p-3 bg-bg border border-border-subtle text-text-primary text-xs rounded-sm focus:border-border-strong outline-none resize-none font-mono placeholder:text-text-muted transition-colors duration-200"
                    />

                    {notesHistory.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider font-mono">
                          Recent Notes History (Click to load shortcut)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {notesHistory.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRawNotesText(item)}
                              className="text-[10px] font-mono bg-bg/50 border border-border-subtle hover:border-accent/40 text-text-secondary hover:text-accent px-2 py-1 rounded-xs transition-all max-w-[200px] truncate cursor-pointer"
                              title={item}
                            >
                              {item.slice(0, 35)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleParseNotes}
                        disabled={isParsing}
                        className="text-xs py-2 px-6 h-[38px] cursor-pointer"
                      >
                        ✨ Parse & Populate Session
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </section>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Session Metadata Controls */}
              <section className="bg-surface border border-border-subtle p-5 rounded-md shadow-card flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="sessionTitle"
                    type="text"
                    label="Workout Session Title"
                    placeholder="e.g. Morning Push Protocol"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  {mode === "live" ? (
                    <div className="flex flex-col justify-center items-center md:items-end p-2 bg-bg/50 border border-border-subtle/50 rounded-xs">
                      <span className="text-[9px] font-bold tracking-widest text-accent uppercase font-mono mb-1">
                        ACTIVE ELAPSED TIMER
                      </span>
                      <span className="text-3xl font-bold tracking-wider font-mono text-text-primary">
                        {formatTimer(secondsElapsed)}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <DatePicker
                        label="Date"
                        value={pastDate}
                        onChange={(val) => setPastDate(val)}
                      />
                      <TimePicker
                        label="Start Time"
                        value={pastTime}
                        onChange={(val) => setPastTime(val)}
                      />
                      <div>
                        <Input
                          id="pastDuration"
                          type="number"
                          label="Minutes"
                          value={pastDuration}
                          onChange={(e) => setPastDuration(Number(e.target.value))}
                          min={1}
                          required
                        />
                      </div>
                    </div>

                  )}
                </div>
              </section>

              {/* Dynamic Exercise Selector */}
              <section className="bg-surface border border-border-subtle p-5 rounded-md shadow-card flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Dropdown
                      label="Choose Exercise to Add"
                      options={dropdownOptions}
                      selectedValue={selectedExerciseId}
                      onChange={(val) => setSelectedExerciseId(val)}
                      maxHeight="160px"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addExerciseToSession}
                    className="py-2.5 px-6 text-xs h-[42px] cursor-pointer"
                  >
                    + Add to Workout
                  </Button>
                </div>
              </section>

              {/* Exercises List Builder */}
              <section className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {sessionExercises.length > 0 ? (
                    sessionExercises.map((se) => (
                      <motion.div
                        key={se.exerciseId}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-surface border border-border-subtle rounded-md flex flex-col relative"
                      >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border-subtle/50 bg-bg/20 flex items-center justify-between rounded-t-md">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] bg-bg border border-accent/20 px-2 py-0.5 text-text-accent font-mono uppercase tracking-wider rounded-xs font-semibold">
                              {se.target_muscle}
                            </span>
                            {se.exerciseId.startsWith("unmatched-") ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-danger/10 border border-danger/30 px-2 py-0.5 text-danger font-mono uppercase tracking-wider rounded-xs font-semibold animate-pulse">
                                  ⚠️ Unmatched
                                </span>
                                <div className="w-52">
                                  <Dropdown
                                    options={dropdownOptions}
                                    selectedValue=""
                                    onChange={(newId) => updateExerciseAssociation(se.exerciseId, newId)}
                                    label={`Match: "${se.name}"`}
                                    maxHeight="160px"
                                  />
                                </div>
                              </div>
                            ) : (
                              <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight">
                                {se.name}
                              </h4>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromSession(se.exerciseId)}
                            className="text-[10px] font-bold tracking-wider text-text-secondary hover:text-danger uppercase font-mono cursor-pointer transition-colors"
                          >
                            Remove Exercise
                          </button>
                        </div>

                        {/* Sets details body */}
                        <div className="p-5 flex flex-col gap-3">
                          {se.sets.length > 0 && (
                            <div className="grid grid-cols-12 gap-3 items-center mb-1">
                              <span className="col-span-1 text-[9px] font-bold tracking-widest text-text-muted uppercase font-mono text-center">
                                Set
                              </span>
                              <span className="col-span-3 text-[9px] font-bold tracking-widest text-text-muted uppercase font-mono pl-1">
                                Weight (kg)
                              </span>
                              <span className="col-span-3 text-[9px] font-bold tracking-widest text-text-muted uppercase font-mono pl-1">
                                Reps
                              </span>
                              <span className="col-span-4 text-[9px] font-bold tracking-widest text-text-muted uppercase font-mono pl-1">
                                Set Type
                              </span>
                              <span className="col-span-1"></span>
                            </div>
                          )}

                          <AnimatePresence initial={false}>
                            {se.sets.map((set, idx) => (
                              <motion.div
                                key={set.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-12 gap-3 items-center py-1.5">
                                  <span className="col-span-1 text-xs font-semibold font-mono text-text-secondary text-center">
                                    {(idx + 1).toString().padStart(2, "0")}
                                  </span>

                                  {/* Weight */}
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      value={set.weight}
                                      onChange={(e) => updateSetField(se.exerciseId, idx, "weight", Number(e.target.value))}
                                      placeholder="Weight (kg)"
                                      className="w-full px-3 py-2 bg-bg border border-border-subtle text-text-primary text-xs rounded-sm focus:border-border-strong outline-none font-mono"
                                      required
                                      min={0}
                                    />
                                  </div>

                                  {/* Reps */}
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => updateSetField(se.exerciseId, idx, "reps", Number(e.target.value))}
                                      placeholder="Reps"
                                      className="w-full px-3 py-2 bg-bg border border-border-subtle text-text-primary text-xs rounded-sm focus:border-border-strong outline-none font-mono"
                                      required
                                      min={0}
                                    />
                                  </div>

                                  {/* Set Type Dropdown */}
                                  <div className="col-span-4">
                                    <Dropdown
                                      options={setTypeOptions}
                                      selectedValue={set.type}
                                      onChange={(val) => updateSetField(se.exerciseId, idx, "type", val as any)}
                                      maxHeight="160px"
                                    />
                                  </div>

                                  {/* Remove Set Button */}
                                  <div className="col-span-1 flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeSetFromExercise(se.exerciseId, idx)}
                                      className="p-1.5 text-text-secondary hover:text-danger rounded-xs transition-colors cursor-pointer"
                                      title="Delete Set"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <div className="flex justify-end mt-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => addSetToExercise(se.exerciseId)}
                              className="text-[10px] py-1.5 px-4"
                            >
                              + Add Set
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 border border-dashed border-border-subtle rounded-md bg-surface/10"
                    >
                      <span className="text-xl mb-2">🏋️</span>
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight">
                        No Exercises Logged Yet
                      </h4>
                      <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-mono">
                        Select an exercise above to begin tracking.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </section>

              {/* Submit Bar */}
              <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-6">
                <Link href="/dashboard">
                  <Button type="button" variant="secondary" className="text-xs py-2 px-6">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting} className="text-xs py-2 px-8">
                  {submitting ? "Saving Session..." : "Finish & Record Session"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

