import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

export interface Car {
  id?: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  description?: string;
  price: number;
  imageUrl?: string;
  additionalImages?: string[];
  color?: string;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  engineCapacity?: string;
  seats?: number;
  features?: string[];
  status?: string;
}

export const carApi = {
  getAllCars: async () => {
    const response = await api.get('/api/cars');
    return response.data;
  },

  getCarById: async (id: number) => {
    const response = await api.get(`/api/cars/${id}`);
    return response.data;
  },

  createCar: async (car: Car) => {
    const response = await api.post('/api/cars', car);
    return response.data;
  },

  updateCar: async (id: number, car: Car) => {
    const response = await api.put(`/api/cars/${id}`, car);
    return response.data;
  },

  deleteCar: async (id: number) => {
    const response = await api.delete(`/api/cars/${id}`);
    return response.data;
  },
uploadImage: async (file: File) => {
  const formData = new FormData();
  formData.append('image', file); // IMPORTANT: name must be 'image'

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
},

  uploadMultipleImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post('/api/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;

