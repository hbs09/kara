/* Overview screen */

const Overview = ({ onNavigate, onOpenOrder, onOpenProduct }) => {
  const D = window.KaraData;

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade">
      {/* Greeting band */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Monday, April 27 · Good morning, Bianca</div>
          <h1 className="h1" style={{ margin: 0 }}>Today at Kara</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">
            <IconExport size={16}/> Export
          </button>
          <DateRange />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard label="Revenue" value={fmtBRL(157520)} delta={12.4}
          sparkline={D.salesSeries.map(d => d.v)} accent="var(--primary)"/>
        <KPICard label="Orders" value="437" delta={8.2}
          sparkline={[28,31,29,34,38,36,33,40,44,41,46,49,47,33]} accent="var(--swatch-4)"/>
        <KPICard label="Avg. order value" value={fmtBRL(360.46)} delta={3.8}
          sparkline={[320,312,328,341,355,338,344,358,365,360,372,366,361,360]} accent="var(--swatch-2)"/>
        <KPICard label="Conversion" value="3.42%" delta={-0.6}
          sparkline={[3.6,3.5,3.4,3.7,3.8,3.5,3.4,3.6,3.5,3.4,3.5,3.4,3.4,3.42]} accent="var(--swatch-5)"/>
      </div>

      {/* Sales chart + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card title="Revenue" action={
          <div style={{ display: 'flex', gap: 6 }}>
            <SegToggle options={['Revenue', 'Orders', 'Sessions']} active="Revenue"/>
          </div>
        }>
          <AreaChart data={D.salesSeries}/>
        </Card>

        <Card title="Live activity" action={
          <button className="btn btn-ghost btn-sm"><IconRefresh size={14}/></button>
        } padded={false}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {D.activity.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 20px',
                borderBottom: i < D.activity.length - 1 ? '1px solid var(--hairline)' : 0,
              }}>
                <ActivityIcon kind={a.kind}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--on-surface)', lineHeight: '18px' }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{a.time} · {a.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders + Channels + Regions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card title="Recent orders" action={
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('orders')}>
            View all <IconChevRight size={14}/>
          </button>
        } padded={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                {['Order','Customer','Date','Items','Total','Payment','Fulfillment',''].map(h => (
                  <th key={h} className="overline" style={{ fontSize: 10, padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--hairline)', color: 'var(--on-surface-variant)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.orders.slice(0, 6).map((o, i) => (
                <tr key={o.id}
                    onClick={() => onOpenOrder(o)}
                    style={{ cursor: 'pointer', transition: 'background 100ms' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                  <td style={td}>{o.customer}</td>
                  <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.date}</td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{o.items}</td>
                  <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(o.total)}</td>
                  <td style={td}>{statusToChip(o.status)}</td>
                  <td style={td}>{statusToChip(o.fulfillment)}</td>
                  <td style={{...td, textAlign: 'right'}}><IconChevRight size={14} stroke="var(--outline)"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card title="Sales by channel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Donut items={D.channels}/>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {D.channels.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                    <span style={{ flex: 1, color: 'var(--on-surface)' }}>{c.name}</span>
                    <span className="tabular" style={{ fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Top regions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {D.regions.map((r, i) => (
                <BarRow key={i} label={r.name} value={r.value} max={42} count={r.orders}
                  accent={['var(--primary)','var(--swatch-7)','var(--swatch-2)','var(--swatch-4)','var(--swatch-5)','var(--outline-variant)'][i]}/>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top collections shelf — fashion personality moment */}
      <Card title="Top performers this week" action={
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('products')}>
          See catalog <IconChevRight size={14}/>
        </button>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {D.products.slice(0, 4).map(p => (
            <div key={p.id}
                 onClick={() => onOpenProduct(p)}
                 style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                aspectRatio: '4 / 5',
                background: p.color,
                borderRadius: 12,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                transition: 'transform 200ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {/* lookbook-style overlay */}
                <div style={{
                  position: 'absolute', inset: 'auto 0 0 0', height: '40%',
                  background: `linear-gradient(180deg, transparent 0%, ${p.accent} 100%)`,
                  opacity: 0.55,
                }}/>
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                }}>
                  <span className="chip chip-neutral" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
                    {p.collection}
                  </span>
                </div>
                <div style={{
                  position: 'absolute', bottom: 12, right: 12,
                  width: 36, height: 36, borderRadius: 999,
                  background: 'rgba(255,255,255,0.92)',
                  display: 'grid', placeItems: 'center', color: 'var(--on-surface)',
                }}>
                  <IconChevRight size={16}/>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{p.name}</div>
                  <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{fmtBRL(p.price)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{p.sold} sold · {p.stock} in stock</span>
                  <span className={p.stock < 12 ? 'chip chip-warning' : 'chip chip-success'} style={{ height: 18, fontSize: 10, padding: '0 6px' }}>
                    {p.stock < 12 ? 'Low' : 'Healthy'}
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

const td = { padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--hairline)' };

const ActivityIcon = ({ kind }) => {
  const map = {
    order:    { Icon: IconBag, bg: 'var(--info-soft)', fg: 'var(--primary)' },
    stock:    { Icon: IconBox, bg: 'var(--warning-soft)', fg: 'var(--warning)' },
    review:   { Icon: IconStar, bg: 'var(--success-soft)', fg: 'var(--success)' },
    refund:   { Icon: IconReturn, bg: 'var(--error-soft)', fg: 'var(--error)' },
    customer: { Icon: IconUser, bg: 'var(--surface-container)', fg: 'var(--on-surface-variant)' },
  };
  const m = map[kind] || map.order;
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, display: 'grid', placeItems: 'center', color: m.fg, flexShrink: 0 }}>
      <m.Icon size={16}/>
    </div>
  );
};

const SegToggle = ({ options, active, onChange }) => (
  <div style={{ display: 'inline-flex', padding: 3, background: 'var(--surface-container-low)', borderRadius: 8, border: '1px solid var(--hairline)' }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange && onChange(o)} style={{
        height: 26, padding: '0 12px', borderRadius: 6, border: 0,
        background: o === active ? 'var(--surface-container-lowest)' : 'transparent',
        boxShadow: o === active ? '0 1px 2px rgba(16,24,40,0.05)' : 'none',
        color: o === active ? 'var(--on-surface)' : 'var(--on-surface-variant)',
        fontSize: 12, fontWeight: o === active ? 600 : 500, cursor: 'pointer',
      }}>{o}</button>
    ))}
  </div>
);

const DateRange = () => (
  <button className="btn btn-secondary">
    Apr 14 — Apr 27
    <IconChevDown size={14}/>
  </button>
);

Object.assign(window, { Overview, ActivityIcon, SegToggle, DateRange });
