import express from 'express';
import axios from 'axios';
import { PoolClient } from 'pg';
import { getPool, query } from '../database/connection';
import { Order, CreateOrderRequest, Address, ServiceResponse } from '../types';

const router = express.Router();
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';
const validPaymentMethods = ['demo_card', 'cash_on_delivery'] as const;

const mapOrder = (row: any): Order => ({
  id: row.id,
  userId: row.user_id,
  items: (row.items || []).map((item: any) => ({
    ...item,
    quantity: Number(item.quantity),
    price: Number(item.price)
  })),
  totalAmount: Number(row.total_amount),
  status: row.status,
  shippingAddress: typeof row.shipping_address === 'string'
    ? JSON.parse(row.shipping_address)
    : row.shipping_address,
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

router.post('/', async (req, res) => {
  const { items, shippingAddress, userId, paymentMethod = 'demo_card' } = req.body as CreateOrderRequest & {
    userId?: string;
    paymentMethod?: string;
  };

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'A user and at least one order item are required' });
  }
  if (!shippingAddress || !['street', 'city', 'state', 'zipCode', 'country'].every(
    (field) => typeof shippingAddress[field as keyof Address] === 'string' &&
      shippingAddress[field as keyof Address].trim().length > 0
  )) {
    return res.status(400).json({ success: false, error: 'A complete shipping address is required' });
  }
  if (!validPaymentMethods.includes(paymentMethod as typeof validPaymentMethods[number])) {
    return res.status(400).json({ success: false, error: 'Unsupported payment method' });
  }
  if (items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return res.status(400).json({ success: false, error: 'Order items must have a product and a positive quantity' });
  }

  let client: PoolClient | undefined;
  let transactionStarted = false;
  try {
    client = await getPool().connect();
    const products = await Promise.all(items.map(async (item) => {
      const response = await axios.get(`${PRODUCTS_SERVICE_URL}/${item.productId}`);
      const product = response.data?.data;
      if (!product) {
        throw new Error(`Product ${item.productId} was not found`);
      }
      if (Number(product.inventory_quantity) < item.quantity) {
        throw new Error(`${product.name} does not have enough stock`);
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price)
      };
    }));

    const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 500 ? 0 : 15;
    const totalAmount = Math.round((subtotal + shipping + subtotal * 0.08) * 100) / 100;
    const paymentStatus = paymentMethod === 'demo_card' ? 'paid' : 'pending';
    const orderStatus = paymentStatus === 'paid' ? 'processing' : 'pending';

    await client.query('BEGIN');
    transactionStarted = true;
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status, payment_method, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId, totalAmount, orderStatus, JSON.stringify(shippingAddress), paymentStatus, paymentMethod]);
    const order = orderResult.rows[0];

    const insertedItems = [];
    for (const item of products) {
      const result = await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING id, product_id, quantity, price
      `, [order.id, item.productId, item.quantity, item.price]);
      insertedItems.push(result);
    }
    await client.query('COMMIT');
    transactionStarted = false;

    const response: ServiceResponse<Order> = {
      success: true,
      data: mapOrder({
        ...order,
        items: insertedItems.map((result) => ({
          id: result.rows[0].id,
          orderId: order.id,
          productId: result.rows[0].product_id,
          quantity: result.rows[0].quantity,
          price: Number(result.rows[0].price)
        }))
      })
    };

    res.status(201).json(response);
  } catch (error) {
    if (transactionStarted && client) {
      await client.query('ROLLBACK');
    }
    console.error('Create order error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create order';
    const status = axios.isAxiosError(error)
      ? error.response?.status === 404 ? 404 : 502
      : message.includes('does not have enough stock') ? 409 : 500;
    res.status(status).json({ success: false, error: message });
  } finally {
    client?.release();
  }
});

router.get('/my-orders', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const result = await query(`
      SELECT o.*,
             COALESCE(JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'orderId', oi.order_id,
                 'productId', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.user_id, o.total_amount, o.status, o.shipping_address, o.payment_status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `, [userId]);

    const response: ServiceResponse<Order[]> = {
      success: true,
      data: result.rows.map(mapOrder)
    };

    res.json(response);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to get orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*,
             COALESCE(JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'orderId', oi.order_id,
                 'productId', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const response: ServiceResponse<Order> = {
      success: true,
      data: mapOrder(result.rows[0])
    };
    res.json(response);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Failed to get order' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    const updateResult = await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const response: ServiceResponse<Order> = {
      success: true,
      data: mapOrder({ ...updateResult.rows[0], items: [] })
    };

    res.json(response);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

export { router as orderRoutes };
