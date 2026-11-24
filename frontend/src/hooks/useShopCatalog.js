import { useCallback, useMemo, useState } from 'react';
import { getShopCatalog, getShopTicketDetail } from '../services/shopService';
import { useAsyncResource } from './useAsyncResource';

const EMPTY_FILTERS = {};

const DEFAULT_FILTERS = {
  search: '',
  type: '',
  categories: [],
  localizacion: '',
  minPrice: '',
  maxPrice: '',
  limit: 5,
  offset: 0
};

const parseNonNegativeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const useShopCatalog = (initialFilters = EMPTY_FILTERS) => {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });

  const minPriceValue = parseNonNegativeNumber(filters.minPrice);
  const maxPriceValue = parseNonNegativeNumber(filters.maxPrice);
  const hasInvalidPriceRange = minPriceValue !== undefined
    && maxPriceValue !== undefined
    && minPriceValue > maxPriceValue;

  const hasActiveFilters = Boolean(
    filters.search.trim()
    || filters.type
    || filters.categories.length > 0
    || filters.localizacion
    || minPriceValue !== undefined
    || maxPriceValue !== undefined
  );

  const queryParams = useMemo(() => ({
    search: filters.search.trim() || undefined,
    type: filters.type || undefined,
    category: filters.categories.length ? filters.categories.join(',') : undefined,
    localizacion: filters.localizacion || undefined,
    minPrice: minPriceValue,
    maxPrice: maxPriceValue,
    limit: filters.limit,
    offset: filters.offset
  }), [filters.categories, filters.limit, filters.localizacion, filters.offset, filters.search, filters.type, maxPriceValue, minPriceValue]);

  const fetcher = useCallback(() => getShopCatalog(queryParams), [queryParams]);

  const { data, loading, error, reload } = useAsyncResource({
    fetcher,
    initialData: { items: [], pagination: { total: 0, limit: DEFAULT_FILTERS.limit, offset: 0 } },
    enabled: hasActiveFilters && !hasInvalidPriceRange,
    errorMessage: 'No se pudo consultar el catálogo.'
  });

  const updateFilters = useCallback((patch) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      offset: patch.offset !== undefined ? patch.offset : 0
    }));
  }, []);

  const toggleCategory = useCallback((value) => {
    setFilters((current) => {
      const exists = current.categories.includes(value);
      const categories = exists
        ? current.categories.filter((item) => item !== value)
        : [...current.categories, value];
      return { ...current, categories, offset: 0 };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  return {
    filters,
    hasActiveFilters,
    hasInvalidPriceRange,
    items: data?.items || [],
    pagination: data?.pagination || { total: 0, limit: filters.limit, offset: filters.offset },
    loading,
    error,
    reload,
    updateFilters,
    toggleCategory,
    resetFilters
  };
};

export const useShopTicketDetail = (slug) => {
  const fetcher = useCallback(() => getShopTicketDetail(slug), [slug]);
  const { data, loading, error, reload } = useAsyncResource({
    fetcher,
    initialData: null,
    enabled: Boolean(slug),
    errorMessage: 'No se pudo cargar el detalle de la entrada.'
  });

  return { ticket: data, loading, error, reload };
};
