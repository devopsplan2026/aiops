import apiClient from './api';
import { Product } from '../types';

const mapProduct = (product: any): Product => {
  const price = Number(product.price);
  const originalPrice = product.compare_price ? Number(product.compare_price) : undefined;
  return {
    id: product.id,
    name: product.name,
    description: product.description || product.short_description || '',
    price,
    originalPrice,
    imageUrl: product.image_url || '/product-images/placeholder.jpg',
    category: product.category || product.category_id || 'Accessories',
    brand: product.brand,
    inventory: Number(product.inventory_quantity ?? product.inventory ?? 0),
    rating: Number(product.rating) || 4.7,
    reviewCount: Number(product.review_count) || 24,
    isNew: Boolean(product.new_arrival ?? product.is_featured),
    discountPercentage: originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined,
    createdAt: product.created_at || product.createdAt,
    updatedAt: product.updated_at || product.updatedAt,
  };
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get('/products');
      const apiResponse = response.data;
      
      if (apiResponse.success && apiResponse.data?.products) {
        return apiResponse.data.products.map(mapProduct);
      }
      
      return Array.isArray(apiResponse) ? apiResponse.map(mapProduct) : [];
    } catch (error: any) {
      console.error('[ProductService] Error fetching products:', error);
      if (error.response) {
        console.error('[ProductService] Response error:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return mapProduct(response.data.data || response.data);
    } catch (error: any) {
      console.error('[ProductService] Error fetching product:', error);
      throw error;
    }
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await apiClient.get(`/products?category=${category}`);
    return response.data;
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get(`/products/search?q=${query}`);
    return response.data;
  },
};