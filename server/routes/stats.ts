import { RequestHandler } from "express";
import { StatsOverview } from "@shared/api";

export const getStatsOverview: RequestHandler = (_req, res) => {
  const data: StatsOverview = {
    totalClaims: 1284,
    approvedClaims: 732,
    pendingClaims: 472,
    rejectedClaims: 80,
    totalAreaHa: 56342.7,
    lastUpdated: new Date().toISOString(),
  };
  res.json(data);
};
