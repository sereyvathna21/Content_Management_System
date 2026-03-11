"use client";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import UserForm from "@/components/user-management/UserForm";
import Image from "next/image";
import ComponentCard from "@/components/common/ComponentCard";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  passwordSet?: boolean;
  blocked?: boolean;
  avatar?: string;
};

const initialUsers: User[] = [
  {
    id: "1",
    name: "Musharof Chowdhury",
    email: "musharof@example.com",
    password: "password123",
    role: "admin",
    passwordSet: true,
    blocked: false,
    avatar: "/images/user/owner.jpg",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password12",
    role: "editor",
    passwordSet: true,
    blocked: false,
    avatar: "/images/user/user-18.jpg",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);

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

  function handleSave(payload: any) {
    if (payload.id) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === payload.id
            ? { ...u, ...payload, avatar: payload.avatar ?? u.avatar }
            : u
        )
      );
    } else {
      const id = String(Date.now());
      setUsers((prev) => [
        { id, blocked: false, avatar: payload.avatar || "/images/user/user-17.jpg", ...payload },
        ...prev,
      ]);
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
    setUsers((prev) => prev.map((p) => (p.id === id ? { ...p, blocked: !p.blocked } : p)));
    setPendingBlockId(null);
    setConfirmOpen(false);
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
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-0">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">User</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">Password</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">Role</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="px-5 py-3 sm:px-6 text-start">
                        <button className="text-sm font-medium text-gray-800 dark:text-white/90" onClick={() => { setSelectedUser(u); setViewOpen(true); }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              {(() => {
                                const src = (u.avatar || "").toString().trim();
                                if (!src) return <Image width={40} height={40} src="/images/user/user-17.jpg" alt={u.name} />;
                                if (src.startsWith("data:") || src.startsWith("blob:")) {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  return <img src={src} alt={u.name} className="w-full h-full object-cover" />;
                                }
                                return <Image width={40} height={40} src={src} alt={u.name} />;
                              })()}
                            </div>
                            <div>{u.name}</div>
                          </div>
                        </button>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{u.email}</TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                        <span
                          aria-label={u.passwordSet ? "Password set" : "Password not set"}
                          title={u.passwordSet ? "Password set" : "Password not set"}
                          className={`inline-block px-2 py-0.5 rounded text-theme-xs ${u.passwordSet ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}
                        >
                          {u.passwordSet ? "Set" : "Not set"}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{u.role}</TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {/* View button removed */}

                          <Tooltip label="Edit">
                            <button
                              onClick={() => handleEdit(u)}
                              title="Edit"
                              aria-label="Edit"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </Tooltip>

                          <Tooltip label={u.blocked ? "Unblock user" : "Block user"}>
                            <button
                              onClick={() => requestBlock(u.id)}
                              title={u.blocked ? "Unblock user" : "Block user"}
                              aria-label={u.blocked ? "Unblock user" : "Block user"}
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/3 transition ${u.blocked ? "text-green-600" : "text-red-600"}`}
                            >
                              {u.blocked ? (
                                // Locked padlock (blocked)
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                  <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                // Open padlock (unblocked)
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                  <path d="M16 11V8a4 4 0 10-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Confirm block/unblock modal */}
      <Modal isOpen={confirmOpen} onClose={() => { setConfirmOpen(false); setPendingBlockId(null); }} className="max-w-sm p-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{pendingBlockId && users.find(u => u.id === pendingBlockId)?.blocked ? "Unblock user" : "Block user"}</h3>
          <p className="text-sm text-gray-600 mb-4">Are you sure you want to {pendingBlockId && users.find(u => u.id === pendingBlockId)?.blocked ? "unblock" : "block"} this user?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => { setConfirmOpen(false); setPendingBlockId(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleBlockConfirmed}>Confirm</Button>
          </div>
        </div>
      </Modal>

      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={
          editing
            ? { id: editing.id, name: editing.name, email: editing.email, role: editing.role, password: editing.password, passwordSet: !!editing.passwordSet, avatar: editing.avatar }
            : undefined
        }
        onSave={handleSave}
      />

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
