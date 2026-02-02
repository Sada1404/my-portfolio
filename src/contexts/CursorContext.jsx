import React, { createContext, useContext, useState } from "react";

const CursorContext = createContext();

export function CursorProvider({ children }) {
    const [visible, setVisible] = useState(true);
    return <CursorContext.Provider value={{ visible, setVisible }}>{children}</CursorContext.Provider>;
}

export function useCursor() {
    const ctx = useContext(CursorContext);
    if (!ctx) throw new Error("useCursor must be used inside CursorProvider");
    return ctx;
}
