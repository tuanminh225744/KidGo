import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  CircleMarker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DriverLiveMap.css";
import { useDriverStore } from "../store/useDriverStore.js";
import {
  clearDriverLocationProvider,
  connectDriverSocket,
} from "../socket/driverSocket.js";
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

const DriverLiveMap = ({ className = "", startPointProp, endPointProp }) => {
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);
  const positionRef = useRef(null);
  const driverInfo = useDriverStore((state) => state.driverInfo);
  const driverId = driverInfo?._id || null;
  
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
    const start = startPointProp === "current" ? position : startPointProp;
    if (start && endPointProp) {
      calculateRoute(start, endPointProp);
    } else {
      setRoute(null);
    }
  }, [startPointProp, endPointProp, position]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    connectDriverSocket({
      driverId,
      getPosition: () => positionRef.current,
    });

    return () => {
      clearDriverLocationProvider();
    };
  }, [driverId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Trình duyệt không hỗ trợ định vị.");
      return undefined;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        console.error("Không thể lấy vị trí hiện tại:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fallbackCenter = [21.028511, 105.804817];
  const center = position ? [position.lat, position.lng] : fallbackCenter;

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
        {position && <MapCenter position={center} />}
        {position && (
          <>
            <CircleMarker
              center={center}
              radius={16}
              interactive={false}
              bubblingMouseEvents={false}
              pathOptions={{
                color: "#0099ff",
                weight: 5,
                fillColor: "#79c5ff",
                fillOpacity: 0.35,
              }}
            />
            <Marker position={center} icon={currentLocationIcon} />
          </>
        )}
        
        {endPointProp && (
          <Marker
            position={[endPointProp.lat, endPointProp.lng]}
            icon={startMarkerIcon}
          />
        )}

        {route && route.length > 0 && (
          <Polyline positions={route} color="#4F46C8" weight={5} opacity={0.8} />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      {!position && (
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-3 text-xs text-gray-600 shadow-lg backdrop-blur">
          Đang chờ quyền vị trí hoặc đang xác định vị trí hiện tại...
        </div>
      )}
    </div>
  );
};

export default DriverLiveMap;
