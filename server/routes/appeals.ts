import { RequestHandler } from "express";

interface Appeal {
  id: string;
  appId: string;
  raisedBy: string;
  raisedOrg?: string;
  targetOrg?: string;
  message: string;
  createdAt: string;
}

const appeals: Appeal[] = [];

function makeId() {
  return `APPEAL-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export const listAppeals: RequestHandler = (_req, res) => {
  res.json(appeals);
};

export const createAppeal: RequestHandler = (req, res) => {
  const { appId, raisedBy, raisedOrg, targetOrg, message } = req.body as { appId: string; raisedBy: string; raisedOrg?: string; targetOrg?: string; message: string };
  if (!appId || !raisedBy || !message) return res.status(400).json({ error: "Missing fields" });
  const a: Appeal = { id: makeId(), appId, raisedBy, raisedOrg, targetOrg, message, createdAt: new Date().toISOString() };
  appeals.push(a);
  res.status(201).json(a);
};
