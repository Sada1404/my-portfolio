// src/contexts/CursorPositionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CursorPositionContext = createContext({ x: 0, y: 0 });

export function CursorPositionProvider({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <CursorPositionContext.Provider value={pos}>
      {children}
    </CursorPositionContext.Provider>
  );
}

export function useCursorPosition() {
  return useContext(CursorPositionContext) || { x: 0, y: 0 };
}
