import React, { useEffect, useState } from 'react';
import { variantSchema } from './variantSchema';
import { useCategoriasCircuitos } from '../../hooks/useCategoriasCircuitos';
import { generateVariantSku } from '../../utils/sku';

export const VariantForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [price, setPrice] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [percentage, setPercentage] = useState('');
  const [categoriaEntrada, setCategoriaEntrada] = useState('');
  const [categoriaGrada, setCategoriaGrada] = useState('');
  const [error, setError] = useState('');
  const { items: categories, loading: categoriesLoading, error: categoriesError } = useCategoriasCircuitos();

  const entryCategories = categories.filter(
    (category) => category.categoriaEntrada && !category.deletedAt
  );
  const gradeCategories = categories.filter(
    (category) => category.categoriaGrada && !category.deletedAt
  );
  const selectedEntryCategory = entryCategories.find(
    (category) => String(category._id) === String(categoriaEntrada)
  );
  const selectedGradeCategory = gradeCategories.find(
    (category) => String(category._id) === String(categoriaGrada)
  );
  const sku = generateVariantSku(
    selectedEntryCategory?.categoriaEntrada,
    selectedGradeCategory?.categoriaGrada
  );

  useEffect(() => {
    setPrice(initialData?.price === undefined ? '' : String(initialData.price));
    setDescripcion(initialData?.descripcion || '');
    setPercentage(initialData?.percentage === undefined ? '' : String(initialData.percentage));
    setCategoriaEntrada(initialData?.categoriaEntrada?._id || initialData?.categoriaEntrada || '');
    setCategoriaGrada(initialData?.categoriaGrada?._id || initialData?.categoriaGrada || '');
    setError('');
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = variantSchema.safeParse({
      sku,
      price,
      descripcion,
      percentage,
      categoriaEntrada,
      categoriaGrada
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Revisa los datos de la variante.');
      return;
    }

    setError('');
    await onSubmit(result.data);
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="variant-sku">SKU</label>
      <input
        id="variant-sku"
        name="sku"
        value={sku}
        placeholder="Se genera al seleccionar las categorías"
        readOnly
        disabled={submitting}
        aria-label="SKU generado automáticamente"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'variant-sku-error' : undefined}
      />
      {error ? <p className="piloto-field-error" id="variant-sku-error">{error}</p> : null}

      <label htmlFor="variant-description">Descripción</label>
      <textarea
        id="variant-description"
        name="descripcion"
        value={descripcion}
        onChange={(event) => {
          setDescripcion(event.target.value);
          setError('');
        }}
        rows="3"
        disabled={submitting}
      />

      <label htmlFor="variant-price">Precio</label>
      <input
        id="variant-price"
        name="price"
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(event) => {
          setPrice(event.target.value);
          setError('');
        }}
        disabled={submitting}
      />

      <label htmlFor="variant-percentage">Porcentaje de disponibilidad (%)</label>
      <input
        id="variant-percentage"
        name="percentage"
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={percentage}
        onChange={(event) => {
          setPercentage(event.target.value);
          setError('');
        }}
        disabled={submitting}
        aria-describedby="variant-percentage-help"
      />
      <p className="piloto-field-hint" id="variant-percentage-help">
        Porcentaje de la capacidad total del circuito asignado a esta variante. Las variantes del circuito deben sumar 100 %.
      </p>

      <label htmlFor="variant-entry-category">Categoría de entrada</label>
      <select
        id="variant-entry-category"
        value={categoriaEntrada}
        onChange={(event) => {
          setCategoriaEntrada(event.target.value);
          setError('');
        }}
        disabled={submitting || categoriesLoading || Boolean(categoriesError)}
      >
        <option value="">Selecciona una categoría de entrada</option>
        {entryCategories.map((category) => (
          <option key={category._id} value={category._id}>{category.categoriaEntrada}</option>
        ))}
      </select>

      <label htmlFor="variant-grade-category">Categoría de grada</label>
      <select
        id="variant-grade-category"
        value={categoriaGrada}
        onChange={(event) => {
          setCategoriaGrada(event.target.value);
          setError('');
        }}
        disabled={submitting || categoriesLoading || Boolean(categoriesError)}
      >
        <option value="">Selecciona una categoría de grada</option>
        {gradeCategories.map((category) => (
          <option key={category._id} value={category._id}>{category.categoriaGrada}</option>
        ))}
      </select>
      {categoriesError ? <p className="piloto-field-error" role="alert">{categoriesError}</p> : null}

      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
