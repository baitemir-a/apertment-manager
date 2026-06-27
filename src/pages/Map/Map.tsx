import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApartments } from '../../context/ApartmentContext';
import './Map.css';
import { MapPin, Image as ImageIcon } from 'lucide-react';

let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14, { animate: true });
  }, [lat, lng, map]);
  return null;
};

const WORKPLACE_COORDS: [number, number] = [42.861431, 74.613745];

const MapPage: React.FC = () => {
  const { apartments } = useApartments();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Default Bishkek coordinates
  const defaultLat = 42.8746;
  const defaultLng = 74.5698;

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const idParam = searchParams.get('id');

  const centerLat = latParam ? parseFloat(latParam) : defaultLat;
  const centerLng = lngParam ? parseFloat(lngParam) : defaultLng;

  const markerRefs = useRef<{ [key: number]: L.Marker | null }>({});

  useEffect(() => {
    if (idParam) {
      const marker = markerRefs.current[parseInt(idParam, 10)];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [idParam, apartments]);

  const handleViewInGallery = (id: number) => {
    navigate(`/?id=${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="map-page-container">
      <MapContainer center={[centerLat, centerLng]} zoom={13} className="map-view">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={centerLat} lng={centerLng} />
        
        {apartments.filter(apt => apt.lat !== undefined && apt.lng !== undefined).map((apartment) => (
          <Marker 
            key={apartment.id} 
            position={[apartment.lat!, apartment.lng!]}
            ref={(ref) => { markerRefs.current[apartment.id] = ref; }}
          >
            <Popup className="apartment-popup">
              <div className="popup-content">
                {apartment.images && apartment.images.length > 0 ? (
                   <img src={apartment.images[0].url} alt="Квартира" className="popup-image" />
                ) : (
                  <div className="popup-no-image"><ImageIcon size={24} /></div>
                )}
                <div className="popup-details">
                  <h4 className="popup-address"><MapPin size={14} /> {apartment.address}</h4>
                  <p className="popup-price">{formatPrice(apartment.price)}</p>
                  <button 
                    className="btn btn-primary btn-sm popup-btn" 
                    onClick={() => handleViewInGallery(apartment.id)}
                  >
                    Посмотреть в галерее
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Workplace Marker */}
        <Marker 
          position={WORKPLACE_COORDS}
          icon={L.divIcon({
            className: 'workplace-marker',
            html: '<div class="workplace-pin"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
          })}
        >
          <Popup className="workplace-popup">
            <div className="workplace-popup-content">
              <h4>Моя Работа</h4>
              <p>Офис</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPage;
