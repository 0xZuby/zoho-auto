'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import './prototype.css';

const variants = [
  { key: 'A', name: 'Guided clarity' },
  { key: 'B', name: 'Operations desk' },
  { key: 'C', name: 'Focus mode' },
];

const requestRows = [
  { code: 'ONB-2026-0184', name: 'Samiul Alam', role: 'Operations Executive', status: 'Needs review', time: '18 Sep · 10:42 PM' },
  { code: 'ONB-2026-0183', name: 'John Smith', role: 'Modeler', status: 'Needs review', time: '18 Sep · 8:15 PM' },
  { code: 'ONB-2026-0182', name: 'Sarah Khan', role: 'HR Executive', status: 'Completed', time: '17 Sep · 4:08 PM' },
];

function PrototypeSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const index = Math.max(0, variants.findIndex((item) => item.key === current));
  const move = useCallback((nextIndex: number) => router.replace(`${pathname}?variant=${variants[(nextIndex + variants.length) % variants.length].key}`), [pathname, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (event.key === 'ArrowLeft') move(index - 1);
      if (event.key === 'ArrowRight') move(index + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, move]);

  if (process.env.NODE_ENV === 'production') return null;
  return <nav className="prototype-switcher" aria-label="Prototype variant switcher">
    <button onClick={() => move(index - 1)} aria-label="Previous variant">←</button>
    <span><small>PROTOTYPE</small><b>{variants[index].key} · {variants[index].name}</b></span>
    <button onClick={() => move(index + 1)} aria-label="Next variant">→</button>
  </nav>;
}

function Brand() { return <div className="prototype-brand"><span>o</span><b>onboardly</b></div>; }

function Status({ children, tone = 'warning' }: { children: React.ReactNode; tone?: 'warning' | 'success' }) { return <span className={`prototype-status ${tone}`}>{children}</span>; }

function VariantA() {
  return <main className="prototype prototype-a">
    <header className="proto-top"><Brand /><span className="proto-context">Employee onboarding · design exploration</span><span className="proto-avatar">AD</span></header>
    <section className="a-layout">
      <aside className="a-rail"><span className="proto-kicker">AUDITOR WORKSPACE</span><h1>Make every start feel simple.</h1><p>A guided workspace for moving a request from submitted to ready.</p><ol><li className="done"><b>1</b><span>Request received<small>Information collected</small></span></li><li className="active"><b>2</b><span>Review details<small>Confirm the account setup</small></span></li><li><b>3</b><span>Create account<small>Provision after approval</small></span></li></ol><div className="a-footnote"><strong>12 requests</strong><span>2 need your attention today</span></div></aside>
      <section className="a-workspace"><div className="a-heading"><div><span className="proto-kicker">REQUEST REVIEW</span><h2>Samiul Alam</h2><p>ONB-2026-0184 · submitted 18 Sep 2026, 10:42 PM</p></div><Status>Needs review</Status></div><div className="a-columns"><article className="proto-card"><div className="card-heading"><div><span className="proto-kicker">EMPLOYEE RESPONSE</span><h3>About the employee</h3></div><button className="proto-quiet">Edit</button></div><dl className="proto-details"><div><dt>Personal email</dt><dd>samiul@gmail.com</dd></div><div><dt>Country</dt><dd>Bangladesh</dd></div><div><dt>Department</dt><dd>Service Delivery</dd></div><div><dt>Job position</dt><dd>Operations Executive</dd></div></dl></article><article className="proto-card proto-card-accent"><div className="card-heading"><div><span className="proto-kicker">AUDITOR DECISION</span><h3>Account setup</h3></div><span className="proto-lock">Controlled</span></div><label>Work email<input value="samiul.alam@company.com" readOnly /></label><label>Team<input value="Operations" readOnly /></label><label>Role<select defaultValue="Standard User"><option>Standard User</option></select></label><button className="proto-primary">Save configuration</button></article></div><div className="a-action"><div><strong>Ready to provision?</strong><span>Review the final setup before creating a Zoho user.</span></div><button className="proto-primary">Create Zoho user →</button></div></section>
    </section>
  </main>;
}

