
/* Kara Admin Dashboard — self-contained, scoped under [data-admin] */
/* Only exposes window.PageAdmin */

(function () {
  const { useState, useEffect, useMemo, useRef } = React;

  // ── CSS Injection ───────────────────────────────────────────────────────────
  const ADMIN_CSS = `
    [data-admin] {
      --surface: #f8f9fd; --surface-dim: #d9dade; --surface-bright: #f8f9fd;
      --surface-container-lowest: #ffffff; --surface-container-low: #f2f3f7;
      --surface-container: #edeef2; --surface-container-high: #e7e8ec;
      --surface-container-highest: #e1e2e6;
      --on-surface: #191c1f; --on-surface-variant: #424654;
      --inverse-surface: #2e3134; --inverse-on-surface: #eff1f5;
      --outline: #737686; --outline-variant: #c3c6d7; --hairline: #e5e7eb;
      --primary: #0053ce; --primary-hover: #00489e;
      --primary-soft: #dae2ff; --primary-soft-2: #eef2ff; --on-primary: #ffffff;
      --success: #0f7a4a; --success-soft: #d6f1e2;
      --warning: #b45d15; --warning-soft: #ffe6cf;
      --error: #ba1a1a; --error-soft: #ffdad6;
      --info: #0053ce; --info-soft: #dae2ff;
      --swatch-1:#2d3142; --swatch-2:#c9a27e; --swatch-3:#e8c8b8;
      --swatch-4:#4a5d4a; --swatch-5:#8b1e3f; --swatch-6:#d4d2cc;
      --swatch-7:#1a3a52; --swatch-8:#b8956a;
      --shadow-lift: 0 4px 20px rgba(0,0,0,0.05);
      --shadow-overlay: 0 12px 32px rgba(16,24,40,0.12), 0 4px 12px rgba(16,24,40,0.06);
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px; line-height: 20px; color: var(--on-surface);
      -webkit-font-smoothing: antialiased;
    }
    [data-admin][data-theme="dark"] {
      --surface:#0e1014; --surface-dim:#0a0c10; --surface-bright:#1a1d23;
      --surface-container-lowest:#14171c; --surface-container-low:#181b21;
      --surface-container:#1d2027; --surface-container-high:#22262e;
      --surface-container-highest:#292d36;
      --on-surface:#e8eaef; --on-surface-variant:#9ca3b1;
      --inverse-surface:#e8eaef; --inverse-on-surface:#14171c;
      --outline:#6b7180; --outline-variant:#2e3340; --hairline:#23262e;
      --primary:#5b8def; --primary-hover:#7ba3f5;
      --primary-soft:#1d2a44; --primary-soft-2:#18223a;
      --success:#4ade80; --success-soft:#143020;
      --warning:#f59e0b; --warning-soft:#3a2810;
      --error:#f87171; --error-soft:#3a1818;
      --info:#5b8def; --info-soft:#1d2a44;
      --shadow-lift: 0 4px 20px rgba(0,0,0,0.35);
      --shadow-overlay: 0 12px 32px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
    }
    [data-admin] * { box-sizing: border-box; }
    [data-admin] button { font-family: inherit; cursor: pointer; }
    [data-admin] input { font-family: inherit; }
    [data-admin] .card {
      background: var(--surface-container-lowest); border-radius: 8px;
      box-shadow: var(--shadow-lift); border: 1px solid rgba(16,24,40,0.04);
    }
    [data-admin][data-theme="dark"] .card { border-color: rgba(255,255,255,0.04); }
    [data-admin] .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px; height: 36px; padding: 0 14px; border-radius: 8px;
      font-size: 14px; font-weight: 500; border: 1px solid transparent;
      transition: background 120ms, border-color 120ms, color 120ms;
      white-space: nowrap; cursor: pointer;
    }
    [data-admin] .btn-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
    [data-admin] .btn-primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
    [data-admin] .btn-secondary {
      background: var(--surface-container-lowest); color: var(--on-surface);
      border-color: var(--outline-variant);
    }
    [data-admin] .btn-secondary:hover { background: var(--surface-container-low); }
    [data-admin] .btn-ghost { background: transparent; color: var(--on-surface-variant); border-color: transparent; }
    [data-admin] .btn-ghost:hover { background: var(--surface-container); color: var(--on-surface); }
    [data-admin] .btn-sm { height: 30px; padding: 0 10px; font-size: 13px; }
    [data-admin] .btn-icon { width: 36px; padding: 0; }
    [data-admin] .field {
      display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px;
      background: var(--surface-container-lowest); border: 1px solid var(--outline-variant);
      border-radius: 8px; color: var(--on-surface);
    }
    [data-admin] .field input {
      border: 0; outline: 0; background: transparent; width: 100%;
      font-size: 14px; color: inherit; font-family: inherit;
    }
    [data-admin] .field input::placeholder { color: var(--outline); }
    [data-admin] .chip {
      display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 8px;
      border-radius: 9999px; font-size: 12px; font-weight: 600; white-space: nowrap;
    }
    [data-admin] .chip .dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }
    [data-admin] .chip-success { background: var(--success-soft); color: var(--success); }
    [data-admin] .chip-warning { background: var(--warning-soft); color: var(--warning); }
    [data-admin] .chip-error { background: var(--error-soft); color: var(--error); }
    [data-admin] .chip-info { background: var(--info-soft); color: var(--info); }
    [data-admin] .chip-neutral { background: var(--surface-container-high); color: var(--on-surface-variant); }
    [data-admin] .hr { height: 1px; background: var(--hairline); border: 0; margin: 0; }
    [data-admin] .h1 { font-size: 32px; line-height: 40px; font-weight: 700; letter-spacing: -0.02em; }
    [data-admin] .h2 { font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -0.01em; }
    [data-admin] .h3 { font-size: 18px; line-height: 26px; font-weight: 600; }
    [data-admin] .overline {
      font-size: 11px; line-height: 16px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--on-surface-variant);
    }
    [data-admin] .muted { color: var(--on-surface-variant); }
    [data-admin] .tabular { font-variant-numeric: tabular-nums; }
    [data-admin] ::-webkit-scrollbar { width: 8px; height: 8px; }
    [data-admin] ::-webkit-scrollbar-track { background: transparent; }
    [data-admin] ::-webkit-scrollbar-thumb {
      background: var(--surface-container-high); border-radius: 8px;
      border: 2px solid var(--surface);
    }
    @keyframes adm-fade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    @keyframes adm-slide { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes adm-overlay { from { opacity:0; } to { opacity:1; } }
    [data-admin] .animate-fade { animation: adm-fade 220ms ease both; }
    [data-admin] .animate-slide-right { animation: adm-slide 280ms cubic-bezier(.2,.8,.2,1) both; }
    [data-admin] .animate-overlay { animation: adm-overlay 200ms ease both; }
  `;

  const injectStyles = () => {
    if (document.getElementById('kara-admin-css')) return;
    const el = document.createElement('style');
    el.id = 'kara-admin-css';
    el.textContent = ADMIN_CSS;
    document.head.appendChild(el);
  };

  // ── Utilities ───────────────────────────────────────────────────────────────
  const fmtBRL = (n) => 'R$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtNum = (n) => n.toLocaleString('en-US');

  const statusToChip = (s) => {
    const map = {
      Paid: 'chip-success', Pending: 'chip-warning', Refunded: 'chip-neutral',
      Fulfilled: 'chip-success', Unfulfilled: 'chip-warning',
      Returned: 'chip-neutral', 'On hold': 'chip-error',
      VIP: 'chip-info', New: 'chip-success', Returning: 'chip-neutral',
    };
    return <span className={`chip ${map[s] || 'chip-neutral'}`}><span className="dot"/>{s}</span>;
  };

  // ── Icons ────────────────────────────────────────────────────────────────────
  const Ic = ({ size = 20, stroke = 'currentColor', sw = 1.75, children, ...r }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...r}>
      {children}
    </svg>
  );
  const IcHome = (p) => <Ic {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></Ic>;
  const IcBag = (p) => <Ic {...p}><path d="M6 7h12l-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></Ic>;
  const IcBox = (p) => <Ic {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></Ic>;
  const IcHanger = (p) => <Ic {...p}><path d="M12 8a2 2 0 1 1 2-2"/><path d="m12 8 9 6.5a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L12 8Z"/></Ic>;
  const IcUsers = (p) => <Ic {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 20a6.5 6.5 0 0 0-4-6"/></Ic>;
  const IcChart = (p) => <Ic {...p}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></Ic>;
  const IcMega = (p) => <Ic {...p}><path d="M3 10v4a1 1 0 0 0 1 1h2l8 4V5l-8 4H4a1 1 0 0 0-1 1Z"/><path d="M18 8a4 4 0 0 1 0 8"/></Ic>;
  const IcSettings = (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Ic>;
  const IcSearch = (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>;
  const IcBell = (p) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></Ic>;
  const IcPlus = (p) => <Ic {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Ic>;
  const IcChevDown = (p) => <Ic {...p}><path d="m6 9 6 6 6-6"/></Ic>;
  const IcChevRight = (p) => <Ic {...p}><path d="m9 6 6 6-6 6"/></Ic>;
  const IcChevLeft = (p) => <Ic {...p}><path d="m15 6-6 6 6 6"/></Ic>;
  const IcArrowUp = (p) => <Ic {...p}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></Ic>;
  const IcArrowDown = (p) => <Ic {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></Ic>;
  const IcClose = (p) => <Ic {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Ic>;
  const IcFilter = (p) => <Ic {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></Ic>;
  const IcExport = (p) => <Ic {...p}><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></Ic>;
  const IcMore = (p) => <Ic {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Ic>;
  const IcEdit = (p) => <Ic {...p}><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m13 7 4 4"/></Ic>;
  const IcStar = (p) => <Ic {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6L12 17l-5.4 2.8 1-6L3.2 9.5l6.1-.9L12 3Z"/></Ic>;
  const IcRefresh = (p) => <Ic {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></Ic>;
  const IcCheck = (p) => <Ic {...p}><path d="m5 12 5 5L20 7"/></Ic>;
  const IcTruck = (p) => <Ic {...p}><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Ic>;
  const IcReturn = (p) => <Ic {...p}><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></Ic>;
  const IcUser = (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
  const IcMoon = (p) => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></Ic>;
  const IcSun = (p) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></Ic>;
  const IcArrowLeft = (p) => <Ic {...p}><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></Ic>;

  // ── Mock Data ────────────────────────────────────────────────────────────────
  const D = {
    products: [
      { id: 'KR-001', name: 'Linen Wrap Blazer', collection: 'Resort 26', price: 289, stock: 42, sold: 312, color: 'var(--swatch-2)', accent: 'var(--swatch-6)', sizes: ['XS','S','M','L'] },
      { id: 'KR-002', name: 'Pleated Midi Skirt', collection: 'Resort 26', price: 168, stock: 78, sold: 287, color: 'var(--swatch-3)', accent: 'var(--swatch-6)', sizes: ['S','M','L'] },
      { id: 'KR-003', name: 'Cotton Poplin Shirt', collection: 'Core', price: 124, stock: 156, sold: 244, color: 'var(--swatch-6)', accent: 'var(--swatch-1)', sizes: ['XS','S','M','L','XL'] },
      { id: 'KR-004', name: 'Tailored Wide Trouser', collection: 'Core', price: 198, stock: 8, sold: 198, color: 'var(--swatch-1)', accent: 'var(--swatch-2)', sizes: ['S','M','L'] },
      { id: 'KR-005', name: 'Silk Slip Dress', collection: 'Evening', price: 348, stock: 24, sold: 176, color: 'var(--swatch-5)', accent: 'var(--swatch-3)', sizes: ['XS','S','M'] },
      { id: 'KR-006', name: 'Merino Crew Knit', collection: 'Core', price: 156, stock: 0, sold: 164, color: 'var(--swatch-4)', accent: 'var(--swatch-6)', sizes: ['S','M','L','XL'] },
      { id: 'KR-007', name: 'Wool Crombie Coat', collection: 'Pre-Fall', price: 498, stock: 31, sold: 142, color: 'var(--swatch-7)', accent: 'var(--swatch-2)', sizes: ['S','M','L'] },
      { id: 'KR-008', name: 'Leather Belt', collection: 'Accessories', price: 78, stock: 92, sold: 138, color: 'var(--swatch-8)', accent: 'var(--swatch-1)', sizes: ['S','M','L'] },
    ],
    customers: [
      { id: 'C-2401', name: 'Helena Marçal', email: 'helena.marcal@email.com', city: 'São Paulo, BR', orders: 14, ltv: 4218, status: 'VIP', joined: 'Mar 2024' },
      { id: 'C-2402', name: 'Júlia Andrade', email: 'julia.a@email.com', city: 'Lisboa, PT', orders: 9, ltv: 2987, status: 'Returning', joined: 'Jul 2024' },
      { id: 'C-2403', name: 'Maya Okafor', email: 'maya.o@email.com', city: 'London, UK', orders: 7, ltv: 2412, status: 'Returning', joined: 'Sep 2024' },
      { id: 'C-2404', name: 'Beatriz Fontes', email: 'b.fontes@email.com', city: 'Rio de Janeiro, BR', orders: 6, ltv: 1876, status: 'Returning', joined: 'Nov 2024' },
      { id: 'C-2405', name: 'Sofia Bertelli', email: 'sofia.b@email.com', city: 'Milano, IT', orders: 4, ltv: 1521, status: 'New', joined: 'Feb 2026' },
      { id: 'C-2406', name: 'Camila Reis', email: 'camila.r@email.com', city: 'Porto, PT', orders: 3, ltv: 1124, status: 'New', joined: 'Mar 2026' },
      { id: 'C-2407', name: 'Anna Lindqvist', email: 'a.lindqvist@email.com', city: 'Stockholm, SE', orders: 8, ltv: 2640, status: 'Returning', joined: 'Aug 2024' },
      { id: 'C-2408', name: 'Renata Vieira', email: 'r.vieira@email.com', city: 'Salvador, BR', orders: 2, ltv: 462, status: 'New', joined: 'Apr 2026' },
    ],
    orders: [
      { id: '#KR-10482', customer: 'Helena Marçal', date: 'Apr 27, 10:42', items: 3, total: 612, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Web' },
      { id: '#KR-10481', customer: 'Júlia Andrade', date: 'Apr 27, 09:18', items: 1, total: 348, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
      { id: '#KR-10480', customer: 'Maya Okafor', date: 'Apr 27, 08:55', items: 2, total: 322, status: 'Refunded', fulfillment: 'Returned', channel: 'Web' },
      { id: '#KR-10479', customer: 'Beatriz Fontes', date: 'Apr 26, 22:31', items: 4, total: 754, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Mobile' },
      { id: '#KR-10478', customer: 'Sofia Bertelli', date: 'Apr 26, 19:04', items: 2, total: 432, status: 'Pending', fulfillment: 'On hold', channel: 'Web' },
      { id: '#KR-10477', customer: 'Camila Reis', date: 'Apr 26, 17:12', items: 1, total: 156, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Mobile' },
      { id: '#KR-10476', customer: 'Anna Lindqvist', date: 'Apr 26, 14:48', items: 5, total: 982, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
      { id: '#KR-10475', customer: 'Renata Vieira', date: 'Apr 26, 12:03', items: 1, total: 124, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
      { id: '#KR-10474', customer: 'Helena Marçal', date: 'Apr 26, 10:21', items: 2, total: 304, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
      { id: '#KR-10473', customer: 'Júlia Andrade', date: 'Apr 25, 21:47', items: 3, total: 487, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Mobile' },
      { id: '#KR-10472', customer: 'Maya Okafor', date: 'Apr 25, 16:32', items: 1, total: 198, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
      { id: '#KR-10471', customer: 'Beatriz Fontes', date: 'Apr 25, 14:15', items: 2, total: 386, status: 'Pending', fulfillment: 'On hold', channel: 'Web' },
    ],
    salesSeries: [
      { d: 'Apr 14', v: 8420 }, { d: 'Apr 15', v: 9120 }, { d: 'Apr 16', v: 7840 },
      { d: 'Apr 17', v: 10240 }, { d: 'Apr 18', v: 11580 }, { d: 'Apr 19', v: 9670 },
      { d: 'Apr 20', v: 8950 }, { d: 'Apr 21', v: 12410 }, { d: 'Apr 22', v: 13720 },
      { d: 'Apr 23', v: 11890 }, { d: 'Apr 24', v: 14260 }, { d: 'Apr 25', v: 15820 },
      { d: 'Apr 26', v: 13980 }, { d: 'Apr 27', v: 9540 },
    ],
    channels: [
      { name: 'Web (direct)', value: 48, color: 'var(--primary)' },
      { name: 'Instagram', value: 22, color: 'var(--swatch-5)' },
      { name: 'Email', value: 14, color: 'var(--swatch-2)' },
      { name: 'Search', value: 11, color: 'var(--swatch-4)' },
      { name: 'Other', value: 5, color: 'var(--outline-variant)' },
    ],
    regions: [
      { name: 'Brazil', value: 42, orders: 184 },
      { name: 'Portugal', value: 21, orders: 92 },
      { name: 'United Kingdom', value: 14, orders: 61 },
      { name: 'Italy', value: 9, orders: 39 },
      { name: 'Sweden', value: 7, orders: 31 },
      { name: 'Other', value: 7, orders: 30 },
    ],
    activity: [
      { kind: 'order', text: 'New order #KR-10482 — Helena Marçal', meta: 'R$ 612.00', time: '2m ago' },
      { kind: 'stock', text: 'Tailored Wide Trouser running low (8 units)', meta: 'KR-004', time: '14m ago' },
      { kind: 'review', text: 'New 5-star review on Silk Slip Dress', meta: '★ 5.0', time: '38m ago' },
      { kind: 'order', text: 'New order #KR-10481 — Júlia Andrade', meta: 'R$ 348.00', time: '1h ago' },
      { kind: 'refund', text: 'Refund processed for #KR-10480', meta: '−R$ 322.00', time: '1h ago' },
      { kind: 'customer', text: 'Sofia Bertelli became a returning customer', meta: 'Milano, IT', time: '2h ago' },
    ],
  };

  // ── Base UI ──────────────────────────────────────────────────────────────────
  const Sparkline = ({ data, color = 'var(--primary)', width = 88, height = 32 }) => {
    const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * width,
      height - ((v - min) / r) * (height - 4) - 2,
    ]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = path + ` L ${width} ${height} L 0 ${height} Z`;
    const id = 'asp-' + Math.random().toString(36).slice(2, 7);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const ProductThumb = ({ product, size = 40 }) => (
    <div style={{
      width: size, height: size, borderRadius: 8, background: product.color,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    }}>
      <div style={{ position: 'absolute', inset: '40% 0 0 60%', background: product.accent, borderTopLeftRadius: 999 }}/>
    </div>
  );

  const Card = ({ title, action, children, padded = true, style }) => (
    <section className="card" style={style}>
      {title && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--hairline)' }}>
          <span className="h3">{title}</span>
          {action}
        </header>
      )}
      <div style={{ padding: padded ? 20 : 0 }}>{children}</div>
    </section>
  );

  const KPICard = ({ label, value, delta, deltaLabel, sparkline, accent }) => {
    const pos = delta >= 0;
    return (
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="overline" style={{ fontSize: 11 }}>{label}</span>
          <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }}><IcMore size={14}/></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <span className="tabular" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}>{value}</span>
          {sparkline && <Sparkline data={sparkline} color={accent || 'var(--primary)'}/>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600, color: pos ? 'var(--success)' : 'var(--error)' }}>
            {pos ? <IcArrowUp size={12} sw={2.4}/> : <IcArrowDown size={12} sw={2.4}/>}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{deltaLabel || 'vs. previous 14d'}</span>
        </div>
      </div>
    );
  };

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const Sidebar = ({ active, onNavigate, onExit }) => {
    const nav = [
      { id: 'overview', label: 'Overview', Icon: IcHome },
      { id: 'orders', label: 'Orders', Icon: IcBag, badge: 12 },
      { id: 'products', label: 'Products', Icon: IcHanger },
      { id: 'inventory', label: 'Inventory', Icon: IcBox, badge: 3, badgeKind: 'warning' },
      { id: 'customers', label: 'Customers', Icon: IcUsers },
      { id: 'analytics', label: 'Analytics', Icon: IcChart },
      { id: 'marketing', label: 'Marketing', Icon: IcMega },
    ];
    return (
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--surface-container-lowest)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflowY: 'auto',
      }}>
        <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em' }}>Kara</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Admin</span>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8, border: '1px solid var(--hairline)',
            background: 'var(--surface-container-low)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--swatch-1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>K</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>kara.com</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Brazil · 4 channels</div>
            </div>
            <IcChevDown size={16} stroke="var(--on-surface-variant)"/>
          </div>
        </div>

        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(n => {
            const on = active === n.id;
            return (
              <button key={n.id} onClick={() => onNavigate(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 8, border: 0,
                background: on ? 'var(--primary-soft-2)' : 'transparent',
                color: on ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontSize: 14, fontWeight: on ? 600 : 500, cursor: 'pointer',
                textAlign: 'left', position: 'relative', transition: 'background 100ms',
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                {on && <span style={{ position: 'absolute', left: -12, top: 6, bottom: 6, width: 3, background: 'var(--primary)', borderRadius: '0 4px 4px 0' }}/>}
                <n.Icon size={18}/>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && (
                  <span className={`chip ${n.badgeKind === 'warning' ? 'chip-warning' : 'chip-info'}`} style={{ height: 20, padding: '0 7px', fontSize: 11 }}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }}/>

        <div style={{ padding: 12, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => onNavigate('settings')} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '8px 12px', borderRadius: 8, border: 0,
            background: active === 'settings' ? 'var(--primary-soft-2)' : 'transparent',
            color: active === 'settings' ? 'var(--primary)' : 'var(--on-surface-variant)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
          }}>
            <IcSettings size={18}/> Settings
          </button>
          <button onClick={onExit} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '8px 12px', borderRadius: 8, border: 0, background: 'transparent',
            color: 'var(--on-surface-variant)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
          }}>
            <IcArrowLeft size={18}/> Voltar à loja
          </button>
        </div>
      </aside>
    );
  };

  // ── Topbar ───────────────────────────────────────────────────────────────────
  const Topbar = ({ dark, setDark }) => (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 32px',
      borderBottom: '1px solid var(--hairline)', background: 'var(--surface)',
      position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
    }}>
      <div className="field" style={{ width: 300, height: 36, flex: '0 0 auto' }}>
        <IcSearch size={15} stroke="var(--on-surface-variant)"/>
        <input placeholder="Pesquisar pedidos, produtos, clientes…"/>
        <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
      </div>
      <div style={{ flex: 1 }}/>
      <button
        className="btn btn-secondary btn-icon"
        onClick={() => setDark(d => !d)}
        title={dark ? 'Modo claro' : 'Modo escuro'}>
        {dark ? <IcSun size={18}/> : <IcMoon size={18}/>}
      </button>
      <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }} aria-label="Notificações">
        <IcBell size={18}/>
        <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 999, background: 'var(--error)', border: '2px solid var(--surface-container-lowest)' }}/>
      </button>
      <button className="btn btn-primary"><IcPlus size={16}/> Novo produto</button>
    </header>
  );

  // ── Charts ───────────────────────────────────────────────────────────────────
  const AreaChart = ({ data, height = 260, color = 'var(--primary)' }) => {
    const pad = { top: 16, right: 12, bottom: 28, left: 48 };
    const w = 720, h = height;
    const iw = w - pad.left - pad.right, ih = h - pad.top - pad.bottom;
    const vals = data.map(d => d.v);
    const max = Math.ceil(Math.max(...vals) / 2000) * 2000;
    const xs = (i) => pad.left + (i / (data.length - 1)) * iw;
    const ys = (v) => pad.top + ih - (v / max) * ih;
    const line = data.map((d, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(d.v).toFixed(1)).join(' ');
    const area = line + ` L ${xs(data.length - 1)} ${pad.top + ih} L ${xs(0)} ${pad.top + ih} Z`;
    const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];
    const [hover, setHover] = useState(null);
    const onMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * w;
      const i = Math.round(((x - pad.left) / iw) * (data.length - 1));
      if (i >= 0 && i < data.length) setHover(i);
    };
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {ticks.map((v, i) => (
            <g key={i}>
              <line x1={pad.left} x2={w - pad.right} y1={ys(v)} y2={ys(v)}
                    stroke="var(--hairline)" strokeDasharray={i === 0 ? '0' : '3 4'}/>
              <text x={pad.left - 8} y={ys(v) + 4} textAnchor="end" fontSize="11" fill="var(--on-surface-variant)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
              </text>
            </g>
          ))}
          <path d={area} fill="url(#ag1)"/>
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {data.map((d, i) => i % 2 === 0 ? (
            <text key={i} x={xs(i)} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--on-surface-variant)">{d.d.replace('Apr ', '')}</text>
          ) : null)}
          {hover !== null && (
            <g>
              <line x1={xs(hover)} x2={xs(hover)} y1={pad.top} y2={pad.top + ih} stroke="var(--outline-variant)" strokeDasharray="3 3"/>
              <circle cx={xs(hover)} cy={ys(data[hover].v)} r="5" fill={color} stroke="var(--surface-container-lowest)" strokeWidth="2"/>
            </g>
          )}
        </svg>
        {hover !== null && (
          <div style={{
            position: 'absolute', left: `${(xs(hover) / w) * 100}%`, top: 8,
            transform: 'translateX(-50%)',
            background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
            padding: '6px 10px', borderRadius: 6, fontSize: 12,
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: 'var(--shadow-overlay)',
          }}>
            <div style={{ fontWeight: 600 }}>{data[hover].d}</div>
            <div style={{ opacity: 0.85 }}>{fmtBRL(data[hover].v)}</div>
          </div>
        )}
      </div>
    );
  };

  const Donut = ({ items, size = 160, thickness = 18 }) => {
    const total = items.reduce((s, it) => s + it.value, 0);
    const radius = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2, c = 2 * Math.PI * radius;
    let offset = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--surface-container)" strokeWidth={thickness}/>
        {items.map((it, i) => {
          const len = c * (it.value / total);
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
              stroke={it.color} strokeWidth={thickness}
              strokeDasharray={`${len - 2} ${c - len + 2}`}
              strokeDashoffset={-offset} strokeLinecap="butt"/>
          );
          offset += len;
          return seg;
        })}
      </svg>
    );
  };

  const BarRow = ({ label, value, max, count, accent = 'var(--primary)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 110, fontSize: 13, color: 'var(--on-surface)' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: accent, borderRadius: 999, transition: 'width 320ms ease' }}/>
      </div>
      <span className="tabular" style={{ width: 48, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{value}%</span>
      {count !== undefined && (
        <span className="tabular" style={{ width: 60, textAlign: 'right', fontSize: 12, color: 'var(--on-surface-variant)' }}>{count} ord.</span>
      )}
    </div>
  );

  // ── Table shared styles ───────────────────────────────────────────────────────
  const th = { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--hairline)', color: 'var(--on-surface-variant)' };
  const td = { padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--hairline)' };

  // ── Overview ─────────────────────────────────────────────────────────────────
  const Overview = ({ onNavigate, onOpenOrder, onOpenProduct }) => {
    const accents = ['var(--primary)', 'var(--swatch-7)', 'var(--swatch-2)', 'var(--swatch-4)', 'var(--swatch-5)', 'var(--outline-variant)'];
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Segunda-feira, 27 de Abril · Bom dia</div>
            <h1 className="h1" style={{ margin: 0 }}>Kara hoje</h1>
          </div>
          <button className="btn btn-secondary"><IcExport size={16}/> Exportar</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <KPICard label="Receita" value={fmtBRL(157520)} delta={12.4} sparkline={D.salesSeries.map(d => d.v)} accent="var(--primary)"/>
          <KPICard label="Pedidos" value="437" delta={8.2} sparkline={[28,31,29,34,38,36,33,40,44,41,46,49,47,33]} accent="var(--swatch-4)"/>
          <KPICard label="Ticket médio" value={fmtBRL(360.46)} delta={3.8} sparkline={[320,312,328,341,355,338,344,358,365,360,372,366,361,360]} accent="var(--swatch-2)"/>
          <KPICard label="Conversão" value="3.42%" delta={-0.6} sparkline={[3.6,3.5,3.4,3.7,3.8,3.5,3.4,3.6,3.5,3.4,3.5,3.4,3.4,3.42]} accent="var(--swatch-5)"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <Card title="Receita" action={
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-container-low)', borderRadius: 8, border: '1px solid var(--hairline)' }}>
              {['Receita', 'Pedidos', 'Sessões'].map((o, i) => (
                <button key={o} style={{
                  height: 26, padding: '0 12px', borderRadius: 6, border: 0, cursor: 'pointer',
                  background: i === 0 ? 'var(--surface-container-lowest)' : 'transparent',
                  color: i === 0 ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                  fontSize: 12, fontWeight: i === 0 ? 600 : 500,
                  boxShadow: i === 0 ? '0 1px 2px rgba(16,24,40,0.05)' : 'none',
                }}>{o}</button>
              ))}
            </div>
          }>
            <AreaChart data={D.salesSeries}/>
          </Card>

          <Card title="Atividade ao vivo" action={<button className="btn btn-ghost btn-sm"><IcRefresh size={14}/></button>} padded={false}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {D.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: i < D.activity.length - 1 ? '1px solid var(--hairline)' : 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: a.kind === 'order' ? 'var(--info-soft)' : a.kind === 'stock' ? 'var(--warning-soft)' : a.kind === 'review' ? 'var(--success-soft)' : a.kind === 'refund' ? 'var(--error-soft)' : 'var(--surface-container)',
                    color: a.kind === 'order' ? 'var(--primary)' : a.kind === 'stock' ? 'var(--warning)' : a.kind === 'review' ? 'var(--success)' : a.kind === 'refund' ? 'var(--error)' : 'var(--on-surface-variant)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {a.kind === 'order' ? <IcBag size={16}/> : a.kind === 'stock' ? <IcBox size={16}/> : a.kind === 'review' ? <IcStar size={16}/> : a.kind === 'refund' ? <IcReturn size={16}/> : <IcUser size={16}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--on-surface)', lineHeight: '18px' }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{a.time} · {a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <Card title="Pedidos recentes" action={
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('orders')}>
              Ver todos <IcChevRight size={14}/>
            </button>
          } padded={false}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Pedido','Cliente','Data','Itens','Total','Pagamento','Entrega',''].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {D.orders.slice(0, 6).map((o) => (
                  <tr key={o.id} onClick={() => onOpenOrder(o)} style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                    <td style={td}>{o.customer}</td>
                    <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.date}</td>
                    <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{o.items}</td>
                    <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(o.total)}</td>
                    <td style={td}>{statusToChip(o.status)}</td>
                    <td style={td}>{statusToChip(o.fulfillment)}</td>
                    <td style={{...td, textAlign: 'right'}}><IcChevRight size={14} stroke="var(--outline)"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Card title="Vendas por canal">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Donut items={D.channels}/>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {D.channels.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span className="tabular" style={{ fontWeight: 600 }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Top regiões">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {D.regions.map((r, i) => (
                  <BarRow key={i} label={r.name} value={r.value} max={42} count={r.orders} accent={accents[i]}/>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card title="Mais vendidos esta semana" action={
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('products')}>
            Ver catálogo <IcChevRight size={14}/>
          </button>
        }>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {D.products.slice(0, 4).map(p => (
              <div key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ aspectRatio: '4/5', background: p.color, borderRadius: 12, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'transform 200ms' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '40%', background: `linear-gradient(180deg,transparent,${p.accent})`, opacity: 0.55 }}/>
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="chip chip-neutral" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>{p.collection}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                    <span className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{fmtBRL(p.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{p.sold} vendidos · {p.stock} em stock</span>
                    <span className={p.stock < 12 ? 'chip chip-warning' : 'chip chip-success'} style={{ height: 18, fontSize: 10, padding: '0 6px' }}>
                      {p.stock === 0 ? 'Sem stock' : p.stock < 12 ? 'Baixo' : 'OK'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ── Orders ───────────────────────────────────────────────────────────────────
  const Orders = ({ onOpenOrder }) => {
    const [tab, setTab] = useState('All');
    const [selected, setSelected] = useState(new Set());
    const tabs = [
      { id: 'All', label: 'Todos', count: D.orders.length },
      { id: 'Unfulfilled', label: 'Por enviar', count: D.orders.filter(o => o.fulfillment === 'Unfulfilled').length },
      { id: 'Fulfilled', label: 'Enviados', count: D.orders.filter(o => o.fulfillment === 'Fulfilled').length },
      { id: 'On hold', label: 'Em espera', count: D.orders.filter(o => o.fulfillment === 'On hold').length },
    ];
    const filtered = D.orders.filter(o => tab === 'All' || o.fulfillment === tab);
    const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Pedidos</h1>
            <div className="muted" style={{ marginTop: 4 }}>437 pedidos · 12 por enviar</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary"><IcExport size={16}/> Exportar</button>
            <button className="btn btn-primary"><IcPlus size={16}/> Criar pedido</button>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--hairline)', padding: '0 8px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '14px 14px', border: 0, background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === t.id ? 600 : 500,
                color: tab === t.id ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t.label}
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: tab === t.id ? 'var(--primary-soft-2)' : 'var(--surface-container)', color: tab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--hairline)' }}>
            <div className="field" style={{ width: 280 }}>
              <IcSearch size={14} stroke="var(--on-surface-variant)"/>
              <input placeholder="Pesquisar pedidos…"/>
            </div>
            <button className="btn btn-secondary btn-sm"><IcFilter size={14}/> Estado</button>
            <button className="btn btn-secondary btn-sm">Canal <IcChevDown size={14}/></button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                <th style={{ ...th, width: 36 }}><input type="checkbox"/></th>
                {['Pedido','Cliente','Data','Itens','Total','Pagamento','Entrega','Canal'].map(h => <th key={h} style={th}>{h}</th>)}
                <th style={{ ...th, width: 36 }}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => onOpenOrder(o)} style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={td} onClick={(e) => { e.stopPropagation(); toggle(o.id); }}>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => {}}/>
                  </td>
                  <td style={td}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                  <td style={td}>{o.customer}</td>
                  <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.date}</td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{o.items}</td>
                  <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(o.total)}</td>
                  <td style={td}>{statusToChip(o.status)}</td>
                  <td style={td}>{statusToChip(o.fulfillment)}</td>
                  <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.channel}</td>
                  <td style={td}><IcChevRight size={14} stroke="var(--outline)"/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
            <span className="muted" style={{ fontSize: 12 }}>Mostrando 1–{filtered.length} de {D.orders.length}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-sm btn-icon"><IcChevLeft size={14}/></button>
              <button className="btn btn-secondary btn-sm btn-icon"><IcChevRight size={14}/></button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Order Panel ───────────────────────────────────────────────────────────────
  const OrderPanel = ({ order, onClose }) => {
    if (!order) return null;
    const items = [
      { name: 'Linen Wrap Blazer', size: 'M', qty: 1, price: 289, color: 'var(--swatch-2)', accent: 'var(--swatch-6)' },
      { name: 'Silk Slip Dress', size: 'S', qty: 1, price: 348, color: 'var(--swatch-5)', accent: 'var(--swatch-3)' },
    ].slice(0, order.items);
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const events = [
      { text: 'Pedido criado', time: order.date, done: true },
      { text: `Pagamento confirmado · ${fmtBRL(order.total)}`, time: order.date, done: order.status === 'Paid' },
      { text: order.fulfillment === 'Fulfilled' ? 'Enviado via Loggi' : 'Aguardando envio', time: order.fulfillment === 'Fulfilled' ? 'Apr 27, 14:02' : '—', done: order.fulfillment === 'Fulfilled' },
      { text: 'Entregue', time: '—', done: false },
    ];
    return (
      <>
        <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.32)', zIndex: 50 }}/>
        <aside className="animate-slide-right" style={{
          position: 'fixed', top: 0, right: 0, height: '100%', width: 520,
          background: 'var(--surface-container-lowest)',
          boxShadow: '-12px 0 32px rgba(16,24,40,0.08)',
          zIndex: 51, display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--hairline)',
        }}>
          <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="h2">{order.id}</span>
                {statusToChip(order.status)}
                {statusToChip(order.fulfillment)}
              </div>
              <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>{order.date} · {order.channel}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
          </header>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div className="overline" style={{ marginBottom: 12 }}>Itens ({order.items})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--hairline)', borderRadius: 8 }}>
                    <ProductThumb product={it}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Tamanho {it.size} · Qtd. {it.qty}</div>
                    </div>
                    <span className="tabular" style={{ fontWeight: 600 }}>{fmtBRL(it.price)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 8 }}>
              {[['Subtotal', subtotal], ['Envio', 24], ['IVA (8%)', subtotal * 0.08]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, fontWeight: 500 }}>
                  <span>{l}</span><span className="tabular">{fmtBRL(v)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--hairline)', margin: '8px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, fontWeight: 700 }}>
                <span>Total</span><span className="tabular">{fmtBRL(order.total)}</span>
              </div>
            </div>
            <div>
              <div className="overline" style={{ marginBottom: 12 }}>Linha do tempo</div>
              {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: e.done ? 'var(--success-soft)' : 'var(--surface-container)', color: e.done ? 'var(--success)' : 'var(--outline)', display: 'grid', placeItems: 'center', flexShrink: 0, border: e.done ? 0 : '1px dashed var(--outline-variant)' }}>
                      {e.done ? <IcCheck size={12} sw={2.6}/> : <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--outline)' }}/>}
                    </div>
                    {i < events.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--hairline)', minHeight: 16 }}/>}
                  </div>
                  <div style={{ paddingBottom: 14, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: e.done ? 600 : 500, color: e.done ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{e.text}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <footer style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <button className="btn btn-secondary"><IcReturn size={16}/> Reembolso</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary">Imprimir</button>
              <button className="btn btn-primary"><IcTruck size={16}/> Enviar</button>
            </div>
          </footer>
        </aside>
      </>
    );
  };

  // ── Products ─────────────────────────────────────────────────────────────────
  const Products = ({ onOpenProduct }) => {
    const [view, setView] = useState('grid');
    const [filter, setFilter] = useState('All');
    const cols = ['All', 'Resort 26', 'Core', 'Evening', 'Pre-Fall', 'Accessories'];
    const items = D.products.filter(p => filter === 'All' || p.collection === filter);
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Produtos</h1>
            <div className="muted" style={{ marginTop: 4 }}>{D.products.length} produtos · 4 coleções</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary"><IcExport size={16}/> Exportar</button>
            <button className="btn btn-primary"><IcPlus size={16}/> Novo produto</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="field" style={{ width: 320 }}>
            <IcSearch size={14} stroke="var(--on-surface-variant)"/>
            <input placeholder="Pesquisar por nome ou SKU…"/>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-container-low)', borderRadius: 8, border: '1px solid var(--hairline)' }}>
            {cols.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                height: 28, padding: '0 12px', borderRadius: 6, border: 0, cursor: 'pointer',
                background: filter === c ? 'var(--surface-container-lowest)' : 'transparent',
                color: filter === c ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                fontSize: 12, fontWeight: filter === c ? 600 : 500,
                boxShadow: filter === c ? '0 1px 2px rgba(16,24,40,0.05)' : 'none',
              }}>{c}</button>
            ))}
          </div>
        </div>
        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {items.map(p => (
              <div key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ aspectRatio: '4/5', borderRadius: 12, background: p.color, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'transform 200ms' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '38%', background: `linear-gradient(180deg,transparent,${p.accent})`, opacity: 0.55 }}/>
                  <span className="chip chip-neutral" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.85)' }}>{p.collection}</span>
                  {p.stock === 0 && <span className="chip chip-error" style={{ position: 'absolute', top: 12, right: 12 }}>Sem stock</span>}
                  {p.stock > 0 && p.stock < 12 && <span className="chip chip-warning" style={{ position: 'absolute', top: 12, right: 12 }}>Baixo</span>}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                    <span className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{fmtBRL(p.price)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{p.id} · {p.sold} vendidos</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-container-low)' }}>{['Produto','SKU','Coleção','Preço','Stock','Vendidos',''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ProductThumb product={p}/><span style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                    <td style={{...td, fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--on-surface-variant)'}}>{p.id}</td>
                    <td style={td}>{p.collection}</td>
                    <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(p.price)}</td>
                    <td style={td}>{p.stock === 0 ? <span className="chip chip-error">Sem stock</span> : p.stock < 12 ? <span className="chip chip-warning">{p.stock} baixo</span> : <span className="tabular">{p.stock}</span>}</td>
                    <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{p.sold}</td>
                    <td style={td}><IcChevRight size={14} stroke="var(--outline)"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ── Product Modal ─────────────────────────────────────────────────────────────
  const ProductModal = ({ product, onClose }) => {
    if (!product) return null;
    const sizeStock = product.sizes.map((s, i) => ({ size: s, stock: Math.max(0, Math.floor(product.stock / product.sizes.length) + (i % 2 ? 2 : -1)) }));
    return (
      <>
        <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.42)', zIndex: 50, display: 'grid', placeItems: 'center', padding: 32 }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--surface-container-lowest)', borderRadius: 16, width: '100%', maxWidth: 880,
            boxShadow: 'var(--shadow-overlay)', display: 'grid', gridTemplateColumns: '1fr 1.1fr',
            maxHeight: 'calc(100vh - 64px)', overflow: 'hidden',
          }}>
            <div style={{ background: product.color, position: 'relative', minHeight: 440 }}>
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '40%', background: `linear-gradient(180deg,transparent,${product.accent})`, opacity: 0.55 }}/>
              <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.92)', borderColor: 'transparent' }}><IcClose size={16}/></button>
              <span className="chip" style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.9)', color: 'var(--on-surface)' }}>{product.collection}</span>
            </div>
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
              <div>
                <div className="overline" style={{ fontSize: 10 }}>{product.id}</div>
                <h2 className="h2" style={{ margin: '6px 0 8px' }}>{product.name}</h2>
                <span className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{fmtBRL(product.price)}</span>
              </div>
              <div>
                <div className="overline" style={{ marginBottom: 8 }}>Tamanho & stock</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sizeStock.length},1fr)`, gap: 8 }}>
                  {sizeStock.map(s => (
                    <div key={s.size} style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: 10, textAlign: 'center', background: s.stock === 0 ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)', opacity: s.stock === 0 ? 0.6 : 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.size}</div>
                      <div className="muted tabular" style={{ fontSize: 11, marginTop: 2 }}>{s.stock} em stock</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Total em stock', fmtNum(product.stock), 'por tamanhos'], ['Sell-through', Math.round(product.sold / (product.sold + product.stock) * 100) + '%', 'últimos 30 dias'], ['Devoluções', '2.1%', 'média 4.8%'], ['Avaliação', '4.8 ★', '36 avaliações']].map(([l, v, s]) => (
                  <div key={l} style={{ padding: 12, background: 'var(--surface-container-low)', borderRadius: 8 }}>
                    <div className="overline" style={{ fontSize: 10, marginBottom: 4 }}>{l}</div>
                    <div className="tabular" style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}><IcEdit size={16}/> Editar</button>
                <button className="btn btn-primary" style={{ flex: 1 }}><IcBox size={16}/> Repor stock</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── Inventory ────────────────────────────────────────────────────────────────
  const Inventory = ({ onOpenProduct }) => {
    const sorted = [...D.products].sort((a, b) => a.stock - b.stock);
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div>
          <h1 className="h1" style={{ margin: 0 }}>Inventário</h1>
          <div className="muted" style={{ marginTop: 4 }}>3 SKUs precisam de atenção</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <KPICard label="SKUs em catálogo" value="148" delta={2.1} sparkline={[140,142,143,145,146,146,147,148]}/>
          <KPICard label="Sem stock" value="2" delta={50} deltaLabel="vs. semana passada" sparkline={[1,1,1,2,2,2,2,2]} accent="var(--error)"/>
          <KPICard label="Stock baixo" value="3" delta={-25} deltaLabel="vs. semana passada" sparkline={[5,4,4,4,3,3,3,3]} accent="var(--warning)"/>
          <KPICard label="Valor em inventário" value={fmtBRL(284900)} delta={-1.2} sparkline={[290,288,287,289,286,285,285,284]}/>
        </div>
        <Card title="Alertas de stock" padded={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--surface-container-low)' }}>{['Produto','SKU','Coleção','Stock','Vendidos 7d','Estado',''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {sorted.slice(0, 8).map(p => (
                <tr key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ProductThumb product={p}/><span style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                  <td style={{...td, fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--on-surface-variant)'}}>{p.id}</td>
                  <td style={td}>{p.collection}</td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums', fontWeight: 600}}>{p.stock}</td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{Math.floor(p.sold / 30 * 7)}</td>
                  <td style={td}>{p.stock === 0 ? <span className="chip chip-error"><span className="dot"/>Sem stock</span> : p.stock < 12 ? <span className="chip chip-warning"><span className="dot"/>Baixo</span> : <span className="chip chip-success"><span className="dot"/>OK</span>}</td>
                  <td style={td}><button className="btn btn-secondary btn-sm">Repor</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  // ── Customers ────────────────────────────────────────────────────────────────
  const Customers = () => {
    const swatches = ['var(--swatch-1)','var(--swatch-2)','var(--swatch-3)','var(--swatch-4)','var(--swatch-5)','var(--swatch-6)','var(--swatch-7)','var(--swatch-8)'];
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Clientes</h1>
            <div className="muted" style={{ marginTop: 4 }}>{D.customers.length} clientes · 14 VIP</div>
          </div>
          <button className="btn btn-primary"><IcPlus size={16}/> Adicionar cliente</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <KPICard label="Total de clientes" value="1.284" delta={6.4} sparkline={[1100,1140,1180,1210,1240,1260,1275,1284]}/>
          <KPICard label="Novos este mês" value="84" delta={12.0} sparkline={[60,62,68,72,76,79,82,84]} accent="var(--swatch-4)"/>
          <KPICard label="Taxa de retorno" value="38%" delta={2.4} sparkline={[34,35,35,36,37,37,38,38]} accent="var(--swatch-2)"/>
          <KPICard label="LTV médio" value={fmtBRL(842)} delta={4.1} sparkline={[800,810,815,820,830,835,840,842]} accent="var(--swatch-5)"/>
        </div>
        <Card title="Todos os clientes" padded={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--surface-container-low)' }}>{['Cliente','Localização','Pedidos','LTV','Nível','Membro desde',''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {D.customers.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, background: swatches[c.id.charCodeAt(c.id.length - 1) % 8], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                        {c.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{c.city}</td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{c.orders}</td>
                  <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(c.ltv)}</td>
                  <td style={td}>{statusToChip(c.status)}</td>
                  <td style={{...td, color: 'var(--on-surface-variant)'}}>{c.joined}</td>
                  <td style={td}><IcChevRight size={14} stroke="var(--outline)"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  // ── Stub ─────────────────────────────────────────────────────────────────────
  const Stub = ({ title }) => (
    <div style={{ padding: 32 }} className="animate-fade">
      <h1 className="h1" style={{ margin: 0 }}>{title}</h1>
      <div className="muted" style={{ marginTop: 6 }}>Em breve — o foco está em Visão Geral, Pedidos, Produtos, Inventário e Clientes.</div>
      <div className="card" style={{ marginTop: 20, padding: 60, display: 'grid', placeItems: 'center', textAlign: 'center', minHeight: 360 }}>
        <div>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 16, marginLeft: 'auto', marginRight: 'auto' }}>
            <IcChart size={28}/>
          </div>
          <div className="h3">Ainda não disponível</div>
          <div className="muted" style={{ marginTop: 4, maxWidth: 360 }}>Esta área terá ferramentas avançadas de {title.toLowerCase()}.</div>
        </div>
      </div>
    </div>
  );

  // ── PageAdmin ─────────────────────────────────────────────────────────────────
  const PageAdmin = ({ onExit }) => {
    useEffect(() => { injectStyles(); }, []);
    const [screen, setScreen] = useState('overview');
    const [openOrder, setOpenOrder] = useState(null);
    const [openProduct, setOpenProduct] = useState(null);
    const [dark, setDark] = useState(false);

    const renderScreen = () => {
      switch (screen) {
        case 'overview':  return <Overview onNavigate={setScreen} onOpenOrder={setOpenOrder} onOpenProduct={setOpenProduct}/>;
        case 'orders':    return <Orders onOpenOrder={setOpenOrder}/>;
        case 'products':  return <Products onOpenProduct={setOpenProduct}/>;
        case 'inventory': return <Inventory onOpenProduct={setOpenProduct}/>;
        case 'customers': return <Customers/>;
        default:          return <Stub title={screen.charAt(0).toUpperCase() + screen.slice(1)}/>;
      }
    };

    return (
      <div
        data-admin="true"
        data-theme={dark ? 'dark' : undefined}
        style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', overflow: 'hidden', background: 'var(--surface)' }}
      >
        <Sidebar active={screen} onNavigate={setScreen} onExit={onExit}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar dark={dark} setDark={setDark}/>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderScreen()}
          </div>
        </div>
        {/* Panels rendered outside scrollable area, positioned fixed to viewport */}
        {openOrder && <OrderPanel order={openOrder} onClose={() => setOpenOrder(null)}/>}
        {openProduct && <ProductModal product={openProduct} onClose={() => setOpenProduct(null)}/>}
      </div>
    );
  };

  window.PageAdmin = PageAdmin;
})();
