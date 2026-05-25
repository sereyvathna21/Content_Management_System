"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

type Props = {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
  fallbackPath?: string; // default to /unauthorized
};

export default function RequirePermission({ permission, anyOf, allOf, children, fallbackPath = "/unauthorized" }: Props) {
  const router = useRouter();
  const { can, canAny, canAll, isSuperAdmin } = usePermission();

  useEffect(() => {
    // If user is SuperAdmin, always allow
    if (isSuperAdmin) return;

    let allowed = true;
    if (permission) allowed = can(permission);
    if (anyOf) allowed = canAny(anyOf);
    if (allOf) allowed = canAll(allOf);

    if (!allowed) {
      router.replace(fallbackPath);
    }
  }, [permission, anyOf ? anyOf.join(",") : undefined, allOf ? allOf.join(",") : undefined, isSuperAdmin]);

  return <>{children}</>;
}
