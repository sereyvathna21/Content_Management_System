"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const { can, canAny, canAll, isSuperAdmin } = usePermission();

  useEffect(() => {
    if (status === "loading") return;

    // If user is SuperAdmin, always allow
    if (isSuperAdmin) return;

    let allowed = true;
    if (permission) allowed = can(permission);
    if (anyOf) allowed = canAny(anyOf);
    if (allOf) allowed = canAll(allOf);

    if (!allowed) {
      router.replace(fallbackPath);
    }
  }, [permission, anyOf ? anyOf.join(",") : undefined, allOf ? allOf.join(",") : undefined, isSuperAdmin, router, fallbackPath, status, can, canAny, canAll]);

  return <>{children}</>;
}
