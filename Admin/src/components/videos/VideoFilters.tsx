"use client";
import React from "react";
import StatusSearchFilters from "@/components/common/StatusSearchFilters";

type Props = {
  query: string;
  onSearch: (q: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  action?: React.ReactNode;
};

export default function VideoFilters({ query, onSearch, status, onStatusChange, action }: Props) {
  return (
    <StatusSearchFilters
      namespace="VideoFilters"
      query={query}
      onSearch={onSearch}
      status={status}
      onStatusChange={onStatusChange}
      action={action}
    />
  );
}
