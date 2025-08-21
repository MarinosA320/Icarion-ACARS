import React from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
// Removed: import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS

// IMPORTANT: Replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual Mapbox Public Access Token.
// You can get one from https://account.mapbox.com/access-tokens/
// For production, consider loading this from an environment variable.
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';

interface FlightPathMapProps {
  geoJsonData: any; // Expecting GeoJSON LineString or FeatureCollection with LineString
}

const FlightPathMap: React.FC<FlightPathMapProps> = ({ geoJsonData }) => {
  if (!geoJsonData || !geoJsonData.coordinates || geoJsonData.coordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No flight path data available.</div>;
  }

  // Mapbox GL JS expects [longitude, latitude] for coordinates
  const pathCoordinates = geoJsonData.coordinates;

  if (pathCoordinates.length === 0) {
    return <div className="text-center text-muted-foreground p-4">Invalid flight path data.</div>;
  }

  const startPoint = pathCoordinates[0];
  const endPoint = pathCoordinates[pathCoordinates.length - 1];

  const lineGeoJson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: pathCoordinates,
    },
  };

  return (
    <Map
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: startPoint[0],
        latitude: startPoint[1],
        zoom: 6,
      }}
      style={{ width: '100%', height: '384px' }} // h-96 is 384px
      mapStyle="mapbox://styles/mapbox/streets-v11" // You can change this style
      interactive={false} // Make it non-interactive for display purposes
      key={JSON.stringify(geoJsonData)} // Force re-render on data change
    >
      <Source id="route-line" type="geojson" data={lineGeoJson}>
        <Layer
          id="line-layer"
          type="line"
          paint={{
            'line-color': '#007bff',
            'line-width': 3,
          }}
        />
      </Source>
      <Marker longitude={startPoint[0]} latitude={startPoint[1]} anchor="bottom" />
      <Marker longitude={endPoint[0]} latitude={endPoint[1]} anchor="bottom" />
    </Map>
  );
};

export default FlightPathMap;