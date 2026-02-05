"use client";
import { GoogleMap, Marker, Polygon, Polyline } from "@react-google-maps/api";
import { useState } from "react";
import { Button } from "@heroui/react";
import { ArrowRotateRight } from "@gravity-ui/icons";
import SearchBar from "./SearchBar";
import { PolygonData } from "@/app/types/polygonData";
import { getLabel } from "@/app/utils/getLabel";
import { getColor } from "@/app/utils/getColor";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 50.0755,
  lng: 14.4378,
};

export default function Map({
  getTotalArea,
}: {
  getTotalArea: (a: number) => void;
}) {
  //Polygon selector
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [currentPath, setCurrentPath] = useState<
    [] | { lat: number; lng: number }[]
  >([]);
  const [previewPoint, setPreviewPoint] = useState<null | {
    lat: number;
    lng: number;
  }>(null);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    // začít nový polygon
    if (currentPath.length === 0) {
      setCurrentPath([point]);
      return;
    }

    // přidat další bod
    setCurrentPath((prev) => [...prev, point]);
    setPreviewPoint(null);
  };

  const handleMouseMove = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    if (currentPath.length > 0) {
      setPreviewPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const closePolygon = () => {
    if (currentPath.length < 3) return;

    const index = polygons.length;

    const newPolygon: PolygonData = {
      id: getLabel(index),
      color: getColor(index),
      path: currentPath,
    };

    setPolygons((prev) => [...prev, newPolygon]);
    setCurrentPath([]); // reset → nový polygon
    setPreviewPoint(null);
  };

  const computeArea = (path: { lat: number; lng: number }[]) => {
    if (!window.google || path.length < 3) return 0;

    const googlePath = path.map(
      (p) => new window.google.maps.LatLng(p.lat, p.lng),
    );

    return window.google.maps.geometry.spherical.computeArea(googlePath);
  };

  const totalArea = () => {
    return polygons.reduce((sum, p) => sum + computeArea(p.path), 0);
  };

  getTotalArea(totalArea());

  const reset = () => {
    setPolygons([]);
    setCurrentPath([]);
    setPreviewPoint(null);
  };

  //Update polygonu
  //TODO: nefunguje update
  const handlePolygonLoad = (polygon: google.maps.Polygon, id: string) => {
    const path = polygon.getPath();
    console.log("UPDATED", id);
    const updatePolygon = () => {
      const newPath = path.getArray().map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));

      setPolygons((prev) =>
        prev.map((poly) =>
          poly.id === id ? { ...poly, path: newPath } : poly,
        ),
      );
    };

    path.addListener("set_at", updatePolygon);
    path.addListener("insert_at", updatePolygon);
    path.addListener("remove_at", updatePolygon);
  };

  //Search bar
  const [center, setCenter] = useState(defaultCenter);
  const onMapLoad = (map: google.maps.Map) => {};

  return (
    <div>
      <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden w-full">
        <Button className="absolute bottom-2 right-2 z-10" onClick={reset}>
          <ArrowRotateRight />
          Resetovat výběr
        </Button>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            mapTypeId: "satellite",
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            maxZoom: 20,
            tilt: 0,
            rotateControl: false,
            draggableCursor: "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onClick={handleMapClick}
          onLoad={onMapLoad}
        >
          <SearchBar
            getCenter={(center) => setCenter(center)}
            handleLoad={onMapLoad}
          ></SearchBar>
          <Marker position={center} clickable={false} />

          {/* HOTOVÉ POLYGONY */}
          {polygons.map((polygon) => (
            <Polygon
              key={polygon.id}
              path={polygon.path}
              options={{
                fillColor: polygon.color,
                fillOpacity: 0.3,
                strokeColor: polygon.color,
                strokeWeight: 2,
                clickable: false,
                editable: true,
              }}
              editable
              onLoad={(poly) => handlePolygonLoad(poly, polygon.id)}
              // TODO: po editu aktualizovat vybraný polygon
            />
          ))}

          {/* AKTUÁLNÍ KRESLENÍ */}
          {currentPath.length > 0 && (
            <>
              <Polyline
                path={currentPath}
                options={{
                  strokeColor: "#FBEF76",
                  strokeWeight: 2,
                }}
              />

              <Marker
                position={currentPath[0]}
                onClick={closePolygon}
                label="●"
              />
            </>
          )}

          {/* Polyline preview */}
          {previewPoint && (
            <Polyline
              path={[currentPath[currentPath.length - 1], previewPoint]}
              options={{
                strokeColor: "#FBEF76",
                strokeOpacity: 0.7,
                strokeWeight: 2,
                editable: false,
                clickable: false,
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="mt-4 grid gap-2 grid-cols-2">
        {polygons.map((poly) => (
          <div
            key={poly.id}
            className="rounded-lg p-2 font-medium flex justify-between items-center"
            style={{ backgroundColor: poly.color }}
          >
            <span>
              Plocha {poly.id} - {computeArea(poly.path).toFixed(2)} m²
            </span>

            <button
              onClick={() => {
                setPolygons((prev) => {
                  const filtered = prev.filter(
                    (polygon) => polygon.id !== poly.id,
                  );

                  return filtered.map((polygon, index) => ({
                    ...polygon,
                    id: getLabel(index),
                    color: getColor(index),
                  }));
                });
              }}
              className="aspect-square h-auto w-8 border border-black rounded-md flex items-center justify-center cursor-pointer"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>Celková plocha:</strong> {totalArea().toFixed(2)} m² <br />
      </div>
    </div>
  );
}
