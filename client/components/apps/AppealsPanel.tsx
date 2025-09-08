import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";

type AppealItem = any;

export default function AppealsPanel() {
  const auth = useAuth();
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AppealItem | null>(null);
  const [reply, setReply] = useState("");
  const [filterType, setFilterType] = useState<'all'|'appeal'|'complaint'|'suggestion'>('all');

  const org = auth.user?.organization;
  const readKey = `fra_read_ids_${org}`;

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appeals');
      const data = await res.json();
      const filtered = data.filter((a:any) => a.targetOrg === org);
      // sort newest first
      filtered.sort((a:any,b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  }, [org]);

  // manage read ids in localStorage
  const getReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem(readKey) || '[]') as string[];
    } catch (e) { return []; }
  };
  const markRead = (id: string) => {
    try {
      const ids = new Set(getReadIds());
      ids.add(id);
      localStorage.setItem(readKey, JSON.stringify(Array.from(ids)));
    } catch (e) {}
  };

  const counts = useMemo(() => {
    const all = appeals.length;
    const appealsCount = appeals.filter(a => a.type === 'appeal').length;
    const complaintsCount = appeals.filter(a => a.type === 'complaint').length;
    const suggestionsCount = appeals.filter(a => a.type === 'suggestion').length;

    const readIds = new Set(getReadIds());
    const unreadAll = appeals.filter(a => !readIds.has(a.id)).length;
    const unreadAppeals = appeals.filter(a => a.type === 'appeal' && !readIds.has(a.id)).length;
    const unreadComplaints = appeals.filter(a => a.type === 'complaint' && !readIds.has(a.id)).length;
    const unreadSuggestions = appeals.filter(a => a.type === 'suggestion' && !readIds.has(a.id)).length;

    return { all, appealsCount, complaintsCount, suggestionsCount, unreadAll, unreadAppeals, unreadComplaints, unreadSuggestions };
  }, [appeals, org]);

  const visible = appeals.filter(a => filterType === 'all' ? true : a.type === filterType);

  const onSelect = (a: AppealItem) => {
    setSelected(a);
    markRead(a.id);
  };

  const sendReply = async () => {
    if (!selected || !reply) return alert('Select appeal and enter reply');
    try {
      await fetch(`/api/appeals/${selected.id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: auth.user?.username, org: auth.user?.organization, message: reply }) });
      setReply('');
      await fetchAppeals();
      setSelected(null);
      alert('Reply submitted');
    } catch (err) { console.error(err); alert('Failed to send reply'); }
  };

  const requestReconsider = async () => {
    if (!selected) return alert('Select appeal');
    try {
      await fetch(`/api/appeals/${selected.id}/reconsider`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ by: auth.user?.username, org: auth.user?.organization, message: 'Request reconsideration by ' + (auth.user?.organization || '') }) });
      await fetchAppeals();
      setSelected(null);
      alert('Reconsideration requested');
    } catch (err) { console.error(err); alert('Failed to request reconsideration'); }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Inbox — {org}</h4>
        <div className="text-sm text-muted-foreground">Unread: {counts.unreadAll}</div>
      </div>

      <div className="mt-3 flex gap-2 items-center">
        <button className={`px-3 py-1 rounded-md ${filterType === 'all' ? 'bg-primary text-white' : 'border'}`} onClick={() => setFilterType('all')}>All ({counts.all}) {counts.unreadAll > 0 && <span className="ml-2 text-xs text-red-500">{counts.unreadAll}</span>}</button>
        <button className={`px-3 py-1 rounded-md ${filterType === 'appeal' ? 'bg-primary text-white' : 'border'}`} onClick={() => setFilterType('appeal')}>Appeals ({counts.appealsCount}) {counts.unreadAppeals > 0 && <span className="ml-2 text-xs text-red-500">{counts.unreadAppeals}</span>}</button>
        <button className={`px-3 py-1 rounded-md ${filterType === 'complaint' ? 'bg-primary text-white' : 'border'}`} onClick={() => setFilterType('complaint')}>Complaints ({counts.complaintsCount}) {counts.unreadComplaints > 0 && <span className="ml-2 text-xs text-red-500">{counts.unreadComplaints}</span>}</button>
        <button className={`px-3 py-1 rounded-md ${filterType === 'suggestion' ? 'bg-primary text-white' : 'border'}`} onClick={() => setFilterType('suggestion')}>Suggestions ({counts.suggestionsCount}) {counts.unreadSuggestions > 0 && <span className="ml-2 text-xs text-red-500">{counts.unreadSuggestions}</span>}</button>
        <button className="ml-auto rounded-md border px-3 py-1" onClick={fetchAppeals}>Refresh</button>
      </div>

      <div className="mt-3">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {visible.length === 0 && !loading && <div className="text-sm text-muted-foreground">No items for this view.</div>}

        <div className="mt-3 space-y-2">
          {visible.map((a) => (
            <div key={a.id} className={`rounded-lg border p-3 ${selected?.id === a.id ? 'bg-secondary' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{a.id}{a.appId ? ` — ${a.appId}` : ''}</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${a.type === 'appeal' ? 'bg-green-100 text-green-800' : a.type === 'complaint' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{a.type?.toUpperCase()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Raised by: {a.raisedBy} ({a.raisedOrg ?? 'Unknown'})</div>
                  {a.purpose && <div className="mt-1 text-sm"><strong>Purpose:</strong> {a.purpose}</div>}
                  <div className="mt-2 text-sm">{a.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => onSelect(a)} className="rounded-md border px-3 py-1">Select</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm text-muted-foreground">Selected Item</label>
          <div className="mt-1 mb-2">{selected ? `${selected.id}${selected.appId ? ` — ${selected.appId}` : ''}` : <span className="text-xs text-muted-foreground">None selected</span>}</div>

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
