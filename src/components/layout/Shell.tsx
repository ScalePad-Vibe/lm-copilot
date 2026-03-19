import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="ml-64 flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-hidden px-6 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
