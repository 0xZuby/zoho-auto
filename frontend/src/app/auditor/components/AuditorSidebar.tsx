'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/types';
import { useAuditorNav } from '../AuditorUserContext';
import { AlertIcon, ArrivalIcon, AuditIcon, DepartureIcon, HomeIcon, RosterIcon, SlidersIcon } from './icons';

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

const OPERATIONS_LINKS: NavLink[] = [
  { href: '/auditor/exceptions', label: 'Exception queue', Icon: AlertIcon },
  { href: '/auditor/rules', label: 'Provisioning rules', Icon: SlidersIcon },
  { href: '/auditor/audit-log', label: 'Audit log', Icon: AuditIcon },
];

const ADMIN_LINK: NavLink = { href: '/auditor/integrations/zoho', label: 'Zoho integration', Icon: SlidersIcon };

export function AuditorSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeNavHref } = useAuditorNav();

  async function handleSignOut() {
    await logout();
    router.push('/auditor');
    router.refresh();
  }

  /**
   * When viewing a request detail page (`/auditor/requests/[id]`), highlight the
   * section the employee currently belongs to (`Onboarding` while onboarding is
   * in progress, `All employees` once onboarded, or `Offboarding` for leavers).
   */
  function isActive(href: string) {
    if (pathname.startsWith('/auditor/requests') && activeNavHref) {
      return href === activeNavHref;
    }
    if (pathname === href) return true;
    return href.endsWith('/all') && pathname.startsWith('/auditor/requests');
  }

  return (
    <nav className="ops-sidebar" aria-label="Auditor portal navigation">
      <div className="ops-sidebar-brand brand-lockup">
        <span className="brand-mark" aria-hidden>
          IO
        </span>
        <span>
          <span className="brand-name">InsideOps</span>
          <span className="brand-subtitle">Zoho &amp; InsideMaps access</span>
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

        {user.role === 'ADMINISTRATOR' && <div className="ops-nav-group"><p className="ops-nav-group-label">Administration</p><div className="ops-nav-links"><Link href={ADMIN_LINK.href} className={`ops-nav-link${isActive(ADMIN_LINK.href) ? ' active' : ''}`}><span className="ops-nav-icon"><ADMIN_LINK.Icon /></span>{ADMIN_LINK.label}</Link></div></div>}

        <div className="ops-nav-group">
          <p className="ops-nav-group-label">Lifecycle runs</p>
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

        <div className="ops-nav-group">
          <p className="ops-nav-group-label">Operations &amp; evidence</p>
          <div className="ops-nav-links">
            {OPERATIONS_LINKS.map(({ href, label, Icon }) => (
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
