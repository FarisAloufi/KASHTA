import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import { isLocationAllowed } from "../../data/serviceZones";

// --- Configuration ---
const JEDDAH_CENTER = [21.543333, 39.172778];
const DEFAULT_ZOOM = 11;

// Style to ensure map fills the parent container
const MAP_STYLE = {
  width: "100%",
  height: "100%", 
  borderRadius: "1rem", // Matches rounded-2xl
  zIndex: 0
};

// --- Sub-Components ---

/**
 * Handles clicks on the map surface.
 */
const MapEventsHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * Adds the Search Control to the map and handles search results.
 */
const SearchControl = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    
    // Configure Search Control
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
      searchLabel: "ابحث عن حي أو مكان..", // Arabic placeholder
    });

    map.addControl(searchControl);

    // Handle search result selection
    const handleSearchResult = (e) => {
      // Library returns { x, y, ... } where x=lng, y=lat
      onLocationSelect(e.location.y, e.location.x);
    };

    map.on("geosearch/showlocation", handleSearchResult);

    // Cleanup
    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleSearchResult);
    };
  }, [map, onLocationSelect]);

  return null;
};

// --- Main Component ---

function MapPicker({ onLocationChange, mode = "booking" }) {
  const [markerPosition, setMarkerPosition] = useState(JEDDAH_CENTER);

  /**
   * Centralized logic to validate and update location.
   * This removes code duplication between Click and Search events.
   */
  const handleLocationUpdate = useCallback((lat, lng) => {
    const newPos = [lat, lng];

    // Logic:
    // 1. If mode is 'set' (e.g., Admin defining a zone), allow any location.
    // 2. If mode is 'booking' (Customer), validate against service zones (Jeddah).
    if (mode === "set") {
      setMarkerPosition(newPos);
      onLocationChange({ lat, lng });
    } else {
      if (isLocationAllowed(lat, lng)) {
        setMarkerPosition(newPos);
        onLocationChange({ lat, lng });
      } else {
        alert("عذراً، خدماتنا متاحة حالياً داخل مدينة جدة فقط.");
      }
    }
  }, [mode, onLocationChange]);

  return (
    <MapContainer
      center={JEDDAH_CENTER}
      zoom={DEFAULT_ZOOM}
      style={MAP_STYLE}
      zoomControl={true}
    >
      {/* Map Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Selected Location Marker */}
      <Marker position={markerPosition} />

      {/* Interactions */}
      <MapEventsHandler onLocationSelect={handleLocationUpdate} />
      <SearchControl onLocationSelect={handleLocationUpdate} />
      
    </MapContainer>
  );
}

export default MapPicker;