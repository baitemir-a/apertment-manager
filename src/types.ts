export type HeatingType = 'CENTRAL' | 'GAS' | 'ELECTRIC';
export type DocumentType = 'TECHPASPORT' | 'DDU';

export interface Image {
  id: number;
  url: string;
  apartment_id: number;
  description?: string;
}

export interface Apartment {
  id: number;
  address: string;
  lat?: number;
  lng?: number;
  area: number;
  price: number;
  heating: HeatingType;
  floor: number;
  floor_total: number;
  document: DocumentType;
  additional_info: string;
  owner_phone: string;
  images: Image[];
}
