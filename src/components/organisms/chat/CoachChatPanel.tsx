"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChatStream } from "../../../hooks/useChatStream";
import { Spinner } from "../../atoms/Spinner";
import { AnimatePresence, motion } from "framer-motion";

export const CoachChatPanel: React.FC = () => {
  const { messages, isLoading, sendMessage, stopStreaming, clearChat } = useChatStream();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of the chat logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[500px] w-full border border-border-subtle bg-surface/20 rounded-lg overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle bg-surface/50 flex justify-between items-center">
        <div>
          <h3 className="font-display text-lg tracking-wider text-text-primary">AI COACH</h3>
          <p className="text-[9px] font-mono text-text-secondary uppercase">Active RAG Retrieval System</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-[9px] font-mono tracking-widest text-accent hover:underline uppercase cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-custom">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <span className="text-xl mb-2">🏋️‍♂️</span>
            <p className="font-display text-sm tracking-wider text-text-primary uppercase">Ask Your Coach</p>
            <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-relaxed">
              Query routines, performance stats, form instructions, or customization tips instantly.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-sm text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/10 border border-accent/20 text-text-accent"
                      : msg.role === "system"
                      ? "bg-red-500/10 border border-red-500/20 text-red-400 font-mono"
                      : "bg-surface/40 border border-border-subtle text-text-secondary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent animate-pulse align-middle" />
                    )}
                  </p>
                </div>
                <span className="text-[8px] font-mono text-text-secondary/60 mt-1 uppercase px-1">
                  {msg.role === "user" ? "MEMBER" : "COACH"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border-subtle bg-surface/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? "Generating response..." : "Ask the AI Coach..."}
          className="flex-1 px-3 py-2 text-xs bg-bg border border-border-subtle text-text-primary rounded-xs focus:outline-none focus:border-accent disabled:opacity-50"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stopStreaming}
            className="px-4 py-2 border border-red-500/30 hover:border-red-500 text-red-400 text-[10px] font-bold tracking-widest rounded-xs uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Spinner size="sm" />
            STOP
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 border border-accent bg-accent/5 hover:bg-accent/10 text-text-accent text-[10px] font-bold tracking-widest rounded-xs uppercase transition-colors cursor-pointer"
          >
            SEND
          </button>
        )}
      </form>
    </div>
  );
};
