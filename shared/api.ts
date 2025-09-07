/**
 * Shared types and utilities for the FRA Atlas & WebGIS DSS
 */

// Basic GeoJSON types (minimal for our needs)
export type LngLat = [number, number];

export interface GeoJSONGeometry {
  type: "Point" | "LineString" | "Polygon" | "MultiPolygon";
  coordinates: any;
}

export interface GeoJSONFeature<P = Record<string, any>> {
  type: "Feature";
  properties: P;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection<P = Record<string, any>> {
  type: "FeatureCollection";
  features: Array<GeoJSONFeature<P>>;
}

// FRA Claim
export interface FRAClaimProperties {
  id: string;
  claimantName: string;
  state: string;
  district: string;
  areaHa: number;
  status: "pending" | "approved" | "rejected";
}

export type FRAClaimFeature = GeoJSONFeature<FRAClaimProperties>;
export type FRAClaimCollection = GeoJSONFeatureCollection<FRAClaimProperties>;

// Analysis API contracts
export interface AnalysisRequest {
  claimId?: string;
  geometry?: GeoJSONGeometry;
}

export interface AnalysisResponse {
  riskScore: number; // 0..1
  confidence: number; // 0..1
  anomalies: string[];
  recommendedActions: string[];
  notes?: string;
}

// Stats/overview
export interface StatsOverview {
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  totalAreaHa: number;
  lastUpdated: string; // ISO date
}

// Demo response retained for compatibility
export interface DemoResponse {
  message: string;
}
