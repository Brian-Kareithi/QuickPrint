import type { User } from '@/types';

export function homeFor(user: Pick<User, 'role'>): string {
  switch (user.role) {
    case 'ADMIN': return '/admin';
    case 'CUSTOMER': return '/my-orders';
    case 'STAFF': return '/dashboard/queue';
    default: return '/dashboard';
  }
}
