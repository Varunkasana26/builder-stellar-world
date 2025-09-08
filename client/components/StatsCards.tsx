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
    { label: "Total Forest Area", value: stats?.totalAreaHa ? stats.totalAreaHa.toLocaleString() + ' ha' : "—", change: '+2.3%' , icon: 'area' },
    { label: "FRA Claims", value: stats?.totalClaims ?? "—", change: '+15% (mo)', icon: 'claims' },
    { label: "Approved Claims", value: stats?.approvedClaims ?? "—", change: '+8.7% (mo)', icon: 'approved' },
    { label: "Protected Areas", value: stats?.protectedZones ?? '156', change: '0% (mo)', icon: 'protected' },
    { label: "Deforestation Alerts", value: stats?.deforestationAlerts ?? '23', change: '-12% (mo)', icon: 'alerts' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stat-animate">
      {items.map((it, idx) => (
        <div
          key={it.label}
          className="rounded-xl border p-4 bg-card hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-between"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div>
            <div className="text-xs text-muted-foreground">{it.label}</div>
            <div className="mt-1 text-2xl font-extrabold">{it.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{it.change}</div>
          </div>
          <div className="ml-4 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
            {it.icon === 'area' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12l2-2 4 4 6-6 6 6v6H3v-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {it.icon === 'claims' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12h6M12 5v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {it.icon === 'approved' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {it.icon === 'protected' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l7 4v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V6l7-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {it.icon === 'alerts' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
