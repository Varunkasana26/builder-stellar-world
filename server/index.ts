import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getForestBoundary, getSampleClaims } from "./routes/geo";
import { analyzeClaim } from "./routes/analysis";
import { getStatsOverview } from "./routes/stats";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health & demo
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);

  // FRA Atlas APIs (mock)
  app.get("/api/geo/forest-boundary", getForestBoundary);
  app.get("/api/geo/claims", getSampleClaims);
  app.post("/api/analysis/claim", analyzeClaim);
  app.get("/api/stats/overview", getStatsOverview);

  return app;
}
