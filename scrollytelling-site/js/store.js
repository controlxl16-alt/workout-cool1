/* ═══════════════════════════════════════════════
   ENSEMBLE — Store Engine
   Catalog · Cart · Header · Footer · Drawer
═══════════════════════════════════════════════ */

// ── Catalog ───────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'noir-linen',
    name: 'Noir Linen Co-ord Set',
    subtitle: 'Long Sleeve Shirt and Tailored Trousers',
    price: 189,
    currency: '€',
    colorway: 'Noir',
    colorHex: '#1c1c1c',
    fabric: '100% Italian Stonewashed Linen',
    badge: 'Bestseller',
    images: ['frames/img_01.jpg', 'frames/img_02.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Our signature co-ord in midnight black stonewashed linen. The grandad collar shirt and relaxed drawstring trousers are cut to feel effortless at a sun-drenched terrace lunch or a candlelit dinner by the sea.',
    details: [
      'Grandad collar with single button placket',
      'Relaxed fit shirt with side vents',
      'Drawstring trousers with two side pockets',
      'Pre-washed for immediate softness and drape',
      'Machine washable at 30 degrees',
    ],
    care: ['Machine wash cold on a gentle cycle', 'Do not tumble dry', 'Iron on low heat or steam', 'Dry in shade to preserve depth of colour'],
    related: ['sable-linen', 'ardoise-pleated'],
  },
  {
    id: 'sable-linen',
    name: 'Sable Linen Co-ord Set',
    subtitle: 'Camp Collar Shirt and Straight Trousers',
    price: 189,
    currency: '€',
    colorway: 'Sable',
    colorHex: '#dfd3c0',
    fabric: '100% Italian Stonewashed Linen',
    badge: null,
    images: ['frames/img_03.jpg', 'frames/img_01.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Warm sand linen in a relaxed summer silhouette. The camp collar short-sleeve shirt and straight-leg trousers are cut for effortless warm-weather dressing, from morning coffee to midnight aperitivo.',
    details: [
      'Cuban camp collar, short sleeve',
      'Button-through placket, relaxed chest fit',
      'Straight-leg trousers with elastic waistband',
      'Italian pre-washed linen, ultra-breathable',
      'Machine washable at 30 degrees',
    ],
    care: ['Machine wash cold on a gentle cycle', 'Do not tumble dry', 'Iron on low heat or steam', 'Dry flat in shade'],
    related: ['noir-linen', 'ardoise-pleated'],
  },
  {
    id: 'ardoise-pleated',
    name: 'Ardoise Pleated Co-ord Set',
    subtitle: 'Long Sleeve Shirt and Wide Leg Trousers',
    price: 199,
    currency: '€',
    colorway: 'Ardoise',
    colorHex: '#8c9299',
    fabric: '100% Premium Micro-Pleated Fabric',
    badge: 'New',
    images: ['frames/img_04.jpg', 'frames/img_03.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Cool slate micro-pleated fabric in a sharp long-sleeve silhouette. Wide-leg trousers with a fluid drape elevate the co-ord into evening territory while remaining entirely effortless to wear.',
    details: [
      'Spread collar long-sleeve shirt',
      'Micro-pleated texture throughout, structured hand',
      'Wide-leg trousers with pleat front',
      'Gold hardware button details',
      'Dry clean recommended',
    ],
    care: ['Dry clean preferred', 'Hand wash cold if needed', 'Do not wring or twist', 'Hang to dry and reshape while damp'],
    related: ['noir-linen', 'sable-linen'],
  },
];

function getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; }

// ── Cart ──────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('ensemble_cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('ensemble_cart', JSON.stringify(cart));
  _updateAllCounts();
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
}

function addToCart(productId, size, qty) {
  qty = qty || 1;
  const product = getProduct(productId);
  if (!product) return;
  const cart = getCart();
  const key = productId + '__' + size;
  const existing = cart.find(function(item) { return item.key === key; });
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key: key,
      productId: productId,
      size: size,
      qty: qty,
      name: product.name,
      price: product.price,
      image: product.images[0],
      colorway: product.colorway,
    });
  }
  saveCart(cart);
  _showToast(product.name + ' added to cart');
  openCartDrawer();
}

function removeFromCart(key) {
  saveCart(getCart().filter(function(item) { return item.key !== key; }));
  _renderDrawerItems();
}

function updateQty(key, qty) {
  if (qty <= 0) { removeFromCart(key); return; }
  const cart = getCart();
  const item = cart.find(function(i) { return i.key === key; });
  if (item) { item.qty = qty; saveCart(cart); }
  _renderDrawerItems();
}

function cartTotal() {
  return getCart().reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
}

function cartCount() {
  return getCart().reduce(function(sum, item) { return sum + item.qty; }, 0);
}

