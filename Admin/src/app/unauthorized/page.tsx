import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">You don&apos;t have permission to access this page.</p>

          <div className="space-y-3">
            <Link href="/" className="inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition">
              Return to Dashboard
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-400">If you believe this is a mistake, request access or contact support.</div>
        </div>
      </div>
    </div>
  );
}
