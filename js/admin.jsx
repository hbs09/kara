
/* Kara Admin Dashboard — DB-connected, scoped to [data-admin] */
(function () {
  const { useState, useEffect, useCallback } = React;

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const ADMIN_CSS = `
    [data-admin]{--surface:#f8f9fd;--surface-dim:#d9dade;--surface-container-lowest:#ffffff;
      --surface-container-low:#f2f3f7;--surface-container:#edeef2;--surface-container-high:#e7e8ec;
      --surface-container-highest:#e1e2e6;--on-surface:#191c1f;--on-surface-variant:#424654;
      --inverse-surface:#2e3134;--inverse-on-surface:#eff1f5;--outline:#737686;
      --outline-variant:#c3c6d7;--hairline:#e5e7eb;--primary:#0053ce;--primary-hover:#00489e;
      --primary-soft:#dae2ff;--primary-soft-2:#eef2ff;--on-primary:#ffffff;
      --success:#0f7a4a;--success-soft:#d6f1e2;--warning:#b45d15;--warning-soft:#ffe6cf;
      --error:#ba1a1a;--error-soft:#ffdad6;--info:#0053ce;--info-soft:#dae2ff;
      --swatch-1:#2d3142;--swatch-2:#c9a27e;--swatch-3:#e8c8b8;--swatch-4:#4a5d4a;
      --swatch-5:#8b1e3f;--swatch-6:#d4d2cc;--swatch-7:#1a3a52;--swatch-8:#b8956a;
      --shadow-lift:0 4px 20px rgba(0,0,0,0.05);
      --shadow-overlay:0 12px 32px rgba(16,24,40,0.12),0 4px 12px rgba(16,24,40,0.06);
      font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      font-size:14px;line-height:20px;color:var(--on-surface);-webkit-font-smoothing:antialiased;}
    [data-admin][data-theme="dark"]{--surface:#0e1014;--surface-container-lowest:#14171c;
      --surface-container-low:#181b21;--surface-container:#1d2027;--surface-container-high:#22262e;
      --surface-container-highest:#292d36;--on-surface:#e8eaef;--on-surface-variant:#9ca3b1;
      --inverse-surface:#e8eaef;--inverse-on-surface:#14171c;--outline:#6b7180;
      --outline-variant:#2e3340;--hairline:#23262e;--primary:#5b8def;--primary-hover:#7ba3f5;
      --primary-soft:#1d2a44;--primary-soft-2:#18223a;--success:#4ade80;--success-soft:#143020;
      --warning:#f59e0b;--warning-soft:#3a2810;--error:#f87171;--error-soft:#3a1818;
      --info:#5b8def;--info-soft:#1d2a44;
      --shadow-lift:0 4px 20px rgba(0,0,0,0.35);
      --shadow-overlay:0 12px 32px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.3);}
    [data-admin] *{box-sizing:border-box;}
    [data-admin] button{font-family:inherit;cursor:pointer;}
    [data-admin] input,[data-admin] select,[data-admin] textarea{font-family:inherit;}
    [data-admin] .card{background:var(--surface-container-lowest);border-radius:8px;
      box-shadow:var(--shadow-lift);border:1px solid rgba(16,24,40,0.04);}
    [data-admin][data-theme="dark"] .card{border-color:rgba(255,255,255,0.04);}
    [data-admin] .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
      height:36px;padding:0 14px;border-radius:8px;font-size:14px;font-weight:500;
      border:1px solid transparent;transition:background 120ms,border-color 120ms,color 120ms;
      white-space:nowrap;cursor:pointer;}
    [data-admin] .btn-primary{background:var(--primary);color:#fff;border-color:var(--primary);}
    [data-admin] .btn-primary:hover{background:var(--primary-hover);border-color:var(--primary-hover);}
    [data-admin] .btn-secondary{background:var(--surface-container-lowest);color:var(--on-surface);border-color:var(--outline-variant);}
    [data-admin] .btn-secondary:hover{background:var(--surface-container-low);}
    [data-admin] .btn-ghost{background:transparent;color:var(--on-surface-variant);border-color:transparent;}
    [data-admin] .btn-ghost:hover{background:var(--surface-container);color:var(--on-surface);}
    [data-admin] .btn-danger{background:var(--error-soft);color:var(--error);border-color:transparent;}
    [data-admin] .btn-danger:hover{background:var(--error);color:#fff;}
    [data-admin] .btn-success{background:var(--success-soft);color:var(--success);border-color:transparent;}
    [data-admin] .btn-success:hover{background:var(--success);color:#fff;}
    [data-admin] .btn-sm{height:30px;padding:0 10px;font-size:13px;}
    [data-admin] .btn-icon{width:36px;padding:0;}
    [data-admin] .field{display:flex;align-items:center;gap:8px;height:36px;padding:0 12px;
      background:var(--surface-container-lowest);border:1px solid var(--outline-variant);
      border-radius:8px;color:var(--on-surface);}
    [data-admin] .field input{border:0;outline:0;background:transparent;width:100%;
      font-size:14px;color:inherit;font-family:inherit;}
    [data-admin] .field input::placeholder{color:var(--outline);}
    [data-admin] .chip{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;
      border-radius:9999px;font-size:12px;font-weight:600;white-space:nowrap;}
    [data-admin] .chip .dot{width:6px;height:6px;border-radius:999px;background:currentColor;}
    [data-admin] .chip-success{background:var(--success-soft);color:var(--success);}
    [data-admin] .chip-warning{background:var(--warning-soft);color:var(--warning);}
    [data-admin] .chip-error{background:var(--error-soft);color:var(--error);}
    [data-admin] .chip-info{background:var(--info-soft);color:var(--info);}
    [data-admin] .chip-neutral{background:var(--surface-container-high);color:var(--on-surface-variant);}
    [data-admin] .hr{height:1px;background:var(--hairline);border:0;margin:0;}
    [data-admin] .h1{font-size:32px;line-height:40px;font-weight:700;letter-spacing:-0.02em;}
    [data-admin] .h2{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.01em;}
    [data-admin] .h3{font-size:18px;line-height:26px;font-weight:600;}
    [data-admin] .overline{font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.08em;
      text-transform:uppercase;color:var(--on-surface-variant);}
    [data-admin] .muted{color:var(--on-surface-variant);}
    [data-admin] .tabular{font-variant-numeric:tabular-nums;}
    [data-admin] ::-webkit-scrollbar{width:8px;height:8px;}
    [data-admin] ::-webkit-scrollbar-track{background:transparent;}
    [data-admin] ::-webkit-scrollbar-thumb{background:var(--surface-container-high);
      border-radius:8px;border:2px solid var(--surface);}
    @keyframes adm-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes adm-slide{from{transform:translateX(100%)}to{transform:translateX(0)}}
    @keyframes adm-overlay{from{opacity:0}to{opacity:1}}
    [data-admin] .animate-fade{animation:adm-fade 220ms ease both;}
    [data-admin] .animate-slide-right{animation:adm-slide 280ms cubic-bezier(.2,.8,.2,1) both;}
    [data-admin] .animate-overlay{animation:adm-overlay 200ms ease both;}
    [data-admin] .modal-bg{position:fixed;inset:0;background:rgba(16,24,40,0.48);
      z-index:60;display:grid;place-items:center;padding:32px;}
  `;
  const injectStyles = () => {
    if (document.getElementById('kara-admin-css')) return;
    const el = document.createElement('style');
    el.id = 'kara-admin-css';
    el.textContent = ADMIN_CSS;
    document.head.appendChild(el);
  };

  // ── AdminAPI ─────────────────────────────────────────────────────────────────
  const db = () => window.supabaseClient;
  const configured = () => !!(window.__SUPABASE_CONFIGURED__ && db());

  const AdminAPI = {
    async getProducts() {
      if (!configured()) return null;
      const [prodRes, catRes, colRes, imgRes] = await Promise.all([
        db().from('products').select('id,sku,name,price,type,is_active,stock_quantity,low_stock_threshold,sort_order,category_id').order('sort_order'),
        db().from('categories').select('id,label'),
        db().from('product_colors').select('product_id,color_id'),
        db().from('product_images').select('product_id,url').order('sort_order'),
      ]);
      if (prodRes.error) { console.warn('Admin.getProducts:', prodRes.error.message); return null; }
      const catMap = {};
      (catRes.data || []).forEach(c => { catMap[c.id] = c.label; });
      const colorsByProduct = {};
      (colRes.data || []).forEach(r => {
        if (!colorsByProduct[r.product_id]) colorsByProduct[r.product_id] = 0;
        colorsByProduct[r.product_id]++;
      });
      const firstImage = {};
      (imgRes.data || []).forEach(img => {
        if (!firstImage[img.product_id]) firstImage[img.product_id] = img.url;
      });
      return (prodRes.data || []).map((p, i) => ({
        dbId: p.id,
        id: p.sku || p.id,
        name: p.name,
        type: p.type || '',
        collection: catMap[p.category_id] || '—',
        category_id: p.category_id,
        price: Number(p.price),
        stock: p.stock_quantity ?? 0,
        lowStockThreshold: p.low_stock_threshold ?? 10,
        is_active: p.is_active,
        colorCount: colorsByProduct[p.id] || 0,
        image: firstImage[p.id] || null,
        color: `var(--swatch-${1 + i % 8})`,
        accent: `var(--swatch-${1 + (i + 3) % 8})`,
      }));
    },

    async getColors() {
      const { data } = await db().from('colors').select('id,slug,label,hex').order('sort_order');
      return data || [];
    },

    async getSizes() {
      const { data } = await db().from('sizes').select('id,slug,label').order('sort_order');
      return data || [];
    },

    async getCategories() {
      const { data } = await db().from('categories').select('id,slug,label').order('sort_order');
      return (data || []).map(c => ({ id: c.id, slug: c.slug, label: c.label, path: c.label }));
    },

    async getProductColorIds(productId) {
      const { data } = await db().from('product_colors').select('color_id').eq('product_id', productId);
      return (data || []).map(r => r.color_id);
    },

    async getProductSizeIds(productId) {
      const { data } = await db().from('product_variants').select('size_id').eq('product_id', productId).not('size_id', 'is', null);
      return [...new Set((data || []).map(r => r.size_id))];
    },

    async getProductDetail(productId) {
      const { data } = await db().from('products')
        .select('id,sku,name,slug,description,price,type,weight,origin,materials,is_active,stock_quantity,low_stock_threshold,category_id,sort_order')
        .eq('id', productId).single();
      return data;
    },

    async updateProduct(dbId, fields) {
      const { error } = await db().from('products').update(fields).eq('id', dbId);
      if (error) throw error;
    },

    async createProduct(fields) {
      const { data, error } = await db().from('products').insert(fields).select('id').single();
      if (error) throw error;
      return data.id;
    },

    async setProductColors(productId, colorIds) {
      await db().from('product_colors').delete().eq('product_id', productId);
      if (colorIds.length > 0) {
        const { error } = await db().from('product_colors')
          .insert(colorIds.map((color_id, sort_order) => ({ product_id: productId, color_id, sort_order })));
        if (error) throw error;
      }
    },

    async setProductSizes(productId, sizeIds) {
      await db().from('product_variants').delete().eq('product_id', productId).is('color_id', null);
      if (sizeIds.length > 0) {
        const { error } = await db().from('product_variants')
          .insert(sizeIds.map(size_id => ({ product_id: productId, size_id, color_id: null, stock: 10 })));
        if (error) throw error;
      }
    },

    async getCustomers() {
      if (!configured()) return null;
      const PAID = ['paid', 'confirmed', 'processing', 'shipped', 'delivered'];
      const [profRes, ordRes] = await Promise.all([
        db().from('profiles').select('id,first_name,last_name,email,role,created_at').neq('role', 'admin').order('created_at', { ascending: false }),
        db().from('orders').select('profile_id,total,status').not('profile_id', 'is', null).in('status', PAID),
      ]);
      if (profRes.error) { console.warn('Admin.getCustomers:', profRes.error.message); return null; }
      const statsMap = {};
      (ordRes.data || []).forEach(o => {
        if (!statsMap[o.profile_id]) statsMap[o.profile_id] = { count: 0, ltv: 0 };
        statsMap[o.profile_id].count++;
        statsMap[o.profile_id].ltv += Number(o.total);
      });
      return (profRes.data || []).map(c => {
        const s = statsMap[c.id] || { count: 0, ltv: 0 };
        return {
          dbId: c.id,
          id: 'C-' + c.id.slice(0, 6).toUpperCase(),
          name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Cliente',
          email: c.email || '—',
          orders: s.count,
          ltv: s.ltv,
          status: s.count > 1 ? 'Returning' : s.count === 1 ? 'New' : 'Sem pedidos',
          joined: new Date(c.created_at).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        };
      });
    },

    async getOrders({ limit = 100 } = {}) {
      if (!configured()) return null;
      const { data, error } = await db()
        .from('orders_full')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) { console.warn('Admin.getOrders:', error.message); return null; }
      const STAT = {
        pending: 'Pending', paid: 'Paid', confirmed: 'Paid',
        processing: 'Em preparação', shipped: 'Enviado', delivered: 'Entregue',
        cancelled: 'Cancelled', refunded: 'Refunded',
      };
      const FULL = { unfulfilled: 'Unfulfilled', fulfilled: 'Fulfilled', on_hold: 'On hold', returned: 'Returned' };
      const CHAN = { web: 'Web', mobile: 'Mobile', instagram: 'Instagram', other: 'Outro' };
      const PAID_STATUSES = ['paid', 'confirmed', 'processing', 'shipped', 'delivered'];
      return data.map(o => ({
        dbId: o.id,
        id: o.order_ref ? '#' + o.order_ref : '#KR-' + o.id.slice(-5).toUpperCase(),
        isPaid: PAID_STATUSES.includes(o.status),
        customer: o.customer_name || '—',
        email: o.profile_email || o.guest_email || '',
        date: new Date(o.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        items: Number(o.total_items) || 0,
        total: Number(o.total),
        status: STAT[o.status] || o.status,
        fulfillment: FULL[o.fulfillment_status] || o.fulfillment_status,
        channel: CHAN[o.channel] || o.channel,
        rawStatus: o.status,
        rawFulfillment: o.fulfillment_status,
        shippingName: o.shipping_name,
        shippingAddress: o.shipping_address,
        notes: o.notes,
        trackingNumber: o.tracking_number || '',
        trackingUrl: o.tracking_url || '',
      }));
    },

    async getKPIs() {
      if (!configured()) return null;
      try {
        const [prod, cust, ord] = await Promise.all([
          db().from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          db().from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
          db().from('orders').select('id,total,status'),
        ]);
        const paid = (ord.data || []).filter(o => ['paid','confirmed','processing','shipped','delivered'].includes(o.status));
        const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
        return {
          products: prod.count || 0,
          customers: cust.count || 0,
          orders: (ord.data || []).length,
          revenue,
          avgTicket: paid.length ? revenue / paid.length : 0,
          paidCount: paid.length,
        };
      } catch { return null; }
    },

    async getSalesSeries() {
      if (!configured()) return null;
      const { data } = await db()
        .from('orders')
        .select('created_at,total')
        .in('status', ['paid','confirmed','processing','shipped','delivered'])
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString());
      if (!data?.length) return null;
      const map = {};
      data.forEach(o => {
        const k = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[k] = (map[k] || 0) + Number(o.total);
      });
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(Date.now() - (13 - i) * 86400000);
        const k = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { d: k, v: map[k] || 0 };
      });
    },

    async updateOrderStatus(dbId, status) {
      const { error } = await db().from('orders')
        .update({ status, updated_at: new Date().toISOString() }).eq('id', dbId);
      if (error) throw error;
    },

    async updateOrderFulfillment(dbId, fulfillment_status) {
      const { error } = await db().from('orders')
        .update({ fulfillment_status, updated_at: new Date().toISOString() }).eq('id', dbId);
      if (error) throw error;
    },

    async updateStock(dbId, stock_quantity) {
      const { error } = await db().from('products').update({ stock_quantity }).eq('id', dbId);
      if (error) throw error;
    },

    async getOrderItems(orderId) {
      if (!configured()) return [];
      const { data, error } = await db()
        .from('order_items')
        .select('id,product_name,product_sku,color_label,size_label,qty,unit_price,total_price')
        .eq('order_id', orderId);
      if (error) return [];
      return data || [];
    },

    async updateTracking(dbId, trackingNumber, trackingUrl) {
      const { error } = await db().from('orders')
        .update({ tracking_number: trackingNumber || null, tracking_url: trackingUrl || null, updated_at: new Date().toISOString() })
        .eq('id', dbId);
      if (error) throw error;
    },

    async getAnalytics() {
      if (!configured()) return null;
      try {
        const PAID = ['paid', 'confirmed', 'processing', 'shipped', 'delivered'];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const w7  = new Date(Date.now() -  7 * 86400000).toISOString();
        const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
        const d60 = new Date(Date.now() - 60 * 86400000).toISOString();

        const [cur30, prev30, allItems] = await Promise.all([
          db().from('orders').select('id,status,fulfillment_status,channel,total,created_at').in('status', PAID).gte('created_at', d30),
          db().from('orders').select('total').in('status', PAID).gte('created_at', d60).lt('created_at', d30),
          db().from('order_items').select('product_name,product_sku,qty,unit_price'),
        ]);

        const data30   = cur30.data  || [];
        const dataPrev = prev30.data || [];
        const todayArr = data30.filter(o => o.created_at >= todayStart);
        const week7Arr = data30.filter(o => o.created_at >= w7);

        const sum = arr => arr.reduce((s, o) => s + Number(o.total), 0);
        const rev30 = sum(data30), revPrev = sum(dataPrev);
        const delta30 = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;

        const byChannel = {};
        data30.forEach(o => {
          const ch = o.channel || 'web';
          byChannel[ch] = (byChannel[ch] || 0) + Number(o.total);
        });

        const byFulfillment = {};
        data30.forEach(o => {
          const fs = o.fulfillment_status || 'unfulfilled';
          byFulfillment[fs] = (byFulfillment[fs] || 0) + 1;
        });

        const prodMap = {};
        (allItems.data || []).forEach(it => {
          const k = it.product_name;
          if (!prodMap[k]) prodMap[k] = { name: k, sku: it.product_sku || '', qty: 0, revenue: 0 };
          prodMap[k].qty     += Number(it.qty) || 0;
          prodMap[k].revenue += (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
        });
        const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const dailySeries = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(Date.now() - (29 - i) * 86400000);
          return { d: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), v: 0 };
        });
        data30.forEach(o => {
          const k = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const s = dailySeries.find(x => x.d === k);
          if (s) s.v += Number(o.total);
        });

        return {
          today: sum(todayArr), week: sum(week7Arr), month: rev30, prevMonth: revPrev,
          delta30, avgOrder: data30.length ? rev30 / data30.length : 0,
          orderCount30d: data30.length,
          byChannel: Object.entries(byChannel).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v),
          byFulfillment: Object.entries(byFulfillment).map(([k, v]) => ({ k, v })),
          topProducts, dailySeries,
        };
      } catch { return null; }
    },

    async getCustomerDetail(profileId) {
      if (!configured()) return [];
      const { data } = await db()
        .from('orders_full')
        .select('id,order_ref,status,fulfillment_status,total,created_at,total_items')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      return data || [];
    },

    async deleteProducts(ids) {
      const { error } = await db().from('products').delete().in('id', ids);
      if (error) throw error;
    },

    async getProductImages(productId) {
      const { data } = await db().from('product_images')
        .select('id,url,alt,sort_order').eq('product_id', productId).order('sort_order');
      return data || [];
    },

    async uploadProductImage(productId, file) {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: upErr } = await db().storage
        .from('products').upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = db().storage.from('products').getPublicUrl(path);
      const { error: insErr } = await db().from('product_images').insert({
        product_id: productId,
        url: urlData.publicUrl,
        alt: file.name.replace(/\.[^.]+$/, ''),
        sort_order: Date.now(),
      });
      if (insErr) throw insErr;
      return urlData.publicUrl;
    },

    async deleteProductImage(imageId, url) {
      await db().from('product_images').delete().eq('id', imageId);
      try {
        const path = url.split('/object/public/products/').pop();
        if (path) await db().storage.from('products').remove([path]);
      } catch {}
    },
  };

  // ── useData hook ─────────────────────────────────────────────────────────────
  function useData(fetcher, fallback) {
    const [state, setState] = useState({ data: fallback, loading: true });
    const load = useCallback(async () => {
      setState(s => ({ ...s, loading: true }));
      const result = await fetcher().catch(() => null);
      setState({ data: result ?? fallback, loading: false });
    }, []);
    useEffect(() => { load(); }, [load]);
    return { ...state, reload: load };
  }

  // ── Utilities ────────────────────────────────────────────────────────────────
  const fmtEUR = n => Number(n).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  const fmtNum = n => Number(n).toLocaleString('pt-PT');

  const statusToChip = s => {
    const m = { Paid: 'chip-success', Pending: 'chip-warning', Cancelled: 'chip-neutral',
                Refunded: 'chip-neutral', Fulfilled: 'chip-success', Unfulfilled: 'chip-warning',
                'On hold': 'chip-error', Returned: 'chip-neutral',
                VIP: 'chip-info', New: 'chip-success', Returning: 'chip-info', 'Sem pedidos': 'chip-neutral',
                'Em preparação': 'chip-info', Enviado: 'chip-info', Entregue: 'chip-success' };
    return <span className={`chip ${m[s] || 'chip-neutral'}`}><span className="dot"/>{s}</span>;
  };

  // ── Icons ─────────────────────────────────────────────────────────────────────
  const Ic = ({ size = 20, stroke = 'currentColor', sw = 1.75, children, ...r }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...r}>
      {children}
    </svg>
  );
  const IcHome     = p => <Ic {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></Ic>;
  const IcBag      = p => <Ic {...p}><path d="M6 7h12l-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></Ic>;
  const IcBox      = p => <Ic {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></Ic>;
  const IcHanger   = p => <Ic {...p}><path d="M12 8a2 2 0 1 1 2-2"/><path d="m12 8 9 6.5a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L12 8Z"/></Ic>;
  const IcUsers    = p => <Ic {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 20a6.5 6.5 0 0 0-4-6"/></Ic>;
  const IcChart    = p => <Ic {...p}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></Ic>;
  const IcSettings = p => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Ic>;
  const IcSearch   = p => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>;
  const IcBell     = p => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></Ic>;
  const IcPlus     = p => <Ic {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Ic>;
  const IcChevDown = p => <Ic {...p}><path d="m6 9 6 6 6-6"/></Ic>;
  const IcChevRight= p => <Ic {...p}><path d="m9 6 6 6-6 6"/></Ic>;
  const IcChevLeft = p => <Ic {...p}><path d="m15 6-6 6 6 6"/></Ic>;
  const IcArrowUp  = p => <Ic {...p}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></Ic>;
  const IcArrowDown= p => <Ic {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></Ic>;
  const IcClose    = p => <Ic {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Ic>;
  const IcFilter   = p => <Ic {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></Ic>;
  const IcExport   = p => <Ic {...p}><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></Ic>;
  const IcMore     = p => <Ic {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Ic>;
  const IcEdit     = p => <Ic {...p}><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m13 7 4 4"/></Ic>;
  const IcRefresh  = p => <Ic {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></Ic>;
  const IcCheck    = p => <Ic {...p}><path d="m5 12 5 5L20 7"/></Ic>;
  const IcTruck    = p => <Ic {...p}><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Ic>;
  const IcReturn   = p => <Ic {...p}><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></Ic>;
  const IcArrowLeft= p => <Ic {...p}><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></Ic>;
  const IcMoon     = p => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></Ic>;
  const IcSun      = p => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></Ic>;
  const IcStar     = p => <Ic {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6L12 17l-5.4 2.8 1-6L3.2 9.5l6.1-.9L12 3Z"/></Ic>;
  const IcBag2     = p => <Ic {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></Ic>;
  const IcTrash    = p => <Ic {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Ic>;
  const IcImage    = p => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Ic>;

  // ── Mock fallback data ────────────────────────────────────────────────────────
  const MOCK = {
    products: [
      { dbId: null, id: 'KR-001', name: 'Linen Wrap Blazer', collection: 'Mulher / Resort 26', price: 289, stock: 42, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-2)', accent: 'var(--swatch-6)', sizes: ['XS','S','M','L'] },
      { dbId: null, id: 'KR-002', name: 'Pleated Midi Skirt', collection: 'Mulher / Resort 26', price: 168, stock: 78, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-3)', accent: 'var(--swatch-6)', sizes: ['S','M','L'] },
      { dbId: null, id: 'KR-003', name: 'Cotton Poplin Shirt', collection: 'Homem / Core', price: 124, stock: 8, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-6)', accent: 'var(--swatch-1)', sizes: ['XS','S','M','L','XL'] },
      { dbId: null, id: 'KR-004', name: 'Tailored Wide Trouser', collection: 'Homem / Core', price: 198, stock: 0, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-1)', accent: 'var(--swatch-2)', sizes: ['S','M','L'] },
      { dbId: null, id: 'KR-005', name: 'Silk Slip Dress', collection: 'Mulher / Evening', price: 348, stock: 24, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-5)', accent: 'var(--swatch-3)', sizes: ['XS','S','M'] },
      { dbId: null, id: 'KR-006', name: 'Merino Crew Knit', collection: 'Mulher / Core', price: 156, stock: 0, lowStockThreshold: 10, sold: 0, color: 'var(--swatch-4)', accent: 'var(--swatch-6)', sizes: ['S','M','L','XL'] },
    ],
    customers: [
      { dbId: null, id: 'C-0001', name: 'Helena Marçal', email: 'helena@email.com', orders: 5, ltv: 1200, status: 'Returning', joined: 'Jan 2026' },
      { dbId: null, id: 'C-0002', name: 'Júlia Andrade', email: 'julia@email.com', orders: 2, ltv: 480, status: 'New', joined: 'Mar 2026' },
    ],
    orders: [],
    kpis: { products: 0, customers: 0, orders: 0, revenue: 0, avgTicket: 0, paidCount: 0 },
    salesSeries: Array.from({ length: 14 }, (_, i) => ({
      d: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 0,
    })),
    analytics: {
      today: 0, week: 0, month: 0, prevMonth: 0, delta30: null, avgOrder: 0, orderCount30d: 0,
      byChannel: [], byFulfillment: [], topProducts: [],
      dailySeries: Array.from({ length: 30 }, (_, i) => ({
        d: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        v: 0,
      })),
    },
  };

  // ── Base components ───────────────────────────────────────────────────────────
  const Sparkline = ({ data, color = 'var(--primary)', width = 88, height = 32 }) => {
    const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
    const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / r) * (height - 4) - 2]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const id = 'sp' + Math.random().toString(36).slice(2, 7);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient></defs>
        <path d={path + ` L ${width} ${height} L 0 ${height} Z`} fill={`url(#${id})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const ProductThumb = ({ product, size = 40 }) => (
    <div style={{ width: size, height: size, borderRadius: 8,
                  background: product.image ? 'var(--surface-container)' : product.color,
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}>
      {product.image
        ? <img src={product.image} alt={product.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        : <div style={{ position: 'absolute', inset: '40% 0 0 60%', background: product.accent, borderTopLeftRadius: 999 }}/>
      }
    </div>
  );

  const Card = ({ title, action, children, padded = true, style }) => (
    <section className="card" style={style}>
      {title && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                         padding: '16px 20px', borderBottom: '1px solid var(--hairline)' }}>
          <span className="h3">{title}</span>{action}
        </header>
      )}
      <div style={{ padding: padded ? 20 : 0 }}>{children}</div>
    </section>
  );

  const KPICard = ({ label, value, delta, deltaLabel, sparkline, accent, loading }) => {
    const pos = delta == null || delta >= 0;
    return (
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="overline" style={{ fontSize: 11 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          {loading
            ? <div style={{ height: 32, width: 120, background: 'var(--surface-container)', borderRadius: 6, animation: 'adm-fade 1s ease infinite alternate' }}/>
            : <span className="tabular" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}>{value}</span>}
          {sparkline && <Sparkline data={sparkline} color={accent || 'var(--primary)'}/>}
        </div>
        {delta != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600, color: pos ? 'var(--success)' : 'var(--error)' }}>
              {pos ? <IcArrowUp size={12} sw={2.4}/> : <IcArrowDown size={12} sw={2.4}/>}
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="muted" style={{ fontSize: 12 }}>{deltaLabel || 'vs. 14d anteriores'}</span>
          </div>
        )}
      </div>
    );
  };

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const Toast = ({ msg, type, clear }) => {
    useEffect(() => { if (!msg) return; const t = setTimeout(clear, 3200); return () => clearTimeout(t); }, [msg]);
    if (!msg) return null;
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    background: type === 'error' ? 'var(--error)' : 'var(--inverse-surface)',
                    color: type === 'error' ? '#fff' : 'var(--inverse-on-surface)',
                    padding: '12px 18px', borderRadius: 8, boxShadow: 'var(--shadow-overlay)',
                    fontSize: 13, fontWeight: 500, animation: 'adm-fade 200ms ease both' }}>
        {msg}
      </div>
    );
  };

  // ── Restock Modal ─────────────────────────────────────────────────────────────
  const RestockModal = ({ product, onClose, onSave }) => {
    const [qty, setQty] = useState(product.stock);
    const [saving, setSaving] = useState(false);
    const save = async () => {
      if (!product.dbId) { onClose(); return; }
      setSaving(true);
      await onSave(product.dbId, qty);
      setSaving(false);
      onClose();
    };
    return (
      <div className="animate-overlay modal-bg" onClick={onClose} style={{ position: 'fixed', inset: 0 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: 28, width: 360, boxShadow: 'var(--shadow-overlay)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="h3">Repor stock</span>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 20 }}>{product.id}</div>
          <div style={{ marginBottom: 8 }}>
            <label className="overline" style={{ display: 'block', marginBottom: 8 }}>Novo stock total</label>
            <div className="field" style={{ height: 44, fontSize: 16 }}>
              <input type="number" min="0" value={qty} onChange={e => setQty(Number(e.target.value))} style={{ fontSize: 18, fontWeight: 600 }} autoFocus/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            {[10, 25, 50, 100].map(n => (
              <button key={n} className="btn btn-secondary btn-sm" onClick={() => setQty(n)}>+{n}</button>
            ))}
          </div>
          {!product.dbId && <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>Sem ligação à BD — só actualiza localmente.</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
              {saving ? 'A guardar…' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Confirm Modal ─────────────────────────────────────────────────────────────
  const ConfirmModal = ({ title, body, confirmLabel = 'Confirmar', onConfirm, onClose, danger = false }) => (
    <div className="animate-overlay" onClick={onClose}
         style={{ position: 'fixed', inset: 0, zIndex: 9100,
                  background: 'rgba(16,24,40,0.48)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, padding: 28, width: 400, boxShadow: 'var(--shadow-overlay)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="h3">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
        </div>
        {body && <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 24, lineHeight: '20px' }}>{body}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Charts ────────────────────────────────────────────────────────────────────
  const AreaChart = ({ data, height = 240, color = 'var(--primary)' }) => {
    const pad = { top: 16, right: 12, bottom: 28, left: 52 };
    const W = 720, H = height, iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
    const vals = data.map(d => d.v);
    const max = Math.max(...vals) || 1000;
    const roundedMax = Math.ceil(max / 1000) * 1000;
    const xs = i => pad.left + (i / (data.length - 1)) * iw;
    const ys = v => pad.top + ih - (v / roundedMax) * ih;
    const line = data.map((d, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(d.v).toFixed(1)).join(' ');
    const ticks = [0, roundedMax * 0.25, roundedMax * 0.5, roundedMax * 0.75, roundedMax];
    const [hover, setHover] = useState(null);
    const onMove = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const i = Math.round(((((e.clientX - rect.left) / rect.width) * W) - pad.left) / iw * (data.length - 1));
      if (i >= 0 && i < data.length) setHover(i);
    };
    const hasData = vals.some(v => v > 0);
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {!hasData && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                        color: 'var(--on-surface-variant)', fontSize: 13, pointerEvents: 'none', zIndex: 1 }}>
            Sem dados de vendas ainda — adiciona pedidos para ver o gráfico.
          </div>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ opacity: hasData ? 1 : 0.3 }}>
          <defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient></defs>
          {ticks.map((v, i) => (
            <g key={i}>
              <line x1={pad.left} x2={W - pad.right} y1={ys(v)} y2={ys(v)} stroke="var(--hairline)" strokeDasharray={i === 0 ? '0' : '3 4'}/>
              <text x={pad.left - 8} y={ys(v) + 4} textAnchor="end" fontSize="11" fill="var(--on-surface-variant)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
              </text>
            </g>
          ))}
          <path d={line + ` L ${xs(data.length - 1)} ${pad.top + ih} L ${xs(0)} ${pad.top + ih} Z`} fill="url(#ag1)"/>
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {data.map((d, i) => i % 2 === 0
            ? <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--on-surface-variant)">{d.d}</text>
            : null)}
          {hover !== null && <>
            <line x1={xs(hover)} x2={xs(hover)} y1={pad.top} y2={pad.top + ih} stroke="var(--outline-variant)" strokeDasharray="3 3"/>
            <circle cx={xs(hover)} cy={ys(data[hover].v)} r="5" fill={color} stroke="var(--surface-container-lowest)" strokeWidth="2"/>
          </>}
        </svg>
        {hover !== null && (
          <div style={{ position: 'absolute', left: `${(xs(hover) / W) * 100}%`, top: 8, transform: 'translateX(-50%)',
                        background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
                        padding: '6px 10px', borderRadius: 6, fontSize: 12,
                        whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: 'var(--shadow-overlay)' }}>
            <div style={{ fontWeight: 600 }}>{data[hover].d}</div>
            <div style={{ opacity: 0.85 }}>{fmtEUR(data[hover].v)}</div>
          </div>
        )}
      </div>
    );
  };

  const BarRow = ({ label, value, max, count, accent = 'var(--primary)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 130, fontSize: 13 }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${(value / (max || 1)) * 100}%`, height: '100%', background: accent, borderRadius: 999, transition: 'width 320ms ease' }}/>
      </div>
      <span className="tabular" style={{ width: 40, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{value}</span>
      {count !== undefined && <span className="muted tabular" style={{ width: 64, textAlign: 'right', fontSize: 12 }}>{count} un.</span>}
    </div>
  );

  // ── Table styles ──────────────────────────────────────────────────────────────
  const thS = { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--hairline)',
                color: 'var(--on-surface-variant)' };
  const tdS = { padding: '13px 16px', fontSize: 13, borderBottom: '1px solid var(--hairline)' };

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  const Sidebar = ({ active, onNavigate, onExit }) => {
    const nav = [
      { id: 'overview',  label: 'Visão Geral',  Icon: IcHome },
      { id: 'orders',    label: 'Pedidos',       Icon: IcBag },
      { id: 'products',  label: 'Produtos',      Icon: IcHanger },
      { id: 'customers', label: 'Clientes',      Icon: IcUsers },
      { id: 'analytics', label: 'Analytics',     Icon: IcChart },
    ];
    return (
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--surface-container-lowest)',
                      borderRight: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em' }}>Kara</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Admin</span>
        </div>
        <nav style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(n => {
            const on = active === n.id;
            return (
              <button key={n.id} onClick={() => onNavigate(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: 0,
                background: on ? 'var(--primary-soft-2)' : 'transparent',
                color: on ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontSize: 13, fontWeight: on ? 600 : 500, cursor: 'pointer', textAlign: 'left',
                position: 'relative', transition: 'background 100ms',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                {on && <span style={{ position: 'absolute', left: -10, top: 6, bottom: 6, width: 3, background: 'var(--primary)', borderRadius: '0 4px 4px 0' }}/>}
                <n.Icon size={17}/> {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: 10, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => onNavigate('settings')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 0, background: active === 'settings' ? 'var(--primary-soft-2)' : 'transparent', color: active === 'settings' ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
            <IcSettings size={17}/> Definições
          </button>
          <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 0, background: 'transparent', color: 'var(--on-surface-variant)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
            <IcArrowLeft size={17}/> Voltar à loja
          </button>
        </div>
      </aside>
    );
  };

  // ── Topbar ────────────────────────────────────────────────────────────────────
  const Topbar = ({ dark, setDark, onReload }) => (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px',
                     borderBottom: '1px solid var(--hairline)', background: 'var(--surface)',
                     position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
      <div className="field" style={{ width: 280, height: 34 }}>
        <IcSearch size={14} stroke="var(--on-surface-variant)"/>
        <input placeholder="Pesquisar…"/>
      </div>
      <div style={{ flex: 1 }}/>
      {onReload && <button className="btn btn-ghost btn-icon" onClick={onReload} title="Actualizar dados"><IcRefresh size={16}/></button>}
      <button className="btn btn-secondary btn-icon" onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo escuro'}>
        {dark ? <IcSun size={17}/> : <IcMoon size={17}/>}
      </button>
      <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }}>
        <IcBell size={17}/>
        <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 999, background: 'var(--error)', border: '2px solid var(--surface-container-lowest)' }}/>
      </button>
    </header>
  );

  // ── Overview ──────────────────────────────────────────────────────────────────
  const Overview = ({ onNavigate, onOpenOrder, onOpenProduct, showToast }) => {
    const { data: kpis, loading: kL } = useData(AdminAPI.getKPIs, MOCK.kpis);
    const { data: orders } = useData(AdminAPI.getOrders, MOCK.orders);
    const { data: products } = useData(AdminAPI.getProducts, MOCK.products);
    const { data: series } = useData(AdminAPI.getSalesSeries, MOCK.salesSeries);

    const lowStock = (products || []).filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const outOfStock = (products || []).filter(p => p.stock === 0);

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="h1" style={{ margin: 0 }}>Visão Geral</h1>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          <KPICard label="Receita total" value={fmtEUR(kpis?.revenue || 0)} loading={kL}
            sparkline={series?.map(d => d.v)} accent="var(--primary)"/>
          <KPICard label="Pedidos" value={fmtNum(kpis?.orders || 0)} loading={kL}
            sparkline={[2,3,2,4,5,4,3,5,6,5,7,8,7,kpis?.orders || 0]} accent="var(--swatch-4)"/>
          <KPICard label="Produtos activos" value={fmtNum(kpis?.products || 0)} loading={kL}
            sparkline={null} accent="var(--swatch-2)"/>
          <KPICard label="Clientes" value={fmtNum(kpis?.customers || 0)} loading={kL}
            sparkline={null} accent="var(--swatch-5)"/>
        </div>

        {/* Revenue chart */}
        <Card title="Receita (últimos 14 dias)" action={
          <span className="muted" style={{ fontSize: 12 }}>{configured() ? 'BD ligada' : 'Dados de demonstração'}</span>
        }>
          <AreaChart data={series || MOCK.salesSeries}/>
        </Card>

        {/* Recent orders + stock alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
          <Card title="Pedidos recentes" action={
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('orders')}>
              Ver todos <IcChevRight size={14}/>
            </button>
          } padded={false}>
            {(!orders || orders.length === 0)
              ? <div className="muted" style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13 }}>Ainda sem pedidos.</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      {['Pedido','Cliente','Total','Estado','Entrega'].map(h => <th key={h} style={thS}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(orders || []).slice(0, 6).map(o => (
                      <tr key={o.id} onClick={() => onOpenOrder(o)} style={{ cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={tdS}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                        <td style={tdS}>{o.customer}</td>
                        <td style={{ ...tdS, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(o.total)}</td>
                        <td style={tdS}>{statusToChip(o.status)}</td>
                        <td style={tdS}>{statusToChip(o.fulfillment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </Card>

          <Card title="Alertas de stock">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {outOfStock.length === 0 && lowStock.length === 0 && (
                <div className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sem alertas activos.</div>
              )}
              {outOfStock.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onOpenProduct(p)}>
                  <ProductThumb product={p} size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--error)' }}>Sem stock</div>
                  </div>
                  <span className="chip chip-error" style={{ flexShrink: 0 }}>0</span>
                </div>
              ))}
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onOpenProduct(p)}>
                  <ProductThumb product={p} size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>Stock baixo</div>
                  </div>
                  <span className="chip chip-warning" style={{ flexShrink: 0 }}>{p.stock}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top products */}
        {(products || []).length > 0 && (
          <Card title="Catálogo (top)" action={
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('products')}>
              Ver todos <IcChevRight size={14}/>
            </button>
          }>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {(products || []).slice(0, 4).map(p => (
                <div key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ aspectRatio: '4/5', background: p.image ? 'var(--surface-container)' : p.color, borderRadius: 10, position: 'relative', overflow: 'hidden',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'transform 200ms' }}
                       onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {p.image && <img src={p.image} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>}
                    <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '40%', background: `linear-gradient(180deg,transparent,${p.image ? 'rgba(0,0,0,0.55)' : p.accent})`, opacity: 0.55 }}/>
                    <span className="chip chip-neutral" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.85)', fontSize: 10 }}>{p.collection.split('/').pop()?.trim() || p.collection}</span>
                    {p.stock === 0 && <span className="chip chip-error" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>Esgotado</span>}
                    {p.stock > 0 && p.stock <= p.lowStockThreshold && <span className="chip chip-warning" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>Baixo</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span className="muted" style={{ fontSize: 12 }}>{p.stock} em stock</span>
                      <span className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>{fmtEUR(p.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ── Orders ────────────────────────────────────────────────────────────────────
  const Orders = ({ onOpenOrder, showToast }) => {
    const { data: orders, loading, reload } = useData(AdminAPI.getOrders, MOCK.orders);
    const [tab, setTab] = useState('Todos');
    const [q, setQ] = useState('');

    const tabs = ['Todos','Unfulfilled','Fulfilled','On hold'];
    const counts = {
      Todos: (orders || []).length,
      Unfulfilled: (orders || []).filter(o => o.fulfillment === 'Unfulfilled').length,
      Fulfilled: (orders || []).filter(o => o.fulfillment === 'Fulfilled').length,
      'On hold': (orders || []).filter(o => o.fulfillment === 'On hold').length,
    };

    const filtered = (orders || []).filter(o => {
      const matchTab = tab === 'Todos' || o.fulfillment === tab;
      const matchQ = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Pedidos</h1>
            <div className="muted" style={{ marginTop: 4 }}>{(orders || []).length} pedidos no total</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={reload}><IcRefresh size={15}/> Actualizar</button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--hairline)', padding: '0 6px' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '12px 14px', border: 0, background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === t ? 600 : 500,
                color: tab === t ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t} <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: tab === t ? 'var(--primary-soft-2)' : 'var(--surface-container)', color: tab === t ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{counts[t]}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--hairline)' }}>
            <div className="field" style={{ width: 300 }}>
              <IcSearch size={14} stroke="var(--on-surface-variant)"/>
              <input placeholder="Pesquisar pedidos ou clientes…" value={q} onChange={e => setQ(e.target.value)}/>
            </div>
          </div>
          {loading ? (
            <div className="muted" style={{ padding: '40px 20px', textAlign: 'center' }}>A carregar…</div>
          ) : filtered.length === 0 ? (
            <div className="muted" style={{ padding: '40px 20px', textAlign: 'center' }}>
              {orders?.length === 0 ? 'Ainda sem pedidos. Corre o SQL de exemplo em sql/admin_schema.sql.' : 'Sem resultados.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Pedido','Cliente','Data','Itens','Total','Pagamento','Entrega','Canal',''].map(h => <th key={h} style={thS}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} onClick={() => onOpenOrder({ ...o, reload })} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdS}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.id}</span></td>
                    <td style={tdS}>{o.customer}</td>
                    <td style={{ ...tdS, color: 'var(--on-surface-variant)', fontSize: 12 }}>{o.date}</td>
                    <td style={{ ...tdS, fontVariantNumeric: 'tabular-nums' }}>{o.items}</td>
                    <td style={{ ...tdS, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(o.total)}</td>
                    <td style={tdS}>{statusToChip(o.status)}</td>
                    <td style={tdS}>{statusToChip(o.fulfillment)}</td>
                    <td style={{ ...tdS, color: 'var(--on-surface-variant)' }}>{o.channel}</td>
                    <td style={tdS}><IcChevRight size={14} stroke="var(--outline)"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ── Order Panel ───────────────────────────────────────────────────────────────
  const OrderPanel = ({ order, onClose, showToast }) => {
    const [busy, setBusy] = useState(false);
    const [items, setItems] = useState([]);
    const [tracking, setTracking] = useState(order.trackingNumber || '');
    const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');
    const [savingTracking, setSavingTracking] = useState(false);

    useEffect(() => {
      if (!order.dbId) return;
      AdminAPI.getOrderItems(order.dbId).then(setItems);
    }, [order.dbId]);

    const act = async (fn, msg) => {
      if (!order.dbId) { showToast('Sem ligação à BD', 'error'); return; }
      setBusy(true);
      try { await fn(); showToast(msg); if (order.reload) await order.reload(); onClose(); }
      catch (e) { showToast('Erro: ' + e.message, 'error'); }
      finally { setBusy(false); }
    };
    const markPaid      = () => act(() => AdminAPI.updateOrderStatus(order.dbId, 'paid'), 'Pedido marcado como pago.');
    const markFulfilled = () => act(() => AdminAPI.updateOrderFulfillment(order.dbId, 'fulfilled'), 'Pedido enviado.');
    const markRefunded  = () => act(() => AdminAPI.updateOrderStatus(order.dbId, 'refunded'), 'Reembolso registado.');
    const markCancelled = () => act(() => AdminAPI.updateOrderStatus(order.dbId, 'cancelled'), 'Pedido cancelado.');
    const saveTracking  = async () => {
      if (!order.dbId) return;
      setSavingTracking(true);
      try { await AdminAPI.updateTracking(order.dbId, tracking, trackingUrl); showToast('Tracking actualizado.'); }
      catch (e) { showToast('Erro: ' + e.message, 'error'); }
      finally { setSavingTracking(false); }
    };

    const addr = order.shippingAddress || {};

    return (
      <>
        <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.32)', zIndex: 50 }}/>
        <aside className="animate-slide-right" style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 520,
                                                        background: 'var(--surface-container-lowest)',
                                                        boxShadow: '-12px 0 32px rgba(16,24,40,0.1)',
                                                        zIndex: 51, display: 'flex', flexDirection: 'column',
                                                        borderLeft: '1px solid var(--hairline)' }}>
          {/* Header */}
          <header style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="h2">{order.id}</span>
                {statusToChip(order.status)}{statusToChip(order.fulfillment)}
              </div>
              <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>{order.date} · {order.channel}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* KPI summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[['Cliente', order.customer], ['Canal', order.channel], ['Total', fmtEUR(order.total)]].map(([l, v]) => (
                <div key={l} style={{ padding: '10px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="overline" style={{ fontSize: 10, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
            {order.email && (
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span style={{ marginRight: 6 }}>✉</span>{order.email}
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div style={{ padding: '10px 14px', background: 'var(--warning-soft)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>Nota: </span>{order.notes}
              </div>
            )}

            {/* Order items */}
            <div>
              <div className="overline" style={{ marginBottom: 10 }}>Artigos ({items.length || order.items})</div>
              {items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
                  {items.map((it, i) => (
                    <div key={it.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                                    background: i % 2 === 0 ? 'var(--surface-container-lowest)' : 'var(--surface-container-low)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{it.product_name}</div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          {[it.product_sku, it.color_label, it.size_label].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', flexShrink: 0 }}>×{it.qty}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, minWidth: 72, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtEUR(it.total_price ?? Number(it.qty) * Number(it.unit_price))}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 14px', background: 'var(--surface-container)', fontWeight: 700, fontSize: 13 }}>
                    <span>Total</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(order.total)}</span>
                  </div>
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 13 }}>{order.dbId ? 'A carregar artigos…' : 'Sem dados de artigos em modo demo.'}</div>
              )}
            </div>

            {/* Shipping address */}
            {(order.shippingName || addr.address1) && (
              <div>
                <div className="overline" style={{ marginBottom: 8 }}>Endereço de envio</div>
                <div style={{ fontSize: 13, lineHeight: '22px', padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  {order.shippingName && <div style={{ fontWeight: 600 }}>{order.shippingName}</div>}
                  {addr.address1  && <div className="muted">{addr.address1}</div>}
                  {addr.address2  && <div className="muted">{addr.address2}</div>}
                  {(addr.city || addr.postal) && <div className="muted">{[addr.city, addr.postal].filter(Boolean).join(' ')}</div>}
                  {addr.country   && <div className="muted">{addr.country}</div>}
                  {addr.phone     && <div className="muted">{addr.phone}</div>}
                </div>
              </div>
            )}

            {/* Tracking */}
            <div>
              <div className="overline" style={{ marginBottom: 10 }}>Tracking</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <input placeholder="Número de tracking" value={tracking} onChange={e => setTracking(e.target.value)}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <input placeholder="URL de tracking (opcional)" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)}/>
                  </div>
                  <button className="btn btn-secondary" onClick={saveTracking} disabled={savingTracking || !order.dbId} style={{ flexShrink: 0 }}>
                    {savingTracking ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="overline" style={{ marginBottom: 10 }}>Acções</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!order.isPaid && order.rawStatus !== 'cancelled' && order.rawStatus !== 'refunded' && (
                  <button className="btn btn-success" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={markPaid} disabled={busy}>
                    <IcCheck size={16}/> Marcar como pago
                  </button>
                )}
                {order.rawFulfillment === 'unfulfilled' && order.isPaid && (
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={markFulfilled} disabled={busy}>
                    <IcTruck size={16}/> Marcar como enviado
                  </button>
                )}
                {order.isPaid && (
                  <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={markRefunded} disabled={busy}>
                    <IcReturn size={16}/> Processar reembolso
                  </button>
                )}
                {order.rawStatus !== 'cancelled' && order.rawStatus !== 'refunded' && (
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 10, color: 'var(--error)' }} onClick={markCancelled} disabled={busy}>
                    <IcClose size={16}/> Cancelar pedido
                  </button>
                )}
                {!order.dbId && <div className="muted" style={{ fontSize: 12 }}>Ligação à BD necessária para estas acções.</div>}
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  };

  // ── Product Images ────────────────────────────────────────────────────────────
  const ProductImages = ({ productId, showToast }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const load = useCallback(async () => {
      const imgs = await AdminAPI.getProductImages(productId);
      setImages(imgs);
    }, [productId]);

    useEffect(() => { load(); }, [load]);

    const handleUpload = async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!configured()) { showToast('Sem ligação à BD.', 'error'); return; }
      setUploading(true);
      try {
        await AdminAPI.uploadProductImage(productId, file);
        await load();
        showToast('Imagem adicionada.');
      } catch(err) { showToast('Erro no upload: ' + err.message, 'error'); }
      finally { setUploading(false); e.target.value = ''; }
    };

    const handleDelete = async img => {
      try {
        await AdminAPI.deleteProductImage(img.id, img.url);
        setImages(prev => prev.filter(i => i.id !== img.id));
        showToast('Imagem removida.');
      } catch(err) { showToast('Erro ao remover: ' + err.message, 'error'); }
    };

    return (
      <div>
        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {images.map(img => (
              <div key={img.id} style={{ position: 'relative', width: 84, height: 84, borderRadius: 8, overflow: 'hidden',
                                         border: '1px solid var(--outline-variant)', flexShrink: 0 }}>
                <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                <button onClick={() => handleDelete(img)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 999,
                                 background: 'rgba(16,24,40,0.65)', border: 0, cursor: 'pointer',
                                 display: 'grid', placeItems: 'center', color: '#fff' }}>
                  <IcClose size={11}/>
                </button>
              </div>
            ))}
          </div>
        )}
        {uploading
          ? <button className="btn btn-secondary btn-sm" disabled><IcImage size={14}/> A fazer upload…</button>
          : <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload}/>
              <span className="btn btn-secondary btn-sm"><IcImage size={14}/> Adicionar imagem</span>
            </label>
        }
        {images.length === 0 && !uploading && (
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Ainda sem imagens.</div>
        )}
      </div>
    );
  };

  // ── Product Panel ─────────────────────────────────────────────────────────────
  const ProductPanel = ({ product, onClose, showToast, onSaved }) => {
    const isNew = !product?.dbId;
    const [form, setForm] = useState({
      name: product?.name || '',
      sku:  product?.id  || '',
      price: product?.price ?? '',
      type:  product?.type || '',
      description: '',
      materials: '',
      weight: '',
      origin: '',
      stock_quantity: product?.stock ?? 0,
      low_stock_threshold: product?.lowStockThreshold ?? 10,
      is_active: product?.is_active ?? true,
      category_id: product?.category_id || null,
    });
    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const [selectedColors, setSelectedColors] = useState(new Set());
    const [selectedSizes,  setSelectedSizes]  = useState(new Set());
    const [allColors, setAllColors]   = useState([]);
    const [allSizes,  setAllSizes]    = useState([]);
    const [allCats,   setAllCats]     = useState([]);
    const [loading,   setLoading]     = useState(true);
    const [saving,    setSaving]      = useState(false);

    useEffect(() => {
      (async () => {
        const [colors, sizes, cats] = await Promise.all([
          AdminAPI.getColors(), AdminAPI.getSizes(), AdminAPI.getCategories(),
        ]);
        setAllColors(colors); setAllSizes(sizes); setAllCats(cats);
        if (product?.dbId) {
          const [detail, colorIds, sizeIds] = await Promise.all([
            AdminAPI.getProductDetail(product.dbId),
            AdminAPI.getProductColorIds(product.dbId),
            AdminAPI.getProductSizeIds(product.dbId),
          ]);
          if (detail) {
            setForm(f => ({
              ...f,
              name: detail.name, sku: detail.sku, price: detail.price,
              type: detail.type || '', description: detail.description || '',
              materials: Array.isArray(detail.materials) ? detail.materials.join(', ') : (detail.materials || ''),
              weight: detail.weight || '', origin: detail.origin || '',
              stock_quantity: detail.stock_quantity ?? 0,
              low_stock_threshold: detail.low_stock_threshold ?? 10,
              is_active: detail.is_active, category_id: detail.category_id || null,
            }));
          }
          setSelectedColors(new Set(colorIds));
          setSelectedSizes(new Set(sizeIds));
        }
        setLoading(false);
      })();
    }, [product?.dbId]);

    const toggleColor = id => setSelectedColors(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleSize  = id => setSelectedSizes(prev  => { const n = new Set(prev);  n.has(id) ? n.delete(id) : n.add(id); return n; });

    const save = async () => {
      if (!form.name.trim() || !form.sku.trim() || form.price === '') {
        showToast('Nome, SKU e preço são obrigatórios.', 'error'); return;
      }
      if (!configured()) { showToast('Sem ligação à BD.', 'error'); return; }
      setSaving(true);
      try {
        const slug = form.name.toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          + (isNew ? '-' + Date.now().toString(36) : '');
        const fields = {
          name: form.name.trim(), sku: form.sku.trim(), price: Number(form.price),
          type: form.type || null, description: form.description || null,
          materials: form.materials ? form.materials.split(',').map(s => s.trim()).filter(Boolean) : null,
          weight: form.weight || null, origin: form.origin || null,
          stock_quantity: Number(form.stock_quantity) || 0,
          low_stock_threshold: Number(form.low_stock_threshold) || 10,
          is_active: form.is_active, category_id: form.category_id || null,
        };
        let productId = product?.dbId;
        if (isNew) { fields.slug = slug; productId = await AdminAPI.createProduct(fields); }
        else await AdminAPI.updateProduct(productId, fields);
        await Promise.all([
          AdminAPI.setProductColors(productId, [...selectedColors]),
          AdminAPI.setProductSizes(productId, [...selectedSizes]),
        ]);
        showToast(isNew ? 'Produto criado.' : 'Produto guardado.');
        if (onSaved) onSaved();
        onClose();
      } catch(e) { showToast('Erro: ' + e.message, 'error'); }
      finally { setSaving(false); }
    };

    const fieldBox = (label, children) => (
      <div>
        <label className="overline" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>{label}</label>
        {children}
      </div>
    );

    return (
      <>
        <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.32)', zIndex: 50 }}/>
        <aside className="animate-slide-right" style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 680,
                                                        background: 'var(--surface-container-lowest)',
                                                        boxShadow: '-12px 0 32px rgba(16,24,40,0.1)',
                                                        zIndex: 51, display: 'flex', flexDirection: 'column',
                                                        borderLeft: '1px solid var(--hairline)' }}>
          {/* Header */}
          <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
            <div>
              <div className="h3">{isNew ? 'Novo produto' : (form.name || 'Editar produto')}</div>
              {!isNew && <div className="muted" style={{ fontSize: 11, marginTop: 1, fontFamily: 'monospace' }}>{form.sku}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className={`btn btn-sm ${form.is_active ? 'btn-success' : 'btn-secondary'}`} onClick={() => setF('is_active', !form.is_active)}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: form.is_active ? 'var(--success)' : 'var(--outline)', display: 'inline-block', marginRight: 4 }}/>
                {form.is_active ? 'Activo' : 'Inactivo'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'A guardar…' : 'Guardar'}</button>
              <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
            </div>
          </header>

          {loading
            ? <div className="muted" style={{ padding: 48, textAlign: 'center', flex: 1 }}>A carregar…</div>
            : <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Basic info */}
                <div>
                  <div className="overline" style={{ marginBottom: 14 }}>Informação básica</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      {fieldBox('Nome *', <div className="field"><input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Nome do produto" style={{ fontSize: 15, fontWeight: 600 }}/></div>)}
                    </div>
                    {fieldBox('SKU *', <div className="field"><input value={form.sku} onChange={e => setF('sku', e.target.value)} placeholder="HR-TEE-001" style={{ fontFamily: 'monospace', fontSize: 13 }}/></div>)}
                    {fieldBox('Preço (€) *', <div className="field"><input type="number" min="0" step="0.01" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="0.00"/></div>)}
                    {fieldBox('Tipo', <div className="field"><input value={form.type} onChange={e => setF('type', e.target.value)} placeholder="T-Shirt, Sweatshirt…"/></div>)}
                    {fieldBox('Categoria',
                      <div className="field">
                        <select value={form.category_id || ''} onChange={e => setF('category_id', e.target.value || null)}
                                style={{ border: 0, outline: 0, background: 'transparent', width: '100%', fontSize: 14, color: 'var(--on-surface)', fontFamily: 'inherit' }}>
                          <option value="">— Sem categoria —</option>
                          {allCats.map(c => <option key={c.id} value={c.id}>{c.path}</option>)}
                        </select>
                      </div>
                    )}
                    {fieldBox('Origem', <div className="field"><input value={form.origin} onChange={e => setF('origin', e.target.value)} placeholder="Portugal, Japão…"/></div>)}
                    {fieldBox('Peso / GSM', <div className="field"><input value={form.weight} onChange={e => setF('weight', e.target.value)} placeholder="320 GSM"/></div>)}
                    <div style={{ gridColumn: '1 / -1' }}>
                      {fieldBox('Materiais (separados por vírgula)', <div className="field"><input value={form.materials} onChange={e => setF('materials', e.target.value)} placeholder="100% Organic Cotton, Linen…"/></div>)}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      {fieldBox('Descrição',
                        <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Descrição do produto…"
                                  style={{ width: '100%', minHeight: 90, padding: '10px 12px', border: '1px solid var(--outline-variant)', borderRadius: 8,
                                           resize: 'vertical', fontFamily: 'inherit', fontSize: 14, color: 'var(--on-surface)',
                                           background: 'var(--surface-container-lowest)', outline: 'none', lineHeight: '20px' }}/>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="hr"/>

                {/* Stock */}
                <div>
                  <div className="overline" style={{ marginBottom: 14 }}>Stock</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      {fieldBox('Quantidade disponível',
                        <>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setF('stock_quantity', Math.max(0, (form.stock_quantity || 0) - 1))}>−</button>
                            <div className="field" style={{ flex: 1, textAlign: 'center' }}>
                              <input type="number" min="0" value={form.stock_quantity}
                                     onChange={e => setF('stock_quantity', Number(e.target.value))}
                                     style={{ fontWeight: 700, fontSize: 18, textAlign: 'center', width: '100%' }}/>
                            </div>
                            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setF('stock_quantity', (form.stock_quantity || 0) + 1)}>+</button>
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            {[10, 25, 50, 100].map(n => (
                              <button key={n} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12 }}
                                      onClick={() => setF('stock_quantity', n)}>{n}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      {fieldBox('Mínimo de alerta', <div className="field"><input type="number" min="0" value={form.low_stock_threshold} onChange={e => setF('low_stock_threshold', Number(e.target.value))}/></div>)}
                      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Aparece alerta de stock baixo quando a quantidade cair abaixo deste valor.</div>
                    </div>
                  </div>
                </div>

                <hr className="hr"/>

                {/* Colors */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span className="overline">Cores <span style={{ fontWeight: 400, opacity: .6 }}>({selectedColors.size} seleccionadas)</span></span>
                    {selectedColors.size > 0 && (
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setSelectedColors(new Set())}>Limpar</button>
                    )}
                  </div>
                  {allColors.length === 0
                    ? <div className="muted" style={{ fontSize: 13 }}>Sem cores na BD. Adiciona cores em <code>colors</code>.</div>
                    : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {allColors.map(c => {
                          const on = selectedColors.has(c.id);
                          return (
                            <button key={c.id} onClick={() => toggleColor(c.id)} style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
                              border: `2px solid ${on ? 'var(--primary)' : 'var(--outline-variant)'}`,
                              borderRadius: 8, background: on ? 'var(--primary-soft-2)' : 'transparent',
                              cursor: 'pointer', fontSize: 13, fontWeight: on ? 600 : 400, color: 'var(--on-surface)',
                              transition: 'border-color 100ms, background 100ms',
                            }}>
                              <span style={{ width: 14, height: 14, borderRadius: 999, background: c.hex, border: '1.5px solid rgba(0,0,0,0.15)', flexShrink: 0 }}/>
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                  }
                </div>

                <hr className="hr"/>

                {/* Sizes */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span className="overline">Tamanhos <span style={{ fontWeight: 400, opacity: .6 }}>({selectedSizes.size} seleccionados)</span></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {selectedSizes.size < allSizes.length && (
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setSelectedSizes(new Set(allSizes.map(s => s.id)))}>Todos</button>
                      )}
                      {selectedSizes.size > 0 && (
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setSelectedSizes(new Set())}>Limpar</button>
                      )}
                    </div>
                  </div>
                  {allSizes.length === 0
                    ? <div className="muted" style={{ fontSize: 13 }}>Sem tamanhos na BD.</div>
                    : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {allSizes.map(s => {
                          const on = selectedSizes.has(s.id);
                          return (
                            <button key={s.id} onClick={() => toggleSize(s.id)} style={{
                              minWidth: 52, height: 48, padding: '0 12px', display: 'grid', placeItems: 'center',
                              border: `2px solid ${on ? 'var(--primary)' : 'var(--outline-variant)'}`,
                              borderRadius: 8, background: on ? 'var(--primary-soft-2)' : 'transparent',
                              cursor: 'pointer', fontSize: 13, fontWeight: on ? 700 : 400,
                              color: on ? 'var(--primary)' : 'var(--on-surface)',
                              transition: 'all 100ms',
                            }}>
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                  }
                </div>

                <hr className="hr"/>

                {/* Imagens */}
                <div>
                  <div className="overline" style={{ marginBottom: 14 }}>Imagens do produto</div>
                  {isNew
                    ? <div className="muted" style={{ fontSize: 13 }}>Guarda o produto primeiro para poder adicionar imagens.</div>
                    : <ProductImages productId={product.dbId} showToast={showToast}/>
                  }
                </div>

              </div>
          }
        </aside>
      </>
    );
  };

  // ── Products (merged with Inventory) ─────────────────────────────────────────
  const Products = ({ onOpenProduct, onNewProduct, showToast }) => {
    const { data: products, loading, reload } = useData(AdminAPI.getProducts, MOCK.products);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(new Set());
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteSelected = async () => {
      const ids = [...selected].filter(Boolean);
      if (!configured() || !ids.length) return;
      try {
        await AdminAPI.deleteProducts(ids);
        setSelected(new Set());
        await reload();
        showToast(`${ids.length} produto${ids.length > 1 ? 's' : ''} eliminado${ids.length > 1 ? 's' : ''}.`);
      } catch(e) { showToast('Erro ao eliminar: ' + e.message, 'error'); }
    };

    const all = products || [];
    const outOf = all.filter(p => p.stock === 0);
    const low   = all.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    const inactive = all.filter(p => !p.is_active);

    const items = all.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase());
      const matchF = filter === 'all' ? true : filter === 'out' ? p.stock === 0 : filter === 'low' ? (p.stock > 0 && p.stock <= p.lowStockThreshold) : !p.is_active;
      return matchQ && matchF;
    });

    const filters = [
      { id: 'all', label: 'Todos', count: all.length },
      { id: 'low', label: 'Stock baixo', count: low.length },
      { id: 'out', label: 'Esgotados',   count: outOf.length },
      { id: 'inactive', label: 'Inactivos', count: inactive.length },
    ];

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-fade">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Produtos</h1>
            <div className="muted" style={{ marginTop: 4 }}>{all.length} produtos{configured() ? '' : ' (demo)'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {selected.size > 0 && (
              <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                <IcTrash size={15}/> Eliminar ({selected.size})
              </button>
            )}
            <button className="btn btn-secondary" onClick={reload}><IcRefresh size={15}/> Actualizar</button>
            <button className="btn btn-primary" onClick={() => onNewProduct(reload)}><IcPlus size={15}/> Novo produto</button>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'Total activos',  val: all.filter(p => p.is_active).length,  color: 'var(--on-surface)' },
            { label: 'Stock normal',   val: all.filter(p => p.stock > p.lowStockThreshold).length, color: 'var(--success)' },
            { label: 'Stock baixo',    val: low.length,  color: 'var(--warning)' },
            { label: 'Esgotados',      val: outOf.length, color: 'var(--error)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card" style={{ padding: '16px 20px' }}>
              <div className="overline" style={{ fontSize: 11, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--hairline)', padding: '0 6px' }}>
            <div style={{ display: 'flex' }}>
              {filters.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{
                  padding: '12px 14px', border: 0, background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: filter === f.id ? 600 : 500,
                  color: filter === f.id ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                  borderBottom: filter === f.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {f.label}
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: filter === f.id ? 'var(--primary-soft-2)' : 'var(--surface-container)', color: filter === f.id ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{f.count}</span>
                </button>
              ))}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div className="field" style={{ width: 260 }}>
                <IcSearch size={14} stroke="var(--on-surface-variant)"/>
                <input placeholder="Nome ou SKU…" value={q} onChange={e => setQ(e.target.value)}/>
              </div>
            </div>
          </div>

          {loading
            ? <div className="muted" style={{ padding: '40px 20px', textAlign: 'center' }}>A carregar…</div>
            : items.length === 0
              ? <div className="muted" style={{ padding: '40px 20px', textAlign: 'center' }}>Sem produtos.</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      <th style={{ ...thS, width: 44, textAlign: 'center' }}>
                        <input type="checkbox"
                          checked={items.filter(p => p.dbId).length > 0 && items.filter(p => p.dbId).every(p => selected.has(p.dbId))}
                          onChange={e => {
                            if (e.target.checked) setSelected(new Set(items.filter(p => p.dbId).map(p => p.dbId)));
                            else setSelected(new Set());
                          }}/>
                      </th>
                      {['Produto','SKU','Categoria','Preço','Stock','Cores','Estado',''].map(h => <th key={h} style={thS}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.dbId || p.id} onClick={() => onOpenProduct({ ...p, _reload: reload })} style={{ cursor: 'pointer', opacity: p.is_active ? 1 : 0.55 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdS, width: 44, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(p.dbId)}
                            onChange={() => setSelected(prev => {
                              const n = new Set(prev);
                              n.has(p.dbId) ? n.delete(p.dbId) : n.add(p.dbId);
                              return n;
                            })}/>
                        </td>
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ProductThumb product={p}/>
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              {p.type && <div className="muted" style={{ fontSize: 11 }}>{p.type}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdS, fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--on-surface-variant)' }}>{p.id}</td>
                        <td style={{ ...tdS, color: 'var(--on-surface-variant)' }}>{p.collection}</td>
                        <td style={{ ...tdS, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(p.price)}</td>
                        <td style={{ ...tdS, fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                                     color: p.stock === 0 ? 'var(--error)' : p.stock <= p.lowStockThreshold ? 'var(--warning)' : 'var(--success)' }}>
                          {p.stock}
                          {p.stock <= p.lowStockThreshold && p.stock > 0 && <span style={{ fontSize: 10, marginLeft: 4, opacity: .7 }}>↓</span>}
                        </td>
                        <td style={tdS}>
                          {p.colorCount > 0
                            ? <span className="chip chip-neutral">{p.colorCount} cor{p.colorCount > 1 ? 'es' : ''}</span>
                            : <span className="muted" style={{ fontSize: 12 }}>—</span>}
                        </td>
                        <td style={tdS}>
                          {!p.is_active
                            ? <span className="chip chip-neutral"><span className="dot"/>Inactivo</span>
                            : p.stock === 0
                              ? <span className="chip chip-error"><span className="dot"/>Esgotado</span>
                              : p.stock <= p.lowStockThreshold
                                ? <span className="chip chip-warning"><span className="dot"/>Stock baixo</span>
                                : <span className="chip chip-success"><span className="dot"/>Normal</span>}
                        </td>
                        <td style={tdS}><IcEdit size={14} stroke="var(--outline)"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          }
        </div>
        {confirmDelete && (
          <ConfirmModal
            title="Eliminar produtos"
            body={`Tens a certeza que queres eliminar ${selected.size} produto${selected.size > 1 ? 's' : ''}? Esta acção não pode ser desfeita.`}
            confirmLabel={`Eliminar (${selected.size})`}
            danger
            onConfirm={deleteSelected}
            onClose={() => setConfirmDelete(false)}
          />
        )}
      </div>
    );
  };

  // ── Customers ─────────────────────────────────────────────────────────────────
  const Customers = ({ onOpenCustomer }) => {
    const { data: customers, loading, reload } = useData(AdminAPI.getCustomers, MOCK.customers);
    const [q, setQ] = useState('');
    const swatches = ['var(--swatch-1)','var(--swatch-2)','var(--swatch-3)','var(--swatch-4)',
                      'var(--swatch-5)','var(--swatch-6)','var(--swatch-7)','var(--swatch-8)'];
    const items = (customers || []).filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
    const totalLTV = (customers || []).reduce((s, c) => s + c.ltv, 0);

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Clientes</h1>
            <div className="muted" style={{ marginTop: 4 }}>{(customers || []).length} clientes registados{configured() ? '' : ' (demo)'}</div>
          </div>
          <button className="btn btn-secondary" onClick={reload}><IcRefresh size={15}/> Actualizar</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            ['Total clientes', fmtNum((customers||[]).length)],
            ['Com pedidos', fmtNum((customers||[]).filter(c => c.orders > 0).length)],
            ['LTV total', fmtEUR(totalLTV)],
          ].map(([l, v]) => (
            <div key={l} className="card" style={{ padding: '16px 20px' }}>
              <div className="overline" style={{ fontSize: 11, marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="field" style={{ width: 320 }}>
          <IcSearch size={14} stroke="var(--on-surface-variant)"/>
          <input placeholder="Nome ou email…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>

        {loading
          ? <div className="muted" style={{ textAlign: 'center', padding: 40 }}>A carregar…</div>
          : items.length === 0
            ? <div className="muted" style={{ textAlign: 'center', padding: 60 }}>
                {(customers || []).length === 0 ? 'Ainda sem clientes registados.' : 'Sem resultados.'}
              </div>
            : <Card title="Todos os clientes" padded={false}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      {['Cliente','Email','Pedidos','LTV','Estado','Membro desde',''].map(h => <th key={h} style={thS}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c, i) => (
                      <tr key={c.id} onClick={() => onOpenCustomer && onOpenCustomer(c)} style={{ cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 999, background: swatches[i % 8], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                              {c.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                            </div>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ ...tdS, color: 'var(--on-surface-variant)' }}>{c.email}</td>
                        <td style={{ ...tdS, fontVariantNumeric: 'tabular-nums' }}>{c.orders}</td>
                        <td style={{ ...tdS, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(c.ltv)}</td>
                        <td style={tdS}>{statusToChip(c.status)}</td>
                        <td style={{ ...tdS, color: 'var(--on-surface-variant)' }}>{c.joined}</td>
                        <td style={tdS}><IcChevRight size={14} stroke="var(--outline)"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
        }
      </div>
    );
  };

  // ── Customer Panel ────────────────────────────────────────────────────────────
  const CustomerPanel = ({ customer, onClose, onOpenOrder }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const STAT = { pending: 'Pending', paid: 'Paid', confirmed: 'Paid', processing: 'Em preparação', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelled', refunded: 'Refunded' };

    useEffect(() => {
      if (!customer.dbId) { setLoading(false); return; }
      AdminAPI.getCustomerDetail(customer.dbId).then(data => {
        setOrders(data);
        setLoading(false);
      });
    }, [customer.dbId]);

    const avgOrder = orders.length ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0;
    const swatches = ['var(--swatch-1)','var(--swatch-2)','var(--swatch-3)','var(--swatch-4)','var(--swatch-5)','var(--swatch-6)','var(--swatch-7)','var(--swatch-8)'];
    const avatarColor = swatches[customer.name.charCodeAt(0) % 8];

    return (
      <>
        <div className="animate-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.32)', zIndex: 50 }}/>
        <aside className="animate-slide-right" style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 480,
                                                        background: 'var(--surface-container-lowest)',
                                                        boxShadow: '-12px 0 32px rgba(16,24,40,0.1)',
                                                        zIndex: 51, display: 'flex', flexDirection: 'column',
                                                        borderLeft: '1px solid var(--hairline)' }}>
          <header style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: avatarColor, color: '#fff',
                            display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {customer.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="h3">{customer.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{customer.email}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><IcClose size={18}/></button>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[['Pedidos', customer.orders], ['LTV', fmtEUR(customer.ltv)], ['Ticket médio', fmtEUR(avgOrder)]].map(([l, v]) => (
                <div key={l} style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="overline" style={{ fontSize: 10, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>Membro desde {customer.joined} · {statusToChip(customer.status)}</div>

            {/* Order history */}
            <div>
              <div className="overline" style={{ marginBottom: 10 }}>Histórico de pedidos</div>
              {loading
                ? <div className="muted" style={{ fontSize: 13 }}>A carregar…</div>
                : orders.length === 0
                  ? <div className="muted" style={{ fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Sem pedidos registados.</div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
                      {orders.map((o, i) => {
                        const ref = o.order_ref ? '#' + o.order_ref : '#KR-' + o.id.slice(-5).toUpperCase();
                        const stat = STAT[o.status] || o.status;
                        return (
                          <div key={o.id} onClick={() => onOpenOrder && onOpenOrder({ dbId: o.id, id: ref })}
                               style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: onOpenOrder ? 'pointer' : 'default',
                                        background: i % 2 === 0 ? 'var(--surface-container-lowest)' : 'var(--surface-container-low)' }}
                               onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
                               onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--surface-container-lowest)' : 'var(--surface-container-low)'}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{ref}</div>
                              <div className="muted" style={{ fontSize: 11 }}>
                                {new Date(o.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {o.total_items ? ` · ${o.total_items} artigo${o.total_items > 1 ? 's' : ''}` : ''}
                              </div>
                            </div>
                            {statusToChip(stat)}
                            <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{fmtEUR(o.total)}</div>
                          </div>
                        );
                      })}
                    </div>
              }
            </div>
          </div>
        </aside>
      </>
    );
  };

  // ── Analytics ─────────────────────────────────────────────────────────────────
  const Analytics = () => {
    const { data: a, loading, reload } = useData(AdminAPI.getAnalytics, MOCK.analytics);
    const noData = !a || (a.month === 0 && a.orderCount30d === 0);
    const CHAN_LABEL = { web: 'Web', mobile: 'Mobile', instagram: 'Instagram', other: 'Outro' };
    const FULL_LABEL = { unfulfilled: 'Unfulfilled', fulfilled: 'Fulfilled', on_hold: 'On hold', returned: 'Returned' };
    const maxChan = a ? Math.max(...(a.byChannel.map(c => c.v)), 1) : 1;
    const maxFull = a ? Math.max(...(a.byFulfillment.map(c => c.v)), 1) : 1;
    const maxProd = a ? Math.max(...(a.topProducts.map(p => p.revenue)), 1) : 1;
    const pos = a?.delta30 == null || a.delta30 >= 0;

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Analytics</h1>
            <div className="muted" style={{ marginTop: 4 }}>Dados dos últimos 30 dias{configured() ? '' : ' (demo)'}</div>
          </div>
          <button className="btn btn-secondary" onClick={reload}><IcRefresh size={15}/> Actualizar</button>
        </div>

        {/* Revenue period KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'Hoje', value: fmtEUR(a?.today || 0) },
            { label: 'Últimos 7 dias', value: fmtEUR(a?.week || 0) },
            { label: 'Últimos 30 dias', value: fmtEUR(a?.month || 0), delta: a?.delta30 },
            { label: 'Ticket médio (30d)', value: fmtEUR(a?.avgOrder || 0) },
          ].map(({ label, value, delta }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div className="overline" style={{ fontSize: 11, marginBottom: 8 }}>{label}</div>
              {loading
                ? <div style={{ height: 28, width: 100, background: 'var(--surface-container)', borderRadius: 6 }}/>
                : <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>}
              {delta != null && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: pos ? 'var(--success)' : 'var(--error)' }}>
                  {pos ? <IcArrowUp size={11} sw={2.5}/> : <IcArrowDown size={11} sw={2.5}/>}
                  {Math.abs(delta).toFixed(1)}% vs. 30d anteriores
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 30-day revenue chart */}
        <Card title="Receita diária (últimos 30 dias)" action={
          <span className="muted" style={{ fontSize: 12 }}>{a?.orderCount30d || 0} pedidos</span>
        }>
          {noData
            ? <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>Sem dados de vendas ainda.</div>
            : <AreaChart data={a.dailySeries} height={220}/>
          }
        </Card>

        {/* Two columns: top products + channels */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

          {/* Top products */}
          <Card title="Top produtos (receita total)">
            {loading
              ? <div className="muted" style={{ fontSize: 13 }}>A carregar…</div>
              : (a?.topProducts || []).length === 0
                ? <div className="muted" style={{ fontSize: 13, padding: '16px 0', textAlign: 'center' }}>Sem dados de artigos de pedidos ainda.</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(a.topProducts || []).map((p, i) => (
                      <div key={p.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', minWidth: 16 }}>#{i+1}</span>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                            <span style={{ fontWeight: 700 }}>{fmtEUR(p.revenue)}</span>
                            <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>{p.qty} un.</span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${(p.revenue / maxProd) * 100}%`, height: '100%', borderRadius: 999,
                                        background: `var(--swatch-${1 + i % 8})`, transition: 'width 400ms ease' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </Card>

          {/* Right column: channel + fulfillment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card title="Receita por canal">
              {(a?.byChannel || []).length === 0
                ? <div className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sem dados.</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(a.byChannel || []).map(({ k, v }) => (
                      <div key={k}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ fontWeight: 500 }}>{CHAN_LABEL[k] || k}</span>
                          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtEUR(v)}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${(v / maxChan) * 100}%`, height: '100%', borderRadius: 999, background: 'var(--primary)', transition: 'width 400ms ease' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </Card>

            <Card title="Estado de fulfillment (30d)">
              {(a?.byFulfillment || []).length === 0
                ? <div className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sem dados.</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(a.byFulfillment || []).map(({ k, v }) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span>{FULL_LABEL[k] || k}</span>
                            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                          </div>
                          <div style={{ height: 5, background: 'var(--surface-container)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${(v / maxFull) * 100}%`, height: '100%', borderRadius: 999,
                                          background: k === 'fulfilled' ? 'var(--success)' : k === 'on_hold' ? 'var(--error)' : 'var(--warning)',
                                          transition: 'width 400ms ease' }}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ── PageAdmin ─────────────────────────────────────────────────────────────────
  const PageAdmin = ({ onExit }) => {
    useEffect(() => { injectStyles(); }, []);
    const [screen, setScreen] = useState('overview');
    const [openOrder, setOpenOrder] = useState(null);
    const [openProduct, setOpenProduct] = useState(null);
    const [openCustomer, setOpenCustomer] = useState(null);
    const [dark, setDark] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const handleOpenOrder    = order    => { setOpenCustomer(null); setOpenProduct(null); setOpenOrder(order); };
    const handleOpenCustomer = customer => { setOpenOrder(null);   setOpenProduct(null); setOpenCustomer(customer); };
    const handleOpenProduct  = product  => { setOpenOrder(null);   setOpenCustomer(null); setOpenProduct({ product, reload: product._reload }); };
    const handleNewProduct   = reload   => { setOpenOrder(null);   setOpenCustomer(null); setOpenProduct({ product: null, reload }); };

    const renderScreen = () => {
      switch (screen) {
        case 'overview':  return <Overview  onNavigate={setScreen} onOpenOrder={handleOpenOrder} onOpenProduct={p => handleOpenProduct(p)} showToast={showToast}/>;
        case 'orders':    return <Orders    onOpenOrder={handleOpenOrder} showToast={showToast}/>;
        case 'products':  return <Products  onOpenProduct={handleOpenProduct} onNewProduct={handleNewProduct} showToast={showToast}/>;
        case 'customers': return <Customers onOpenCustomer={handleOpenCustomer}/>;
        case 'analytics': return <Analytics/>;
        default:          return <Analytics/>;
      }
    };

    return (
      <div data-admin="true" data-theme={dark ? 'dark' : undefined}
           style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', overflow: 'hidden', background: 'var(--surface)' }}>
        <Sidebar active={screen} onNavigate={setScreen} onExit={onExit}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar dark={dark} setDark={setDark}/>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderScreen()}
          </div>
        </div>
        {openOrder    && <OrderPanel    order={openOrder}     onClose={() => setOpenOrder(null)}    showToast={showToast}/>}
        {openCustomer && <CustomerPanel customer={openCustomer} onClose={() => setOpenCustomer(null)} onOpenOrder={handleOpenOrder}/>}
        {openProduct  && <ProductPanel  product={openProduct.product} onClose={() => setOpenProduct(null)}
                                        showToast={showToast} onSaved={openProduct.reload}/>}
        <Toast msg={toast.msg} type={toast.type} clear={() => setToast({ msg: '', type: 'success' })}/>
      </div>
    );
  };

  window.PageAdmin = PageAdmin;
})();
