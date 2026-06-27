"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChatStream, ChatMessage } from "../../../hooks/useChatStream";
import { Spinner } from "../../atoms/Spinner";
import { AnimatePresence, motion } from "motion/react";
import {
  fetchChatSessions,
  createChatSession,
  deleteChatSession,
  fetchChatMessages,
  ChatSession
} from "../../../services/chat";

export const CoachChatPanel: React.FC = () => {
  const { messages, isLoading, sendMessage, stopStreaming, clearChat, loadHistory } = useChatStream();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of the chat logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load chat sessions on mount
  const loadSessions = async (autoSelect = false) => {
    setLoadingSessions(true);
    try {
      const data = await fetchChatSessions();
      setSessions(data);
      if (data.length > 0) {
        if (autoSelect || !activeSessionId) {
          // Select first/most recent session
          setActiveSessionId(data[0].id);
        }
      } else {
        setActiveSessionId(null);
        clearChat();
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Fetch messages when active session changes
  useEffect(() => {
    if (!activeSessionId) {
      clearChat();
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const history = await fetchChatMessages(activeSessionId);
        const mappedMessages: ChatMessage[] = history.map((msg) => ({
          id: msg.id,
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
          timestamp: msg.created_at,
        }));
        loadHistory(mappedMessages);
      } catch (err) {
        console.error("Failed to load session history:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeSessionId]);

  const handleCreateSession = async () => {
    setLoadingSessions(true);
    try {
      const newSession = await createChatSession();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setShowSessions(false);
    } catch (err) {
      console.error("Failed to create chat session:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this consultation and its history?")) return;

    try {
      await deleteChatSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        clearChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeSessionId) return;
    sendMessage(input, activeSessionId);
    setInput("");
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-full min-h-[350px] sm:h-[500px] w-full border border-border-subtle bg-surface/20 rounded-lg overflow-hidden backdrop-blur-md relative">
      {/* Session Drawer / Sidebar */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="absolute inset-y-0 left-0 w-[240px] bg-bg border-r border-border-subtle z-40 flex flex-col"
          >
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface/30">
              <span className="font-display text-sm tracking-wider text-text-primary uppercase">CONSULTATIONS</span>
              <button
                type="button"
                onClick={() => setShowSessions(false)}
                className="text-[9px] font-mono text-text-secondary hover:text-text-primary uppercase cursor-pointer"
              >
                Back
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={handleCreateSession}
                className="w-full py-2 border border-accent border-dashed hover:border-solid hover:bg-accent/5 text-text-accent text-[10px] font-bold tracking-widest rounded-xs uppercase transition-all duration-200 cursor-pointer"
              >
                + New Consultation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-custom">
              {loadingSessions ? (
                <div className="py-6 flex justify-center"><Spinner size="sm" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-[10px] text-text-secondary text-center py-6 uppercase font-mono">No active session</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setShowSessions(false);
                    }}
                    className={`p-3 rounded-xs border cursor-pointer group flex justify-between items-center transition-all ${
                      activeSessionId === s.id
                        ? "bg-accent/10 border-accent/30 text-text-accent"
                        : "bg-surface/10 border-border-subtle hover:border-accent-muted text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[11px] font-semibold truncate uppercase tracking-wider">{s.title}</p>
                      <span className="text-[8px] font-mono opacity-60">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="text-[10px] text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle bg-surface/50 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSessions(true)}
              className="px-2.5 py-1.5 border border-border-subtle hover:border-accent text-[9px] font-mono tracking-widest text-text-secondary hover:text-text-primary rounded-xs uppercase transition-colors cursor-pointer"
            >
              Consultations
            </button>
            <div className="min-w-0">
              <h3 className="font-display text-sm tracking-wider text-text-primary truncate">
                {currentSession ? currentSession.title.toUpperCase() : "AI COACH"}
              </h3>
              <p className="text-[8px] font-mono text-text-secondary uppercase truncate">
                {currentSession ? "Multi-turn RAG active" : "Select or create consultation"}
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-custom bg-bg/20">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : !activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <span className="text-2xl mb-2">🧠</span>
              <p className="font-display text-sm tracking-wider text-text-primary uppercase">No Active Chat Session</p>
              <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-relaxed mb-4">
                To consult the AI Coach, you need to initiate a new training session or consultation.
              </p>
              <button
                type="button"
                onClick={handleCreateSession}
                className="px-4 py-2 border border-accent bg-accent/5 hover:bg-accent/10 text-text-accent text-[10px] font-bold tracking-widest rounded-xs uppercase transition-all duration-200 cursor-pointer"
              >
                + Start Consultation
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-pulse">
              <span className="text-xl mb-2">💬</span>
              <p className="font-display text-sm tracking-wider text-text-primary uppercase">Room Initiated</p>
              <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-relaxed">
                Send your first message to consult the AI Coach about your routines or fitness parameters.
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
                        ? "bg-accent/10 border border-accent/20 text-text-accent animate-none"
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
            disabled={isLoading || !activeSessionId}
            placeholder={
              !activeSessionId
                ? "Start a consultation room first..."
                : isLoading
                ? "Generating response..."
                : "Ask the AI Coach..."
            }
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
              disabled={!activeSessionId}
              className="px-4 py-2 border border-accent bg-accent/5 hover:bg-accent/10 text-text-accent text-[10px] font-bold tracking-widest rounded-xs uppercase transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SEND
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
