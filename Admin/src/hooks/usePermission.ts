import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const role = user?.role as string | undefined;
  const permissions = (user?.permissions ?? []) as string[];
  const normalizedRole = role?.trim().toLowerCase().replace(/[_\s-]/g, "");
  const isSuperAdmin = normalizedRole === "superadmin";

  const can = (permission: string) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const canAny = (permissionList: string[]) => {
    if (isSuperAdmin) return true;
    return permissionList.some((perm) => permissions.includes(perm));
  };

  const canAll = (permissionList: string[]) => {
    if (isSuperAdmin) return true;
    return permissionList.every((perm) => permissions.includes(perm));
  };

  return {
    can,
    canAny,
    canAll,
    permissions,
    isSuperAdmin,
    status,
  };
}
