// =====================================================================
// DORMEDS 3.0 — Subscription System
// Plans, Billing UI, Feature Gating, Customer Subscription Screens
// =====================================================================

// Mixin: attach subscription methods to DormedsApp
Object.assign(DormedsApp.prototype, {

  // ===== SUBSCRIPTION SCREEN =====
  cSubscription() {
    const { active, plan, sub, daysLeft, expired, bptCredits } = this.db.checkSubscription('U1');
    const plans = this.db.get('subscription_plans');

    const activeCard = active ? `
      <div class="sub-active-card" style="background:linear-gradient(135deg,${plan.color}22,${plan.color}11);border:1px solid ${plan.color}44;border-radius:var(--r-xl);padding:var(--s-6);margin-bottom:var(--s-6);position:relative;overflow:hidden">
        <div style="position:absolute;top:-20px;right:-20px;font-size:80px;opacity:.08">${plan.icon}</div>
        <div style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:var(--s-4)">
          <div style="background:${plan.color};border-radius:var(--r-md);padding:8px 14px;font-size:var(--text-sm);font-weight:700;color:#fff">${plan.icon} ${plan.name} Plan</div>
          <span class="badge badge-s">ACTIVE</span>
        </div>
        <div style="font-size:var(--text-2xl);font-weight:800;margin-bottom:var(--s-2)">₹${sub.amount}<span style="font-size:var(--text-sm);font-weight:400;color:var(--text-muted)">/month</span></div>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-bottom:var(--s-4)">
          Renews on ${new Date(sub.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} · <strong style="color:${daysLeft<=5?'var(--warning)':'var(--success)'}"> ${daysLeft} days left</strong>
        </div>
        ${plan.id==='SP2'?`<div style="display:flex;gap:var(--s-3);flex-wrap:wrap">
          <div style="background:var(--bg-surface);border-radius:var(--r-md);padding:var(--s-3) var(--s-4);text-align:center">
            <div style="font-size:var(--text-xl);font-weight:800;color:var(--primary)">${bptCredits}</div>
            <div style="font-size:11px;color:var(--text-muted)">BPT Credits Left</div>
          </div>
          <div style="background:var(--bg-surface);border-radius:var(--r-md);padding:var(--s-3) var(--s-4);text-align:center">
            <div style="font-size:var(--text-xl);font-weight:800;color:#8B5CF6">∞</div>
            <div style="font-size:11px;color:var(--text-muted)">Lab Priority Slots</div>
          </div>
        </div>`:``}
        <div style="display:flex;gap:var(--s-3);margin-top:var(--s-4);flex-wrap:wrap">
          <button class="btn btn-g btn-sm" onclick="A.cancelSubscription()">Cancel Plan</button>
          ${plan.id==='SP1'?`<button class="btn btn-p btn-sm" onclick="A.showUpgradeModal()">⭐ Upgrade to Premium</button>`:''}
          <button class="btn btn-s btn-sm" onclick="A.toast('Auto-renew '+(${sub.autoRenew}?'disabled':'enabled'),'info')">
            ${sub.autoRenew?'Disable':'Enable'} Auto-renew
          </button>
        </div>
      </div>` : `
      <div class="card card-i" style="padding:var(--s-5);margin-bottom:var(--s-6);text-align:center">
        <div style="font-size:40px;margin-bottom:var(--s-3)">💊</div>
        <h3 style="margin-bottom:var(--s-2)">No Active Subscription</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-4)">Subscribe to unlock free delivery, discounts, and healthcare services.</p>
      </div>`;

    return `<div class="c-home">
      <h2 style="font-size:var(--text-xl);margin-bottom:var(--s-6)">💳 My Subscription</h2>
      ${activeCard}
      <div class="sec-h"><h3>Available Plans</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--s-4);margin-bottom:var(--s-6)">
        ${plans.map(p => `
          <div class="sub-plan-card ${active&&sub?.planId===p.id?'current':''}" style="border:2px solid ${active&&sub?.planId===p.id?p.color:'var(--border)'};border-radius:var(--r-xl);padding:var(--s-6);position:relative;background:var(--bg-card)">
            ${p.popular?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${p.color};color:#fff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:var(--r-full);white-space:nowrap">✨ MOST POPULAR</div>`:''}
            <div style="font-size:32px;margin-bottom:var(--s-3)">${p.icon}</div>
            <h3 style="font-size:var(--text-lg);color:${p.color};margin-bottom:var(--s-1)">${p.name}</h3>
            <div style="font-size:var(--text-3xl);font-weight:900;margin-bottom:var(--s-1)">₹${p.price}<span style="font-size:var(--text-sm);font-weight:400;color:var(--text-muted)">/mo</span></div>
            <div style="height:1px;background:var(--border);margin:var(--s-4) 0"></div>
            <ul style="list-style:none;margin-bottom:var(--s-5)">
              ${p.benefits.map(b=>`<li style="display:flex;align-items:center;gap:var(--s-2);padding:var(--s-2) 0;font-size:var(--text-sm)"><span style="color:var(--success);font-size:16px">✓</span>${b}</li>`).join('')}
            </ul>
            ${active&&sub?.planId===p.id
              ?`<button class="btn btn-g btn-block" disabled>✅ Current Plan</button>`
              :active&&p.id==='SP1'?`<button class="btn btn-g btn-block" disabled>On Higher Plan</button>`
              :`<button class="btn btn-block" style="background:${p.color};color:#fff;font-weight:700" onclick="A.subscribePlan('${p.id}')">
                ${active?'Switch Plan':'Subscribe Now'} →
              </button>`}
          </div>`).join('')}
      </div>
      <div class="card" style="padding:var(--s-5)">
        <h4 style="margin-bottom:var(--s-4)">📋 Subscription History</h4>
        ${this.db.get('subscriptions').filter(s=>s.userId==='U1').map(s=>`
          <div class="dl-item">
            <div class="dl-av" style="background:${s.planId==='SP2'?'#8B5CF6':'var(--primary)'}">${s.planId==='SP2'?'⭐':'💊'}</div>
            <div style="flex:1"><div style="font-weight:600;font-size:var(--text-sm)">${s.planName} Plan</div>
              <div style="font-size:11px;color:var(--text-muted)">${new Date(s.startDate).toLocaleDateString('en-IN')} → ${new Date(s.endDate).toLocaleDateString('en-IN')}</div>
            </div>
            <span class="badge ${s.status==='active'?'badge-s':s.status==='expired'?'badge-e':'badge-n'}">${s.status}</span>
          </div>`).join('')}
      </div>
    </div>`;
  },

  subscribePlan(planId) {
    const plan = this.db.getOne('subscription_plans', planId);
    if (!plan) return;
    // Show payment modal
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `
      <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:420px">
        <div class="modal-h"><h3>💳 Subscribe to ${plan.name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
        <div class="modal-b">
          <div style="background:linear-gradient(135deg,${plan.color}22,${plan.color}11);border:1px solid ${plan.color}44;border-radius:var(--r-lg);padding:var(--s-4);margin-bottom:var(--s-5)">
            <div style="font-size:var(--text-2xl);font-weight:800">₹${plan.price}<span style="font-size:var(--text-sm);font-weight:400;color:var(--text-muted)">/month</span></div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary)">Billed monthly · Cancel anytime</div>
          </div>
          <div style="margin-bottom:var(--s-4)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">PAYMENT METHOD</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2)">
              ${['UPI','Credit Card','Debit Card','Net Banking'].map((m,i)=>`
                <label style="display:flex;align-items:center;gap:var(--s-2);padding:var(--s-3);border:1.5px solid ${i===0?'var(--primary)':'var(--border)'};border-radius:var(--r-md);cursor:pointer;font-size:var(--text-sm)">
                  <input type="radio" name="payMethod" value="${m}" ${i===0?'checked':''}/>${m}
                </label>`).join('')}
            </div>
          </div>
          <div class="inp-grp" style="margin-bottom:var(--s-4)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">UPI ID</label>
            <input class="inp" id="upiId" placeholder="yourname@upi" value="rahul@ybl"/>
          </div>
        </div>
        <div class="modal-f">
          <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
          <button class="btn btn-p" onclick="A.confirmSubscription('${planId}')">Pay ₹${plan.price} & Subscribe</button>
        </div>
      </div></div>`;
  },

  confirmSubscription(planId) {
    const plan = this.db.getOne('subscription_plans', planId);
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    const existing = this.db.get('subscriptions').find(s=>s.userId==='U1'&&s.status==='active');
    if (existing) this.db.update('subscriptions', existing.id, {status:'cancelled'});
    this.db.add('subscriptions', {
      id: 'SUB' + Date.now(), userId:'U1', planId, planName:plan.name,
      status:'active', startDate:now.toISOString().split('T')[0],
      endDate:end.toISOString().split('T')[0], autoRenew:true,
      bptCredits:planId==='SP2'?2:0, bptUsed:0, payMethod:'UPI', amount:plan.price,
      createdAt:now.toISOString()
    });
    document.getElementById('modal-root').innerHTML='';
    this.toast(`🎉 Subscribed to ${plan.name}! Enjoy your benefits.`);
    location.hash = '#/customer/subscription';
  },

  cancelSubscription() {
    const sub = this.db.get('subscriptions').find(s=>s.userId==='U1'&&s.status==='active');
    if (!sub) return;
    if (confirm('Cancel your subscription? You will lose access at end of billing period.')) {
      this.db.update('subscriptions', sub.id, {status:'cancelled', autoRenew:false});
      this.toast('Subscription cancelled. Active until '+sub.endDate, 'warning');
      location.hash = '#/customer/subscription';
    }
  },

  showUpgradeModal() { this.subscribePlan('SP2'); },

  // Subscription banner for home screen
  getSubBanner() {
    const { active, plan, daysLeft } = this.db.checkSubscription('U1');
    if (!active) return `
      <div class="sub-banner" onclick="location.hash='#/customer/subscription'" style="background:linear-gradient(135deg,var(--primary),#8B5CF6);border-radius:var(--r-xl);padding:var(--s-4) var(--s-5);margin-bottom:var(--s-5);cursor:pointer;display:flex;align-items:center;gap:var(--s-4)">
        <div style="font-size:32px">💎</div>
        <div style="flex:1"><div style="font-weight:700;color:#fff">Unlock Premium Benefits</div><div style="font-size:var(--text-sm);color:rgba(255,255,255,.8)">Free delivery · BPT · Labs from ₹199/mo</div></div>
        <div style="color:#fff;font-weight:700">→</div>
      </div>`;
    if (daysLeft <= 5) return `
      <div class="sub-banner" onclick="location.hash='#/customer/subscription'" style="background:linear-gradient(135deg,var(--warning),#F97316);border-radius:var(--r-xl);padding:var(--s-4) var(--s-5);margin-bottom:var(--s-5);cursor:pointer;display:flex;align-items:center;gap:var(--s-4)">
        <div style="font-size:32px">⚠️</div>
        <div style="flex:1"><div style="font-weight:700;color:#fff">Plan Expiring in ${daysLeft} days</div><div style="font-size:var(--text-sm);color:rgba(255,255,255,.8)">${plan.name} Plan · Tap to renew</div></div>
        <div style="color:#fff;font-weight:700">Renew →</div>
      </div>`;
    return `
      <div class="sub-banner" onclick="location.hash='#/customer/subscription'" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-xl);padding:var(--s-3) var(--s-5);margin-bottom:var(--s-4);cursor:pointer;display:flex;align-items:center;gap:var(--s-3)">
        <span style="font-size:20px">${plan.icon}</span>
        <div style="flex:1;font-size:var(--text-sm)"><strong>${plan.name} Plan</strong> · Active <span style="color:var(--text-muted)">${daysLeft} days left</span></div>
        <span class="badge badge-s">ACTIVE</span>
      </div>`;
  },

}); // end subscriptions mixin
