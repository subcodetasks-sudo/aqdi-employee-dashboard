"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Increments a session key each time the dialog opens so form content can remount
 * with fresh state. Also runs `onReset` when the dialog opens.
 */
export function useDialogFormSession(open, onReset) {
  const [session, setSession] = useState(0);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setSession((value) => value + 1);
      onReset?.();
    }
    wasOpen.current = open;
  }, [open, onReset]);

  return session;
}
