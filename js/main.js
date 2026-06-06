/* =============================================
   FAGA — Main Application Logic
   ============================================= */

// ─── LOADER ──────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initAll();
  }, 2800);
});

function initAll() {
  initCursor();
  initNavbar();
  initHeroParticles();
  initHero3D();
  initProduct3D();
  initProducts();
  initCounters();
  initTestimonialSwiper();
  initARSection();
  initMobileMenu();
  initSearch();
  initScrollAnimations();
}

// ─── CURSOR ──────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
  });

  function followCursor() {
    fx += (cx - fx) * 0.15;
    fy += (cy - fy) * 0.15;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(followCursor);
  }
  followCursor();
}

// ─── NAVBAR ──────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 50);
    lastY = y;
  });
}

// ─── HERO PARTICLES ──────────────────────────
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 3 + 1}px;
      height:${Math.random() * 3 + 1}px;
      background:rgba(201,169,110,${Math.random() * 0.5 + 0.1});
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: floatParticle ${Math.random() * 10 + 8}s ease-in-out infinite;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0%,100% { transform: translate(0, 0); opacity: 0.3; }
      25% { transform: translate(${Math.random()*30-15}px, -${Math.random()*40+20}px); opacity: 1; }
      50% { transform: translate(${Math.random()*30-15}px, -${Math.random()*60+30}px); opacity: 0.6; }
      75% { transform: translate(${Math.random()*30-15}px, -${Math.random()*80+40}px); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
}

// ─── COUNTER ANIMATION ───────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 20);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ─── TESTIMONIALS SWIPER ─────────────────────
function initTestimonialSwiper() {
  if (typeof Swiper === 'undefined') return;
  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

// ─── PRODUCTS ────────────────────────────────
let activeFilter = 'all';
let visibleCount = 6;

function initProducts() {
  renderProducts();

  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      visibleCount = 6;
      renderProducts();
    });
  });

  document.getElementById('sortSelect')?.addEventListener('change', e => {
    renderProducts(e.target.value);
  });

  document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    visibleCount += 4;
    renderProducts(document.getElementById('sortSelect')?.value);
  });

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      activeFilter = filter;
      visibleCount = 6;
      document.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
      });
      document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
      renderProducts();
    });
  });
}

function renderProducts(sort = 'featured') {
  const grid = document.getElementById('productsGrid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  let filtered = PRODUCTS.filter(p => activeFilter === 'all' || p.category === activeFilter);

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') filtered.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
  else filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const shown = filtered.slice(0, visibleCount);

  grid.innerHTML = shown.map(p => `
    <div class="product-card" data-id="${p.id}" onclick="openProductModal('${p.id}')">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'new' ? 'Nuevo' : p.badge === 'sale' ? 'Oferta' : p.badge}</span>` : ''}
        <div class="product-actions">
          <button class="action-btn" onclick="event.stopPropagation(); addToCartById('${p.id}')" title="Agregar al carrito">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
          <button class="action-btn" onclick="event.stopPropagation();" title="Favorito">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          ${p.hasAr ? `<button class="action-btn" onclick="event.stopPropagation(); openArModal()" title="Ver en AR">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </button>` : ''}
        </div>
        ${p.has3d ? `<div class="product-3d-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Vista 3D</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${categoryLabel(p.category)}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-price-row">
          <div class="product-price">
            ${p.originalPrice ? `<span class="original">$${p.originalPrice.toLocaleString()}</span>` : ''}
            $${p.price.toLocaleString()}
          </div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); addToCartById('${p.id}')" aria-label="Agregar al carrito">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > visibleCount ? 'block' : 'none';

  // Animate cards in
  grid.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

function categoryLabel(cat) {
  return { sala: 'Sala', dormitorio: 'Dormitorio', comedor: 'Comedor', oficina: 'Oficina' }[cat] || cat;
}

function addToCartById(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (product) {
    cart.add({ id: product.id, name: product.name, price: product.price, img: product.img });
    cart.openSidebar();
  }
}

// ─── PRODUCT MODAL ───────────────────────────
function openProductModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;

  const inner = document.getElementById('modalInner');
  const specsHtml = Object.entries(p.specs || {}).map(([k, v]) => `
    <div class="spec-row"><span>${k}</span><span>${v}</span></div>
  `).join('');

  inner.innerHTML = `
    <div class="modal-img-section">
      <img src="${p.imgs?.[0] || p.img}" alt="${p.name}" />
    </div>
    <div class="modal-info">
      <div class="modal-category">${categoryLabel(p.category)}</div>
      <h2 class="modal-name">${p.name}</h2>
      <div class="modal-rating">★★★★★ ${p.rating} · (${p.reviews} reseñas)</div>
      <div class="modal-price">
        ${p.originalPrice ? `<span style="font-size:1.1rem;color:var(--gray);text-decoration:line-through;margin-right:8px">$${p.originalPrice.toLocaleString()}</span>` : ''}
        $${p.price.toLocaleString()}
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-specs">
        <h4>Especificaciones</h4>
        ${specsHtml}
      </div>
      <div class="modal-actions">
        <button class="btn-primary modal-add-btn" onclick="addToCartById('${p.id}'); closeProductModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Agregar al carrito
        </button>
        ${p.hasAr ? `<button class="btn-ar-launch" onclick="openArModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Ver en Realidad Aumentada
        </button>` : ''}
      </div>
    </div>
  `;

  const modal = document.getElementById('productModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose')?.addEventListener('click', closeProductModal);
document.getElementById('productModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('productModal')) closeProductModal();
});

// ─── AR SECTION ──────────────────────────────
function initARSection() {
  // Color picker in AR preview
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sofa = document.querySelector('.ar-sofa');
      if (sofa) sofa.dataset.color = btn.dataset.color;
    });
  });

  // AR product thumbnails
  document.querySelectorAll('.ar-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.ar-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  document.getElementById('launchArBtn')?.addEventListener('click', openArModal);

  document.getElementById('arModalClose')?.addEventListener('click', () => {
    document.getElementById('arModal').classList.remove('open');
  });

  document.getElementById('arModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('arModal')) {
      document.getElementById('arModal').classList.remove('open');
    }
  });
}

// ─── MOBILE MENU ─────────────────────────────
function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  const close = document.getElementById('menuClose');

  toggle?.addEventListener('click', () => {
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  close?.addEventListener('click', () => {
    menu.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ─── SEARCH ──────────────────────────────────
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  document.getElementById('searchToggle')?.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
  });
  document.getElementById('searchClose')?.addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      closeProductModal();
      document.getElementById('checkoutModal')?.classList.remove('open');
      document.getElementById('arModal')?.classList.remove('open');
    }
  });
}

// ─── SCROLL ANIMATIONS ───────────────────────
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const animateEls = document.querySelectorAll('.section-header, .feature-item, .about-content, .about-visual, .newsletter-content');
  animateEls.forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }
    );
  });

  // AR section parallax
  gsap.to('.ar-bg-visual', {
    y: -100,
    scrollTrigger: {
      trigger: '.ar-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

// ─── TOAST SYSTEM ────────────────────────────
function showToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✓', error: '✕', default: '◆' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.default}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── CATEGORY HOVER EFFECT ───────────────────
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(0.98)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
