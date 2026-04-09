import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Next.js Profile | NSPC - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for NSPC - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function Profile() {
  const messages = await getMessages();
  const heading = messages?.ProfilePage?.profileManagement ?? "Profile Management";

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <h3 className="mb-5 text-2xl font-semibold text-primary dark:text-white/90 lg:mb-7">
          {heading}
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}