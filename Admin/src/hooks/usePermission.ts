import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role;
  const permissions = (user as any)?.permissions || [];

  const hasPermission = (permissionName: string) => {
    if (role === "SuperAdmin") return true;
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]) => {
    if (role === "SuperAdmin") return true;
    return permissionNames.some((p) => permissions.includes(p));
  };

  return {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    isLoading: !session && session !== null,
  };
}
