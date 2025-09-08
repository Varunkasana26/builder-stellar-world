import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Mota() {
  const auth = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/apps');
        const data = await res.json();
        // show only approved apps (fully approved)
        const approved = data.filter((a:any) => (a.currentStageIndex >= a.stages.length && !a.canceled));
        setApps(approved);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, []);

  const recommend = async (appId: string) => {
    // Mock recommendation
    const schemes = [
      { id: 'SCHEME-01', name: 'Afforestation Support', score: Math.round(Math.random()*100) },
      { id: 'SCHEME-02', name: 'Livelihood Assistance', score: Math.round(Math.random()*100) },
    ];
    alert(`Recommended schemes for ${appId}:\n` + schemes.map(s => `${s.name} (${s.score}%)`).join('\n'));
  };

  if (auth.user?.organization !== 'MOTA') {
    return <div className="container py-12">Access restricted to MOTA users</div>;
  }

  return (
    <main className="flex-1">
      <section className="container py-8">
        <h1 className="text-2xl font-bold">MOTA Recommendations</h1>
        <p className="text-sm text-muted-foreground">Mock recommendation engine for approved FRA applications.</p>
        <div className="mt-6 space-y-3">
          {loading && <div>Loading…</div>}
          {!loading && apps.length === 0 && <div className="text-sm text-muted-foreground">No fully approved applications yet.</div>}
          {apps.map((a) => (
            <div key={a.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
              </div>
              <div>
                <button onClick={() => recommend(a.id)} className="rounded-md bg-emerald-400 hover:bg-emerald-500 text-white px-3 py-1">Run Recommendation</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
