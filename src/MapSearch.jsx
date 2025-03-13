import React, { useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon (required for React-Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// This function watches for position changes and updates the map view <- fixes the repositioning of map
function ChangeMapView({ position }) {
  const map = useMap();
  map.setView(position, 13);
  return null;
}

const MapSearch = ({ onLocationChange, initialPosition, initialLocationName }) => {
  const [searchInput, setSearchInput] = useState('');
  const [position, setPosition] = useState([51.5074, -0.1278]); // Default position (London)
  const [locationName, setLocationName] = useState('London');

  // Update local state when props change <- fixes the repositioning of map based on intiail geolocation
  useEffect(() => {
    if (initialPosition && initialPosition[0] && initialPosition[1]) {
      setPosition(initialPosition);
    }
    if (initialLocationName) {
      setLocationName(initialLocationName);
    }
  }, [initialPosition, initialLocationName]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput) return;
    try {
      const API_KEY = process.env.REACT_APP_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=1&appid=${API_KEY}`
      );
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const newPosition = [result.lat, result.lon];
        setPosition(newPosition);
        setLocationName(result.name);
        // Trigger the parent's weather update with the new coordinates
        if (onLocationChange) {
          onLocationChange(result.lat, result.lon, result.name);
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <div className="map-search-container">
      <form onSubmit={handleSearch} className="map-search-form">
        <input
          type="text"
          placeholder="Search city..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="map-search-input"
          style={{ color: '#000'}}
        />
        <button type="submit" className="map-search-button">Search</button>
      </form>
      <div className="map-container">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '300px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div style={{ color: '#000'}}>
                {locationName}
              </div>
            </Popup>
          </Marker>
          <ChangeMapView position={position} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSearch;
