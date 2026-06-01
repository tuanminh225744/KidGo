import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import polyline from "@mapbox/polyline";
import "./MapRouting.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker for start and end points
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

const endMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const currentLocationIcon = new L.DivIcon({
  className: "current-location-icon",
  html: "<div class='current-location-dot'></div>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const MapClick = ({ onMapClick, readOnly }) => {
  const map = useMap();

  useEffect(() => {
    if (readOnly) return;
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick, readOnly]);

  return null;
};

const MapRouting = ({
  startPoint,
  endPoint,
  onRouteInfo,
  onMapClick,
  className = "w-full h-full z-0",
  readOnly = false,
  currentLocation,
}) => {
  const [route, setRoute] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRoute(startPoint, endPoint);
    } else {
      setRoute(null);
    }
  }, [startPoint, endPoint]);

  useEffect(() => {
    if (map && startPoint) {
      map.flyTo([startPoint.lat, startPoint.lng], 15);
    }
  }, [map, startPoint]);

  useEffect(() => {
    if (map && endPoint) {
      map.flyTo([endPoint.lat, endPoint.lng], 15);
    }
  }, [map, endPoint]);

  const calculateTravelTime = (distanceInMeters) => {
    const currentHour = new Date().getHours();

    let averageSpeed = 35; // km/h mặc định

    // Giờ cao điểm sáng + chiều
    if (
      (currentHour >= 7 && currentHour <= 9) ||
      (currentHour >= 17 && currentHour <= 19)
    ) {
      averageSpeed = 18;
    }

    // Buổi trưa
    else if (currentHour >= 11 && currentHour <= 13) {
      averageSpeed = 28;
    }

    // Ban đêm
    else if (currentHour >= 22 || currentHour <= 5) {
      averageSpeed = 45;
    }

    const distanceKm = distanceInMeters / 1000;

    // giờ
    const durationHours = distanceKm / averageSpeed;

    return durationHours;
  };

  const calculateRoute = async (start, end) => {
    try {
      const coordinates = [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ];

      const apiKey = import.meta.env.VITE_APP_MAP_API_KEY;

      if (!apiKey) {
        console.error("API key không được cấu hình.");
        return;
      }

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

        const distance = routeData.summary?.distance;
        const duration = calculateTravelTime(distance);

        const decodedPath = decodePolyline(geometry);
        setRoute(decodedPath);

        const distanceKm = (distance / 1000).toFixed(2);
        const durationMinutes = Math.round(duration * 60);

        if (onRouteInfo) {
          onRouteInfo({ distance: distanceKm, duration: durationMinutes });
        }

        if (map) {
          const bounds = L.latLngBounds([
            [start.lat, start.lng],
            [end.lat, end.lng],
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (err) {
      console.error("Lỗi tính toán tuyến đường:", err);
    }
  };

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

  const handleMapClick = (latlng) => {
    if (onMapClick) {
      onMapClick(latlng);
    }
  };

  // Lấy tạo độ điểm hiển thị ban đầu thành điểm của người dùng
  const [mapCenter, setMapCenter] = useState([21.008206, 105.841369]);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setMapCenter([latitude, longitude]);
      },
      (error) => {
        console.error(error);
      },
    );
  }, []);

  const ChangeMapCenter = ({ center }) => {
    const map = useMap();

    useEffect(() => {
      map.setView(center, 15);
    }, [center, map]);

    return null;
  };

  return (
    <MapContainer
      center={[21.008206, 105.841369]} // Default center Hà Nội
      zoom={12}
      className={className}
      ref={setMap}
      zoomControl={false}
    >
      <ChangeMapCenter center={mapCenter} />
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClick onMapClick={handleMapClick} readOnly={readOnly} />

      {currentLocation && (
        <>
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={16}
            pathOptions={{
              color: "#0099ff",
              weight: 5,
              fillColor: "#79c5ff",
              fillOpacity: 0.35,
            }}
          />
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={currentLocationIcon}
          />
        </>
      )}

      {startPoint && (
        <Marker
          position={[startPoint.lat, startPoint.lng]}
          icon={startMarkerIcon}
        >
          <Popup>Điểm đón</Popup>
        </Marker>
      )}

      {endPoint && (
        <Marker position={[endPoint.lat, endPoint.lng]} icon={endMarkerIcon}>
          <Popup>Điểm trả</Popup>
        </Marker>
      )}

      {route && route.length > 0 && (
        <Polyline positions={route} color="#4F46C8" weight={5} opacity={0.8} />
      )}
    </MapContainer>
  );
};

export default MapRouting;
