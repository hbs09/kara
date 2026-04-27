/* Orders screen */

const Orders = ({ onOpenOrder }) => {
  const D = window.KaraData;
  const [tab, setTab] = React.useState('All');
  const [selected, setSelected] = React.useState(new Set());

  const tabs = [
    { id: 'All', count: D.orders.length },
    { id: 'Unfulfilled', count: D.orders.filter(o => o.fulfillment === 'Unfulfilled').length },
    { id: 'Fulfilled', count: D.orders.filter(o => o.fulfillment === 'Fulfilled').length },
    { id: 'On hold', count: D.orders.filter(o => o.fulfillment === 'On hold').length },
    { id: 'Returns', count: D.orders.filter(o => o.fulfillment === 'Returned').length },
  ];

  const filtered = D.orders.filter(o => {
    if (tab === 'All') return true;
    if (tab === 'Returns') return o.fulfillment === 'Returned';
    return o.fulfillment === tab;
  });

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="h1" style={{ margin: 0 }}>Orders</h1>
          <div className="muted" style={{ marginTop: 4 }}>437 orders this period · 12 unfulfilled</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><IconExport size={16}/> Export</button>
          <button className="btn btn-primary"><IconPlus size={16}/> Create order</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--hairline)', padding: '0 8px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '14px 14px', border: 0, background: 'transparent',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? 'var(--on-surface)' : 'var(--on-surface-variant)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.id}
              <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 999,
                background: tab === t.id ? 'var(--primary-soft-2)' : 'var(--surface-container)',
                color: tab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              }}>{t.count}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}/>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--hairline)' }}>
          <div className="field" style={{ width: 280 }}>
            <IconSearch size={14} stroke="var(--on-surface-variant)" />
            <input placeholder="Search orders…" />
          </div>
          <button className="btn btn-secondary btn-sm"><IconFilter size={14}/> Status</button>
          <button className="btn btn-secondary btn-sm">Channel <IconChevDown size={14}/></button>
          <button className="btn btn-secondary btn-sm">Date <IconChevDown size={14}/></button>
          <div style={{ flex: 1 }}/>
          {selected.size > 0 && (
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{selected.size} selected</span>
          )}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              <th style={{ ...thStyle, width: 36 }}>
                <input type="checkbox" />
              </th>
              {['Order','Customer','Date','Items','Total','Payment','Fulfillment','Channel'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
              <th style={{ ...thStyle, width: 36 }}/>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}
                  onClick={() => onOpenOrder(o)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={td} onClick={(e) => { e.stopPropagation(); toggle(o.id); }}>
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => {}} />
                </td>
                <td style={td}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                <td style={td}>{o.customer}</td>
                <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.date}</td>
                <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{o.items}</td>
                <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(o.total)}</td>
                <td style={td}>{statusToChip(o.status)}</td>
                <td style={td}>{statusToChip(o.fulfillment)}</td>
                <td style={{...td, color: 'var(--on-surface-variant)'}}>{o.channel}</td>
                <td style={td}><IconChevRight size={14} stroke="var(--outline)"/></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
          <div className="muted" style={{ fontSize: 12 }}>Showing 1–{filtered.length} of {D.orders.length}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm btn-icon"><IconChevLeft size={14}/></button>
            <button className="btn btn-secondary btn-sm btn-icon"><IconChevRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--hairline)',
  color: 'var(--on-surface-variant)',
};

/* Order Detail Side Panel */
const OrderPanel = ({ order, onClose }) => {
  if (!order) return null;
  const items = [
    { name: 'Linen Wrap Blazer', size: 'M', qty: 1, price: 289.00, color: 'var(--swatch-2)', accent: 'var(--swatch-6)' },
    { name: 'Silk Slip Dress', size: 'S', qty: 1, price: 348.00, color: 'var(--swatch-5)', accent: 'var(--swatch-3)' },
  ].slice(0, order.items);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = 24;
  const tax = subtotal * 0.08;

  return (
    <>
      <div className="animate-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.32)', zIndex: 50,
      }}/>
      <aside className="animate-slide-right" style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 520,
        background: 'var(--surface-container-lowest)',
        boxShadow: '-12px 0 32px rgba(16,24,40,0.08)',
        zIndex: 51, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--hairline)',
      }}>
        {/* Header */}
        <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="h2" style={{ margin: 0 }}>{order.id}</h2>
              {statusToChip(order.status)}
              {statusToChip(order.fulfillment)}
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>{order.date} · {order.channel}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <IconClose size={18}/>
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Items */}
          <section>
            <div className="overline" style={{ marginBottom: 12 }}>Items ({order.items})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--hairline)', borderRadius: 8 }}>
                  <ProductThumb product={it}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Size {it.size} · Qty {it.qty}</div>
                  </div>
                  <div className="tabular" style={{ fontWeight: 600 }}>{fmtBRL(it.price)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 8 }}>
            <SumRow label="Subtotal" value={subtotal}/>
            <SumRow label="Shipping" value={shipping}/>
            <SumRow label="Tax (8%)" value={tax}/>
            <div style={{ height: 1, background: 'var(--hairline)', margin: '8px 0' }}/>
            <SumRow label="Total" value={order.total} bold/>
          </section>

          {/* Customer + Shipping */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <section>
              <div className="overline" style={{ marginBottom: 8 }}>Customer</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>helena.marcal@email.com</div>
              <div className="muted" style={{ fontSize: 12 }}>14 orders · R$ 4,218.00 LTV</div>
            </section>
            <section>
              <div className="overline" style={{ marginBottom: 8 }}>Ship to</div>
              <div style={{ fontSize: 13, lineHeight: '20px' }}>
                R. Oscar Freire 1234, Ap 502<br/>
                Jardins, São Paulo SP<br/>
                01426-001 · Brazil
              </div>
            </section>
          </div>

          {/* Timeline */}
          <section>
            <div className="overline" style={{ marginBottom: 12 }}>Timeline</div>
            <Timeline events={[
              { kind: 'order', text: 'Order placed', time: order.date, done: true },
              { kind: 'stock', text: 'Payment captured · R$ ' + order.total.toFixed(2), time: order.date, done: order.status === 'Paid' },
              { kind: 'order', text: order.fulfillment === 'Fulfilled' ? 'Shipped via Loggi' : 'Awaiting fulfillment', time: order.fulfillment === 'Fulfilled' ? 'Apr 27, 14:02' : '—', done: order.fulfillment === 'Fulfilled' },
              { kind: 'stock', text: 'Delivered', time: '—', done: false },
            ]}/>
          </section>
        </div>

        <footer style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <button className="btn btn-secondary"><IconReturn size={16}/> Refund</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary">Print invoice</button>
            <button className="btn btn-primary"><IconTruck size={16}/> Fulfill items</button>
          </div>
        </footer>
      </aside>
    </>
  );
};

const SumRow = ({ label, value, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, fontWeight: bold ? 700 : 500 }}>
    <span>{label}</span>
    <span className="tabular">{fmtBRL(value)}</span>
  </div>
);

const Timeline = ({ events }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    {events.map((e, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
          <div style={{
            width: 22, height: 22, borderRadius: 999,
            background: e.done ? 'var(--success-soft)' : 'var(--surface-container)',
            color: e.done ? 'var(--success)' : 'var(--outline)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            border: e.done ? 0 : '1px dashed var(--outline-variant)',
          }}>
            {e.done ? <IconCheck size={12} strokeWidth={2.6}/> : <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--outline)' }}/>}
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
);

Object.assign(window, { Orders, OrderPanel });
