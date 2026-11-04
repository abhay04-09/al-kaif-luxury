export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The web address of every piece, by its id.
 *
 * The backend keeps no slug, so an address is made from the name. Two pieces
 * given the same name made the same address, and the page then showed whichever
 * came first for both: a client opening the second saw the first one's photo
 * and price, and put the wrong piece in their bag. The first piece of a name
 * keeps the plain address, so every link already shared still opens what it
 * did; any later piece of that name carries its own id as well.
 *
 * Needs the whole catalogue, in the API's order. A list filtered by category
 * would not show a piece that something else shares its name with.
 */
export function slugsById(products: { id: string; name: string }[]): Map<string, string> {
  const taken = new Set<string>();
  const slugs = new Map<string, string>();

  for (const product of products) {
    const base = slugify(product.name) || product.id;
    if (taken.has(base)) {
      slugs.set(product.id, `${base}-${slugify(product.id)}`);
    } else {
      taken.add(base);
      slugs.set(product.id, base);
    }
  }

  return slugs;
}
