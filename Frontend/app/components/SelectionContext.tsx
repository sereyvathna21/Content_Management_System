"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type SelectedItem = {
  key: string; // type:id
  id: string | number;
  type: "law" | "pub" | string;
  title?: string;
  pdf?: string | File | undefined;
};

type SelectionContextValue = {
  selected: Record<string, SelectedItem>;
  toggle: (item: SelectedItem) => void;
  clear: () => void;
  list: () => SelectedItem[];
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Record<string, SelectedItem>>({});

  const toggle = (item: SelectedItem) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[item.key]) {
        delete copy[item.key];
      } else {
        copy[item.key] = item;
      }
      return copy;
    });
  };

  const clear = () => setSelected({});

  const list = () => Object.values(selected);

  const value = useMemo(() => ({ selected, toggle, clear, list }), [selected]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx)
    throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}

export type { SelectedItem };
