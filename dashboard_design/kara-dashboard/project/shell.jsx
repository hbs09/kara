/* Shared UI: Sidebar, Topbar, Card, Sparkline, etc. */

const fmtBRL = (n) => 'R$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtNum = (n) => n.toLocaleString('en-US');

const Swatch = ({ color, accent, size = 64, label }) => (
  <div style={{
    width: size, height: size, borderRadius: 8,
    background: `linear-gradient(135deg, ${color} 0%, ${color} 60%, ${accent || color} 60%, ${accent || color} 100%)`,
    flexShrink: 0,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    position: 'relative',
  }} aria-label={label} />
);

const ProductThumb = ({ product, size = 56 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8,
    background: product.color,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', inset: '40% 0 0 60%',
      background: product.accent,
      borderTopLeftRadius: 999,
    }} />
  </div>
);

/* Sidebar */
const Sidebar = ({ active, onNavigate }) => {
  const nav = [
    { id: 'overview', label: 'Overview', Icon: IconHome },
    { id: 'orders',   label: 'Orders', Icon: IconBag, badge: 12 },
    { id: 'products', label: 'Products', Icon: IconHanger },
    { id: 'inventory',label: 'Inventory', Icon: IconBox, badge: 3, badgeKind: 'warning' },
    { id: 'customers',label: 'Customers', Icon: IconUsers },
    { id: 'analytics',label: 'Analytics', Icon: IconChart },
    { id: 'marketing',label: 'Marketing', Icon: IconMegaphone },
  ];
  const collections = [
    { id: 'col-resort', label: 'Resort 26', dot: 'var(--swatch-2)' },
    { id: 'col-evening', label: 'Evening', dot: 'var(--swatch-5)' },
    { id: 'col-prefall', label: 'Pre-Fall 26', dot: 'var(--swatch-7)' },
    { id: 'col-core', label: 'Core', dot: 'var(--swatch-1)' },
  ];

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'var(--surface-container-lowest)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Wordmark */}
      <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em' }}>Kara</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Admin</span>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" aria-label="Search" style={{ width: 30, height: 30 }}>
          <IconSearch size={16} />
        </button>
      </div>

      {/* Store switcher */}
      <div style={{ padding: '0 16px 16px' }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 8, border: '1px solid var(--hairline)',
          background: 'var(--surface-container-low)', textAlign: 'left', cursor: 'pointer',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--swatch-1)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>K</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>kara.com</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Brazil · 4 channels</div>
          </div>
          <IconChevDown size={16} />
        </button>
      </div>

      {/* Main nav */}
      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => onNavigate(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px', borderRadius: 8, border: 0,
              background: isActive ? 'var(--primary-soft-2)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
              fontSize: 14, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', position: 'relative',
              transition: 'background 100ms',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              {isActive && (
                <span style={{
                  position: 'absolute', left: -12, top: 6, bottom: 6, width: 3,
                  background: 'var(--primary)', borderRadius: '0 4px 4px 0',
                }} />
              )}
              <n.Icon size={18} />
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

      <div className="overline" style={{ padding: '24px 24px 8px', fontSize: 10 }}>Collections</div>
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {collections.map(c => (
          <button key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '7px 12px', borderRadius: 8, border: 0, background: 'transparent',
            color: 'var(--on-surface-variant)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c.dot }} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom: settings + user */}
      <div style={{ padding: 12, borderTop: '1px solid var(--hairline)' }}>
        <button onClick={() => onNavigate('settings')} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '8px 12px', borderRadius: 8, border: 0,
          background: active === 'settings' ? 'var(--primary-soft-2)' : 'transparent',
          color: active === 'settings' ? 'var(--primary)' : 'var(--on-surface-variant)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 4,
        }}>
          <IconSettings size={18} />
          <span>Settings</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--swatch-5)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>BL</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Bianca Leal</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Owner</div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} aria-label="More">
            <IconMore size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/* Topbar */
const Topbar = ({ title, subtitle, primaryAction, onSearch }) => (
  <header style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '20px 32px', borderBottom: '1px solid var(--hairline)',
    background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '28px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div className="field" style={{ width: 280, height: 36 }}>
      <IconSearch size={16} stroke="var(--on-surface-variant)" />
      <input placeholder="Search orders, products, customers…" />
      <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 4 }}>⌘K</span>
    </div>
    <ThemeToggle/>
    <button className="btn btn-secondary btn-icon" aria-label="Notifications" style={{ position: 'relative' }}>
      <IconBell size={18} />
      <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 999, background: 'var(--error)', border: '2px solid #fff' }} />
    </button>
    {primaryAction || (
      <button className="btn btn-primary">
        <IconPlus size={16} />
        New product
      </button>
    )}
  </header>
);

/* Card wrapper with optional header */
const Card = ({ title, action, children, padded = true, style }) => (
  <section className="card" style={style}>
    {title && (
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--hairline)',
      }}>
        <h3 className="h3" style={{ margin: 0, fontSize: 16, lineHeight: '24px' }}>{title}</h3>
        {action}
      </header>
    )}
    <div style={{ padding: padded ? 20 : 0 }}>{children}</div>
  </section>
);

/* KPI Card */
const KPICard = ({ label, value, delta, deltaLabel, sparkline, accent }) => {
  const positive = delta >= 0;
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="overline" style={{ fontSize: 11 }}>{label}</div>
        <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} aria-label="More">
          <IconMore size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div className="tabular" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}>{value}</div>
        {sparkline && <Sparkline data={sparkline} color={accent || 'var(--primary)'} width={88} height={32} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          fontSize: 12, fontWeight: 600,
          color: positive ? 'var(--success)' : 'var(--error)',
        }}>
          {positive ? <IconArrowUp size={12} strokeWidth={2.4}/> : <IconArrowDown size={12} strokeWidth={2.4}/>}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{deltaLabel || 'vs. previous 14d'}</span>
      </div>
    </div>
  );
};

const Sparkline = ({ data, color = 'var(--primary)', width = 88, height = 32 }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / r) * (height - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  const id = 'spark-' + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/* Status helpers */
const statusToChip = (s) => {
  const map = {
    Paid: ['chip-success', 'Paid'],
    Pending: ['chip-warning', 'Pending'],
    Refunded: ['chip-neutral', 'Refunded'],
    Fulfilled: ['chip-success', 'Fulfilled'],
    Unfulfilled: ['chip-warning', 'Unfulfilled'],
    Returned: ['chip-neutral', 'Returned'],
    'On hold': ['chip-error', 'On hold'],
    VIP: ['chip-info', 'VIP'],
    New: ['chip-success', 'New'],
    Returning: ['chip-neutral', 'Returning'],
  };
  const [cls, text] = map[s] || ['chip-neutral', s];
  return <span className={`chip ${cls}`}><span className="dot" />{text}</span>;
};

const ThemeToggle = () => {
  const [dark, setDark] = React.useState(() => document.documentElement.dataset.theme === 'dark');
  React.useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  return (
    <button
      className="btn btn-secondary btn-icon"
      onClick={() => setDark(d => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? <IconSun size={18}/> : <IconMoon size={18}/>}
    </button>
  );
};

Object.assign(window, {
  fmtBRL, fmtNum, Sidebar, Topbar, Card, KPICard, Sparkline, Swatch, ProductThumb, statusToChip, ThemeToggle,
});
