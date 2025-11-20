import React, { useState, useEffect } from "react";
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

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const center = [21.543333, 39.172778]; 

function MapClickHandler({ onLocationChange, setMarkerPosition, mode }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];

      if (mode === "set") {
        setMarkerPosition(newPos);
        onLocationChange({ lat: newPos[0], lng: newPos[1] });
      } else {
        if (isLocationAllowed(newPos[0], newPos[1])) {
          setMarkerPosition(newPos);
          onLocationChange({ lat: newPos[0], lng: newPos[1] });
        } else {
 
          alert("عذراً، خدماتنا متاحة حالياً داخل مدينة جدة فقط.");
        }
      }
    },
  });
  return null;
}

function SearchField({ setMarkerPosition, onLocationChange, mode }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
      searchLabel: "ابحث عن حي أو مكان..", 
    });
    map.addControl(searchControl);

    const onResult = (e) => {
      const newPos = [e.location.y, e.location.x];

      if (mode === "set") {
        setMarkerPosition(newPos);
        onLocationChange({ lat: newPos[0], lng: newPos[1] });
      } else {
        if (isLocationAllowed(newPos[0], newPos[1])) {
          setMarkerPosition(newPos);
          onLocationChange({ lat: newPos[0], lng: newPos[1] });
        } else {
          alert("عذراً، الموقع المحدد خارج نطاق مدينة جدة.");
        }
      }
    };

    map.on("geosearch/showlocation", onResult);
    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", onResult);
    };
  }, [map, setMarkerPosition, onLocationChange, mode]);

  return null;
}

function MapPicker({ onLocationChange, mode = "booking" }) {
  const [markerPosition, setMarkerPosition] = useState(center);

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={containerStyle}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={markerPosition} />

      <MapClickHandler
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
        mode={mode}
      />

      <SearchField
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
        mode={mode}
      />
    </MapContainer>
  );
}

export default MapPicker;