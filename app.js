// =====================================================================
// DORMEDS FAST MEDICINE — Complete Application Engine v2.1
// All views, routing, state management, and business logic
// =====================================================================

class DormedsApp {
  constructor() {
    this.db = new DormedsDB();
    this.user = JSON.parse(localStorage.getItem('dmed_user') || 'null');
    this.role = localStorage.getItem('dmed_role') || null;
    this.cart = this.db.get('cart');
    this.searchTimeout = null;
    this._ratingStars = 0;
  }

  // ---- Init ----
  init() {
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('resize', () => this._onResize());
    document.body.style.maxWidth = "500px";
document.body.style.margin = "auto";
document.body.style.padding = "10px";
    this.showSplash();
    // Boot extras after splash
    setTimeout(() => this._bootExtras && this._bootExtras(), 2500);
  }

  _onResize() {
    // Only re-render when crossing a breakpoint to avoid flicker
    const bp = window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 640 ? 'tablet' : 'mobile';
    if (bp === this._lastBreakpoint) return;
    this._lastBreakpoint = bp;
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this.route(), 100);
  }

  isMobile() { return window.innerWidth < 768; }
  isTablet() { return window.innerWidth >= 768 && window.innerWidth < 1024; }
  isDesktop() { return window.innerWidth >= 1024; }

  // ---- Toast ----
  toast(msg, type = 'success') {
    const el = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type[0]}`;
    t.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span class="toast-msg">${msg}</span><span class="toast-x" onclick="this.parentElement.remove()">✕</span>`;
    el.appendChild(t);
    setTimeout(() => { if (t.parentElement) t.remove(); }, 3500);
  }

  // ---- Splash ----
  showSplash() {
    document.getElementById('app').innerHTML = `
      <div class="splash" id="splash">
        <img src="assets/logo.png" class="splash-logo-img" alt="DORMEDS"
          onerror="this.style.display='none';document.getElementById('splash-fallback').style.display='flex'" />
        <div id="splash-fallback" style="display:none;flex-direction:column;align-items:center;gap:12px">
          <div style="font-size:56px">💊</div>
          <div style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,#60A5FA,#2563EB);-webkit-background-clip:text;-webkit-text-fill-color:transparent">DORMEDS</div>
          <div style="font-size:.75rem;color:#475569;letter-spacing:.15em;text-transform:uppercase">Fast Healthcare</div>
        </div>
        <div class="splash-bar" style="margin-top:24px"></div>
      </div>`;
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('out');
      setTimeout(() => this.route(), 500);
    }, 1800);
  }

  // ---- Router ----
  route() {
    const hash = location.hash || '#/';
    const app = document.getElementById('app');

    // Super Admin route — completely separate
    if (hash.startsWith('#/super-admin')) {
      const [,, view] = hash.split('/');
      this.routeSuperAdmin(app, view || 'dashboard');
      return;
    }

    if (hash === '#/' || hash === '') {
      if (this.user) { location.hash = `#/${this.role}/home`; return; }
      this.viewLanding(app); return;
    }
    const [, role, view, param] = hash.match(/#\/([^/]+)\/?([^/]*)\/?(.*)/) || [];
    if (role === 'login') { this.viewLogin(app, view); return; }
    // Admin sub-roles
    if (role.startsWith('admin-')) {
      const adminRole = role.replace('admin-','');
      if (!this.user || this.role !== 'admin') { location.hash = '#/login/admin'; return; }
      this.routeAdmin(app, adminRole, view || 'home', param); return;
    }
    switch (role) {
      case 'customer': this.viewCustomer(app, view || 'home', param); break;
      case 'pharmacy': this.viewDash(app, 'pharmacy', view || 'home', param); break;
      case 'delivery': this.viewDash(app, 'delivery', view || 'home', param); break;
      case 'admin':
        if (!this.user) { location.hash = '#/login/admin'; return; }
        this.viewAdminRoleSelect(app); break;
      default: this.viewLanding(app);
    }
  }

  // ===== LANDING =====
  viewLanding(app) {
    app.innerHTML = `
    <div class="landing">
      <div class="particles">${Array.from({length:8},(_,i)=>`<div class="particle"></div>`).join('')}</div>
      <div class="land-content anim-up">
        <div class="land-logo">
          <img src="assets/logo.png" class="logo-img" alt="DORMEDS" onerror="this.outerHTML='<div style=&quot;font-size:2.5rem;font-weight:900;background:linear-gradient(135deg,#60A5FA,#2563EB);-webkit-background-clip:text;-webkit-text-fill-color:transparent&quot;>💊 DORMEDS</div>'" />
        </div>
        <h1>Your Medicine,<br><span class="hl">Delivered Fast</span></h1>
        <p class="land-sub">Order medicines from nearby pharmacies with real-time tracking, prescription verification, and smart refill reminders. India's smartest medicine delivery.</p>
        <div class="roles">
          <div class="role-c anim-up stg-1" onclick="A.go('customer')" id="role-customer"><span class="rc-icon">🛒</span><h3>Customer</h3><p>Order medicines fast</p></div>
          <div class="role-c anim-up stg-2" onclick="A.go('pharmacy')" id="role-pharmacy"><span class="rc-icon">🏪</span><h3>Pharmacy</h3><p>Manage orders & stock</p></div>
          <div class="role-c anim-up stg-3" onclick="A.go('delivery')" id="role-delivery"><span class="rc-icon">🚴</span><h3>Delivery</h3><p>Deliver & earn</p></div>
          <div class="role-c anim-up stg-4" onclick="A.go('admin')" id="role-admin"><span class="rc-icon">⚙️</span><h3>Admin</h3><p>Control everything</p></div>
        </div>
      </div>
    </div>`;
  }

  go(role) { location.hash = `#/login/${role}`; }

  // ===== LOGIN =====
  viewLogin(app, role) {
    const labels = { customer: '🛒 Customer', pharmacy: '🏪 Pharmacy', delivery: '🚴 Delivery', admin: '⚙️ Admin' };
    const icons = { customer: '📱', pharmacy: '💊', delivery: '🏍️', admin: '🛡️' };
    app.innerHTML = `
    <div class="login">
      <div class="login-card anim-up">
        <div class="login-icon">${icons[role]}</div>
        <h2>Welcome to DORMEDS</h2>
        <p class="login-sub">${labels[role]} Login</p>
        <div id="step1">
          <div class="phone-row"><span class="phone-pre">🇮🇳 +91</span><input class="inp" type="tel" id="phoneInp" placeholder="Enter 10-digit number" maxlength="10" style="flex:1" /></div>
          <button class="btn btn-p btn-block btn-lg" onclick="A.sendOtp('${role}')">Send OTP</button>
        </div>
        <div id="step2" style="display:none">
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-4)">Enter the 4-digit OTP</p>
          <div class="otp-row">
            <input class="otp-box" type="text" maxlength="1" id="o1" oninput="A.otpNav(this,'o2')"/>
            <input class="otp-box" type="text" maxlength="1" id="o2" oninput="A.otpNav(this,'o3')"/>
            <input class="otp-box" type="text" maxlength="1" id="o3" oninput="A.otpNav(this,'o4')"/>
            <input class="otp-box" type="text" maxlength="1" id="o4" oninput="A.verifyOtp('${role}')"/>
          </div>
          <button class="btn btn-p btn-block btn-lg" onclick="A.verifyOtp('${role}')">Verify & Login</button>
          <p style="margin-top:var(--s-4);font-size:var(--text-sm);color:var(--text-muted)">Didn't receive? <span style="color:var(--primary);cursor:pointer;font-weight:600" onclick="A.sendOtp('${role}')">Resend</span></p>
        </div>
        <p style="margin-top:var(--s-6);font-size:11px;color:var(--text-muted)">Demo: Any 10-digit number · OTP: <strong>1234</strong></p>
        <button class="btn btn-g" style="margin-top:var(--s-4)" onclick="location.hash='#/'">← Back</button>
      </div>
    </div>`;
  }

  sendOtp(role) {
    const ph = document.getElementById('phoneInp').value;
    if (!/^\d{10}$/.test(ph)) { this.toast('Enter valid 10-digit number', 'error'); return; }
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    this.toast('OTP sent to +91 ' + ph);
    setTimeout(() => document.getElementById('o1')?.focus(), 200);
  }

  otpNav(el, next) { if (el.value.length === 1) document.getElementById(next)?.focus(); }

  verifyOtp(role) {
    const otp = ['o1','o2','o3','o4'].map(id => document.getElementById(id)?.value || '').join('');
    if (otp !== '1234') { this.toast('Wrong OTP. Use 1234', 'error'); return; }
    const users = {
      customer:{id:'U1',name:'Rahul Sharma',role:'customer',avatar:'RS',phone:'9876543210'},
      pharmacy:{id:'P1',name:'MedPlus',role:'pharmacy',avatar:'MP',phone:'9876500001'},
      delivery:{id:'D1',name:'Ravi Kumar',role:'delivery',avatar:'RK',phone:'9876600001'},
      admin:{id:'ADM-O1',name:'Vishal Sharma',role:'admin',avatar:'VS',phone:'0000000000'}
    };
    this.user = users[role]; this.role = role;
    localStorage.setItem('dmed_user', JSON.stringify(this.user));
    localStorage.setItem('dmed_role', role);
    this.toast(`Welcome, ${this.user.name}!`);
    // Admin goes to role selector, not dashboard
    if (role === 'admin') { location.hash = '#/admin'; return; }
    location.hash = `#/${role}/home`;
  }

  logout() {
    this.user = null; this.role = null; this.adminRole = null;
    localStorage.removeItem('dmed_user');
    localStorage.removeItem('dmed_role');
    localStorage.removeItem('dmed_admin_role');
    location.hash = '#/';
  }

  // ===== CUSTOMER VIEWS =====
  viewCustomer(app, v, p) {
    const views = {
      home:()=>this.cHome(), search:()=>this.cSearch(p), product:()=>this.cProduct(p),
      cart:()=>this.cCart(), checkout:()=>this.cCheckout(), prescription:()=>this.cPrescription(),
      tracking:()=>this.cTracking(p), orders:()=>this.cOrders(), profile:()=>this.cProfile(),
      services:()=>this.cServices(), bptbook:()=>this.cBptBook(), labbook:()=>this.cLabBook(),
      subscription:()=>this.cSubscription(), exercises:()=>this._wrapExerciseLib(),
      loyalty:()=>this.cLoyalty(), reminders:()=>this.cReminders(), health:()=>this.cHealthProfile(),
      support:()=>this.cSupport(),
    };
    const content = (views[v] || views.home)();
    const cc = this.cart.length;
    const isInner = ['product','checkout','tracking','bptbook','labbook','exercises','loyalty','reminders','health','support'].includes(v);
    const innerTitles = {product:'Product Detail',checkout:'Checkout',tracking:'Order Tracking',bptbook:'Book BPT Session',labbook:'Book Lab Test',exercises:'Exercise Library',loyalty:'DORM Coins',reminders:'Reminders',health:'Health Profile',support:'Customer Support'};
    const navItems = [
      {id:'home',icon:'🏠',l:'Home'},
      {id:'search',icon:'🔍',l:'Search'},
      {id:'services',icon:'🏥',l:'Services'},
      {id:'orders',icon:'📦',l:'Orders'},
      {id:'profile',icon:'👤',l:'Profile'},
    ];
    const desktopExtra = [
      {id:'prescription',icon:'📋',l:'Rx Upload'},
      {id:'subscription',icon:'💳',l:'Subscription'},
      {id:'exercises',icon:'🏋️',l:'Exercises'},
      {id:'loyalty',icon:'🪙',l:'DORM Coins'},
      {id:'reminders',icon:'⏰',l:'Reminders'},
      {id:'health',icon:'❤️',l:'Health'},
      {id:'support',icon:'🎧',l:'Support'},
    ];

    // ---- DESKTOP: two-panel layout ----
    if (this.isDesktop()) {
      const allNavItems = [...navItems, ...desktopExtra];
      app.innerHTML = `
        <div class="customer-web-layout">
          <aside class="customer-web-sidenav">
            <div class="side-logo-row">
              <img src="assets/icon.png" class="hdr-logo-img" alt="DORMEDS"
                onerror="this.outerHTML='&lt;span style=&quot;font-size:24px&quot;&gt;💊&lt;/span&gt;'" />
              <span style="font-weight:900;font-size:var(--text-lg)">DORMEDS</span>
            </div>
            ${allNavItems.map(i => `
              <div class="cwn-item ${v===i.id?'active':''}" onclick="location.hash='#/customer/${i.id}'">
                <span class="cwn-icon">${i.icon}</span>${i.l}
                ${i.id==='home'&&cc>0?`<span class="badge badge-p" style="margin-left:auto">${cc}</span>`:''}
              </div>`).join('')}
            <div style="flex:1"></div>
            ${cc>0&&!['cart','checkout'].includes(v)?`
              <div class="cwn-item" style="background:var(--primary-subtle);color:var(--primary)"
                onclick="location.hash='#/customer/cart'">
                <span class="cwn-icon">🛒</span>Cart (${cc}) · ₹${this.cartTotal()}
              </div>`:''}
            <div class="cwn-item" style="color:var(--error)" onclick="A.logout()">
              <span class="cwn-icon">🚪</span>Logout
            </div>
          </aside>
          <div class="customer-web-main">
            ${isInner
              ? `<div class="m-head"><button class="hdr-btn" onclick="history.back()">←</button><div class="h-title">${innerTitles[v]||''}</div><div style="width:40px"></div></div>`
              : `<div class="m-head">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-weight:700;font-size:var(--text-base);color:var(--text-secondary)">${[...navItems,...desktopExtra].find(i=>i.id===v)?.l||'Home'}</span>
                  </div>
                  <div style="display:flex;gap:var(--s-2)">
                    <button class="hdr-btn" style="position:relative" onclick="A.showNotificationPanel()" id="notif-btn-desk">🔔<span class="dot-badge notif-badge-live" style="display:${this.db.unreadCount('U1')>0?'flex':'none'}">${this.db.unreadCount('U1')}</span></button>
                    <button class="hdr-btn" onclick="location.hash='#/customer/cart'" style="position:relative">🛒${cc>0?`<span class="dot-badge">${cc}</span>`:''}</button>
                  </div>
                </div>`}
            <div class="mob-content page">${content}</div>
          </div>
        </div>`;
      return;
    }

    // ---- MOBILE / TABLET: bottom nav layout ----
    app.innerHTML = `
      ${isInner
        ? `<div class="m-head"><button class="hdr-btn" onclick="history.back()">←</button><div class="h-title">${innerTitles[v]||''}</div><div style="width:40px"></div></div>`
        : `<div class="m-head">
          <div style="display:flex;align-items:center;gap:10px">
            <img src="assets/icon.png" class="hdr-logo-img" alt="DORMEDS" onerror="this.outerHTML='&lt;span style=&quot;font-size:22px&quot;&gt;💊&lt;/span&gt;'" />
            <span style="font-weight:900;font-size:var(--text-base)">DORMEDS</span>
          </div>
          <div style="display:flex;gap:var(--s-2)">
            <button class="hdr-btn" style="position:relative" onclick="A.showNotificationPanel()" id="notif-btn-mob">🔔<span class="dot-badge notif-badge-live" style="display:${this.db.unreadCount('U1')>0?'flex':'none'}">${this.db.unreadCount('U1')}</span></button>
            <button class="hdr-btn" onclick="location.hash='#/customer/cart'" style="position:relative">🛒${cc>0?`<span class="dot-badge">${cc}</span>`:''}</button>
          </div>
        </div>`}
      <div class="mob-content page">${content}</div>
      ${cc > 0 && !['cart','checkout'].includes(v) ? `<div class="f-cart" onclick="location.hash='#/customer/cart'"><span style="font-size:var(--text-sm);font-weight:600">🛒 ${cc} item${cc>1?'s':''}</span><span style="font-weight:800">₹${this.cartTotal()} →</span></div>` : ''}
      <nav class="b-nav">
        ${navItems.map(i=>`<div class="n-item ${v===i.id?'on':''}" onclick="location.hash='#/customer/${i.id}'"><span class="n-icon">${i.icon}</span>${i.l}</div>`).join('')}
      </nav>`;
  }

  // ---- Customer Home ----
  cHome() {
    const cats = this.db.get('categories');
    const meds = this.db.get('medicines');
    const pop = meds.filter(m => m.rat >= 4.4 && m.stock > 0).slice(0, 6);
    const lastOrd = this.db.get('orders').find(o => o.uid === 'U1' && o.status === 'delivered');
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening';
    return `<div class="c-home">
      <div class="greet" style="margin-bottom:var(--s-4)"><p class="g-sub">Good ${greet} 👋</p><h2>Hi, <span>${this.user?.name||'User'}</span></h2></div>
      ${this.getSubBanner()}
      <div class="search" style="margin-bottom:var(--s-5)"><span class="s-icon">🔍</span>
        <input type="text" placeholder="Search medicines, symptoms..." id="homeSearch" oninput="A.autoComplete(this)" onkeydown="if(event.key==='Enter')location.hash='#/customer/search/'+encodeURIComponent(this.value)" onfocus="A.showRecent()" />
        <div id="searchDrop" class="search-dropdown" style="display:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3);margin-bottom:var(--s-5)">
        <div onclick="location.hash='#/customer/services'" style="background:linear-gradient(135deg,#1E40AF,#3B82F6);border-radius:var(--r-xl);padding:var(--s-4);cursor:pointer">
          <div style="font-size:24px;margin-bottom:var(--s-1)">🧘</div>
          <div style="font-weight:700;color:#fff;font-size:var(--text-sm)">Physiotherapy</div>
          <div style="font-size:10px;color:rgba(255,255,255,.7)">Book BPT Session</div>
        </div>
        <div onclick="location.hash='#/customer/labbook'" style="background:linear-gradient(135deg,#14532D,#16A34A);border-radius:var(--r-xl);padding:var(--s-4);cursor:pointer">
          <div style="font-size:24px;margin-bottom:var(--s-1)">🧪</div>
          <div style="font-weight:700;color:#fff;font-size:var(--text-sm)">Lab Tests</div>
          <div style="font-size:10px;color:rgba(255,255,255,.7)">Home Collection</div>
        </div>
      </div>
      <div class="offers"><div class="offers-track">
        <div class="offer"><div class="o-tag">Limited Offer</div><h3>50% OFF</h3><p>On your first medicine order</p><span class="o-code">FIRST50</span></div>
        <div class="offer"><div class="o-tag">Health Week</div><h3>20% OFF</h3><p>On all vitamins & supplements</p><span class="o-code">HEALTH20</span></div>
        <div class="offer"><div class="o-tag">Free Delivery</div><h3>₹0 Delivery</h3><p>On orders above ₹300</p><span class="o-code">FREEDEL</span></div>
      </div></div>
      <div class="sec-h"><h3>Categories</h3><span class="see-all" onclick="location.hash='#/customer/search'">See All</span></div>
      <div class="cats">${cats.map(c=>`<div class="cat-c" onclick="location.hash='#/customer/search/${encodeURIComponent(c.name)}'"><span class="cc-icon">${c.icon}</span><span class="cc-name">${c.name}</span></div>`).join('')}</div>
      ${lastOrd?`<div class="sec-h"><h3>🔄 Smart Refill</h3></div>
      <div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-6);display:flex;align-items:center;gap:var(--s-4)" onclick="A.reorder()">
        <div style="width:44px;height:44px;background:var(--primary);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🔄</div>
        <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">Reorder: ${lastOrd.items.map(i=>i.name).join(', ')}</div><div style="font-size:11px;color:var(--text-muted)">Last ordered ${new Date(lastOrd.createdAt).toLocaleDateString('en-IN')}</div></div>
        <span style="color:var(--primary);font-weight:600;font-size:var(--text-sm)">→</span>
      </div>`:''}
      <div class="sec-h"><h3>🔥 Popular</h3><span class="see-all" onclick="location.hash='#/customer/search'">See All</span></div>
      <div class="med-grid">${pop.map(m=>this.medCard(m)).join('')}</div>
    </div>`;
  }

  medCard(m) {
    return `<div class="med-c" onclick="location.hash='#/customer/product/${m.id}'">
      <div class="med-img">${m.icon}${m.off?`<span class="med-off">${m.off}%</span>`:''}${m.rx?`<span class="med-rx">Rx</span>`:''}</div>
      <div class="med-info"><div class="med-name">${m.name}</div><div class="med-gen">${m.gen}</div>
        <div class="med-row"><div><span class="med-price">₹${m.price}</span>${m.mrp>m.price?`<span class="med-mrp">₹${m.mrp}</span>`:''}</div>
          <button class="med-add" onclick="event.stopPropagation();A.addCart('${m.id}')">+</button></div>
        <div class="med-rat">⭐ ${m.rat} <span style="color:var(--text-muted);font-weight:400">(${m.rev.toLocaleString()})</span></div>
      </div></div>`;
  }

  // ---- Autocomplete ----
  autoComplete(inp) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const q = inp.value;
      const drop = document.getElementById('searchDrop');
      if (!q || q.length < 1) { drop.style.display = 'none'; return; }
      const sugg = this.db.autocomplete(q);
      if (sugg.length === 0) { drop.style.display = 'none'; return; }
      drop.style.display = 'block';
      drop.innerHTML = sugg.map(s => `<div class="search-item" onclick="location.hash='#/customer/${s.type==='medicine'?'product/'+s.id:'search/'+encodeURIComponent(s.text)}'">${s.icon} <div style="flex:1"><div style="font-weight:500">${s.text}</div><div class="si-cat">${s.sub}</div></div></div>`).join('');
    }, 150);
  }

  showRecent() {
    const hist = this.db.get('searchHistory');
    const drop = document.getElementById('searchDrop');
    if (!drop || hist.length === 0) return;
    const inp = document.getElementById('homeSearch');
    if (inp && inp.value.length > 0) return;
    drop.style.display = 'block';
    drop.innerHTML = `<div style="padding:8px 16px;font-size:11px;color:var(--text-muted);font-weight:600">RECENT SEARCHES</div>`
      + hist.map(h => `<div class="search-item" onclick="location.hash='#/customer/search/${encodeURIComponent(h)}'">🕐 <span style="flex:1">${h}</span></div>`).join('');
  }

  // ---- Search ----
  cSearch(q) {
    const meds = q ? this.db.search(decodeURIComponent(q)) : this.db.get('medicines');
    const cats = this.db.get('categories');
    const title = q ? `Results for "${decodeURIComponent(q)}"` : 'All Medicines';
    if (q) {
      const hist = this.db.get('searchHistory');
      const dq = decodeURIComponent(q);
      if (!hist.includes(dq)) { hist.unshift(dq); this.db.set('searchHistory', hist.slice(0, 10)); }
    }
    return `<div class="c-home">
      <div class="search" style="margin-bottom:var(--s-4)"><span class="s-icon">🔍</span>
        <input type="text" placeholder="Search medicines, symptoms..." value="${q?decodeURIComponent(q):''}" id="searchInp"
          oninput="A.autoComplete(this)" onkeydown="if(event.key==='Enter')location.hash='#/customer/search/'+encodeURIComponent(this.value)"/>
        <div id="searchDrop" class="search-dropdown" style="display:none"></div>
      </div>
      <div style="display:flex;gap:var(--s-2);overflow-x:auto;padding:2px;margin-bottom:var(--s-4)">
        <span class="tab ${!q?'on':''}" onclick="location.hash='#/customer/search'">All</span>
        ${cats.map(c=>`<span class="tab ${q&&decodeURIComponent(q)===c.name?'on':''}" onclick="location.hash='#/customer/search/${encodeURIComponent(c.name)}'">${c.icon} ${c.name}</span>`).join('')}
      </div>
      <div class="sec-h"><h3>${title}</h3><span style="font-size:var(--text-sm);color:var(--text-muted)">${meds.length} items</span></div>
      ${meds.length?`<div class="med-grid">${meds.map(m=>this.medCard(m)).join('')}</div>`
        :`<div style="text-align:center;padding:var(--s-16) var(--s-6)"><div style="font-size:48px;margin-bottom:var(--s-4)">🔍</div><h3>No medicines found</h3><p style="color:var(--text-secondary);margin-top:var(--s-2)">Try a different search term or check spelling</p></div>`}
    </div>`;
  }

  // ---- Product Detail ----
  cProduct(id) {
    const m = this.db.getOne('medicines', id);
    if (!m) return `<div style="text-align:center;padding:var(--s-16)"><h3>Product not found</h3><button class="btn btn-p" onclick="history.back()">Go Back</button></div>`;
    const phs = this.db.get('pharmacies').filter(p => p.status === 'approved').slice(0, 3);
    const related = this.db.get('medicines').filter(r => r.cat === m.cat && r.id !== m.id).slice(0, 4);
    const inCart = this.cart.find(c => c.mid === id);
    return `<div class="pd">
      <div class="pd-img">${m.icon}<div class="pd-badges">${m.off?`<span class="badge badge-e">${m.off}% OFF`:''}${m.rx?`<span class="badge badge-i">Rx Required</span>`:''}</div></div>
      <h2 class="pd-name">${m.name}</h2><p class="pd-gen">${m.gen} · ${m.mfr}</p>
      <div style="display:flex;align-items:center;gap:var(--s-2);margin-bottom:var(--s-4)"><span class="badge badge-w">⭐ ${m.rat}</span><span style="font-size:var(--text-sm);color:var(--text-secondary)">${m.rev.toLocaleString()} reviews</span></div>
      <div class="pd-price"><span class="pd-sell">₹${m.price}</span>${m.mrp>m.price?`<span class="pd-mrp">₹${m.mrp}</span><span class="pd-save">Save ₹${m.mrp-m.price}</span>`:''}</div>
      <div style="display:flex;gap:var(--s-3);margin-bottom:var(--s-6)">
        <button class="btn btn-p btn-lg" style="flex:1" onclick="A.addCart('${m.id}');A.toast('${m.name} added!');location.hash='#/customer/cart'">🛒 ${inCart?`In Cart (${inCart.qty})`:'Add to Cart'}</button>
        <button class="btn btn-s btn-lg btn-icon" onclick="A.saveItem('${m.id}')">❤️</button>
      </div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📋 Product Info</h4>
        <div class="info-tbl">
          <div class="info-r"><span class="info-l">Description</span><span class="info-v">${m.desc}</span></div>
          <div class="info-r"><span class="info-l">Dosage</span><span class="info-v">${m.dose}</span></div>
          <div class="info-r"><span class="info-l">Side Effects</span><span class="info-v">${m.side}</span></div>
          <div class="info-r"><span class="info-l">Category</span><span class="info-v">${m.cat}</span></div>
          <div class="info-r"><span class="info-l">Stock</span><span class="info-v">${m.stock>0?`<span style="color:var(--success)">In Stock (${m.stock})</span>`:'<span style="color:var(--error)">Out of Stock</span>'}</span></div>
          ${m.rx?`<div class="info-r"><span class="info-l">Prescription</span><span class="info-v" style="color:var(--warning);font-weight:600">⚕️ Required</span></div>`:''}
        </div>
      </div></div>
      <div class="sec-h"><h3>🏪 Nearby Pharmacies</h3></div>
      ${phs.map((ph,i)=>`<div class="ph-opt ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.ph-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div class="ph-logo">${ph.name[0]}</div><div class="ph-info"><div class="ph-name">${ph.name}</div><div class="ph-dist">📍 ${(1.2+i*.8).toFixed(1)} km · ⭐ ${ph.rating}</div></div><div class="ph-eta">${15+i*10} min</div></div>`).join('')}
      ${related.length?`<div class="sec-h" style="margin-top:var(--s-6)"><h3>Similar Products</h3></div><div class="med-grid">${related.map(r=>this.medCard(r)).join('')}</div>`:''}
    </div>`;
  }

  saveItem(id) {
    const u = this.db.getOne('users','U1');
    if (!u) return;
    const saved = u.saved || [];
    if (saved.includes(id)) { this.toast('Already in wishlist','info'); return; }
    saved.push(id);
    this.db.update('users','U1',{saved});
    this.toast('Saved to wishlist! ❤️');
  }

  // ---- Cart ----
  addCart(id) {
    const m = this.db.getOne('medicines', id);
    if (!m) { this.toast('Medicine not found', 'error'); return; }
    if (m.stock <= 0) { this.toast(`${m.name} is out of stock`, 'error'); return; }
    const ex = this.cart.find(c => c.mid === id);
    if (ex) { if (ex.qty >= m.stock) { this.toast('Maximum stock reached', 'warning'); return; } ex.qty++; }
    else this.cart.push({mid:id,name:m.name,price:m.price,mrp:m.mrp,icon:m.icon,qty:1,rx:m.rx});
    this.db.set('cart', this.cart);
    this.toast(`${m.name} added to cart`);
    // Check drug interactions
    if (this.cart.length >= 2) this.checkCartInteractions && setTimeout(() => this.checkCartInteractions(), 400);
    this.route();
  }

  rmCart(id) { this.cart = this.cart.filter(c => c.mid !== id); this.db.set('cart', this.cart); this.route(); }
  updQty(id, d) {
    const c = this.cart.find(c => c.mid === id);
    if (!c) return;
    const m = this.db.getOne('medicines', id);
    c.qty += d;
    if (c.qty <= 0) { this.rmCart(id); return; }
    if (m && c.qty > m.stock) { this.toast('Maximum stock reached', 'warning'); c.qty = m.stock; }
    this.db.set('cart', this.cart); this.route();
  }
  cartTotal() { return this.cart.reduce((s, c) => s + c.price * c.qty, 0); }

  cCart() {
    if (!this.cart.length) return `<div style="text-align:center;padding:var(--s-16) var(--s-6)"><div style="font-size:48px;margin-bottom:var(--s-4)">🛒</div><h3>Cart is empty</h3><p style="color:var(--text-secondary);margin-top:var(--s-2);margin-bottom:var(--s-6)">Browse medicines to get started</p><button class="btn btn-p" onclick="location.hash='#/customer/home'">Browse Medicines</button></div>`;
    const sub = this.cartTotal();
    const del = sub >= 300 ? 0 : 25;
    const saved = this.cart.reduce((s,c)=>(c.mrp-c.price)*c.qty+s,0);
    const needsRx = this.cart.some(c=>c.rx);
    const coinDisc = parseInt(localStorage.getItem('dmed_coin_discount') || '0');
    // Drug interaction check
    const medIds = this.cart.map(c => c.mid);
    const interactions = this.db.checkInteractions(medIds);
    const intHtml = interactions.length > 0 ? `
    <div style="margin-bottom:var(--s-4)">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:var(--s-2)">⚠️ Drug Interaction Alerts</div>
      ${interactions.map(ix => {
        const sev = ix.severity;
        const color = sev==='major'?'var(--error)':sev==='moderate'?'var(--warning)':'var(--info)';
        const icon = sev==='major'?'🔴':sev==='moderate'?'🟡':'🔵';
        return `<div class="drug-interaction-banner ${sev}">
          <div class="dib-icon">${icon}</div>
          <div class="dib-content">
            <h5 style="color:${color}">${ix.drug1Name} + ${ix.drug2Name} — ${sev.toUpperCase()}</h5>
            <p>${ix.message}</p>
          </div>
        </div>`;
      }).join('')}
    </div>` : '';

    return `<div style="padding:var(--s-4)">
      <h3 style="margin-bottom:var(--s-4)">🛒 Cart (${this.cart.length} items)</h3>
      ${needsRx?`<div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-4);display:flex;align-items:center;gap:var(--s-3);border-color:var(--primary)" onclick="location.hash='#/customer/prescription'">
        <div style="width:40px;height:40px;background:var(--primary);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:20px">📋</div>
        <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm);color:var(--primary)">Prescription Required</div><div style="font-size:11px;color:var(--text-muted)">Upload for Rx items in cart</div></div>
        <span style="color:var(--primary);font-weight:600">Upload →</span>
      </div>`:''}
      ${intHtml}
      ${this.cart.map(c=>`<div class="cart-item"><div class="ci-img">${c.icon}</div><div class="ci-info"><div class="ci-name">${c.name}</div><div class="ci-sub">${c.rx?'📋 Rx Required':'💊 OTC'}</div><div class="ci-bot"><span class="ci-price">₹${c.price*c.qty}</span><div style="display:flex;align-items:center;gap:var(--s-3)"><div class="qty"><button onclick="A.updQty('${c.mid}',-1)">−</button><span class="qty-v">${c.qty}</span><button onclick="A.updQty('${c.mid}',1)">+</button></div><button onclick="A.rmCart('${c.mid}')" style="color:var(--error);font-size:18px;padding:4px">🗑</button></div></div></div></div>`).join('')}
      <div style="display:flex;gap:var(--s-2);margin:var(--s-4) 0"><input class="inp" placeholder="Promo code" id="promoInp" style="flex:1;min-height:44px"/><button class="btn btn-s btn-sm" onclick="A.applyPromo()">Apply</button></div>
      ${coinDisc > 0 ? `<div style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3) var(--s-4);background:rgba(252,211,77,.08);border:1.5px solid rgba(252,211,77,.25);border-radius:var(--r-md);margin-bottom:var(--s-3)">
        <span style="font-size:20px">🪙</span>
        <div style="flex:1;font-size:var(--text-sm)"><strong style="color:#FCD34D">₹${coinDisc} DORM Coin Discount Active</strong><div style="font-size:11px;color:var(--text-muted)">Applied automatically at checkout</div></div>
        <button class="btn btn-g btn-sm" onclick="localStorage.removeItem('dmed_coin_discount');A.route();A.toast('Coin discount removed','info')">Remove</button>
      </div>` : ''}
      <div class="cart-sum">
        <div class="sum-r"><span>Subtotal</span><span>₹${sub}</span></div>
        <div class="sum-r"><span>Delivery</span><span>${del===0?'<span style="color:var(--success)">FREE</span>':'₹'+del}</span></div>
        ${saved>0?`<div class="sum-r"><span>You Save</span><span style="color:var(--success);font-weight:600">−₹${saved}</span></div>`:''}
        ${coinDisc>0?`<div class="sum-r"><span>🪙 Coin Discount</span><span style="color:#FCD34D;font-weight:600">−₹${coinDisc}</span></div>`:''}
        <div class="sum-r total"><span>Total</span><span>₹${Math.max(0, sub + del - coinDisc)}</span></div>
      </div>
      <button class="btn btn-p btn-block btn-lg" onclick="A.validateAndCheckout()">Proceed to Checkout →</button>
    </div>`;
  }

  applyPromo() {
    const code = document.getElementById('promoInp')?.value?.toUpperCase();
    const cpn = this.db.get('coupons').find(c => c.code === code && c.active);
    if (cpn) this.toast(`"${code}" applied! ${cpn.desc}`);
    else this.toast('Invalid or expired code', 'error');
  }

  validateAndCheckout() {
    const errors = this.db.validateStock(this.cart);
    if (errors.length) {
      errors.forEach(e => this.toast(`${e.name}: ${e.issue==='not_found'?'Not available':'Only '+e.available+' left'}`, 'error'));
      return;
    }
    location.hash = '#/customer/checkout';
  }

  // ---- Checkout ----
  cCheckout() {
    const sub = this.cartTotal(); const del = sub >= 300 ? 0 : 25; const total = sub + del;
    const user = this.db.getOne('users', 'U1');
    const phs = this.db.get('pharmacies').filter(p => p.status === 'approved').slice(0, 3);
    return `<div style="padding:var(--s-4)">
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">📍 Delivery Address</h3>
        ${(user?.addresses||[]).map((a,i)=>`<div class="addr-c ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.addr-c').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div style="font-size:24px">${a.icon}</div><div><div class="addr-type">${a.type}</div><div class="addr-txt">${a.address}</div></div></div>`).join('')}
        <button class="btn btn-g btn-sm" onclick="A.toast('Add address coming soon','info')">+ Add New Address</button>
      </div>
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">🏪 Choose Pharmacy</h3>
        ${phs.map((ph,i)=>`<div class="ph-opt ${i===0?'sel':''}" onclick="this.parentElement.querySelectorAll('.ph-opt').forEach(e=>e.classList.remove('sel'));this.classList.add('sel')"><div class="ph-logo">${ph.name[0]}</div><div class="ph-info"><div class="ph-name">${ph.name}</div><div class="ph-dist">📍 ${(1.2+i*.8).toFixed(1)} km · ⭐ ${ph.rating} · ${ph.open}–${ph.close}</div></div><div class="ph-eta">${15+i*10} min</div></div>`).join('')}
      </div>
      <div style="margin-bottom:var(--s-4)">
        <div class="emg-toggle" id="emgToggle" onclick="A.toggleEmergency()">
          <span style="font-size:24px">🚨</span>
          <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">Emergency Order</div><div style="font-size:11px;color:var(--text-secondary)">Priority pickup & faster delivery</div></div>
          <div class="toggle"><input type="checkbox" id="emgCheck"/><div class="toggle-track"></div></div>
        </div>
      </div>
      <div style="margin-bottom:var(--s-6)"><h3 style="margin-bottom:var(--s-3)">💳 Payment Method</h3>
        <div class="pay-opt sel" id="pay-upi" onclick="A.selPay('upi')"><span class="pay-icon">📱</span><div><div class="pay-name">UPI</div><div class="pay-desc">Google Pay, PhonePe, Paytm</div></div><div class="radio"></div></div>
        <div class="pay-opt" id="pay-cod" onclick="A.selPay('cod')"><span class="pay-icon">💵</span><div><div class="pay-name">Cash on Delivery</div><div class="pay-desc">Pay when you receive</div></div><div class="radio"></div></div>
        <div class="pay-opt" id="pay-card" onclick="A.selPay('card')"><span class="pay-icon">💳</span><div><div class="pay-name">Card</div><div class="pay-desc">Visa, Mastercard, Rupay</div></div><div class="radio"></div></div>
      </div>
      <div class="cart-sum"><div class="sum-r"><span>Subtotal (${this.cart.length} items)</span><span>₹${sub}</span></div><div class="sum-r"><span>Delivery</span><span>${del===0?'<span style="color:var(--success)">FREE</span>':'₹'+del}</span></div><div class="sum-r total"><span>Total</span><span>₹${total}</span></div></div>
      <button class="btn btn-p btn-block btn-lg" onclick="A.placeOrder()">💊 Place Order · ₹${total}</button>
    </div>`;
  }

  toggleEmergency() {
    const chk = document.getElementById('emgCheck');
    if (chk) { chk.checked = !chk.checked; document.getElementById('emgToggle').classList.toggle('active', chk.checked); }
  }

  selPay(method) {
    document.querySelectorAll('.pay-opt').forEach(e => e.classList.remove('sel'));
    document.getElementById('pay-'+method)?.classList.add('sel');
  }

  placeOrder() {
    const errors = this.db.validateStock(this.cart);
    if (errors.length) { errors.forEach(e => this.toast(`${e.name} stock issue`, 'error')); return; }
    this.db.lockStock(this.cart);
    const ph = this.db.findPharmacy(this.cart);
    if (!ph) { this.toast('No pharmacy available nearby. Please try later.', 'error'); return; }
    const oid = this.db.genId('O');
    const sub = this.cartTotal(); const del = sub >= 300 ? 0 : 25;
    const isEmergency = document.getElementById('emgCheck')?.checked || false;
    const selPay = document.querySelector('.pay-opt.sel .pay-name')?.textContent || 'UPI';
    const order = {
      id:oid, uid:'U1', uName:this.user.name, phId:ph.id, phName:ph.name, dId:null, dName:null,
      status:'pending', items:this.cart.map(c=>({mid:c.mid,name:c.name,qty:c.qty,price:c.price})),
      subtotal:sub, delFee:del, discount:0, total:sub+del,
      payMethod:selPay.includes('Cash')?'COD':selPay.includes('Card')?'Card':'UPI',
      payStatus: selPay.includes('Cash')?'pending':'paid',
      address:'42, Sector 15, Noida, UP 201301', hasRx:this.cart.some(c=>c.rx), rxStatus:null,
      emergency:isEmergency, rating:null, review:null,
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
    this.db.add('orders', order);
    this.cart = []; this.db.set('cart', this.cart);
    // Award loyalty coins
    const earned = this.db.awardLoyaltyCoins('U1', order.total, `Order ${oid} — ₹${order.total} spent`);
    if (earned > 0) {
      this.db.addNotification('U1', { type:'offer', icon:'🪙', title:`+${earned} DORM Coins Earned!`, body:`You earned ${earned} coins for this order. Redeem for discounts.`, link:'#/customer/loyalty' });
    }
    // Apply coin discount if active
    const coinDisc = parseInt(localStorage.getItem('dmed_coin_discount') || '0');
    if (coinDisc > 0) { localStorage.removeItem('dmed_coin_discount'); this.toast(`₹${coinDisc} coin discount applied! ✅`); }
    this.db.addNotification('U1', { type:'order', icon:'📦', title:'Order Placed!', body:`Order #${oid} placed. Total: ₹${order.total}.`, link:`#/customer/tracking/${oid}` });
    this.showSuccess(oid);
  }

  showSuccess(oid) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="success-ov" onclick="this.remove();location.hash='#/customer/tracking/${oid}'">
      <div class="success-check">✓</div>
      <h2 style="color:white">Order Placed! 🎉</h2>
      <p style="color:var(--text-secondary)">Order #${oid} confirmed<br>Tap anywhere to track</p>
    </div>`;
  }

  // ---- Prescription Upload ----
  cPrescription() {
    return `<div style="padding:var(--s-4)">
      <h3 style="margin-bottom:var(--s-2)">📋 Upload Prescription</h3>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-6)">Our AI-powered OCR extracts medicines automatically</p>
      <div class="upload-zone" onclick="document.getElementById('rxFile').click()">
        <div class="uz-icon">📸</div><h4>Tap to Upload Prescription</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--s-2)">Camera / Gallery · JPG, PNG, PDF</p>
        <input type="file" id="rxFile" accept="image/*,.pdf" style="display:none" onchange="A.processRx(event)"/>
      </div>
      <div id="ocrResults"></div>
      <div style="margin-top:var(--s-4);text-align:center;font-size:var(--text-sm);color:var(--text-muted)"><strong>Or type medicine names manually:</strong></div>
      <div style="display:flex;gap:var(--s-2);margin-top:var(--s-3)">
        <input class="inp" placeholder="e.g. Dolo, Crocin, Cetirizine" id="manualRx" style="flex:1"/>
        <button class="btn btn-p btn-sm" onclick="A.manualOcr()">Extract</button>
      </div>
      <div class="card" style="margin-top:var(--s-6)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📝 How It Works</h4>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:2">
          1. Upload or type prescription text<br>2. AI extracts medicine names<br>3. We match to our database<br>4. Review, edit, and add to cart<br>5. If OCR fails → sent to pharmacy for manual review
        </div>
      </div></div>
    </div>`;
  }

  processRx(event) {
    if (!event.target.files.length) return;
    const container = document.getElementById('ocrResults');
    container.innerHTML = `<div class="card" style="padding:var(--s-5);text-align:center;margin-bottom:var(--s-4)">
      <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto var(--s-4)"></div>
      <p style="font-weight:600">Processing Prescription...</p><p style="font-size:var(--text-sm);color:var(--text-secondary)">Extracting medicine names with OCR</p>
    </div>`;
    setTimeout(() => { this.showOcrResults('Dolo 650 Cetirizine Becosules Betadine'); }, 2000);
    this.toast('Prescription uploaded! Processing...');
  }

  manualOcr() {
    const text = document.getElementById('manualRx')?.value;
    if (!text) { this.toast('Enter medicine names', 'warning'); return; }
    this.showOcrResults(text);
  }

  showOcrResults(text) {
    const results = this.db.ocrProcess(text);
    const container = document.getElementById('ocrResults');
    if (results.length === 0) {
      container.innerHTML = `<div class="card" style="padding:var(--s-5);margin-bottom:var(--s-4)"><div style="text-align:center"><div style="font-size:40px;margin-bottom:var(--s-3)">🔍</div><h4>No matches found</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--s-2)">Prescription sent to pharmacy for manual review</p><span class="badge badge-w" style="margin-top:var(--s-3)">📋 Pending Review</span></div></div>`;
      return;
    }
    container.innerHTML = `<div class="ocr-result">
      <h4 style="margin-bottom:var(--s-3)">🧠 Extracted Medicines (${results.length} found)</h4>
      ${results.map(r => `
        <div class="ocr-item"><span style="font-size:20px">${r.match.icon}</span>
          <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">${r.match.name}</div><div style="font-size:11px;color:var(--text-muted)">${r.match.gen} · ₹${r.match.price}</div><span class="ocr-match ocr-exact">✓ Exact Match</span></div>
          <button class="btn btn-p btn-sm" onclick="A.addCart('${r.match.id}')">+ Add</button>
        </div>
        ${r.fuzzy.map(f=>`<div class="ocr-item" style="padding-left:var(--s-8)"><span style="font-size:16px">${f.icon}</span><div style="flex:1"><div style="font-size:var(--text-sm)">${f.name}</div><div style="font-size:11px;color:var(--text-muted)">₹${f.price}</div><span class="ocr-match ocr-fuzzy">~ Similar</span></div><button class="btn btn-s btn-sm" onclick="A.addCart('${f.id}')">+ Add</button></div>`).join('')}
      `).join('')}
      <div style="margin-top:var(--s-4)"><button class="btn btn-p btn-block" onclick="A.addAllOcr()">Add All Exact Matches</button></div>
    </div>`;
    this._lastOcr = results;
  }

  addAllOcr() {
    if (!this._lastOcr) return;
    this._lastOcr.forEach(r => this.addCart(r.match.id));
    this.toast(`${this._lastOcr.length} medicines added to cart!`);
  }

  // ---- Order Tracking ----
  cTracking(oid) {
    const o = this.db.getOne('orders', oid || 'O2');
    if (!o) return `<div style="text-align:center;padding:var(--s-16)"><h3>Order not found</h3><button class="btn btn-p" onclick="history.back()">Go Back</button></div>`;
    // Auto-mark notifications as read for this order
    const notifs = this.db.get('notifications');
    let changed = false;
    notifs.forEach(n => { if (n.link && n.link.includes(o.id) && !n.read) { n.read = true; changed = true; } });
    if (changed) this.db.set('notifications', notifs);
    const states = ['pending','accepted','preparing','packed','out_for_delivery','pending_physical_verification','completed'];
    const labels = ['Placed','Accepted','Preparing','Packed','On the Way','Verification','Completed'];
    const icons  = ['📋','✅','⚙️','📦','🏍️','📝','🎉'];
    // Support old 'delivered' status too
    let ci = states.indexOf(o.status);
    if (ci === -1 && o.status === 'delivered') ci = 6; // map delivered → completed slot
    const pct = ci >= 0 ? (ci / (states.length - 1)) * 100 : 0;

    const ppvBanner = (o.status === 'pending_physical_verification')
      ? `<div class="ppv-banner"><span class="ppv-icon">📝</span><div><h4>Awaiting Physical Verification</h4><p>Your prescription is being verified in person by the pharmacy. Delivery will complete once verified.</p></div></div>`
      : '';

    return `<div class="trk">
      <div class="trk-head"><div class="trk-oid">Order #${o.id}</div><div class="trk-eta"><span>⏱️</span><span>${o.status==='completed'||o.status==='delivered'?'Completed':'~25 min'}</span></div><div class="trk-status">${labels[ci]||'Processing'}</div></div>
      ${ppvBanner}
      <div class="trk-steps"><div class="trk-line" style="width:${pct}%"></div>
        ${states.map((s,i)=>`<div class="trk-step ${i<ci?'done':''} ${i===ci?'now':''}"><div class="ts-dot">${i<=ci?icons[i]:''}</div><span class="ts-lbl">${labels[i]}</span></div>`).join('')}
      </div>
      <div class="trk-map">🗺️<div class="trk-map-bar">📍 Live tracking · ${o.phName} → Your location</div></div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-4)">📍 Status Timeline</h4>
        <div class="timeline">${states.slice(0,ci+1).reverse().map((s,i)=>`<div class="tl-item ${i===0?'':'done'}"><div class="tl-dot ${i===0?'now':'done'}">${icons[ci-i]}</div><div class="tl-body"><h4>${labels[ci-i]}</h4><p>${new Date(o.updatedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p></div></div>`).join('')}</div>
      </div></div>
      <div class="card" style="margin-bottom:var(--s-4)"><div class="card-body">
        <h4 style="margin-bottom:var(--s-3)">📦 Order Items</h4>
        ${o.items.map(it=>`<div style="display:flex;justify-content:space-between;padding:var(--s-2) 0;font-size:var(--text-sm)"><span>${it.name} × ${it.qty}</span><span style="font-weight:600">₹${it.price*it.qty}</span></div>`).join('')}
        <div style="border-top:1px solid var(--border);margin-top:var(--s-3);padding-top:var(--s-3);display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:var(--primary)">₹${o.total}</span></div>
        <div style="margin-top:var(--s-2);font-size:11px;color:var(--text-muted)">Payment: ${o.payMethod} · <span style="color:${o.payStatus==='paid'?'var(--success)':'var(--warning)'}">${o.payStatus}</span>${o.emergency?'<span class="emg" style="margin-left:var(--s-2)">🚨 Emergency</span>':''}</div>
      </div></div>
      ${o.dName?`<div class="card" style="margin-bottom:var(--s-4)"><div class="card-body" style="display:flex;align-items:center;gap:var(--s-4)"><div class="avatar av-lg">🏍️</div><div style="flex:1"><h4>${o.dName}</h4><p style="font-size:var(--text-sm);color:var(--text-secondary)">Delivery Partner</p></div><button class="btn btn-p btn-sm" onclick="A.toast('Calling...','info')">📞 Call</button></div></div>`:''}
      ${(o.status==='completed'||o.status==='delivered')?`<button class="btn btn-g btn-block" style="margin-bottom:var(--s-4)" onclick="A.printInvoice('${o.id}')">🖨️ Download Invoice / Receipt</button>`:``}
      ${(o.status==='completed'||o.status==='delivered')&&!o.rating?`<div class="card"><div class="card-body"><h4 style="text-align:center;margin-bottom:var(--s-3)">⭐ Rate Your Order</h4><div class="rating-stars" id="ratingStars">${[1,2,3,4,5].map(n=>`<span class="star" onclick="A.setRating(${n},'${o.id}')">★</span>`).join('')}</div><textarea class="rating-input" id="reviewText" placeholder="Share your experience..."></textarea><button class="btn btn-p btn-block" style="margin-top:var(--s-3)" onclick="A.submitRating('${o.id}')">Submit Review</button></div></div>`:''}
      ${o.rating?`<div class="card"><div class="card-body" style="text-align:center"><div style="font-size:24px;margin-bottom:var(--s-2)">${'⭐'.repeat(o.rating)}</div><p style="font-size:var(--text-sm);color:var(--text-secondary)">&quot;${o.review||'Reviewed'}&quot;</p></div></div>`:''}
    </div>`;
  }

  setRating(n, oid) {
    this._ratingStars = n;
    document.querySelectorAll('#ratingStars .star').forEach((s, i) => s.classList.toggle('active', i < n));
  }

  submitRating(oid) {
    if (!this._ratingStars) { this.toast('Please select a rating','warning'); return; }
    const review = document.getElementById('reviewText')?.value || '';
    this.db.update('orders', oid, {rating:this._ratingStars, review, updatedAt:new Date().toISOString()});
    this.toast('Thank you for your review! ⭐');
    this._ratingStars = 0;
    this.route();
  }

  // ---- Orders ----
  cOrders() {
    const ords = this.db.get('orders').filter(o => o.uid === 'U1').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-p',out_for_delivery:'badge-p',pending_physical_verification:'badge-w',completed:'badge-s',delivered:'badge-s',cancelled:'badge-e',delivery_failed:'badge-e'};
    const sl = {pending:'Pending',accepted:'Accepted',preparing:'Preparing',packed:'Packed',out_for_delivery:'On the Way',pending_physical_verification:'⏳ Verification',completed:'Completed',delivered:'Delivered',cancelled:'Cancelled',delivery_failed:'Failed'};

    // Smart Refill Predictor
    const deliveredOrds = ords.filter(o => ['completed','delivered'].includes(o.status));
    const medOrderDates = {}; // medId -> [dates]
    deliveredOrds.forEach(o => {
      o.items.forEach(it => {
        if (!medOrderDates[it.mid]) medOrderDates[it.mid] = { name: it.name, icon: it.icon || '💊', dates: [] };
        medOrderDates[it.mid].dates.push(new Date(o.createdAt));
      });
    });
    const refillSuggestions = [];
    Object.entries(medOrderDates).forEach(([mid, data]) => {
      if (data.dates.length < 2) return;
      const sorted = data.dates.sort((a,b) => a-b);
      const avgGap = (sorted[sorted.length-1] - sorted[0]) / ((sorted.length - 1) * 86400000); // avg days between orders
      if (avgGap < 5) return; // skip if ordered too frequently (not a recurring med)
      const lastDate = sorted[sorted.length-1];
      const nextDate = new Date(lastDate.getTime() + avgGap * 86400000);
      const daysLeft = Math.round((nextDate - Date.now()) / 86400000);
      if (daysLeft <= 7 && daysLeft >= -3) refillSuggestions.push({ mid, ...data, daysLeft, nextDate });
    });

    const refillHtml = refillSuggestions.length > 0 ? `
    <div style="margin-bottom:var(--s-5)">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:var(--s-3)">🔮 Smart Refill Predictor</div>
      ${refillSuggestions.map(s => `
      <div style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3) var(--s-4);background:${s.daysLeft<=0?'var(--error-bg)':'rgba(59,130,246,.06)'};border:1.5px solid ${s.daysLeft<=0?'rgba(239,68,68,.3)':'var(--border)'};border-radius:var(--r-lg);margin-bottom:var(--s-2)">
        <div style="font-size:24px">${s.icon}</div>
        <div style="flex:1">
          <div style="font-size:var(--text-sm);font-weight:600">${s.name}</div>
          <div style="font-size:11px;color:${s.daysLeft<=0?'var(--error)':'var(--text-muted)'}">
            ${s.daysLeft <= 0 ? `⚠️ Overdue by ${Math.abs(s.daysLeft)} day(s)` : `🔔 Refill in ~${s.daysLeft} day(s)`}
          </div>
        </div>
        <button class="btn btn-p btn-sm" onclick="A.addCart('${s.mid}');location.hash='#/customer/cart'">Reorder →</button>
      </div>`).join('')}
    </div>` : '';

    return `<div style="padding:var(--s-4)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s-4)">
        <h3>📦 My Orders</h3>
        ${deliveredOrds.length > 0 ? `<button class="btn btn-g btn-sm" onclick="A.reorder()">🔄 Reorder Last</button>` : ''}
      </div>
      ${refillHtml}
      ${!ords.length
        ?`<div style="text-align:center;padding:var(--s-16)"><div style="font-size:48px;margin-bottom:var(--s-4)">📦</div><h3>No orders yet</h3><button class="btn btn-p" style="margin-top:var(--s-6)" onclick="location.hash='#/customer/home'">Start Shopping</button></div>`
        :ords.map(o=>`<div class="ord-c" onclick="location.hash='#/customer/tracking/${o.id}'">
          <div class="ord-top"><span class="ord-ph">${o.phName}${o.isDemo?' <span style="font-size:10px;background:rgba(124,58,237,.15);color:#A78BFA;padding:1px 6px;border-radius:4px">DEMO</span>':''}</span><span class="badge ${sc[o.status]}">${sl[o.status]}</span></div>
          <div class="ord-items">${o.items.map(i=>i.name).join(', ')}</div>
          <div class="ord-bot"><span class="ord-total">₹${o.total}</span><span class="ord-date">${new Date(o.createdAt).toLocaleDateString('en-IN')}</span></div>
          ${o.emergency?'<span class="emg" style="margin-top:var(--s-2)">🚨 Emergency</span>':''}
        </div>`).join('')}
    </div>`;
  }

  // ---- Profile ----
  cProfile() {
    const u = this.db.getOne('users','U1') || this.user;
    const ords = this.db.get('orders').filter(o=>o.uid==='U1');
    const spent = ords.reduce((s,o)=>s+o.total,0);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const coins = this.db.getLoyaltyBalance ? this.db.getLoyaltyBalance('U1') : 0;
    return `<div class="prof">
      <div class="prof-head"><div class="avatar av-xl">${u?.avatar||'RS'}</div><h2>${u?.name||this.user?.name}</h2><p>+91 ${u?.phone||this.user?.phone}</p></div>
      <div class="prof-stats">
        <div class="ps-item"><div class="ps-num">${ords.length}</div><div class="ps-lbl">Orders</div></div>
        <div class="ps-item"><div class="ps-num">₹${spent}</div><div class="ps-lbl">Spent</div></div>
        <div class="ps-item" onclick="location.hash='#/customer/loyalty'" style="cursor:pointer" title="View DORM Coins">
          <div class="ps-num" style="color:#FCD34D">${coins}🪙</div>
          <div class="ps-lbl">DORM Coins</div>
        </div>
      </div>
      <div class="menu-list">
        <div class="menu-item" onclick="location.hash='#/customer/orders'"><div class="mi-icon" style="background:var(--primary-subtle);color:var(--primary)">📋</div><div class="mi-text"><h4>My Orders</h4><p>View order history</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="location.hash='#/customer/health'"><div class="mi-icon" style="background:rgba(239,68,68,.1);color:#EF4444">❤️</div><div class="mi-text"><h4>Health Profile</h4><p>Vitals & records</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="location.hash='#/customer/loyalty'"><div class="mi-icon" style="background:rgba(251,191,36,.1);color:#F59E0B">🪙</div><div class="mi-text"><h4>DORM Coins</h4><p>${this.db.getLoyaltyBalance('U1')} coins · ₹${Math.floor(this.db.getLoyaltyBalance('U1')/10)} value</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="location.hash='#/customer/reminders'"><div class="mi-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">⏰</div><div class="mi-text"><h4>Medicine Reminders</h4><p>${this.db.get('reminder_schedules').filter(r=>r.userId==='U1'&&r.enabled).length} active</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="location.hash='#/customer/prescription'"><div class="mi-icon" style="background:var(--warning-bg);color:var(--warning)">📋</div><div class="mi-text"><h4>Prescriptions</h4><p>Upload & manage</p></div><span class="mi-arrow">→</span></div>
      </div>
      <div class="menu-list">
        <div class="menu-item" onclick="A.toggleTheme()">
          <div class="mi-icon" style="background:var(--bg-surface);color:var(--text-primary)">${isDark?'🌙':'☀️'}</div>
          <div class="mi-text"><h4>Dark Mode</h4><p>${isDark?'Currently Dark':'Currently Light'}</p></div>
          <label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" ${isDark?'checked':''} onchange="A.toggleTheme()"/><div class="toggle-track"></div></label>
        </div>
        <div class="menu-item" onclick="A.toast('Notifications on','info')"><div class="mi-icon" style="background:var(--success-bg);color:var(--success)">🔔</div><div class="mi-text"><h4>Notifications</h4><p>Manage preferences</p></div><span class="mi-arrow">→</span></div>
        <div class="menu-item" onclick="A.toast('Help center coming soon','info')"><div class="mi-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">❓</div><div class="mi-text"><h4>Help & Support</h4><p>FAQs, contact us</p></div><span class="mi-arrow">→</span></div>
      </div>
      <button class="btn btn-d btn-block" style="margin-top:var(--s-4)" onclick="A.logout()">🚪 Logout</button>
      <div style="margin-top:var(--s-6);text-align:center">
        <button class="btn btn-g btn-sm" onclick="A.startDemoMode()" title="Watch a live order demo">🎬 Live Demo Mode</button>
      </div>
      <p style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:var(--s-4)">DORMEDS v3.0 · Made with ❤️ in India</p>
    </div>`;
  }

  toggleTheme() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('dmed_theme', isLight ? 'dark' : 'light');
    this.route();
  }

  reorder() {
    const last = this.db.get('orders').find(o=>o.uid==='U1'&&o.status==='delivered');
    if (!last) { this.toast('No previous order found','info'); return; }
    last.items.forEach(i=>this.addCart(i.mid));
    location.hash='#/customer/cart';
  }

  // ===== DASHBOARD SHELL =====
  viewDash(app, role, v, p) {
    const navs = {
      pharmacy: [{id:'home',icon:'📊',l:'Dashboard'},{id:'orders',icon:'📋',l:'Orders'},{id:'inventory',icon:'💊',l:'Inventory'},{id:'pricing',icon:'💰',l:'Pricing'}],
      delivery: [{id:'home',icon:'📊',l:'Dashboard'},{id:'orders',icon:'📦',l:'Deliveries'},{id:'map',icon:'🗺️',l:'Map'},{id:'earnings',icon:'💰',l:'Earnings'}],
      admin: [{id:'home',icon:'📊',l:'Dashboard'},{id:'users',icon:'👥',l:'Users'},{id:'pharmacies',icon:'🏪',l:'Pharmacy'},{id:'orders',icon:'📋',l:'Orders'},{id:'coupons',icon:'🎟️',l:'Coupons'},{id:'analytics',icon:'📈',l:'Analytics'},{id:'commission',icon:'💹',l:'Commission'}],
    };
    const rLabels = {pharmacy:'Pharmacy Panel',delivery:'Delivery App',admin:'Admin Panel'};
    const viewFns = {
      pharmacy:{home:()=>this.phDash(),orders:()=>this.phOrders(),inventory:()=>this.phInventory(),pricing:()=>this.phPricing()},
      delivery:{home:()=>this.delDash(),orders:()=>this.delOrders(),map:()=>this.delMap(),earnings:()=>this.delEarnings()},
      admin:{home:()=>this.admDash(),users:()=>this.admUsers(),pharmacies:()=>this.admPharma(),orders:()=>this.admOrders(),coupons:()=>this.admCoupons(),analytics:()=>this.admAnalytics(),commission:()=>this.admCommission()},
    };
    const content = (viewFns[role]?.[v] || viewFns[role]?.home || (()=>''))();
    const items = navs[role] || [];
    // Mobile bottom nav — show max 5 items; admin shows first 5
    const mobItems = items.slice(0, 5);
    app.innerHTML = `<div class="dash">
      <aside class="side" id="sidebar">
        <div class="side-head">
          <img src="assets/icon.png" class="side-logo-img" alt="DORMEDS" onerror="this.outerHTML='<span style=&quot;font-size:24px&quot;>💊</span>'"/>
          <span class="side-brand">DORMEDS</span>
        </div>
        <nav class="side-nav"><div class="side-sec"><div class="side-sec-t">${rLabels[role]}</div>
          ${items.map(i=>`<div class="side-link ${v===i.id?'on':''}" onclick="location.hash='#/${role}/${i.id}'"><span class="sl-icon">${i.icon}</span>${i.l}</div>`).join('')}
        </div></nav>
        <div class="side-foot">
          <div style="padding:var(--s-2) var(--s-3);font-size:11px;color:var(--text-muted);margin-bottom:var(--s-2)">Logged in as <strong>${this.user?.name||'?'}</strong></div>
          <div class="side-link" onclick="A.logout()" style="color:var(--error)"><span class="sl-icon">🚪</span>Logout</div>
        </div>
      </aside>
      <div class="side-ov" id="sideOv" onclick="document.getElementById('sidebar').classList.remove('open');this.classList.remove('vis')"></div>
      <main class="main">
        <header class="main-head">
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <button class="btn btn-g btn-icon" style="display:none" onclick="document.getElementById('sidebar').classList.add('open');document.getElementById('sideOv').classList.add('vis')" id="menuBtn">☰</button>
            <h1>${items.find(i=>i.id===v)?.l || rLabels[role]}</h1>
          </div>
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <button class="hdr-btn" onclick="A.toast('Notifications','info')">🔔</button>
            <div class="avatar">${this.user?.avatar||'?'}</div>
          </div>
        </header>
        <div class="main-body page">${content}</div>
      </main>
      <!-- Mobile Bottom Nav for Dashboards -->
      <nav class="dash-mob-nav">
        ${mobItems.map(i=>`<div class="n-item ${v===i.id?'on':''}" onclick="location.hash='#/${role}/${i.id}'" title="${i.l}"><span class="n-icon">${i.icon}</span>${i.l}</div>`).join('')}
        <div class="n-item" onclick="A.logout()" style="color:var(--error)" title="Logout"><span class="n-icon">🚪</span>Exit</div>
      </nav>
    </div>`;
  }

  // ===== PHARMACY =====
  phDash() {
    const ords = this.db.get('orders').filter(o=>o.phId==='P1');
    const pend = ords.filter(o=>o.status==='pending').length;
    const prep = ords.filter(o=>['accepted','preparing'].includes(o.status)).length;
    const done = ords.filter(o=>o.status==='delivered').length;
    const rev  = ords.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);
    const recent = ords.slice(-5).reverse();
    // Today's summary
    const today = new Date().toDateString();
    const todayOrds = ords.filter(o => new Date(o.createdAt).toDateString() === today);
    const todayRev = todayOrds.filter(o => ['delivered','completed'].includes(o.status)).reduce((s,o)=>s+o.total,0);
    const todayPending = todayOrds.filter(o => o.status === 'pending').length;
    const todayCompleted = todayOrds.filter(o => ['delivered','completed'].includes(o.status)).length;

    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">📦</div><div class="st-val">${pend}</div><div class="st-label">Pending</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--info-bg);color:var(--info)">⚙️</div><div class="st-val">${prep}</div><div class="st-label">Preparing</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${done}</div><div class="st-label">Delivered</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">💰</div><div class="st-val">₹${rev.toLocaleString()}</div><div class="st-label">Revenue</div></div>
    </div>

    <!-- Today's Summary Panel -->
    <div class="card" style="margin-bottom:var(--s-4);background:linear-gradient(135deg,rgba(59,130,246,.06),rgba(34,197,94,.04))">
      <div class="card-head" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h3 style="font-size:var(--text-base)">📅 Today's Summary</h3>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>
        <button class="btn btn-g btn-sm" onclick="A.printDailyReport()">🖨️ Print Report</button>
      </div>
      <div class="card-body" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s-4);text-align:center">
        <div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--primary)">${todayOrds.length}</div>
          <div style="font-size:11px;color:var(--text-muted)">Orders Today</div>
        </div>
        <div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--success)">₹${todayRev.toLocaleString()}</div>
          <div style="font-size:11px;color:var(--text-muted)">Revenue Today</div>
        </div>
        <div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--warning)">${todayPending}</div>
          <div style="font-size:11px;color:var(--text-muted)">Pending Now</div>
        </div>
      </div>
    </div>

    <div class="chart"><div class="chart-head"><h3>📈 Weekly Revenue</h3></div><div class="chart-bars" style="height:200px">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{const h=[45,65,55,80,70,90,60][i];return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">₹${h*50}</span><span class="cb-lbl">${d}</span></div>`}).join('')}
    </div></div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:var(--text-base)">📋 Recent Orders</h3><button class="btn btn-g btn-sm" onclick="location.hash='#/pharmacy/orders'">View All →</button></div>
      ${recent.map(o=>`<div class="dl-item"><div class="dl-av">${o.uName?.[0]||'📦'}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:var(--text-sm)">#${o.id}</div><div style="font-size:11px;color:var(--text-secondary)">${o.uName}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:var(--text-sm)">₹${o.total}</div><span class="badge ${o.status==='delivered'?'badge-s':o.status==='pending'?'badge-w':'badge-i'}" style="font-size:10px">${o.status.replace(/_/g,' ')}</span></div></div>`).join('')}
    </div>`;
  }

  printDailyReport() {
    const today = new Date().toDateString();
    const ords = this.db.get('orders').filter(o => o.phId==='P1' && new Date(o.createdAt).toDateString()===today);
    const rev = ords.filter(o=>['delivered','completed'].includes(o.status)).reduce((s,o)=>s+o.total,0);
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Daily Report — DORMEDS</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:0 auto}h1{color:#2563EB;margin-bottom:4px}h2{font-size:14px;font-weight:400;color:#666;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#2563EB;color:#fff;padding:8px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}.total{font-size:15px;font-weight:700;margin-top:16px}.footer{margin-top:32px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:16px}</style>
    </head><body>
    <h1>💊 DORMEDS — MedPlus</h1><h2>Daily Sales Report · ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h2>
    <table><thead><tr><th>Order #</th><th>Patient</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
    ${ords.map(o=>`<tr><td>#${o.id}</td><td>${o.uName}</td><td>${o.items.map(i=>i.name).join(', ')}</td><td>₹${o.total}</td><td>${o.status}</td></tr>`).join('')}
    </tbody></table>
    <div class="total">Total Orders: ${ords.length} &nbsp;|&nbsp; Revenue: ₹${rev.toLocaleString()}</div>
    <div class="footer">Generated by DORMEDS Platform · ${new Date().toLocaleString('en-IN')}<br><button onclick="window.print()" style="margin-top:12px;padding:8px 20px;background:#2563EB;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Print</button></div>
    </body></html>`);
    win.document.close();
  }



  phOrders() {
    const ords = this.db.get('orders').filter(o=>o.phId==='P1').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-s',out_for_delivery:'badge-p',delivered:'badge-s',cancelled:'badge-e'};
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h2 style="font-size:var(--text-xl)">Order Management</h2><span style="font-size:var(--text-sm);color:var(--text-muted)">${ords.length} orders</span></div>
      ${ords.map(o=>`<div class="card" style="margin-bottom:var(--s-4)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:600">#${o.id} ${o.emergency?'<span class="emg">🚨 Emergency</span>':''}</div><div style="font-size:var(--text-sm);color:var(--text-secondary)">${o.uName} · ${new Date(o.createdAt).toLocaleString('en-IN')}</div></div>
        <span class="badge ${sc[o.status]||'badge-n'}">${o.status.replace(/_/g,' ').toUpperCase()}</span>
      </div>
      <div class="card-body">${o.items.map(it=>`<div style="display:flex;justify-content:space-between;padding:var(--s-2) 0;font-size:var(--text-sm)"><span>${it.name} ×${it.qty}</span><span style="font-weight:600">₹${it.price*it.qty}</span></div>`).join('')}
      <div style="border-top:1px solid var(--border);margin-top:var(--s-3);padding-top:var(--s-3);display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700">Total: ₹${o.total} · ${o.payMethod}</span>
      <div style="display:flex;gap:var(--s-2)">
        ${o.status==='pending'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','accepted')">✅ Accept</button><button class="btn btn-d btn-sm" onclick="A.updOrd('${o.id}','cancelled')">❌ Reject</button>`
          :o.status==='accepted'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','preparing')">⚙️ Start Preparing</button>`
          :o.status==='preparing'?`<button class="btn btn-p btn-sm" onclick="A.updOrd('${o.id}','packed')">📦 Mark Packed</button>`
          :o.status==='packed'?`<span class="badge badge-s">⏳ Waiting pickup</span>`:''}
        ${o.hasRx?`<button class="btn btn-g btn-sm" onclick="A.toast('Prescription viewer coming soon','info')">📋 View Rx</button>`:''}
      </div></div></div></div>`).join('')}`;
  }

  updOrd(oid, status) {
    const o = this.db.getOne('orders', oid);
    if (!o) { this.toast('Order not found', 'error'); return; }
    if (!this.db.canTransition(o.status, status)) { this.toast('Invalid status transition', 'error'); return; }
    this.db.update('orders', oid, { status, updatedAt: new Date().toISOString() });
    if (status === 'packed') {
      const dp = this.db.findDeliveryPartner();
      if (dp) this.db.update('orders', oid, { dId: dp.id, dName: dp.name });
    }
    if (status === 'cancelled' && o.items) {
      const meds = this.db.get('medicines');
      o.items.forEach(it => { const i = meds.findIndex(m=>m.id===it.mid); if(i!==-1){meds[i].stock+=it.qty;} });
      this.db.set('medicines', meds);
    }
    // Push notification to customer
    const notifMap = {
      accepted:   { icon:'✅', title:'Order Accepted!',        body:`Your order #${oid} has been accepted by the pharmacy.` },
      preparing:  { icon:'⚙️', title:'Being Prepared',         body:`Your order #${oid} is being prepared now.` },
      packed:     { icon:'📦', title:'Order Packed!',           body:`Your order #${oid} is packed and waiting for pickup.` },
      out_for_delivery: { icon:'🏍️', title:'Out for Delivery!', body:`Your order #${oid} is on the way!` },
      completed:  { icon:'🎉', title:'Order Delivered!',        body:`Your order #${oid} has been delivered. How was it?` },
      cancelled:  { icon:'❌', title:'Order Cancelled',         body:`Your order #${oid} was cancelled by the pharmacy.` },
    };
    if (notifMap[status] && o.uid) {
      this.db.addNotification(o.uid, { ...notifMap[status], type:'order', link:`#/customer/tracking/${oid}` });
    }
    this.toast(`Order #${oid} → ${status.replace(/_/g,' ')}`);
    this.route();
  }



  phInventory() {
    const meds = this.db.get('medicines').filter(m=>m.phId==='P1');
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)">
      <h2 style="font-size:var(--text-xl)">Inventory</h2>
      <button class="btn btn-p btn-sm" onclick="A.showAddMedicine()">+ Add Medicine</button>
    </div>
    <div id="addMedForm"></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>MRP</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${meds.map(m=>`<tr>
        <td data-label="Medicine"><div style="display:flex;align-items:center;gap:var(--s-3)"><span style="font-size:20px">${m.icon}</span><div><div style="font-weight:600">${m.name}</div><div style="font-size:11px;color:var(--text-muted)">${m.gen}</div></div></div></td>
        <td data-label="Category"><span class="badge badge-n">${m.cat}</span></td>
        <td data-label="Stock"><div style="display:flex;align-items:center;gap:var(--s-2)"><span style="width:8px;height:8px;border-radius:50%;background:${m.stock>50?'var(--success)':m.stock>10?'var(--warning)':'var(--error)'}"></span>${m.stock}</div></td>
        <td data-label="MRP">₹${m.mrp}</td>
        <td data-label="Price" style="color:var(--primary);font-weight:600">₹${m.price}</td>
        <td data-label="Status"><span class="badge ${m.stock>0?'badge-s':'badge-e'}">${m.stock>0?'In Stock':'Out'}</span></td>
        <td data-label="Action"><button class="btn btn-g btn-sm" onclick="A.updStock('${m.id}')">📦 Restock</button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  showAddMedicine() {
    const cats = this.db.get('categories').map(c=>c.name);
    const form = document.getElementById('addMedForm');
    if (!form) return;
    form.innerHTML = `<div class="card" style="margin-bottom:var(--s-6);padding:var(--s-5)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h3>+ Add New Medicine</h3><button class="btn btn-g btn-sm" onclick="document.getElementById('addMedForm').innerHTML=''">✕ Close</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--s-4)">
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">MEDICINE NAME</label><input class="inp" id="am_name" placeholder="e.g. Dolo 650"/></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">GENERIC NAME</label><input class="inp" id="am_gen" placeholder="e.g. Paracetamol 650mg"/></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">CATEGORY</label><select class="inp" id="am_cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">MANUFACTURER</label><input class="inp" id="am_mfr" placeholder="e.g. Micro Labs"/></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">MRP (₹)</label><input class="inp" type="number" id="am_mrp" placeholder="35"/></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">SELLING PRICE (₹)</label><input class="inp" type="number" id="am_price" placeholder="28"/></div>
        <div><label style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:4px;display:block">STOCK (units)</label><input class="inp" type="number" id="am_stock" placeholder="100"/></div>
        <div style="display:flex;align-items:flex-end;gap:var(--s-3)">
          <label style="display:flex;align-items:center;gap:var(--s-2);cursor:pointer;font-size:var(--text-sm)"><input type="checkbox" id="am_rx" style="width:18px;height:18px"/> Prescription Required</label>
        </div>
      </div>
      <button class="btn btn-p" style="margin-top:var(--s-4)" onclick="A.saveMedicine()">💊 Save Medicine</button>
    </div>`;
  }

  saveMedicine() {
    const name  = document.getElementById('am_name')?.value?.trim();
    const gen   = document.getElementById('am_gen')?.value?.trim();
    const cat   = document.getElementById('am_cat')?.value;
    const mfr   = document.getElementById('am_mfr')?.value?.trim();
    const mrp   = parseFloat(document.getElementById('am_mrp')?.value)||0;
    const price = parseFloat(document.getElementById('am_price')?.value)||0;
    const stock = parseInt(document.getElementById('am_stock')?.value)||0;
    const rx    = document.getElementById('am_rx')?.checked||false;
    if (!name||!gen||!mfr||mrp<=0) { this.toast('Fill all required fields','error'); return; }
    const catIcons = {'Pain Relief':'💊','Diabetes':'🩸','Vitamins':'💪','Allergy':'🤧','Skin Care':'🧴','First Aid':'🩹'};
    const m = {
      id: this.db.genId('M'), name, gen, cat, mfr, mrp, price,
      off: mrp>price?Math.round((mrp-price)/mrp*100):0,
      stock, rat:4.0, rev:0, phId:'P1', rx, icon:catIcons[cat]||'💊',
      desc:`${name} — ${gen}`, dose:'As directed', side:'Consult doctor', salt:gen.toLowerCase().split(' ')[0]
    };
    this.db.add('medicines', m);
    this.toast(`${name} added to inventory!`);
    this.route();
  }

  updStock(mid) {
    const m = this.db.getOne('medicines', mid);
    if (!m) return;
    const qty = parseInt(prompt(`Add stock for ${m.name} (current: ${m.stock}):`) || '0');
    if (isNaN(qty) || qty <= 0) return;
    this.db.update('medicines', mid, { stock: m.stock + qty });
    this.toast(`${m.name}: +${qty} units added`);
    this.route();
  }

  phPricing() {
    const meds = this.db.get('medicines').filter(m=>m.phId==='P1');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💰 Pricing Management</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Medicine</th><th>MRP</th><th>Selling Price</th><th>Discount</th><th>Margin</th><th>Rx</th></tr></thead><tbody>
      ${meds.map(m=>`<tr>
        <td data-label="Medicine" style="font-weight:600">${m.icon} ${m.name}<div style="font-size:11px;color:var(--text-muted)">${m.gen}</div></td>
        <td data-label="MRP">₹${m.mrp}</td>
        <td data-label="Selling" style="color:var(--primary);font-weight:700">₹${m.price}</td>
        <td data-label="Discount"><span class="badge badge-s">${m.off}%</span></td>
        <td data-label="Margin" style="color:var(--success);font-weight:600">₹${m.mrp-m.price}</td>
        <td data-label="Rx">${m.rx?'<span class="badge badge-w">Rx</span>':'<span class="badge badge-n">OTC</span>'}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  // ===== DELIVERY =====
  delDash() {
    const dp = this.db.getOne('deliveryPartners','D1');
    const ords = this.db.get('orders').filter(o=>o.dId==='D1');
    const active = ords.filter(o=>['packed','out_for_delivery'].includes(o.status));
    const done = ords.filter(o=>o.status==='delivered').length;
    return `<div class="earn-card"><div class="earn-period">Today's Earnings</div><div class="earn-amt">₹${Math.round((dp?.earnings||0)/30)}</div><div class="earn-sub">${done} deliveries completed</div></div>
    <div class="stats-g" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${active.length}</div><div class="st-label">Active</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${done}</div><div class="st-label">Done</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">⭐</div><div class="st-val">${dp?.rating||0}</div><div class="st-label">Rating</div></div>
    </div>
    ${active.length?`<h3 style="margin-bottom:var(--s-4)">🏍️ Active Deliveries</h3>${active.map(o=>this.delCard(o)).join('')}`:`<div style="text-align:center;padding:var(--s-10)"><div style="font-size:48px;margin-bottom:var(--s-4)">🏍️</div><h3>No active deliveries</h3><p style="color:var(--text-secondary);margin-top:var(--s-2)">Waiting for assignments</p></div>`}`;
  }

  delCard(o) {
    // Determine action based on status
    // packed → show checklist before out_for_delivery
    // out_for_delivery → show OTP before pending_physical_verification
    // pending_physical_verification → admin marks physical verification
    const isPacked = o.status === 'packed';
    const isOfd = o.status === 'out_for_delivery';
    const isPPV = o.status === 'pending_physical_verification';

    return `<div class="del-card"><div class="del-head"><div><div style="font-weight:600">#${o.id}</div><div style="font-size:11px;color:var(--text-secondary)">${o.uName}</div></div>${o.emergency?'<span class="emg">🚨 Emergency</span>':''}<span class="badge badge-p">${o.status.replace(/_/g,' ')}</span></div>
    <div class="del-body"><div class="del-loc"><div class="del-dots"><div class="del-dot"></div><div class="del-line"></div><div class="del-dot fill"></div></div><div style="flex:1"><div style="margin-bottom:var(--s-3)"><div class="del-lbl">Pickup</div><div class="del-addr">${o.phName}</div></div><div><div class="del-lbl">Delivery</div><div class="del-addr">${o.address}</div></div></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--s-3)"><span style="font-weight:700">₹${o.total} · ${o.payMethod}</span><span style="font-size:var(--text-sm);color:var(--text-secondary)">${o.items.length} items</span></div></div>
    <div class="del-acts">
      ${isPacked ? `<button class="btn btn-p btn-sm" style="flex:1" onclick="A.showDeliveryChecklist('${o.id}')">📋 Pre-Pickup Checklist</button>` : ''}
      ${isOfd ? `<button class="btn btn-p btn-sm" style="flex:1" onclick="A.showOtpVerify('${o.id}')">🔢 Verify OTP & Handover</button>` : ''}
      ${isPPV ? `<div style="flex:1;text-align:center"><span class="badge badge-w">⏳ Awaiting Physical Verification</span><div style="font-size:11px;color:var(--text-muted);margin-top:4px">Pharmacy/Admin confirms Rx</div></div>` : ''}
      ${(!isPacked && !isOfd && !isPPV) ? '' : ''}
      <button class="btn btn-g btn-sm" onclick="A.toast('Calling customer...','info')">📞</button>
    </div></div>`;
  }

  // ---- Delivery Checklist Modal ----
  showDeliveryChecklist(oid) {
    const o = this.db.getOne('orders', oid);
    if (!o) return;
    // Check if checklist already done
    const existing = this.db.get('delivery_checklists').find(c => c.orderId === oid);
    if (existing) {
      // Already completed — go directly to out_for_delivery
      this._completeChecklist(oid, existing);
      return;
    }

    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="">
    <div class="checklist-modal">
      <div class="checklist-header">
        <h3>📋 Pre-Pickup Checklist</h3>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="checklist-body">
        <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--s-5)">
          Complete ALL items before picking up Order #${oid}
        </p>

        <div class="checklist-item" id="cli-picked" onclick="A.toggleChecklistItem('picked')">
          <input type="checkbox" id="chk-picked" onclick="event.stopPropagation();A.toggleChecklistItem('picked')"/>
          <div><div class="ci-label">✅ Medicines picked from pharmacy</div><div class="ci-desc">Verify all ${o.items.length} item(s) are packed</div></div>
          <span class="checklist-req-badge">Required</span>
        </div>
        <div class="checklist-item" id="cli-sealed" onclick="A.toggleChecklistItem('sealed')">
          <input type="checkbox" id="chk-sealed" onclick="event.stopPropagation();A.toggleChecklistItem('sealed')"/>
          <div><div class="ci-label">📦 Package sealed & tamper-proof</div><div class="ci-desc">Ensure packaging is sealed correctly</div></div>
          <span class="checklist-req-badge">Required</span>
        </div>
        <div class="checklist-item" id="cli-address" onclick="A.toggleChecklistItem('address')">
          <input type="checkbox" id="chk-address" onclick="event.stopPropagation();A.toggleChecklistItem('address')"/>
          <div><div class="ci-label">📍 Delivery address confirmed</div><div class="ci-desc">${o.address}</div></div>
          <span class="checklist-req-badge">Required</span>
        </div>

        <div class="counselling-toggle-row">
          <div class="ct-label">🩺 Does patient need counselling?</div>
          <div class="yn-toggle">
            <button class="yn-btn yes" id="yn-yes" onclick="A.setCounselling(true)">YES</button>
            <button class="yn-btn no active" id="yn-no" onclick="A.setCounselling(false)">NO</button>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">If YES, a counselling request will be auto-created for this patient.</div>
        </div>
      </div>
      <div class="checklist-footer">
        <button class="btn btn-p btn-block" onclick="A.submitChecklist('${oid}')">
          🚀 Start Delivery
        </button>
      </div>
    </div></div>`;
    this._checklistState = { picked: false, sealed: false, address: false, counselling: false };
  }

  toggleChecklistItem(key) {
    if (!this._checklistState) this._checklistState = {};
    this._checklistState[key] = !this._checklistState[key];
    const chk = document.getElementById('chk-' + key);
    const row = document.getElementById('cli-' + key);
    if (chk) chk.checked = this._checklistState[key];
    if (row) row.classList.toggle('checked', this._checklistState[key]);
  }

  setCounselling(val) {
    if (!this._checklistState) this._checklistState = {};
    this._checklistState.counselling = val;
    document.getElementById('yn-yes')?.classList.toggle('active', val);
    document.getElementById('yn-no')?.classList.toggle('active', !val);
  }

  submitChecklist(oid) {
    const s = this._checklistState || {};
    if (!s.picked || !s.sealed || !s.address) {
      this.toast('⚠️ Complete ALL required checklist items before proceeding', 'error');
      return;
    }
    // Save checklist
    const checklist = {
      id: 'DC' + Date.now(), orderId: oid, deliveryPartnerId: 'D1',
      pickedConfirmed: s.picked, sealedConfirmed: s.sealed, addressConfirmed: s.address,
      counsellingRequired: !!s.counselling, completedAt: new Date().toISOString()
    };
    this.db.add('delivery_checklists', checklist);

    // If counselling YES → auto-create counselling request
    if (s.counselling) {
      const o = this.db.getOne('orders', oid);
      if (o) {
        this.db.add('counselling_requests', {
          id: 'CR' + Date.now(), orderId: oid,
          patientId: o.uid, patientName: o.uName,
          status: 'counselling_pending', notes: '',
          counsellorId: null, counsellorName: null,
          createdAt: new Date().toISOString(), completedAt: null
        });
        this.toast('🩺 Counselling request auto-created for ' + o.uName);
      }
    }

    document.getElementById('modal-root').innerHTML = '';
    this._completeChecklist(oid, checklist);
  }

  _completeChecklist(oid, checklist) {
    this.db.update('orders', oid, { status:'out_for_delivery', updatedAt:new Date().toISOString() });
    this.toast('✅ Delivery started! Order #' + oid + ' is Out for Delivery');
    this.route();
  }

  // ---- OTP Verification Modal ----
  showOtpVerify(oid) {
    const o = this.db.getOne('orders', oid);
    if (!o) return;
    // Generate OTP if not exists
    let otp = o.deliveryOtp;
    if (!otp) {
      otp = this.db.generateOtp();
      this.db.update('orders', oid, { deliveryOtp: otp });
    }

    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="">
    <div class="otp-verify-modal">
      <div class="ovh">
        <h3>🔢 Verify Delivery OTP</h3>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="ovb">
        <div class="otp-order-info">
          <strong>Order #${oid}</strong> · ${o.uName}<br/>
          <span style="font-size:11px">${o.address}</span>
        </div>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--s-2)">Ask customer for the 4-digit OTP</p>
        <input class="otp-input-lg" type="text" id="del-otp-inp" maxlength="4" placeholder="_ _ _ _"
          onkeydown="if(event.key==='Enter')A.confirmDeliveryOtp('${oid}')"/>
        <div class="otp-hint">Demo OTP: <strong>${otp}</strong> (shared with customer)</div>
        <button class="btn btn-p btn-block btn-lg" style="margin-top:var(--s-5)" onclick="A.confirmDeliveryOtp('${oid}')">
          ✅ Confirm Handover
        </button>
      </div>
    </div></div>`;
    setTimeout(() => document.getElementById('del-otp-inp')?.focus(), 200);
  }

  confirmDeliveryOtp(oid) {
    const entered = document.getElementById('del-otp-inp')?.value?.trim();
    const o = this.db.getOne('orders', oid);
    if (!o) return;
    if (!entered || entered.length < 4) { this.toast('Enter 4-digit OTP', 'warning'); return; }
    if (entered !== o.deliveryOtp) { this.toast('❌ Wrong OTP. Please check with customer.', 'error'); return; }
    // OTP verified → move to pending_physical_verification
    this.db.update('orders', oid, { otpVerified: true, status: 'pending_physical_verification', updatedAt: new Date().toISOString() });
    document.getElementById('modal-root').innerHTML = '';
    this.toast('✅ OTP Verified! Order pending physical prescription verification.');
    this.route();
  }

  delOrders() {
    const ords = this.db.get('orders').filter(o=>o.dId==='D1').reverse();
    const ready = this.db.get('orders').filter(o=>o.status==='packed'&&!o.dId);
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📦 Deliveries</h2>
    ${ready.length?`<div class="sec-h"><h3>🆕 Available Pickups (${ready.length})</h3></div>${ready.map(o=>`<div class="del-card"><div class="del-head"><div><strong>#${o.id}</strong></div><span class="badge badge-w">New ${o.emergency?'🚨':''}</span></div><div class="del-body"><p style="font-size:var(--text-sm)">From: <strong>${o.phName}</strong></p><p style="font-size:var(--text-sm);color:var(--text-secondary)">To: ${o.address}</p><p style="margin-top:var(--s-2);font-weight:700">₹${o.total} · ${o.items.length} items</p></div><div class="del-acts"><button class="btn btn-p btn-sm" style="flex:1" onclick="A.acceptDel('${o.id}')">Accept 🏍️</button></div></div>`).join('')}`:''}
    <div class="sec-h" style="margin-top:var(--s-4)"><h3>All My Deliveries</h3></div>
    ${ords.length?ords.map(o=>this.delCard(o)).join(''):'<div style="text-align:center;padding:var(--s-10);color:var(--text-secondary)">No deliveries yet</div>'}`;
  }

  acceptDel(oid) {
    this.db.update('orders', oid, { dId:'D1', dName:'Ravi Kumar', status:'packed', updatedAt:new Date().toISOString() });
    this.toast('Delivery accepted! Complete checklist to start delivery.');
    this.route();
  }

  delMap() {
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">🗺️ Navigation</h2>
    <div style="height:400px;background:var(--bg-surface);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:var(--s-4);margin-bottom:var(--s-4);border:1px solid var(--border)">
      <div style="font-size:48px">🗺️</div><h3>Live Map</h3>
      <p style="color:var(--text-secondary);font-size:var(--text-sm)">Google Maps / Leaflet.js integration ready</p>
      <button class="btn btn-p btn-sm" onclick="A.toast('Map integration ready for Google Maps API','info')">🔌 Connect Maps API</button>
    </div>
    <div class="card"><div class="card-body"><h4 style="margin-bottom:var(--s-3)">📍 Features Ready</h4><div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:2">• Real-time GPS tracking<br>• Optimal route planning<br>• Turn-by-turn navigation<br>• Traffic-aware ETA<br>• Pharmacy & customer pins</div></div></div>`;
  }

  delEarnings() {
    const dp = this.db.getOne('deliveryPartners','D1');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💰 Earnings</h2>
    <div class="earn-card"><div class="earn-period">Total Earnings</div><div class="earn-amt">₹${dp?.earnings?.toLocaleString()||0}</div><div class="earn-sub">${dp?.deliveries||0} total deliveries · ⭐ ${dp?.rating||0}</div></div>
    <div class="earn-grid">
      <div class="eg-item"><div class="eg-val">₹${Math.round((dp?.earnings||0)/30)}</div><div class="eg-lbl">Today</div></div>
      <div class="eg-item"><div class="eg-val">₹${Math.round((dp?.earnings||0)/4)}</div><div class="eg-lbl">This Week</div></div>
      <div class="eg-item"><div class="eg-val">₹${dp?.earnings?.toLocaleString()||0}</div><div class="eg-lbl">All Time</div></div>
    </div>
    <div class="chart"><div class="chart-head"><h3>📈 Weekly Trend</h3></div><div class="chart-bars" style="height:180px">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{const h=[35,55,45,70,60,85,50][i];return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">₹${h*20}</span><span class="cb-lbl">${d}</span></div>`}).join('')}</div></div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-body"><h4 style="margin-bottom:var(--s-3)">💡 Incentives</h4>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)"><span>Peak hour (12–2 PM)</span><span class="badge badge-s">+₹15/del</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)"><span>Rain bonus</span><span class="badge badge-i">+₹20/del</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:var(--text-sm)"><span>10+ deliveries/day</span><span class="badge badge-w">+₹100 bonus</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:var(--text-sm)"><span>Emergency orders</span><span class="badge badge-e">+₹30/del</span></div>
    </div></div>`;
  }

  // ===== ADMIN =====
  admDash() {
    const an = this.db.getObj('analytics');
    const ords = this.db.get('orders');
    const recent = ords.slice(-5).reverse();
    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${an.totalOrders?.toLocaleString()}</div><div class="st-label">Total Orders</div><span class="st-delta st-up">↑ 12.5%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="st-val">₹${(an.totalRevenue/1e5).toFixed(1)}L</div><div class="st-label">Revenue</div><span class="st-delta st-up">↑ 8.3%</span></div>
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${an.totalUsers?.toLocaleString()}</div><div class="st-label">Users</div><span class="st-delta st-up">↑ 15.2%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">🏪</div><div class="st-val">${an.totalPharmacies}</div><div class="st-label">Pharmacies</div></div>
    </div>
    <div class="dash-grid-2" style="margin-bottom:var(--s-6)">
      <div class="chart"><div class="chart-head"><h3>📈 Monthly Orders</h3></div><div class="chart-bars">${['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const max=Math.max(...(an.monthly||[1]));const h=an.monthly?(an.monthly[i]/max)*100:50;return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">${an.monthly?.[i]||0}</span><span class="cb-lbl">${m}</span></div>`}).join('')}</div></div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">📊 Orders by Status</h3></div><div class="card-body">${Object.entries(an.byStatus||{}).map(([s,c])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:var(--text-sm)"><span style="text-transform:capitalize">${s.replace(/_/g,' ')}</span><span style="font-weight:600">${c}</span></div>`).join('')}</div></div>
    </div>
    <div class="card"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:var(--text-base)">📋 Recent Orders</h3><button class="btn btn-g btn-sm" onclick="location.hash='#/admin/orders'">View All →</button></div>
      ${recent.map(o=>`<div class="dl-item"><div class="dl-av">${o.uName?.[0]||'?'}</div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:var(--text-sm)">#${o.id} · ${o.uName}</div><div style="font-size:11px;color:var(--text-secondary)">${o.phName}</div></div><div style="text-align:right"><div style="font-weight:700">₹${o.total}</div><div style="font-size:11px;color:var(--text-muted)">${o.status.replace(/_/g,' ')}</div></div></div>`).join('')}
    </div>`;
  }

  admUsers() {
    const users = this.db.get('users');
    const dps   = this.db.get('deliveryPartners');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">👥 Users & Delivery Partners</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
      ${users.map(u=>`<tr>
        <td data-label="User" style="display:flex;align-items:center;gap:var(--s-3)"><div class="avatar av-sm">${u.avatar}</div><div><div style="font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--text-muted)">${u.email}</div></div></td>
        <td data-label="Phone">+91 ${u.phone}</td>
        <td data-label="Role"><span class="badge badge-p">${u.role}</span></td>
        <td data-label="Joined" style="font-size:var(--text-sm)">${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
        <td data-label="Action"><button class="btn btn-g btn-sm" onclick="A.toast('User detail','info')">👁️ View</button></td>
      </tr>`).join('')}
      ${dps.map(d=>`<tr>
        <td data-label="User" style="display:flex;align-items:center;gap:var(--s-3)"><div class="avatar av-sm">${d.avatar}</div><div><div style="font-weight:600">${d.name}</div><div style="font-size:11px;color:var(--text-muted)">${d.vehicle} · ${d.plate}</div></div></td>
        <td data-label="Phone">+91 ${d.phone}</td>
        <td data-label="Role"><span class="badge badge-i">delivery</span></td>
        <td data-label="Joined" style="font-size:var(--text-sm)">${d.createdAt}</td>
        <td data-label="Status"><span class="badge ${d.status==='available'?'badge-s':d.status==='offline'?'badge-e':'badge-w'}">${d.status}</span></td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  admPharma() {
    const phs = this.db.get('pharmacies');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">🏪 Pharmacy Management</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pharmacy</th><th>Owner</th><th>Status</th><th>Commission</th><th>Rating</th><th>Orders</th><th>Action</th></tr></thead><tbody>
      ${phs.map(p=>`<tr>
        <td data-label="Pharmacy"><div style="font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${p.loc.address}</div></td>
        <td data-label="Owner">${p.owner}</td>
        <td data-label="Status"><span class="badge ${p.status==='approved'?'badge-s':'badge-w'}">${p.status}</span></td>
        <td data-label="Commission">${p.commission}%</td>
        <td data-label="Rating">⭐ ${p.rating||'-'}</td>
        <td data-label="Orders">${p.orders}</td>
        <td data-label="Action">${p.status==='pending'?`<button class="btn btn-p btn-sm" onclick="A.approvePh('${p.id}')">✅ Approve</button>`:`<button class="btn btn-g btn-sm" onclick="A.toast('Edit coming soon','info')">✏️ Edit</button>`}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  approvePh(id) { this.db.update('pharmacies',id,{status:'approved',active:true}); this.toast('Pharmacy approved!'); this.route(); }

  admOrders() {
    const ords = this.db.get('orders').reverse();
    const sc = {pending:'badge-w',accepted:'badge-i',preparing:'badge-i',packed:'badge-p',out_for_delivery:'badge-p',delivered:'badge-s',cancelled:'badge-e'};
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📋 All Orders</h2>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Customer</th><th>Pharmacy</th><th>Amount</th><th>Status</th><th>Payment</th><th>Date</th></tr></thead><tbody>
      ${ords.map(o=>`<tr>
        <td data-label="ID" style="font-weight:600">#${o.id}${o.emergency?'<span class="emg" style="margin-left:4px">🚨</span>':''}</td>
        <td data-label="Customer">${o.uName}</td>
        <td data-label="Pharmacy">${o.phName}</td>
        <td data-label="Amount" style="font-weight:700">₹${o.total}</td>
        <td data-label="Status"><span class="badge ${sc[o.status]||'badge-n'}">${o.status.replace(/_/g,' ')}</span></td>
        <td data-label="Payment">${o.payMethod} · <span style="color:${o.payStatus==='paid'?'var(--success)':'var(--warning)'}">${o.payStatus}</span></td>
        <td data-label="Date" style="font-size:var(--text-sm)">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  }

  admCoupons() {
    const cpns = this.db.get('coupons');
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><h2 style="font-size:var(--text-xl)">🎟️ Coupons</h2><button class="btn btn-p btn-sm" onclick="A.toast('Create coupon coming soon','info')">+ Create</button></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--s-4)">
      ${cpns.map(c=>`<div class="cpn"><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--s-2)"><span class="cpn-code">${c.code}</span><span class="badge ${c.active?'badge-s':'badge-e'}">${c.active?'Active':'Off'}</span></div><div class="cpn-desc">${c.desc}</div><div class="cpn-meta"><span>👥 ${c.used}</span><span>🔄 ${c.limit}/user</span><span>📅 ${c.exp}</span></div>
      <div style="display:flex;gap:var(--s-2);margin-top:var(--s-3)"><button class="btn btn-g btn-sm" onclick="A.toast('Edit','info')">✏️ Edit</button><button class="btn btn-g btn-sm" style="color:var(--error)" onclick="A.toggleCpn('${c.id}')">${c.active?'⏸ Disable':'▶ Enable'}</button></div></div>`).join('')}
    </div>`;
  }

  toggleCpn(id) { const c = this.db.getOne('coupons',id); if(c){this.db.update('coupons',id,{active:!c.active});this.toast(`Coupon ${c.active?'disabled':'enabled'}`);this.route();} }

  admAnalytics() {
    const an = this.db.getObj('analytics');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📈 Analytics</h2>
    <div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${an.totalOrders?.toLocaleString()}</div><div class="st-label">Orders</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="st-val">₹${(an.totalRevenue/1e5).toFixed(1)}L</div><div class="st-label">Revenue</div></div>
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${an.totalUsers?.toLocaleString()}</div><div class="st-label">Users</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--info-bg);color:var(--info)">🏍️</div><div class="st-val">${an.totalDel}</div><div class="st-label">Partners</div></div>
    </div>
    <div class="dash-grid-2" style="margin-bottom:var(--s-6)">
      <div class="chart"><div class="chart-head"><h3>📊 Monthly Revenue</h3></div><div class="chart-bars">${['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const max=Math.max(...(an.monthRev||[1]));const h=an.monthRev?(an.monthRev[i]/max)*100:50;return`<div class="chart-bar" style="height:${h}%;background:linear-gradient(180deg,#8B5CF6,#5B21B6)"><span class="cb-val">₹${((an.monthRev?.[i]||0)/1e3).toFixed(0)}K</span><span class="cb-lbl">${m}</span></div>`}).join('')}</div></div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">🔥 Top Medicines</h3></div><div class="card-body">${(an.topMedicines||an.topMeds||[]).map((m,i)=>`<div style="display:flex;align-items:center;gap:var(--s-3);padding:10px 0;border-bottom:1px solid var(--border)"><div class="avatar av-sm" style="background:${['var(--primary)','#8B5CF6','var(--warning)','var(--success)','#EC4899'][i]}">${i+1}</div><span style="font-size:var(--text-sm);font-weight:500">${m}</span></div>`).join('')}</div></div>
    </div>
    <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">🛡️ Fraud Monitoring</h3></div><div class="card-body" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s-3)">
      <div class="stat" style="text-align:center"><div class="st-val" style="color:var(--success)">0</div><div class="st-label">Fraud Alerts</div></div>
      <div class="stat" style="text-align:center"><div class="st-val" style="color:var(--warning)">2</div><div class="st-label">Suspicious</div></div>
      <div class="stat" style="text-align:center"><div class="st-val" style="color:var(--error)">0</div><div class="st-label">Blocked</div></div>
    </div></div>`;
  }

  admCommission() {
    const phs = this.db.get('pharmacies');
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💹 Commission Management</h2>
    <div class="card" style="margin-bottom:var(--s-6)"><div class="card-body">
      <h4 style="margin-bottom:var(--s-3)">Global Commission Rate</h4>
      <div style="display:flex;align-items:center;gap:var(--s-4);flex-wrap:wrap">
        <input class="inp" type="number" id="globalComm" value="12" min="0" max="50" style="max-width:120px"/> <span style="color:var(--text-secondary)">%</span>
        <button class="btn btn-p btn-sm" onclick="A.setGlobalComm()">Apply to All Pharmacies</button>
      </div>
    </div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pharmacy</th><th>Rate</th><th>Revenue</th><th>Commission</th><th>New Rate</th><th>Action</th></tr></thead><tbody>
      ${phs.map(p=>{const rev=this.db.get('orders').filter(o=>o.phId===p.id&&o.status==='delivered').reduce((s,o)=>s+o.total,0);const comm=Math.round(rev*p.commission/100);
      return`<tr>
        <td data-label="Pharmacy"><div style="font-weight:600">${p.name}</div><span class="badge ${p.status==='approved'?'badge-s':'badge-w'}">${p.status}</span></td>
        <td data-label="Rate" style="font-weight:600">${p.commission}%</td>
        <td data-label="Revenue">₹${rev.toLocaleString()}</td>
        <td data-label="Commission" style="color:var(--primary);font-weight:700">₹${comm.toLocaleString()}</td>
        <td data-label="New Rate"><input type="number" class="inp" id="comm_${p.id}" value="${p.commission}" min="0" max="50" style="width:80px;min-height:36px;padding:6px 10px"/></td>
        <td data-label="Action"><button class="btn btn-p btn-sm" onclick="A.updateComm('${p.id}')">Update</button></td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
  }

  setGlobalComm() {
    const val = parseFloat(document.getElementById('globalComm')?.value);
    if (isNaN(val)||val<0||val>50) { this.toast('Enter valid % (0-50)','error'); return; }
    const phs = this.db.get('pharmacies');
    phs.forEach(p => this.db.update('pharmacies',p.id,{commission:val}));
    this.toast(`Global commission set to ${val}%`);
    this.route();
  }

  updateComm(id) {
    const val = parseFloat(document.getElementById('comm_'+id)?.value);
    if (isNaN(val)||val<0||val>50) { this.toast('Enter valid % (0-50)','error'); return; }
    this.db.update('pharmacies',id,{commission:val});
    this.toast('Commission updated!');
    this.route();
  }

  // ---- Exercise Library wrapper (for customer #/customer/exercises route) ----
  _wrapExerciseLib() {
    this._exerciseFilters = this._exerciseFilters || {};
    const exercises = this.db.get('exercise_library');
    const painTypes  = [...new Set(exercises.map(e => e.painType))];
    const bodyParts  = [...new Set(exercises.map(e => e.bodyPart))];
    return `<div id="exercise-lib-root">${this._renderExerciseLibrary(exercises, painTypes, bodyParts, this._exerciseFilters, 'customer')}</div>`;
  }

  // ---- Unified order status badge helper (new statuses included) ----
  ordStatus(status) {
    const map = {
      pending:        { cls:'badge-w',  lbl:'Pending' },
      accepted:       { cls:'badge-i',  lbl:'Accepted' },
      preparing:      { cls:'badge-i',  lbl:'Preparing' },
      packed:         { cls:'badge-p',  lbl:'Packed' },
      out_for_delivery: { cls:'badge-p', lbl:'Out for Delivery' },
      pending_physical_verification: { cls:'badge-w', lbl:'Verification Pending' },
      completed:      { cls:'badge-s',  lbl:'Completed' },
      delivered:      { cls:'badge-s',  lbl:'Delivered' },
      delivery_failed:{ cls:'badge-e',  lbl:'Failed' },
      cancelled:      { cls:'badge-e',  lbl:'Cancelled' },
    };
    const s = map[status] || { cls:'badge-n', lbl: status?.replace(/_/g,' ') || 'Unknown' };
    return `<span class="badge ${s.cls}">${s.lbl}</span>`;
  }
}


// ---- Boot: initialized in index.html after all modules load ----
// Apply saved theme immediately
(function() {
  const savedTheme = localStorage.getItem('dmed_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();
// Close search dropdown on outside click
document.addEventListener('click', e => {
  const d = document.getElementById('searchDrop');
  if (d && !e.target.closest('.search')) d.style.display = 'none';
});
