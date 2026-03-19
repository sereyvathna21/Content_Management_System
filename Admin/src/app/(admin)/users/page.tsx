"use client";

import React, { useMemo, useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import UserTable from "@/components/user-management/UserTable";
import { Modal } from "@/components/ui/modal";
import CreateUserForm from "@/components/user-management/CreateUserForm";
import EditUserForm from "@/components/user-management/EditUserForm";

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
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
        const res = await fetch(`${BACKEND_URL}/api/user`);
        if (!res.ok) {
          console.error("Failed to fetch users", res.status);
          return;
        }
        const data = await res.json();
        const mapped: User[] = (data || []).map((u: any) => {
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    );
  }, [users, query]);

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
          headers: { "Content-Type": "application/json" },
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

        const data = await res.json();
        const updated: User = {
          id: String(data.id),
          name: data.fullName || payload.name || "",
          email: data.email || payload.email || "",
          role: data.role || payload.role || "",
          avatar: data.avatar || payload.avatar || "/images/user/default-avatar.svg",
          passwordSet: !!data.passwordSet,
          blocked: payload.blocked ?? false,
        };

        setUsers((prev) => prev.map((u) => (u.id === payload.id ? updated : u)));
      } else {
        const res = await fetch(`${BACKEND_URL}/api/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const data = await res.json();
        const created: User = {
          id: String(data.id),
          name: data.fullName || payload.name || "",
          email: data.email || payload.email || "",
          role: data.role || payload.role || "",
          avatar: data.avatar || payload.avatar || "/images/user/default-avatar.svg",
          passwordSet: !!data.passwordSet,
          blocked: false,
        };

        setUsers((prev) => [created, ...prev]);
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
          headers: { "Content-Type": "application/json" },
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
        <h1 className="text-3xl text-primary font-semibold mb-4">User Management</h1>
      </div>

      <ComponentCard title="Users" desc="Manage your users" className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <div />

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
            <input
              placeholder="Search users"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search users"
              className={`w-full sm:w-64 h-9 px-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 text-sm ${
                query ? "border-gray-300" : "border-gray-200"
              } bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
            />

            <Button
              onClick={handleCreate}
              className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm w-full sm:w-auto sm:ml-2"
            >
              Create User
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <UserTable
            loading={loading}
            users={filtered}
            query={query}
            onOpen={(u) => { setSelectedUser(u); setViewOpen(true); }}
            onEdit={handleEdit}
            onBlockRequest={requestBlock}
            onClear={() => setQuery("")}
          />
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
              ? "Unblock user"
              : "Block user"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to {pendingBlockId && users.find((u) => u.id === pendingBlockId)?.blocked
              ? "unblock"
              : "block"} this user?
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
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleBlockConfirmed}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
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
            <p className="mt-2 text-sm">Role: {selectedUser.role}</p>
            <p className="mt-1 text-sm">Blocked: {selectedUser.blocked ? "Yes" : "No"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
