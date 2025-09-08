import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function FormA() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [claimantName, setClaimantName] = useState("");
  const [spouse, setSpouse] = useState("");
  const [parent, setParent] = useState("");
  const [village, setVillage] = useState("");
  const [gram, setGram] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [district, setDistrict] = useState("");
  const [scheduled, setScheduled] = useState("no");
  const [family, setFamily] = useState("");
  const [nature, setNature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!claimantName) return alert("Provide claimant name");
    setSubmitting(true);
    try {
      const formData = { claimantName, spouse, parent, village, gramPanchayat: gram, tehsil, district, scheduled, family, nature };
      await fetch("/api/apps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claimantName, areaHa: 0, formType: "A", formData }) });
      // notify other tabs
      try { localStorage.setItem('fra_app_created', JSON.stringify({ ts: Date.now() })); } catch(e) {}
      alert("Application submitted");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold">Form A — Individual Claim</h1>
      <p className="text-sm text-muted-foreground">Fill the individual claim details.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Name of claimant(s)</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={claimantName} onChange={(e) => setClaimantName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Spouse</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={spouse} onChange={(e) => setSpouse(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Father / Mother</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={parent} onChange={(e) => setParent(e.target.value)} />
        </div>

        <div>
          <label className="text-sm">Village</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={village} onChange={(e) => setVillage(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Gram Panchayat</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={gram} onChange={(e) => setGram(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Tehsil / Taluka</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={tehsil} onChange={(e) => setTehsil(e.target.value)} />
        </div>

        <div>
          <label className="text-sm">District</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={district} onChange={(e) => setDistrict(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Scheduled Tribe</label>
          <select className="mt-1 w-full rounded-md border px-3 py-2" value={scheduled} onChange={(e) => setScheduled(e.target.value)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Other family members</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={family} onChange={(e) => setFamily(e.target.value)} />
        </div>

        <div className="md:col-span-3">
          <label className="text-sm">Nature of claim / Details</label>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={6} value={nature} onChange={(e) => setNature(e.target.value)} />
        </div>

        <div className="md:col-span-3 flex items-center gap-3">
          <button onClick={submit} disabled={submitting} className="btn-primary">Submit Application</button>
          <button onClick={() => navigate('/dashboard')} className="rounded-md border px-3 py-2">Cancel</button>
        </div>
      </div>
    </main>
  );
}
