import { redirect } from "next/navigation";

export default function AdminRedirectPage() {
  const adminBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
  redirect(adminBaseUrl);
}
