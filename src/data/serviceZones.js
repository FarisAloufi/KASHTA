import * as turf from "@turf/turf";
import jeddahGeo from "./jeddah.geo.json"; 

export function isLocationAllowed(lat, lng) {
  const point = turf.point([lng, lat]); 
  const polygon = jeddahGeo.features[0]; 

  return turf.booleanPointInPolygon(point, polygon);
}