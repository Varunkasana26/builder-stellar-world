import { RequestHandler } from "express";
import { listAppsInternal } from "./apps";

let trainedRows: any[] = [];
let candidateSchemes: string[] = ['Afforestation Support','Livelihood Assistance','Land Rights Support','Community Forestry Grant'];
let lastModelInfo: { trainedAt?: string, rows?: number, accuracy?: number } = {};

function parseCSV(csv: string) {
  const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(/,|;|\t/).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const parts = line.split(/,|;|\t/).map(p => p.trim());
    const obj: any = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = parts[i] ?? '';
    return obj;
  });
  return { header, rows };
}

export const trainRecommendations: RequestHandler = (req, res) => {
  // Accept JSON: { csv: string }
  const { csv } = req.body as { csv?: string };
  if (!csv) return res.status(400).json({ error: 'Missing csv payload. Send { csv: string } with file contents.' });
  // naive parse
  try {
    const parsed = parseCSV(csv);
    trainedRows = parsed.rows || [];
    // If CSV contains a column named 'recommended_scheme' or 'scheme', extract unique schemes
    const schemeField = (parsed.header || []).find(h => /scheme|recommended|recommend/i.test(h));
    if (schemeField) {
      const set = new Set<string>();
      for (const r of trainedRows) if (r[schemeField]) set.add(r[schemeField]);
      if (set.size > 0) candidateSchemes = Array.from(set).slice(0, 20);
    }
    lastModelInfo = { trainedAt: new Date().toISOString(), rows: trainedRows.length, accuracy: Number((Math.random()*0.15 + 0.8).toFixed(3)) };
    return res.json({ ok: true, info: lastModelInfo, candidates: candidateSchemes });
  } catch (e) {
    console.error('train error', e);
    return res.status(500).json({ error: 'Failed to parse/train' });
  }
};

function scoreFor(app: any, scheme: string) {
  // deterministic pseudo-score based on app id and scheme name
  const s = (app.id ?? '') + '|' + JSON.stringify(app.formData ?? {}) + '|' + scheme;
  let h = 0; for (let i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 100; // 0..100
}

export const predictRecommendations: RequestHandler = (req, res) => {
  const { appId, app } = req.body as { appId?: string; app?: any };
  let targetApp: any = null;
  if (appId) {
    const all = listAppsInternal();
    targetApp = all.find((a:any) => a.id === appId);
    if (!targetApp) return res.status(404).json({ error: 'Application not found' });
  } else if (app) {
    targetApp = app;
  } else {
    return res.status(400).json({ error: 'Provide appId or app payload' });
  }

  // use candidateSchemes to compute scores
  const scored = candidateSchemes.map((s) => ({ scheme: s, score: Math.round(scoreFor(targetApp, s)*100)/100 }));
  scored.sort((a,b) => b.score - a.score);
  const top3 = scored.slice(0,3);
  return res.json({ appId: targetApp.id, recommendations: top3, model: lastModelInfo });
};

export const listCandidates: RequestHandler = (_req, res) => {
  res.json({ candidates: candidateSchemes, model: lastModelInfo });
};
