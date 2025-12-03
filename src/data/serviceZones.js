// src/data/serviceZones.js

// 1. Import the GeoJSON data
import JEDDAH_GEOJSON from './jeddah.geo.json';

// --- Helper Functions ---

/**
 * Ray-Casting Algorithm to check if a point is inside a polygon.
 * @param {number} latitude - The point's latitude (y)
 * @param {number} longitude - The point's longitude (x)
 * @param {Array} polygon - Array of [lng, lat] coordinates
 * @returns {boolean} True if inside, False otherwise
 */
const isPointInPolygon = (latitude, longitude, polygon) => {
  const x = longitude;
  const y = latitude;
  
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    // Check intersection
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// --- Exported Logic ---

/**
 * Validates if the selected location is within the allowed service zones.
 * Used by MapPicker component.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Returns true if the location is serviceable.
 */
export const isLocationAllowed = (lat, lng) => {
  // Iterate through all defined zones in the imported GeoJSON
  return JEDDAH_GEOJSON.features.some((feature) => {
    // GeoJSON polygons are nested arrays: coordinates[0] is the outer ring
    const polygonCoordinates = feature.geometry.coordinates[0];
    return isPointInPolygon(lat, lng, polygonCoordinates);
  });
};