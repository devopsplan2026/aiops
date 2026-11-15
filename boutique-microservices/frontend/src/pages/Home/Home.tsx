import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ArrowForward,
  AutoAwesomeOutlined,
  LocalShippingOutlined,
  RefreshOutlined,
  ShieldOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ProductCard from '../../components/common/ProductCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    productService.getAll()
      .then(setProducts)
      .catch((error) => {
        console.error('Error loading storefront products:', error);
        setLoadError('Our collection is temporarily unavailable. Please try again shortly.');
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = products.filter((product) => product.isNew).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <Box sx={{ bgcolor: '#fbfaf8', color: '#29251f', pb: 8 }}>
      <Box
        sx={{
          minHeight: { xs: 570, md: 650 },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          backgroundColor: '#29251f',
          backgroundImage: {
            xs: 'linear-gradient(90deg, rgba(28,25,22,.86), rgba(28,25,22,.46)), url("/product-images/cashmere-coat.jpg")',
            md: 'linear-gradient(90deg, #29251f 0%, rgba(41,37,31,.96) 38%, rgba(41,37,31,.18) 100%), url("/product-images/cashmere-coat.jpg")',
          },
          backgroundPosition: 'center, 72% 45%',
          backgroundSize: 'cover',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 650, py: { xs: 8, md: 12 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, color: '#d8bc91' }}>
              <AutoAwesomeOutlined fontSize="small" />
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '.22em' }}>
                THE ART OF EVERYDAY LUXURY
              </Typography>
            </Stack>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: { xs: '3.2rem', sm: '4.4rem', md: '5.6rem' },
                lineHeight: 1.02,
                letterSpacing: '-.045em',
                mb: 3,
                color: '#fff',
              }}
            >
              Wear the
              <Box component="span" sx={{ display: 'block', color: '#d8bc91', fontStyle: 'italic' }}>
                exceptional.
              </Box>
            </Typography>
            <Typography sx={{ maxWidth: 475, color: 'rgba(255,255,255,.78)', fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.8, mb: 4 }}>
              A considered collection of enduring silhouettes, beautiful materials, and pieces you will reach for season after season.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  px: 3.5,
                  py: 1.5,
                  bgcolor: '#d8bc91',
                  color: '#29251f',
                  '&:hover': { bgcolor: '#c4a475' },
                }}
              >
                Explore the collection
              </Button>
              <Button
                component={RouterLink}
                to="/products"
                variant="outlined"
                sx={{ px: 3.5, py: 1.5, borderColor: 'rgba(255,255,255,.5)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }}
              >
                Shop bestsellers
              </Button>
            </Stack>
            <Stack direction="row" spacing={3} sx={{ mt: 6, color: 'rgba(255,255,255,.7)' }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#fff', fontFamily: '"Playfair Display", Georgia, serif' }}>12+</Typography>
                <Typography variant="caption" sx={{ color: 'inherit' }}>New arrivals</Typography>
              </Box>
              <Box sx={{ borderLeft: '1px solid rgba(255,255,255,.25)', pl: 3 }}>
                <Typography variant="h5" sx={{ color: '#fff', fontFamily: '"Playfair Display", Georgia, serif' }}>Curated</Typography>
                <Typography variant="caption" sx={{ color: 'inherit' }}>With intention</Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
        <Box sx={{ position: 'absolute', right: { xs: 16, md: 48 }, bottom: 24 }}>
          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', color: 'rgba(255,255,255,.62)', letterSpacing: '.2em' }}>
            DISCOVER YOUR SIGNATURE
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={2} sx={{ mt: { xs: -3, md: -4 }, position: 'relative', zIndex: 1 }}>
          {[
            { icon: <LocalShippingOutlined />, title: 'Complimentary delivery', detail: 'On orders over $500' },
            { icon: <ShieldOutlined />, title: 'Thoughtful quality', detail: 'Considered in every detail' },
            { icon: <RefreshOutlined />, title: 'Easy returns', detail: 'A 30-day return window' },
          ].map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: '#fff',
                  border: '1px solid #eee9e2',
                  borderRadius: 2,
                  boxShadow: '0 12px 30px rgba(41,37,31,.045)',
                }}
              >
                <Box sx={{ width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: '#f5f0e9', color: '#8a6b45' }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '.95rem' }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.detail}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ pt: { xs: 8, md: 11 }, pb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2} sx={{ mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#92714d', fontWeight: 700, letterSpacing: '.2em' }}>
                EDITOR'S SELECTION
              </Typography>
              <Typography component="h2" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '2.2rem', md: '3rem' }, lineHeight: 1.15, color: '#29251f' }}>
                The pieces worth keeping.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Discover the signatures of the season, selected for lasting style.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/products" endIcon={<ArrowForward />} sx={{ color: '#6f5435', fontWeight: 700 }}>
              Shop everything
            </Button>
          </Stack>
          {loadError && <Alert severity="error" sx={{ mb: 3 }}>{loadError}</Alert>}
          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <Grid container spacing={2.5}>
              {displayProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard product={product} onAddToCart={addItem} />
                </Grid>
              ))}
              {!loadError && displayProducts.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">The collection is being prepared. Please check back soon.</Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>

        <Box
          sx={{
            mt: 6,
            p: { xs: 3, md: 6 },
            minHeight: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            flexWrap: 'wrap',
            color: '#fff',
            bgcolor: '#82715c',
            backgroundImage: 'linear-gradient(90deg, rgba(41,37,31,.92), rgba(41,37,31,.45)), url("/product-images/silk-evening-gown.jpg")',
            backgroundPosition: 'center 38%',
            backgroundSize: 'cover',
            borderRadius: 2,
          }}
        >
          <Box sx={{ maxWidth: 570 }}>
            <Typography variant="overline" sx={{ color: '#e4ceb0', letterSpacing: '.2em', fontWeight: 700 }}>
              A MORE CONSIDERED WARDROBE
            </Typography>
            <Typography component="h2" sx={{ mt: 1, fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '2rem', md: '2.8rem' }, color: '#fff' }}>
              Find your forever piece.
            </Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.75)' }}>
              Beautifully made essentials, made to be lived in and loved.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/products" variant="contained" endIcon={<ArrowForward />} sx={{ bgcolor: '#d8bc91', color: '#29251f', '&:hover': { bgcolor: '#c4a475' } }}>
            Discover the edit
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
