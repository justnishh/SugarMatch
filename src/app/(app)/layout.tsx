import { BottomNav } from "@/components/nav/BottomNav";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[448px]">
        <main className="pb-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
