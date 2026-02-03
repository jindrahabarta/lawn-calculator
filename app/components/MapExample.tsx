"use client";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polygon,
  Polyline,
} from "@react-google-maps/api";
import { useMemo, useRef, useState } from "react";

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
  const [polygons, setPolygons] = useState([]);
  const [currentPath, setCurrentPath] = useState<
    [] | { lat: number; lng: number }[]
  >([]);
  const [previewPoint, setPreviewPoint] = useState(null); // 👈 kurzor pro preview

  const handleMapClick = (e) => {
    const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    console.log(currentPath[0]);

    // začít nový polygon
    if (currentPath.length === 0) {
      setCurrentPath([point]);
      return;
    }

    // přidat další bod
    setCurrentPath((prev) => [...prev, point]);
    setPreviewPoint(null);
  };

  const handleMouseMove = (e) => {
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

  const computeArea = (path) => {
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
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const handleLoad = (map) => {
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
      if (!place.geometry) return;

      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(newCenter);

      // posun mapy na novou lokaci
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(18);
    });
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCEj83DSYYf6vXrKENJ-Rje_Resah2bO7Q"
      libraries={["places"]}
    >
      <div>
        <div className="w-xl aspect-video rounded-2xl overflow-hidden ">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={{
              mapTypeId: "satellite",
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
                  editable: false,
                }}
                editable={false}
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
                  editable
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
                  strokeOpacity: 0.7, // 👈 nižší opacity
                  strokeWeight: 2,
                  editable: false,
                  clickable: false,
                }}
              />
            )}
          </GoogleMap>
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            ref={inputRef}
            placeholder="Zadejte adresu..."
            style={{ width: "300px", padding: "6px" }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <strong>Polygonů:</strong> {polygons.length} <br />
          <strong>Celková plocha:</strong> {totalArea.toFixed(2)} m² <br />
          <small>Klikni na první bod polygonu pro uzavření</small>
        </div>

        <button
          onClick={() => {
            setPolygons([]);
            setCurrentPath([]);
          }}
        >
          Reset vše
        </button>
      </div>
    </LoadScript>
  );
}
