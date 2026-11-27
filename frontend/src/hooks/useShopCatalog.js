import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getShopCatalog, getShopTicketDetail } from '../services/shopService';
import { getPilotFullName } from '../utils/formatters';
import { useAsyncResource } from './useAsyncResource';

const EMPTY_FILTERS = {};

const DEFAULT_FILTERS = {
  search: '',
  type: '',
  categories: [],
  localizacion: '',
  minPrice: '',
  maxPrice: '',
  sort: '',
  limit: 12,
  offset: 0
};

const VALID_PILOT_SORTS = new Set([
  'numero_asc',
  'numero_desc',
  'edad_asc',
  'edad_desc',
  'nombre_asc',
  'nombre_desc',
  'escuderia_asc',
  'escuderia_desc'
]);

const compareNullableNumbers = (a, b, direction = 1) => {
  const aValid = Number.isFinite(a);
  const bValid = Number.isFinite(b);
  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;
  return (a - b) * direction;
};

const compareNullableStrings = (a, b, direction = 1) => {
  const aText = (a || '').trim();
  const bText = (b || '').trim();
  if (!aText && !bText) return 0;
  if (!aText) return 1;
  if (!bText) return -1;
  return aText.localeCompare(bText, 'es', { sensitivity: 'base' }) * direction;
};

const getBirthTimestamp = (pilot) => {
  if (!pilot?.fecha_nacimiento) return NaN;
  const time = new Date(pilot.fecha_nacimiento).getTime();
  return Number.isFinite(time) ? time : NaN;
};

const sortPilots = (items, sortKey) => {
  if (!sortKey || !VALID_PILOT_SORTS.has(sortKey) || items.length < 2) return items;
  const [field, order] = sortKey.split('_');
  const direction = order === 'desc' ? -1 : 1;

  return [...items].sort((left, right) => {
    switch (field) {
      case 'numero':
        return compareNullableNumbers(Number(left.numero), Number(right.numero), direction);
      case 'edad':
        // Smaller birth timestamp = older; ascending age (youngest first) sorts by descending timestamp.
        return compareNullableNumbers(getBirthTimestamp(left), getBirthTimestamp(right), -direction);
      case 'nombre':
        return compareNullableStrings(getPilotFullName(left), getPilotFullName(right), direction);
      case 'escuderia':
        return compareNullableStrings(left.escuderia?.nombre, right.escuderia?.nombre, direction);
      default:
        return 0;
    }
  });
};

const parseNonNegativeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parseFiltersFromSearchParams = (searchParams, defaults) => {
  const rawCategories = searchParams.get('category') || '';
  const rawOffset = Number(searchParams.get('offset'));
  const rawLimit = Number(searchParams.get('limit'));

  const rawSort = searchParams.get('sort') ?? defaults.sort;

  return {
    ...defaults,
    search: searchParams.get('search') ?? defaults.search,
    type: searchParams.get('type') ?? defaults.type,
    categories: rawCategories
      ? rawCategories.split(',').map((item) => item.trim()).filter(Boolean)
      : defaults.categories,
    localizacion: searchParams.get('localizacion') ?? defaults.localizacion,
    minPrice: searchParams.get('minPrice') ?? defaults.minPrice,
    maxPrice: searchParams.get('maxPrice') ?? defaults.maxPrice,
    sort: VALID_PILOT_SORTS.has(rawSort) ? rawSort : '',
    limit: Number.isSafeInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 100 ? rawLimit : defaults.limit,
    offset: Number.isSafeInteger(rawOffset) && rawOffset >= 0 ? rawOffset : defaults.offset
  };
};

const buildSearchParamsFromFilters = (filters, defaults) => {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.type) params.set('type', filters.type);
  if (filters.categories?.length) params.set('category', filters.categories.join(','));
  if (filters.localizacion) params.set('localizacion', filters.localizacion);
  if (filters.minPrice !== '' && filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== '' && filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.type === 'pilot' && VALID_PILOT_SORTS.has(filters.sort)) params.set('sort', filters.sort);
  if (filters.limit && filters.limit !== defaults.limit) params.set('limit', String(filters.limit));
  if (filters.offset > 0) params.set('offset', String(filters.offset));
  return params;
};

export const useShopCatalog = ({
  initialFilters = EMPTY_FILTERS,
  requireActiveFilters = false,
  syncWithUrl = false
} = {}) => {
  const defaults = useMemo(() => ({ ...DEFAULT_FILTERS, ...initialFilters }), [initialFilters]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [stateFilters, setStateFilters] = useState(defaults);

  const filters = useMemo(
    () => (syncWithUrl ? parseFiltersFromSearchParams(searchParams, defaults) : stateFilters),
    [defaults, searchParams, stateFilters, syncWithUrl]
  );

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
    initialData: { items: [], pagination: { total: 0, limit: defaults.limit, offset: 0 } },
    enabled: (!requireActiveFilters || hasActiveFilters) && !hasInvalidPriceRange,
    errorMessage: 'No se pudo consultar el catálogo.'
  });

  const applyFilters = useCallback((updater) => {
    if (syncWithUrl) {
      setSearchParams((currentParams) => {
        const current = parseFiltersFromSearchParams(currentParams, defaults);
        const next = updater(current);
        return buildSearchParamsFromFilters(next, defaults);
      }, { replace: true });
      return;
    }
    setStateFilters(updater);
  }, [defaults, setSearchParams, syncWithUrl]);

  const updateFilters = useCallback((patch) => {
    applyFilters((current) => ({
      ...current,
      ...patch,
      offset: patch.offset !== undefined ? patch.offset : 0
    }));
  }, [applyFilters]);

  const toggleCategory = useCallback((value) => {
    applyFilters((current) => {
      const exists = current.categories.includes(value);
      const categories = exists
        ? current.categories.filter((item) => item !== value)
        : [...current.categories, value];
      return { ...current, categories, offset: 0 };
    });
  }, [applyFilters]);

  const resetFilters = useCallback(() => {
    applyFilters(() => defaults);
  }, [applyFilters, defaults]);

  const sortedItems = useMemo(() => {
    const rawItems = data?.items || [];
    if (filters.type !== 'pilot' || !filters.sort) return rawItems;
    return sortPilots(rawItems, filters.sort);
  }, [data?.items, filters.sort, filters.type]);

  return {
    filters,
    hasActiveFilters,
    hasInvalidPriceRange,
    items: sortedItems,
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
