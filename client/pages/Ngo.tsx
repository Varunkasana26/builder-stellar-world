import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import AppealsPanel from "@/components/apps/AppealsPanel";

export default function Ngo() {
  const auth = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [targetOrg, setTargetOrg] = useState<string>("SDLC");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/apps');
        const data = await res.json();
        // show only decided applications (rejected or fully approved)
        const decided = data.filter((a:any) => a.canceled || a.currentStageIndex >= a.stages.length);
        setApps(decided);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const sendAppeal = async () => {
    if (!selectedApp || !message) return alert('Select application and enter a message');
    try {
      await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: selectedApp, raisedBy: auth.user?.username, raisedOrg: auth.user?.organization, targetOrg, message }) });
      alert('Appeal submitted');
      setMessage('');
    } catch (err) { console.error(err); alert('Failed to submit'); }
  };

  if (auth.user?.organization !== 'NGO') return <div className="container py-12">Access restricted to NGO users</div>;

  return (
    <main className="flex-1">
      <section className="container py-8">
        <h1 className="text-2xl font-bold">NGO Appeals</h1>
        <p className="text-sm text-muted-foreground">You can raise an appeal or complaint for decided applications.</p>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Decided Applications</h3>
            <div className="mt-3 space-y-3">
              {apps.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                    <div className="text-sm text-muted-foreground">{a.canceled ? 'Rejected' : 'Approved'}</div>
                  </div>
                  <div>
                    <button onClick={() => setSelectedApp(a.id)} className="rounded-md border px-3 py-1">Select</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Raise Appeal / Complaint</h3>
            <div className="mt-3 rounded-lg border p-4">
              <label className="text-sm text-muted-foreground">Selected Application</label>
              <div className="mt-1 mb-3">{selectedApp ?? <span className="text-xs text-muted-foreground">None selected</span>}</div>

              <label className="text-sm text-muted-foreground">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={5}></textarea>

              <label className="text-sm text-muted-foreground mt-2">Target Organization</label>
              <select value={targetOrg} onChange={(e) => setTargetOrg(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                <option value="SDLC">Sub-Divisional Level Committee (SDLC)</option>
                <option value="DLC">District Level Committee (DLC)</option>
                <option value="MOTA">Ministry of Tribal Affairs (MOTA)</option>
              </select>

              <div className="mt-3 flex items-center gap-3">
                <button onClick={sendAppeal} className="rounded-md btn-primary px-4 py-2">Submit Appeal</button>
                <div className="text-sm text-muted-foreground">Appeals are recorded and can be reviewed by authorities.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
