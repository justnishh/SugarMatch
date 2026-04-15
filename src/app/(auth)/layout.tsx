export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
