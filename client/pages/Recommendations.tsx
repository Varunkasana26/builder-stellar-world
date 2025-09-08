import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Recommendations() {
  const auth = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [trainingInfo, setTrainingInfo] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingApps(true);
      try {
        const r = await fetch('/api/apps');
        const all = await r.json();
        const approved = all.filter((a:any) => (a.currentStageIndex >= a.stages.length && !a.canceled));
        setApps(approved);
      } catch (e) { console.error(e); }
      setLoadingApps(false);

      try {
        const r2 = await fetch('/api/recommendations/candidates');
        if (r2.ok) {
          const json = await r2.json();
          setCandidates(json.candidates || []);
        }
      } catch (e) {}
    })();
  }, []);

  const onFile = (f?: File) => {
    if (!f) return setCsvFile(null);
    if (f.size > 10 * 1024 * 1024) return alert('File too large. Max 10 MB');
    setCsvFile(f);
  };

  const train = async () => {
    if (!csvFile) return alert('Select CSV file to train');
    const text = await csvFile.text();
    const res = await fetch('/api/recommendations/train', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csv: text }) });
    if (!res.ok) return alert('Training failed');
    const data = await res.json();
    setTrainingInfo(data.info);
    setCandidates(data.candidates || []);
    alert('Training completed (mock)');
  };

  const predict = async () => {
    if (!selectedApp) return alert('Select an approved application');
    setPredicting(true);
    try {
      const res = await fetch('/api/recommendations/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: selectedApp }) });
      if (!res.ok) return alert('Prediction failed');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) { console.error(e); alert('Prediction error'); }
    setPredicting(false);
  };

  if (auth.user?.organization !== 'MOTA') return <div className="container py-12">Access restricted to MOTA users</div>;

  return (
    <main className="flex-1">
      <section className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold">Train Recommendation Model</h3>
            <p className="text-sm text-muted-foreground">Upload CSV training data (max 10 MB). Expected columns: features for applications and target scheme.</p>
            <div className="mt-3">
              <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
              {csvFile && <div className="mt-2 text-sm">Selected: {csvFile.name} ({(csvFile.size/1024).toFixed(1)} KB)</div>}
              <div className="mt-3">
                <button onClick={train} className="btn-primary">Train Model</button>
              </div>
              {trainingInfo && (
                <div className="mt-3 text-sm">
                  <div><strong>Trained at:</strong> {trainingInfo.trainedAt}</div>
                  <div><strong>Rows:</strong> {trainingInfo.rows}</div>
                  <div><strong>Estimated accuracy (mock):</strong> {trainingInfo.accuracy}</div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold">Candidate Schemes</h4>
              <div className="mt-2 text-sm space-y-1">
                {candidates.length === 0 && <div className="text-muted-foreground">No candidate schemes available.</div>}
                {candidates.map((c, i) => <div key={i} className="rounded-md border px-3 py-1">{c}</div>)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold">Approved Applications & Recommendations</h3>
            <p className="text-sm text-muted-foreground">Select an approved application to see top 3 recommended schemes.</p>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Approved Applications</label>
                <div className="mt-2 space-y-2 max-h-96 overflow-auto">
                  {loadingApps && <div>Loading…</div>}
                  {!loadingApps && apps.length === 0 && <div className="text-sm text-muted-foreground">No approved applications yet.</div>}
                  {apps.map(a => (
                    <div key={a.id} className={`rounded-lg border p-3 ${selectedApp === a.id ? 'bg-secondary' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                          <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => setSelectedApp(a.id)} className="rounded-md border px-3 py-1">Select</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Recommendations</label>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <button onClick={predict} className="btn-primary" disabled={predicting}>Get Recommendations</button>
                    <button onClick={() => setRecommendations([])} className="rounded-md border px-3 py-1">Clear</button>
                  </div>

                  <div className="mt-4">
                    {recommendations.length === 0 && <div className="text-sm text-muted-foreground">No recommendations yet.</div>}
                    {recommendations.map((r:any, idx:number) => (
                      <div key={idx} className="rounded-md border p-3 mb-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.scheme}</div>
                          <div className="text-sm text-muted-foreground">Score: {r.score}</div>
                        </div>
                        <div>
                          <button className="rounded-md btn-primary px-3 py-1">Prioritize</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
