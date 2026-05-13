import type { UserPublic } from '@superstore/shared';
import { UserRole } from '@superstore/shared';

export const DEMO_MODE = import.meta.env['VITE_DEMO_MODE'] === 'true';

const now = new Date().toISOString();

export const DEMO_USERS: Record<string, UserPublic> = {
  'customer@demo.com': {
    id:              'demo-customer-id',
    email:           'customer@demo.com',
    name:            'Ayra Rahman',
    phone:           '01712345678',
    role:            UserRole.CUSTOMER,
    avatarUrl:       null,
    isEmailVerified: true,
    createdAt:       now,
  },
  'admin@demo.com': {
    id:              'demo-admin-id',
    email:           'admin@demo.com',
    name:            'Demo Admin',
    phone:           '01700000000',
    role:            UserRole.ADMIN,
    avatarUrl:       null,
    isEmailVerified: true,
    createdAt:       now,
  },
};

export const DEMO_PASSWORDS: Record<string, string> = {
  'customer@demo.com': 'Demo@1234',
  'admin@demo.com':    'Demo@1234',
};
