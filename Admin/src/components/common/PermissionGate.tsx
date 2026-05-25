"use client";

import React from "react";
import { PermissionGate as AuthPermissionGate } from "@/components/auth/PermissionGate";

interface PermissionGateProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  return (
    <AuthPermissionGate permission={permission} fallback={fallback}>
      {children}
    </AuthPermissionGate>
  );
}
