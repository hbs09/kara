/* Products, Inventory, Customers screens + ProductModal */

const Products = ({ onOpenProduct }) => {
  const D = window.KaraData;
  const [view, setView] = React.useState('grid');
  const [filter, setFilter] = React.useState('All');
  const collections = ['All', 'Resort 26', 'Core', 'Evening', 'Pre-Fall', 'Accessories'];
  const items = D.products.filter(p => filter === 'All' || p.collection === filter);

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="h1" style={{ margin: 0 }}>Products</h1>
          <div className="muted" style={{ marginTop: 4 }}>{D.products.length} products · 4 collections</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><IconExport size={16}/> Export</button>
          <button className="btn btn-primary"><IconPlus size={16}/> New product</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="field" style={{ width: 320 }}>
          <IconSearch size={14} stroke="var(--on-surface-variant)" />
          <input placeholder="Search by name or SKU…" />
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-container-low)', borderRadius: 8, border: '1px solid var(--hairline)' }}>
          {collections.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              height: 28, padding: '0 12px', borderRadius: 6, border: 0,
              background: filter === c ? 'var(--surface-container-lowest)' : 'transparent',
              boxShadow: filter === c ? '0 1px 2px rgba(16,24,40,0.05)' : 'none',
              color: filter === c ? 'var(--on-surface)' : 'var(--on-surface-variant)',
              fontSize: 12, fontWeight: filter === c ? 600 : 500, cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--hairline)', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setView('grid')} className="btn-icon" style={{
            width: 36, height: 36, border: 0, background: view === 'grid' ? 'var(--surface-container)' : 'var(--surface-container-lowest)',
            color: view === 'grid' ? 'var(--on-surface)' : 'var(--on-surface-variant)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
          </button>
          <button onClick={() => setView('list')} className="btn-icon" style={{
            width: 36, height: 36, border: 0, background: view === 'list' ? 'var(--surface-container)' : 'var(--surface-container-lowest)',
            color: view === 'list' ? 'var(--on-surface)' : 'var(--on-surface-variant)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {items.map(p => (
            <ProductCard key={p.id} p={p} onClick={() => onOpenProduct(p)}/>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                {['Product','SKU','Collection','Price','Stock','Sold',''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ProductThumb product={p} size={40}/>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{...td, color: 'var(--on-surface-variant)', fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 12}}>{p.id}</td>
                  <td style={td}>{p.collection}</td>
                  <td style={{...td, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtBRL(p.price)}</td>
                  <td style={td}>
                    {p.stock === 0
                      ? <span className="chip chip-error">Out of stock</span>
                      : p.stock < 12
                        ? <span className="chip chip-warning">{p.stock} low</span>
                        : <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.stock}</span>}
                  </td>
                  <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{p.sold}</td>
                  <td style={td}><IconChevRight size={14} stroke="var(--outline)"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ p, onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{
      aspectRatio: '4 / 5', borderRadius: 12, background: p.color,
      position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
      transition: 'transform 200ms ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '38%', background: `linear-gradient(180deg, transparent, ${p.accent})`, opacity: 0.55 }}/>
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <span className="chip chip-neutral" style={{ background: 'rgba(255,255,255,0.85)' }}>{p.collection}</span>
      </div>
      {p.stock === 0 && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className="chip chip-error">Out of stock</span>
        </div>
      )}
      {p.stock > 0 && p.stock < 12 && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className="chip chip-warning">Only {p.stock}</span>
        </div>
      )}
    </div>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
        <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{fmtBRL(p.price)}</div>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{p.id} · {p.sold} sold</div>
    </div>
  </div>
);

/* Product Modal */
const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  const sizeStock = product.sizes.map((s, i) => ({ size: s, stock: Math.max(0, Math.floor(product.stock / product.sizes.length) + (i % 2 ? 2 : -1)) }));
  return (
    <>
      <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.42)', zIndex: 50 }}/>
      <div className="animate-fade" style={{
        position: 'fixed', inset: 0, zIndex: 51, display: 'grid', placeItems: 'center', padding: 32, pointerEvents: 'none',
      }}>
        <div style={{
          background: 'var(--surface-container-lowest)', borderRadius: 16, width: '100%', maxWidth: 920,
          boxShadow: 'var(--shadow-overlay)', display: 'grid', gridTemplateColumns: '1fr 1.1fr',
          maxHeight: 'calc(100vh - 64px)', overflow: 'hidden', pointerEvents: 'auto',
        }}>
          {/* Image side */}
          <div style={{ background: product.color, position: 'relative', minHeight: 480 }}>
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '40%', background: `linear-gradient(180deg, transparent, ${product.accent})`, opacity: 0.55 }}/>
            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.92)', borderColor: 'transparent' }}>
              <IconClose size={16}/>
            </button>
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--on-surface)' }}>{product.collection}</span>
            </div>
            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 6 }}>
              {[product.color, product.accent, 'var(--swatch-1)'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 0 0 2px ' + (i === 0 ? 'rgba(255,255,255,0.9)' : 'transparent') }}/>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            <div>
              <div className="overline" style={{ fontSize: 10 }}>{product.id}</div>
              <h2 className="h2" style={{ margin: '6px 0 8px' }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{fmtBRL(product.price)}</span>
                <span className="muted" style={{ fontSize: 13 }}>· {product.sold} sold</span>
              </div>
            </div>

            <div>
              <div className="overline" style={{ marginBottom: 8 }}>Size & stock</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + sizeStock.length + ', 1fr)', gap: 8 }}>
                {sizeStock.map(s => (
                  <div key={s.size} style={{
                    border: '1px solid var(--hairline)', borderRadius: 8, padding: 10, textAlign: 'center',
                    background: s.stock === 0 ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                    opacity: s.stock === 0 ? 0.6 : 1,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.size}</div>
                    <div className="muted tabular" style={{ fontSize: 11, marginTop: 2 }}>{s.stock} in stock</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Stat label="Total stock" value={fmtNum(product.stock)} sub="across sizes"/>
              <Stat label="Sell-through" value={Math.round(product.sold / (product.sold + product.stock) * 100) + '%'} sub="last 30d"/>
              <Stat label="Returns" value="2.1%" sub="industry avg 4.8%"/>
              <Stat label="Avg. rating" value="4.8 ★" sub="36 reviews"/>
            </div>

            <div className="hr"/>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}><IconEdit size={16}/> Edit details</button>
              <button className="btn btn-primary" style={{ flex: 1 }}><IconBox size={16}/> Restock</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Stat = ({ label, value, sub }) => (
  <div style={{ padding: 12, background: 'var(--surface-container-low)', borderRadius: 8 }}>
    <div className="overline" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
    <div className="tabular" style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
  </div>
);

/* Inventory */
const Inventory = ({ onOpenProduct }) => {
  const D = window.KaraData;
  const sorted = [...D.products].sort((a, b) => a.stock - b.stock);
  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
      <div>
        <h1 className="h1" style={{ margin: 0 }}>Inventory</h1>
        <div className="muted" style={{ marginTop: 4 }}>3 SKUs need attention</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard label="SKUs in catalog" value="148" delta={2.1} sparkline={[140,142,143,145,146,146,147,148]}/>
        <KPICard label="Out of stock" value="2" delta={50} deltaLabel="vs. last week" sparkline={[1,1,1,2,2,2,2,2]} accent="var(--error)"/>
        <KPICard label="Low stock" value="3" delta={-25} deltaLabel="vs. last week" sparkline={[5,4,4,4,3,3,3,3]} accent="var(--warning)"/>
        <KPICard label="Inventory value" value={fmtBRL(284900)} delta={-1.2} sparkline={[290,288,287,289,286,285,285,284]}/>
      </div>

      <Card title="Stock alerts" padded={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              {['Product','SKU','Collection','Stock','Sold last 7d','Status',''].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 8).map(p => (
              <tr key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ProductThumb product={p} size={40}/>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{...td, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--on-surface-variant)'}}>{p.id}</td>
                <td style={td}>{p.collection}</td>
                <td style={{...td, fontVariantNumeric: 'tabular-nums', fontWeight: 600}}>{p.stock}</td>
                <td style={{...td, fontVariantNumeric: 'tabular-nums'}}>{Math.floor(p.sold / 30 * 7)}</td>
                <td style={td}>
                  {p.stock === 0 ? <span className="chip chip-error"><span className="dot"/>Out of stock</span>
                  : p.stock < 12 ? <span className="chip chip-warning"><span className="dot"/>Low</span>
                  : <span className="chip chip-success"><span className="dot"/>Healthy</span>}
                </td>
                <td style={td}><button className="btn btn-secondary btn-sm">Reorder</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* Customers */
const Customers = () => {
  const D = window.KaraData;
  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h1" style={{ margin: 0 }}>Customers</h1>
          <div className="muted" style={{ marginTop: 4 }}>{D.customers.length} customers · 14 VIP</div>
        </div>
        <button className="btn btn-primary"><IconPlus size={16}/> Add customer</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard label="Total customers" value="1,284" delta={6.4} sparkline={[1100,1140,1180,1210,1240,1260,1275,1284]}/>
        <KPICard label="New this month" value="84" delta={12.0} sparkline={[60,62,68,72,76,79,82,84]} accent="var(--swatch-4)"/>
        <KPICard label="Repeat rate" value="38%" delta={2.4} sparkline={[34,35,35,36,37,37,38,38]} accent="var(--swatch-2)"/>
        <KPICard label="Avg. LTV" value={fmtBRL(842)} delta={4.1} sparkline={[800,810,815,820,830,835,840,842]} accent="var(--swatch-5)"/>
      </div>

      <Card title="All customers" padded={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              {['Customer','Location','Orders','LTV','Tier','Joined',''].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {D.customers.map(c => (
              <tr key={c.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  style={{ cursor: 'pointer' }}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: window.KaraData.swatches[c.id.charCodeAt(c.id.length - 1) % 8], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>
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
                <td style={td}><IconChevRight size={14} stroke="var(--outline)"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* Stub screens */
const Stub = ({ title }) => (
  <div style={{ padding: 32 }} className="animate-fade">
    <h1 className="h1" style={{ margin: 0 }}>{title}</h1>
    <div className="muted" style={{ marginTop: 6 }}>Coming soon — focus is on Overview, Orders, Products, Inventory and Customers.</div>
    <div className="card" style={{ marginTop: 20, padding: 60, display: 'grid', placeItems: 'center', textAlign: 'center', minHeight: 360 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
        <IconChart size={28}/>
      </div>
      <div className="h3">Nothing here yet</div>
      <div className="muted" style={{ marginTop: 4, maxWidth: 360 }}>This area would house deeper {title.toLowerCase()} tooling — campaigns, automations, and segment builders.</div>
    </div>
  </div>
);

Object.assign(window, { Products, ProductCard, ProductModal, Inventory, Customers, Stub });
