import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApplicationsPanel } from "@/components/apps/ApplicationsPanel";
import { StatsCards } from "@/components/StatsCards";
import AppealsPanel from "@/components/apps/AppealsPanel";

export default function Dashboard() {
  const auth = useAuth();

  useEffect(() => {
    document.title = `FRA Atlas — ${auth.user?.organizationLabel ?? 'Dashboard'}`;
  }, [auth.user]);

  return (
    <main className="flex-1">
      <section className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{auth.user?.organizationLabel ?? 'Dashboard'}</h1>
          <div className="text-sm text-muted-foreground">User: {auth.user?.username} {auth.user?.organizationState ? `— ${auth.user?.organizationState}` : ''}</div>
        </div>

        <div className="mt-6">
          <StatsCards />
        </div>
      </section>

      <section className="container py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 whitespace-nowrap">Applications</h2>
            <ApplicationsPanel />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 whitespace-nowrap">Appeals</h2>
            <AppealsPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
