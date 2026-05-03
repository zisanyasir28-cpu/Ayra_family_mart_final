import { prisma } from '../lib/prisma';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

export async function uniqueProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(name);
  let slug = base;
  let i = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${i++}`;
  }

  return slug;
}

export async function uniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(name);
  let slug = base;
  let i = 1;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${i++}`;
  }

  return slug;
}