function _updateAllCounts() {
  var count = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach(function(el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Toast ─────────────────────────────────────────────────
function _showToast(msg) {
  var toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { toast.classList.remove('show'); }, 2600);
}

// ── Cart Drawer ───────────────────────────────────────────
function _cartItemsHTML() {
  var cart = getCart();
  if (cart.length === 0) {
    return '<div class="drawer-empty"><p>Your cart is empty.</p><a href="shop.html" class="btn-primary" style="margin-top:1.5rem" onclick="closeCartDrawer()">Continue Shopping</a></div>';
  }
  return '<ul class="drawer-items">' + cart.map(function(item) {
    return '<li class="drawer-item"><img src="' + item.image + '" alt="' + item.name + '" class="drawer-item-img" /><div class="drawer-item-body"><p class="drawer-item-name">' + item.name + '</p><p class="drawer-item-meta">Size ' + item.size + ' &nbsp;·&nbsp; ' + item.colorway + '</p><div class="drawer-item-row"><div class="qty-ctrl"><button onclick="updateQty(\'' + item.key + '\',' + (item.qty - 1) + ')">−</button><span>' + item.qty + '</span><button onclick="updateQty(\'' + item.key + '\',' + (item.qty + 1) + ')">+</button></div><span class="drawer-item-price">€' + (item.price * item.qty) + '</span></div><button class="drawer-remove" onclick="removeFromCart(\'' + item.key + '\')">Remove</button></div></li>';
  }).join('') + '</ul>';
}

function _renderDrawerItems() {
  var body = document.getElementById('drawer-body');
  var foot = document.getElementById('drawer-foot');
  if (!body) return;
  var cart = getCart();
  body.innerHTML = _cartItemsHTML();
  if (foot) {
    if (cart.length > 0) {
      foot.style.display = '';
      var tot = foot.querySelector('.drawer-total-amt');
      if (tot) tot.textContent = '€' + cartTotal();
    } else {
      foot.style.display = 'none';
    }
  }
}

function openCartDrawer() {
  var drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  _renderDrawerItems();
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  var drawer = document.getElementById('cart-drawer');
  if (drawer) { drawer.classList.remove('open'); document.body.style.overflow = ''; }
}

function _buildCartDrawer() {
  var existing = document.getElementById('cart-drawer');
  if (existing) return;
  var cart = getCart();
  var el = document.createElement('div');
  el.id = 'cart-drawer';
  el.innerHTML =
    '<div class="drawer-backdrop" onclick="closeCartDrawer()"></div>' +
    '<aside class="drawer-panel">' +
      '<div class="drawer-head"><span class="drawer-heading">Cart</span><button class="drawer-x" onclick="closeCartDrawer()" aria-label="Close">&#x2715;</button></div>' +
      '<div class="drawer-body" id="drawer-body">' + _cartItemsHTML() + '</div>' +
      '<div class="drawer-foot" id="drawer-foot" style="' + (cart.length === 0 ? 'display:none' : '') + '">' +
        '<div class="drawer-subtotal"><span>Subtotal</span><span class="drawer-total-amt">€' + cartTotal() + '</span></div>' +
        '<p class="drawer-ship">Free worldwide shipping · 30 day returns</p>' +
        '<button class="btn-primary btn-block" onclick="_demoCheckout()">Checkout</button>' +
        '<a href="cart.html" class="btn-secondary btn-block" style="margin-top:.6rem">View Cart</a>' +
      '</div>' +
    '</aside>';
  document.body.appendChild(el);
}

function _demoCheckout() {
  closeCartDrawer();
  setTimeout(function() {
    var m = document.getElementById('checkout-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'checkout-modal';
      m.innerHTML = '<div class="modal-bg" onclick="this.parentElement.classList.remove(\'open\')"></div><div class="modal-box"><p class="modal-label">Demo Store</p><h3 style="font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(28px,4vw,42px);margin:.8rem 0 1rem">Thank you for your order</h3><p style="color:#666;line-height:1.7;font-size:15px">This is a demonstration store. In a live environment this would proceed to a secure checkout. Your items are safe in the cart.</p><button class="btn-primary" style="margin-top:2rem" onclick="this.closest(\'#checkout-modal\').classList.remove(\'open\')">Continue Shopping</button></div>';
      document.body.appendChild(m);
    }
    m.classList.add('open');
  }, 300);
}

// ── Search ────────────────────────────────────────────────
function _buildSearch() {
  var el = document.createElement('div');
  el.id = 'search-overlay';
  el.innerHTML = '<div class="search-bg" onclick="closeSearch()"></div><div class="search-panel"><button class="search-close" onclick="closeSearch()">&#x2715;</button><input type="text" id="search-input" placeholder="Search products…" autocomplete="off" /><ul id="search-results"></ul></div>';
  document.body.appendChild(el);

  var input = el.querySelector('#search-input');
  var results = el.querySelector('#search-results');
  input.addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    if (!q) { results.innerHTML = ''; return; }
    var matches = PRODUCTS.filter(function(p) { return (p.name + p.colorway + p.fabric).toLowerCase().includes(q); });
    results.innerHTML = matches.map(function(p) {
      return '<li><a href="product.html?id=' + p.id + '" onclick="closeSearch()"><img src="' + p.images[0] + '" alt="' + p.name + '" /><span>' + p.name + '<br><small>€' + p.price + '</small></span></a></li>';
    }).join('') || '<li class="no-results">No results found</li>';
  });
}

