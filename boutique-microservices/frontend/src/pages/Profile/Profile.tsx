import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as OrdersIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (user) {
      orderService.getUserOrders(user.id)
        .then(setOrders)
        .catch((error) => {
          console.error('Error loading profile orders:', error);
          setOrdersError('Order history is temporarily unavailable.');
        });
    }
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Button variant="contained" href="/login">
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  const menuItems = [
    { icon: <OrdersIcon />, label: 'Order History', path: '/orders' },
    { icon: <OrdersIcon />, label: 'Continue Shopping', path: '/products' },
  ];

  const stats = [
    { label: 'Total Orders', value: String(orders.length) },
    { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          My Profile
        </Typography>
        
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  fontSize: '3rem',
                  fontWeight: 600,
                }}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Chip
                label={user.role}
                color="primary"
                size="small"
                sx={{ mb: 2, textTransform: 'capitalize' }}
              />
              <Typography variant="body2" color="text.secondary" paragraph>
                {user.email}
              </Typography>
              <Button
                variant="text"
                color="error"
                startIcon={<LogoutIcon />}
                fullWidth
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
              >
                Logout
              </Button>
            </Paper>
          </Grid>
          
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {/* Stats Cards */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={index}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              {/* Personal Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={`${user.firstName} ${user.lastName}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Address"
                        secondary={user.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone Number"
                        secondary="Not provided"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary="Not provided"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              {/* Quick Actions */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <List>
                    {menuItems.map((item, index) => (
                      <ListItem
                        key={index}
                        component={RouterLink}
                        to={item.path}
                        sx={{ borderRadius: 2, mb: 1 }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              {/* Recent Activity */}
              <Grid size={{ xs: 12 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  {ordersError ? (
                    <Alert severity="error">{ordersError}</Alert>
                  ) : orders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Your recent orders will appear here after checkout.
                      </Typography>
                    </Box>
                  ) : (
                    <List dense>
                      {orders.slice(0, 3).map((order) => (
                        <ListItem key={order.id}>
                          <ListItemText
                            primary={`Order #${order.id.slice(-8)}`}
                            secondary={`${new Date(order.createdAt).toLocaleDateString()} · ${order.status} · $${Number(order.totalAmount).toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;