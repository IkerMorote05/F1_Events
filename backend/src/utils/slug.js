const slugify = (value) =>
  typeof value === 'string'
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : '';

slugify.createUniqueSlug = async (value, findBySlug, currentId, fallback) => {
  const baseSlug = slugify(value) || fallback;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await findBySlug(slug, true);
    if (!existing || (currentId && existing._id.toString() === currentId)) {
      return slug;
    }
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

module.exports = slugify;
