import type { Metadata } from "next";
import React from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "CMS System Admin Dashboard",
  description: "NSPC CMS - CMS System Admin Dashboard",
};

export default function AdminDashboard() {
  return <DashboardOverview />;
}
