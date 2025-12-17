import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Loader } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};


const libraries = ["places"];

function MapDisplay({ location }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script", 
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    libraries: libraries,  
  });

  if (!location || !location.lat || !location.lng) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 rounded-2xl">
        No Location Data Available
      </div>
    );
  }

  const center = {
    lat: Number(location.lat),
    lng: Number(location.lng)
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center w-full h-full bg-gray-100 rounded-xl">
        <Loader className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      options={{
        disableDefaultUI: true, 
        draggable: false,     
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default MapDisplay;