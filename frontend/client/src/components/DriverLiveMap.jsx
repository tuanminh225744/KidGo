import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DriverLiveMap.css";

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

const MapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo(position, 16, { duration: 0.8 });
  }, [map, position]);

  return null;
};

const DriverLiveMap = ({ className = "" }) => {
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);

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
