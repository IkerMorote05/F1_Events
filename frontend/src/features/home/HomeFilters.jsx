import React, { useEffect, useMemo, useState } from 'react';
import { Euro, Layers, MapPin, Route, Search, SlidersHorizontal, Ticket, X } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: '', label: 'Todo' },
  { value: 'ticket', label: 'Entradas' },
  { value: 'race', label: 'Carreras' },
  { value: 'circuit', label: 'Circuitos' },
  { value: 'pilot', label: 'Pilotos' },
  { value: 'escuderia', label: 'Escuderías' }
];

const LOCATION_TYPES = new Set(['', 'ticket', 'race', 'circuit']);
const CIRCUIT_TYPES = new Set(['', 'circuit']);
const TICKET_TYPES = new Set(['', 'ticket']);

const getFilterKey = (item) => item.slug || item._id;

const CategoryChipGroup = ({ title, items, labelKey, selectedValues, onToggle }) => {
  if (!items.length) return null;

  return (
    <div className="home-filter-subgroup">
      <span className="home-filter-sublabel">{title}</span>
      <div className="home-chip-list">
        {items.map((item) => {
          const value = getFilterKey(item);
          const active = selectedValues.includes(value);
          return (
            <button
              key={item._id}
              type="button"
              className={`home-chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => onToggle(value)}
            >
              {item[labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const HomeFilters = ({
  filters,
  categories,
  localizaciones,
  hasActiveFilters,
  hasInvalidPriceRange,
  onUpdateFilters,
  onToggleCategory,
  onResetFilters
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || ''
  });

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    setPriceInputs({
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || ''
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === filters.search.trim()) return undefined;
    const timer = setTimeout(() => {
      onUpdateFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search, onUpdateFilters, searchInput]);

  useEffect(() => {
    if (
      priceInputs.minPrice === filters.minPrice
      && priceInputs.maxPrice === filters.maxPrice
    ) {
      return undefined;
    }
    const timer = setTimeout(() => {
      onUpdateFilters({
        minPrice: priceInputs.minPrice,
        maxPrice: priceInputs.maxPrice
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.maxPrice, filters.minPrice, onUpdateFilters, priceInputs.maxPrice, priceInputs.minPrice]);

  const groupedCategories = useMemo(() => {
    const circuit = categories?.circuit || [];
    return {
      global: categories?.global || [],
      circuitTipo: circuit.filter((item) => item.tipo),
      circuitDesgaste: circuit.filter((item) => item.desgaste),
      ticketEntrada: circuit.filter((item) => item.categoriaEntrada),
      ticketGrada: circuit.filter((item) => item.categoriaGrada)
    };
  }, [categories]);

  const showLocation = LOCATION_TYPES.has(filters.type);
  const showCircuitFilters = CIRCUIT_TYPES.has(filters.type);
  const showTicketFilters = TICKET_TYPES.has(filters.type);

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdateFilters({
      search: searchInput,
      minPrice: priceInputs.minPrice,
      maxPrice: priceInputs.maxPrice
    });
  };

  const handleTypeSelect = (nextType) => {
    const allowedCategories = new Set(groupedCategories.global.map(getFilterKey));
    if (CIRCUIT_TYPES.has(nextType)) {
      groupedCategories.circuitTipo.forEach((item) => allowedCategories.add(getFilterKey(item)));
      groupedCategories.circuitDesgaste.forEach((item) => allowedCategories.add(getFilterKey(item)));
    }
    if (TICKET_TYPES.has(nextType)) {
      groupedCategories.ticketEntrada.forEach((item) => allowedCategories.add(getFilterKey(item)));
      groupedCategories.ticketGrada.forEach((item) => allowedCategories.add(getFilterKey(item)));
    }

    onUpdateFilters({
      type: nextType,
      categories: filters.categories.filter((value) => allowedCategories.has(value)),
      localizacion: LOCATION_TYPES.has(nextType) ? filters.localizacion : '',
      minPrice: TICKET_TYPES.has(nextType) ? filters.minPrice : '',
      maxPrice: TICKET_TYPES.has(nextType) ? filters.maxPrice : ''
    });
  };

  const toggleLocation = (value) => {
    onUpdateFilters({ localizacion: filters.localizacion === value ? '' : value });
  };

  return (
    <aside className="home-filters-panel home-sidebar" aria-label="Búsqueda y filtros del catálogo">
      <div className="home-sidebar-header">
        <span className="home-sidebar-title">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>Filtros</span>
        </span>
        {hasActiveFilters ? (
          <button type="button" className="home-clear-link" onClick={onResetFilters}>
            <X size={14} aria-hidden="true" />
            <span>Limpiar</span>
          </button>
        ) : null}
      </div>

      <form className="home-search-form" onSubmit={handleSubmit} role="search">
        <div className="home-search-input-wrap">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar en el catálogo..."
            aria-label="Buscar en el catálogo"
          />
        </div>
        <button type="submit" className="btn-primary home-search-submit">Buscar</button>
      </form>

      <div className="home-filter-row">
        <span className="home-filter-label">Tipo</span>
        <div className="home-type-tabs" role="tablist" aria-label="Filtrar por tipo">
          {TYPE_OPTIONS.map((option) => {
            const active = filters.type === option.value;
            return (
              <button
                key={option.value || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                className={`home-chip${active ? ' is-active' : ''}`}
                onClick={() => handleTypeSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {groupedCategories.global.length > 0 ? (
        <div className="home-filter-group">
          <span className="home-filter-label">
            <Layers size={15} aria-hidden="true" />
            <span>Competición</span>
          </span>
          <div className="home-chip-list">
            {groupedCategories.global.map((category) => {
              const value = getFilterKey(category);
              const active = filters.categories.includes(value);
              return (
                <button
                  key={category._id}
                  type="button"
                  className={`home-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggleCategory(value)}
                >
                  {category.competicion}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showLocation && localizaciones.length > 0 ? (
        <div className="home-filter-group">
          <span className="home-filter-label">
            <MapPin size={15} aria-hidden="true" />
            <span>Lugar</span>
          </span>
          <div className="home-chip-list">
            {localizaciones.map((location) => {
              const value = getFilterKey(location);
              const active = filters.localizacion === value;
              return (
                <button
                  key={location._id}
                  type="button"
                  className={`home-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleLocation(value)}
                >
                  {location.ciudad}, {location.pais}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showCircuitFilters && (groupedCategories.circuitTipo.length > 0 || groupedCategories.circuitDesgaste.length > 0) ? (
        <div className="home-filter-group">
          <span className="home-filter-label">
            <Route size={15} aria-hidden="true" />
            <span>Circuitos</span>
          </span>
          <CategoryChipGroup
            title="Tipo de circuito"
            items={groupedCategories.circuitTipo}
            labelKey="tipo"
            selectedValues={filters.categories}
            onToggle={onToggleCategory}
          />
          <CategoryChipGroup
            title="Desgaste"
            items={groupedCategories.circuitDesgaste}
            labelKey="desgaste"
            selectedValues={filters.categories}
            onToggle={onToggleCategory}
          />
        </div>
      ) : null}

      {showTicketFilters ? (
        <div className="home-filter-group">
          <span className="home-filter-label">
            <Ticket size={15} aria-hidden="true" />
            <span>Entradas</span>
          </span>
          <CategoryChipGroup
            title="Tipo de entrada"
            items={groupedCategories.ticketEntrada}
            labelKey="categoriaEntrada"
            selectedValues={filters.categories}
            onToggle={onToggleCategory}
          />
          <CategoryChipGroup
            title="Tipo de grada"
            items={groupedCategories.ticketGrada}
            labelKey="categoriaGrada"
            selectedValues={filters.categories}
            onToggle={onToggleCategory}
          />
          <div className="home-filter-subgroup">
            <span className="home-filter-sublabel">
              <Euro size={13} aria-hidden="true" />
              <span>Precio (€)</span>
            </span>
            <div className="home-price-range">
              <label className="home-price-field">
                <span>Mín</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  value={priceInputs.minPrice}
                  onChange={(event) => setPriceInputs((current) => ({
                    ...current,
                    minPrice: event.target.value
                  }))}
                />
              </label>
              <label className="home-price-field">
                <span>Máx</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="Sin límite"
                  value={priceInputs.maxPrice}
                  onChange={(event) => setPriceInputs((current) => ({
                    ...current,
                    maxPrice: event.target.value
                  }))}
                />
              </label>
            </div>
            {hasInvalidPriceRange ? (
              <p className="home-filter-error" role="alert">
                El precio mínimo no puede superar al máximo.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
};
