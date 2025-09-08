import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import AppealsPanel from "@/components/apps/AppealsPanel";

export default function Mota() {
  const auth = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [appealTarget, setAppealTarget] = useState<string>('SDLC');
  const [appealMessage, setAppealMessage] = useState<string>('');

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

  const submitAppeal = async () => {
    if (!selectedApp || !appealMessage) return alert('Select application and enter a message');
    try {
      await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: selectedApp, raisedBy: auth.user?.username, raisedOrg: auth.user?.organization, targetOrg: appealTarget, type: 'appeal', message: appealMessage }) });
      try { localStorage.setItem('fra_appeal_created', JSON.stringify({ ts: Date.now() })); } catch (e) {}
      alert('Appeal submitted');
      setAppealMessage('');
      setSelectedApp(null);
    } catch (err) { console.error(err); alert('Failed to submit appeal'); }
  };

  if (auth.user?.organization !== 'MOTA') {
    return <div className="container py-12">Access restricted to MOTA users</div>;
  }

  return (
    <main className="flex-1">
      <section className="container py-8">
        <h1 className="text-2xl font-bold">MOTA Recommendations</h1>
        <p className="text-sm text-muted-foreground">Mock recommendation engine for approved FRA applications.</p>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold">Raise Appeal</h3>
            <p className="text-sm text-muted-foreground">Raise an appeal on a decided application. Select an application from the list below, add a message, and forward it to the relevant organization.</p>

            <div className="mt-4">
              <label className="text-sm text-muted-foreground">Selected Application</label>
              <div className="mt-1 mb-2">{selectedApp ?? <span className="text-xs text-muted-foreground">None selected</span>}</div>

              <label className="text-sm text-muted-foreground">Target Organization</label>
              <select value={appealTarget} onChange={(e) => setAppealTarget(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                <option value="SDLC">Sub-Divisional Level Committee (SDLC)</option>
                <option value="DLC">District Level Committee (DLC)</option>
                <option value="MOTA">Ministry of Tribal Affairs (MOTA)</option>
              </select>

              <label className="text-sm text-muted-foreground mt-2">Message</label>
              <textarea value={appealMessage} onChange={(e) => setAppealMessage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>

              <div className="mt-3 flex items-center gap-3">
                <button onClick={submitAppeal} className="btn-primary px-4 py-2">Submit Appeal</button>
                <div className="text-sm text-muted-foreground">Appeals are forwarded to the selected department.</div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Approved Applications</h4>
                <div className="space-y-3">
                  {loading && <div>Loading…</div>}
                  {!loading && apps.length === 0 && <div className="text-sm text-muted-foreground">No fully approved applications yet.</div>}
                  {apps.map((a) => (
                    <div key={a.id} className="rounded-lg border p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                        <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedApp(a.id); setAppealMessage(''); setAppealTarget('SDLC'); }} className="rounded-md border px-3 py-1">Select</button>
                        <button onClick={() => recommend(a.id)} className="rounded-md btn-primary px-3 py-1">Run Recommendation</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Appeals</h2>
            <AppealsPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
