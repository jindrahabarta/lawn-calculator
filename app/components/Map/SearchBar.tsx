import { Input } from "@heroui/react";
import { useEffect, useRef } from "react";

const SearchBar = ({
  getCenter,
  handleLoad,
}: {
  getCenter: (center: { lat: number; lng: number }) => void;
  handleLoad: (map: google.maps.Map) => void;
}) => {
  const mapRef = useRef<null | google.maps.Map>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    handleLoad(map);
  };

  useEffect(() => {
    if (!inputRef.current) return;

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
      getCenter(newCenter);

      if (!mapRef.current) return;
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(18);
    });
  }, []);

  const init = (map: google.maps.Map) => {};

  return (
    <Input
      aria-label="Area"
      className="w-1/2 absolute top-2 left-2 z-10 bg-white/80 opacity-80 focus:opacity-100 hover:opacity-100 duration-200"
      ref={inputRef}
      placeholder="Zadejte adresu..."
    />
  );
};

export default SearchBar;
