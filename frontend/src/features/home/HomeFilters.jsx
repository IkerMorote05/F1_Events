import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Euro, Flag, Layers, MapPin, Route, SlidersHorizontal, Ticket, X } from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';

const TYPE_OPTIONS = [
  { value: '', label: 'Todo' },
  { value: 'ticket', label: 'Entradas' },
  { value: 'race', label: 'Carreras' },
  { value: 'circuit', label: 'Circuitos' },
  { value: 'pilot', label: 'Pilotos' },
  { value: 'escuderia', label: 'Escuderías' }
];

const PILOT_SORT_OPTIONS = [
  { value: 'numero_asc', label: 'Número: menor a mayor' },
  { value: 'numero_desc', label: 'Número: mayor a menor' },
  { value: 'edad_asc', label: 'Edad: menor a mayor' },
  { value: 'edad_desc', label: 'Edad: mayor a menor' },
  { value: 'nombre_asc', label: 'Nombre: A - Z' },
  { value: 'nombre_desc', label: 'Nombre: Z - A' },
  { value: 'escuderia_asc', label: 'Escudería: A - Z' },
  { value: 'escuderia_desc', label: 'Escudería: Z - A' }
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
  escuderias,
  localizaciones,
  hasActiveFilters,
  hasInvalidPriceRange,
  onUpdateFilters,
  onToggleCategory,
  onToggleEscuderia,
  onToggleSort,
  onResetFilters,
  id,
  mobileOpen = false,
  onClose
}) => {
  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || ''
  });

  useEffect(() => {
    setPriceInputs({
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || ''
    });
  }, [filters.minPrice, filters.maxPrice]);

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

  const handleSearch = useCallback((search) => {
    onUpdateFilters({ search });
  }, [onUpdateFilters]);

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
  const showPilotSort = filters.type === 'pilot';
  const showTeamFilters = (filters.type === 'pilot' || filters.type === 'escuderia') && escuderias.length > 0;

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
      maxPrice: TICKET_TYPES.has(nextType) ? filters.maxPrice : '',
      sorts: nextType === 'pilot' ? filters.sorts : [],
      escuderias: nextType === 'pilot' || nextType === 'escuderia' ? filters.escuderias : []
    });
  };

  const toggleLocation = (value) => {
    onUpdateFilters({ localizacion: filters.localizacion === value ? '' : value });
  };

  return (
    <aside
      id={id}
      className={`home-filters-panel home-sidebar${mobileOpen ? ' is-mobile-open' : ''}`}
      aria-label="Búsqueda y filtros del catálogo"
    >
      <div className="home-sidebar-header">
        <span className="home-sidebar-title">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>Filtros</span>
        </span>
        <div className="home-sidebar-actions">
          {hasActiveFilters ? (
            <button type="button" className="home-clear-link" onClick={onResetFilters}>
              <X size={14} aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          ) : null}
          {onClose ? (
            <button type="button" className="home-filter-close" onClick={onClose}>
              <X size={16} aria-hidden="true" />
              <span>Cerrar</span>
            </button>
          ) : null}
        </div>
      </div>

      <SearchBar value={filters.search} onSearch={handleSearch} />

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

      {showPilotSort ? (
        <div className="home-filter-group">
          <span className="home-filter-label">
            <ArrowUpDown size={15} aria-hidden="true" />
            <span>Ordenar pilotos</span>
          </span>
          <div className="home-checklist" role="group" aria-label="Criterios para ordenar pilotos">
            {PILOT_SORT_OPTIONS.map((option) => (
              <label key={option.value} className="home-checklist-option">
                <input
                  type="checkbox"
                  checked={filters.sorts.includes(option.value)}
                  onChange={() => onToggleSort(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {showTeamFilters ? (
        <div className="home-filter-group">
          <details className="home-filter-dropdown">
            <summary className="home-filter-label">
              <Flag size={15} aria-hidden="true" />
              <span>Escuderías</span>
              <span className="home-filter-count">{filters.escuderias.length || 'Todas'}</span>
            </summary>
            <div className="home-checklist home-team-checklist">
            {escuderias.map((escuderia) => {
              const value = getFilterKey(escuderia);
              return (
                <label key={escuderia._id} className="home-checklist-option">
                  <input
                    type="checkbox"
                    checked={filters.escuderias.includes(value)}
                    onChange={() => onToggleEscuderia(value)}
                  />
                  <span>{escuderia.siglas ? `${escuderia.siglas} · ` : ''}{escuderia.nombre}</span>
                </label>
              );
            })}
            </div>
          </details>
        </div>
      ) : null}

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
