"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { SelectionProvider } from "./SelectionContext";
import ExportBar from "./ExportBar";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SelectionProvider>
        {children}
        <ExportBar />
      </SelectionProvider>
    </SessionProvider>
  );
}
