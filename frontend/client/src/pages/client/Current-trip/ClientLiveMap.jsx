import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ClientLiveMap.css";
import axios from "axios";
import polyline from "@mapbox/polyline";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const currentLocationIcon = new L.DivIcon({
  className: "driver-live-map-current-location-icon",
  html: "<div class='driver-live-map-current-location-dot'></div>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const startMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo(position, 16, { duration: 0.8 });
  }, [map, position]);

  return null;
};

const ClientLiveMap = ({ className = "", startPointProp, endPointProp }) => {
  // Client map expects positions passed in via props. No geolocation or socket here.
  const [route, setRoute] = useState(null);

  const decodePolyline = (geometry) => {
    if (!geometry) return [];
    if (typeof geometry === "string") {
      return polyline.decode(geometry);
    }
    if (geometry.coordinates) {
      return geometry.coordinates.map((coord) => [coord[1], coord[0]]);
    }
    return [];
  };

  const calculateRoute = async (start, end) => {
    try {
      const coordinates = [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ];

      const apiKey = import.meta.env.VITE_APP_MAP_API_KEY;

      if (!apiKey) return;

      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          coordinates: coordinates,
          extra_info: ["waytype", "steepness"],
        },
        {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        const geometry = routeData.geometry;
        const decodedPath = decodePolyline(geometry);
        setRoute(decodedPath);
      }
    } catch (err) {
      console.error("Lỗi tính toán tuyến đường:", err);
    }
  };

  useEffect(() => {
    const start = startPointProp;
    if (start && endPointProp) {
      calculateRoute(start, endPointProp);
    } else {
      setRoute(null);
    }
  }, [startPointProp, endPointProp]);

  const fallbackCenter = [21.028511, 105.804817];
  // Client view: center on provided startPointProp when available
  const center =
    startPointProp &&
    Number.isFinite(startPointProp.lat) &&
    Number.isFinite(startPointProp.lng)
      ? [startPointProp.lat, startPointProp.lng]
      : fallbackCenter;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <MapContainer
        center={center}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter position={center} />
        {startPointProp &&
          Number.isFinite(startPointProp.lat) &&
          Number.isFinite(startPointProp.lng) && (
            <Marker
              position={[startPointProp.lat, startPointProp.lng]}
              icon={currentLocationIcon}
            />
          )}

        {endPointProp &&
          Number.isFinite(endPointProp.lat) &&
          Number.isFinite(endPointProp.lng) && (
            <Marker
              position={[endPointProp.lat, endPointProp.lng]}
              icon={startMarkerIcon}
            />
          )}

        {route && route.length > 0 && (
          <Polyline
            positions={route}
            color="#4F46C8"
            weight={5}
            opacity={0.8}
          />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
    </div>
  );
};

export default ClientLiveMap;
