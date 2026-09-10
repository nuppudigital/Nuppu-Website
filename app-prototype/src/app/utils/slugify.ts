const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return slug || 'item';
}

export function generateUniqueId(title: string, existingIds: string[]): string {
  const base = slugify(title);
  let id = base;
  let n = 2;
  while (existingIds.includes(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}
