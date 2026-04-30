"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import UserTable from "@/components/user-management/UserTable";
import { Modal } from "@/components/ui/modal";
import CreateUserForm from "@/components/user-management/CreateUserForm";
import EditUserForm from "@/components/user-management/EditUserForm";
import Pagination from "@/components/tables/Pagination";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  passwordSet?: boolean;
  blocked?: boolean;
  avatar?: string;
};

const initialUsers: User[] = [];


export default function UsersPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const loadUsers = useCallback(async (signal?: AbortSignal, overrides?: { page?: number; query?: string }) => {
    if (status === "loading" || !session?.accessToken) return;
    const currentPage = overrides?.page ?? page;
    const currentQuery = (overrides?.query ?? query).trim();

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
      });
      if (currentQuery) params.set("q", currentQuery);

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const res = await fetch(`${BACKEND_URL}/api/user?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${session?.accessToken}`
        },
        signal
      });
      if (!res.ok) {
        console.error("Failed to fetch users", res.status);
        return;
      }
      const data = await res.json();
      if (signal?.aborted) return;

      const items = Array.isArray(data) ? data : (data.items || []);
      const total = Array.isArray(data) ? items.length : Number(data.total ?? items.length);
      const mapped: User[] = items.map((u: any) => {
        const rawAvatar = (u.avatar ?? "")?.toString().trim();
        const avatar = rawAvatar && rawAvatar !== "null" && rawAvatar !== "undefined" ? rawAvatar : "/images/user/default-avatar.svg";
        return {
          id: String(u.id),
          name: u.fullName || u.name || "",
          email: u.email || "",
          role: u.role || "",
          passwordSet: !!u.passwordSet,
          avatar: avatar,
          blocked: u.isBlocked || false,
        } as User;
      });
      setUsers(mapped);
      setTotalCount(total);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function handleSave(payload: any) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    try {
      if (payload.id) {
        const res = await fetch(`${BACKEND_URL}/api/user/${payload.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify({
            fullName: payload.name,
            email: payload.email,
            role: payload.role,
            avatar: payload.avatar,
            password: payload.password,
          }),
        });

        if (!res.ok) {
          console.error("Failed to update user", res.status);
          return;
        }

        await loadUsers();
      } else {
        const res = await fetch(`${BACKEND_URL}/api/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify({
            fullName: payload.name,
            email: payload.email,
            role: payload.role,
            password: payload.password,
            avatar: payload.avatar,
          }),
        });

        if (!res.ok) {
          console.error("Failed to create user", res.status);
          return;
        }

        if (page !== 1) {
          setPage(1);
        } else {
          await loadUsers();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(u: User) {
    setEditing(u);
    setFormOpen(true);
  }

  function requestBlock(id: string) {
    setPendingBlockId(id);
    setConfirmOpen(true);
  }

  function handleBlockConfirmed() {
    const id = pendingBlockId;
    if (!id) return;

    (async () => {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      try {
        // find the user
        const user = users.find((u) => u.id === id);
        if (!user) return;
        const updatedPayload = {
          fullName: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          // toggle blocked flag
          isBlocked: !user.blocked,
        };

        const res = await fetch(`${BACKEND_URL}/api/user/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify(updatedPayload),
        });

        if (!res.ok) {
          console.error("Failed to update user block status", res.status);
          return;
        }

        const data = await res.json();
        const updated: User = {
          id: String(data.id),
          name: data.fullName || user.name || "",
          email: data.email || user.email || "",
          role: data.role || user.role || "",
          avatar: data.avatar || user.avatar || "/images/user/default-avatar.svg",
          passwordSet: !!data.passwordSet,
          blocked: data.isBlocked ?? !user.blocked,
        };

        setUsers((prev) => prev.map((p) => (p.id === id ? updated : p)));
      } catch (err) {
        console.error(err);
      } finally {
        setPendingBlockId(null);
        setConfirmOpen(false);
      }
    })();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl text-primary font-semibold mb-4">{t("UsersPage.title")}</h1>
      </div>

      <ComponentCard title={t("UsersPage.card.title")} desc={t("UsersPage.card.desc")} className="mt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <div />

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
            <div className="relative w-full sm:w-64">
              <input
                placeholder={t("UsersPage.searchPlaceholder")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                aria-label="Search users"
                className={`w-full h-10 pl-10 pr-10 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-sm ${
                  query ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                } dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {query && (
                <button 
                  onClick={() => { setQuery(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={handleCreate}
              className="h-10 px-5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md text-sm w-full sm:w-auto whitespace-nowrap"
            >
              {t("UsersPage.createButton")}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <UserTable
            loading={loading}
            users={users}
            query={query}
            onOpen={(u) => { setSelectedUser(u); setViewOpen(true); }}
            onEdit={handleEdit}
            onBlockRequest={requestBlock}
            onClear={() => {
              setQuery("");
              setPage(1);
            }}
          />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Confirm block/unblock modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingBlockId(null);
        }}
        className="max-w-md p-4"
        backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm"
      >
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-primary">
            {pendingBlockId && users.find((u) => u.id === pendingBlockId)?.blocked
              ? t("UsersPage.unblock")
              : t("UsersPage.block")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("UsersPage.confirmText", {
              action: pendingBlockId && users.find((u) => u.id === pendingBlockId)?.blocked ? t("UsersPage.unblock") : t("UsersPage.block"),
            })}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfirmOpen(false);
              setPendingBlockId(null);
            }}
          >
            {t("UsersPage.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleBlockConfirmed}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {t("UsersPage.confirm")}
          </Button>
        </div>
      </Modal>

     

      {/* Create User Form */}
      <CreateUserForm
        open={formOpen && !editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      {/* Edit User Form */}
      {editing && (
        <EditUserForm
          open={formOpen && !!editing}
          onClose={() => setFormOpen(false)}
          initial={editing}
          onSave={handleSave}
        />
      )}

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-md p-6">
        {selectedUser && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedUser.name}</h3>
            <p className="text-sm text-gray-600">{selectedUser.email}</p>
            <p className="mt-2 text-sm">{t("UsersPage.roleLabel")} {selectedUser.role}</p>
            <p className="mt-1 text-sm">{t("UsersPage.blockedLabel")} {selectedUser.blocked ? t("UsersPage.yes") : t("UsersPage.no")}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
