/* =============================================
   FAGA — Cart & Checkout Logic
   ============================================= */

const cart = {
  items: JSON.parse(localStorage.getItem('faga_cart') || '[]'),

  save() {
    localStorage.setItem('faga_cart', JSON.stringify(this.items));
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
    this.render();
    showToast(`${product.name} agregado al carrito`, 'success');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    this.save();
    this.render();
  },

  get total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  get count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  render() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const count = document.getElementById('cartCount');
    const countEl = document.getElementById('cartItemsCount');
    const subtotal = document.getElementById('cartSubtotal');
    const total = document.getElementById('cartTotal');

    const n = this.count;
    count.textContent = n;
    count.classList.toggle('has-items', n > 0);
    if (countEl) countEl.textContent = `(${n} artículo${n !== 1 ? 's' : ''})`;
    if (empty) empty.style.display = this.items.length ? 'none' : 'flex';
    if (footer) footer.style.display = this.items.length ? 'block' : 'none';

    const existingItems = container.querySelectorAll('.cart-item');
    existingItems.forEach(el => el.remove());

    this.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.img || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&q=60'}" alt="${item.name}" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">Tela · Beige</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="cart.updateQty('${item.id}', -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="cart.updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</div>
        <button class="cart-item-remove" onclick="cart.remove('${item.id}')">Eliminar</button>
      `;
      container.appendChild(el);
    });

    const t = this.total;
    if (subtotal) subtotal.textContent = `$${t.toLocaleString()}`;
    if (total) total.textContent = `$${t.toLocaleString()}`;

    this.renderOrderSummaryMini();
  },

  renderOrderSummaryMini() {
    const el = document.getElementById('orderSummaryMini');
    if (!el) return;
    el.innerHTML = this.items.map(i => `
      <div class="mini-item">
        <span>${i.name} × ${i.qty}</span>
        <span>$${(i.price * i.qty).toLocaleString()}</span>
      </div>
    `).join('') + `
      <div class="mini-total">
        <span>Total</span>
        <span>$${this.total.toLocaleString()}</span>
      </div>
    `;
  },

  openSidebar() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeSidebar() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  },
};

// Cart UI events
document.addEventListener('DOMContentLoaded', () => {
  cart.render();

  document.getElementById('cartToggle')?.addEventListener('click', () => cart.openSidebar());
  document.getElementById('cartClose')?.addEventListener('click', () => cart.closeSidebar());
  document.getElementById('cartOverlay')?.addEventListener('click', () => cart.closeSidebar());
  document.getElementById('cartContinue')?.addEventListener('click', () => cart.closeSidebar());

  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckout);

  document.querySelectorAll('.add-to-cart-viewer').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.add({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img,
      });
      cart.openSidebar();
    });
  });

  // Payment method tabs
  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      togglePaymentForm(btn.dataset.method);
    });
  });

  // Shipping option click
  document.querySelectorAll('.shipping-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Card number formatting
  const cardNumInput = document.getElementById('cardNumber');
  if (cardNumInput) {
    cardNumInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
      const display = document.getElementById('cardNumDisplay');
      if (display) {
        const padded = v.padEnd(16, '•');
        display.textContent = `${padded.slice(0,4)} ${padded.slice(4,8)} ${padded.slice(8,12)} ${padded.slice(12,16)}`;
      }
    });
  }
  const cardNameInput = document.getElementById('cardName');
  if (cardNameInput) {
    cardNameInput.addEventListener('input', e => {
      const display = document.getElementById('cardNameDisplay');
      if (display) display.textContent = e.target.value.toUpperCase() || 'NOMBRE APELLIDO';
    });
  }
  const cardExpInput = document.getElementById('cardExp');
  if (cardExpInput) {
    cardExpInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
      e.target.value = v;
      const display = document.getElementById('cardExpDisplay');
      if (display) display.textContent = v || 'MM/AA';
    });
  }

  // Newsletter form
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('¡Suscripción exitosa! Bienvenido a Faga.', 'success');
    e.target.reset();
  });
});

// ─── CHECKOUT ──────────────────────────────
let currentStep = 1;

function openCheckout() {
  cart.closeSidebar();
  cart.renderOrderSummaryMini();
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  goToStep(1);
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

function nextStep(step) {
  goToStep(step);
}

function goToStep(step) {
  currentStep = step;
  document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`)?.classList.add('active');

  document.querySelectorAll('.step[data-step]').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (n === step) s.classList.add('active');
    else if (n < step) s.classList.add('completed');
  });
}

function togglePaymentForm(method) {
  const cardForm = document.getElementById('cardForm');
  if (cardForm) cardForm.style.display = method === 'card' ? 'block' : 'none';
}

function processPayment() {
  const btn = document.getElementById('payBtn');
  if (!btn) return;

  btn.innerHTML = `<span class="paying-spinner"></span> Procesando...`;
  btn.disabled = true;

  setTimeout(() => {
    closeCheckout();
    const orderNum = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('orderNumber').textContent = orderNum;

    const d = new Date();
    d.setDate(d.getDate() + 7);
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('deliveryDate').textContent = d.toLocaleDateString('es-MX', opts);

    const successModal = document.getElementById('successModal');
    successModal.classList.add('open');

    cart.items = [];
    cart.save();
    cart.render();

    btn.innerHTML = `Pagar ahora <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    btn.disabled = false;
  }, 2500);
}

function closeSuccess() {
  document.getElementById('successModal').classList.remove('open');
  document.body.style.overflow = '';
}

function openArModal() {
  document.getElementById('arModal').classList.add('open');
}
