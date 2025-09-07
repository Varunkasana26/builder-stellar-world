import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import type { GeoJSON as GeoJSONType } from "geojson";

export function AtlasMap() {
  const [forest, setForest] = useState<GeoJSONType | null>(null);
  const [claims, setClaims] = useState<GeoJSONType | null>(null);

  useEffect(() => {
    fetch("/api/geo/forest-boundary").then(async (r) => setForest(await r.json()));
    fetch("/api/geo/claims").then(async (r) => setClaims(await r.json()));
  }, []);

  const center = useMemo(() => ({ lat: 23.3, lng: 77.25 }), []);

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden border shadow-sm">
      <MapContainer center={center} zoom={9} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Forest Boundary">
            {forest && (
              <GeoJSON data={forest as any} style={{ color: "#059669", weight: 2, fillOpacity: 0.1 }} />
            )}
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Claims">
            {claims && (
              <GeoJSON data={claims as any} style={{ color: "#2563eb", weight: 2, fillOpacity: 0.15 }} />
            )}
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