function openSearch() {
  var o = document.getElementById('search-overlay');
  if (o) { o.classList.add('open'); setTimeout(function() { document.getElementById('search-input').focus(); }, 100); }
}
function closeSearch() {
  var o = document.getElementById('search-overlay');
  if (o) o.classList.remove('open');
}

// ── Header ────────────────────────────────────────────────
function renderHeader(activePage) {
  var el = document.getElementById('site-header');
  if (!el) return;
  var root = el.dataset.root || '';
  el.innerHTML =
    '<header class="site-header" id="main-header">' +
      '<div class="header-inner">' +
        '<nav class="header-left">' +
          '<a href="' + root + 'shop.html" class="nav-link' + (activePage === 'shop' ? ' active' : '') + '">Shop</a>' +
          '<a href="' + root + 'about.html" class="nav-link' + (activePage === 'about' ? ' active' : '') + '">About</a>' +
        '</nav>' +
        '<a href="' + root + 'index.html" class="header-logo">Ensemble</a>' +
        '<div class="header-right">' +
          '<button class="hdr-icon" onclick="openSearch()" aria-label="Search"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.4"/><line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>' +
          '<button class="hdr-icon cart-btn" onclick="openCartDrawer()" aria-label="Cart"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2 2h2l2.5 10h9l2-7H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="16" r="1.2" fill="currentColor"/><circle cx="14.5" cy="16" r="1.2" fill="currentColor"/></svg><span class="cart-badge" data-cart-count>0</span></button>' +
        '</div>' +
      '</div>' +
    '</header>';
  _updateAllCounts();

  var hdr = document.getElementById('main-header');
  window.addEventListener('scroll', function() {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Footer ────────────────────────────────────────────────
function renderFooter() {
  var el = document.getElementById('site-footer');
  if (!el) return;
  var root = el.dataset.root || '';
  el.innerHTML =
    '<footer class="site-footer">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand-col">' +
          '<a href="' + root + 'index.html" class="footer-logo">Ensemble</a>' +
          '<p class="footer-tag">Luxury co-ord sets crafted for those who move through life without effort.</p>' +
          '<div class="footer-socials">' +
            '<a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
            '<a href="#" aria-label="TikTok"><svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.53V6.77a4.86 4.86 0 01-1.01-.08z"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-links-col">' +
          '<h6>Shop</h6>' +
          '<a href="' + root + 'shop.html">All Sets</a>' +
          '<a href="' + root + 'shop.html?filter=linen">Linen Collection</a>' +
          '<a href="' + root + 'shop.html?filter=pleated">Pleated Collection</a>' +
          '<a href="' + root + 'shop.html?badge=new">New Arrivals</a>' +
        '</div>' +
        '<div class="footer-links-col">' +
          '<h6>Company</h6>' +
          '<a href="' + root + 'about.html">Our Story</a>' +
          '<a href="#">Sustainability</a>' +
          '<a href="#">Stockists</a>' +
          '<a href="#">Press</a>' +
        '</div>' +
        '<div class="footer-links-col">' +
          '<h6>Support</h6>' +
          '<a href="#">Size Guide</a>' +
          '<a href="#">Shipping</a>' +
          '<a href="#">Returns</a>' +
          '<a href="#">Contact</a>' +
        '</div>' +
        '<div class="footer-news-col">' +
          '<h6>Stay in the loop</h6>' +
          '<p>Delivered rarely. Curated always.</p>' +
          '<form class="news-form" onsubmit="event.preventDefault();_showToast(\'Thank you for subscribing.\');this.reset()">' +
            '<input type="email" placeholder="your@email.com" required />' +
            '<button type="submit">Join</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<p>© 2026 Ensemble. All rights reserved.</p>' +
        '<div class="footer-legal"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>' +
        '<div class="footer-pay"><span>VISA</span><span>MC</span><span>PayPal</span><span>Apple Pay</span></div>' +
      '</div>' +
    '</footer>';
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  _updateAllCounts();
  _buildCartDrawer();
  _buildSearch();
  document.addEventListener('cart:updated', function() { _renderDrawerItems(); _updateAllCounts(); });
});
