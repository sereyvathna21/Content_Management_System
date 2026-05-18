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

export default function NewsFilters({ query, onSearch, status, onStatusChange, action }: Props) {
  return (
    <StatusSearchFilters
      namespace="NewsFilters"
      query={query}
      onSearch={onSearch}
      status={status}
      onStatusChange={onStatusChange}
      action={action}
    />
  );
}
