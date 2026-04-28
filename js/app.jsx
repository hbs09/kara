
    const { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } = React;

    // ============================================================
    // SUPABASE API — Camada de dados
    // Quando o Supabase estiver configurado, usa a BD em vez de dados locais
    // ============================================================

    const SupabaseAPI = {
      // Carregar todos os produtos (com fallback para dados locais)
      async getProducts() {
        if (!window.__SUPABASE_CONFIGURED__) return null;
        try {
          const { data, error } = await window.supabaseClient
            .from('products_full')
            .select('*')
            .order('sort_order');
          if (error) throw error;
          return data.map(p => {
            const gSlug = p.gender_slug || '';
            const rawCat = p.category_slug || '';
            const category = gSlug && rawCat.startsWith(gSlug + '-')
              ? rawCat.slice(gSlug.length + 1)
              : rawCat;
            return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            gender: p.gender_slug,
            category,
            type: p.type,
            colors: (p.colors || []).map(c => ({ id: c.slug, label: c.label, hex: c.hex })),
            sizes: (p.sizes || []),
            available: (p.available_sizes || []),
            materials: p.materials || [],
            weight: p.weight || '—',
            origin: p.origin || '—',
            description: p.description || '',
            images: (p.images || []).map(img => img.url),
            tags: (p.tags || []),
            avgRating: p.avg_rating,
            reviewCount: p.review_count,
          }; });
        } catch (e) {
          console.warn('Supabase: erro ao carregar produtos', e.message);
          return null;
        }
      },

      // Autenticação
      async signIn(email, password) {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },

      async signUp(email, password, firstName, lastName) {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email, password,
          options: { data: { first_name: firstName, last_name: lastName } }
        });
        if (error) throw error;
        return data;
      },

      async signOut() {
        await window.supabaseClient.auth.signOut();
      },

      async getSession() {
        const { data } = await window.supabaseClient.auth.getSession();
        return data.session;
      },

      // Perfil
      async getProfile(userId) {
        if (!window.__SUPABASE_CONFIGURED__) return null;
        const { data, error } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) return null;
        return data;
      },

      async updateProfile(userId, updates) {
        const { error } = await window.supabaseClient
          .from('profiles')
          .update(updates)
          .eq('id', userId);
        if (error) throw error;
      },

      // Wishlist
      async getWishlist(profileId) {
        if (!window.__SUPABASE_CONFIGURED__) return null;
        const { data } = await window.supabaseClient
          .from('wishlists')
          .select('product_id')
          .eq('profile_id', profileId);
        return (data || []).map(w => w.product_id);
      },

      async addToWishlist(profileId, productId) {
        const { error } = await window.supabaseClient
          .from('wishlists')
          .insert({ profile_id: profileId, product_id: productId });
        if (error && error.code !== '23505') throw error;
      },

      async removeFromWishlist(profileId, productId) {
        await window.supabaseClient
          .from('wishlists')
          .delete()
          .match({ profile_id: profileId, product_id: productId });
      },

      // Encomendas
      async getOrders(profileId) {
        if (!window.__SUPABASE_CONFIGURED__) return null;
        const { data } = await window.supabaseClient
          .from('orders')
          .select('*, order_items(*)')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });
        return data || [];
      },

      // Newsletter
      async subscribeNewsletter(email, firstName) {
        if (!window.__SUPABASE_CONFIGURED__) return;
        await window.supabaseClient
          .from('newsletter_subscribers')
          .upsert({ email, first_name: firstName }, { onConflict: 'email' });
      },

      // Checkout — insere encomenda e itens diretamente
      async placeOrder({ email, profile_id, items, ship, method, payMethod, subtotal, shippingCost, tax, total, notes }) {
        if (!window.__SUPABASE_CONFIGURED__) return 'KR-' + Math.floor(Math.random() * 900000 + 100000);
        const { data: order, error: orderError } = await window.supabaseClient
          .from('orders')
          .insert({
            profile_id: profile_id || null,
            email,
            ship_first_name: ship.firstName,
            ship_last_name:  ship.lastName,
            ship_address_1:  ship.address,
            ship_city:       ship.city,
            ship_postal:     ship.postal,
            ship_country:    ship.country,
            ship_phone:      ship.phone || null,
            shipping_method: method,
            shipping_cost:   shippingCost,
            payment_method:  payMethod,
            subtotal,
            tax,
            total,
            notes: notes || null,
          })
          .select('id, order_ref')
          .single();
        if (orderError) throw orderError;
        const { error: itemsError } = await window.supabaseClient
          .from('order_items')
          .insert(items.map(it => ({
            order_id:     order.id,
            product_name: it.name,
            product_sku:  it.sku,
            color_label:  it.colorLabel,
            size_label:   it.size,
            image_url:    it.image || null,
            qty:          it.qty,
            unit_price:   it.price,
          })));
        if (itemsError) throw itemsError;
        return order.order_ref;
      },

      // Moradas
      async getAddresses(profileId) {
        if (!window.__SUPABASE_CONFIGURED__) return [];
        const { data } = await window.supabaseClient
          .from('addresses')
          .select('*')
          .eq('profile_id', profileId)
          .order('is_default', { ascending: false });
        return data || [];
      },

      async createAddress(profileId, fields) {
        const { error } = await window.supabaseClient
          .from('addresses')
          .insert({ profile_id: profileId, ...fields });
        if (error) throw error;
      },

      async updateAddress(id, fields) {
        const { error } = await window.supabaseClient
          .from('addresses')
          .update(fields)
          .eq('id', id);
        if (error) throw error;
      },

      async deleteAddress(id) {
        const { error } = await window.supabaseClient
          .from('addresses')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },

      // Itens de encomenda
      async getOrderItems(orderId) {
        if (!window.__SUPABASE_CONFIGURED__) return [];
        const { data } = await window.supabaseClient
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        return data || [];
      },

      // Newsletter
      async getNewsletterStatus(email) {
        if (!window.__SUPABASE_CONFIGURED__ || !email) return false;
        const { data } = await window.supabaseClient
          .from('newsletter_subscribers')
          .select('is_active')
          .eq('email', email)
          .single();
        return data?.is_active ?? false;
      },
    };

    window.SupabaseAPI = SupabaseAPI;


    // ============================================================
    // PRODUCT DATA
    // ============================================================

    const PRODUCTS = [
      {
        id: 'k-001',
        sku: 'KR-TEE-001-BLK',
        name: 'Heavyweight Tee 001',
        price: 65,
        gender: 'homem',
        category: 't-shirts',
        type: 'T-Shirt',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
          { id: 'olive', label: 'Olive', hex: '#4a4a3a' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        available: ['XS', 'S', 'M', 'L', 'XL'],
        materials: ['100% Algodão Orgânico'],
        weight: '320 GSM',
        origin: 'Portugal',
        description: 'T-shirt em algodão pesado construída num fio de anel simples. Corte boxy com gola canelada reforçada. Pré-lavada para mínima retração.',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80&auto=format&fit=crop',
        ],
        tags: ['Novo'],
      },
      {
        id: 'k-002',
        sku: 'KR-CRW-002-CRM',
        name: 'Loopback Crewneck',
        price: 145,
        gender: 'homem',
        category: 'sweatshirts',
        type: 'Sweatshirt',
        colors: [
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        available: ['S', 'M', 'L', 'XL'],
        materials: ['85% Algodão', '15% Poliéster'],
        weight: '480 GSM',
        origin: 'Portugal',
        description: 'Sweatshirt relaxada em french terry loopback pesado. Ombros caídos, punhos e barra canelados. Tingida em peça para profundidade tonal.',
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80&auto=format&fit=crop',
        ],
        tags: ['Mais Vendido'],
      },
      {
        id: 'k-003',
        sku: 'KR-PNT-003-BLK',
        name: 'Wide Leg Trouser',
        price: 195,
        gender: 'homem',
        category: 'calcas',
        type: 'Calças',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' },
        ],
        sizes: ['28', '30', '32', '34', '36'],
        available: ['28', '30', '32', '34'],
        materials: ['68% Lã', '30% Poliéster', '2% Elastano'],
        weight: '240 GSM',
        origin: 'Itália',
        description: 'Calça de perna larga em mistura de lã de quatro estações. Frente com uma prega, bolsos laterais inclinados e barra limpa sem acabamento.',
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1473966968600-fa801b3a9746?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-004',
        sku: 'KR-OUT-004-BLK',
        name: 'Type-04 Field Coat',
        price: 425,
        gender: 'homem',
        category: 'casacos',
        type: 'Casaco',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'navy', label: 'Azul-Marinho', hex: '#1c2233' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        available: ['M', 'L', 'XL'],
        materials: ['100% Algodão (Encerado)'],
        weight: '14 oz',
        origin: 'Japão',
        description: 'Casaco de campo utilitário com quatro bolsos foles e fecho com flap de proteção. Construído em canvas encerado japonês que desenvolve pátina única com o uso.',
        images: [
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591047139756-eb1ab9c8f99e?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80&auto=format&fit=crop',
        ],
        tags: ['Novo'],
      },
      {
        id: 'k-005',
        sku: 'KR-KNT-005-OLV',
        name: 'Merino Half-Zip',
        price: 215,
        gender: 'homem',
        category: 'sweatshirts',
        type: 'Malha',
        colors: [
          { id: 'olive', label: 'Olive', hex: '#4a4a3a' },
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        available: ['S', 'M', 'L'],
        materials: ['100% Lã Merino'],
        weight: '12 GG',
        origin: 'Escócia',
        description: 'Meia-fecho em merino de malha fina com gola canelada estruturada. Peso médio, respirável, regulação natural da temperatura.',
        images: [
          'https://images.unsplash.com/photo-1614093302611-8efc4de12407?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-006',
        sku: 'KR-PNT-006-CRM',
        name: 'Carpenter Pant',
        price: 175,
        gender: 'homem',
        category: 'calcas',
        type: 'Calças',
        colors: [
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
        ],
        sizes: ['28', '30', '32', '34', '36'],
        available: ['28', '30', '32', '34', '36'],
        materials: ['100% Canvas de Algodão'],
        weight: '12 oz',
        origin: 'Portugal',
        description: 'Calça de carpinteiro relaxada em canvas pesado. Loop de martelo, joelhos duplos e subida limpa na frente.',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1542272454315-7ad9f1b4e64e?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-007',
        sku: 'KR-ACC-007-BLK',
        name: 'Object Cap',
        price: 55,
        gender: 'homem',
        category: 'acessorios',
        type: 'Boné',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
        ],
        sizes: ['One Size'],
        available: ['One Size'],
        materials: ['100% Sarja de Algodão'],
        weight: '—',
        origin: 'Portugal',
        description: 'Boné de seis painéis sem estrutura. Fecho em tecido próprio com ferragens em latão envelhecido.',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-008',
        sku: 'KR-OUT-008-BLK',
        name: 'Cropped Liner Vest',
        price: 165,
        gender: 'homem',
        category: 'casacos',
        type: 'Colete',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'olive', label: 'Olive', hex: '#4a4a3a' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        available: ['S', 'M', 'L'],
        materials: ['100% Nylon Reciclado'],
        weight: '—',
        origin: 'Vietname',
        description: 'Colete acolchoado compressível em nylon ripstop reciclado. Fecho duplo, bolso interno com fecho.',
        images: [
          'https://images.unsplash.com/photo-1591047139756-eb1ab9c8f99e?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80&auto=format&fit=crop',
        ],
        tags: ['Edição Limitada'],
      },
      {
        id: 'k-009',
        sku: 'KR-TEE-009-CRM',
        name: 'Tubular Long Sleeve',
        price: 85,
        gender: 'homem',
        category: 't-shirts',
        type: 'T-Shirt',
        colors: [
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        available: ['S', 'M', 'L', 'XL'],
        materials: ['100% Algodão Pima'],
        weight: '220 GSM',
        origin: 'Peru',
        description: 'Manga longa cortada numa máquina de malha tubular — um corpo único, sem costuras, para uma queda limpa.',
        images: [
          'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-010',
        sku: 'KR-ACC-010-BLK',
        name: 'Utility Tote',
        price: 95,
        gender: 'homem',
        category: 'acessorios',
        type: 'Mala',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
        ],
        sizes: ['One Size'],
        available: ['One Size'],
        materials: ['100% Canvas de Algodão'],
        weight: '16 oz',
        origin: 'Portugal',
        description: 'Tote em canvas pesado com base reforçada, pegas com rebites e bolso interior com fecho.',
        images: [
          'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-011',
        sku: 'KR-KNT-011-BLK',
        name: 'Cashmere Beanie',
        price: 85,
        gender: 'homem',
        category: 'acessorios',
        type: 'Gorro',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' },
          { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
        ],
        sizes: ['One Size'],
        available: ['One Size'],
        materials: ['100% Caxemira Mongol'],
        weight: '7 GG',
        origin: 'Itália',
        description: 'Gorro canelado em caxemira. Dupla dobra, estruturado, macio.',
        images: [
          'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=900&q=80&auto=format&fit=crop',
        ],
        tags: [],
      },
      {
        id: 'k-012',
        sku: 'KR-PNT-012-BLK',
        name: 'Selvedge Denim',
        price: 245,
        gender: 'homem',
        category: 'calcas',
        type: 'Ganga',
        colors: [
          { id: 'black', label: 'Preto', hex: '#0a0a0a' },
          { id: 'indigo', label: 'Índigo', hex: '#1c2840' },
        ],
        sizes: ['28', '30', '32', '34', '36'],
        available: ['30', '32', '34'],
        materials: ['100% Algodão (Selvedge)'],
        weight: '14.5 oz',
        origin: 'Japão',
        description: 'Ganga bruta tecida em teares de lançadeira vintage em Okayama. Perna direita, cintura média, construção com rebites escondidos.',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=900&q=80&auto=format&fit=crop',
        ],
        tags: ['Mais Vendido'],
      },
      // ── Mulher
      {
        id: 'k-m01', sku: 'KR-TEE-M01-BLK', name: 'Essential Tee W01', price: 58,
        gender: 'mulher', category: 't-shirts', type: 'T-Shirt',
        colors: [{ id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'navy', label: 'Azul-Marinho', hex: '#1c2233' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], available: ['XS', 'S', 'M', 'L', 'XL'],
        materials: ['100% Algodão Pima'], weight: '200 GSM', origin: 'Peru',
        description: 'T-shirt em algodão pima de peso médio. Corte semi-cintado com gola canelada fina. Pré-lavada para textura suave.',
        images: ['https://images.unsplash.com/photo-1562572159-4eaee4c76a72?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80&auto=format&fit=crop'],
        tags: ['Novo'],
      },
      {
        id: 'k-m02', sku: 'KR-TEE-M02-CRM', name: 'Ribbed Crop Tee W02', price: 65,
        gender: 'mulher', category: 't-shirts', type: 'T-Shirt',
        colors: [{ id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' }],
        sizes: ['XS', 'S', 'M', 'L'], available: ['XS', 'S', 'M', 'L'],
        materials: ['95% Algodão', '5% Elastano'], weight: '180 GSM', origin: 'Portugal',
        description: 'Top canelado curto em jersey de algodão elástico. Gola redonda e manga de três quartos.',
        images: ['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=900&q=80&auto=format&fit=crop'],
        tags: [],
      },
      {
        id: 'k-m03', sku: 'KR-CRW-M03-CRM', name: 'Oversized Crewneck W03', price: 138,
        gender: 'mulher', category: 'sweatshirts', type: 'Sweatshirt',
        colors: [{ id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' }, { id: 'olive', label: 'Olive', hex: '#4a4a3a' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], available: ['XS', 'S', 'M', 'L', 'XL'],
        materials: ['85% Algodão', '15% Poliéster'], weight: '460 GSM', origin: 'Portugal',
        description: 'Sweatshirt oversized em french terry loopback. Ombros caídos, punhos e barra largo canelado. Tingida em peça.',
        images: ['https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop'],
        tags: ['Mais Vendido'],
      },
      {
        id: 'k-m04', sku: 'KR-KNT-M04-OLV', name: 'Fine Knit Cardigan W04', price: 195,
        gender: 'mulher', category: 'sweatshirts', type: 'Malha',
        colors: [{ id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'olive', label: 'Olive', hex: '#4a4a3a' }, { id: 'black', label: 'Preto', hex: '#0a0a0a' }],
        sizes: ['XS', 'S', 'M', 'L'], available: ['XS', 'S', 'M', 'L'],
        materials: ['100% Lã Merino'], weight: '10 GG', origin: 'Escócia',
        description: 'Casaco de malha fina em lã merino. Fecho de botões forrados, bolsos de chapa e gola em V.',
        images: ['https://images.unsplash.com/photo-1604176354204-9268737828e4?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1614093302611-8efc4de12407?w=900&q=80&auto=format&fit=crop'],
        tags: [],
      },
      {
        id: 'k-m05', sku: 'KR-PNT-M05-CRM', name: 'Wide Leg Linen W05', price: 145,
        gender: 'mulher', category: 'calcas', type: 'Calças',
        colors: [{ id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' }, { id: 'black', label: 'Preto', hex: '#0a0a0a' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL'], available: ['XS', 'S', 'M', 'L', 'XL'],
        materials: ['100% Linho'], weight: '160 GSM', origin: 'Portugal',
        description: 'Calça de linho de perna larga com elástico na cintura. Acabamento a pique, caimento fluido.',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b7e6d?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80&auto=format&fit=crop'],
        tags: ['Novo'],
      },
      {
        id: 'k-m06', sku: 'KR-PNT-M06-BLK', name: 'High Rise Straight W06', price: 175,
        gender: 'mulher', category: 'calcas', type: 'Calças',
        colors: [{ id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'indigo', label: 'Índigo', hex: '#1c2840' }, { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' }],
        sizes: ['28', '30', '32', '34'], available: ['28', '30', '32', '34'],
        materials: ['98% Algodão', '2% Elastano'], weight: '320 GSM', origin: 'Portugal',
        description: 'Calça de cintura alta em twill de algodão. Perna direita, bolsos de faca, acabamento limpo.',
        images: ['https://images.unsplash.com/photo-1473966968600-fa801b3a9746?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80&auto=format&fit=crop'],
        tags: [],
      },
      {
        id: 'k-m07', sku: 'KR-OUT-M07-BLK', name: 'Wool Overcoat W07', price: 485,
        gender: 'mulher', category: 'casacos', type: 'Casaco',
        colors: [{ id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' }, { id: 'cream', label: 'Creme', hex: '#e8e2d6' }],
        sizes: ['XS', 'S', 'M', 'L'], available: ['XS', 'S', 'M', 'L'],
        materials: ['70% Lã', '20% Poliamida', '10% Caxemira'], weight: '600 GSM', origin: 'Itália',
        description: 'Casaco comprido em mistura de lã italiana. Lapela entalhada, botões forrados e forro de viscose.',
        images: ['https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80&auto=format&fit=crop'],
        tags: ['Edição Limitada'],
      },
      {
        id: 'k-m08', sku: 'KR-OUT-M08-NAV', name: 'Quilted Liner W08', price: 155,
        gender: 'mulher', category: 'casacos', type: 'Colete',
        colors: [{ id: 'navy', label: 'Azul-Marinho', hex: '#1c2233' }, { id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'olive', label: 'Olive', hex: '#4a4a3a' }],
        sizes: ['XS', 'S', 'M', 'L'], available: ['XS', 'S', 'M', 'L'],
        materials: ['100% Nylon Reciclado'], weight: '—', origin: 'Japão',
        description: 'Colete acolchoado crop em nylon ripstop. Enchimento em fibra reciclada. Fecho duplo YKK.',
        images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1591047139756-eb1ab9c8f99e?w=900&q=80&auto=format&fit=crop'],
        tags: ['Novo'],
      },
      {
        id: 'k-m09', sku: 'KR-ACC-M09-BLK', name: 'Mini Structured Bag W09', price: 225,
        gender: 'mulher', category: 'acessorios', type: 'Mala',
        colors: [{ id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' }],
        sizes: ['One Size'], available: ['One Size'],
        materials: ['100% Pele Bovina'], weight: '—', origin: 'Portugal',
        description: 'Mini saco em pele bovina curtida ao vegetal. Fecho de fecho, alça removível em corrente.',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop'],
        tags: [],
      },
      {
        id: 'k-m10', sku: 'KR-ACC-M10-CRM', name: 'Cashmere Beanie W10', price: 85,
        gender: 'mulher', category: 'acessorios', type: 'Gorro',
        colors: [{ id: 'cream', label: 'Creme', hex: '#e8e2d6' }, { id: 'black', label: 'Preto', hex: '#0a0a0a' }, { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' }, { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' }],
        sizes: ['One Size'], available: ['One Size'],
        materials: ['100% Caxemira Mongol'], weight: '7 GG', origin: 'Itália',
        description: 'Gorro canelado em caxemira mongol de grau A. Dupla dobra, extremamente suave.',
        images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=900&q=80&auto=format&fit=crop'],
        tags: [],
      },
    ];

    const GENDERS = [
      {
        id: 'homem', label: 'Homem',
        subs: [
          { id: 't-shirts', label: 'T-Shirts' },
          { id: 'sweatshirts', label: 'Sweatshirts' },
          { id: 'calcas', label: 'Calças' },
          { id: 'casacos', label: 'Casacos' },
          { id: 'acessorios', label: 'Acessórios' },
        ],
      },
      {
        id: 'mulher', label: 'Mulher',
        subs: [
          { id: 't-shirts', label: 'T-Shirts' },
          { id: 'sweatshirts', label: 'Sweatshirts' },
          { id: 'calcas', label: 'Calças' },
          { id: 'casacos', label: 'Casacos' },
          { id: 'acessorios', label: 'Acessórios' },
        ],
      },
    ];

    const ALL_COLORS = [
      { id: 'black', label: 'Preto', hex: '#0a0a0a' },
      { id: 'cream', label: 'Creme', hex: '#e8e2d6' },
      { id: 'olive', label: 'Olive', hex: '#4a4a3a' },
      { id: 'graphite', label: 'Grafite', hex: '#3a3a3a' },
      { id: 'taupe', label: 'Taupe', hex: '#7a6e5e' },
      { id: 'navy', label: 'Azul-Marinho', hex: '#1c2233' },
      { id: 'indigo', label: 'Índigo', hex: '#1c2840' },
    ];

    const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'One Size'];

    const SHIPPING = [
      { id: 'standard', label: 'Standard', sub: '3–5 dias úteis', price: 4.95 },
      { id: 'express', label: 'Express', sub: '1–2 dias úteis', price: 9.95 },
      { id: 'pickup', label: 'Click & Collect', sub: 'Lisboa — pronto em 24h', price: 0 },
    ];




    // Tiny inline icon set — 1.5px stroke, square caps to match design.md spec.
    const Icon = ({ name, size = 18, stroke = 1.5, ...rest }) => {
      const common = {
        width: size, height: size, viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
        strokeLinecap: 'square', strokeLinejoin: 'miter',
        ...rest,
      };
      switch (name) {
        case 'menu': return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
        case 'close': return <svg {...common}><path d="M5 5l14 14M19 5L5 19" /></svg>;
        case 'search': return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></svg>;
        case 'user': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>;
        case 'bag': return <svg {...common}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 016 0" /></svg>;
        case 'heart': return <svg {...common} strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg>;
        case 'heart-fill': return <svg {...common} fill="currentColor" stroke="none"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg>;
        case 'arrow-r': return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
        case 'arrow-l': return <svg {...common}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
        case 'arrow-d': return <svg {...common}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
        case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
        case 'minus': return <svg {...common}><path d="M5 12h14" /></svg>;
        case 'check': return <svg {...common} strokeLinejoin="round"><path d="M5 12l5 5 9-11" /></svg>;
        case 'filter': return <svg {...common}><path d="M3 6h18M6 12h12M10 18h4" /></svg>;
        case 'grid': return <svg {...common}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>;
        case 'truck': return <svg {...common}><path d="M3 7h11v9H3zM14 11h4l3 3v2h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
        case 'shield': return <svg {...common} strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /></svg>;
        case 'rotate': return <svg {...common}><path d="M3 12a9 9 0 0115-6.7L21 8M21 4v4h-4M21 12a9 9 0 01-15 6.7L3 16M3 20v-4h4" /></svg>;
        case 'leaf': return <svg {...common} strokeLinejoin="round"><path d="M5 19c0-9 6-14 14-14 0 9-5 14-14 14zM5 19l9-9" /></svg>;
        case 'instagram': return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>;
        case 'mail': return <svg {...common}><rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 6 9-6" /></svg>;
        case 'pin': return <svg {...common} strokeLinejoin="round"><path d="M12 22s7-7 7-13a7 7 0 10-14 0c0 6 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>;
        case 'phone': return <svg {...common} strokeLinejoin="round"><path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" /></svg>;
        default: return null;
      }
    };




    const StoreContext = createContext(null);

    function loadJSON(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch { return fallback; }
    }
    function saveJSON(key, v) {
      try { localStorage.setItem(key, JSON.stringify(v)); } catch { }
    }

    function StoreProvider({ children }) {
      // Routing — hash based so refresh keeps you in place.
      const [route, setRoute] = useState(() => {
        const h = window.location.hash.replace(/^#/, '');
        return h || '/';
      });
      // Supabase user
      const [sbUser, setSbUser] = useState(null);
      const [sbProfile, setSbProfile] = useState(null);
      // Async products override (from Supabase)
      const [dbProducts, setDbProducts] = useState(null);

      useEffect(() => {
        // Auth state listener
        if (window.__SUPABASE_CONFIGURED__) {
          window.supabaseClient.auth.getSession().then(({ data }) => {
            if (data.session) {
              const u = data.session.user;
              setSbUser(u);
              setAuthed(true);
              SupabaseAPI.getProfile(u.id).then(p => { if (p) setSbProfile(p); });
              SupabaseAPI.getWishlist(u.id).then(ids => { if (ids) setWishlist(ids); });
            }
          });
          const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSbUser(session?.user || null);
            setAuthed(!!session);
            if (session?.user) {
              SupabaseAPI.getProfile(session.user.id).then(p => { if (p) setSbProfile(p); });
              SupabaseAPI.getWishlist(session.user.id).then(ids => { if (ids) setWishlist(ids); });
            } else {
              setSbProfile(null);
            }
          });
          // Load products from DB
          SupabaseAPI.getProducts().then(prods => { if (prods) setDbProducts(prods); });
          return () => subscription.unsubscribe();
        }
      }, []);
      useEffect(() => {
        const onHash = () => {
          setRoute(window.location.hash.replace(/^#/, '') || '/');
          window.scrollTo({ top: 0, behavior: 'instant' });
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
      }, []);
      const navigate = useCallback((path) => {
        window.location.hash = path;
      }, []);

      // Cart: [{ id, productId, color, size, qty }]
      const [cart, setCart] = useState(() => loadJSON('kara.cart', []));
      useEffect(() => saveJSON('kara.cart', cart), [cart]);

      const [wishlist, setWishlist] = useState(() => loadJSON('kara.wishlist', []));
      useEffect(() => saveJSON('kara.wishlist', wishlist), [wishlist]);

      const [authed, setAuthed] = useState(() => loadJSON('kara.authed', false));
      useEffect(() => saveJSON('kara.authed', authed), [authed]);

      const [drawerOpen, setDrawerOpen] = useState(false);
      const [searchOpen, setSearchOpen] = useState(false);
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [toast, setToast] = useState(null);

      const showToast = useCallback((msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2400);
      }, []);

      const addToCart = useCallback((productId, color, size, qty = 1) => {
        setCart(prev => {
          const key = `${productId}|${color}|${size}`;
          const idx = prev.findIndex(it => `${it.productId}|${it.color}|${it.size}` === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return next;
          }
          return [...prev, { id: key, productId, color, size, qty }];
        });
        showToast('Adicionado ao carrinho');
        setDrawerOpen(true);
      }, [showToast]);

      const updateQty = useCallback((id, qty) => {
        setCart(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it));
      }, []);

      const removeFromCart = useCallback((id) => {
        setCart(prev => prev.filter(it => it.id !== id));
      }, []);

      const clearCart = useCallback(() => setCart([]), []);

      const toggleWishlist = useCallback((productId) => {
        setWishlist(prev => {
          const inList = prev.includes(productId);
          if (sbUser && window.__SUPABASE_CONFIGURED__) {
            if (inList) {
              SupabaseAPI.removeFromWishlist(sbUser.id, productId).catch(() => {});
            } else {
              SupabaseAPI.addToWishlist(sbUser.id, productId).catch(() => {});
            }
          }
          return inList ? prev.filter(id => id !== productId) : [...prev, productId];
        });
      }, [sbUser]);

      const cartCount = useMemo(() => cart.reduce((sum, it) => sum + it.qty, 0), [cart]);
      const cartSubtotal = useMemo(() => cart.reduce((sum, it) => {
        const prods = dbProducts || PRODUCTS;
        const p = prods.find(p => p.id === it.productId);
        return sum + (p ? p.price * it.qty : 0);
      }, 0), [cart, dbProducts]);

      // Use DB products if available, else fallback to local
      const activeProducts = dbProducts || PRODUCTS;

      const value = {
        route, navigate,
        cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartSubtotal,
        wishlist, toggleWishlist,
        authed, setAuthed,
        sbUser, sbProfile, setSbProfile,
        products: activeProducts,
        drawerOpen, setDrawerOpen,
        searchOpen, setSearchOpen,
        mobileMenuOpen, setMobileMenuOpen,
        toast, showToast,
      };

      return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
    }

    const useStore = () => useContext(StoreContext);

    // Parse path -> { name, params }
    function parseRoute(route) {
      const path = route.split('?')[0];
      const query = Object.fromEntries(new URLSearchParams(route.split('?')[1] || ''));
      if (path === '/' || path === '') return { name: 'home', query };
      if (path === '/shop') return { name: 'shop', query };
      if (path.startsWith('/shop/')) {
        const rest = path.replace('/shop/', '');
        const parts = rest.split('/');
        return { name: 'shop', query, gender: parts[0], sub: parts[1] || null };
      }
      if (path.startsWith('/product/')) {
        return { name: 'product', query, productId: path.replace('/product/', '') };
      }
      if (path === '/cart') return { name: 'cart', query };
      if (path === '/checkout') return { name: 'checkout', query };
      if (path === '/account') return { name: 'account', query };
      if (path === '/contact') return { name: 'contact', query };
      if (path === '/admin' || path.startsWith('/admin/')) return { name: 'admin', query };
      return { name: 'home', query };
    }





    function Nav() {
      const { route, navigate, cartCount, setDrawerOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen, sbProfile } = useStore();
      const r = parseRoute(route);
      const isGenderActive = (gId) => r.name === 'shop' && r.category && r.category.startsWith(gId);
      const isSubActive = (gId, sId) => r.name === 'shop' && r.category === `${gId}/${sId}`;
      return (
        <React.Fragment>
          <header className="nav">
            <div className="nav-inner">
              <div className="nav-left">
                <button className="icon-btn" aria-label="menu"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ display: 'none' }}>
                  <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
                </button>
                {GENDERS.map(g => (
                  <div key={g.id} className="nav-dropdown">
                    <a
                      className={`nav-link ${isGenderActive(g.id) ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/shop/${g.id}`); }}
                      href={`#/shop/${g.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {g.label}
                      <Icon name="arrow-d" size={10} stroke={1.5} />
                    </a>
                    <div className="nav-dropdown-menu">
                      <span className="nav-dropdown-all"
                        onClick={() => navigate(`/shop/${g.id}`)}>
                        VER TUDO — {g.label.toUpperCase()}
                      </span>
                      <div className="nav-dropdown-divider" />
                      {g.subs.map(s => (
                        <a key={s.id}
                          className={isSubActive(g.id, s.id) ? 'active' : ''}
                          onClick={() => navigate(`/shop/${g.id}/${s.id}`)}>
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <a className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }} href="#/">
                <span className="brand-mark"></span>
                KARA
              </a>

              <div className="nav-right">
                {sbProfile?.role === 'admin' && (
                  <a className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} href="#/admin"
                     style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', opacity: 0.7 }}>
                    ADMIN
                  </a>
                )}
                <button className="icon-btn" aria-label="search" onClick={() => setSearchOpen(true)}>
                  <Icon name="search" />
                </button>
                <button className="icon-btn" aria-label="account" onClick={() => navigate('/account')}>
                  <Icon name="user" />
                </button>
                <button className="icon-btn" style={{ position: 'relative' }} aria-label="cart" onClick={() => setDrawerOpen(true)}>
                  <Icon name="bag" />
                  {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
                </button>
              </div>
            </div>
          </header>

          <MobileMenu />
        </React.Fragment>
      );
    }

    function MobileMenu() {
      const { mobileMenuOpen, setMobileMenuOpen, navigate } = useStore();
      const [openGender, setOpenGender] = React.useState(null);
      if (!mobileMenuOpen) return null;
      const go = (path) => { navigate(path); setMobileMenuOpen(false); };
      return (
        <div className="mobile-menu">
          {GENDERS.map(g => (
            <React.Fragment key={g.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <a onClick={() => go(`/shop/${g.id}`)}>{g.label}</a>
                <button className="icon-btn" onClick={() => setOpenGender(openGender === g.id ? null : g.id)}
                  style={{ marginRight: 24 }}>
                  <Icon name={openGender === g.id ? 'minus' : 'plus'} size={14} />
                </button>
              </div>
              {openGender === g.id && (
                <div style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column' }}>
                  {g.subs.map(s => (
                    <a key={s.id} onClick={() => go(`/shop/${g.id}/${s.id}`)}
                      style={{ fontSize: 13, color: 'var(--on-surface-variant)', padding: '8px 0' }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
          <a onClick={() => go('/account')}>Conta</a>
          <a onClick={() => go('/contact')}>Contacto</a>
        </div>
      );
    }

    function MiniCart() {
      const { drawerOpen, setDrawerOpen, cart, updateQty, removeFromCart, cartSubtotal, navigate, products: PRODUCTS } = useStore();
      return (
        <React.Fragment>
          <div className={`drawer-bg ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
          <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
            <div className="drawer-head">
              <div style={{ display: 'flex', alignPeças: 'baseline', gap: 12 }}>
                <span className="t-caps">Cart</span>
                <span className="t-mono" style={{ color: 'var(--muted)' }}>
                  [{String(cart.reduce((s, it) => s + it.qty, 0)).padStart(2, '0')}]
                </span>
              </div>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="close"><Icon name="close" /></button>
            </div>
            <div className="drawer-body">
              {cart.length === 0 && (
                <div className="empty" style={{ padding: '80px 24px' }}>
                  <Icon name="bag" size={28} stroke={1.2} />
                  <div className="t-h3" style={{ marginTop: 8 }}>O carrinho está vazio</div>
                  <div className="t-body-sm" style={{ maxWidth: 280 }}>Adiciona algumas peças e voltam a aparecer aqui.</div>
                  <button className="btn btn-primary" onClick={() => { setDrawerOpen(false); navigate('/shop'); }}>Explorar loja</button>
                </div>
              )}
              {cart.map(it => {
                const p = PRODUCTS.find(pp => pp.id === it.productId);
                if (!p) return null;
                const color = p.colors.find(c => c.id === it.color) || p.colors[0];
                return (
                  <div key={it.id} className="cart-row" style={{ padding: '20px 24px' }}>
                    <div className="cart-thumb">
                      <img src={p.images[0]} alt={p.name} />
                    </div>
                    <div className="cart-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span className="name">{p.name}</span>
                        <span className="name">€{(p.price * it.qty).toFixed(0)}</span>
                      </div>
                      <span className="meta">{color.label} · {it.size} · {p.sku}</span>
                      <div className="ctrls">
                        <div className="qty">
                          <button onClick={() => updateQty(it.id, it.qty - 1)} aria-label="decrease">
                            <Icon name="minus" size={12} />
                          </button>
                          <span className="v">{it.qty}</span>
                          <button onClick={() => updateQty(it.id, it.qty + 1)} aria-label="increase">
                            <Icon name="plus" size={12} />
                          </button>
                        </div>
                        <button className="btn-ghost" style={{ background: 'transparent', border: 0, color: 'var(--muted)', fontSize: 12, padding: 0 }}
                          onClick={() => removeFromCart(it.id)}>Remover</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="drawer-foot">
                <div className="summary-row">
                  <span className="lbl">Subtotal</span>
                  <span>€{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row" style={{ paddingBottom: 16 }}>
                  <span className="lbl t-mono-sm">Envio + impostos calculados no checkout</span>
                </div>
                <button className="btn btn-primary btn-block btn-lg" onClick={() => { setDrawerOpen(false); navigate('/checkout'); }}>
                  Checkout · €{cartSubtotal.toFixed(2)}
                </button>
                <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => { setDrawerOpen(false); navigate('/cart'); }}>
                  Ver carrinho completo
                </button>
              </div>
            )}
          </aside>
        </React.Fragment>
      );
    }

    function SearchOverlay() {
      const { searchOpen, setSearchOpen, navigate, products: PRODUCTS } = useStore();
      const [q, setQ] = useState('');
      const inputRef = useRef(null);
      useEffect(() => {
        if (searchOpen) {
          setTimeout(() => inputRef.current?.focus(), 50);
        } else {
          setQ('');
        }
      }, [searchOpen]);

      const results = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return PRODUCTS.slice(0, 4);
        return PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(t) ||
          p.type.toLowerCase().includes(t) ||
          p.category.toLowerCase().includes(t) ||
          p.sku.toLowerCase().includes(t)
        ).slice(0, 8);
      }, [q]);

      if (!searchOpen) return null;

      const goProduct = (id) => {
        setSearchOpen(false);
        navigate(`/product/${id}`);
      };

      return (
        <div className={`search-overlay ${searchOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="search-bar">
            <Icon name="search" size={20} stroke={1.2} />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar peças, categorias, SKU..." />
            <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="close"><Icon name="close" /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px var(--pad-page)' }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignPeças: 'baseline', marginBottom: 24 }}>
                <span className="t-caps muted">{q ? 'Resultados' : 'Sugestões'}</span>
                <span className="t-mono" style={{ color: 'var(--muted)' }}>{String(results.length).padStart(2, '0')} items</span>
              </div>
              <div className="plp-grid" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {results.map(p => (
                  <ProductCard key={p.id} product={p} onClick={() => goProduct(p.id)} />
                ))}
              </div>
              {results.length === 0 && (
                <div className="empty" style={{ padding: '60px 0' }}>
                  <div className="t-h3">Sem resultados para "{q}"</div>
                  <div className="t-body-sm">Tenta outra palavra ou explora o catálogo completo.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    function ProductCard({ product, onClick }) {
      const { wishlist, toggleWishlist, navigate } = useStore();
      const isFav = wishlist.includes(product.id);
      const handleClick = onClick || (() => navigate(`/product/${product.id}`));
      return (
        <div className="pcard" onClick={handleClick}>
          <div className="pcard-img">
            {product.tags && product.tags[0] && (
              <span className="pcard-badge tag">{product.tags[0]}</span>
            )}
            <button
              className={`pcard-fav ${isFav ? 'active' : ''}`}
              aria-label="wishlist"
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}>
              <Icon name={isFav ? 'heart-fill' : 'heart'} size={14} stroke={1.5} />
            </button>
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          </div>
          <div className="pcard-meta">
            <span className="name">{product.name}</span>
            <span className="price">€{product.price}</span>
            <span className="sku">{product.sku} · {product.colors.length} {product.colors.length === 1 ? 'cor' : 'cores'}</span>
          </div>
        </div>
      );
    }

    function Footer() {
      const { navigate } = useStore();
      const link = (path, label) => (
        <a onClick={(e) => { e.preventDefault(); navigate(path); }} href={`#${path}`}>{label}</a>
      );
      return (
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <div className="brand" style={{ marginBottom: 20 }}>
                  <span className="brand-mark"></span> KARA
                </div>
                <p className="t-body-sm" style={{ maxWidth: 320 }}>
                  Essenciais arquitetónicos. Construídos em pequenas séries, em Portugal e na Europa.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button className="icon-btn" aria-label="instagram"><Icon name="instagram" /></button>
                  <button className="icon-btn" aria-label="email"><Icon name="mail" /></button>
                </div>
              </div>
              <div className="footer-col">
                <h4>Shop</h4>
                <ul>
                  <li>{link('/shop', 'Todos os produtos')}</li>
                  <li>{link('/shop/tops', 'Tops')}</li>
                  <li>{link('/shop/bottoms', 'Bottoms')}</li>
                  <li>{link('/shop/outerwear', 'Outerwear')}</li>
                  <li>{link('/shop/accessories', 'Accessories')}</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Suporte</h4>
                <ul>
                  <li>{link('/contact', 'Contacto')}</li>
                  <li><a>Envios</a></li>
                  <li><a>Devoluções</a></li>
                  <li><a>Tabela de tamanhos</a></li>
                  <li><a>FAQ</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Empresa</h4>
                <ul>
                  <li><a>Sobre nós</a></li>
                  <li><a>Materiais</a></li>
                  <li><a>Sustentabilidade</a></li>
                  <li><a>Imprensa</a></li>
                  <li><a>Carreiras</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 KARA · Lisboa, PT</span>
              <span>EN · €EUR</span>
            </div>
          </div>
        </footer>
      );
    }

    function Toast() {
      const { toast } = useStore();
      return <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>;
    }

    function SupabaseBanner() {
      const [visible, setVisible] = useState(!window.__SUPABASE_CONFIGURED__);
      if (!visible) return null;
      return (
        <div style={{
          position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-container-high)', border: '1px solid var(--hairline-strong)',
          borderRadius: 'var(--r)', padding: '10px 16px', zIndex: 99,
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 12,
          color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', maxWidth: '90vw',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <span className="t-mono" style={{ color: 'var(--muted)' }}>SUPABASE</span>
          <span>Modo demonstração — configura o URL e a chave para ligar à BD</span>
          <button onClick={() => setVisible(false)} style={{
            background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer', fontSize: 14,
          }}>✕</button>
        </div>
      );
    }





    function PageHome() {
      const { navigate } = useStore();
      const featured = PRODUCTS.slice(0, 6);
      const newArrivals = PRODUCTS.filter(p => p.tags && p.tags.includes('Novo'));

      return (
        <div className="page">
          {/* HERO */}
          <section className="hero">
            <div className="hero-grid">
              <div className="hero-copy container" style={{ paddingLeft: 'var(--pad-page)', paddingRight: 'var(--pad-page)', maxWidth: 'none' }}>
                <div>
                  <div className="t-mono" style={{ color: 'var(--muted)', marginBottom: 24 }}>
                    SS26 / EDIÇÃO 04
                  </div>
                  <h1 className="t-display" style={{ margin: 0, marginBottom: 24 }}>
                    Feito para<br />durar.
                  </h1>
                  <p className="t-body" style={{ maxWidth: 440, color: 'var(--on-surface-variant)' }}>
                    Essenciais construídos em pequenas séries, com materiais auditados
                    e construções que envelhecem bem. Sem coleções, sem temporadas.
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>
                      Ver coleção <Icon name="arrow-r" size={14} />
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/shop/outerwear')}>
                      Outerwear
                    </button>
                  </div>
                  <div className="hero-meta">
                    <div>
                      <span className="lbl">Edição</span>
                      <span className="val">04 / 2026</span>
                    </div>
                    <div>
                      <span className="lbl">Produção</span>
                      <span className="val">Portugal · IT · JP</span>
                    </div>
                    <div>
                      <span className="lbl">Peças</span>
                      <span className="val">12 SKUs</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-img">
                <img src="https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1400&q=85&auto=format&fit=crop" alt="" />
              </div>
            </div>
          </section>

          {/* MARQUEE — technical readout */}
          <div className="marquee">
            <div className="marquee-track">
              <span>ENVIO GRÁTIS ACIMA DE €120 <span className="dot">·</span></span>
              <span>DEVOLUÇÕES EM 30 DIAS <span className="dot">·</span></span>
              <span>FABRICADO NA EU + JP <span className="dot">·</span></span>
              <span>NOVO: TYPE-04 FIELD COAT <span className="dot">·</span></span>
              <span>ENVIO GRÁTIS ACIMA DE €120 <span className="dot">·</span></span>
              <span>DEVOLUÇÕES EM 30 DIAS <span className="dot">·</span></span>
              <span>FABRICADO NA EU + JP <span className="dot">·</span></span>
              <span>NOVO: TYPE-04 FIELD COAT <span className="dot">·</span></span>
            </div>
          </div>

          {/* FEATURED — Index 01 */}
          <section className="section-tight">
            <div className="container">
              <div className="sec-head">
                <div className="left">
                  <span className="t-mono idx">[01]</span>
                  <h2 className="t-h1" style={{ margin: 0 }}>O Índice</h2>
                </div>
                <a className="t-caps muted" style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/shop')}>
                  Ver todos <Icon name="arrow-r" size={12} stroke={1.5} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                </a>
              </div>
              <div className="plp-grid" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {featured.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>

          {/* COLLECTIONS — split tiles */}
          <section className="section-tight">
            <div className="container">
              <div className="sec-head">
                <div className="left">
                  <span className="t-mono idx">[02]</span>
                  <h2 className="t-h1" style={{ margin: 0 }}>Coleções</h2>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="cat-tiles">
                <div className="collection-tile" onClick={() => navigate('/shop/homem')}>
                  <img src="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1400&q=85&auto=format&fit=crop" alt="" />
                  <div className="label">
                    <div>
                      <div className="t-caps muted" style={{ marginBottom: 6 }}>HOMEM · 12 PEÇAS</div>
                      <div className="t-h2" style={{ color: '#fff', margin: 0 }}>Coleção Homem</div>
                    </div>
                    <Icon name="arrow-r" size={20} />
                  </div>
                </div>
                <div className="collection-tile" onClick={() => navigate('/shop/mulher')}>
                  <img src="https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=1400&q=85&auto=format&fit=crop" alt="" />
                  <div className="label">
                    <div>
                      <div className="t-caps muted" style={{ marginBottom: 6 }}>MULHER · 10 PEÇAS</div>
                      <div className="t-h2" style={{ color: '#fff', margin: 0 }}>Coleção Mulher</div>
                    </div>
                    <Icon name="arrow-r" size={20} />
                  </div>
                </div>
              </div>
              <style>{`
            @media (max-width: 720px) {
              .cat-tiles { grid-template-columns: 1fr !important; }
            }
          `}</style>
            </div>
          </section>

          {/* MANIFESTO — large type spec block */}
          <section className="section-tight">
            <div className="container">
              <div style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '64px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 32 }} className="manifesto-row">
                  <div>
                    <div className="t-caps muted">[03]</div>
                    <div className="t-mono" style={{ marginTop: 12, color: 'var(--muted)' }}>MANIFESTO</div>
                  </div>
                  <div>
                    <p className="t-h1" style={{ margin: 0, maxWidth: 880, fontWeight: 500 }}>
                      Desenhamos peças para uso diário, não para mudança diária.<br />
                      <span style={{ color: 'var(--muted)' }}>Um padrão, refinado ao longo de anos. Fábricas auditadas. Garantias longas. Reparações bem-vindas.</span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--hairline)' }} className="stats-grid">
                      <Stat n="04" l="ateliers parceiros" />
                      <Stat n="08yr" l="de garantia" />
                      <Stat n="100%" l="materiais rastreados" />
                      <Stat n="0" l="promoções / saldos" />
                    </div>
                  </div>
                </div>
              </div>
              <style>{`
            @media (max-width: 720px) {
              .manifesto-row { grid-template-columns: 1fr !important; }
              .stats-grid { grid-template-columns: 1fr 1fr !important; }
            }
          `}</style>
            </div>
          </section>

          {/* NEW ARRIVALS */}
          <section className="section-tight">
            <div className="container">
              <div className="sec-head">
                <div className="left">
                  <span className="t-mono idx">[04]</span>
                  <h2 className="t-h1" style={{ margin: 0 }}>Novidades</h2>
                </div>
                <a className="t-caps muted" style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/shop')}>
                  Ver todos <Icon name="arrow-r" size={12} stroke={1.5} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                </a>
              </div>
              <div className="plp-grid" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>

          {/* SERVICES — strip of 4 */}
          <section style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', marginTop: 40 }}>
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--hairline)', margin: '0 calc(var(--pad-page) * -1)' }} className="svc-grid">
                <Service icon="truck" t="Envio neutro" s="Carbono compensado em todas as encomendas." />
                <Service icon="rotate" t="30 dias" s="Troca ou devolução gratuita em 30 dias." />
                <Service icon="shield" t="Garantia 8 anos" s="Reparações cobertas em peças construídas." />
                <Service icon="leaf" t="Materiais auditados" s="Cadeia de fornecimento totalmente rastreada." />
              </div>
              <style>{`
            @media (max-width: 720px) {
              .svc-grid { grid-template-columns: 1fr 1fr !important; }
            }
          `}</style>
            </div>
          </section>
        </div>
      );
    }

    function Stat({ n, l }) {
      return (
        <div>
          <div className="t-h2" style={{ margin: 0, marginBottom: 6 }}>{n}</div>
          <div className="t-caps muted">{l}</div>
        </div>
      );
    }

    function Service({ icon, t, s }) {
      return (
        <div style={{ background: 'var(--background)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Icon name={icon} size={22} stroke={1.4} />
          <div className="t-caps">{t}</div>
          <div className="t-body-sm">{s}</div>
        </div>
      );
    }





    function PageShop({ gender, sub }) {
      const { navigate, products: PRODUCTS } = useStore();
      const [color, setColor] = useState(null);
      const [size, setSize] = useState(null);
      const [priceMax, setPriceMax] = useState(500);
      const [sort, setSort] = useState('featured');

      const genderData = GENDERS.find(g => g.id === gender) || null;
      const subData = genderData && sub ? genderData.subs.find(s => s.id === sub) : null;

      const pageLabel = subData ? subData.label
        : genderData ? genderData.label
        : 'Todos os produtos';

      const filtered = useMemo(() => {
        let list = PRODUCTS.slice();
        if (gender) list = list.filter(p => p.gender === gender);
        if (sub) list = list.filter(p => p.category === sub);
        if (color) list = list.filter(p => p.colors.some(c => c.id === color));
        if (size) list = list.filter(p => p.available.includes(size));
        list = list.filter(p => p.price <= priceMax);
        switch (sort) {
          case 'price-asc': list.sort((a, b) => a.price - b.price); break;
          case 'price-desc': list.sort((a, b) => b.price - a.price); break;
          case 'new': list.sort((a, b) => (b.tags?.includes('Novo') ? 1 : 0) - (a.tags?.includes('Novo') ? 1 : 0)); break;
          default: break;
        }
        return list;
      }, [gender, sub, color, size, priceMax, sort, PRODUCTS]);

      const totalForScope = useMemo(() => {
        let list = PRODUCTS.slice();
        if (gender) list = list.filter(p => p.gender === gender);
        if (sub) list = list.filter(p => p.category === sub);
        return list.length;
      }, [gender, sub, PRODUCTS]);

      const sizes = useMemo(() => {
        const s = new Set();
        let base = PRODUCTS.slice();
        if (gender) base = base.filter(p => p.gender === gender);
        if (sub) base = base.filter(p => p.category === sub);
        base.forEach(p => p.sizes.forEach(sz => s.add(sz)));
        return Array.from(s);
      }, [gender, sub, PRODUCTS]);

      const sidebarSubs = genderData ? genderData.subs : [];

      return (
        <div className="page">
          <div className="container">
            <div className="plp-head">
              <div className="plp-crumb">
                <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
                <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                <a onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>SHOP</a>
                {genderData && (
                  <React.Fragment>
                    <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                    <a onClick={() => navigate(`/shop/${genderData.id}`)} style={{ cursor: 'pointer', color: !sub ? '#fff' : 'var(--muted)' }}>
                      {genderData.label.toUpperCase()}
                    </a>
                  </React.Fragment>
                )}
                {subData && (
                  <React.Fragment>
                    <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                    <span style={{ color: '#fff' }}>{subData.label.toUpperCase()}</span>
                  </React.Fragment>
                )}
              </div>
              <div className="row">
                <div>
                  <h1 className="t-h1" style={{ margin: 0 }}>{pageLabel}</h1>
                  <p className="t-body-sm" style={{ marginTop: 8, maxWidth: 520 }}>
                    Pequenas séries em materiais auditados. Construídos para durar décadas.
                  </p>
                </div>
                <span className="t-mono" style={{ color: 'var(--muted)' }}>
                  [{String(filtered.length).padStart(2, '0')}/{String(totalForScope).padStart(2, '0')}]
                </span>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="plp-layout">
              <aside className="plp-filters">
                {/* Gender selector */}
                <div className="filter-group">
                  <h4>Secção</h4>
                  <div className="filter-list">
                    <a className="check" onClick={() => navigate('/shop')}
                      style={{ cursor: 'pointer', color: !gender ? '#fff' : 'var(--on-surface-variant)' }}>
                      <span style={{ fontSize: 13 }}>Tudo</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{PRODUCTS.length}</span>
                    </a>
                    {GENDERS.map(g => (
                      <a key={g.id} className="check" onClick={() => navigate(`/shop/${g.id}`)}
                        style={{ cursor: 'pointer', color: gender === g.id ? '#fff' : 'var(--on-surface-variant)' }}>
                        <span style={{ fontSize: 13 }}>{g.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                          {PRODUCTS.filter(p => p.gender === g.id).length}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Subcategory selector (only shown when a gender is selected) */}
                {sidebarSubs.length > 0 && (
                  <div className="filter-group">
                    <h4>Categoria</h4>
                    <div className="filter-list">
                      <a className="check" onClick={() => navigate(`/shop/${genderData.id}`)}
                        style={{ cursor: 'pointer', color: !sub ? '#fff' : 'var(--on-surface-variant)' }}>
                        <span style={{ fontSize: 13 }}>Tudo {genderData.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                          {PRODUCTS.filter(p => p.gender === genderData.id).length}
                        </span>
                      </a>
                      {sidebarSubs.map(s => (
                        <a key={s.id} className="check"
                          onClick={() => navigate(`/shop/${genderData.id}/${s.id}`)}
                          style={{ cursor: 'pointer', color: sub === s.id ? '#fff' : 'var(--on-surface-variant)' }}>
                          <span style={{ fontSize: 13 }}>{s.label}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                            {PRODUCTS.filter(p => p.gender === genderData.id && p.category === s.id).length}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="filter-group">
                  <h4>Cor</h4>
                  <div className="swatch-row">
                    {ALL_COLORS.map(c => (
                      <button key={c.id} className={`swatch ${color === c.id ? 'active' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => setColor(color === c.id ? null : c.id)}
                        aria-label={c.label} title={c.label} />
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Tamanho</h4>
                  <div className="size-row">
                    {sizes.map(sz => (
                      <button key={sz} className={`size-chip ${size === sz ? 'active' : ''}`}
                        onClick={() => setSize(size === sz ? null : sz)}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Preço — máx. €{priceMax}</h4>
                  <input type="range" min={50} max={500} step={10} value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                    <span>€50</span><span>€500</span>
                  </div>
                </div>

                {(color || size || priceMax < 500) && (
                  <button className="btn btn-secondary btn-block btn-sm" style={{ marginTop: 24 }}
                    onClick={() => { setColor(null); setSize(null); setPriceMax(500); }}>
                    Limpar filtros
                  </button>
                )}
              </aside>

              <div className="plp-main">
                <div className="plp-toolbar">
                  <span className="count">[{String(filtered.length).padStart(2, '0')}] resultados</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="t-mono" style={{ color: 'var(--muted)', fontSize: 10 }}>ORDENAR</span>
                    <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="featured">Destaque</option>
                      <option value="new">Novidades</option>
                      <option value="price-asc">Preço — crescente</option>
                      <option value="price-desc">Preço — decrescente</option>
                    </select>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="empty" style={{ padding: 80 }}>
                    <div className="t-h3">Sem resultados</div>
                    <div className="t-body-sm">Ajusta os filtros para ver mais peças.</div>
                    <button className="btn btn-secondary"
                      onClick={() => { setColor(null); setSize(null); setPriceMax(500); }}>
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <div className="plp-grid">
                    {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }





    function PageProduct({ productId }) {
      const { navigate, addToCart, wishlist, toggleWishlist, products: storeProducts } = useStore();
      const product = storeProducts.find(p => p.id === productId) || storeProducts[0];
      const [colorIdx, setColorIdx] = useState(0);
      const [size, setSize] = useState(null);
      const [openSection, setOpenSection] = useState('details');
      const [imgIdx, setImgIdx] = useState(0);

      useEffect(() => {
        setColorIdx(0);
        setSize(null);
        setImgIdx(0);
      }, [productId]);

      const color = product.colors[colorIdx];
      const isFav = wishlist.includes(product.id);

      const related = storeProducts.filter(p => p.gender === product.gender && p.category === product.category && p.id !== product.id).slice(0, 4);

      const handleAdd = () => {
        if (!size) return;
        addToCart(product.id, color.id, size, 1);
      };

      const sectionToggle = (key) => setOpenSection(openSection === key ? null : key);

      return (
        <div className="page">
          <div className="container">
            <div className="plp-crumb" style={{ padding: '24px 0', borderBottom: '1px solid var(--hairline)' }}>
              <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
              <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
              <a onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>SHOP</a>
              <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
              <a onClick={() => navigate(`/shop/${product.category}`)} style={{ cursor: 'pointer' }}>
                {product.category.toUpperCase()}
              </a>
              <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
              <span style={{ color: '#fff' }}>{product.name.toUpperCase()}</span>
            </div>
          </div>

          <div className="container">
            <div className="pdp">
              {/* GALLERY */}
              <div className="pdp-gallery">
                {product.images.map((src, i) => (
                  <div key={i} className="ph">
                    <img src={src} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>

              {/* INFO */}
              <div className="pdp-info">
                <div className="pdp-head">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignPeças: 'flex-start', gap: 16 }}>
                    <div>
                      <div className="t-mono" style={{ color: 'var(--muted)', marginBottom: 8 }}>
                        {product.sku}
                      </div>
                      <h1 className="t-h1" style={{ margin: 0 }}>{product.name}</h1>
                    </div>
                    <button className={`icon-btn`} onClick={() => toggleWishlist(product.id)} aria-label="wishlist"
                      style={{ borderColor: isFav ? '#fff' : 'var(--hairline-strong)', color: '#fff' }}>
                      <Icon name={isFav ? 'heart-fill' : 'heart'} />
                    </button>
                  </div>
                  <div className="t-h2" style={{ marginTop: 8 }}>€{product.price}</div>
                  <p className="t-body-sm" style={{ marginTop: 4 }}>
                    {product.description}
                  </p>
                  {product.tags && product.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {product.tags.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                  {product.reviewCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      <span style={{ color: '#fff', fontSize: 13 }}>
                        {'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {Number(product.avgRating).toFixed(1)} ({product.reviewCount} {product.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    </div>
                  )}
                </div>

                {/* COLOR */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="t-caps muted">Cor</span>
                    <span className="t-body-sm">{color.label}</span>
                  </div>
                  <div className="swatch-row">
                    {product.colors.map((c, i) => (
                      <button key={c.id} className={`swatch ${colorIdx === i ? 'active' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => setColorIdx(i)}
                        aria-label={c.label}
                        title={c.label} />
                    ))}
                  </div>
                </div>

                {/* SIZE */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="t-caps muted">Tamanho</span>
                    <a className="t-body-sm muted" style={{ cursor: 'pointer' }}>Tabela de tamanhos</a>
                  </div>
                  <div className="size-row">
                    {product.sizes.map(sz => {
                      const avail = product.available.includes(sz);
                      return (
                        <button key={sz} className={`size-chip ${size === sz ? 'active' : ''}`}
                          disabled={!avail}
                          onClick={() => setSize(sz)}>
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-primary btn-lg btn-block" onClick={handleAdd} disabled={!size}>
                    {size ? `Adicionar — €${product.price}` : 'Seleciona um tamanho'}
                  </button>
                  <div style={{ display: 'flex', gap: 12, alignPeças: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                    <Icon name="truck" size={14} stroke={1.4} />
                    <span>Envio gratuito acima de €120 · Devoluções em 30 dias</span>
                  </div>
                </div>

                {/* SPECS / SECTIONS */}
                <div>
                  <DisclosureRow open={openSection === 'details'} onToggle={() => sectionToggle('details')} title="Detalhes">
                    <div>
                      <PdpSpecRow lbl="Tipo" val={product.type} />
                      <PdpSpecRow lbl="Material" val={product.materials.join(', ')} />
                      <PdpSpecRow lbl="Peso" val={product.weight} />
                      <PdpSpecRow lbl="Origem" val={product.origin} />
                      <PdpSpecRow lbl="SKU" val={product.sku} mono />
                    </div>
                  </DisclosureRow>
                  <DisclosureRow open={openSection === 'care'} onToggle={() => sectionToggle('care')} title="Cuidados">
                    <p className="t-body-sm" style={{ margin: 0 }}>
                      Lavar a 30°C com peças semelhantes. Não usar lixívia. Secar à sombra. Engomar a temperatura média se necessário.
                    </p>
                  </DisclosureRow>
                  <DisclosureRow open={openSection === 'ship'} onToggle={() => sectionToggle('ship')} title="Envio & devoluções">
                    <p className="t-body-sm" style={{ margin: 0 }}>
                      Envio standard 3–5 dias úteis (€4,95) ou express 1–2 dias úteis (€9,95). Grátis acima de €120. Devoluções gratuitas em 30 dias.
                    </p>
                  </DisclosureRow>
                </div>
              </div>
            </div>
          </div>

          {/* RELATED */}
          <section className="section-tight">
            <div className="container">
              <div className="sec-head">
                <div className="left">
                  <span className="t-mono idx">[REL]</span>
                  <h2 className="t-h2" style={{ margin: 0 }}>Relacionados</h2>
                </div>
              </div>
              <div className="plp-grid" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        </div>
      );
    }

    function PdpSpecRow({ lbl, val, mono }) {
      return (
        <div className="pdp-feature-row">
          <span className="lbl">{lbl}</span>
          <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: mono ? 12 : 13 }}>{val}</span>
        </div>
      );
    }

    function DisclosureRow({ open, onToggle, title, children }) {
      return (
        <div style={{ borderTop: '1px solid var(--hairline)' }}>
          <button onClick={onToggle}
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignPeças: 'center',
              background: 'transparent', border: 0, padding: '18px 0', color: '#fff',
              fontSize: 13, fontWeight: 500, letterSpacing: '0.02em', cursor: 'pointer'
            }}>
            <span>{title}</span>
            <Icon name={open ? 'minus' : 'plus'} size={14} stroke={1.5} />
          </button>
          {open && <div style={{ paddingBottom: 20 }}>{children}</div>}
        </div>
      );
    }





    function PageCart() {
      const { cart, updateQty, removeFromCart, cartSubtotal, navigate, products: PRODUCTS } = useStore();
      const shipping = cartSubtotal >= 120 ? 0 : 4.95;
      const tax = cartSubtotal * 0.23;
      const total = cartSubtotal + shipping;

      if (cart.length === 0) {
        return (
          <div className="page">
            <div className="container">
              <div className="page-head">
                <div className="crumb">
                  <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
                  <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                  <span style={{ color: '#fff' }}>CART</span>
                </div>
                <h1 className="t-h1" style={{ margin: 0 }}>Carrinho</h1>
              </div>
              <div className="empty">
                <Icon name="bag" size={36} stroke={1.2} />
                <div className="t-h2" style={{ margin: 0 }}>O teu carrinho está vazio</div>
                <p className="t-body-sm" style={{ maxWidth: 360, textAlign: 'center' }}>
                  Explora os essenciais — peças construídas para durar.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>
                  Explorar loja
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="page">
          <div className="container">
            <div className="page-head">
              <div className="crumb">
                <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
                <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                <span style={{ color: '#fff' }}>CART</span>
              </div>
              <div style={{ display: 'flex', alignPeças: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <h1 className="t-h1" style={{ margin: 0 }}>Carrinho</h1>
                <span className="t-mono" style={{ color: 'var(--muted)' }}>
                  [{String(cart.reduce((s, it) => s + it.qty, 0)).padStart(2, '0')}] artigos
                </span>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map(it => {
                  const p = PRODUCTS.find(pp => pp.id === it.productId);
                  if (!p) return null;
                  const c = p.colors.find(cc => cc.id === it.color) || p.colors[0];
                  return (
                    <div key={it.id} className="cart-row">
                      <div className="cart-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                        <img src={p.images[0]} alt={p.name} />
                      </div>
                      <div className="cart-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span className="name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</span>
                          <span className="name">€{(p.price * it.qty).toFixed(2)}</span>
                        </div>
                        <span className="meta">{c.label} · {it.size} · {p.sku}</span>
                        <div className="ctrls">
                          <div className="qty">
                            <button onClick={() => updateQty(it.id, it.qty - 1)} aria-label="decrease"><Icon name="minus" size={12} /></button>
                            <span className="v">{it.qty}</span>
                            <button onClick={() => updateQty(it.id, it.qty + 1)} aria-label="increase"><Icon name="plus" size={12} /></button>
                          </div>
                          <button style={{ background: 'transparent', border: 0, color: 'var(--muted)', fontSize: 12, padding: 0, cursor: 'pointer' }}
                            onClick={() => removeFromCart(it.id)}>Remover</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="t-caps muted" style={{ marginBottom: 20 }}>Resumo</div>
                <div className="summary-row"><span className="lbl">Subtotal</span><span>€{cartSubtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span className="lbl">Envio</span><span>{shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`}</span></div>
                <div className="summary-row"><span className="lbl">IVA incluído (23%)</span><span>€{tax.toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total</span><span>€{total.toFixed(2)}</span></div>

                {cartSubtotal < 120 && (
                  <div style={{
                    marginTop: 16, padding: 14,
                    border: '1px solid var(--hairline)', borderRadius: 'var(--r)',
                    fontSize: 12, color: 'var(--on-surface-variant)'
                  }}>
                    <div style={{ marginBottom: 8 }}>Faltam <strong style={{ color: '#fff' }}>€{(120 - cartSubtotal).toFixed(2)}</strong> para envio gratuito</div>
                    <div style={{ height: 4, background: 'var(--hairline)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (cartSubtotal / 120) * 100)}%`, background: '#fff' }}></div>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }}
                  onClick={() => navigate('/checkout')}>
                  Checkout · €{total.toFixed(2)} <Icon name="arrow-r" size={14} />
                </button>
                <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => navigate('/shop')}>
                  Continuar a comprar
                </button>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SmallNote icon="truck" t="Envio gratuito acima de €120" />
                  <SmallNote icon="rotate" t="Devoluções gratuitas em 30 dias" />
                  <SmallNote icon="shield" t="Garantia de 8 anos em peças construídas" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    function SmallNote({ icon, t }) {
      return (
        <div style={{ display: 'flex', alignPeças: 'center', gap: 10, fontSize: 12, color: 'var(--on-surface-variant)' }}>
          <Icon name={icon} size={14} stroke={1.4} />
          <span>{t}</span>
        </div>
      );
    }





    function PageCheckout() {
      const { cart, cartSubtotal, navigate, clearCart, showToast, products: PRODUCTS, sbUser } = useStore();
      const [step, setStep] = useState(1);
      const [shipMethod, setShipMethod] = useState('standard');
      const [payMethod, setPayMethod] = useState('card');
      const [done, setDone] = useState(false);
      const [orderRef, setOrderRef] = useState(null);

      const shipObj = SHIPPING.find(s => s.id === shipMethod) || SHIPPING[0];
      const shipping = cartSubtotal >= 120 && shipMethod === 'standard' ? 0 : shipObj.price;
      const tax = cartSubtotal * 0.23;
      const total = cartSubtotal + shipping;

      // Form state
      const [form, setForm] = useState({
        email: '', firstName: '', lastName: '',
        address: '', city: '', postal: '', country: 'Portugal',
        phone: '',
        cardNumber: '', cardName: '', expiry: '', cvc: '',
        notes: '',
      });
      const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

      // Pre-fill email for logged-in users
      useEffect(() => {
        if (sbUser?.email && !form.email) set('email', sbUser.email);
      }, [sbUser]);

      // Empty cart redirect
      useEffect(() => {
        if (cart.length === 0 && !done) navigate('/cart');
      }, [cart.length, done, navigate]);

      const placeOrder = async () => {
        let ref = 'KR-' + Math.floor(Math.random() * 900000 + 100000);
        try {
          if (window.__SUPABASE_CONFIGURED__ && sbUser) {
            const orderItems = cart.map(it => {
              const p = PRODUCTS.find(pp => pp.id === it.productId);
              const c = p?.colors.find(cc => cc.id === it.color) || p?.colors[0];
              return {
                name:       p?.name || '',
                sku:        p?.sku  || '',
                colorLabel: c?.label || '',
                size:       it.size,
                image:      p?.images?.[0] || null,
                qty:        it.qty,
                price:      p?.price || 0,
              };
            });
            ref = await SupabaseAPI.placeOrder({
              email:        sbUser.email,
              profile_id:   sbUser.id,
              items:        orderItems,
              ship: {
                firstName: form.firstName,
                lastName:  form.lastName,
                address:   form.address,
                city:      form.city,
                postal:    form.postal,
                country:   form.country,
                phone:     form.phone,
              },
              method:       shipMethod,
              payMethod,
              subtotal:     cartSubtotal,
              shippingCost: shipping,
              tax:          cartSubtotal * 0.23,
              total,
              notes:        form.notes,
            });
          }
        } catch (e) { console.warn('Checkout error', e); }
        setOrderRef(ref);
        setDone(true);
        showToast('Encomenda confirmada');
        setTimeout(() => clearCart(), 200);
      };

      if (done) {
        return (
          <div className="page">
            <div className="container">
              <div style={{
                maxWidth: 560, margin: '80px auto', padding: 48,
                border: '1px solid var(--hairline)', borderRadius: 'var(--r)', textAlign: 'center'
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '1px solid #fff', margin: '0 auto 24px',
                  display: 'flex', alignPeças: 'center', justifyContent: 'center'
                }}>
                  <Icon name="check" size={24} stroke={1.5} />
                </div>
                <div className="t-caps muted" style={{ marginBottom: 16 }}>ENCOMENDA CONFIRMADA</div>
                <h1 className="t-h1" style={{ margin: 0, marginBottom: 16 }}>Obrigado pela tua encomenda</h1>
                <p className="t-body-sm" style={{ marginBottom: 32 }}>
                  Recebemos a tua encomenda e enviámos uma confirmação para <strong style={{ color: '#fff' }}>{form.email || 'o teu e-mail'}</strong>.
                </p>
                <div style={{
                  borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)',
                  padding: '20px 0', margin: '0 0 32px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left'
                }}>
                  <div>
                    <div className="t-caps muted" style={{ marginBottom: 8 }}>Ref. Encomenda</div>
                    <div className="t-mono" style={{ fontSize: 13 }}>{orderRef}</div>
                  </div>
                  <div>
                    <div className="t-caps muted" style={{ marginBottom: 8 }}>Total</div>
                    <div className="t-mono" style={{ fontSize: 13 }}>€{total.toFixed(2)}</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/')}>
                  Voltar à página inicial
                </button>
                <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => navigate('/shop')}>
                  Continuar a comprar
                </button>
              </div>
            </div>
          </div>
        );
      }

      const validStep1 = form.email && form.firstName && form.lastName && form.address && form.city && form.postal;
      const validStep2 = !!shipMethod;
      const validStep3 = payMethod === 'paypal' || (form.cardNumber && form.expiry && form.cvc);

      return (
        <div className="page">
          <div className="container">
            <div className="page-head">
              <div className="crumb">
                <a onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>CART</a>
                <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                <span style={{ color: '#fff' }}>CHECKOUT</span>
              </div>
              <h1 className="t-h1" style={{ margin: 0 }}>Checkout</h1>
            </div>
          </div>

          <div className="container">
            <div className="checkout-layout">
              <div className="checkout-form">
                <div className="steps">
                  <div className={`step ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
                    <span className="n">{step > 1 ? <Icon name="check" size={10} stroke={2} /> : '01'}</span>
                    <span>Morada</span>
                  </div>
                  <div className={`step ${step === 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
                    <span className="n">{step > 2 ? <Icon name="check" size={10} stroke={2} /> : '02'}</span>
                    <span>Envio</span>
                  </div>
                  <div className={`step ${step === 3 ? 'active' : ''}`}>
                    <span className="n">03</span>
                    <span>Pagamento</span>
                  </div>
                </div>

                {step === 1 && (
                  <div>
                    <h3 className="t-h3" style={{ margin: 0, marginBottom: 24 }}>Informação de contacto</h3>
                    <div className="form-grid">
                      <div className="full">
                        <label className="field-label">Email</label>
                        <input className="input" type="email" value={form.email}
                          onChange={(e) => set('email', e.target.value)} placeholder="tu@email.com" />
                      </div>
                      <div>
                        <label className="field-label">Primeiro nome</label>
                        <input className="input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                      </div>
                      <div>
                        <label className="field-label">Apelido</label>
                        <input className="input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                      </div>
                      <div className="full">
                        <label className="field-label">Morada</label>
                        <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)}
                          placeholder="Rua, número, andar" />
                      </div>
                      <div>
                        <label className="field-label">Cidade</label>
                        <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
                      </div>
                      <div>
                        <label className="field-label">Código postal</label>
                        <input className="input" value={form.postal} onChange={(e) => set('postal', e.target.value)} placeholder="0000-000" />
                      </div>
                      <div>
                        <label className="field-label">País</label>
                        <select className="select" value={form.country} onChange={(e) => set('country', e.target.value)}>
                          <option>Portugal</option><option>Espanha</option><option>França</option>
                          <option>Itália</option><option>Alemanha</option><option>Reino Unido</option>
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Telefone</label>
                        <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+351..." />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                      <button className="btn btn-ghost" onClick={() => navigate('/cart')}>
                        <Icon name="arrow-l" size={14} /> Voltar ao carrinho
                      </button>
                      <button className="btn btn-primary btn-lg" disabled={!validStep1} onClick={() => setStep(2)}>
                        Continuar para envio <Icon name="arrow-r" size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="t-h3" style={{ margin: 0, marginBottom: 24 }}>Método de envio</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {SHIPPING.map(s => (
                        <label key={s.id} className={`shipping-option ${shipMethod === s.id ? 'active' : ''}`}>
                          <input type="radio" name="ship" hidden checked={shipMethod === s.id} onChange={() => setShipMethod(s.id)} />
                          <span className={`radio ${shipMethod === s.id ? 'active' : ''}`} style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: `1px solid ${shipMethod === s.id ? '#fff' : 'var(--hairline-strong)'}`,
                            display: 'inline-flex', alignPeças: 'center', justifyContent: 'center',
                          }}>
                            {shipMethod === s.id && <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%' }}></span>}
                          </span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                            {s.price === 0 || (cartSubtotal >= 120 && s.id === 'standard') ? 'Grátis' : `€${s.price.toFixed(2)}`}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <label className="field-label">Notas (opcional)</label>
                      <textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)}
                        placeholder="Instruções de entrega, presente, etc."></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                      <button className="btn btn-ghost" onClick={() => setStep(1)}>
                        <Icon name="arrow-l" size={14} /> Voltar
                      </button>
                      <button className="btn btn-primary btn-lg" disabled={!validStep2} onClick={() => setStep(3)}>
                        Continuar para pagamento <Icon name="arrow-r" size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="t-h3" style={{ margin: 0, marginBottom: 24 }}>Pagamento</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      <label className={`payment-method ${payMethod === 'card' ? 'active' : ''}`}>
                        <input type="radio" name="pay" hidden checked={payMethod === 'card'} onChange={() => setPayMethod('card')} />
                        <span className="radio"></span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Cartão de crédito / débito</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>VISA · MC · AMEX</span>
                      </label>
                      <label className={`payment-method ${payMethod === 'paypal' ? 'active' : ''}`}>
                        <input type="radio" name="pay" hidden checked={payMethod === 'paypal'} onChange={() => setPayMethod('paypal')} />
                        <span className="radio"></span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>PayPal</span>
                      </label>
                      <label className={`payment-method ${payMethod === 'mbway' ? 'active' : ''}`}>
                        <input type="radio" name="pay" hidden checked={payMethod === 'mbway'} onChange={() => setPayMethod('mbway')} />
                        <span className="radio"></span>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>MB WAY</span>
                      </label>
                    </div>

                    {payMethod === 'card' && (
                      <div className="form-grid">
                        <div className="full">
                          <label className="field-label">Número do cartão</label>
                          <input className="input" value={form.cardNumber} onChange={(e) => set('cardNumber', e.target.value)}
                            placeholder="0000 0000 0000 0000" maxLength={19} />
                        </div>
                        <div className="full">
                          <label className="field-label">Nome no cartão</label>
                          <input className="input" value={form.cardName} onChange={(e) => set('cardName', e.target.value)} />
                        </div>
                        <div>
                          <label className="field-label">Validade</label>
                          <input className="input" value={form.expiry} onChange={(e) => set('expiry', e.target.value)} placeholder="MM/AA" />
                        </div>
                        <div>
                          <label className="field-label">CVC</label>
                          <input className="input" value={form.cvc} onChange={(e) => set('cvc', e.target.value)} placeholder="000" maxLength={4} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignPeças: 'center', gap: 8, marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
                      <Icon name="shield" size={14} stroke={1.4} />
                      <span>Pagamento encriptado · Os dados não são guardados.</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                      <button className="btn btn-ghost" onClick={() => setStep(2)}>
                        <Icon name="arrow-l" size={14} /> Voltar
                      </button>
                      <button className="btn btn-primary btn-lg" disabled={!validStep3} onClick={placeOrder}>
                        Confirmar encomenda · €{total.toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              <div className="checkout-side">
                <div className="t-caps muted" style={{ marginBottom: 20 }}>Encomenda · {cart.reduce((s, it) => s + it.qty, 0)} artigos</div>
                <div>
                  {cart.map(it => {
                    const p = PRODUCTS.find(pp => pp.id === it.productId);
                    if (!p) return null;
                    const c = p.colors.find(cc => cc.id === it.color) || p.colors[0];
                    return (
                      <div key={it.id} className="summary-item">
                        <div className="thumb">
                          <img src={p.images[0]} alt={p.name} />
                          <span className="qbadge">{it.qty}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{c.label} · {it.size}</div>
                        </div>
                        <div style={{ fontSize: 13 }}>€{(p.price * it.qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 24 }}>
                  <div className="summary-row"><span className="lbl">Subtotal</span><span>€{cartSubtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span className="lbl">Envio ({shipObj.label})</span><span>{shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`}</span></div>
                  <div className="summary-row"><span className="lbl">IVA incluído (23%)</span><span>€{tax.toFixed(2)}</span></div>
                  <div className="summary-row total"><span>Total</span><span>€{total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }





    function PageAccount() {
      const { authed, setAuthed, navigate, wishlist, toggleWishlist, sbUser, sbProfile, setSbProfile, showToast, products: storeProducts } = useStore();
      const [tab, setTab] = useState('login');
      const [section, setSection] = useState('orders');

      const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
      const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

      useEffect(() => {
        if (sbUser || sbProfile) {
          setForm({
            email: sbUser?.email || '',
            password: '',
            firstName: sbProfile?.first_name || '',
            lastName: sbProfile?.last_name || '',
          });
        }
      }, [sbUser, sbProfile]);

      if (!authed) {
        return (
          <div className="page">
            <div className="container">
              <div className="auth">
                <div className="auth-tabs">
                  <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Entrar</button>
                  <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Criar conta</button>
                </div>

                {tab === 'login' ? (
                  <React.Fragment>
                    <h2 className="t-h2" style={{ margin: 0, marginBottom: 8 }}>Bem-vindo de volta</h2>
                    <p className="t-body-sm" style={{ marginBottom: 24 }}>Acede às tuas encomendas e lista de desejos.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="field-label">Email</label>
                        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@email.com" />
                      </div>
                      <div>
                        <label className="field-label">Palavra-passe</label>
                        <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignPeças: 'center' }}>
                        <label className="check">
                          <input type="checkbox" />
                          <span className="box"></span>
                          <span>Lembrar-me</span>
                        </label>
                        <a className="t-body-sm muted" style={{ cursor: 'pointer' }} onClick={async () => {
                          if (!form.email) { showToast('Introduz o teu e-mail primeiro'); return; }
                          if (window.__SUPABASE_CONFIGURED__) {
                            try {
                              const { error } = await window.supabaseClient.auth.resetPasswordForEmail(form.email, {
                                redirectTo: window.location.origin + window.location.pathname,
                              });
                              if (error) throw error;
                              showToast('E-mail de recuperação enviado');
                            } catch (e) { showToast('Erro ao enviar e-mail de recuperação'); }
                          }
                        }}>Esqueci a palavra-passe</a>
                      </div>
                      <button className="btn btn-primary btn-lg btn-block" onClick={async () => {
                        if (window.__SUPABASE_CONFIGURED__) {
                          try {
                            await SupabaseAPI.signIn(form.email, form.password);
                            navigate('/account');
                          } catch (e) { showToast(e.message || 'Credenciais inválidas'); }
                        } else { setAuthed(true); }
                      }}>
                        Entrar
                      </button>
                      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '8px 0' }}>OU</div>
                      <button className="btn btn-secondary btn-block">Continuar com Apple</button>
                      <button className="btn btn-secondary btn-block">Continuar com Google</button>
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <h2 className="t-h2" style={{ margin: 0, marginBottom: 8 }}>Cria a tua conta</h2>
                    <p className="t-body-sm" style={{ marginBottom: 24 }}>Encomendas mais rápidas e acesso a edições limitadas.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="form-grid">
                        <div>
                          <label className="field-label">Primeiro nome</label>
                          <input className="input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                        </div>
                        <div>
                          <label className="field-label">Apelido</label>
                          <input className="input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Email</label>
                        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                      </div>
                      <div>
                        <label className="field-label">Palavra-passe</label>
                        <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
                      </div>
                      <label className="check">
                        <input type="checkbox" />
                        <span className="box"></span>
                        <span>Quero receber novidades sobre lançamentos</span>
                      </label>
                      <button className="btn btn-primary btn-lg btn-block" onClick={async () => {
                        if (window.__SUPABASE_CONFIGURED__) {
                          try {
                            await SupabaseAPI.signUp(form.email, form.password, form.firstName, form.lastName);
                            showToast('Confirma o e-mail para activar a conta');
                            navigate('/account');
                          } catch (e) { showToast(e.message || 'Erro ao criar conta'); }
                        } else { setAuthed(true); }
                      }}>
                        Criar conta
                      </button>
                    </div>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        );
      }

      // AUTHED VIEW
      const wishlistProducts = storeProducts.filter(p => wishlist.includes(p.id));

      return (
        <div className="page">
          <div className="container">
            <div className="page-head">
              <div className="crumb">
                <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
                <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                <span style={{ color: '#fff' }}>ACCOUNT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignPeças: 'baseline', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 className="t-h1" style={{ margin: 0 }}>Olá, {sbProfile?.first_name || sbUser?.email?.split('@')[0] || 'Cliente'}</h1>
                  {sbProfile?.customer_ref && (
                    <div className="t-mono" style={{ color: 'var(--muted)', marginTop: 8 }}>
                      {sbProfile.customer_ref}
                    </div>
                  )}
                </div>
                <button className="btn btn-secondary" onClick={async () => {
                  if (window.__SUPABASE_CONFIGURED__) await SupabaseAPI.signOut();
                  setAuthed(false);
                }}>Terminar sessão</button>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="account-layout">
              <aside className="account-side">
                <a className={section === 'orders' ? 'active' : ''} onClick={() => setSection('orders')}>Encomendas</a>
                <a className={section === 'wishlist' ? 'active' : ''} onClick={() => setSection('wishlist')}>
                  Lista de desejos <span style={{ marginLeft: 4, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>({wishlist.length})</span>
                </a>
                <a className={section === 'addresses' ? 'active' : ''} onClick={() => setSection('addresses')}>Moradas</a>
                <a className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}>Perfil</a>
                <a className={section === 'newsletter' ? 'active' : ''} onClick={() => setSection('newsletter')}>Newsletter</a>
              </aside>

              <div className="account-main">
                {section === 'orders' && <OrdersSection />}
                {section === 'wishlist' && (
                  <div>
                    <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Lista de desejos</h2>
                    {wishlistProducts.length === 0 ? (
                      <div className="empty" style={{ padding: '60px 0' }}>
                        <Icon name="heart" size={28} stroke={1.2} />
                        <div className="t-h3">A tua lista de desejos está vazia</div>
                        <button className="btn btn-secondary" onClick={() => navigate('/shop')}>Explorar loja</button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'var(--hairline)', border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                        {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    )}
                  </div>
                )}
                {section === 'addresses' && <AddressesSection />}
                {section === 'profile' && <ProfileSection form={form} setForm={setForm} />}
                {section === 'newsletter' && <NewsletterSection />}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const ORDER_STATUS_LABEL = {
      pending: 'Pendente', confirmed: 'Confirmado', processing: 'Em preparação',
      shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
    };
    const ORDER_STATUS_COLOR = {
      pending: 'var(--muted)', confirmed: 'var(--muted)', processing: 'var(--muted)',
      shipped: '#fff', delivered: '#fff', cancelled: 'var(--muted)', refunded: 'var(--muted)',
    };

    function OrdersSection() {
      const { sbUser, navigate } = useStore();
      const [orders, setOrders] = useState(null);
      const [detail, setDetail] = useState(null); // { order, items, loading }

      useEffect(() => {
        if (!sbUser || !window.__SUPABASE_CONFIGURED__) { setOrders([]); return; }
        SupabaseAPI.getOrders(sbUser.id).then(data => {
          setOrders((data || []).map(o => ({
            dbId:  o.id,
            id:    o.order_ref,
            date:  new Date(o.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
            total: Number(o.total),
            status: o.status,
            items: (o.order_items || []).length,
            ship:  [o.ship_first_name, o.ship_last_name].filter(Boolean).join(' '),
            address: [o.ship_address_1, o.ship_city, o.ship_postal].filter(Boolean).join(', '),
            method: o.shipping_method,
          })));
        });
      }, [sbUser]);

      const openDetail = async (o) => {
        setDetail({ order: o, items: null, loading: true });
        const items = await SupabaseAPI.getOrderItems(o.dbId);
        setDetail(prev => prev ? { ...prev, items, loading: false } : null);
      };

      if (orders === null) return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Encomendas</h2>
          <div className="t-body-sm muted" style={{ padding: '40px 0' }}>A carregar...</div>
        </div>
      );

      if (orders.length === 0) return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Encomendas</h2>
          <div className="empty" style={{ padding: '60px 0' }}>
            <Icon name="bag" size={28} stroke={1.2} />
            <div className="t-h3">Ainda não fizeste nenhuma encomenda</div>
            <button className="btn btn-secondary" onClick={() => navigate('/shop')}>Explorar loja</button>
          </div>
        </div>
      );

      return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Encomendas</h2>
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            {orders.map((o, i) => (
              <div key={o.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16,
                padding: 20, alignItems: 'center',
                borderBottom: i < orders.length - 1 ? '1px solid var(--hairline)' : 0
              }} className="order-row">
                <div>
                  <div className="t-caps muted" style={{ marginBottom: 4 }}>ORDER</div>
                  <div className="t-mono" style={{ fontSize: 13 }}>{o.id}</div>
                </div>
                <div>
                  <div className="t-caps muted" style={{ marginBottom: 4 }}>DATA</div>
                  <div style={{ fontSize: 13 }}>{o.date}</div>
                </div>
                <div>
                  <div className="t-caps muted" style={{ marginBottom: 4 }}>ARTIGOS</div>
                  <div style={{ fontSize: 13 }}>{o.items}</div>
                </div>
                <div>
                  <div className="t-caps muted" style={{ marginBottom: 4 }}>TOTAL</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>€{o.total.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="tag" style={{ borderColor: ORDER_STATUS_COLOR[o.status], color: ORDER_STATUS_COLOR[o.status] }}>
                    {ORDER_STATUS_LABEL[o.status] || o.status}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => openDetail(o)}>Detalhes</button>
                </div>
              </div>
            ))}
          </div>

          {detail && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r)', width: '100%', maxWidth: 600, maxHeight: '85vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid var(--hairline)' }}>
                  <div>
                    <div className="t-caps muted" style={{ marginBottom: 4 }}>Encomenda</div>
                    <div className="t-mono" style={{ fontSize: 15, fontWeight: 500 }}>{detail.order.id}</div>
                  </div>
                  <button onClick={() => setDetail(null)} style={{ background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
                    <Icon name="close" size={20} stroke={1.5} />
                  </button>
                </div>

                <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--hairline)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div className="t-caps muted" style={{ marginBottom: 6 }}>Estado</div>
                    <div style={{ fontSize: 13 }}>{ORDER_STATUS_LABEL[detail.order.status] || detail.order.status}</div>
                  </div>
                  <div>
                    <div className="t-caps muted" style={{ marginBottom: 6 }}>Data</div>
                    <div style={{ fontSize: 13 }}>{detail.order.date}</div>
                  </div>
                  {detail.order.ship && (
                    <div className="full">
                      <div className="t-caps muted" style={{ marginBottom: 6 }}>Destinatário</div>
                      <div style={{ fontSize: 13 }}>{detail.order.ship}</div>
                      {detail.order.address && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{detail.order.address}</div>}
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px 28px' }}>
                  <div className="t-caps muted" style={{ marginBottom: 16 }}>Artigos</div>
                  {detail.loading ? (
                    <div className="t-body-sm muted">A carregar...</div>
                  ) : detail.items && detail.items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {detail.items.map((it, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--hairline)' }}>
                          {it.image_url && (
                            <div style={{ width: 56, height: 64, flexShrink: 0, overflow: 'hidden', borderRadius: 4 }}>
                              <img src={it.image_url} alt={it.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{it.product_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                              {[it.color_label, it.size_label].filter(Boolean).join(' · ')}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{it.product_sku}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>€{Number(it.unit_price).toFixed(2)}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>×{it.qty}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontWeight: 500 }}>
                        <span>Total</span>
                        <span className="t-mono" style={{ fontSize: 14 }}>€{detail.order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="t-body-sm muted">Sem artigos.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <style>{`@media (max-width: 720px) { .order-row { grid-template-columns: 1fr 1fr !important; } }`}</style>
        </div>
      );
    }

    function AddressesSection() {
      const { sbUser, showToast } = useStore();
      const [addresses, setAddresses] = useState(null);
      const [editing, setEditing] = useState(null); // null | 'new' | address-object
      const [confirmDelete, setConfirmDelete] = useState(null);

      const BLANK = { label: 'Principal', first_name: '', last_name: '', address_1: '', address_2: '', city: '', postal_code: '', country: 'Portugal', phone: '', is_default: false };
      const [form, setForm] = useState(BLANK);
      const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

      const reload = () => {
        if (!sbUser || !window.__SUPABASE_CONFIGURED__) { setAddresses([]); return; }
        SupabaseAPI.getAddresses(sbUser.id).then(setAddresses);
      };

      useEffect(reload, [sbUser]);

      const openNew = () => { setForm(BLANK); setEditing('new'); };
      const openEdit = (addr) => {
        setForm({
          label:        addr.label || 'Principal',
          first_name:   addr.first_name || '',
          last_name:    addr.last_name  || '',
          address_1:    addr.address_1,
          address_2:    addr.address_2  || '',
          city:         addr.city,
          postal_code:  addr.postal_code,
          country:      addr.country,
          phone:        addr.phone || '',
          is_default:   addr.is_default || false,
        });
        setEditing(addr);
      };

      const save = async () => {
        if (!form.address_1 || !form.city || !form.postal_code) {
          showToast('Preenche os campos obrigatórios');
          return;
        }
        try {
          if (editing === 'new') {
            await SupabaseAPI.createAddress(sbUser.id, form);
          } else {
            await SupabaseAPI.updateAddress(editing.id, form);
          }
          reload();
          setEditing(null);
          showToast(editing === 'new' ? 'Morada adicionada' : 'Morada atualizada');
        } catch (e) { showToast('Erro ao guardar morada'); }
      };

      const remove = async (id) => {
        try {
          await SupabaseAPI.deleteAddress(id);
          setAddresses(prev => prev.filter(a => a.id !== id));
          showToast('Morada removida');
        } catch (e) { showToast('Erro ao remover morada'); }
        setConfirmDelete(null);
      };

      if (addresses === null) return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Moradas</h2>
          <div className="t-body-sm muted" style={{ padding: '40px 0' }}>A carregar...</div>
        </div>
      );

      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="t-h2" style={{ margin: 0 }}>Moradas</h2>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={openNew}>
                <Icon name="plus" size={12} /> Nova morada
              </button>
            )}
          </div>

          {editing && (
            <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r)', padding: 24, marginBottom: 24 }}>
              <h3 className="t-h3" style={{ margin: '0 0 20px' }}>
                {editing === 'new' ? 'Nova morada' : 'Editar morada'}
              </h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">Etiqueta</label>
                  <input className="input" value={form.label} onChange={e => sf('label', e.target.value)} placeholder="Principal, Trabalho…" />
                </div>
                <div></div>
                <div>
                  <label className="field-label">Nome</label>
                  <input className="input" value={form.first_name} onChange={e => sf('first_name', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Apelido</label>
                  <input className="input" value={form.last_name} onChange={e => sf('last_name', e.target.value)} />
                </div>
                <div className="full">
                  <label className="field-label">Morada *</label>
                  <input className="input" value={form.address_1} onChange={e => sf('address_1', e.target.value)} placeholder="Rua, número, andar" />
                </div>
                <div className="full">
                  <label className="field-label">Complemento</label>
                  <input className="input" value={form.address_2} onChange={e => sf('address_2', e.target.value)} placeholder="Bloco, apartamento…" />
                </div>
                <div>
                  <label className="field-label">Cidade *</label>
                  <input className="input" value={form.city} onChange={e => sf('city', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Código postal *</label>
                  <input className="input" value={form.postal_code} onChange={e => sf('postal_code', e.target.value)} placeholder="0000-000" />
                </div>
                <div>
                  <label className="field-label">País</label>
                  <select className="select" value={form.country} onChange={e => sf('country', e.target.value)}>
                    <option>Portugal</option><option>Espanha</option><option>França</option>
                    <option>Itália</option><option>Alemanha</option><option>Reino Unido</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Telefone</label>
                  <input className="input" value={form.phone} onChange={e => sf('phone', e.target.value)} placeholder="+351…" />
                </div>
                <div className="full">
                  <label className="check">
                    <input type="checkbox" checked={form.is_default} onChange={e => sf('is_default', e.target.checked)} />
                    <span className="box"></span>
                    <span>Definir como morada principal</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn btn-primary" onClick={save}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !editing ? (
            <div className="empty" style={{ padding: '60px 0' }}>
              <Icon name="pin" size={28} stroke={1.2} />
              <div className="t-h3">Nenhuma morada guardada</div>
              <button className="btn btn-secondary" onClick={openNew}>Adicionar morada</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="addr-grid">
              {addresses.map(addr => (
                <div key={addr.id} style={{
                  border: `1px solid ${addr.is_default ? '#fff' : 'var(--hairline)'}`,
                  borderRadius: 'var(--r)', padding: 24
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="tag">{(addr.label || 'Morada').toUpperCase()}</span>
                    {addr.is_default && <Icon name="check" size={16} />}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {(addr.first_name || addr.last_name) && (
                      <strong>{[addr.first_name, addr.last_name].filter(Boolean).join(' ')}<br /></strong>
                    )}
                    {addr.address_1}<br />
                    {addr.address_2 && <>{addr.address_2}<br /></>}
                    {addr.postal_code} {addr.city}<br />
                    {addr.country}
                    {addr.phone && <><br /><span style={{ color: 'var(--muted)' }}>{addr.phone}</span></>}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(addr)}>Editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(addr.id)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {confirmDelete && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r)', padding: 32, maxWidth: 360, width: '100%' }}>
                <div className="t-h3" style={{ margin: '0 0 12px' }}>Remover morada?</div>
                <p className="t-body-sm" style={{ marginBottom: 24 }}>Esta ação não pode ser desfeita.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => remove(confirmDelete)}>Remover</button>
                  <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
          <style>{`@media (max-width: 720px) { .addr-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      );
    }

    function ProfileSection({ form, setForm }) {
      const { sbUser, sbProfile, setSbProfile, showToast } = useStore();
      const [phone, setPhone] = useState(sbProfile?.phone || '');
      const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
      const spw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

      useEffect(() => { setPhone(sbProfile?.phone || ''); }, [sbProfile]);

      const saveProfile = async () => {
        if (!window.__SUPABASE_CONFIGURED__ || !sbUser) { showToast('Sem sessão válida'); return; }
        try {
          await SupabaseAPI.updateProfile(sbUser.id, {
            first_name: form.firstName,
            last_name:  form.lastName,
            phone:      phone || null,
          });
          if (setSbProfile) setSbProfile(p => p ? { ...p, first_name: form.firstName, last_name: form.lastName, phone } : p);
          showToast('Perfil atualizado');
        } catch (e) { showToast('Erro ao guardar perfil'); }
      };

      const changePassword = async () => {
        if (!pwForm.next || pwForm.next !== pwForm.confirm) { showToast('As palavras-passe não coincidem'); return; }
        if (!window.__SUPABASE_CONFIGURED__) return;
        try {
          const { error } = await window.supabaseClient.auth.updateUser({ password: pwForm.next });
          if (error) throw error;
          showToast('Palavra-passe atualizada');
          setPwForm({ current: '', next: '', confirm: '' });
        } catch (e) { showToast(e.message || 'Erro ao alterar palavra-passe'); }
      };

      return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Perfil</h2>
          <div className="form-grid" style={{ maxWidth: 560 }}>
            <div>
              <label className="field-label">Primeiro nome</label>
              <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Apelido</label>
              <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="full">
              <label className="field-label">Email</label>
              <input className="input" type="email" value={form.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div className="full">
              <label className="field-label">Telefone</label>
              <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+351…" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={saveProfile}>
            Guardar alterações
          </button>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--hairline)' }}>
            <h3 className="t-h3" style={{ margin: '0 0 20px' }}>Alterar palavra-passe</h3>
            <div className="form-grid" style={{ maxWidth: 560 }}>
              <div className="full">
                <label className="field-label">Nova palavra-passe</label>
                <input className="input" type="password" value={pwForm.next} onChange={e => spw('next', e.target.value)} placeholder="Mínimo 8 caracteres" />
              </div>
              <div className="full">
                <label className="field-label">Confirmar palavra-passe</label>
                <input className="input" type="password" value={pwForm.confirm} onChange={e => spw('confirm', e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={changePassword}
              disabled={!pwForm.next || pwForm.next !== pwForm.confirm}>
              Atualizar palavra-passe
            </button>
          </div>
        </div>
      );
    }

    function NewsletterSection() {
      const { sbUser, sbProfile, showToast } = useStore();
      const [subscribed, setSubscribed] = useState(true);
      const [prefs, setPrefs] = useState({ launches: true, limited: false, events: false });
      const [saving, setSaving] = useState(false);

      useEffect(() => {
        const email = sbUser?.email;
        if (!email) return;
        SupabaseAPI.getNewsletterStatus(email).then(active => setSubscribed(active));
      }, [sbUser]);

      const save = async () => {
        const email = sbUser?.email;
        if (!email) { showToast('Sem sessão válida'); return; }
        setSaving(true);
        try {
          if (subscribed) {
            await SupabaseAPI.subscribeNewsletter(email, sbProfile?.first_name);
          } else {
            if (window.__SUPABASE_CONFIGURED__) {
              await window.supabaseClient
                .from('newsletter_subscribers')
                .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
                .eq('email', email);
            }
          }
          showToast('Preferências atualizadas');
        } catch (e) { showToast('Erro ao guardar'); } finally { setSaving(false); }
      };

      return (
        <div>
          <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Newsletter</h2>
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 20, border: '1px solid var(--hairline)', borderRadius: 'var(--r)', marginBottom: 8 }}>
              <div style={{ fontSize: 13, marginBottom: 12, fontWeight: 500 }}>Subscrição</div>
              <label className="check">
                <input type="checkbox" checked={subscribed} onChange={e => setSubscribed(e.target.checked)} />
                <span className="box"></span>
                <span>Quero receber comunicações da Kara</span>
              </label>
            </div>
            <div style={{ opacity: subscribed ? 1 : 0.4, pointerEvents: subscribed ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Tópicos</div>
              <label className="check">
                <input type="checkbox" checked={prefs.launches} onChange={e => setPrefs(p => ({ ...p, launches: e.target.checked }))} />
                <span className="box"></span>
                <span>Novidades & lançamentos</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={prefs.limited} onChange={e => setPrefs(p => ({ ...p, limited: e.target.checked }))} />
                <span className="box"></span>
                <span>Edições limitadas (acesso prioritário)</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={prefs.events} onChange={e => setPrefs(p => ({ ...p, events: e.target.checked }))} />
                <span className="box"></span>
                <span>Eventos & ateliers</span>
              </label>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={save} disabled={saving}>
              {saving ? 'A guardar…' : 'Atualizar preferências'}
            </button>
          </div>
        </div>
      );
    }





    function PageContact() {
      const { navigate, showToast } = useStore();
      const [form, setForm] = useState({ name: '', email: '', topic: 'order', message: '' });
      const [sent, setSent] = useState(false);
      const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

      const submit = (e) => {
        e.preventDefault();
        setSent(true);
        showToast('Mensagem enviada');
      };

      return (
        <div className="page">
          <div className="container">
            <div className="page-head">
              <div className="crumb">
                <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
                <span style={{ margin: '0 8px', color: 'var(--hairline-strong)' }}>/</span>
                <span style={{ color: '#fff' }}>CONTACT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignPeças: 'baseline', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 className="t-h1" style={{ margin: 0 }}>Contacto</h1>
                  <p className="t-body-sm" style={{ marginTop: 12, maxWidth: 520 }}>
                    Resposta em 24h em dias úteis. Para questões sobre encomendas, inclui a referência (KR-XXXXXX).
                  </p>
                </div>
                <span className="t-mono" style={{ color: 'var(--muted)' }}>TEMPO DE RESPOSTA · ~14H</span>
              </div>
            </div>
          </div>

          <div className="container">
            <div style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr',
              borderBottom: '1px solid var(--hairline)', minHeight: '60vh'
            }} className="contact-grid">
              {/* FORM */}
              <div style={{ padding: '40px 0', paddingRight: 'var(--pad-page)', borderRight: '1px solid var(--hairline)' }} className="contact-form">
                {sent ? (
                  <div className="empty" style={{ padding: '80px 0' }}>
                    <div style={{ width: 56, height: 56, border: '1px solid #fff', borderRadius: '50%', display: 'flex', alignPeças: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={24} />
                    </div>
                    <h2 className="t-h2" style={{ margin: 0 }}>Recebemos a tua mensagem</h2>
                    <p className="t-body-sm" style={{ maxWidth: 360, textAlign: 'center' }}>
                      Vamos responder para <strong style={{ color: '#fff' }}>{form.email}</strong> nas próximas 24h.
                    </p>
                    <button className="btn btn-secondary" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'order', message: '' }); }}>
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h2 className="t-h2" style={{ margin: 0, marginBottom: 24 }}>Envia-nos uma mensagem</h2>
                    <div className="form-grid" style={{ maxWidth: 560 }}>
                      <div>
                        <label className="field-label">Nome</label>
                        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                      </div>
                      <div>
                        <label className="field-label">Email</label>
                        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                      </div>
                      <div className="full">
                        <label className="field-label">Assunto</label>
                        <select className="select" value={form.topic} onChange={(e) => set('topic', e.target.value)}>
                          <option value="order">Encomenda</option>
                          <option value="returns">Devolução / troca</option>
                          <option value="product">Produto / disponibilidade</option>
                          <option value="press">Imprensa</option>
                          <option value="wholesale">Grossista</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                      <div className="full">
                        <label className="field-label">Mensagem</label>
                        <textarea className="textarea" value={form.message} onChange={(e) => set('message', e.target.value)}
                          placeholder="Escreve aqui a tua questão..." required></textarea>
                      </div>
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', alignPeças: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-lg">Enviar mensagem</button>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Resposta em 24h em dias úteis.</span>
                    </div>
                  </form>
                )}
              </div>

              {/* INFO SIDE */}
              <div style={{ padding: '40px 0 40px var(--pad-page)' }} className="contact-info">
                <ContactBlock icon="mail" lbl="E-MAIL"
                  v="hello@kara.studio"
                  s="Suporte geral, encomendas, devoluções." />
                <ContactBlock icon="phone" lbl="TELEFONE"
                  v="+351 21 000 0000"
                  s="Seg–Sex · 10:00–18:00 (WET)" />
                <ContactBlock icon="pin" lbl="ATELIER"
                  v="Rua da Boavista 42, Lisboa"
                  s="Visitas apenas com marcação prévia." />
                <ContactBlock icon="instagram" lbl="SOCIAL"
                  v="@kara.studio"
                  s="Atualizações de produção e lançamentos." />
              </div>
            </div>

            <style>{`
          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr !important; }
            .contact-form { border-right: 0 !important; padding-right: 0 !important; border-bottom: 1px solid var(--hairline); }
            .contact-info { padding-left: 0 !important; }
          }
        `}</style>

            {/* FAQ — quick-help */}
            <section className="section-tight">
              <div className="sec-head">
                <div className="left">
                  <span className="t-mono idx">[FAQ]</span>
                  <h2 className="t-h2" style={{ margin: 0 }}>Perguntas frequentes</h2>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--hairline)', border: '1px solid var(--hairline)', borderRadius: 'var(--r)', overflow: 'hidden' }} className="faq-grid">
                <FaqRow q="Quanto tempo demora a entrega?" a="3–5 dias úteis com envio standard, 1–2 dias com express." />
                <FaqRow q="Posso devolver uma peça?" a="Sim, em 30 dias após receção. As devoluções são gratuitas em Portugal." />
                <FaqRow q="Os tamanhos correspondem ao padrão EU?" a="Sim, mas as nossas peças têm cortes mais relaxados — consulta a tabela em cada produto." />
                <FaqRow q="Como funciona a garantia de 8 anos?" a="Cobre defeitos de fabrico e construção. Reparações nos nossos ateliers." />
              </div>
              <style>{`@media (max-width: 720px) { .faq-grid { grid-template-columns: 1fr !important; } }`}</style>
            </section>
          </div>
        </div>
      );
    }

    function ContactBlock({ icon, lbl, v, s }) {
      return (
        <div style={{ borderTop: '1px solid var(--hairline)', padding: '24px 0', display: 'grid', gridTemplateColumns: '32px 1fr', gap: 16 }}>
          <Icon name={icon} size={20} stroke={1.4} />
          <div>
            <div className="t-caps muted" style={{ marginBottom: 6 }}>{lbl}</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s}</div>
          </div>
        </div>
      );
    }

    function FaqRow({ q, a }) {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ background: 'var(--background)' }}>
          <button onClick={() => setOpen(!open)} style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignPeças: 'center',
            background: 'transparent', border: 0, padding: '20px 24px',
            color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left'
          }}>
            <span>{q}</span>
            <Icon name={open ? 'minus' : 'plus'} size={14} stroke={1.5} />
          </button>
          {open && (
            <div style={{ padding: '0 24px 20px', fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
              {a}
            </div>
          )}
        </div>
      );
    }





    function App() {
      const { route, navigate, setDrawerOpen, setSearchOpen, setMobileMenuOpen, sbProfile } = useStore();
      const r = parseRoute(route);

      // Close all overlays on route change (must be before any conditional return)
      useEffect(() => {
        setDrawerOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }, [route, setDrawerOpen, setSearchOpen, setMobileMenuOpen]);

      // Admin dashboard — full-screen takeover, no store chrome
      if (r.name === 'admin' && sbProfile?.role === 'admin' && window.PageAdmin) {
        return <window.PageAdmin onExit={() => navigate('/')} />;
      }

      let page;
      switch (r.name) {
        case 'home': page = <PageHome />; break;
        case 'shop': page = <PageShop gender={r.gender} sub={r.sub} />; break;
        case 'product': page = <PageProduct productId={r.productId} />; break;
        case 'cart': page = <PageCart />; break;
        case 'checkout': page = <PageCheckout />; break;
        case 'account': page = <PageAccount />; break;
        case 'contact': page = <PageContact />; break;
        default: page = <PageHome />;
      }

      return (
        <React.Fragment>
          <Nav />
          <main data-screen-label={r.name}>{page}</main>
          <Footer />
          <MiniCart />
          <SearchOverlay />
          <Toast />
          <SupabaseBanner />
        </React.Fragment>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(
      <StoreProvider><App /></StoreProvider>
    );

