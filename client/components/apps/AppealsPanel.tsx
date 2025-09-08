import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AppealsPanel() {
  const auth = useAuth();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState("");

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appeals');
      const data = await res.json();
      // show appeals targeted to this organization
      const filtered = data.filter((a:any) => a.targetOrg === auth.user?.organization);
      setAppeals(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
    const handler = (e: StorageEvent) => {
      if (e.key === 'fra_appeal_created' || e.key === 'fra_app_created') {
        fetchAppeals();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const sendReply = async () => {
    if (!selected || !reply) return alert('Select appeal and enter reply');
    try {
      await fetch(`/api/appeals/${selected.id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: auth.user?.username, org: auth.user?.organization, message: reply }) });
      setReply('');
      await fetchAppeals();
      alert('Reply submitted');
    } catch (err) { console.error(err); alert('Failed to send reply'); }
  };

  const requestReconsider = async () => {
    if (!selected) return alert('Select appeal');
    try {
      await fetch(`/api/appeals/${selected.id}/reconsider`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: auth.user?.username, org: auth.user?.organization, message: 'Request reconsideration by ' + (auth.user?.organization || '') }) });
      await fetchAppeals();
      alert('Reconsideration requested');
    } catch (err) { console.error(err); alert('Failed to request reconsideration'); }
  };

  return (
    <div className="rounded-lg border p-4">
      <h4 className="font-semibold">Appeals for {auth.user?.organization}</h4>

      <div className="mt-3">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {appeals.length === 0 && !loading && <div className="text-sm text-muted-foreground">No appeals for your department.</div>}

        <div className="mt-3 space-y-2">
          {appeals.map((a) => (
            <div key={a.id} className={`rounded-lg border p-3 ${selected?.id === a.id ? 'bg-secondary' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{a.id} — {a.appId}</div>
                  <div className="text-sm text-muted-foreground">Raised by: {a.raisedBy} ({a.raisedOrg ?? 'Unknown'})</div>
                  <div className="mt-2 text-sm">{a.message}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelected(a)} className="rounded-md border px-3 py-1">Select</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm text-muted-foreground">Selected Appeal</label>
          <div className="mt-1 mb-2">{selected ? `${selected.id} — ${selected.appId}` : <span className="text-xs text-muted-foreground">None selected</span>}</div>

          <label className="text-sm text-muted-foreground">Reply</label>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={3}></textarea>

          <div className="mt-3 flex items-center gap-3">
            <button onClick={sendReply} className="btn-primary px-4 py-2">Send Reply</button>
            <button onClick={requestReconsider} className="rounded-md border px-3 py-2">Request Reconsideration</button>
          </div>

          {selected?.replies?.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold">Replies</h5>
              <div className="mt-2 space-y-2">
                {selected.replies.map((r:any, idx:number) => (
                  <div key={idx} className="rounded-md border p-2">
                    <div className="text-sm font-semibold">{r.by} — {r.org}</div>
                    <div className="text-sm text-muted-foreground">{r.message}</div>
                    <div className="text-xs text-muted-foreground">{r.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
