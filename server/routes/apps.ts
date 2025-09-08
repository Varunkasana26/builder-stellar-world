import { RequestHandler } from "express";
import { FRAClaimFeature } from "@shared/api";

type StageState = "pending" | "approved" | "rejected";

interface AppStage {
  ministry: string;
  status: StageState;
  signedBy?: string;
  timestamp?: string;
  reason?: string;
}

interface FRAApplication {
  id: string;
  claimantName: string;
  areaHa: number;
  geometry: any;
  stages: AppStage[];
  currentStageIndex: number; // points to next stage to act on
  canceled?: boolean;
  createdAt: string;
  formType?: string;
  formData?: any;
}

// In-memory store for demo
const applications: FRAApplication[] = [];

const DEFAULT_FLOW = ["Gram Sabha", "SDLC", "DLC", "MOTA"];

function makeId() {
  return `APP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export const listApps: RequestHandler = (_req, res) => {
  res.json(applications);
};

export const getApp: RequestHandler = (req, res) => {
  const id = req.params.id;
  const app = applications.find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: "Not found" });
  res.json(app);
};

export const createApp: RequestHandler = (req, res) => {
  const { claimantName, areaHa, geometry, flow, formType, formData } = req.body as {
    claimantName: string;
    areaHa: number;
    geometry: any;
    flow?: string[];
    formType?: string;
    formData?: any;
  };

  if (!claimantName || areaHa === undefined || areaHa === null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const stages = (flow && flow.length ? flow : DEFAULT_FLOW).map((m) => ({ ministry: m, status: "pending" as StageState }));

  const app = {
    id: makeId(),
    claimantName,
    areaHa,
    geometry: geometry ?? null,
    stages,
    currentStageIndex: 0,
    canceled: false,
    createdAt: new Date().toISOString(),
    formType: formType ?? undefined,
    formData: formData ?? undefined,
  } as FRAApplication;

  applications.push(app);
  res.status(201).json(app);
};

export const actOnApp: RequestHandler = (req, res) => {
  const id = req.params.id;
  const { action, ministry, signer, reason } = req.body as { action: "approve" | "reject" | "cancel"; ministry: string; signer?: string; reason?: string };

  const app = applications.find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: "Not found" });

  if (app.canceled) return res.status(400).json({ error: "Application is canceled" });

  // If cancelling, allow from any stage
  if (action === "cancel") {
    app.canceled = true;
    app.stages[app.currentStageIndex].status = "rejected";
    app.stages[app.currentStageIndex].reason = reason ?? "Canceled by user";
    app.stages[app.currentStageIndex].signedBy = signer ?? "";
    app.stages[app.currentStageIndex].timestamp = new Date().toISOString();
    return res.json(app);
  }

  const idx = app.currentStageIndex;
  const expected = app.stages[idx]?.ministry;
  if (expected !== ministry) {
    return res.status(400).json({ error: `Action not allowed. Current stage: ${expected}` });
  }

  if (action === "approve") {
    app.stages[idx].status = "approved";
    app.stages[idx].signedBy = signer ?? "";
    app.stages[idx].timestamp = new Date().toISOString();
    app.currentStageIndex = Math.min(app.currentStageIndex + 1, app.stages.length);
    return res.json(app);
  }

  if (action === "reject") {
    app.stages[idx].status = "rejected";
    app.stages[idx].signedBy = signer ?? "";
    app.stages[idx].reason = reason ?? "Rejected by authority";
    app.stages[idx].timestamp = new Date().toISOString();
    app.canceled = true;
    return res.json(app);
  }

  res.status(400).json({ error: "Unknown action" });
};
