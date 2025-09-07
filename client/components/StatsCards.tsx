import { useEffect, useState } from "react";
import { StatsOverview } from "@shared/api";

export function StatsCards() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/stats/overview");
        if (!r.ok) return console.error('Failed to fetch stats', r.status);
        setStats(await r.json());
      } catch (err) {
        console.error('Error fetching stats overview', err);
      }
    })();
  }, []);

  const items = [
    { label: "Total Claims", value: stats?.totalClaims ?? "—" },
    { label: "Approved", value: stats?.approvedClaims ?? "—" },
    { label: "Pending", value: stats?.pendingClaims ?? "—" },
    { label: "Rejected", value: stats?.rejectedClaims ?? "—" },
    { label: "Total Area (ha)", value: stats?.totalAreaHa ? stats.totalAreaHa.toLocaleString() : "—" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stat-animate">
      {items.map((it, idx) => (
        <div
          key={it.label}
          className="rounded-xl border p-4 bg-gradient-to-br from-emerald-400/20 to-emerald-300/20 hover:shadow-lg transform hover:-translate-y-1 transition-all"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="mt-1 text-2xl font-bold">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
