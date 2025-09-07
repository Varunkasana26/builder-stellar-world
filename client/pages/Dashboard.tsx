import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApplicationsPanel } from "@/components/apps/ApplicationsPanel";
import { StatsCards } from "@/components/StatsCards";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function Dashboard() {
  const auth = useAuth();

  useEffect(() => {
    document.title = `FRA Atlas — ${auth.user?.ministry ?? 'Dashboard'}`;
  }, [auth.user]);

  return (
    <main className="flex-1">
      <section className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{auth.user?.ministry ?? 'Dashboard'}</h1>
          <div className="text-sm text-muted-foreground">User: {auth.user?.username} {auth.user?.organization ? `— ${auth.user?.organization}` : ''}</div>
        </div>

        <div className="mt-6">
          <StatsCards />
        </div>
      </section>

      <section className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Applications Workflow</h2>
            <ApplicationsPanel />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Activity & Alerts</h2>
            <ActivityFeed />
          </div>
        </div>
      </section>
    </main>
  );
}
