import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { Search, Loader, MapPin } from "lucide-react";
import { isLocationAllowed } from "../../data/serviceZones"; 

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

const JEDDAH_CENTER = {
  lat: 21.543333,
  lng: 39.172778
};

const libraries = ["places"];

function MapPicker({ onLocationChange, mode = "booking" }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY, 
    libraries: libraries,
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(JEDDAH_CENTER);
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleLocationUpdate = (lat, lng) => {
    const newPos = { lat, lng };

    if (mode === "set") {
      setMarkerPosition(newPos);
      if(onLocationChange) onLocationChange({ lat, lng });
      if(map) map.panTo(newPos);
    } else {
      if (isLocationAllowed(lat, lng)) {
        setMarkerPosition(newPos);
        if(onLocationChange) onLocationChange({ lat, lng });
        if(map) map.panTo(newPos);
      } else {
        alert("عذراً، خدماتنا متاحة حالياً داخل مدينة جدة فقط.");
      }
    }
  };

  const handleMapClick = (e) => {
    if (e.latLng) {
        handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
    }
  };

  const onLoadAutocomplete = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      handleLocationUpdate(lat, lng);
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-xl w-full">
        <Loader className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-3/4 max-w-md">
        <Autocomplete
          onLoad={onLoadAutocomplete}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن حي أو مكان.."
              className="w-full px-4 py-3 pl-10 rounded-xl shadow-lg border-2 border-main-accent/50 focus:border-main-accent focus:outline-none text-main-text bg-white"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={JEDDAH_CENTER}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
        }}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}

export default MapPicker;