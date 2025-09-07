import { useEffect, useMemo, useState } from "react";
import { AnalysisResponse } from "@shared/api";

interface ClaimItem {
  id: string;
  claimantName: string;
}

export function ClaimAnalyzer() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    fetch("/api/geo/claims")
      .then((r) => r.json())
      .then((fc) => {
        const items = (fc.features || []).map((f: any) => ({
          id: f.properties.id,
          claimantName: f.properties.claimantName,
        }));
        setClaims(items);
        if (items.length) setSelected(items[0].id);
      });
  }, []);

  const onAnalyze = async () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analysis/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: selected }),
      });
      const data = (await res.json()) as AnalysisResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const selectedClaim = useMemo(() =>
    claims.find((c) => c.id === selected), [claims, selected]);

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">Select Claim</label>
          <select
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {claims.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.claimantName}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onAnalyze}
          disabled={!selected || loading}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 h-10 min-w-28"
        >
          {loading ? "Analyzing…" : "Run Analysis"}
        </button>
      </div>

      {result && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-xs text-muted-foreground">Risk Score</div>
            <div className="text-3xl font-bold">{Math.round(result.riskScore * 100)}%</div>
            <div className="text-xs text-muted-foreground">Confidence {Math.round(result.confidence * 100)}%</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs text-muted-foreground">Anomalies</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              {result.anomalies.length ? result.anomalies.map((a, i) => (
                <li key={i}>{a}</li>
              )) : <li>No anomalies detected</li>}
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs text-muted-foreground">Recommended Actions</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              {result.recommendedActions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedClaim && (
        <p className="mt-3 text-xs text-muted-foreground">
          Analysis uses mock AI/ML to simulate expected results for {selectedClaim.id}.
        </p>
      )}
    </div>
  );
}
