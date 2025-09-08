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
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // Multi-form support for Gram Sabha
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [appealMessage, setAppealMessage] = useState("");
  const [appealTarget, setAppealTarget] = useState<string>("SDLC");

  const filteredApps = apps.filter((a) => {
    // search query
    if (query && !(`${a.id}`.toLowerCase().includes(query.toLowerCase()) || `${a.claimantName}`.toLowerCase().includes(query.toLowerCase()))) return false;
    // stage filter
    if (stageFilter !== "all") {
      const hasStage = a.stages.some((s) => s.ministry === stageFilter && s.status);
      if (!hasStage) return false;
    }
    // status filter
    if (statusFilter === "pending") {
      if (!a.stages.some((s) => s.status === "pending")) return false;
    }
    if (statusFilter === "approved") {
      if (!a.stages.some((s) => s.status === "approved")) return false;
    }
    if (statusFilter === "rejected") {
      if (!a.stages.some((s) => s.status === "rejected")) return false;
    }
    return true;
  });

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
    if (auth.user?.organization === "Gram Sabha") {
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
            <button onClick={fetchApps} className="rounded-md border px-3 py-1">Refresh</button>
          </div>
        </div>

        {/* FRA / Claim forms for Gram Sabha users */}
        {auth.user?.organization === "Gram Sabha" && (
          <div className="rounded-lg border p-4 mb-4 bg-secondary">
            <h4 className="font-semibold">Create Application (Gram Sabha)</h4>

            {/* Form selector */}
            <div className="mt-3 mb-4">
              <label className="text-sm text-muted-foreground">Choose form type</label>
              <div className="mt-2 flex gap-2">
                <button onClick={() => { setSelectedForm('A'); setFormData({}); }} className={`px-3 py-1 rounded-md ${selectedForm === 'A' ? 'btn-primary' : 'border'}`}>Form A (Individual Claim)</button>
                <button onClick={() => { setSelectedForm('B'); setFormData({}); }} className={`px-3 py-1 rounded-md ${selectedForm === 'B' ? 'btn-primary' : 'border'}`}>Form B (Community Rights)</button>
                <button onClick={() => { setSelectedForm('C'); setFormData({}); }} className={`px-3 py-1 rounded-md ${selectedForm === 'C' ? 'btn-primary' : 'border'}`}>Form C (Community Forest Resource)</button>
              </div>
            </div>

            {/* Dynamic form fields */}
            {selectedForm === null ? (
              <div className="text-sm text-muted-foreground">Select a form to begin filling the application.</div>
            ) : (
              <div className="mt-3">
                {selectedForm === 'A' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Name of claimant(s)</label>
                        <input value={formData.claimantName ?? ''} onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Spouse</label>
                        <input value={formData.spouse ?? ''} onChange={(e) => setFormData({ ...formData, spouse: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Father / Mother</label>
                        <input value={formData.parent ?? ''} onChange={(e) => setFormData({ ...formData, parent: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Village</label>
                        <input value={formData.village ?? ''} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Gram Panchayat</label>
                        <input value={formData.gramPanchayat ?? ''} onChange={(e) => setFormData({ ...formData, gramPanchayat: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Tehsil / Taluka</label>
                        <input value={formData.tehsil ?? ''} onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">District</label>
                        <input value={formData.district ?? ''} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Scheduled Tribe (Yes/No)</label>
                        <select value={formData.scheduled ?? 'no'} onChange={(e) => setFormData({ ...formData, scheduled: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Other family members (comma separated)</label>
                        <input value={formData.family ?? ''} onChange={(e) => setFormData({ ...formData, family: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">Nature of claim / Details</label>
                      <textarea value={formData.nature ?? ''} onChange={(e) => setFormData({ ...formData, nature: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>
                    </div>
                  </div>
                )}

                {selectedForm === 'B' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Name of claimant community</label>
                        <input value={formData.communityName ?? ''} onChange={(e) => setFormData({ ...formData, communityName: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Village</label>
                        <input value={formData.village ?? ''} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">Nature of community rights / Details</label>
                      <textarea value={formData.details ?? ''} onChange={(e) => setFormData({ ...formData, details: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>
                    </div>
                  </div>
                )}

                {selectedForm === 'C' && (
                  <div>
                    <div>
                      <label className="text-sm text-muted-foreground">Village / Gram Sabha</label>
                      <input value={formData.village ?? ''} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" />
                    </div>
                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">Members list (attach in details)</label>
                      <textarea value={formData.members ?? ''} onChange={(e) => setFormData({ ...formData, members: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>
                    </div>
                    <div className="mt-3">
                      <label className="text-sm text-muted-foreground">Map / Boundaries description</label>
                      <textarea value={formData.boundary ?? ''} onChange={(e) => setFormData({ ...formData, boundary: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button onClick={async () => {
                    // build a minimal payload compatible with server
                    const claimant = formData.claimantName || formData.communityName || formData.village || 'Unnamed Claim';
                    const area = Number(formData.area) || 0;
                    try {
                      setSubmitting(true);
                      await fetch('/api/apps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claimantName: claimant, areaHa: area, formType: selectedForm, formData }) });
                      await fetchApps();
                      setSelectedForm(null);
                      setFormData({});
                      alert('Application submitted');
                    } catch (err) { console.error(err); alert('Failed to submit'); } finally { setSubmitting(false); }
                  }} disabled={submitting} className="btn-primary px-4 py-2">Submit Application</button>
                  <button onClick={() => { setSelectedForm(null); setFormData({}); }} className="rounded-md border px-3 py-1">Cancel</button>
                </div>
              </div>
            )}

            {/* Appeals for decided applications (Gram Sabha can raise appeals on decided apps) */}
            <div className="mt-6">
              <h5 className="font-semibold">Decided Applications - Raise Appeal</h5>
              <div className="mt-3 space-y-3">
                {apps.filter((a) => a.canceled || a.currentStageIndex >= a.stages.length).map((a) => (
                  <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                      <div className="text-sm text-muted-foreground">{a.canceled ? 'Rejected' : 'Approved'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelected(a); setAppealMessage(''); setAppealTarget('SDLC'); }} className="rounded-md border px-3 py-1">Select</button>
                    </div>
                  </div>
                ))}

                <div className="mt-3">
                  <label className="text-sm text-muted-foreground">Selected Application</label>
                  <div className="mt-1 mb-2">{selected ? `${selected.claimantName} (${selected.id})` : <span className="text-xs text-muted-foreground">None selected</span>}</div>

                  <label className="text-sm text-muted-foreground">Target Organization</label>
                  <select value={appealTarget} onChange={(e) => setAppealTarget(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background">
                    <option value="SDLC">Sub-Divisional Level Committee (SDLC)</option>
                    <option value="DLC">District Level Committee (DLC)</option>
                    <option value="MOTA">Ministry of Tribal Affairs (MOTA)</option>
                  </select>

                  <label className="text-sm text-muted-foreground mt-2">Message</label>
                  <textarea value={appealMessage} onChange={(e) => setAppealMessage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 bg-background" rows={4}></textarea>

                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={async () => {
                      if (!selected || !appealMessage) return alert('Select application and enter a message');
                      try {
                        await fetch('/api/appeals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: selected.id, raisedBy: auth.user?.username, raisedOrg: auth.user?.organization, targetOrg: appealTarget, message: appealMessage }) });
                        alert('Appeal submitted');
                        setAppealMessage('');
                        setSelected(null);
                      } catch (err) { console.error(err); alert('Failed to submit appeal'); }
                    }} className="btn-primary px-4 py-2">Submit Appeal</button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Stage</label>
          <select className="rounded-md border px-3 py-1 bg-background" onChange={(e) => setStageFilter(e.target.value)} value={stageFilter}>
            <option value="all">All</option>
            {apps[0]?.stages?.map((s, i) => (
              <option key={i} value={s.ministry}>{s.ministry}</option>
            ))}
          </select>

          <label className="text-sm text-muted-foreground">Status</label>
          <select className="rounded-md border px-3 py-1 bg-background" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="ml-auto text-sm text-muted-foreground">Showing {filteredApps.length} applications</div>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

          {stageFilter !== 'all' ? (
            // Show split columns for the selected stage: approved vs rejected
            (() => {
              const approved = apps.filter((a) => a.stages.some((s) => s.ministry === stageFilter && s.status === 'approved'));
              const rejected = apps.filter((a) => a.stages.some((s) => s.ministry === stageFilter && s.status === 'rejected'));
              return (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Approved at {stageFilter}</h4>
                    <div className="space-y-3">
                      {approved.map((a) => (
                        <div key={a.id} className="rounded-lg border p-3 flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                            <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                          </div>
                          <div>
                            <button onClick={() => setSelected(a)} className="text-sm underline">View</button>
                          </div>
                        </div>
                      ))}
                      {approved.length === 0 && <div className="text-sm text-muted-foreground">No approved applications</div>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Rejected at {stageFilter}</h4>
                    <div className="space-y-3">
                      {rejected.map((a) => (
                        <div key={a.id} className="rounded-lg border p-3 flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                            <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                          </div>
                          <div>
                            <button onClick={() => setSelected(a)} className="text-sm underline">View</button>
                          </div>
                        </div>
                      ))}
                      {rejected.length === 0 && <div className="text-sm text-muted-foreground">No rejected applications</div>}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            filteredApps.map((a) => (
              <div key={a.id} className="rounded-lg border p-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold">{a.claimantName} <span className="text-xs text-muted-foreground">{a.id}</span></div>
                  <div className="text-sm text-muted-foreground">Area: {a.areaHa} ha</div>
                  <div className="mt-2 flex gap-2">
                    {a.stages.map((s, i) => (
                      <div key={i} className={`px-2 py-1 rounded ${s.status === 'approved' ? 'bg-primary/20 text-primary' : s.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : 'bg-slate-50 text-muted-foreground'}`}>
                        {s.ministry}: {s.status}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setSelected(a)} className="text-sm underline">View</button>
                  {canAct(a) ? (
                    <div className="flex gap-2">
                      <button onClick={() => act(a.id, "approve")} className="rounded-md btn-primary px-3 py-1">Approve</button>
                      <button onClick={() => act(a.id, "reject")} className="rounded-md border px-3 py-1">Reject</button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">{a.canceled ? 'Canceled' : 'No action available'}</div>
                  )}
                </div>
              </div>
            ))
          )}
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
