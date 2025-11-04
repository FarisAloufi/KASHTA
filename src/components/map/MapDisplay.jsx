import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const containerStyle = {
  width: '100%',
  height: '300px', 
  borderRadius: '8px',
  pointerEvents: 'none' 
};

function MapDisplay({ location }) {

  const position = [location.lat, location.lng];

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={containerStyle}
      scrollWheelZoom={false} 
      dragging={false} 
      zoomControl={false} 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={position} />
    </MapContainer>
  );
}

export default MapDisplay;