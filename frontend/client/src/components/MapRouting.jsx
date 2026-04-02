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

const MapClick = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const MapRouting = () => {
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const handleMapClick = (latlng) => {
    if (points.length < 2) {
      const newPoints = [...points, [latlng.lat, latlng.lng]];
      setPoints(newPoints);

      if (newPoints.length === 2) {
        calculateRoute(newPoints);
      }
    }
  };

  useEffect(() => {
    console.log("🧩 useEffect mount");
    // Tự động yêu cầu lấy vị trí hiện tại khi component khởi tạo
    handleGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Nếu có vị trí hiện tại và map tồn tại, đưa map trung tâm vào vị trí đó.
    if (map && currentLocation) {
      console.log("🧩 flyTo currentLocation", currentLocation);
      map.flyTo([currentLocation.lat, currentLocation.lon], 14);
    }
  }, [map, currentLocation]);

  const calculateRoute = async (coords) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare coordinates for OpenRouteService (longitude first, then latitude)
      const coordinates = [
        [coords[0][1], coords[0][0]],
        [coords[1][1], coords[1][0]],
      ];

      const apiKey = import.meta.env.VITE_APP_MAP_API_KEY;

      // Check if API key is configured
      if (!apiKey) {
        setError(
          "❌ API key không được cấu hình. Vui lòng tạo file .env và thêm VITE_APP_MAP_API_KEY",
        );
        setLoading(false);
        return;
      }

      console.log("📍 Tọa độ gửi:", coordinates);

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

      console.log("✅ API Response:", response.data);

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const geometry = route.geometry;

        // Get distance and duration from summary
        const distance = route.summary?.distance;
        const duration = route.summary?.duration;

        console.log("📊 Route data:", {
          distance: distance,
          duration: duration,
        });

        // Validate distance and duration exist
        if (distance === undefined || duration === undefined) {
          setError(
            "❌ Dữ liệu tuyến đường không hợp lệ. API response thiếu distance hoặc duration.",
          );
          setLoading(false);
          return;
        }

        // Decode the geometry (OpenRouteService returns encoded polyline)
        const decodedPath = decodePolyline(geometry);

        setRoute(decodedPath);

        // Distance in meters to km
        const distanceKm = (distance / 1000).toFixed(2);
        setDistance(distanceKm);

        // Duration in seconds to minutes
        const durationMinutes = Math.round(duration / 60);
        setDuration(durationMinutes);

        console.log("✅ Tính toán thành công:", {
          distance: distanceKm + " km",
          duration: durationMinutes + " phút",
        });
      } else {
        setError(
          "❌ Không tìm thấy tuyến đường. Vui lòng thử lại với các điểm khác.",
        );
      }
    } catch (err) {
      console.error("❌ Lỗi API:", err.response?.data || err.message);
      setError(
        err.response?.data?.error?.message ||
          "❌ Lỗi tính toán tuyến đường. Kiểm tra console để xem chi tiết lỗi.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Decode route geometry from ORS response
  const decodePolyline = (geometry) => {
    if (!geometry) return [];

    // ORS response can be either geojson or encoded polyline string
    if (typeof geometry === "string") {
      // ORS encoded polyline string
      const decoded = polyline.decode(geometry); // returns [lat, lng]
      return decoded;
    }

    // GeoJSON format
    if (geometry.coordinates) {
      return geometry.coordinates.map((coord) => [coord[1], coord[0]]);
    }

    return [];
  };

  const handleReset = () => {
    setPoints([]);
    setRoute(null);
    setDistance(null);
    setDuration(null);
    setError(null);
  };

  const handleSearchLocation = async () => {
    const apiKey = import.meta.env.VITE_APP_MAP_API_KEY;
    if (!searchText?.trim()) {
      setError("Vui lòng nhập tên địa điểm để tìm.");
      return;
    }
    if (!apiKey) {
      setError("❌ API key không được cấu hình.");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://api.openrouteservice.org/geocode/search",
        {
          params: {
            api_key: apiKey,
            text: searchText,
            size: 5,
          },
        },
      );

      const features = response.data?.features;
      if (!features || features.length === 0) {
        setError("Không tìm thấy địa điểm. Vui lòng thử lại.");
        setIsSearching(false);
        return;
      }

      const best = features[0];
      const [lon, lat] = best.geometry.coordinates;
      const label = best.properties?.label || searchText;

      const selected = { lat, lon, label };
      setSearchLocation(selected);

      if (map) {
        map.flyTo([lat, lon], 14);
      }

      setIsSearching(false);
    } catch (err) {
      console.error("Lỗi geocoding:", err.response?.data || err.message);
      setError("Lỗi tìm địa điểm. Vui lòng kiểm tra API key và thử lại.");
      setIsSearching(false);
    }
  };

  const handleGeolocation = () => {
    console.log("🧩 handleGeolocation called");
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ geolocation.");
      return;
    }

    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const current = {
          lat: latitude,
          lon: longitude,
          label: "Vị trí hiện tại",
        };
        setCurrentLocation(current);
        console.log("📍 Vị trí hiện tại:", current);
        const startPoint = [latitude, longitude];
        setPoints((prev) => {
          if (prev.length === 0) {
            return [startPoint];
          }
          if (prev[0][0] === latitude && prev[0][1] === longitude) {
            return prev;
          }
          return [startPoint, ...(prev[1] ? [prev[1]] : [])];
        });

        if (map) {
          map.flyTo([latitude, longitude], 14);
        }
      },
      (err) => {
        setError("Không lấy được vị trí hiện tại: " + err.message);
      },
    );
  };

  const setSearchLocationAsStart = (location) => {
    const locationToUse = location || searchLocation;
    if (!locationToUse) {
      setError("Chưa có vị trí cần dùng làm điểm đi.");
      return;
    }

    const step = [locationToUse.lat, locationToUse.lon];
    const newPoints = [step];

    if (points[1]) {
      newPoints.push(points[1]);
    } else if (points[0] && points.length === 1) {
      // Nếu đã có 1 điểm thì dùng searchLocation thay điểm xuất phát
      if (points[0] !== step) {
        newPoints[0] = step;
      }
    }

    setPoints(newPoints);

    if (newPoints.length === 2) {
      calculateRoute(newPoints);
    }
  };

  return (
    <div className="map-routing-container">
      <div className="map-controls">
        <h2>Lập kế hoạch tuyến đường</h2>

        <div className="search-group">
          <input
            type="text"
            placeholder="Nhập tên địa điểm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button onClick={handleSearchLocation} disabled={isSearching}>
            {isSearching ? "Đang tìm..." : "Tìm địa điểm"}
          </button>
        </div>

        <div className="search-location">
          {currentLocation && (
            <div className="current-location-info">
              <strong>Vị trí hiện tại:</strong>
              <div>{currentLocation.label}</div>
              <div>
                {currentLocation.lat.toFixed(6)},{" "}
                {currentLocation.lon.toFixed(6)}
              </div>
              <button
                className="use-start-btn"
                onClick={() => setSearchLocationAsStart(currentLocation)}
              >
                Dùng làm điểm đi
              </button>
            </div>
          )}

          {searchLocation && (
            <div className="found-location-info">
              <strong>Vị trí tìm được:</strong>
              <div>{searchLocation.label}</div>
              <div>
                {searchLocation.lat.toFixed(6)}, {searchLocation.lon.toFixed(6)}
              </div>
              <button
                className="use-start-btn"
                onClick={setSearchLocationAsStart}
              >
                Dùng làm điểm đi
              </button>
            </div>
          )}
        </div>

        <div className="instructions">
          <p>
            Nhấp vào bản đồ để chọn điểm xuất phát và điểm đến (chọn 2 điểm)
          </p>
          {points.length > 0 && <p>Đã chọn: {points.length}/2 điểm</p>}
        </div>

        {error && <div className="error-message">{error}</div>}

        {distance && duration && (
          <div className="route-info">
            <div className="info-item">
              <span className="label">Khoảng cách:</span>
              <span className="value">{distance} km</span>
            </div>
            <div className="info-item">
              <span className="label">Thời gian dự kiến:</span>
              <span className="value">{duration} phút</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading">Đang tính toán tuyến đường...</div>
        )}

        <button onClick={handleReset} className="reset-btn">
          Chọn lại tuyến đường
        </button>

        {points.length > 0 && (
          <div className="selected-points">
            <h3>Các điểm đã chọn:</h3>
            {points.map((point, idx) => (
              <div key={idx} className="point">
                <strong>{idx === 0 ? "Điểm xuất phát" : "Điểm đến"}:</strong>
                <span>
                  {point[0].toFixed(5)}, {point[1].toFixed(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={[20.997796, 105.856523]}
        zoom={12}
        className="map"
        whenCreated={setMap}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClick onMapClick={handleMapClick} />

        {currentLocation && (
          <>
            <CircleMarker
              center={[currentLocation.lat, currentLocation.lon]}
              radius={16}
              pathOptions={{
                color: "#0099ff",
                weight: 5,
                fillColor: "#79c5ff",
                fillOpacity: 0.35,
              }}
            >
              <Popup>
                Vị trí hiện tại: <br />
                {currentLocation.label}
              </Popup>
            </CircleMarker>
            <Marker
              position={[currentLocation.lat, currentLocation.lon]}
              icon={currentLocationIcon}
            >
              <Popup>Vị trí hiện tại</Popup>
            </Marker>
          </>
        )}

        {searchLocation && !currentLocation && (
          <CircleMarker
            center={[searchLocation.lat, searchLocation.lon]}
            radius={10}
            pathOptions={{
              color: "#40a9ff",
              weight: 3,
              fillColor: "#cceaff",
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              Vị trí tìm được: <br />
              {searchLocation.label}
            </Popup>
          </CircleMarker>
        )}

        {points[0] && (
          <Marker position={points[0]} icon={startMarkerIcon}>
            <Popup>Điểm xuất phát</Popup>
          </Marker>
        )}

        {points[1] && (
          <Marker position={points[1]} icon={endMarkerIcon}>
            <Popup>Điểm đến</Popup>
          </Marker>
        )}

        {route && route.length > 0 && (
          <Polyline positions={route} color="blue" weight={4} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapRouting;
