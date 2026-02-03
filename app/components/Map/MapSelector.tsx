"use client";
import {
  GoogleMap,
  Marker,
  Polygon,
  PolygonProps,
  Polyline,
} from "@react-google-maps/api";
import { useMemo, useRef, useState } from "react";
import { Input, Button } from "@heroui/react";
import { ArrowRotateRight, Check } from "@gravity-ui/icons";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 50.0755,
  lng: 14.4378,
};

export default function Map() {
  //Polygon selector
  const [polygons, setPolygons] = useState<PolygonProps[]>([]);
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

    setPolygons((prev) => [...prev, currentPath]);
    setCurrentPath([]); // reset → nový polygon
    setPreviewPoint(null);
  };

  const computeArea = (path: { lat: number; lng: number }[]) => {
    if (path.length < 3) return 0;
    const googlePath = path.map(
      (p) => new window.google.maps.LatLng(p.lat, p.lng),
    );
    return window.google.maps.geometry.spherical.computeArea(googlePath);
  };

  const totalArea = useMemo(() => {
    return polygons.reduce((sum, poly) => sum + computeArea(poly), 0);
  }, [polygons]);

  //Search bar
  const [center, setCenter] = useState(defaultCenter);
  const mapRef = useRef<null | google.maps.Map>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleLoad = (map: google.maps.Map) => {
    if (!inputRef.current) return;

    mapRef.current = map;

    // Inicializace autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"], // jen adresy
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry?.location) return;

      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(newCenter);

      if (!mapRef.current) return;
      // posun mapy na novou lokaci
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(18);
    });
  };

  return (
    <div>
      <div>1. Zadejte adresu</div>
      <div>2. Vyberte plochu o kterou se jedná</div>
      <div>3. Zadejte kontaktní údaje</div>

      <div className="relative w-2xl aspect-video rounded-2xl overflow-hidden ">
        <Input
          aria-label="Area"
          className="w-1/2 absolute top-2 left-2 z-10 bg-white/80 opacity-80 focus:opacity-100 hover:opacity-100 duration-200"
          ref={inputRef}
          placeholder="Zadejte adresu..."
        />

        <Button
          className="absolute bottom-2 right-2 z-10"
          onClick={() => {
            setPolygons([]);
            setCurrentPath([]);
          }}
        >
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
          onLoad={handleLoad}
        >
          <Marker position={center} clickable={false} />

          {/* HOTOVÉ POLYGONY */}
          {polygons.map((path, i) => (
            <Polygon
              key={i}
              path={path}
              options={{
                fillColor: "#16a34a",
                fillOpacity: 0.3,
                strokeColor: "#16a34a",
                strokeWeight: 2,
                clickable: false,
              }}
              editable
              // TODO: po editu aktualizovat vybraný polygon
            />
          ))}

          {/* AKTUÁLNÍ KRESLENÍ */}
          {currentPath.length > 0 && (
            <>
              <Polyline
                path={currentPath}
                options={{
                  strokeColor: "#4f46e5",
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
                strokeColor: "#4f46e5",
                strokeOpacity: 0.7,
                strokeWeight: 2,
                editable: false,
                clickable: false,
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>Vybrané oblasti:</strong> {polygons.length} <br />
        <strong>Celková plocha:</strong> {totalArea.toFixed(2)} m² <br />
        <Button className="bg-green-400 mt-4">
          <Check />
          Potvrdit výběr
        </Button>
      </div>
    </div>
  );
}
