"use client";
import { LoadScript } from "@react-google-maps/api";
import React from "react";

const MapProvider = ({ children }: { children: React.JSX.Element }) => {
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      {children}
    </LoadScript>
  );
};

export default MapProvider;
