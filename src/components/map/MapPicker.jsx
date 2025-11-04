import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; 


const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};
const center = [24.7136, 46.6753]; 


function MapClickHandler({ onLocationChange, setMarkerPosition }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPos);
      onLocationChange({ lat: newPos[0], lng: newPos[1] });
      console.log("Leaflet: تم اختيار الموقع (بالنقر):", newPos);
    },
  });
  return null;
}


function SearchField({ setMarkerPosition, onLocationChange }) {
  const map = useMap(); 
  
  useEffect(() => {

    const provider = new OpenStreetMapProvider();


    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',     
      autoClose: true,   
      keepResult: true,   
      searchLabel: 'ابحث عن حي أو مكان...' 
    });

    map.addControl(searchControl); 


    const onResult = (e) => {

      const newPos = [e.location.y, e.location.x];
      setMarkerPosition(newPos); 
      onLocationChange({ lat: newPos[0], lng: newPos[1] }); 
      console.log("Leaflet: تم اختيار الموقع (بالبحث):", newPos);
    };

    map.on('geosearch/showlocation', onResult);


    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', onResult);
    };
  }, [map, setMarkerPosition, onLocationChange]);

  return null; 
}


function MapPicker({ onLocationChange }) {
  const [markerPosition, setMarkerPosition] = useState(center);

  return (
    <MapContainer 
      center={center} 
      zoom={10} 
      style={containerStyle}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={markerPosition} />

      <MapClickHandler 
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
      />
      

      <SearchField 
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
      />
    </MapContainer>
  );
}

export default MapPicker;