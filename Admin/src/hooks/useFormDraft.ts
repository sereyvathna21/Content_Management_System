"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * useFormDraft — Auto-saves form data to sessionStorage and restores it on mount.
 *
 * Usage:
 *   const { clearDraft } = useFormDraft("news-form-123", formData, setFormData, isFormOpen);
 *
 * @param key       Unique identifier for this draft (e.g., "news-form-123")
 * @param data      The current form state to auto-save
 * @param onRestore Callback to restore saved data into form state
 * @param enabled   Set to false to disable (e.g., when form is closed)
 */
export function useFormDraft<T>(
  key: string,
  data: T,
  onRestore: (saved: T) => void,
  enabled: boolean = true
) {
  const restoredRef = useRef(false);
  const storageKey = `form-draft:${key}`;

  // On mount: Restore saved draft (runs only once per key)
  useEffect(() => {
    if (!enabled || restoredRef.current) return;
    restoredRef.current = true;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        onRestore(parsed);
      }
    } catch {
      // Corrupted data — just remove it
      sessionStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled]);

  // On every change: Auto-save draft (debounced to 500ms)
  useEffect(() => {
    if (!enabled || !restoredRef.current) return;

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch (err: any) {
        // If storage is full (QuotaExceededError), notify the UI
        if (err?.name === "QuotaExceededError") {
          window.dispatchEvent(new CustomEvent("session-storage-full"));
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [storageKey, data, enabled]);

  // Clear the draft (call after Save or Cancel)
  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    restoredRef.current = false;
  }, [storageKey]);

  return { clearDraft };
}
