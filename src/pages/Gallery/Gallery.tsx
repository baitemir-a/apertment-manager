import React, { useState, useMemo } from 'react';
import { useApartments } from '../../context/ApartmentContext';
import ApartmentCard from '../../components/ApartmentCard/ApartmentCard';
import './Gallery.css';

const Gallery: React.FC = () => {
  const { apartments } = useApartments();
  const [sortBy, setSortBy] = useState<'price' | 'area'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedApartments = useMemo(() => {
    return [...apartments].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }, [apartments, sortBy, sortOrder]);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>Доступные квартиры</h1>
      </div>

      {apartments.length > 0 && (
        <div className="gallery-filters glass">
          <div className="filter-group">
            <label>Сортировать по:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'price' | 'area')}
              className="filter-select"
            >
              <option value="price">Цене</option>
              <option value="area">Площади</option>
            </select>
            
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="filter-select"
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </div>
      )}

      {apartments.length === 0 ? (
        <div className="empty-state glass">
          <p>Квартиры не найдены. Перейдите в панель админа, чтобы добавить их.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {sortedApartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
