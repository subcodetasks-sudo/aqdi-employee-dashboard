"use client";

import { createContext, useContext } from "react";

const SectionEditorContext = createContext(null);

export function SectionEditorProvider({ onClose, resetKey = 0, children }) {
  return (
    <SectionEditorContext.Provider value={{ onClose, resetKey }}>
      {children}
    </SectionEditorContext.Provider>
  );
}

export function useSectionEditorDialog() {
  return useContext(SectionEditorContext);
}
