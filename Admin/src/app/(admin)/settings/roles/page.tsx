"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useSessionPermissionSync } from "@/hooks/useSessionPermissionSync";
import { usePermission } from "@/hooks/usePermission";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import RequirePermission from "@/components/auth/RequirePermission";

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  userCount: number;
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

interface RolePermissionsMap {
  [roleId: number]: Set<number>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function RolesSettingsPage() {
  const t = useTranslations("RolesPage");
  const { data: session, status } = useSession();
  const { triggerImmediateSync } = useSessionPermissionSync();
  const { can, canAny } = usePermission();
  const canCreateRole = can("roles:create");
  const canUpdateRole = can("roles:update");
  const canDeleteRole = can("roles:delete");

  // State
  const [activeTab, setActiveTab] = useState<"matrix" | "roles">("matrix");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>({});
  
  // Undo/Redo track (initial state to check for dirty cells)
  const [initialRolePermissions, setInitialRolePermissions] = useState<RolePermissionsMap>({});

  // Collapsible module groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Mobile: selected role + permission search
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [mobileSearch, setMobileSearch] = useState("");

  // Loading & Action state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Role CRUD Modals State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleFormName, setRoleFormName] = useState("");
  const [roleFormDesc, setRoleFormDesc] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle collapse for a module group (mobile uses 'mobile-' prefix)
  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  // Grant or revoke ALL permissions in a module for a role
  const handleToggleAllInModule = (roleId: number, perms: Permission[], grantAll: boolean) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.name === "SuperAdmin") return;
    setRolePermissions((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[roleId]);
      perms.forEach((p) => {
        if (grantAll) currentSet.add(p.id);
        else currentSet.delete(p.id);
      });
      next[roleId] = currentSet;
      return next;
    });
  };

  // Load all setup data
  const loadData = useCallback(async () => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch all roles
      const rolesRes = await fetch(`${BACKEND_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!rolesRes.ok) throw new Error(t("errors.failedFetchRoles"));
      const rolesData: Role[] = await rolesRes.json();
      setRoles(rolesData);

      // 2. Fetch all permissions
      const permsRes = await fetch(`${BACKEND_URL}/api/admin/permissions`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!permsRes.ok) throw new Error(t("errors.failedFetchPermissions"));
      const permsData: Permission[] = await permsRes.json();
      setPermissions(permsData);

      // 3. Fetch permissions assigned for each role
      const mapping: RolePermissionsMap = {};
      await Promise.all(
        rolesData.map(async (role) => {
          const res = await fetch(`${BACKEND_URL}/api/admin/roles/${role.id}/permissions`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const permIds = (data.permissions || []).map((p: any) => p.id);
            mapping[role.id] = new Set<number>(permIds);
          } else {
            mapping[role.id] = new Set<number>();
          }
        })
      );

      setRolePermissions(mapping);
      
      // Keep deep copy for checking modifications
      const initialMappingDeep: RolePermissionsMap = {};
      Object.keys(mapping).forEach((key) => {
        const rid = Number(key);
        initialMappingDeep[rid] = new Set<number>(mapping[rid]);
      });
      setInitialRolePermissions(initialMappingDeep);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load roles and permissions.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group permissions by prefix/module name
  const groupPermissions = () => {
    const groups: { [key: string]: Permission[] } = {};
    permissions.forEach((perm) => {
      let groupName = "Other Modules";
      if (perm.name.startsWith("news:")) groupName = "News Management";
      else if (perm.name.startsWith("audit:")) groupName = "Audit Log";
      else if (perm.name.startsWith("video:")) groupName = "Videos Management";
      else if (perm.name.startsWith("laws:")) groupName = "Laws Management";
      else if (perm.name.startsWith("publications:")) groupName = "Publications Management";
      else if (perm.name.startsWith("social:")) groupName = "Social Content";
      else if (perm.name.startsWith("contact:")) groupName = "Contact Management";
      else if (perm.name.startsWith("users:")) groupName = "Users Management";
      else if (perm.name.startsWith("roles:")) groupName = "Roles & Settings";
      else if (perm.name.startsWith("media:")) groupName = "Media Files";
      else if (perm.name.startsWith("notifications:")) groupName = "Notifications";
      else if (perm.name.startsWith("settings:")) groupName = "System Settings";
      else if (perm.name.startsWith("telegram:")) groupName = "Telegram Config";

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(perm);
    });
    return groups;
  };

  const getCleanPermissionLabel = (name: string) => {
    // e.g. "news:create" -> "create"
    if (name === "users:block") return "block";
    const parts = name.split(":");
    return parts.length > 1 ? parts[1] : name;
  };

  // Toggle Matrix Cell
  const handleToggle = (roleId: number, permissionId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.name === "SuperAdmin") return; // SuperAdmin locked

    setRolePermissions((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[roleId]);
      if (currentSet.has(permissionId)) {
        currentSet.delete(permissionId);
      } else {
        currentSet.add(permissionId);
      }
      next[roleId] = currentSet;
      return next;
    });
  };

  // Check if anything has been modified compared to initial
  const isDirty = () => {
    let dirty = false;
    roles.forEach((role) => {
      if (role.name === "Super Admin") return;
      const initial = initialRolePermissions[role.id] || new Set();
      const current = rolePermissions[role.id] || new Set();
      
      if (initial.size !== current.size) {
        dirty = true;
        return;
      }
      for (const id of Array.from(current)) {
        if (!initial.has(id)) {
          dirty = true;
          return;
        }
      }
    });
    return dirty;
  };

  // Save changes to backend
  const handleSaveMatrix = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Find roles with changes
      const updatedRoles = roles.filter((role) => {
        if (role.name === "Super Admin") return false;
        const initial = initialRolePermissions[role.id] || new Set();
        const current = rolePermissions[role.id] || new Set();
        
        if (initial.size !== current.size) return true;
        for (const id of Array.from(current)) {
          if (!initial.has(id)) return true;
        }
        return false;
      });

      if (updatedRoles.length === 0) {
        setSuccessMsg("No modifications detected.");
        setSaving(false);
        return;
      }

      // Execute saves in parallel
      await Promise.all(
        updatedRoles.map(async (role) => {
          const currentIds = Array.from(rolePermissions[role.id] || new Set());
          const res = await fetch(`${BACKEND_URL}/api/admin/roles/${role.id}/permissions`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({ permissionIds: currentIds }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message || `Failed to save permissions for role ${role.name}.`);
          }
        })
      );

      setSuccessMsg("Role permission matrix updated successfully!");
      
      // Update initial permissions map to reset dirty state
      const nextInitialDeep: RolePermissionsMap = {};
      Object.keys(rolePermissions).forEach((key) => {
        const rid = Number(key);
        nextInitialDeep[rid] = new Set<number>(rolePermissions[rid]);
      });
      setInitialRolePermissions(nextInitialDeep);

      // Trigger session permissions update immediately on NextAuth cookie
      await triggerImmediateSync();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update role permissions mapping.");
    } finally {
      setSaving(false);
    }
  };

  // Reset matrix updates
  const handleResetMatrix = () => {
    const resetDeep: RolePermissionsMap = {};
    Object.keys(initialRolePermissions).forEach((key) => {
      const rid = Number(key);
      resetDeep[rid] = new Set<number>(initialRolePermissions[rid]);
    });
    setRolePermissions(resetDeep);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Role Add or Edit Save
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim() || !session?.accessToken) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const isEditing = editingRoleId !== null;
    const url = isEditing
      ? `${BACKEND_URL}/api/admin/roles/${editingRoleId}`
      : `${BACKEND_URL}/api/admin/roles`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name: roleFormName.trim(),
          description: roleFormDesc.trim(),
          isSystemRole: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Failed to ${isEditing ? "update" : "create"} role.`);
      }

      setRoleModalOpen(false);
      setRoleFormName("");
      setRoleFormDesc("");
      setEditingRoleId(null);
      setSuccessMsg(`Role ${isEditing ? "updated" : "created"} successfully.`);
      
      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save role settings.");
    }
  };

  // Open edit role form
  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setRoleFormName(role.name);
    setRoleFormDesc(role.description || "");
    setRoleModalOpen(true);
  };

  // Confirm delete role action
  const handleDeleteRole = async () => {
    if (!confirmDeleteId || !session?.accessToken) return;
    setDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/roles/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || t("errors.failedDeleteRole"));
      }

      setSuccessMsg(t("messages.roleDeleted"));
      setConfirmDeleteId(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("errors.failedDeleteRole"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const groupedPerms = groupPermissions();

  return (
    <RequirePermission anyOf={["roles:read", "roles:create", "roles:update", "roles:delete"]}>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl text-primary font-semibold">{t("title")}</h1>
              <p className="text-xs sm:text-sm text-gray-500 py-3">
                {t("subtitle")}
              </p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "matrix"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              {t("tabs.matrix")}
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "roles"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              {t("tabs.roles")}
            </button>
          </div>
        </div>

      {/* Success/Error Banners */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* VIEW 1: Permissions Matrix Grid */}
      {activeTab === "matrix" && (
        <ComponentCard
          title={t("matrix.title")}
          desc={t("matrix.desc")}
        >
          {/* ─── MOBILE: Role selector + single-column list ─── */}
          <div className="sm:hidden space-y-4">

            {/* Role pill selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {roles.map((role) => {
                const isSuperAdmin = role.name === "SuperAdmin";
                const isSelected = selectedRoleId === role.id;
                const permCount = isSuperAdmin ? permissions.length : (rolePermissions[role.id]?.size ?? 0);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRoleId(role.id); setMobileSearch(""); }}
                    className={`shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="font-bold">{role.name}</span>
                    <span className={`text-[10px] ${isSelected ? "opacity-80" : "text-gray-400"}`}>
                      {isSuperAdmin ? "🔒" : `${permCount} perm${permCount !== 1 ? "s" : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* No role selected placeholder */}
            {selectedRoleId === null && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select a role to manage permissions</p>
                <p className="text-xs text-gray-400 mt-1">Tap any role above to get started</p>
              </div>
            )}

            {/* Role is selected — show permission list */}
            {selectedRoleId !== null && (() => {
              const selectedRole = roles.find(r => r.id === selectedRoleId);
              const isSuperAdmin = selectedRole?.name === "SuperAdmin";
              const searchQ = mobileSearch.trim().toLowerCase();
              return (
                <>
                  {/* Role info banner */}
                  <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                    isSuperAdmin
                      ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
                      : "bg-primary/5 border-primary/20"
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isSuperAdmin ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                    }`}>
                      {isSuperAdmin ? "🔒" : selectedRole?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{selectedRole?.name}</div>
                      <div className="text-xs text-gray-500">
                        {isSuperAdmin ? "All permissions granted (locked)" : `${rolePermissions[selectedRoleId]?.size ?? 0} of ${permissions.length} permissions active`}
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  {!isSuperAdmin && (
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        placeholder="Search permissions..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      {mobileSearch && (
                        <button
                          type="button"
                          onClick={() => setMobileSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Module groups */}
                  <div className="space-y-2 pb-24">
                    {Object.entries(groupedPerms).map(([moduleName, perms]) => {
                      // Apply search filter
                      const filtered = searchQ
                        ? perms.filter(p =>
                            p.name.toLowerCase().includes(searchQ) ||
                            getCleanPermissionLabel(p.name).toLowerCase().includes(searchQ)
                          )
                        : perms;
                      if (filtered.length === 0) return null;

                      const mobileKey = `mobile-${moduleName}`;
                      const isCollapsed = collapsedGroups.has(mobileKey);
                      const assignedCount = filtered.filter(p => rolePermissions[selectedRoleId]?.has(p.id)).length;
                      const allGranted = filtered.every(p => rolePermissions[selectedRoleId]?.has(p.id));
                      const allRevoked = filtered.every(p => !rolePermissions[selectedRoleId]?.has(p.id));

                      return (
                        <div key={moduleName} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          {/* Module header */}
                          <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <button
                              type="button"
                              onClick={() => toggleGroup(mobileKey)}
                              className="flex-1 flex items-center gap-2 px-4 py-3 text-left"
                            >
                              <svg className={`w-3.5 h-3.5 text-primary shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span className="text-xs font-bold text-primary uppercase tracking-wider">{moduleName}</span>
                              <span className="ml-auto text-[10px] font-semibold text-gray-400">{assignedCount}/{filtered.length}</span>
                            </button>
                            {/* Grant All / Revoke All */}
                            {!isSuperAdmin && (
                              <div className="flex gap-1 px-2">
                                <button
                                  type="button"
                                  disabled={allGranted}
                                  onClick={() => handleToggleAllInModule(selectedRoleId, filtered, true)}
                                  className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  All ✓
                                </button>
                                <button
                                  type="button"
                                  disabled={allRevoked}
                                  onClick={() => handleToggleAllInModule(selectedRoleId, filtered, false)}
                                  className="px-2 py-1 text-[10px] font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                  None ✕
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Permission rows */}
                          {!isCollapsed && (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                              {filtered.map((perm) => {
                                const isAssigned = isSuperAdmin || (rolePermissions[selectedRoleId]?.has(perm.id) ?? false);
                                return (
                                  <div
                                    key={perm.id}
                                    className={`flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900 ${
                                      !isSuperAdmin ? "active:bg-gray-50 dark:active:bg-gray-800" : ""
                                    }`}
                                    onClick={!isSuperAdmin ? () => handleToggle(selectedRoleId, perm.id) : undefined}
                                  >
                                    <div className="min-w-0 pr-4">
                                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                        {getCleanPermissionLabel(perm.name)}
                                      </div>
                                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{perm.name}</div>
                                    </div>
                                    {isSuperAdmin ? (
                                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div
                                        className={`relative shrink-0 inline-flex h-7 items-center rounded-full transition-colors ${
                                          isAssigned ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                                        }`}
                                        style={{ minWidth: "52px" }}
                                      >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                                          isAssigned ? "translate-x-7" : "translate-x-1"
                                        }`} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          {/* ─── DESKTOP: Full matrix table ─── */}
          <div className="hidden sm:block border border-gray-200 dark:border-gray-700 rounded-xl max-h-[70vh] overflow-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="sticky top-0 z-20 p-3 sm:p-4 text-lg font-bold text-primary uppercase tracking-wider w-[200px] sm:w-[280px] bg-gray-50 dark:bg-gray-800 text-start">
                    {t("matrix.tableHeader")}
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="sticky top-0 z-10 p-2 sm:p-4 font-bold text-primary uppercase tracking-wider text-center bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base wrap-break-words max-w-20 sm:max-w-none">
                          {role.name}
                        </span>
                        {role.name === "SuperAdmin" ? (
                          <span className="text-[8px] sm:text-[10px] text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 font-semibold whitespace-nowrap">
                            🔒 {t("states.locked")}
                          </span>
                        ) : role.isSystemRole ? (
                          <span className="text-[8px] sm:text-[10px] text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200 font-semibold whitespace-nowrap">
                            {t("states.system")}
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[10px] text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                            {t("states.custom")}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Object.entries(groupedPerms).map(([moduleName, perms]) => {
                  const isCollapsed = collapsedGroups.has(moduleName);
                  return (
                    <React.Fragment key={moduleName}>
                      {/* Module Heading Row — clickable to collapse */}
                      <tr className="bg-gray-100/50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors cursor-pointer select-none" onClick={() => toggleGroup(moduleName)}>
                        <td
                          colSpan={roles.length + 1}
                          className="p-2 sm:p-3 border-y border-gray-200/60 dark:border-gray-700/60"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className={`w-3.5 h-3.5 text-primary transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span className="text-xs font-bold text-primary tracking-wide uppercase">{moduleName}</span>
                            <span className="text-[10px] text-gray-400 font-normal normal-case tracking-normal">{perms.length} permission{perms.length !== 1 ? "s" : ""}</span>
                          </div>
                        </td>
                      </tr>
                      {!isCollapsed && perms.map((perm) => (
                        <tr
                          key={perm.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="sticky left-0 z-10 p-2 sm:p-4 bg-white dark:bg-gray-900">
                            <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {getCleanPermissionLabel(perm.name)}
                            </div>
                            {perm.description && (
                              <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{perm.description}</div>
                            )}
                            <div className="text-[10px] text-gray-300 font-mono mt-0.5">{perm.name}</div>
                          </td>
                          {roles.map((role) => {
                            const isAssigned = rolePermissions[role.id]?.has(perm.id) || false;
                            const isSuperAdmin = role.name === "SuperAdmin";
                            return (
                              <td key={role.id} className="p-2 sm:p-4 text-center">
                                <div className="flex justify-center items-center">
                                  {isSuperAdmin ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleToggle(role.id, perm.id)}
                                      aria-label={`Toggle ${perm.name} for ${role.name}`}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                        isAssigned ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                          isAssigned ? "translate-x-6" : "translate-x-1"
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* end desktop table */}

          {/* Matrix Actions — desktop */}
          <div className="hidden sm:flex mt-4 sm:mt-6 flex-row justify-end gap-2 sm:gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 sm:pt-5">
            <button
              onClick={handleResetMatrix}
              disabled={saving || !isDirty()}
              className="px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {t("matrix.actions.reset")}
            </button>
            {canUpdateRole && (
              <button
                onClick={handleSaveMatrix}
                disabled={saving || !isDirty()}
                className="px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] shadow-md transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("matrix.actions.saving")}
                  </>
                ) : (
                  t("matrix.actions.save")
                )}
              </button>
            )}
          </div>

          {/* Matrix Actions — mobile sticky bar */}
          {isDirty() && (
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2 shadow-2xl">
              <button
                onClick={handleResetMatrix}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
              >
                {t("matrix.actions.reset")}
              </button>
              {canUpdateRole && (
                <button
                  onClick={handleSaveMatrix}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-primary shadow-md transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("matrix.actions.saving")}
                    </>
                  ) : (
                    t("matrix.actions.save")
                  )}
                </button>
              )}
            </div>
          )}
        </ComponentCard>
      )}

      {/* VIEW 2: Roles definitions management */}
      {activeTab === "roles" && (
        <ComponentCard
          title={t("roles.title")}
          desc={t("roles.desc")}
        >
          <div className="flex justify-end mb-4">
            {canCreateRole && (
              <button
                onClick={() => {
                  setEditingRoleId(null);
                  setRoleFormName("");
                  setRoleFormDesc("");
                  setRoleModalOpen(true);
                }}
                className="h-10 px-4 sm:px-5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md text-sm whitespace-nowrap w-full sm:w-auto"
              >
                {t("roles.createButton")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg wrap-break-words flex-1">
                      {role.name}
                    </h3>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {role.name === "SuperAdmin" && (
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40 whitespace-nowrap">
                          🔒 {t("states.locked")}
                        </span>
                      )}
                      {role.isSystemRole && (
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40 whitespace-nowrap">
                          {t("states.system")}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-3">
                    {role.description || t("roles.noDescription")}
                  </p>
                  <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-3">
                    {/* Stats row */}
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                          {t("roles.assignedUsers")}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 font-bold text-sm mt-0.5">
                          {role.userCount} {role.userCount === 1 ? t("roles.userSingular") : t("roles.userPlural")}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Permissions</span>
                        <span className="text-gray-800 dark:text-gray-200 font-bold text-sm mt-0.5">
                          {role.name === "SuperAdmin" ? permissions.length : (rolePermissions[role.id]?.size ?? 0)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {!role.isSystemRole && canUpdateRole && (
                        <button
                          onClick={() => handleEditRole(role)}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          {t("roles.editButton")}
                        </button>
                      )}
                      {!role.isSystemRole && canDeleteRole && (
                        <button
                          onClick={() => setConfirmDeleteId(role.id)}
                          disabled={role.userCount > 0}
                          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            role.userCount > 0
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-red-600 bg-red-50 hover:bg-red-100"
                          }`}
                          title={
                            role.userCount > 0
                              ? t("roles.deleteLockedTooltip")
                              : t("roles.deleteButton")
                          }
                        >
                          {t("roles.deleteButton")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ComponentCard>
      )}

      {/* MODAL 1: Role Creation & Editing */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setRoleFormName("");
          setRoleFormDesc("");
          setEditingRoleId(null);
        }}
        className="w-full max-w-md p-4 sm:p-6 mx-4"
        backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {editingRoleId !== null ? t("form.editTitle") : t("form.createTitle")}
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("form.nameLabel")}
            </label>
            <input
              type="text"
              required
              disabled={editingRoleId !== null} // Prevent renaming system keys
              value={roleFormName}
              onChange={(e) => setRoleFormName(e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm"
              placeholder={t("form.namePlaceholder")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("form.descriptionLabel")}
            </label>
            <textarea
              value={roleFormDesc}
              onChange={(e) => setRoleFormDesc(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm"
              placeholder={t("form.descriptionPlaceholder")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setRoleModalOpen(false);
                setRoleFormName("");
                setRoleFormDesc("");
                setEditingRoleId(null);
              }}
              className="order-2 sm:order-1 flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t("form.cancel")}
            </button>
            <button
              type="submit"
              className="order-1 sm:order-2 flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/95 transition-colors"
            >
              {t("form.saveProfile")}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Delete Role Confirmation */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        className="w-full max-w-md p-4 sm:p-6 mx-4"
        backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t("deleteModal.title")}</h3>
          <p className="text-gray-500 mb-6 text-xs sm:text-sm">
            {t("deleteModal.text")}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            <button
              onClick={() => setConfirmDeleteId(null)}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {t("deleteModal.cancel")}
            </button>
            <button
              onClick={handleDeleteRole}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("deleteModal.deleting")}
                </>
              ) : (
                t("deleteModal.deleteButton")
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </RequirePermission>
  );
}
