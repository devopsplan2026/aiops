import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowForward,
  ShoppingBagOutlined,
  Star,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  variant?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, variant = 'grid' }) => {
  const navigate = useNavigate();
  const inventory = Number(product.inventory_quantity ?? product.inventory ?? 0);
  const originalPrice = Number(product.originalPrice || 0);
  const price = Number(product.price);
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const isList = variant === 'list';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isList ? { xs: 'column', sm: 'row' } : 'column',
        border: '1px solid',
        borderColor: 'rgba(32, 29, 26, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(32, 29, 26, 0.045)',
        transition: 'transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: 'rgba(167, 127, 81, 0.38)',
          boxShadow: '0 18px 38px rgba(32, 29, 26, 0.12)',
        },
      }}
    >
      <Box
        onClick={() => navigate(`/products/${product.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            navigate(`/products/${product.id}`);
          }
        }}
        sx={{
          position: 'relative',
          flex: isList ? { sm: '0 0 34%' } : undefined,
          overflow: 'hidden',
          cursor: 'pointer',
          aspectRatio: isList ? { xs: '4 / 3', sm: '1 / 1' } : '4 / 5',
          backgroundColor: '#f1eee9',
        }}
      >
        <CardMedia
          component="img"
          image={product.imageUrl || '/product-images/placeholder.jpg'}
          alt={product.name}
          onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
            const image = event.currentTarget;
            if (!image.src.endsWith('/product-images/placeholder.jpg')) {
              image.src = '/product-images/placeholder.jpg';
            }
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1)',
            '.MuiCard-root:hover &': { transform: 'scale(1.055)' },
          }}
        />
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 14, left: 14 }}>
          {product.isNew && (
            <Chip
              label="CURATED"
              size="small"
              sx={{ bgcolor: '#fffaf1', color: '#76562f', fontWeight: 700, letterSpacing: '0.08em' }}
            />
          )}
          {discount > 0 && (
            <Chip
              label={`${discount}% OFF`}
              size="small"
              sx={{ bgcolor: '#332c26', color: '#fff', fontWeight: 700, letterSpacing: '0.04em' }}
            />
          )}
        </Stack>
        {inventory === 0 && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(28, 25, 22, 0.48)', display: 'grid', placeItems: 'center' }}>
            <Chip label="SOLD OUT" sx={{ bgcolor: '#fff', fontWeight: 700, letterSpacing: '0.1em' }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="overline" sx={{ color: '#91714e', fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1.5 }}>
            {product.category}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <Star sx={{ fontSize: 15, color: '#b1884f' }} />
            <Typography variant="caption" sx={{ color: '#71685f', fontWeight: 600 }}>
              {Number(product.rating || 4.7).toFixed(1)}
            </Typography>
          </Stack>
        </Stack>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            color: '#29251f',
            fontSize: '1.04rem',
            fontWeight: 600,
            lineHeight: 1.35,
            minHeight: '2.7em',
            mb: 0.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#827a71',
            lineHeight: 1.6,
            mb: 2,
            minHeight: '3.2em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 'auto', mb: 1.75 }}>
          <Typography variant="h6" sx={{ color: '#2c2721', fontWeight: 700 }}>
            ${price.toFixed(2)}
          </Typography>
          {discount > 0 && (
            <Typography variant="body2" sx={{ color: '#9a9187', textDecoration: 'line-through' }}>
              ${originalPrice.toFixed(2)}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/products/${product.id}`)}
            endIcon={<ArrowForward />}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 1,
              borderColor: 'rgba(41, 37, 31, 0.2)',
              color: '#39332b',
              '&:hover': { borderColor: '#91714e', bgcolor: '#faf7f2' },
            }}
          >
            Discover
          </Button>
          <Button
            variant="contained"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAddToCart(product)}
            disabled={inventory === 0}
            sx={{
              minWidth: 48,
              px: 1.5,
              bgcolor: '#29251f',
              color: '#fff',
              '&:hover': { bgcolor: '#76562f' },
            }}
          >
            <ShoppingBagOutlined />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
