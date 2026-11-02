import {
  LayoutDashboard, ShoppingBag, ListTodo, BarChart3, Settings, QrCode, Palette, DollarSign,
  Users, Wallet, Building2, Shield, UserCog, ScrollText, Receipt, UserCircle,
} from 'lucide-react';
import type { NavItem } from '@/components/app-shell';

const profile: NavItem = { href: '/profile', icon: UserCircle, label: 'My profile' };

/** Sidebar entries and role label for each kind of account. */
export function navFor(role: string): { nav: NavItem[]; roleLabel: string } {
  switch (role) {
    case 'ADMIN':
      return {
        roleLabel: 'Super admin',
        nav: [
          { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
          { href: '/admin/users', icon: UserCog, label: 'All users' },
          { href: '/admin/shops', icon: Building2, label: 'Shops & owners' },
          { href: '/admin/activity', icon: ScrollText, label: 'Activity log' },
          { href: '/admin/system', icon: Shield, label: 'System' },
          profile,
        ],
      };
    case 'STAFF':
      return {
        roleLabel: 'Cashier',
        nav: [
          { href: '/dashboard/queue', icon: ListTodo, label: 'Print Queue' },
          { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
          { href: '/dashboard/qrcode', icon: QrCode, label: 'QR Code' },
          profile,
        ],
      };
    case 'CUSTOMER':
      return { roleLabel: 'Customer', nav: [{ href: '/my-orders', icon: Receipt, label: 'My orders' }, profile] };
    default:
      return {
        roleLabel: 'Shop owner',
        nav: [
          { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
          { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
          { href: '/dashboard/queue', icon: ListTodo, label: 'Print Queue' },
          { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
          { href: '/dashboard/qrcode', icon: QrCode, label: 'QR Code' },
          { href: '/dashboard/team', icon: Users, label: 'Team' },
          { href: '/dashboard/payments', icon: Wallet, label: 'Payments' },
          { href: '/dashboard/branding', icon: Palette, label: 'Branding' },
          { href: '/dashboard/pricing', icon: DollarSign, label: 'Pricing' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          profile,
        ],
      };
  }
}
