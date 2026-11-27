import React from 'react';

const getValidImages = (entity) => {
  if (!Array.isArray(entity?.images)) return [];
  return entity.images.filter((image) => {
    if (!image?.image_url) return false;
    try {
      const protocol = new URL(image.image_url).protocol;
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  });
};

export const EntityGallery = ({ entity, title = 'Galería de imágenes' }) => {
  const images = getValidImages(entity);
  if (images.length === 0) return null;

  return (
    <section className="details-gallery-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="details-gallery-grid">
        {images.map((image, index) => (
          <figure key={image._id || `${image.image_url}-${index}`} className="details-gallery-item">
            <img
              src={image.image_url}
              alt={image.alt_text || `${entity.nombre || 'Elemento'} (${index + 1})`}
              loading="lazy"
            />
            {image.alt_text ? <figcaption>{image.alt_text}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );
};
