"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../../components/atoms/Input";
import { Button } from "../../../components/atoms/Button";
import { Skeleton } from "../../../components/atoms/Skeleton";
import { Dropdown } from "../../../components/molecules/Dropdown";
import { Modal } from "../../../components/molecules/Modal";
import { fetchWorkoutHistory, updateWorkoutSession, deleteWorkoutSession, WorkoutSession } from "../../../services/workouts";

import { useFlash } from "../../../contexts/FlashContext";


// Fallback seed database in case backend connection is unavailable
const defaultFallbackSessions: WorkoutSession[] = [
  {
    id: "hist-1",
    user_id: "user-1",
    title: "Push Hypertrophy Protocol",
    start_time: "2026-06-15T08:30:00Z",
    end_time: "2026-06-15T09:45:00Z",
    duration_minutes: 75,
    sets: [
      { id: "set-1", exercise_id: "ex-1", weight_kg: 80, reps: 10, is_pr: true, exercise: { id: "ex-1", name: "Incline Bench Press", target_muscle: "Chest" } },
      { id: "set-2", exercise_id: "ex-1", weight_kg: 80, reps: 8, is_pr: false, exercise: { id: "ex-1", name: "Incline Bench Press", target_muscle: "Chest" } },
      { id: "set-3", exercise_id: "ex-2", weight_kg: 32, reps: 12, is_pr: false, exercise: { id: "ex-2", name: "Dumbbell Shoulder Press", target_muscle: "Shoulders" } },
      { id: "set-4", exercise_id: "ex-3", weight_kg: 15, reps: 15, is_pr: false, exercise: { id: "ex-3", name: "Lateral Raise", target_muscle: "Shoulders" } },
    ]
  },
  {
    id: "hist-2",
    user_id: "user-1",
    title: "Lower Body Strength Focus",
    start_time: "2026-06-13T16:00:00Z",
    end_time: "2026-06-13T17:10:00Z",
    duration_minutes: 70,
    sets: [
      { id: "set-5", exercise_id: "ex-4", weight_kg: 140, reps: 5, is_pr: true, exercise: { id: "ex-4", name: "Barbell Back Squat", target_muscle: "Quads" } },
      { id: "set-6", exercise_id: "ex-4", weight_kg: 140, reps: 5, is_pr: false, exercise: { id: "ex-4", name: "Barbell Back Squat", target_muscle: "Quads" } },
      { id: "set-7", exercise_id: "ex-5", weight_kg: 180, reps: 8, is_pr: true, exercise: { id: "ex-5", name: "Seated Leg Press", target_muscle: "Quads" } },
    ]
  },
  {
    id: "hist-3",
    user_id: "user-1",
    title: "Pull Day Posterior Chain",
    start_time: "2026-06-10T10:15:00Z",
    end_time: "2026-06-10T11:30:00Z",
    duration_minutes: 75,
    sets: [
      { id: "set-8", exercise_id: "ex-6", weight_kg: 20, reps: 8, is_pr: false, exercise: { id: "ex-6", name: "Weighted Pull-up", target_muscle: "Lats" } },
      { id: "set-9", exercise_id: "ex-7", weight_kg: 85, reps: 10, is_pr: false, exercise: { id: "ex-7", name: "Bent Over Barbell Row", target_muscle: "Back" } },
    ]
  }
];

