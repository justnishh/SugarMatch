import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin sidebar/nav */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-rose-500">
              SugarMatch Admin
            </h1>
            <div className="hidden md:flex gap-6">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Users
              </Link>
              <Link
                href="/admin/reports"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reports
              </Link>
            </div>
          </div>
          <Link
            href="/home"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to App
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
