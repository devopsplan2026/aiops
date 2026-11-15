import apiClient from './api';
import { Address, Order, PaymentMethod, Product } from '../types';
import { productService } from './productService';

const unwrap = <T,>(response: { data: { data?: T } | T }): T => {
  const body = response.data;
  return (body && typeof body === 'object' && 'data' in body ? body.data : body) as T;
};

const hydrateOrders = async (orders: Order[]): Promise<Order[]> => {
  const products = new Map<string, Promise<Product>>();
  return Promise.all(orders.map(async (order) => ({
    ...order,
    items: await Promise.all(order.items.map(async (item) => {
      if (!products.has(item.productId)) {
        products.set(item.productId, productService.getById(item.productId));
      }
      return { ...item, product: await products.get(item.productId)! };
    })),
  })));
};

export const orderService = {
  createOrder: async (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Address;
    userId: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    const response = await apiClient.post('/orders', orderData);
    return unwrap<Order>(response);
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await apiClient.get('/orders/my-orders', { params: { userId } });
    return hydrateOrders(unwrap<Order[]>(response));
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    const [order] = await hydrateOrders([unwrap<Order>(response)]);
    return order;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return unwrap<Order>(response);
  },
};