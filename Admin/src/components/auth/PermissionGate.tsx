"use client";

import React, { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

type PermissionGateProps = {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermission();

  let allowed = true;

  if (permission) {
    allowed = allowed && can(permission);
  }

  if (anyOf && anyOf.length > 0) {
    allowed = allowed && canAny(anyOf);
  }

  if (allOf && allOf.length > 0) {
    allowed = allowed && canAll(allOf);
  }

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
