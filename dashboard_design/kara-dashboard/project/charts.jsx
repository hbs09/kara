/* Charts: AreaChart, Donut, BarRow */

const AreaChart = ({ data, height = 260, color = 'var(--primary)' }) => {
  const padding = { top: 16, right: 12, bottom: 28, left: 44 };
  const width = 720;
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const values = data.map(d => d.v);
  const max = Math.ceil(Math.max(...values) / 2000) * 2000;
  const min = 0;
  const xs = (i) => padding.left + (i / (data.length - 1)) * w;
  const ys = (v) => padding.top + h - ((v - min) / (max - min)) * h;

  const linePath = data.map((d, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(d.v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xs(data.length - 1)} ${padding.top + h} L ${xs(0)} ${padding.top + h} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + (i / ticks) * (max - min));

  const [hover, setHover] = React.useState(null);

  const onMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((x - padding.left) / w) * (data.length - 1));
    if (i >= 0 && i < data.length) setHover(i);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
           onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>

        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={ys(v)} y2={ys(v)} stroke="var(--hairline)" strokeDasharray={i === 0 ? '0' : '3 4'} />
            <text x={padding.left - 8} y={ys(v) + 4} textAnchor="end" fontSize="11" fill="var(--on-surface-variant)" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#area-grad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => {
          const showLabel = i % 2 === 0;
          return showLabel ? (
            <text key={i} x={xs(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--on-surface-variant)">
              {d.d.replace('Apr ', '')}
            </text>
          ) : null;
        })}

        {hover !== null && (
          <g>
            <line x1={xs(hover)} x2={xs(hover)} y1={padding.top} y2={padding.top + h} stroke="var(--outline-variant)" strokeDasharray="3 3"/>
            <circle cx={xs(hover)} cy={ys(data[hover].v)} r="5" fill={color} stroke="#fff" strokeWidth="2"/>
          </g>
        )}
      </svg>
      {hover !== null && (
        <div style={{
          position: 'absolute',
          left: `calc(${(xs(hover) / width) * 100}% + 0px)`,
          top: 8,
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
  const cx = size / 2, cy = size / 2;
  const c = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--surface-container)" strokeWidth={thickness}/>
      {items.map((it, i) => {
        const frac = it.value / total;
        const len = c * frac;
        const dash = `${len - 2} ${c - len + 2}`;
        const seg = (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
            stroke={it.color} strokeWidth={thickness}
            strokeDasharray={dash} strokeDashoffset={-offset}
            strokeLinecap="butt"/>
        );
        offset += len;
        return seg;
      })}
    </svg>
  );
};

const BarRow = ({ label, value, max, count, accent = 'var(--primary)' }) => {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 110, fontSize: 13, color: 'var(--on-surface)' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 999, transition: 'width 320ms ease' }}/>
      </div>
      <div className="tabular" style={{ width: 56, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{value}%</div>
      {count !== undefined && (
        <div className="tabular" style={{ width: 64, textAlign: 'right', fontSize: 12, color: 'var(--on-surface-variant)' }}>{count} ord.</div>
      )}
    </div>
  );
};

Object.assign(window, { AreaChart, Donut, BarRow });