function VariantB() {
  return <main className="prototype prototype-b"><aside className="b-sidebar"><Brand /><nav><a className="selected">Overview <b>12</b></a><a>Requests</a><a>Employees</a><a>Audit history</a></nav><div className="b-user"><span className="proto-avatar">AD</span><span><b>Auditor demo</b><small>Testing environment</small></span></div></aside><section className="b-main"><header className="b-header"><div><span className="proto-kicker">MONDAY · 18 SEPTEMBER 2026</span><h1>Good evening, Auditor.</h1><p>Here’s the work that needs your attention.</p></div><button className="proto-outline">Refresh queue ↻</button></header><div className="b-metrics"><div><span>Needs review</span><strong>12</strong><small>+3 since yesterday</small></div><div><span>In provisioning</span><strong>3</strong><small>All progressing normally</small></div><div><span>Completed</span><strong>148</strong><small>Across this workspace</small></div></div><section className="b-queue"><div className="b-queue-head"><div><span className="proto-kicker">PRIVACY-SAFE QUEUE</span><h2>Requests needing attention</h2></div><div className="b-tools"><input placeholder="Search request code" /><select defaultValue="all"><option value="all">All statuses</option></select></div></div><div className="b-table"><div className="b-row b-table-head"><span>Request</span><span>Status</span><span>Submitted</span><span /></div>{requestRows.map((row) => <div className="b-row" key={row.code}><span><b>{row.code}</b><small>{row.name} · {row.role}</small></span><Status tone={row.status === 'Completed' ? 'success' : 'warning'}>{row.status}</Status><time>{row.time}</time><span className="b-arrow">→</span></div>)}</div></section><aside className="b-preview"><div><span className="proto-kicker">SELECTED REQUEST</span><h3>Samiul Alam</h3><p>Operations Executive · Service Delivery</p></div><Status>Needs review</Status><button className="proto-primary">Open review →</button></aside></section></main>;
}

function VariantC() {
  return <main className="prototype prototype-c"><header className="c-header"><Brand /><nav><a className="active">Requests</a><a>Employees</a><a>Activity</a></nav><span className="proto-avatar">AD</span></header><section className="c-intro"><span className="proto-kicker">YOUR NEXT DECISION</span><h1>Review one request at a time.</h1><p>The important information stays together, so approvals feel considered instead of rushed.</p></section><section className="c-grid"><article className="c-request"><div className="c-request-head"><div><span className="proto-kicker">ONB-2026-0184</span><h2>Samiul Alam</h2><p>Submitted 18 Sep 2026 · Personal email verified</p></div><Status>Needs review</Status></div><div className="c-section"><span className="proto-kicker">THE RESPONSE</span><dl className="proto-details"><div><dt>Department</dt><dd>Service Delivery</dd></div><div><dt>Team</dt><dd>Operations</dd></div><div><dt>Position</dt><dd>Operations Executive</dd></div><div><dt>Joining date</dt><dd>25 September 2026</dd></div></dl></div><div className="c-section c-decision"><span className="proto-kicker">THE DECISION</span><div className="c-account"><div><small>Corporate email</small><strong>samiul.alam@company.com</strong></div><div><small>Role</small><strong>Standard User</strong></div><div><small>Groups</small><strong>Operations · All Employees</strong></div></div></div><div className="c-actions"><button className="proto-quiet">Return for changes</button><button className="proto-primary">Create Zoho user →</button></div></article><aside className="c-activity"><span className="proto-kicker">RECENT ACTIVITY</span><h3>Audit trail</h3><ol><li><b>Form submitted</b><small>18 Sep · 8:12 PM</small></li><li><b>Request routed to you</b><small>18 Sep · 8:12 PM</small></li><li className="current"><b>Waiting for review</b><small>Now</small></li></ol><div className="c-next"><strong>What happens next?</strong><p>Creating the user will apply this approved setup and record each provisioning step.</p></div></aside></section></main>;
}

function PrototypePage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('variant')?.toUpperCase() || 'A';
  const current = variants.some((item) => item.key === raw) ? raw : 'A';
  return <><div className="prototype-disclaimer">THROWAWAY UI PROTOTYPE · PRD-ALIGNED WORKSPACE EXPLORATION</div>{current === 'A' && <VariantA />}{current === 'B' && <VariantB />}{current === 'C' && <VariantC />}<PrototypeSwitcher current={current} /></>;
}

export default function PrototypeRoute() { return <Suspense fallback={null}><PrototypePage /></Suspense>; }
