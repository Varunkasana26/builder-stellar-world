import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import AppealsPanel from "@/components/apps/AppealsPanel";

export default function Ngo() {
  const auth = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [targetOrg, setTargetOrg] = useState<string>("SDLC");
  const [appealType, setAppealType] = useState<'appeal'|'complaint'|'suggestion'>('appeal');
  const [purpose, setPurpose] = useState<string>('General');

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
    // Validation: appeals require a selected application. complaints/suggestions do not.
    if (appealType === 'appeal') {
      if (!selectedApp || !message) return alert('Select application and enter a message');
    } else {
      if (!message) return alert('Enter a message for your complaint/suggestion');
      if (!purpose) return alert('Provide a purpose for this submission');
    }

    try {
      const body: any = {
        raisedBy: auth.user?.username,
        raisedOrg: auth.user?.organization,
        targetOrg,
        type: appealType,
        message,
      };
      if (appealType === 'appeal') body.appId = selectedApp;
      if (purpose) body.purpose = purpose;

      await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      try { localStorage.setItem('fra_appeal_created', JSON.stringify({ ts: Date.now() })); } catch (e) {}
      alert(appealType === 'appeal' ? 'Appeal submitted' : 'Submission recorded');
      setMessage('');
      setSelectedApp(null);
      setPurpose('General');
      setAppealType('appeal');
    } catch (err) { console.error(err); alert('Failed to submit'); }
  };

  if (auth.user?.organization !== 'NGO') return <div className="container py-12">Access restricted to NGO users</div>;

  return (
    <main className="flex-1">
      <section className="container py-8">
        <h1 className="text-2xl font-bold">NGO Appeals & Feedback</h1>
        <p className="text-sm text-muted-foreground">Raise appeals for decided applications or submit complaints and suggestions to the appropriate organization.</p>

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
            <h3 className="text-lg font-semibold">Raise Appeal / Complaint / Suggestion</h3>
            <div className="mt-3 rounded-lg border p-4">
              <label className="text-sm text-muted-foreground">Submission Type</label>
              <select value={appealType} onChange={(e) => setAppealType(e.target.value as any)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                <option value="appeal">Appeal (for decided applications)</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
              </select>

              {appealType === 'appeal' ? (
                <>
                  <label className="text-sm text-muted-foreground mt-3">Selected Application</label>
                  <div className="mt-1 mb-3">{selectedApp ?? <span className="text-xs text-muted-foreground">None selected</span>}</div>
                </>
              ) : (
                <>
                  <label className="text-sm text-muted-foreground mt-3">Purpose</label>
                  <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                </>
              )}

              <label className="text-sm text-muted-foreground mt-2">Target Organization</label>
              <select value={targetOrg} onChange={(e) => setTargetOrg(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                <option value="SDLC">Sub-Divisional Level Committee (SDLC)</option>
                <option value="DLC">District Level Committee (DLC)</option>
                <option value="MOTA">Ministry of Tribal Affairs (MOTA)</option>
              </select>

              <label className="text-sm text-muted-foreground mt-2">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={5}></textarea>

              <div className="mt-3 flex items-center gap-3">
                <button onClick={sendAppeal} className="rounded-md btn-primary px-4 py-2">{appealType === 'appeal' ? 'Submit Appeal' : appealType === 'complaint' ? 'Submit Complaint' : 'Submit Suggestion'}</button>
                <div className="text-sm text-muted-foreground">Submissions will be forwarded to the selected organization's appeals/feedback queue.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Appeals Assigned to NGO</h2>
          <AppealsPanel />
        </div>
      </section>
    </main>
  );
}
