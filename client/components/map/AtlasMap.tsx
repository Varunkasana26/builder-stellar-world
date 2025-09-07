import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";

export function AtlasMap() {
  const [forest, setForest] = useState<any | null>(null);
  const [claims, setClaims] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch("/api/geo/forest-boundary");
        if (r1.ok) setForest(await r1.json()); else console.error('Failed to load forest boundary', r1.status);
      } catch (err) {
        console.error('Error fetching forest boundary', err);
      }

      try {
        const r2 = await fetch("/api/geo/claims");
        if (r2.ok) setClaims(await r2.json()); else console.error('Failed to load claims', r2.status);
      } catch (err) {
        console.error('Error fetching claims', err);
      }
    })();
  }, []);

  const center = useMemo(() => ({ lat: 23.3, lng: 77.25 }), []);

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden border shadow-2xl card-quiet">
      <MapContainer center={center} zoom={9} className="h-full w-full rounded-md">
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
