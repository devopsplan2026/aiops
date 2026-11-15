import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

const OrderConfirmation: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getOrderById(id)
      .then(setOrder)
      .catch((requestError: any) => {
        setError(requestError.response?.data?.error || 'We could not load this order.');
      });
  }, [id]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : !order ? (
            <Typography>Loading your order…</Typography>
          ) : (
            <>
              <CheckCircleOutline color="success" sx={{ fontSize: 72, mb: 2 }} />
              <Typography variant="h3" component="h1" gutterBottom>Order confirmed</Typography>
              <Typography color="text.secondary" paragraph>
                Thank you for your purchase. Your order has been saved.
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Order number</Typography>
                <Typography fontWeight={600}>#{order.id.slice(-8)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items</Typography><Typography>{order.items.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Payment</Typography>
                <Typography>{order.paymentStatus === 'paid' ? 'Paid (demo)' : 'Cash on delivery'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${Number(order.totalAmount).toFixed(2)}</Typography>
              </Box>
              <Button component={RouterLink} to="/orders" variant="contained" fullWidth>
                View my orders
              </Button>
              <Button component={RouterLink} to="/products" fullWidth sx={{ mt: 1 }}>
                Continue shopping
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OrderConfirmation;
