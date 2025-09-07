import { RequestHandler } from "express";
import { GeoJSONFeatureCollection } from "@shared/api";

// Very small mock datasets for demo purposes only

export const getForestBoundary: RequestHandler = (_req, res) => {
  const collection: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Mock Forest Reserve" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [77.0, 23.0],
              [77.6, 23.0],
              [77.6, 23.6],
              [77.0, 23.6],
              [77.0, 23.0],
            ],
          ],
        },
      },
    ],
  };
  res.json(collection);
};

export const getSampleClaims: RequestHandler = (_req, res) => {
  const collection: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "CLAIM-001",
          claimantName: "Adivasi Gram Sabha",
          state: "Madhya Pradesh",
          district: "Sehore",
          areaHa: 12.3,
          status: "pending",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [77.12, 23.12],
              [77.18, 23.12],
              [77.18, 23.18],
              [77.12, 23.18],
              [77.12, 23.12],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          id: "CLAIM-002",
          claimantName: "Forest Dweller Association",
          state: "Madhya Pradesh",
          district: "Sehore",
          areaHa: 5.7,
          status: "approved",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [77.32, 23.22],
              [77.36, 23.22],
              [77.36, 23.26],
              [77.32, 23.26],
              [77.32, 23.22],
            ],
          ],
        },
      },
    ],
  };
  res.json(collection);
};
