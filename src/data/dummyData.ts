import type { Apartment } from '../types';

export const INITIAL_APARTMENTS: Apartment[] = [
  {
    id: 1,
    address: 'Chuy Ave 120, Bishkek',
    lat: 42.8765,
    lng: 74.6062,
    area: 75.5,
    price: 85000,
    heating: 'CENTRAL',
    floor: 4,
    floor_total: 9,
    document: 'TECHPASPORT',
    additional_info: 'Spacious apartment in the city center. Recently renovated.',
    owner_phone: '+996 555 123 456',
    images: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
        apartment_id: 1,
        description: 'Living Room'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1502672260266-1c1e52504437?q=80&w=800&auto=format&fit=crop',
        apartment_id: 1,
        description: 'Bedroom'
      }
    ]
  },
  {
    id: 2,
    address: 'Aitmatov Ave 84, Bishkek',
    lat: 42.8432,
    lng: 74.5876,
    area: 45.0,
    price: 52000,
    heating: 'GAS',
    floor: 2,
    floor_total: 5,
    document: 'DDU',
    additional_info: 'Cozy studio near the mall. Great for students.',
    owner_phone: '+996 777 987 654',
    images: [
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
        apartment_id: 2,
        description: 'Main Room'
      }
    ]
  },
  {
    id: 3,
    address: 'Toktogul St 110, Bishkek',
    lat: 42.8721,
    lng: 74.5943,
    area: 110.0,
    price: 135000,
    heating: 'ELECTRIC',
    floor: 10,
    floor_total: 12,
    document: 'TECHPASPORT',
    additional_info: 'Penthouse with a beautiful mountain view.',
    owner_phone: '+996 500 111 222',
    images: [
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop',
        apartment_id: 3,
        description: 'Kitchen'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
        apartment_id: 3,
        description: 'Balcony View'
      }
    ]
  }
];
