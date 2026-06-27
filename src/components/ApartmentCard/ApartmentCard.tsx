import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Maximize, Ruler, Thermometer, Phone, FileText, Trash2, X, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import type { Apartment } from '../../types';
import { useApartments } from '../../context/ApartmentContext';
import './ApartmentCard.css';

interface Props {
  apartment: Apartment;
}

const heatingLabels: Record<string, string> = {
  CENTRAL: 'Центральное',
  GAS: 'Газовое',
  ELECTRIC: 'Электрическое'
};

const documentLabels: Record<string, string> = {
  TECHPASPORT: 'Техпаспорт',
  DDU: 'ДДУ'
};

const ApartmentCard: React.FC<Props> = ({ apartment }) => {
  const navigate = useNavigate();
  const { deleteApartment } = useApartments();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const handleViewOnMap = () => {
    navigate(`/map?lat=${apartment.lat}&lng=${apartment.lng}&id=${apartment.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту квартиру?')) {
      deleteApartment(apartment.id);
    }
  };

  const hasImages = apartment.images && apartment.images.length > 0;
  const currentImageUrl = hasImages ? apartment.images[currentImageIndex].url : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop'; // Placeholder

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % apartment.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + apartment.images.length) % apartment.images.length);
    }
  };

  return (
    <>
      <div className="apartment-card glass">
        <div className="card-image-container" onClick={() => hasImages && setIsModalOpen(true)}>
          <img src={currentImageUrl} alt={apartment.address} className="card-image cursor-pointer" />
          <div className="card-price-badge">{formatPrice(apartment.price)}</div>
          
          <div className="card-actions">
            <button className="btn-action edit" onClick={(e) => { e.stopPropagation(); navigate(`/admin?edit=${apartment.id}`); }} title="Редактировать квартиру">
              <Edit size={16} />
            </button>
            <button className="btn-action delete" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="Удалить квартиру">
              <Trash2 size={16} />
            </button>
          </div>

          {hasImages && apartment.images.length > 1 && (
            <div className="card-image-indicators">
              {apartment.images.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card-content">
          <h3 className="card-address">
            <MapPin size={18} className="icon-accent" />
            {apartment.address}
          </h3>
          
          <div className="card-features">
            <div className="feature"><Maximize size={16} /> {apartment.area} м²</div>
            <div className="feature"><Ruler size={16} /> Этаж {apartment.floor}/{apartment.floor_total}</div>
            <div className="feature"><Thermometer size={16} /> {heatingLabels[apartment.heating] || apartment.heating}</div>
            <div className="feature"><FileText size={16} /> {documentLabels[apartment.document] || apartment.document}</div>
          </div>

          <p className="card-description">{apartment.additional_info}</p>
          
          <div className="card-footer">
            <div className="owner-phone">
              <Phone size={16} className="icon-primary" />
              {apartment.owner_phone}
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleViewOnMap}>
              <MapPin size={16} />
              На карте
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && hasImages && (
        <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            
            {apartment.images.length > 1 && (
              <button className="modal-nav prev" onClick={handlePrevImage}>
                <ChevronLeft size={32} />
              </button>
            )}

            <img src={apartment.images[currentImageIndex].url} alt="На весь экран" className="modal-image" />
            
            {apartment.images.length > 1 && (
              <button className="modal-nav next" onClick={handleNextImage}>
                <ChevronRight size={32} />
              </button>
            )}

            {apartment.images.length > 1 && (
              <div className="modal-indicators">
                {apartment.images.map((_, index) => (
                  <span 
                    key={index} 
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentCard;
