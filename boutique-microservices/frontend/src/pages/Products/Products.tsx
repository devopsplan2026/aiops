import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  FilterList,
  GridView,
  ViewList,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ProductCard from '../../components/common/ProductCard';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel, { FilterOptions } from '../../components/common/FilterPanel';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';

const initialFilters: FilterOptions = {
  priceRange: [0, 100000],
  category: '',
  brand: [],
  size: [],
  color: [],
  rating: 0,
  inStock: false,
};

const Products: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [filterPanelKey, setFilterPanelKey] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    productService.getAll()
      .then(setProducts)
      .catch((error) => {
        console.error('Error loading products:', error);
        setLoadError('We could not load the collection. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))).sort(),
    [products]
  );
  const maxPrice = Math.max(...products.map((product) => product.price), 1000);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !query || [
        product.name,
        product.description,
        product.category,
        product.brand || '',
      ].some((value) => value.toLowerCase().includes(query));
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesBrand = filters.brand.length === 0 || filters.brand.includes(product.brand || '');
      const matchesStock = !filters.inStock || product.inventory > 0;
      return matchesSearch && matchesPrice && matchesCategory && matchesBrand && matchesStock;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      }
    });
  }, [products, searchQuery, filters, sortBy]);

  const clearFilters = () => {
    setFilters({ ...initialFilters, priceRange: [0, maxPrice] });
    setSearchQuery('');
    setSortBy('featured');
    setFilterPanelKey((key) => key + 1);
  };

  const filterPanel = (
    <FilterPanel
      key={filterPanelKey}
      onFilterChange={setFilters}
      value={filters}
      categories={categories}
      brands={brands}
      sizes={[]}
      colors={[]}
      maxPrice={maxPrice}
    />
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}><LoadingSkeleton count={8} /></Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '75vh', bgcolor: '#fbfaf8', pb: 8 }}>
      <Box sx={{ bgcolor: '#f1ede6', borderBottom: '1px solid #e8e1d7' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography variant="overline" sx={{ color: '#92714d', fontWeight: 700, letterSpacing: '.2em' }}>
            THE BOUTIQUE COLLECTION
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2}>
            <Box>
              <Typography component="h1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '2.7rem', md: '3.7rem' }, lineHeight: 1.1, color: '#29251f' }}>
                Considered, collected.
              </Typography>
              <Typography sx={{ mt: 1, color: '#777067' }}>
                Discover pieces chosen for their craft, character, and staying power.
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#71685f', whiteSpace: 'nowrap' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} to explore
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {loadError && (
            <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Retry</Button>}>
              {loadError}
            </Alert>
          )}
          <Grid container spacing={3.5}>
            {!isMobile && (
              <Grid size={{ xs: 12, md: 3 }}>
                {filterPanel}
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 9 }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <SearchBar onSearch={setSearchQuery} placeholder="Search the collection..." />
                  </Box>
                  {isMobile && (
                    <Button variant="outlined" startIcon={<FilterList />} onClick={() => setFilterDrawerOpen(true)} sx={{ borderColor: '#d8d0c4', color: '#453d34' }}>
                      Filters
                    </Button>
                  )}
                  <FormControl size="small" sx={{ minWidth: 170, bgcolor: '#fff' }}>
                    <InputLabel id="sort-products-label">Sort by</InputLabel>
                    <Select labelId="sort-products-label" value={sortBy} label="Sort by" onChange={(event) => setSortBy(event.target.value)}>
                      <MenuItem value="featured">Featured</MenuItem>
                      <MenuItem value="newest">Newest</MenuItem>
                      <MenuItem value="price-low">Price: Low to High</MenuItem>
                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                      <MenuItem value="name">Name: A to Z</MenuItem>
                    </Select>
                  </FormControl>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={viewMode}
                    onChange={(_, value: 'grid' | 'list' | null) => value && setViewMode(value)}
                    aria-label="Product layout"
                    sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' }, bgcolor: '#fff' }}
                  >
                    <ToggleButton value="grid" aria-label="Grid view"><GridView fontSize="small" /></ToggleButton>
                    <ToggleButton value="list" aria-label="List view"><ViewList fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                {categories.length > 0 && (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                      size="small"
                      onClick={() => setFilters((current) => ({ ...current, category: '' }))}
                      variant={!filters.category ? 'contained' : 'outlined'}
                      sx={{ borderRadius: 20, px: 2, ...(filters.category ? { borderColor: '#d8d0c4', color: '#5e554a' } : { bgcolor: '#29251f' }) }}
                    >
                      All pieces
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        size="small"
                        onClick={() => setFilters((current) => ({ ...current, category: current.category === category ? '' : category }))}
                        variant={filters.category === category ? 'contained' : 'outlined'}
                        sx={{ borderRadius: 20, px: 2, ...(filters.category === category ? { bgcolor: '#29251f' } : { borderColor: '#d8d0c4', color: '#5e554a' }) }}
                      >
                        {category}
                      </Button>
                    ))}
                  </Stack>
                )}

                {filteredProducts.length > 0 ? (
                  <Grid container spacing={2.5}>
                    {filteredProducts.map((product) => (
                      <Grid
                        key={product.id}
                        size={{
                          xs: 12,
                          sm: viewMode === 'list' ? 12 : 6,
                          md: viewMode === 'list' ? 12 : 6,
                          lg: viewMode === 'list' ? 12 : 4,
                        }}
                      >
                        <ProductCard product={product} onAddToCart={addItem} variant={viewMode} />
                      </Grid>
                    ))}
                  </Grid>
                ) : !loadError ? (
                  <Box sx={{ textAlign: 'center', py: 10, px: 2, bgcolor: '#fff', border: '1px solid #eee9e2', borderRadius: 2 }}>
                    <Typography component="h2" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.8rem', mb: 1 }}>
                      No pieces found
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your search or filters to discover more of the collection.
                    </Typography>
                    <Button variant="outlined" onClick={clearFilters}>Clear search and filters</Button>
                  </Box>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 'min(88vw, 360px)', sm: 360 }, p: 2, bgcolor: '#fbfaf8' } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Refine your edit</Typography>
          <IconButton aria-label="Close filters" onClick={() => setFilterDrawerOpen(false)}><Close /></IconButton>
        </Stack>
        {filterPanel}
      </Drawer>
    </Box>
  );
};

export default Products;
