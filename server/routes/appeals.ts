import { RequestHandler } from "express";

interface Appeal {
  id: string;
  appId?: string;
  raisedBy: string;
  raisedOrg?: string;
  targetOrg?: string;
  type?: 'appeal' | 'complaint' | 'suggestion';
  message: string;
  purpose?: string;
  createdAt: string;
  replies?: { by: string; org?: string; message: string; createdAt: string }[];
}

const appeals: Appeal[] = [];

function makeId() {
  return `APPEAL-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export const listAppeals: RequestHandler = (_req, res) => {
  res.json(appeals);
};

export const createAppeal: RequestHandler = (req, res) => {
  const { appId, raisedBy, raisedOrg, targetOrg, type, message, purpose } = req.body as { appId?: string; raisedBy: string; raisedOrg?: string; targetOrg?: string; type?: 'appeal'|'complaint'|'suggestion'; message: string; purpose?: string };
  // For appeals, appId is required. For complaints/suggestions it's optional.
  if (!raisedBy || !message) return res.status(400).json({ error: "Missing fields" });
  if ((type === 'appeal' || !type) && !appId) return res.status(400).json({ error: "appId is required for appeals" });

  const a: Appeal = { id: makeId(), appId: appId ?? '', raisedBy, raisedOrg, targetOrg, type: type ?? 'appeal', message, purpose, createdAt: new Date().toISOString(), replies: [] };
  appeals.push(a);
  res.status(201).json(a);
};

export const replyAppeal: RequestHandler = (req, res) => {
  const id = req.params.id;
  const { by, org, message } = req.body as { by: string; org?: string; message: string };
  if (!by || !message) return res.status(400).json({ error: 'Missing fields' });
  const a = appeals.find((ap) => ap.id === id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  a.replies = a.replies ?? [];
  a.replies.push({ by, org, message, createdAt: new Date().toISOString() });
  res.json(a);
};

export const reconsiderAppeal: RequestHandler = (req, res) => {
  const id = req.params.id;
  const { by, org, message } = req.body as { by: string; org?: string; message?: string };
  const a = appeals.find((ap) => ap.id === id);
  if (!a) return res.status(404).json({ error: 'Not found' });

  // attach a reconsider reply
  a.replies = a.replies ?? [];
  a.replies.push({ by, org, message: message ?? 'Request reconsideration', createdAt: new Date().toISOString() });

  // try to locate the related application and reset canceled flag if present
  try {
    // lazy-require apps store to avoid circular import
    const appsModule = require('./apps');
    const listAppsFn = appsModule && appsModule.listAppsInternal;
    if (listAppsFn) {
      const all = listAppsFn();
      const app = all.find((ap:any) => ap.id === a.appId);
      if (app) {
        app.canceled = false;
        app.currentStageIndex = Math.max(0, app.currentStageIndex - 1);
      }
    }
  } catch (e) {
    // ignore if not available
  }

  res.json(a);
};
