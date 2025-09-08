import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function FormB() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState("");
  const [village, setVillage] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!communityName) return alert("Provide community name");
    setSubmitting(true);
    try {
      const formData = { communityName, village, details };
      await fetch("/api/apps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claimantName: communityName, areaHa: 0, formType: "B", formData }) });
      alert("Application submitted");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally { setSubmitting(false); }
  };

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold">Form B — Community Rights</h1>
      <p className="text-sm text-muted-foreground">Claim form for community rights (Form B).</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Community Name</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={communityName} onChange={(e) => setCommunityName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Village</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={village} onChange={(e) => setVillage(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Nature of community rights / Details</label>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={6} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button onClick={submit} disabled={submitting} className="btn-primary">Submit Application</button>
          <button onClick={() => navigate('/dashboard')} className="rounded-md border px-3 py-2">Cancel</button>
        </div>
      </div>
    </main>
  );
}
