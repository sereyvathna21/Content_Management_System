"use client";

import React from "react";
import { SelectionProvider } from "./SelectionContext";
import ExportBar from "./ExportBar";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SelectionProvider>
      {children}
      <ExportBar />
    </SelectionProvider>
  );
}
