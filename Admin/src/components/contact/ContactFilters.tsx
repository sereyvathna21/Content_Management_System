"use client";
import React from "react";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";

type Props = {
  value: string;
  onSearch: (q: string) => void;
  status?: "all" | "read" | "unread";
  onStatusChange?: (s: "all" | "read" | "unread") => void;
  onExport?: () => void;
};


export default function ContactFilters({value, onSearch, status = "all", onStatusChange,  onExport  }: Props) {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={status === "all"}
            onClick={() => onStatusChange && onStatusChange("all")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "all"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>

          <button
            type="button"
            aria-pressed={status === "unread"}
            onClick={() => onStatusChange && onStatusChange("unread")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "unread"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Unread
          </button>

          <button
            type="button"
            aria-pressed={status === "read"}
            onClick={() => onStatusChange && onStatusChange("read")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "read"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <input
          aria-label="Search contacts"
          className={`w-full sm:w-64 h-9 px-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 text-sm ${
            value ? "border-gray-300" : "border-gray-200"
          }`}
          placeholder="Search by name, email or subject"
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />

        <button
          className="h-9 px-4 ml-0 sm:ml-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm w-full sm:w-auto"
          onClick={() => openModal()}
        >
          Export
        </button>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Confirm Export</h3>
            <p className="text-sm text-gray-600 mb-4">Export visible messages to CSV? This will download the currently visible rows.</p>
            <div className="flex justify-end gap-3">
              <button className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200" onClick={closeModal}>Cancel</button>
              <button
                className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90"
                onClick={() => {
                  if (onExport) onExport();
                  closeModal();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      
      </div>
  
    </div>
  );
}