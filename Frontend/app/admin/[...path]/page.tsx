import { redirect } from "next/navigation";

export default async function AdminCatchAllRedirectPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const adminBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
  const { path } = await params;
  const pathname = Array.isArray(path) ? path.join("/") : "";

  redirect(`${adminBaseUrl}/${pathname}`);
}
