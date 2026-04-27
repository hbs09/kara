/* Mock data for Kara admin */
window.KaraData = (function () {
  const swatches = [
    'var(--swatch-1)', 'var(--swatch-2)', 'var(--swatch-3)', 'var(--swatch-4)',
    'var(--swatch-5)', 'var(--swatch-6)', 'var(--swatch-7)', 'var(--swatch-8)',
  ];

  const products = [
    { id: 'KR-001', name: 'Linen Wrap Blazer', collection: 'Resort 26', price: 289.00, stock: 42, sold: 312, color: 'var(--swatch-2)', accent: 'var(--swatch-6)', sizes: ['XS','S','M','L'] },
    { id: 'KR-002', name: 'Pleated Midi Skirt', collection: 'Resort 26', price: 168.00, stock: 78, sold: 287, color: 'var(--swatch-3)', accent: 'var(--swatch-6)', sizes: ['S','M','L'] },
    { id: 'KR-003', name: 'Cotton Poplin Shirt', collection: 'Core', price: 124.00, stock: 156, sold: 244, color: 'var(--swatch-6)', accent: 'var(--swatch-1)', sizes: ['XS','S','M','L','XL'] },
    { id: 'KR-004', name: 'Tailored Wide Trouser', collection: 'Core', price: 198.00, stock: 8, sold: 198, color: 'var(--swatch-1)', accent: 'var(--swatch-2)', sizes: ['S','M','L'] },
    { id: 'KR-005', name: 'Silk Slip Dress', collection: 'Evening', price: 348.00, stock: 24, sold: 176, color: 'var(--swatch-5)', accent: 'var(--swatch-3)', sizes: ['XS','S','M'] },
    { id: 'KR-006', name: 'Merino Crew Knit', collection: 'Core', price: 156.00, stock: 0, sold: 164, color: 'var(--swatch-4)', accent: 'var(--swatch-6)', sizes: ['S','M','L','XL'] },
    { id: 'KR-007', name: 'Wool Crombie Coat', collection: 'Pre-Fall', price: 498.00, stock: 31, sold: 142, color: 'var(--swatch-7)', accent: 'var(--swatch-2)', sizes: ['S','M','L'] },
    { id: 'KR-008', name: 'Leather Belt — Caramel', collection: 'Accessories', price: 78.00, stock: 92, sold: 138, color: 'var(--swatch-8)', accent: 'var(--swatch-1)', sizes: ['S','M','L'] },
    { id: 'KR-009', name: 'Cashmere Scarf', collection: 'Accessories', price: 142.00, stock: 64, sold: 121, color: 'var(--swatch-3)', accent: 'var(--swatch-5)', sizes: ['One'] },
    { id: 'KR-010', name: 'Twill Bucket Hat', collection: 'Accessories', price: 56.00, stock: 11, sold: 98, color: 'var(--swatch-4)', accent: 'var(--swatch-6)', sizes: ['S','M','L'] },
    { id: 'KR-011', name: 'Heavyweight Hoodie', collection: 'Core', price: 138.00, stock: 88, sold: 86, color: 'var(--swatch-1)', accent: 'var(--swatch-3)', sizes: ['S','M','L','XL'] },
    { id: 'KR-012', name: 'Bias-Cut Slip Skirt', collection: 'Evening', price: 184.00, stock: 19, sold: 74, color: 'var(--swatch-5)', accent: 'var(--swatch-2)', sizes: ['XS','S','M','L'] },
  ];

  const customers = [
    { id: 'C-2401', name: 'Helena Marçal', email: 'helena.marcal@email.com', city: 'São Paulo, BR', orders: 14, ltv: 4218.00, status: 'VIP', joined: 'Mar 2024' },
    { id: 'C-2402', name: 'Júlia Andrade', email: 'julia.a@email.com', city: 'Lisboa, PT', orders: 9, ltv: 2987.00, status: 'Returning', joined: 'Jul 2024' },
    { id: 'C-2403', name: 'Maya Okafor', email: 'maya.o@email.com', city: 'London, UK', orders: 7, ltv: 2412.00, status: 'Returning', joined: 'Sep 2024' },
    { id: 'C-2404', name: 'Beatriz Fontes', email: 'b.fontes@email.com', city: 'Rio de Janeiro, BR', orders: 6, ltv: 1876.00, status: 'Returning', joined: 'Nov 2024' },
    { id: 'C-2405', name: 'Sofia Bertelli', email: 'sofia.b@email.com', city: 'Milano, IT', orders: 4, ltv: 1521.00, status: 'New', joined: 'Feb 2026' },
    { id: 'C-2406', name: 'Camila Reis', email: 'camila.r@email.com', city: 'Porto, PT', orders: 3, ltv: 1124.00, status: 'New', joined: 'Mar 2026' },
    { id: 'C-2407', name: 'Anna Lindqvist', email: 'a.lindqvist@email.com', city: 'Stockholm, SE', orders: 8, ltv: 2640.00, status: 'Returning', joined: 'Aug 2024' },
    { id: 'C-2408', name: 'Renata Vieira', email: 'r.vieira@email.com', city: 'Salvador, BR', orders: 2, ltv: 462.00, status: 'New', joined: 'Apr 2026' },
  ];

  const orders = [
    { id: '#KR-10482', customer: 'Helena Marçal', date: 'Apr 27, 10:42', items: 3, total: 612.00, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Web' },
    { id: '#KR-10481', customer: 'Júlia Andrade', date: 'Apr 27, 09:18', items: 1, total: 348.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
    { id: '#KR-10480', customer: 'Maya Okafor', date: 'Apr 27, 08:55', items: 2, total: 322.00, status: 'Refunded', fulfillment: 'Returned', channel: 'Web' },
    { id: '#KR-10479', customer: 'Beatriz Fontes', date: 'Apr 26, 22:31', items: 4, total: 754.00, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Mobile' },
    { id: '#KR-10478', customer: 'Sofia Bertelli', date: 'Apr 26, 19:04', items: 2, total: 432.00, status: 'Pending', fulfillment: 'On hold', channel: 'Web' },
    { id: '#KR-10477', customer: 'Camila Reis', date: 'Apr 26, 17:12', items: 1, total: 156.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Mobile' },
    { id: '#KR-10476', customer: 'Anna Lindqvist', date: 'Apr 26, 14:48', items: 5, total: 982.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
    { id: '#KR-10475', customer: 'Renata Vieira', date: 'Apr 26, 12:03', items: 1, total: 124.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
    { id: '#KR-10474', customer: 'Helena Marçal', date: 'Apr 26, 10:21', items: 2, total: 304.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
    { id: '#KR-10473', customer: 'Júlia Andrade', date: 'Apr 25, 21:47', items: 3, total: 487.00, status: 'Paid', fulfillment: 'Unfulfilled', channel: 'Mobile' },
    { id: '#KR-10472', customer: 'Maya Okafor', date: 'Apr 25, 16:32', items: 1, total: 198.00, status: 'Paid', fulfillment: 'Fulfilled', channel: 'Web' },
    { id: '#KR-10471', customer: 'Beatriz Fontes', date: 'Apr 25, 14:15', items: 2, total: 386.00, status: 'Pending', fulfillment: 'On hold', channel: 'Web' },
  ];

  // 14-day revenue series (BRL-ish numbers, just thousands)
  const salesSeries = [
    { d: 'Apr 14', v: 8420 }, { d: 'Apr 15', v: 9120 }, { d: 'Apr 16', v: 7840 },
    { d: 'Apr 17', v: 10240 }, { d: 'Apr 18', v: 11580 }, { d: 'Apr 19', v: 9670 },
    { d: 'Apr 20', v: 8950 }, { d: 'Apr 21', v: 12410 }, { d: 'Apr 22', v: 13720 },
    { d: 'Apr 23', v: 11890 }, { d: 'Apr 24', v: 14260 }, { d: 'Apr 25', v: 15820 },
    { d: 'Apr 26', v: 13980 }, { d: 'Apr 27', v: 9540 },
  ];

  const channels = [
    { name: 'Web (direct)', value: 48, color: 'var(--primary)' },
    { name: 'Instagram', value: 22, color: 'var(--swatch-5)' },
    { name: 'Email', value: 14, color: 'var(--swatch-2)' },
    { name: 'Search', value: 11, color: 'var(--swatch-4)' },
    { name: 'Other', value: 5, color: 'var(--outline-variant)' },
  ];

  const regions = [
    { name: 'Brazil', value: 42, orders: 184 },
    { name: 'Portugal', value: 21, orders: 92 },
    { name: 'United Kingdom', value: 14, orders: 61 },
    { name: 'Italy', value: 9, orders: 39 },
    { name: 'Sweden', value: 7, orders: 31 },
    { name: 'Other', value: 7, orders: 30 },
  ];

  const activity = [
    { kind: 'order', text: 'New order #KR-10482 — Helena Marçal', meta: 'R$ 612.00', time: '2m ago' },
    { kind: 'stock', text: 'Tailored Wide Trouser running low (8 units)', meta: 'KR-004', time: '14m ago' },
    { kind: 'review', text: 'New review on Silk Slip Dress', meta: '★ 5.0', time: '38m ago' },
    { kind: 'order', text: 'New order #KR-10481 — Júlia Andrade', meta: 'R$ 348.00', time: '1h ago' },
    { kind: 'refund', text: 'Refund processed for #KR-10480', meta: '−R$ 322.00', time: '1h ago' },
    { kind: 'customer', text: 'Sofia Bertelli became a returning customer', meta: 'Milano, IT', time: '2h ago' },
    { kind: 'stock', text: 'Merino Crew Knit is out of stock', meta: 'KR-006', time: '3h ago' },
  ];

  return { swatches, products, customers, orders, salesSeries, channels, regions, activity };
})();
