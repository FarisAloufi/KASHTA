import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

// --- Configuration ---
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const DEFAULT_ZOOM = 13;

// Map container styles
// Height is set to 100% to fill the parent container defined in the page
const CONTAINER_STYLE = {
  width: "100%",
  height: "100%", 
  borderRadius: "1rem", // Matches 'rounded-2xl'
  zIndex: 0
};

// --- Main Component ---

/**
 * A static map component that displays a specific location marker.
 * User interaction (zoom/drag) is disabled for display purposes.
 */
function MapDisplay({ location }) {
  // 1. Validation: Guard clause for missing location data
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 rounded-2xl">
        No Location Data Available
      </div>
    );
  }

  const position = [location.lat, location.lng];

  return (
    <MapContainer
      center={position}
      zoom={DEFAULT_ZOOM}
      style={CONTAINER_STYLE}
      // Disable all interactions to keep it static
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        url={TILE_LAYER_URL}
      />

      <Marker position={position} />
    </MapContainer>
  );
}

export default MapDisplay;