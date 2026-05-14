import { ApiError } from './ApiError';

/**
 * Verifies a resource exists AND belongs to the given user.
 *
 *  - If resource is null/undefined → throws 404
 *  - If resource.userId !== userId → throws 403
 *
 * Use this in any controller handling user-scoped resources (orders,
 * addresses, reviews, wishlist items, etc.) to centralize ownership checks
 * and ensure consistent error codes.
 *
 * @example
 *   const order = await prisma.order.findUnique({ where: { id } });
 *   checkOwnership(order, req.user!.sub, 'Order');
 *   // After this line, `order` is narrowed to non-null
 */
export function checkOwnership<T extends { userId: string }>(
  resource: T | null | undefined,
  userId: string,
  resourceName = 'Resource',
): asserts resource is T {
  if (!resource) {
    throw ApiError.notFound(resourceName);
  }
  if (resource.userId !== userId) {
    throw ApiError.forbidden(
      `You do not have permission to access this ${resourceName.toLowerCase()}`,
    );
  }
}
