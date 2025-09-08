import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function FormC() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [village, setVillage] = useState("");
  const [members, setMembers] = useState("");
  const [boundary, setBoundary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!village) return alert("Provide village");
    setSubmitting(true);
    try {
      const formData = { village, members, boundary };
      await fetch("/api/apps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claimantName: village, areaHa: 0, formType: "C", formData }) });
      try { localStorage.setItem('fra_app_created', JSON.stringify({ ts: Date.now() })); } catch(e) {}
      alert("Application submitted");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally { setSubmitting(false); }
  };

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold">Form C — Community Forest Resource</h1>
      <p className="text-sm text-muted-foreground">Claim form for Community Forest Resource (Form C).</p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm">Village / Gram Sabha</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={village} onChange={(e) => setVillage(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Members list (details)</label>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} value={members} onChange={(e) => setMembers(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Map / Boundaries description</label>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} value={boundary} onChange={(e) => setBoundary(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={submit} disabled={submitting} className="btn-primary">Submit Application</button>
          <button onClick={() => navigate('/dashboard')} className="rounded-md border px-3 py-2">Cancel</button>
        </div>
      </div>
    </main>
  );
}
