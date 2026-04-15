// =====================================================================
// DORMEDS 3.0 — Multi-Role Admin Panel
// Owner | Customer Care | Patient Counsellor
// =====================================================================

Object.assign(DormedsApp.prototype, {

  // ===== ADMIN ROLE SELECTOR (shown after login) =====
  viewAdminRoleSelect(app) {
    const adminUser = this.user;
    app.innerHTML = `
      <div class="landing">
        <div class="particles">${Array.from({length:6},()=>`<div class="particle"></div>`).join('')}</div>
        <div class="land-content anim-up" style="max-width:700px">
          <div style="font-size:40px;margin-bottom:var(--s-4)">🛡️</div>
          <h1 style="font-size:var(--text-3xl);margin-bottom:var(--s-2)">Admin Panel</h1>
          <p style="color:var(--text-secondary);margin-bottom:var(--s-8)">Welcome back, <strong>${adminUser?.name||'Admin'}</strong>. Select your panel.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--s-4);margin-bottom:var(--s-6)">
            <div class="role-c" onclick="A.enterAdminRole('owner')" id="role-owner" style="border-color:var(--primary)">
              <span class="rc-icon">👑</span><h3>Owner</h3><p>Full system control & analytics</p>
            </div>
            <div class="role-c" onclick="A.enterAdminRole('support')" id="role-support" style="border-color:var(--warning)">
              <span class="rc-icon">🎧</span><h3>Customer Care</h3><p>Tickets & order support</p>
            </div>
            <div class="role-c" onclick="A.enterAdminRole('counsellor')" id="role-counsellor" style="border-color:#8B5CF6">
              <span class="rc-icon">🩺</span><h3>Counsellor</h3><p>Patient history & notes</p>
            </div>
          </div>
          <button class="btn btn-g" onclick="A.logout()">← Back to Home</button>
        </div>
      </div>`;
  },

  enterAdminRole(role) {
    this.adminRole = role;
    localStorage.setItem('dmed_admin_role', role);
    location.hash = `#/admin-${role}/home`;
  },

  // ===== ADMIN ROUTER (extend main route) =====
  routeAdmin(app, role, view, param) {
    const adminRoleMap = {
      owner:    { home:()=>this.ownerDash(),    revenue:()=>this.ownerRevenue(),    pharmacies:()=>this.ownerPharmacies(), subscriptions:()=>this.ownerSubscriptions(), commission:()=>this.admCommission() },
      support:  { home:()=>this.supportDash(),  tickets:()=>this.supportTickets(),  orders:()=>this.supportOrders(),       users:()=>this.supportUsers() },
      counsellor:{ home:()=>this.counsellorDash(), patients:()=>this.counsellorPatients(), logs:()=>this.counsellorLogs(), schedule:()=>this.counsellorSchedule() },
    };
    const navMap = {
      owner:    [{id:'home',icon:'📊',l:'Dashboard'},{id:'revenue',icon:'💰',l:'Revenue'},{id:'pharmacies',icon:'🏪',l:'Pharmacies'},{id:'subscriptions',icon:'💳',l:'Subscriptions'},{id:'commission',icon:'💹',l:'Commission'}],
      support:  [{id:'home',icon:'🎧',l:'Dashboard'},{id:'tickets',icon:'🎟️',l:'Tickets'},{id:'orders',icon:'📋',l:'Orders'},{id:'users',icon:'👥',l:'Users'}],
      counsellor:[{id:'home',icon:'🩺',l:'Dashboard'},{id:'patients',icon:'👤',l:'Patients'},{id:'logs',icon:'📝',l:'Logs'},{id:'schedule',icon:'📅',l:'Schedule'}],
    };
    const roleColors = { owner:'var(--primary)', support:'var(--warning)', counsellor:'#8B5CF6' };
    const roleLabels = { owner:'Owner Panel', support:'Customer Care', counsellor:'Counselling' };
    const viewFn = (adminRoleMap[role]?.[view] || adminRoleMap[role]?.home || (()=>''))();
    const items = navMap[role] || [];
    const mobItems = items.slice(0,5);

    app.innerHTML = `<div class="dash">
      <aside class="side" id="sidebar">
        <div class="side-head">
          <img src="assets/icon.png" class="side-logo-img" alt="DORMEDS" onerror="this.outerHTML='<span style=&quot;font-size:24px&quot;>💊</span>'"/>
          <span class="side-brand">DORMEDS</span>
        </div>
        <div style="padding:var(--s-3) var(--s-4);background:${roleColors[role]}22;border-bottom:1px solid var(--border)">
          <div style="font-size:10px;font-weight:600;color:${roleColors[role]};text-transform:uppercase;letter-spacing:.1em">${roleLabels[role]}</div>
        </div>
        <nav class="side-nav"><div class="side-sec">
          ${items.map(i=>`<div class="side-link ${view===i.id?'on':''}" onclick="location.hash='#/admin-${role}/${i.id}'"><span class="sl-icon">${i.icon}</span>${i.l}</div>`).join('')}
        </div></nav>
        <div class="side-foot">
          <div style="padding:var(--s-2) var(--s-3);font-size:11px;color:var(--text-muted);margin-bottom:var(--s-2)">Signed in as <strong>${this.user?.name||'Admin'}</strong></div>
          <div class="side-link" onclick="A.adminRoleSelect()" style="color:var(--warning)"><span class="sl-icon">🔄</span>Switch Role</div>
          <div class="side-link" onclick="A.logout()" style="color:var(--error)"><span class="sl-icon">🚪</span>Logout</div>
        </div>
      </aside>
      <div class="side-ov" id="sideOv" onclick="document.getElementById('sidebar').classList.remove('open');this.classList.remove('vis')"></div>
      <main class="main">
        <header class="main-head">
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <button class="btn btn-g btn-icon" style="display:none" id="menuBtn" onclick="document.getElementById('sidebar').classList.add('open');document.getElementById('sideOv').classList.add('vis')">☰</button>
            <div>
              <h1 style="font-size:var(--text-lg)">${items.find(i=>i.id===view)?.l||roleLabels[role]}</h1>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <span style="font-size:11px;padding:4px 12px;border-radius:var(--r-full);background:${roleColors[role]}22;color:${roleColors[role]};font-weight:600;text-transform:uppercase">${roleLabels[role]}</span>
            <div class="avatar">${this.user?.avatar||'?'}</div>
          </div>
        </header>
        <div class="main-body page">${viewFn}</div>
      </main>
      <nav class="dash-mob-nav">
        ${mobItems.map(i=>`<div class="n-item ${view===i.id?'on':''}" onclick="location.hash='#/admin-${role}/${i.id}'" title="${i.l}"><span class="n-icon">${i.icon}</span>${i.l}</div>`).join('')}
        <div class="n-item" onclick="A.logout()" style="color:var(--error)"><span class="n-icon">🚪</span>Exit</div>
      </nav>
    </div>`;
  },

  adminRoleSelect() {
    this.adminRole = null;
    localStorage.removeItem('dmed_admin_role');
    this.viewAdminRoleSelect(document.getElementById('app'));
  },

  // ===== OWNER PANEL =====
  ownerDash() {
    const an = this.db.getObj('analytics');
    const orders = this.db.get('orders');
    const subs = this.db.get('subscriptions').filter(s=>s.status==='active');
    const subRevenue = subs.reduce((s,sub)=>s+sub.amount,0);
    const bptBookings = this.db.get('bpt_bookings');
    const labBookings = this.db.get('lab_bookings');
    const serviceRev = bptBookings.reduce((s,b)=>s+b.price,0)+labBookings.reduce((s,b)=>s+b.price,0);

    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📦</div><div class="st-val">${an.totalOrders?.toLocaleString()}</div><div class="st-label">Total Orders</div><span class="st-delta st-up">↑ 12.5%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="st-val">₹${(an.totalRevenue/1e5).toFixed(1)}L</div><div class="st-label">Med Revenue</div><span class="st-delta st-up">↑ 8.3%</span></div>
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">💳</div><div class="st-val">₹${subRevenue.toLocaleString()}</div><div class="st-label">Sub Revenue</div><span class="st-delta st-up">↑ 34%</span></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">🏥</div><div class="st-val">₹${serviceRev.toLocaleString()}</div><div class="st-label">Services Rev</div><span class="st-delta st-up">NEW</span></div>
    </div>
    <div class="dash-grid-2" style="margin-bottom:var(--s-6)">
      <div class="chart"><div class="chart-head"><h3>📈 Monthly Orders</h3></div>
        <div class="chart-bars">${['J','F','M','A','M','J','J','A','S','O','N','D'].map((m,i)=>{const max=Math.max(...(an.monthly||[1]));const h=an.monthly?(an.monthly[i]/max)*100:50;return`<div class="chart-bar" style="height:${h}%"><span class="cb-val">${an.monthly?.[i]||0}</span><span class="cb-lbl">${m}</span></div>`;}).join('')}</div>
      </div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">📊 Revenue Breakdown</h3></div><div class="card-body">
        ${[['💊 Medicines',an.totalRevenue,'var(--primary)'],['💳 Subscriptions',subRevenue,'#8B5CF6'],['🏥 Services',serviceRev,'var(--success)']].map(([l,v,c])=>{const total=an.totalRevenue+subRevenue+serviceRev;const pct=total>0?Math.round(v/total*100):0;return`<div style="margin-bottom:var(--s-3)"><div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:4px"><span>${l}</span><span style="font-weight:700">₹${v.toLocaleString()} (${pct}%)</span></div><div style="height:6px;background:var(--border);border-radius:var(--r-full)"><div style="height:100%;width:${pct}%;background:${c};border-radius:var(--r-full)"></div></div></div>`;}).join('')}
      </div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--s-3)">
      <button class="btn btn-p btn-block" onclick="location.hash='#/admin-owner/pharmacies'">🏪 Approve Pharmacies</button>
      <button class="btn btn-g btn-block" onclick="location.hash='#/admin-owner/subscriptions'">💳 Manage Plans</button>
      <button class="btn btn-g btn-block" onclick="location.hash='#/admin-owner/commission'">💹 Commission</button>
      <button class="btn btn-g btn-block" onclick="A.admAnalytics&&location.hash==='#/admin-owner/home'?'':this.toast('Loading analytics','info')">📈 Analytics</button>
    </div>`;
  },

  ownerSubscriptions() {
    const plans = this.db.get('subscription_plans');
    const subs = this.db.get('subscriptions');
    const activeSubs = subs.filter(s=>s.status==='active');

    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">💳 Subscription Management</h2>
    <div class="stats-g" style="margin-bottom:var(--s-6)">
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">👥</div><div class="st-val">${activeSubs.length}</div><div class="st-label">Active Subscribers</div></div>
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">💰</div><div class="st-val">₹${activeSubs.reduce((s,sub)=>s+sub.amount,0).toLocaleString()}</div><div class="st-label">Monthly MRR</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">⭐</div><div class="st-val">${activeSubs.filter(s=>s.planId==='SP2').length}</div><div class="st-label">Premium Users</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">💊</div><div class="st-val">${activeSubs.filter(s=>s.planId==='SP1').length}</div><div class="st-label">Basic Users</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--s-4);margin-bottom:var(--s-6)">
      ${plans.map(p=>`
        <div class="card" style="padding:var(--s-5);border:2px solid ${p.color}33">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-3)">
            <div><div style="font-size:var(--text-lg);font-weight:800">${p.icon} ${p.name}</div><div style="font-size:var(--text-2xl);font-weight:900;color:${p.color}">₹${p.price}<span style="font-size:var(--text-sm);font-weight:400;color:var(--text-muted)">/mo</span></div></div>
            <div style="text-align:right"><div style="font-size:var(--text-xl);font-weight:800">${activeSubs.filter(s=>s.planId===p.id).length}</div><div style="font-size:11px;color:var(--text-muted)">Active Users</div></div>
          </div>
          <div class="inp-grp"><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">UPDATE PRICE</label>
            <div style="display:flex;gap:var(--s-2)"><input class="inp" type="number" id="price_${p.id}" value="${p.price}" style="flex:1"/><button class="btn btn-p btn-sm" onclick="A.updatePlanPrice('${p.id}')">Update</button></div>
          </div>
        </div>`).join('')}
    </div>
    <h3 style="margin-bottom:var(--s-3)">Active Subscriptions</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>User</th><th>Plan</th><th>Started</th><th>Expires</th><th>Amount</th><th>Status</th></tr></thead><tbody>
      ${subs.map(s=>{const u=this.db.get('users').find(u=>u.id===s.userId)||{name:'Unknown'};return`<tr>
        <td data-label="User">${u.name}</td><td data-label="Plan"><span class="badge" style="background:${s.planId==='SP2'?'#8B5CF622':'var(--primary-subtle)'};color:${s.planId==='SP2'?'#8B5CF6':'var(--primary)'}">${s.planName}</span></td>
        <td data-label="Started">${s.startDate}</td><td data-label="Expires">${s.endDate}</td>
        <td data-label="Amount" style="font-weight:700">₹${s.amount}</td>
        <td data-label="Status"><span class="badge ${s.status==='active'?'badge-s':s.status==='expired'?'badge-e':'badge-n'}">${s.status}</span></td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
  },

  updatePlanPrice(planId) {
    const val = parseInt(document.getElementById('price_'+planId)?.value);
    if (!val||val<1) { this.toast('Invalid price','error'); return; }
    this.db.update('subscription_plans',planId,{price:val});
    this.toast('Plan price updated to ₹'+val);
  },

  ownerPharmacies() { return this.admPharma(); },
  ownerRevenue() { return this.admAnalytics(); },

  // ===== SUPPORT PANEL =====
  supportDash() {
    const tickets = this.db.get('support_tickets');
    const open = tickets.filter(t=>t.status==='open').length;
    const inProg = tickets.filter(t=>t.status==='in_progress').length;
    const resolved = tickets.filter(t=>t.status==='resolved').length;

    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:var(--error-bg);color:var(--error)">🔴</div><div class="st-val">${open}</div><div class="st-label">Open Tickets</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">🟡</div><div class="st-val">${inProg}</div><div class="st-label">In Progress</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${resolved}</div><div class="st-label">Resolved Today</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📋</div><div class="st-val">${tickets.length}</div><div class="st-label">Total Tickets</div></div>
    </div>
    <div class="card" style="margin-top:var(--s-6)"><div class="card-head" style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="font-size:var(--text-base)">🔴 Open Tickets</h3>
      <button class="btn btn-g btn-sm" onclick="location.hash='#/admin-support/tickets'">View All →</button>
    </div>
    ${tickets.filter(t=>t.status!=='resolved').map(t=>`
      <div class="dl-item" onclick="location.hash='#/admin-support/tickets'" style="cursor:pointer">
        <div class="dl-av" style="background:${t.priority==='high'?'var(--error)':t.priority==='medium'?'var(--warning)':'var(--info)'}">!</div>
        <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:var(--text-sm)">${t.subject}</div>
          <div style="font-size:11px;color:var(--text-secondary)">${t.userName} · Order ${t.orderId}</div></div>
        <span class="badge ${t.status==='open'?'badge-e':'badge-w'}">${t.status.replace('_',' ')}</span>
      </div>`).join('')}
    </div>`;
  },

  supportTickets() {
    const tickets = this.db.get('support_tickets');
    const priBadge = {high:'badge-e',medium:'badge-w',low:'badge-n'};

    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)">
      <h2 style="font-size:var(--text-xl)">🎟️ Support Tickets</h2>
      <div style="display:flex;gap:var(--s-2)">
        ${['all','open','in_progress','resolved'].map(s=>`<button class="btn btn-g btn-sm" onclick="A.toast('Filter: ${s}','info')">${s.replace('_',' ')}</button>`).join('')}
      </div>
    </div>
    ${tickets.map(t=>`
      <div class="card" style="margin-bottom:var(--s-4);padding:var(--s-5)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--s-3)">
          <div>
            <div style="display:flex;align-items:center;gap:var(--s-2);margin-bottom:var(--s-1)">
              <span style="font-weight:700">#${t.id}</span>
              <span class="badge ${priBadge[t.priority]}">${t.priority}</span>
              <span class="badge ${t.status==='open'?'badge-e':t.status==='in_progress'?'badge-w':'badge-s'}">${t.status.replace('_',' ')}</span>
            </div>
            <h4>${t.subject}</h4>
            <div style="font-size:var(--text-sm);color:var(--text-secondary)">${t.userName} · Order ${t.orderId}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted)">${new Date(t.createdAt).toLocaleString('en-IN')}</div>
        </div>
        <div style="background:var(--bg-surface);border-radius:var(--r-md);padding:var(--s-4);margin-bottom:var(--s-3);max-height:160px;overflow-y:auto">
          ${t.messages.map(m=>`
            <div style="margin-bottom:var(--s-3)">
              <div style="font-size:11px;font-weight:600;color:${m.from==='agent'?'var(--primary)':'var(--text-secondary)'};margin-bottom:4px">
                ${m.from==='agent'?'🎧 Support Agent':'👤 '+t.userName} · ${new Date(m.time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
              </div>
              <div style="font-size:var(--text-sm);background:${m.from==='agent'?'var(--primary-subtle)':'var(--bg-elevated)'};padding:var(--s-3);border-radius:var(--r-md)">${m.text}</div>
            </div>`).join('')}
        </div>
        ${t.status!=='resolved'?`
        <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
          <input class="inp" id="reply_${t.id}" placeholder="Type your reply..." style="flex:1;min-width:200px"/>
          <button class="btn btn-p btn-sm" onclick="A.replyTicket('${t.id}')">Send Reply</button>
          <button class="btn btn-s btn-sm" onclick="A.resolveTicket('${t.id}')">✅ Resolve</button>
          ${t.status==='open'?`<button class="btn btn-g btn-sm" onclick="A.claimTicket('${t.id}')">Claim Ticket</button>`:''}
        </div>`:
        `<div style="color:var(--success);font-size:var(--text-sm);font-weight:600">✅ Resolved</div>`}
      </div>`).join('')}`;
  },

  replyTicket(ticketId) {
    const inp = document.getElementById('reply_'+ticketId);
    const text = inp?.value?.trim();
    if (!text) { this.toast('Type a reply first','error'); return; }
    const ticket = this.db.getOne('support_tickets', ticketId);
    if (!ticket) return;
    const msgs = [...ticket.messages, {from:'agent',text,time:new Date().toISOString()}];
    this.db.update('support_tickets', ticketId, {messages:msgs,status:'in_progress',agentId:'ADM-S1',agentName:'Support Agent',updatedAt:new Date().toISOString()});
    this.toast('Reply sent!');
    location.hash = '#/admin-support/tickets';
  },

  resolveTicket(ticketId) {
    this.db.update('support_tickets', ticketId, {status:'resolved',updatedAt:new Date().toISOString()});
    this.toast('Ticket resolved ✅');
    location.hash = '#/admin-support/tickets';
  },

  claimTicket(ticketId) {
    this.db.update('support_tickets', ticketId, {status:'in_progress',agentId:'ADM-S1',agentName:'Support Agent',updatedAt:new Date().toISOString()});
    this.toast('Ticket claimed');
    location.hash = '#/admin-support/tickets';
  },

  supportOrders() { return this.admOrders(); },
  supportUsers() { return this.admUsers(); },

  // ===== COUNSELLOR PANEL =====
  counsellorDash() {
    const logs = this.db.get('counselling_logs');
    const users = this.db.get('users');
    const today = logs.filter(l=>l.createdAt.startsWith(new Date().toISOString().split('T')[0]));

    return `<div class="stats-g">
      <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${users.length}</div><div class="st-label">Total Patients</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📝</div><div class="st-val">${logs.length}</div><div class="st-label">Total Sessions</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">📅</div><div class="st-val">${today.length}</div><div class="st-label">Today</div></div>
      <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">⏰</div><div class="st-val">${logs.filter(l=>l.nextFollowup).length}</div><div class="st-label">Follow-ups</div></div>
    </div>
    <div class="dash-grid-2" style="margin-top:var(--s-6)">
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">👤 Recent Patients</h3></div>
        ${users.slice(0,3).map(u=>`
          <div class="dl-item" onclick="location.hash='#/admin-counsellor/patients'" style="cursor:pointer">
            <div class="avatar av-sm">${u.avatar}</div>
            <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">${u.name}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${u.phone}</div></div>
            <button class="btn btn-p btn-sm" onclick="event.stopPropagation();A.showAddLog('${u.id}')">+ Note</button>
          </div>`).join('')}
      </div>
      <div class="card"><div class="card-head"><h3 style="font-size:var(--text-base)">📝 Recent Logs</h3></div>
        ${logs.slice(-3).reverse().map(l=>`
          <div style="padding:var(--s-3) 0;border-bottom:1px solid var(--border)">
            <div style="font-weight:600;font-size:var(--text-sm)">${l.patientName}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin:2px 0">${l.notes.substring(0,80)}...</div>
            <div style="font-size:10px;color:var(--text-muted)">${new Date(l.createdAt).toLocaleDateString('en-IN')}</div>
          </div>`).join('')}
      </div>
    </div>`;
  },

  counsellorPatients() {
    const users = this.db.get('users');
    const logs = this.db.get('counselling_logs');

    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">👤 Patient Profiles</h2>
    ${users.map(u=>{
      const uLogs = logs.filter(l=>l.patientId===u.id);
      const uOrders = this.db.get('orders').filter(o=>o.uid===u.id);
      const uSub = this.db.checkSubscription(u.id);
      return `<div class="card" style="margin-bottom:var(--s-4);padding:var(--s-5)">
        <div style="display:flex;align-items:center;gap:var(--s-4);margin-bottom:var(--s-4)">
          <div class="avatar" style="width:52px;height:52px;font-size:var(--text-base)">${u.avatar}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:var(--text-base)">${u.name}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary)">📞 +91 ${u.phone}</div>
            <div style="font-size:11px;color:var(--text-muted)">${u.email}</div>
          </div>
          <div style="text-align:right">
            ${uSub.active?`<span class="badge" style="background:${uSub.plan?.id==='SP2'?'rgba(139,92,246,.15)':'var(--primary-subtle)'};color:${uSub.plan?.id==='SP2'?'#8B5CF6':'var(--primary)'}">${uSub.plan?.name}</span>`:'<span class="badge badge-n">No Plan</span>'}
          </div>
        </div>
        <div style="display:flex;gap:var(--s-6);margin-bottom:var(--s-4);flex-wrap:wrap">
          <div style="text-align:center"><div style="font-size:var(--text-xl);font-weight:800">${uOrders.length}</div><div style="font-size:11px;color:var(--text-muted)">Orders</div></div>
          <div style="text-align:center"><div style="font-size:var(--text-xl);font-weight:800">${uLogs.length}</div><div style="font-size:11px;color:var(--text-muted)">Consult Logs</div></div>
          <div style="text-align:center"><div style="font-size:var(--text-xl);font-weight:800">${this.db.get('bpt_bookings').filter(b=>b.userId===u.id).length}</div><div style="font-size:11px;color:var(--text-muted)">BPT Sessions</div></div>
        </div>
        ${uLogs.length?`<div style="background:var(--bg-surface);border-radius:var(--r-md);padding:var(--s-3);margin-bottom:var(--s-3);font-size:var(--text-sm)"><strong>Last Note:</strong> ${uLogs[uLogs.length-1].notes.substring(0,120)}...</div>`:``}
        <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
          <button class="btn btn-p btn-sm" onclick="A.showAddLog('${u.id}')">+ Add Note</button>
          <button class="btn btn-g btn-sm" onclick="A.toast('Patient orders: ${uOrders.length}','info')">📋 ${uOrders.length} Orders</button>
          ${uSub.active&&uSub.plan?.id==='SP2'?`<button class="btn btn-s btn-sm" onclick="A.toast('Scheduling follow-up for ${u.name}','info')">📅 Schedule Follow-up</button>`:''}
        </div>
      </div>`;}).join('')}`;
  },

  showAddLog(userId) {
    const u = this.db.getOne('users', userId) || {name:'Patient'};
    document.getElementById('modal-root').innerHTML = `
      <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:480px">
        <div class="modal-h"><h3>📝 Add Consultation Note</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
        <div class="modal-b">
          <div style="font-weight:600;margin-bottom:var(--s-4)">Patient: ${u.name}</div>
          <div class="inp-grp" style="margin-bottom:var(--s-3)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">SESSION TYPE</label>
            <select class="inp" id="logType"><option value="initial">Initial Consultation</option><option value="follow_up">Follow-up</option><option value="emergency">Emergency</option></select>
          </div>
          <div class="inp-grp" style="margin-bottom:var(--s-3)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">CONSULTATION NOTES</label>
            <textarea class="inp" id="logNotes" rows="4" placeholder="Patient complaints, observations, treatment notes..."></textarea>
          </div>
          <div class="inp-grp" style="margin-bottom:var(--s-3)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">RECOMMENDATIONS (comma separated)</label>
            <input class="inp" id="logRec" placeholder="e.g. BPT Session, Vitamin D Test, Rest"/>
          </div>
          <div class="inp-grp">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">NEXT FOLLOW-UP DATE</label>
            <input class="inp" type="date" id="logFollowup"/>
          </div>
        </div>
        <div class="modal-f">
          <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
          <button class="btn btn-p" onclick="A.saveLog('${userId}')">Save Note</button>
        </div>
      </div></div>`;
  },

  saveLog(userId) {
    const u = this.db.getOne('users', userId)||{name:'Patient'};
    const notes = document.getElementById('logNotes')?.value?.trim();
    const type = document.getElementById('logType')?.value;
    const recText = document.getElementById('logRec')?.value;
    const followup = document.getElementById('logFollowup')?.value;
    if (!notes) { this.toast('Please add consultation notes','error'); return; }
    this.db.add('counselling_logs', {
      id:'CL'+Date.now(), counsellorId:'ADM-C1', counsellorName:'Dr. Prathap Rao',
      patientId:userId, patientName:u.name, type,
      notes, recommendations:recText?recText.split(',').map(s=>s.trim()).filter(Boolean):[],
      nextFollowup:followup||null, createdAt:new Date().toISOString()
    });
    document.getElementById('modal-root').innerHTML='';
    this.toast('Consultation note saved ✅');
    location.hash = '#/admin-counsellor/patients';
  },

  counsellorLogs() {
    const logs = this.db.get('counselling_logs').reverse();
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📝 Counselling Logs</h2>
    <div class="timeline">
      ${logs.map(l=>`
        <div class="tl-item done">
          <div class="tl-dot done">📝</div>
          <div class="tl-body" style="flex:1">
            <div class="card" style="padding:var(--s-4)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--s-2)">
                <div><h4>${l.patientName}</h4><div style="font-size:11px;color:var(--text-muted)">${l.type.replace('_',' ')} · ${new Date(l.createdAt).toLocaleString('en-IN')}</div></div>
                ${l.nextFollowup?`<span class="badge badge-w">Follow-up: ${l.nextFollowup}</span>`:''}
              </div>
              <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--s-3)">${l.notes}</p>
              ${l.recommendations?.length?`<div style="display:flex;gap:var(--s-2);flex-wrap:wrap">${l.recommendations.map(r=>`<span class="badge badge-i">${r}</span>`).join('')}</div>`:''}
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  },

  counsellorSchedule() {
    const logs = this.db.get('counselling_logs').filter(l=>l.nextFollowup);
    return `<h2 style="font-size:var(--text-xl);margin-bottom:var(--s-4)">📅 Follow-up Schedule</h2>
    ${logs.length===0?`<div style="text-align:center;padding:var(--s-16)"><div style="font-size:48px">📅</div><h3>No follow-ups scheduled</h3></div>`:''}
    ${logs.sort((a,b)=>new Date(a.nextFollowup)-new Date(b.nextFollowup)).map(l=>`
      <div class="card" style="margin-bottom:var(--s-3);padding:var(--s-4)">
        <div style="display:flex;align-items:center;gap:var(--s-3)">
          <div style="width:52px;height:52px;background:rgba(139,92,246,.1);border-radius:var(--r-md);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
            <div style="font-size:var(--text-base);font-weight:800;color:#8B5CF6">${new Date(l.nextFollowup).getDate()}</div>
            <div style="font-size:10px;color:#8B5CF6">${new Date(l.nextFollowup).toLocaleString('en-IN',{month:'short'})}</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:600">${l.patientName}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary)">${l.type.replace('_',' ')} follow-up</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${l.notes.substring(0,60)}...</div>
          </div>
          <button class="btn btn-p btn-sm" onclick="A.showAddLog('${l.patientId}')">+ Note</button>
        </div>
      </div>`).join('')}`;
  },

}); // end admin mixin
