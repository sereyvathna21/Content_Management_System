import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      backgroundColor: "#f9fafb",
      fontFamily: "var(--font-sans, sans-serif)",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "40px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        maxWidth: "480px",
        width: "100%"
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          backgroundColor: "#fee2e2",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          <svg style={{ width: "32px", height: "32px", color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V9m0 12a9 9 0 110-18 9 9 0 010 18z" />
          </svg>
        </div>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
          marginBottom: "10px"
        }}>
          Access Denied
        </h1>
        <p style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "1.5",
          marginBottom: "24px"
        }}>
          You do not have the required permissions to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <Link href="/" style={{
          display: "inline-block",
          width: "100%",
          padding: "12px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          textDecoration: "none",
          transition: "background-color 0.2s"
        }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
