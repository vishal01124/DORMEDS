// =====================================================================
// DORMEDS 3.0 — Super Admin Panel (Completely Separate & Secure)
// Route: #/super-admin
// Only role=super_admin can access
// =====================================================================

Object.assign(DormedsApp.prototype, {

  // =====================================================
  // SUPER ADMIN BOOT — called from router
  // =====================================================
  routeSuperAdmin(app, view) {
    const session = this._getSaSession();
    if (!session) {
      this.viewSuperAdminLogin(app);
      return;
    }
    this.viewSuperAdminPanel(app, view || 'dashboard');
  },

  _getSaSession() {
    try { return JSON.parse(localStorage.getItem('dmed_sa_session') || 'null'); } catch { return null; }
  },

  _setSaSession(user) {
    localStorage.setItem('dmed_sa_session', JSON.stringify({ ...user, loginAt: new Date().toISOString() }));
  },

  _clearSaSession() {
    localStorage.removeItem('dmed_sa_session');
  },

  // =====================================================
  // SUPER ADMIN LOGIN
  // =====================================================
  viewSuperAdminLogin(app) {
    app.innerHTML = `
    <div class="sa-root">
      <div class="sa-login">
        <div class="sa-login-card anim-up">
          <div class="sa-logo">🛡️</div>
          <div class="sa-brand">DORMEDS</div>
          <div class="sa-subtitle">Super Admin Portal</div>

          <div id="sa-login-error" style="display:none;padding:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;color:var(--error);font-size:var(--text-sm);margin-bottom:16px;text-align:left"></div>

          <div class="sa-inp-wrap">
            <span class="sa-inp-icon">👤</span>
            <input class="sa-inp" type="text" id="sa_user" placeholder="Username" autocomplete="username"
              onkeydown="if(event.key==='Enter')document.getElementById('sa_pass').focus()"/>
          </div>
          <div class="sa-inp-wrap">
            <span class="sa-inp-icon">🔒</span>
            <input class="sa-inp" type="password" id="sa_pass" placeholder="Password" autocomplete="current-password"
              onkeydown="if(event.key==='Enter')A.saLogin()"/>
          </div>

          <button class="sa-btn" onclick="A.saLogin()">🔐 Access Super Admin</button>

          <div class="sa-back" onclick="location.hash='#/'">← Back to DORMEDS</div>

          <div class="sa-creds-hint">
            <strong style="color:rgba(167,139,250,.8)">Demo Credentials:</strong><br/>
            Username: <strong>superadmin</strong> &nbsp;|&nbsp; Password: <strong>Admin@1234</strong>
          </div>
        </div>
      </div>
    </div>`;
    setTimeout(() => document.getElementById('sa_user')?.focus(), 300);
  },

  saLogin() {
    const username = document.getElementById('sa_user')?.value?.trim();
    const password = document.getElementById('sa_pass')?.value;
    const errEl = document.getElementById('sa-login-error');

    if (!username || !password) {
      errEl.style.display = 'block';
      errEl.textContent = 'Please enter username and password.';
      return;
    }

    const user = this.db.verifyAdminPassword(username, password);
    if (!user || user.role !== 'super_admin') {
      errEl.style.display = 'block';
      errEl.textContent = user ? '⛔ Access denied. Super Admin role required.' : '❌ Invalid username or password.';
      // shake animation
      const card = document.querySelector('.sa-login-card');
      if (card) { card.style.animation = 'none'; card.offsetHeight; card.style.animation = 'popIn .4s'; }
      return;
    }

    // Update last login
    this.db.update('admin_users', user.id, { lastLogin: new Date().toISOString() });
    this._setSaSession(user);
    this.toast(`Welcome, ${user.name}! 🛡️`);
    location.hash = '#/super-admin/dashboard';
  },

  saLogout() {
    this._clearSaSession();
    this.toast('Super Admin session ended.', 'info');
    location.hash = '#/';
  },

  // =====================================================
  // SUPER ADMIN PANEL SHELL
  // =====================================================
  viewSuperAdminPanel(app, view) {
    const session = this._getSaSession();
    const navItems = [
      { id:'dashboard', icon:'📊', l:'Dashboard' },
      { id:'admins',    icon:'👥', l:'Admin Users' },
      { id:'orders',    icon:'📋', l:'All Orders' },
      { id:'counselling', icon:'🩺', l:'Counselling Logs' },
      { id:'delivery',  icon:'🚴', l:'Delivery Audit' },
      { id:'audit',     icon:'📝', l:'Audit Trail' },
    ];
    const viewFns = {
      dashboard:   () => this.saDashboard(),
      admins:      () => this.saAdminUsers(),
      orders:      () => this.saAllOrders(),
      counselling: () => this.saCounsellingLogs(),
      delivery:    () => this.saDeliveryAudit(),
      audit:       () => this.saAuditTrail(),
    };
    const content = (viewFns[view] || viewFns.dashboard)();
    const pageTitle = navItems.find(i => i.id === view)?.l || 'Dashboard';

    app.innerHTML = `
    <div class="sa-root">
      <div class="sa-layout">
        <!-- Sidebar -->
        <aside class="sa-sidebar" id="sa-sidebar">
          <div class="sa-sidebar-head">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">🛡️</span>
              <div>
                <div class="sa-sidebar-brand">DORMEDS</div>
                <div class="sa-sidebar-label">Super Admin</div>
              </div>
            </div>
          </div>
          <nav class="sa-nav">
            ${navItems.map(i => `
            <div class="sa-nav-item ${view === i.id ? 'on' : ''}" onclick="location.hash='#/super-admin/${i.id}'">
              <span class="sa-nav-icon">${i.icon}</span>${i.l}
            </div>`).join('')}
          </nav>
          <div class="sa-sidebar-foot">
            <div class="sa-sidebar-user">
              <div class="sa-sidebar-avatar">${(session?.name || 'SA')[0]}</div>
              <div>
                <div class="sa-sidebar-uname">${session?.name || 'Super Admin'}</div>
                <div class="sa-sidebar-urole">Super Admin</div>
              </div>
            </div>
            <div class="sa-nav-item" onclick="A.saLogout()" style="color:rgba(239,68,68,.7)">
              <span class="sa-nav-icon">🚪</span>Sign Out
            </div>
          </div>
        </aside>

        <!-- Main content -->
        <main class="sa-main">
          <header class="sa-main-head">
            <div style="display:flex;align-items:center;gap:12px">
              <button style="display:none;width:36px;height:36px;border-radius:8px;background:rgba(139,92,246,.1);color:#A78BFA;font-size:18px;align-items:center;justify-content:center" id="sa-menu-btn"
                onclick="document.getElementById('sa-sidebar').classList.toggle('open')">☰</button>
              <h1>${pageTitle}</h1>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="role-tag-sa">🛡️ Super Admin</span>
              <span style="font-size:11px;color:rgba(167,139,250,.5)">${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
            </div>
          </header>
          <div class="sa-main-body page">${content}</div>
        </main>
      </div>
    </div>`;

    // Show menu button on mobile
    const btn = document.getElementById('sa-menu-btn');
    if (btn && window.innerWidth <= 1024) btn.style.display = 'flex';
  },

  // =====================================================
  // SA DASHBOARD
  // =====================================================
  saDashboard() {
    const orders = this.db.get('orders');
    const users = this.db.get('users');
    const adminUsers = this.db.get('admin_users');
    const counselling = this.db.get('counselling_requests');
    const checklists = this.db.get('delivery_checklists');
    const counsellingLogs = this.db.get('counselling_logs');

    const delivered = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const counsellingPending = counselling.filter(c => c.status === 'counselling_pending').length;
    const totalRevenue = orders.filter(o => o.status === 'delivered' || o.status === 'completed').reduce((s, o) => s + o.total, 0);

    return `
    <div>
      <!-- Stats -->
      <div class="sa-stats">
        <div class="sa-stat">
          <div class="ss-icon" style="background:rgba(59,130,246,.1)">📦</div>
          <div class="ss-val">${orders.length.toLocaleString()}</div>
          <div class="ss-label">Total Orders</div>
          <div class="ss-delta" style="background:var(--success-bg);color:var(--success)">↑ ${delivered} delivered</div>
        </div>
        <div class="sa-stat">
          <div class="ss-icon" style="background:var(--success-bg)">💰</div>
          <div class="ss-val">₹${(totalRevenue/1000).toFixed(1)}K</div>
          <div class="ss-label">Platform Revenue</div>
          <div class="ss-delta" style="background:var(--success-bg);color:var(--success)">↑ 8.3% this month</div>
        </div>
        <div class="sa-stat">
          <div class="ss-icon" style="background:rgba(139,92,246,.1)">👥</div>
          <div class="ss-val">${users.length + adminUsers.length}</div>
          <div class="ss-label">Total Users + Admins</div>
          <div class="ss-delta" style="background:rgba(139,92,246,.12);color:#A78BFA">${adminUsers.length} admins</div>
        </div>
        <div class="sa-stat">
          <div class="ss-icon" style="background:rgba(245,158,11,.1)">🩺</div>
          <div class="ss-val">${counselling.length}</div>
          <div class="ss-label">Counselling Requests</div>
          <div class="ss-delta" style="background:var(--warning-bg);color:var(--warning)">${counsellingPending} pending</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--s-3);margin-bottom:var(--s-6)">
        <button class="btn btn-p btn-block" onclick="location.hash='#/super-admin/admins'">👥 Manage Admins</button>
        <button class="btn btn-g btn-block" onclick="location.hash='#/super-admin/orders'">📋 View All Orders</button>
        <button class="btn btn-g btn-block" onclick="location.hash='#/super-admin/delivery'">🚴 Delivery Audit</button>
        <button class="btn btn-g btn-block" onclick="location.hash='#/super-admin/counselling'">🩺 Counselling Logs</button>
      </div>

      <!-- Recent Activity -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)">
        <div class="sa-card">
          <h3>📋 Recent Orders</h3>
          ${orders.slice(-5).reverse().map(o => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(139,92,246,.07);font-size:var(--text-sm);color:#C4B5FD">
            <span>#${o.id} · ${o.uName}</span>
            <span style="font-weight:700;color:${o.status==='delivered'?'#22C55E':o.status==='pending'?'#F59E0B':'#A78BFA'}">₹${o.total}</span>
          </div>`).join('')}
        </div>
        <div class="sa-card">
          <h3>🩺 Recent Counselling</h3>
          ${counsellingLogs.slice(-5).reverse().map(l => `
          <div style="padding:10px 0;border-bottom:1px solid rgba(139,92,246,.07)">
            <div style="font-size:var(--text-sm);font-weight:600;color:#E2D9F3">${l.patientName}</div>
            <div style="font-size:11px;color:rgba(167,139,250,.6)">${l.type?.replace('_',' ')} · ${new Date(l.createdAt).toLocaleDateString('en-IN')}</div>
          </div>`).join('')}
          ${counsellingLogs.length === 0 ? '<div style="color:rgba(167,139,250,.4);font-size:var(--text-sm)">No logs yet</div>' : ''}
        </div>
      </div>
    </div>`;
  },

  // =====================================================
  // SA ADMIN USERS MANAGEMENT
  // =====================================================
  saAdminUsers() {
    const admins = this.db.get('admin_users');
    const roleBadges = {
      super_admin: '<span class="sa-badge-sa">🛡️ Super Admin</span>',
      admin: '<span class="sa-badge-admin">⚙️ Admin</span>',
      ops: '<span class="sa-badge-ops">🚴 Ops</span>',
    };

    return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-6)">
        <div>
          <h2 style="font-size:var(--text-xl);color:#E2D9F3">Admin Users</h2>
          <p style="font-size:var(--text-sm);color:rgba(167,139,250,.5);margin-top:4px">${admins.length} users across all roles</p>
        </div>
        <button class="btn btn-p btn-sm" onclick="A.saShowCreateAdmin()">+ Create Admin</button>
      </div>

      <div id="sa-create-admin-form"></div>

      <div class="sa-table-wrap">
        <table class="sa-table">
          <thead>
            <tr>
              <th>User</th><th>Username</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${admins.map(a => `
            <tr>
              <td style="font-weight:600;color:#E2D9F3">${a.name}</td>
              <td><code style="background:rgba(139,92,246,.08);padding:2px 8px;border-radius:6px;font-size:12px">${a.username}</code></td>
              <td>${roleBadges[a.role] || a.role}</td>
              <td><span class="badge ${a.active ? 'badge-s' : 'badge-e'}">${a.active ? 'Active' : 'Inactive'}</span></td>
              <td style="color:rgba(167,139,250,.5);font-size:12px">${a.lastLogin ? new Date(a.lastLogin).toLocaleString('en-IN') : 'Never'}</td>
              <td>
                <div style="display:flex;gap:8px">
                  ${a.role !== 'super_admin' ? `
                  <button class="btn btn-g btn-sm" style="color:rgba(167,139,250,.7)" onclick="A.saToggleAdmin('${a.id}','${a.active}')">${a.active ? 'Deactivate' : 'Activate'}</button>
                  <button class="btn btn-g btn-sm" style="color:var(--error)" onclick="A.saDeleteAdmin('${a.id}','${a.name}')">Delete</button>
                  ` : '<span style="color:rgba(167,139,250,.3);font-size:11px">Protected</span>'}
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  saShowCreateAdmin() {
    const form = document.getElementById('sa-create-admin-form');
    if (!form) return;
    form.innerHTML = `
    <div class="sa-card" style="margin-bottom:var(--s-6)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
        <h3 style="margin-bottom:0">+ Create New Admin</h3>
        <button class="btn btn-g btn-sm" onclick="document.getElementById('sa-create-admin-form').innerHTML=''">✕ Close</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--s-4)">
        <div>
          <label style="font-size:11px;font-weight:600;color:rgba(139,92,246,.6);display:block;margin-bottom:6px;text-transform:uppercase">FULL NAME</label>
          <input class="sa-inp-dark" id="na_name" placeholder="e.g. Priya Reddy"/>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:rgba(139,92,246,.6);display:block;margin-bottom:6px;text-transform:uppercase">USERNAME</label>
          <input class="sa-inp-dark" id="na_user" placeholder="e.g. priya_ops"/>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:rgba(139,92,246,.6);display:block;margin-bottom:6px;text-transform:uppercase">ROLE</label>
          <select class="sa-inp-dark" id="na_role">
            <option value="admin">⚙️ Admin</option>
            <option value="ops">🚴 Ops</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:rgba(139,92,246,.6);display:block;margin-bottom:6px;text-transform:uppercase">PASSWORD</label>
          <input class="sa-inp-dark" type="password" id="na_pass" placeholder="Set password"/>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:rgba(139,92,246,.6);display:block;margin-bottom:6px;text-transform:uppercase">EMAIL</label>
          <input class="sa-inp-dark" type="email" id="na_email" placeholder="admin@dormeds.com"/>
        </div>
      </div>
      <div style="margin-top:var(--s-5)">
        <button class="btn btn-p" onclick="A.saCreateAdmin()">💾 Create Admin User</button>
      </div>
    </div>`;
  },

  saCreateAdmin() {
    const name  = document.getElementById('na_name')?.value?.trim();
    const uname = document.getElementById('na_user')?.value?.trim();
    const role  = document.getElementById('na_role')?.value;
    const pass  = document.getElementById('na_pass')?.value;
    const email = document.getElementById('na_email')?.value?.trim();

    if (!name || !uname || !pass) { this.toast('Fill all required fields', 'error'); return; }
    // Check unique username
    const existing = this.db.get('admin_users').find(a => a.username === uname);
    if (existing) { this.toast('Username already exists', 'error'); return; }

    this.db.add('admin_users', {
      id: 'ADM' + Date.now(), username: uname, name,
      password_b64: btoa(pass), role, active: true,
      email: email || '', createdAt: new Date().toISOString(), lastLogin: null
    });
    document.getElementById('sa-create-admin-form').innerHTML = '';
    this.toast(`Admin "${name}" created successfully! ✅`);
    this.routeSuperAdmin(document.getElementById('app'), 'admins');
  },

  saToggleAdmin(id, currentActive) {
    const isActive = currentActive === 'true' || currentActive === true;
    this.db.update('admin_users', id, { active: !isActive });
    this.toast(`Admin ${isActive ? 'deactivated' : 'activated'}`);
    this.routeSuperAdmin(document.getElementById('app'), 'admins');
  },

  saDeleteAdmin(id, name) {
    if (!confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
    this.db.remove('admin_users', id);
    this.toast(`Admin "${name}" deleted.`);
    this.routeSuperAdmin(document.getElementById('app'), 'admins');
  },

  // =====================================================
  // SA ALL ORDERS VIEW
  // =====================================================
  saAllOrders() {
    const orders = this.db.get('orders').reverse();
    const sc = {
      pending:'#F59E0B', accepted:'#06B6D4', preparing:'#06B6D4',
      packed:'#A78BFA', out_for_delivery:'#A78BFA',
      pending_physical_verification:'#F59E0B',
      completed:'#22C55E', delivered:'#22C55E', cancelled:'#EF4444'
    };

    return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
        <h2 style="font-size:var(--text-xl);color:#E2D9F3">All Orders</h2>
        <span style="color:rgba(167,139,250,.5);font-size:var(--text-sm)">${orders.length} total</span>
      </div>
      <div class="sa-table-wrap">
        <table class="sa-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Pharmacy</th><th>Amount</th><th>Status</th><th>Counselling</th><th>OTP</th><th>Date</th></tr></thead>
          <tbody>
            ${orders.map(o => {
              const req = this.db.get('counselling_requests').find(c => c.orderId === o.id);
              return `<tr>
                <td style="font-weight:700;color:#E2D9F3">#${o.id}${o.emergency ? '<span style="color:var(--error);margin-left:4px">🚨</span>' : ''}</td>
                <td>${o.uName}</td>
                <td>${o.phName}</td>
                <td style="font-weight:700;color:#A78BFA">₹${o.total}</td>
                <td><span style="background:${sc[o.status] || '#6B7280'}22;color:${sc[o.status] || '#9CA3AF'};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700">${o.status.replace(/_/g,' ')}</span></td>
                <td>${req ? `<span style="background:${req.status==='counselling_completed'?'var(--success-bg)':'rgba(139,92,246,.1)'};color:${req.status==='counselling_completed'?'var(--success)':'#A78BFA'};padding:3px 8px;border-radius:999px;font-size:11px">${req.status.replace(/_/g,' ')}</span>` : '<span style="color:rgba(167,139,250,.3);font-size:11px">—</span>'}</td>
                <td>${o.otpVerified ? '<span style="color:var(--success);font-size:12px">✅ Verified</span>' : '<span style="color:rgba(167,139,250,.4);font-size:11px">Pending</span>'}</td>
                <td style="font-size:11px;color:rgba(167,139,250,.5)">${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  // =====================================================
  // SA COUNSELLING LOGS
  // =====================================================
  saCounsellingLogs() {
    const requests = this.db.get('counselling_requests');
    const logs = this.db.get('counselling_logs');

    return `
    <div>
      <h2 style="font-size:var(--text-xl);color:#E2D9F3;margin-bottom:var(--s-6)">🩺 Counselling Audit</h2>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s-4);margin-bottom:var(--s-6)">
        <div class="sa-stat"><div class="ss-icon" style="background:rgba(139,92,246,.1)">📋</div><div class="ss-val">${requests.length}</div><div class="ss-label">Total Requests</div></div>
        <div class="sa-stat"><div class="ss-icon" style="background:var(--warning-bg)">⏳</div><div class="ss-val">${requests.filter(r=>r.status==='counselling_pending').length}</div><div class="ss-label">Pending</div></div>
        <div class="sa-stat"><div class="ss-icon" style="background:var(--success-bg)">✅</div><div class="ss-val">${requests.filter(r=>r.status==='counselling_completed').length}</div><div class="ss-label">Completed</div></div>
      </div>

      <div class="sa-card" style="margin-bottom:var(--s-6)">
        <h3>Auto-Created Counselling Requests (from Delivery)</h3>
        ${requests.length === 0 ? '<div style="color:rgba(167,139,250,.4)">No counselling requests yet.</div>' : ''}
        ${requests.map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(139,92,246,.08)">
          <div>
            <div style="font-size:var(--text-sm);font-weight:600;color:#E2D9F3">${r.patientName} · Order #${r.orderId}</div>
            <div style="font-size:11px;color:rgba(167,139,250,.5)">${new Date(r.createdAt).toLocaleString('en-IN')}</div>
            ${r.notes ? `<div style="font-size:11px;color:rgba(167,139,250,.4);margin-top:2px">${r.notes}</div>` : ''}
          </div>
          <span style="background:${r.status==='counselling_completed'?'var(--success-bg)':'rgba(245,158,11,.1)'};color:${r.status==='counselling_completed'?'var(--success)':'var(--warning)'};padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700">${r.status.replace(/_/g,' ')}</span>
        </div>`).join('')}
      </div>

      <div class="sa-card">
        <h3>Manual Counselling Logs</h3>
        ${logs.length === 0 ? '<div style="color:rgba(167,139,250,.4)">No logs yet.</div>' : ''}
        ${logs.reverse().map(l => `
        <div style="padding:12px 0;border-bottom:1px solid rgba(139,92,246,.08)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:600;color:#E2D9F3;font-size:var(--text-sm)">${l.patientName}</span>
            <span style="font-size:11px;color:rgba(167,139,250,.4)">${new Date(l.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <div style="font-size:11px;color:rgba(167,139,250,.5)">${l.type?.replace('_',' ')} · ${l.counsellorName}</div>
          <div style="font-size:var(--text-sm);color:rgba(167,139,250,.6);margin-top:4px">${l.notes?.substring(0,100)}${l.notes?.length>100?'...':''}</div>
        </div>`).join('')}
      </div>
    </div>`;
  },

  // =====================================================
  // SA DELIVERY AUDIT
  // =====================================================
  saDeliveryAudit() {
    const checklists = this.db.get('delivery_checklists');
    const otps = this.db.get('delivery_otps');
    const physVerifs = this.db.get('physical_verifications');
    const orders = this.db.get('orders');

    return `
    <div>
      <h2 style="font-size:var(--text-xl);color:#E2D9F3;margin-bottom:var(--s-6)">🚴 Delivery Audit</h2>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s-4);margin-bottom:var(--s-6)">
        <div class="sa-stat"><div class="ss-icon" style="background:var(--primary-subtle)">✅</div><div class="ss-val">${checklists.length}</div><div class="ss-label">Checklists Done</div></div>
        <div class="sa-stat"><div class="ss-icon" style="background:var(--success-bg)">🔢</div><div class="ss-val">${orders.filter(o=>o.otpVerified).length}</div><div class="ss-label">OTPs Verified</div></div>
        <div class="sa-stat"><div class="ss-icon" style="background:rgba(139,92,246,.1)">📋</div><div class="ss-val">${physVerifs.length}</div><div class="ss-label">Phys. Verified</div></div>
        <div class="sa-stat"><div class="ss-icon" style="background:var(--warning-bg)">🩺</div><div class="ss-val">${checklists.filter(c=>c.counsellingRequired).length}</div><div class="ss-label">Counselling Flagged</div></div>
      </div>

      <div class="sa-card">
        <h3>Delivery Checklists</h3>
        ${checklists.length === 0 ? '<div style="color:rgba(167,139,250,.4)">No checklists completed yet.</div>' : ''}
        <div class="sa-table-wrap" style="border:none">
          <table class="sa-table">
            <thead><tr><th>Order ID</th><th>Picked</th><th>Sealed</th><th>Address</th><th>Counselling?</th><th>Completed</th></tr></thead>
            <tbody>
              ${checklists.map(c => `
              <tr>
                <td style="font-weight:700;color:#E2D9F3">#${c.orderId}</td>
                <td>${c.pickedConfirmed ? '✅' : '❌'}</td>
                <td>${c.sealedConfirmed ? '✅' : '❌'}</td>
                <td>${c.addressConfirmed ? '✅' : '❌'}</td>
                <td>${c.counsellingRequired ? '<span style="color:#F59E0B;font-weight:700">YES</span>' : '<span style="color:rgba(167,139,250,.4)">No</span>'}</td>
                <td style="font-size:11px;color:rgba(167,139,250,.4)">${c.completedAt ? new Date(c.completedAt).toLocaleString('en-IN') : '—'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  // =====================================================
  // SA AUDIT TRAIL
  // =====================================================
  saAuditTrail() {
    const orders = this.db.get('orders');
    const logs = this.db.get('counselling_logs');
    const checklists = this.db.get('delivery_checklists');
    const requests = this.db.get('counselling_requests');

    // Build unified audit trail
    const events = [
      ...orders.map(o => ({ time: o.updatedAt, type:'order', icon:'📦', msg:`Order #${o.id} → ${o.status.replace(/_/g,' ')}`, sub: o.uName })),
      ...logs.map(l => ({ time: l.createdAt, type:'counselling', icon:'🩺', msg:`Counselling: ${l.patientName}`, sub: l.counsellorName })),
      ...requests.map(r => ({ time: r.createdAt, type:'request', icon:'💬', msg:`Counselling Request for ${r.patientName} (Order #${r.orderId})`, sub: r.status })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 30);

    return `
    <div>
      <h2 style="font-size:var(--text-xl);color:#E2D9F3;margin-bottom:var(--s-6)">📝 System Audit Trail</h2>
      <div class="sa-card">
        <h3>Recent Events (Last 30)</h3>
        ${events.map(e => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(139,92,246,.07)">
          <span style="font-size:20px;flex-shrink:0">${e.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);color:#E2D9F3">${e.msg}</div>
            <div style="font-size:11px;color:rgba(167,139,250,.5)">${e.sub}</div>
          </div>
          <div style="font-size:11px;color:rgba(167,139,250,.3);white-space:nowrap">${new Date(e.time).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
        </div>`).join('')}
      </div>
    </div>`;
  },

}); // end superadmin mixin
