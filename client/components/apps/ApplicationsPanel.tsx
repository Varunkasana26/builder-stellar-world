import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

type AppStage = { ministry: string; status: string; signedBy?: string; timestamp?: string; reason?: string };
type AppItem = { id: string; claimantName: string; areaHa: number; stages: AppStage[]; currentStageIndex: number; canceled?: boolean };

export function ApplicationsPanel() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const auth = useAuth();

  const [fraName, setFraName] = useState("");
  const [fraArea, setFraArea] = useState<number | "">("");
  const [fraNotes, setFraNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps");
      setApps(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const canAct = (app: AppItem) => {
    if (app.canceled) return false;
    const idx = app.currentStageIndex;
    return app.stages[idx]?.ministry === auth.user?.organization;
  };

  const act = async (appId: string, action: "approve" | "reject" | "cancel") => {
    const body = { action: action === "approve" ? "approve" : action === "reject" ? "reject" : "cancel", ministry: auth.user?.organization, signer: auth.user?.username, reason: action === "reject" ? "Rejected by user" : undefined };
    await fetch(`/api/apps/${appId}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await fetchApps();
    if (selected?.id === appId) {
      const res = await fetch(`/api/apps/${appId}`);
      setSelected(await res.json());
    }
  };

  const createMock = async () => {
    await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimantName: `Demo Claim ${Math.floor(Math.random() * 1000)}`, areaHa: Number((Math.random() * 10 + 1).toFixed(2)) }),
    });
    fetchApps();
  };

  const submitFRA = async () => {
    if (!fraName || !fraArea) return alert("Please provide claimant name and area");
    setSubmitting(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimantName: fraName, areaHa: Number(fraArea), geometry: null }),
      });
      const created = await res.json();

      // If current user is Gram Sabha, auto-approve and advance
      if (auth.user?.ministry === "Gram Sabha") {
        await fetch(`/api/apps/${created.id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve", ministry: "Gram Sabha", signer: auth.user?.username }),
        });
      }

      // Refresh list
      await fetchApps();
      setFraName("");
      setFraArea("");
      setFraNotes("");
      alert("Application submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Applications</h3>
          <div className="flex items-center gap-3">
            <button onClick={createMock} className="rounded-md bg-emerald-400 hover:bg-emerald-500 text-white px-3 py-1">Create Demo Application</button>
            <button onClick={fetchApps} className="rounded-md border px-3 py-1">Refresh</button>
          </div>
        </div>

        {/* FRA form for Gram Sabha users */}
        {auth.user?.ministry === "Gram Sabha" && (
          <div className="rounded-lg border p-4 mb-4 bg-emerald-50">
            <h4 className="font-semibold">Create FRA Application (Gram Sabha)</h4>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Claimant Name</label>
                <input value={fraName} onChange={(e) => setFraName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Area (ha)</label>
                <input type="number" value={fraArea as any} onChange={(e) => setFraArea(e.target.value ? Number(e.target.value) : "")} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Notes</label>
                <input value={fraNotes} onChange={(e) => setFraNotes(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={submitFRA} disabled={submitting} className="rounded-md bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2">Submit Application</button>
              <div className="text-sm text-muted-foreground">After submission, the application will be forwarded to the next ministry for review.</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {apps.map((a) => (
            <div key={a.id} className="rounded-lg border p-3 flex items-start justify-between">
              <div>
                <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                <div className="mt-2 flex gap-2">
                  {a.stages.map((s, i) => (
                    <div key={i} className={`px-2 py-1 rounded ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : s.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : 'bg-slate-50 text-muted-foreground'}`}>
                      {s.ministry}: {s.status}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={() => setSelected(a)} className="text-sm underline">View</button>
                {canAct(a) ? (
                  <div className="flex gap-2">
                    <button onClick={() => act(a.id, "approve")} className="rounded-md bg-emerald-400 hover:bg-emerald-500 text-white px-3 py-1">Approve</button>
                    <button onClick={() => act(a.id, "reject")} className="rounded-md border px-3 py-1">Reject</button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">{a.canceled ? 'Canceled' : 'No action available'}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="rounded-lg border p-4">
          <h4 className="font-semibold">Details</h4>
          {!selected ? (
            <div className="text-sm text-muted-foreground mt-2">Select an application to view details</div>
          ) : (
            <div className="mt-3 text-sm">
              <div><strong>ID:</strong> {selected.id}</div>
              <div><strong>Claimant:</strong> {selected.claimantName}</div>
              <div><strong>Area (ha):</strong> {selected.areaHa}</div>
              <div className="mt-2">
                <strong>Stages:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {selected.stages.map((s, i) => (
                    <li key={i}>{s.ministry}: {s.status} {s.signedBy ? `by ${s.signedBy}` : ''} {s.reason ? ` — ${s.reason}` : ''}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Created: {selected.createdAt}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
