export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  role: 'farmer' | 'owner';
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  rate: number;
  location: string;
  distance: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  ownerId: number;
  available: boolean;
}

export interface Booking {
  id: number;
  equipmentId: number;
  farmerId: number;
  ownerId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  purpose: string;
  createdAt: string;
  equipment?: Equipment;
  farmer?: {
    id: number;
    name: string;
    phone: string;
  };
  owner?: {
    id: number;
    name: string;
    phone: string;
  };
}

export interface Availability {
  id: number;
  equipmentId: number;
  date: string;
  available: boolean;
}

export interface BookingFormData {
  equipmentId: number;
  farmerId: number;
  ownerId: number;
  startDate: Date;
  endDate: Date;
  purpose: string;
  totalAmount: number;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  category: string;
  rate: number;
  location: string;
  distance: number;
  imageUrl: string;
  ownerId: number;
}

export interface DateSelection {
  from: Date | undefined;
  to: Date | undefined;
}
