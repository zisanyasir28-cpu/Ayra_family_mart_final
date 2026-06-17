// Nav-active matching that respects the query string.
//
// React Router's <NavLink> decides "active" from the pathname alone, so every
// link to /products?... (Offers, Best Sellers, New Arrivals, categories, …)
// lights up at once on any /products URL. These links differ only by query, so
// we match on a "view signature": the subset of query params that actually
// defines a distinct browse view. Two URLs are the same view iff their
// signatures are equal — incidental params (page, price, inStock) are ignored.

const VIEW_PARAMS = [
  'categoryId',
  'brandId',
  'collection',
  'onSale',
  'isFeatured',
  'sortBy',
  'search',
] as const;

function signature(p: URLSearchParams): string {
  return VIEW_PARAMS.filter((k) => p.get(k))
    .map((k) => `${k}=${p.get(k)}`)
    .join('&');
}

/**
 * True when `to` represents the location currently being viewed.
 * @param to       link target, e.g. "/products?onSale=true"
 * @param location current location ({ pathname, search })
 * @param end      exact pathname match only (no sub-path prefix)
 */
export function isNavActive(
  to: string,
  location: { pathname: string; search: string },
  end = false,
): boolean {
  const qIdx = to.indexOf('?');
  const path = qIdx === -1 ? to : to.slice(0, qIdx);
  const query = qIdx === -1 ? '' : to.slice(qIdx + 1);

  const samePath = location.pathname === path;
  const subPath = !end && path !== '/' && location.pathname.startsWith(path + '/');
  if (!samePath && !subPath) return false;

  return signature(new URLSearchParams(query)) === signature(new URLSearchParams(location.search));
}
