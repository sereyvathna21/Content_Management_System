"use client";
import React, { useState } from "react";
import ContactFilters from "../../../components/contact/ContactFilters";
import ContactTable from "../../../components/contact/ContactTable";
import ContactDetail from "../../../components/contact/ContactDetail";
import { useContacts } from "../../../hooks/useContacts";
import ComponentCard from "../../../components/common/ComponentCard";
import Pagination from "../../../components/tables/Pagination";

export default function ContactPage() {
  const {
    contacts,
    loading,
    selected,
    loadContacts,
    selectContact,
    toggleRead,
    removeContact,
    filterContacts,
    setStatusFilter,
    statusFilter,
    page,
    totalPages,
    setPage,
    totalCount,
  } = useContacts();

  const [query, setQuery] = useState("");

  React.useEffect(() => {
    loadContacts();
  }, []);

  const onSearch = (q: string) => {
    setQuery(q);
    filterContacts(q);
  };

  const onStatusChange = (s: "all" | "read" | "unread") => {
    setStatusFilter(s);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl text-primary font-semibold mb-4">Contact Feedbacks</h1>

      <ComponentCard title={`Messages (${totalCount})`} desc="Manage contact form submissions">
        <div>
          <div className="flex items-center justify-between">
           
          </div>

          <div className="mt-4 mb-4">
            <ContactFilters value={query} onSearch={onSearch} status={statusFilter} onStatusChange={onStatusChange} onExport={() => exports(contacts)} />
          </div>

          <ContactTable
            loading={loading}
            contacts={contacts}
            onOpen={(c) => selectContact(c.id)}
            onToggleRead={(id) => toggleRead(id)}
            onDelete={(id) => removeContact(id)}
            query={query}
            onClear={() => {
              setQuery("");
              filterContacts("");
              setStatusFilter("all");
            }}
          />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      </ComponentCard>

      {selected && (
        <ContactDetail
          contact={selected}
          onClose={() => selectContact(null)}
          onMarkRead={() => toggleRead(selected.id)}
        />
      )}
    </div>
  );
}
