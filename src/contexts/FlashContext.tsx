"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FlashMessage, FlashType } from "../components/molecules/FlashMessage";

interface FlashContextType {
  showFlash: (message: string, type: FlashType, duration?: number) => void;
}

const FlashContext = createContext<FlashContextType | undefined>(undefined);

export const FlashProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FlashType>("info");
  const [isVisible, setIsVisible] = useState(false);
  const [duration, setDuration] = useState(4000);

  const showFlash = (msg: string, t: FlashType, dur: number = 4000) => {
    setMessage(msg);
    setType(t);
    setDuration(dur);
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <FlashContext.Provider value={{ showFlash }}>
      {children}
      <FlashMessage
        message={message}
        type={type}
        isVisible={isVisible}
        onClose={handleClose}
        duration={duration}
      />
    </FlashContext.Provider>
  );
};

export const useFlash = () => {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error("useFlash must be used within a FlashProvider");
  }
  return context;
};
