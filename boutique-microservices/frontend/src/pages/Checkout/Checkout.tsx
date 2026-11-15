import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services/orderService';
import { Address, PaymentMethod } from '../../types';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo_card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shipping = total > 500 ? 0 : 15;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || items.length === 0) {
      setError('Sign in and add an item to your cart before checking out.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const order = await orderService.createOrder({
        userId: user.id,
        items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      navigate(`/orders/${order.id}/confirmation`, { replace: true });
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ||
        requestError.response?.data?.message ||
        'We could not place your order. Your cart is unchanged; please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>Browse products</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>Checkout</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Demo checkout — no real payment details are collected.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Shipping address</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField required fullWidth name="street" label="Street address" autoComplete="street-address" value={address.street} onChange={handleAddressChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField required fullWidth name="city" label="City" autoComplete="address-level2" value={address.city} onChange={handleAddressChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField required fullWidth name="state" label="State / Province" autoComplete="address-level1" value={address.state} onChange={handleAddressChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField required fullWidth name="zipCode" label="ZIP / Postal code" autoComplete="postal-code" value={address.zipCode} onChange={handleAddressChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField required fullWidth name="country" label="Country" autoComplete="country-name" value={address.country} onChange={handleAddressChange} />
                </Grid>
              </Grid>

              <FormControl sx={{ mt: 3 }}>
                <FormLabel>Payment method</FormLabel>
                <RadioGroup value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <FormControlLabel value="demo_card" control={<Radio />} label="Demo card — simulate a successful payment" />
                  <FormControlLabel value="cash_on_delivery" control={<Radio />} label="Cash on delivery" />
                </RadioGroup>
              </FormControl>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 3 }}>
                {submitting ? 'Placing order…' : `Place order · $${orderTotal.toFixed(2)}`}
              </Button>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Order summary</Typography>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{item.name} × {item.quantity}</Typography>
                  <Typography>${(Number(item.price) * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography>Subtotal</Typography><Typography>${total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Shipping</Typography><Typography>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Tax</Typography><Typography>${tax.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Total</Typography><Typography variant="h6">${orderTotal.toFixed(2)}</Typography>
              </Box>
              <Button variant="text" onClick={() => navigate('/cart')} sx={{ mt: 2 }}>Return to cart</Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Checkout;