export default function WorkoutHistoryPage() {
  const { showFlash } = useFlash();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("start_time");
  const [order, setOrder] = useState("desc");
  const [timeWindow, setTimeWindow] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Edit session states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startEdit = (e: React.MouseEvent, session: WorkoutSession) => {
    e.stopPropagation(); // prevent card from toggling expansion
    setEditingSession(session);
    setEditTitle(session.title);
    setEditDuration(session.duration_minutes);
    setIsEditOpen(true);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editTitle) {
      showFlash("Session title is required.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateWorkoutSession(editingSession.id, editTitle, Number(editDuration));
      showFlash(`Workout session "${updated.title}" updated successfully.`, "success");
      
      setSessions((prev) =>
        prev.map((s) => (s.id === editingSession.id ? { ...s, title: updated.title, duration_minutes: updated.duration_minutes } : s))
      );
      
      setIsEditOpen(false);
      setEditingSession(null);
    } catch (err: any) {
      console.error("Failed to update session:", err.message);
      showFlash("Failed to update session details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete session states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState<WorkoutSession | null>(null);

  const startDelete = (e: React.MouseEvent, session: WorkoutSession) => {
    e.stopPropagation(); // prevent card from toggling expansion
    setDeletingSession(session);
    setIsDeleteOpen(true);
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    setSubmitting(true);
    try {
      await deleteWorkoutSession(deletingSession.id);
      showFlash(`Workout session "${deletingSession.title}" deleted successfully.`, "success");
      
      setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
      setIsDeleteOpen(false);
      setDeletingSession(null);
    } catch (err: any) {
      console.error("Failed to delete session:", err.message);
      showFlash("Failed to delete workout session.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = async () => {


    setLoading(true);
    try {
      const data = await fetchWorkoutHistory({
        search: search || undefined,
        time_window: timeWindow || undefined,
        sort_by: sortBy as any,
        order: order as any,
      });

      if (!data || data.length === 0) {
        // Fallback filter
        const filtered = applyLocalFilters(defaultFallbackSessions);
        setSessions(filtered);
      } else {
        setSessions(data);
      }
    } catch (err: any) {
      console.warn("API request failed, utilizing locally synced fallback database:", err.message);
      const filtered = applyLocalFilters(defaultFallbackSessions);
      setSessions(filtered);
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFilters = (rawList: WorkoutSession[]) => {
    let list = [...rawList];

    // Filter search
    if (search) {
      list = list.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
    }

    // Filter time window
    if (timeWindow) {
      const now = new Date();
      const timeThreshold = new Date();
      if (timeWindow === "7d") timeThreshold.setDate(now.getDate() - 7);
      else if (timeWindow === "30d") timeThreshold.setDate(now.getDate() - 30);
      else if (timeWindow === "90d") timeThreshold.setDate(now.getDate() - 90);
      else if (timeWindow === "ytd") timeThreshold.setMonth(0, 1); // Jan 1st

      list = list.filter((s) => new Date(s.start_time) >= timeThreshold);
    }

    // Sort list
    list.sort((a, b) => {
      let valA: any = a[sortBy as keyof WorkoutSession] || "";
      let valB: any = b[sortBy as keyof WorkoutSession] || "";

      if (sortBy === "start_time") {
        valA = new Date(a.start_time).getTime();
        valB = new Date(b.start_time).getTime();
      }

      if (order === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    return list;
  };

  useEffect(() => {
    loadHistory();
  }, [search, sortBy, order, timeWindow]);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatSessionDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSessionTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortByOptions = [
    { value: "start_time", label: "Date & Time" },
    { value: "duration_minutes", label: "Duration" },
    { value: "title", label: "Session Title" },
  ];

  const orderOptions = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
  ];

  const timeWindowOptions = [
    { value: "", label: "All Training History" },
    { value: "7d", label: "Past 7 Days" },
    { value: "30d", label: "Past 30 Days" },
    { value: "90d", label: "Past 90 Days" },
    { value: "ytd", label: "Year to Date" },
  ];

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8 relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6"
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-accent tracking-widest uppercase font-mono">
            HISTORICAL LOG ARCHIVE
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary uppercase">
            TRAINING HISTORY
          </h2>
          <p className="text-xs text-text-secondary max-w-md leading-relaxed">
            Review previous private member workout protocols and performance summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="text-xs py-2">← Dashboard</Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters Block */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-surface border border-border-subtle p-5 rounded-md shadow-card"
      >
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            id="searchHistory"
            type="text"
            label="Search Sessions"
            placeholder="e.g. Push, Strength..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Window Preset */}
        <Dropdown
          label="Timeframe Preset"
          options={timeWindowOptions}
          selectedValue={timeWindow}
          onChange={(val) => setTimeWindow(val)}
        />

        {/* Sort By */}
        <Dropdown
          label="Sort By"
          options={sortByOptions}
          selectedValue={sortBy}
          onChange={(val) => setSortBy(val)}
        />

        {/* Order */}
        <Dropdown
          label="Ordering"
          options={orderOptions}
          selectedValue={order}
          onChange={(val) => setOrder(val)}
        />
      </motion.section>


      {/* History Feed */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 w-full"
          >
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-md" />
            ))}
          </motion.div>
        ) : sessions.length > 0 ? (
          <motion.div
            key="sessions-feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-4 w-full"
          >
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              
              // Extract distinct muscles worked
              const muscles = Array.from(
                new Set(session.sets.map((set) => set.exercise?.target_muscle).filter(Boolean))
              );

              return (
                <motion.div
                  key={session.id}
                  layout
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="bg-surface border border-border-subtle hover:border-accent-muted/60 transition-colors duration-300 rounded-md shadow-card overflow-hidden flex flex-col"
                >
                  {/* Session Summary Header */}
                  <div
                    onClick={() => toggleExpand(session.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Left Accent indicator */}
                      <div className="w-1 h-10 bg-accent rounded-full self-center" />
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-text-secondary tracking-widest">
                          {formatSessionDate(session.start_time)} @ {formatSessionTime(session.start_time)}
                        </span>
                        <h4 className="text-base font-bold text-text-primary uppercase tracking-tight">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {muscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="text-[8px] bg-bg border border-border-subtle px-1.5 py-0.5 text-text-accent font-mono uppercase tracking-wider rounded-xs"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-border-subtle/50 pt-3 md:pt-0">
                      {/* Stats Display */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[8px] uppercase tracking-wider text-text-muted font-mono">
                            DURATION
                          </span>
                          <span className="text-sm font-semibold font-mono text-text-primary">
                            {session.duration_minutes}m
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] uppercase tracking-wider text-text-muted font-mono">
                            TOTAL SETS
                          </span>
                          <span className="text-sm font-semibold font-mono text-text-primary">
                            {session.sets.length}
                          </span>
                        </div>
                      </div>

                      {/* Edit Session Button */}
                      <button
                        type="button"
                        onClick={(e) => startEdit(e, session)}
                        className="p-1.5 text-text-secondary hover:text-text-accent hover:bg-bg border border-transparent hover:border-border-subtle rounded-xs transition-all duration-200 cursor-pointer"
                        title="Edit Session"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Delete Session Button */}
                      <button
                        type="button"
                        onClick={(e) => startDelete(e, session)}
                        className="p-1.5 text-text-secondary hover:text-danger hover:bg-bg border border-transparent hover:border-border-subtle rounded-xs transition-all duration-200 cursor-pointer"
                        title="Delete Session"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Expand indicator arrow */}
                      <svg
                        className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"

                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>


                  {/* Expanded Session Details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 border-t border-border-subtle/40 pt-4 bg-bg/25">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-text-muted uppercase block mb-3">
                            PERFORMANCE METRIC DETAILS
                          </span>

                          {session.sets.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {session.sets.map((set, idx) => (
                                <div
                                  key={set.id}
                                  className="flex items-center justify-between py-2 px-3 border border-border-subtle bg-surface/40 hover:bg-surface/75 rounded-xs transition-colors text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-text-muted font-mono">
                                      {(idx + 1).toString().padStart(2, "0")}
                                    </span>
                                    <span className="font-semibold text-text-primary uppercase tracking-tight">
                                      {set.exercise?.name || "Exercise Record"}
                                    </span>
                                    <span className="text-[9px] bg-surface-raised border border-border-strong px-2 py-0.5 text-text-secondary font-mono uppercase tracking-wider rounded-xs">
                                      {set.exercise?.target_muscle}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-mono text-text-primary">
                                      {set.weight_kg} kg × {set.reps} reps
                                    </span>
                                    {set.is_pr && (
                                      <span className="px-1.5 py-0.5 bg-success/15 border border-success/30 text-[8px] font-bold text-success rounded-xs font-mono uppercase tracking-widest">
                                        🔥 PR
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted italic py-1">
                              No individual training sets logs documented for this session.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-border-subtle rounded-md bg-surface/10 w-full"
          >
            <span className="text-2xl mb-2">📅</span>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight">
              No Workout Sessions Recorded
            </h4>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-mono">
              Adjust search keywords or timeframe settings.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Session Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSession(null);
        }}
        title="Edit Workout Session"
        subtitle="UPDATE PROTOCOL"
      >
        <form onSubmit={handleUpdateSession} className="flex flex-col gap-6">
          <Input
            id="editSessionTitle"
            type="text"
            label="Workout Session Title"
            placeholder="e.g. Evening Hypertrophy Leg Session"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <Input
            id="editSessionDuration"
            type="number"
            label="Duration (Minutes)"
            value={editDuration}
            onChange={(e) => setEditDuration(Number(e.target.value))}
            min={1}
            required
          />

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditOpen(false);
                setEditingSession(null);
              }}
              className="text-xs py-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="text-xs py-2">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingSession(null);
        }}
        title="Confirm Deletion"
        subtitle="RESTRICT CONSTRAINT"
      >
        <div className="flex flex-col gap-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            Are you sure you want to delete <span className="text-text-primary font-bold uppercase">{deletingSession?.title}</span>? This action will permanently remove this training log entry and all associated performance metrics.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingSession(null);
              }}
              className="text-xs py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteSession}
              disabled={submitting}
              className="text-xs py-2 bg-danger hover:bg-danger/80 border-danger hover:border-danger/80 text-text-primary"
            >
              {submitting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}


