const slugifySkuPart = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const generateVariantSku = (entryCategory, gradeCategory) => {
  const entryPart = slugifySkuPart(entryCategory);
  const gradePart = slugifySkuPart(gradeCategory);
  const entry = entryPart.replace(/^entrada-/, '') || entryPart;
  const grade = gradePart.replace(/^grada-/, '') || gradePart;
  return entry && grade ? `entrada-${entry}-grada-${grade}` : '';
};

export const generateTicketTypeSku = (race, circuit, duration, variantSku) => {
  const parts = [
    slugifySkuPart(race),
    slugifySkuPart(circuit),
    duration ? `${slugifySkuPart(duration)}-dias` : '',
    slugifySkuPart(variantSku)
  ];
  return parts.every(Boolean) ? parts.join('-') : '';
};
