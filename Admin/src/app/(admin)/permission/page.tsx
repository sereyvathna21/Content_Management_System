import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Permission | NSPC CMS",
  description: "Role and permission management",
};

export default function PermissionPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Role Permission" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Role &amp; Permission
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Manage roles and permissions here.
          </p>
        </div>
      </div>
    </div>
  );
}
