import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ApplicationsPanel } from "@/components/apps/ApplicationsPanel";
import { StatsCards } from "@/components/StatsCards";
import AppealsPanel from "@/components/apps/AppealsPanel";

export default function Dashboard() {
  const auth = useAuth();

  useEffect(() => {
    document.title = `VanDarpan — ${auth.user?.organizationLabel ?? "Dashboard"}`;
  }, [auth.user]);

  return (
    <main className="flex-1">
      <section className="container py-8">
        <div className="card-quiet hero-gradient rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">
                Forest Rights Act Decision Support System
              </h1>
              <p className="mt-2 text-muted-foreground">
                AI-powered analytics and geospatial insights for sustainable
                forest management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-md border px-3 py-2">Analytics</button>
              <button className="btn-primary">Settings</button>
            </div>
          </div>

          <div className="mt-6">
            <StatsCards />
          </div>
        </div>
      </section>

      <section className="container py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 whitespace-nowrap">
              Applications
            </h2>
            <ApplicationsPanel />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 whitespace-nowrap">
              Appeals
            </h2>
            <AppealsPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
