import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Apartment } from '../types';

interface ApartmentContextType {
  apartments: Apartment[];
  addApartment: (formData: FormData) => Promise<void>;
  editApartment: (id: number, formData: FormData) => Promise<void>;
  deleteApartment: (id: number) => Promise<void>;
  loading: boolean;
}

const ApartmentContext = createContext<ApartmentContextType | undefined>(undefined);

export const ApartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = import.meta.env.DEV ? '/api/apartments' : '/data.json';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setApartments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch apartments', err);
        setLoading(false);
      });
  }, []);

  const addApartment = async (formData: FormData) => {
    try {
      const response = await fetch('/api/apartments', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create');
      const newApartment = await response.json();
      setApartments(prev => [...prev, newApartment]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const editApartment = async (id: number, formData: FormData) => {
    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedApt = await res.json();
      setApartments((prev) => prev.map((apt) => apt.id === id ? updatedApt : apt));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteApartment = async (id: number) => {
    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setApartments((prev) => prev.filter((apt) => apt.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete apartment');
    }
  };

  return (
    <ApartmentContext.Provider value={{ apartments, addApartment, editApartment, deleteApartment, loading }}>
      {children}
    </ApartmentContext.Provider>
  );
};

export const useApartments = () => {
  const context = useContext(ApartmentContext);
  if (context === undefined) {
    throw new Error('useApartments must be used within an ApartmentProvider');
  }
  return context;
};
