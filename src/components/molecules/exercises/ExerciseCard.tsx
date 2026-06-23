import React from "react";
import { motion } from "motion/react";
import { Exercise } from "../../../services/workouts";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-border-subtle p-5 rounded-md hover:border-accent-muted transition-all duration-300 flex items-center justify-between shadow-card group"
    >
      <div className="flex flex-col gap-1 pr-4">
        <span className="text-[9px] tracking-widest font-mono text-text-muted">
          ID: {exercise.id.slice(0, 8)}
        </span>
        <h4 className="text-sm font-bold text-text-primary uppercase group-hover:text-text-accent transition-colors">
          {exercise.name}
        </h4>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] bg-bg border border-border-subtle px-2.5 py-1 text-text-secondary rounded-xs uppercase font-semibold tracking-wider font-mono">
          {exercise.target_muscle}
        </span>
        <button
          type="button"
          onClick={() => onEdit(exercise)}
          className="p-1.5 text-text-secondary hover:text-text-accent hover:bg-bg border border-transparent hover:border-border-subtle rounded-xs transition-all duration-200 cursor-pointer"
          title="Edit Exercise"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(exercise)}
          className="p-1.5 text-text-secondary hover:text-danger hover:bg-bg border border-transparent hover:border-border-subtle rounded-xs transition-all duration-200 cursor-pointer"
          title="Delete Exercise"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};
