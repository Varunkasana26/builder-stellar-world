import { RequestHandler } from "express";
import { AnalysisRequest, AnalysisResponse } from "@shared/api";

function hashToUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) / 0xffffffff;
}

export const analyzeClaim: RequestHandler = (req, res) => {
  const body = req.body as AnalysisRequest;
  const seed = body.claimId ?? JSON.stringify(body.geometry ?? {});
  const base = seed ? hashToUnit(seed) : Math.random();

  const anomaliesPool = [
    "Boundary overlaps protected area",
    "NDVI trend indicates recent clearing",
    "Claim area exceeds village forest maps",
    "Coordinates outside district boundary",
    "Missing documentary evidence",
  ];

  const pickCount = Math.floor(base * 3);
  const anomalies = Array.from({ length: pickCount }, (_, i) =>
    anomaliesPool[(Math.floor(base * 1000) + i) % anomaliesPool.length],
  );

  const response: AnalysisResponse = {
    riskScore: Number((0.2 + 0.7 * base).toFixed(2)),
    confidence: Number((0.6 + 0.4 * (1 - base)).toFixed(2)),
    anomalies,
    recommendedActions: [
      "Verify land records with district authority",
      "Cross-check satellite time series",
      "Schedule joint verification with Gram Sabha",
    ],
    notes: "Mock analysis generated deterministically for demo purposes.",
  };

  res.json(response);
};
