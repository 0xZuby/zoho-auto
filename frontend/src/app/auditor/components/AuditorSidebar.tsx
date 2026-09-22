'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/types';
import { ArrivalIcon, DepartureIcon, HomeIcon, RosterIcon } from './icons';

interface NavLink {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number }>;
}

const PRIMARY_LINKS: NavLink[] = [{ href: '/auditor', label: 'Home', Icon: HomeIcon }];

const EMPLOYEE_LINKS: NavLink[] = [
  { href: '/auditor/employees/onboarding', label: 'Onboarding', Icon: ArrivalIcon },
  { href: '/auditor/employees/offboarding', label: 'Offboarding', Icon: DepartureIcon },
  { href: '/auditor/employees/all', label: 'All employees', Icon: RosterIcon },
];

export function AuditorSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await logout();
    router.push('/auditor');
    router.refresh();
  }

  /** A request detail page belongs to the "All employees" section. */
  function isActive(href: string) {
    if (pathname === href) return true;
    return href.endsWith('/all') && pathname.startsWith('/auditor/requests');
  }

  return (
    <nav className="ops-sidebar" aria-label="Auditor portal navigation">
      <div className="ops-sidebar-brand brand-lockup">
        <span className="brand-mark" aria-hidden>
          AZ
        </span>
        <span>
          <span className="brand-name">Auditor portal</span>
          <span className="brand-subtitle">HR → Zoho access</span>
        </span>
      </div>

      <div className="ops-nav">
        <div className="ops-nav-group">
          <div className="ops-nav-links">
            {PRIMARY_LINKS.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={`ops-nav-link${isActive(href) ? ' active' : ''}`}>
                <span className="ops-nav-icon">
                  <Icon />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="ops-nav-group">
          <p className="ops-nav-group-label">Employees</p>
          <div className="ops-nav-links">
            {EMPLOYEE_LINKS.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={`ops-nav-link${isActive(href) ? ' active' : ''}`}>
                <span className="ops-nav-icon">
                  <Icon />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="ops-sidebar-footer">
        <div className="ops-sidebar-identity">
          <span className="ops-avatar" aria-hidden>
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{user.name}</strong>
            <span className="ops-role">{user.role === 'ADMINISTRATOR' ? 'Administrator' : 'Auditor'}</span>
          </span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
