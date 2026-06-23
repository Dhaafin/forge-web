import React from "react";
import { motion } from "motion/react";
import { Button } from "../../atoms/Button";

interface NotesParserPanelProps {
  rawNotesText: string;
  onChangeRawNotesText: (text: string) => void;
  notesHistory: string[];
  isParsing: boolean;
  parseProgress: number;
  onParse: () => void;
}

export const NotesParserPanel: React.FC<NotesParserPanelProps> = ({
  rawNotesText,
  onChangeRawNotesText,
  notesHistory,
  isParsing,
  parseProgress,
  onParse,
}) => {
  return (
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
              onChange={(e) => onChangeRawNotesText(e.target.value)}
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
                      onClick={() => onChangeRawNotesText(item)}
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
                onClick={onParse}
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
  );
};
