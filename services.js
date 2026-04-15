// =====================================================================
// DORMEDS 3.0 — BPT & Lab Services
// Physiotherapy booking, Lab test booking, Reports
// =====================================================================

Object.assign(DormedsApp.prototype, {

  // ===== SERVICES HUB =====
  cServices() {
    const { active, plan } = this.db.checkSubscription('U1');
    const bptBookings = this.db.get('bpt_bookings').filter(b => b.userId === 'U1');
    const labBookings = this.db.get('lab_bookings').filter(b => b.userId === 'U1');

    return `<div class="c-home">
      <div style="margin-bottom:var(--s-5)">
        <h2 style="font-size:var(--text-xl);margin-bottom:var(--s-1)">🏥 Healthcare Services</h2>
        <p style="color:var(--text-secondary);font-size:var(--text-sm)">Book physiotherapy sessions, lab tests, and more from home.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--s-4);margin-bottom:var(--s-6)">
        <div class="service-tile" onclick="${active&&plan?.id==='SP2'?`location.hash='#/customer/bptbook'`:`A.showFeatureLock('bpt')`}" style="background:linear-gradient(135deg,#1E40AF,#3B82F6);border-radius:var(--r-xl);padding:var(--s-6);cursor:pointer;position:relative;overflow:hidden">
          <div style="position:absolute;top:-10px;right:-10px;font-size:80px;opacity:.12">🦴</div>
          ${!active||plan?.id!=='SP2'?`<div class="sub-lock-badge">🔒 Premium</div>`:'<div class="sub-lock-badge" style="background:#22C55E">✅ Included</div>'}
          <div style="font-size:40px;margin-bottom:var(--s-3)">🧘</div>
          <h3 style="color:#fff;margin-bottom:var(--s-1)">Physiotherapy</h3>
          <p style="color:rgba(255,255,255,.8);font-size:var(--text-sm);margin-bottom:var(--s-3)">Home & clinic BPT sessions by certified therapists</p>
          <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
            <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;padding:4px 10px;border-radius:var(--r-full)">From ₹500/session</span>
            <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;padding:4px 10px;border-radius:var(--r-full)">Home Visit Available</span>
          </div>
        </div>
        <div class="service-tile" onclick="location.hash='#/customer/labbook'" style="background:linear-gradient(135deg,#14532D,#16A34A);border-radius:var(--r-xl);padding:var(--s-6);cursor:pointer;position:relative;overflow:hidden">
          <div style="position:absolute;top:-10px;right:-10px;font-size:80px;opacity:.12">🔬</div>
          <div class="sub-lock-badge" style="background:#22C55E">${active?'Priority Slots':'Open Access'}</div>
          <div style="font-size:40px;margin-bottom:var(--s-3)">🧪</div>
          <h3 style="color:#fff;margin-bottom:var(--s-1)">Lab Tests</h3>
          <p style="color:rgba(255,255,255,.8);font-size:var(--text-sm);margin-bottom:var(--s-3)">Blood tests, X-rays, and more with home sample collection</p>
          <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
            <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;padding:4px 10px;border-radius:var(--r-full)">From ₹200</span>
            <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;padding:4px 10px;border-radius:var(--r-full)">Home Collection</span>
          </div>
        </div>
      </div>

      ${bptBookings.length?`
      <div class="sec-h"><h3>🧘 My BPT Sessions</h3><span class="see-all" onclick="location.hash='#/customer/bptbook'">Book More</span></div>
      ${bptBookings.map(b=>`
        <div class="card" style="margin-bottom:var(--s-3);padding:var(--s-4)">
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#1E40AF,#3B82F6);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🧘</div>
            <div style="flex:1">
              <div style="font-weight:600">${b.therapist}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary)">${b.day} · ${b.slot} · ${b.visitType==='home'?'🏠 Home Visit':'🏥 Clinic'}</div>
              <div style="font-size:11px;color:var(--text-muted)">Condition: ${b.condition}</div>
            </div>
            <div style="text-align:right">
              <span class="badge ${b.status==='confirmed'?'badge-s':'badge-w'}">${b.status}</span>
              <div style="font-size:var(--text-sm);font-weight:700;margin-top:4px">${b.usedCredit?'<span style="color:var(--success)">Free (Credit)</span>':'₹'+b.price}</div>
            </div>
          </div>
        </div>`).join('')}
      `:''}

      ${labBookings.length?`
      <div class="sec-h" style="margin-top:var(--s-2)"><h3>🧪 My Lab Tests</h3><span class="see-all" onclick="location.hash='#/customer/labbook'">Book More</span></div>
      ${labBookings.map(b=>`
        <div class="card" style="margin-bottom:var(--s-3);padding:var(--s-4)">
          <div style="display:flex;align-items:center;gap:var(--s-3)">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#14532D,#16A34A);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🧪</div>
            <div style="flex:1">
              <div style="font-weight:600">${b.testName}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary)">${b.bookingDate} · ${b.slot} · ${b.homeCollection?'🏠 Home Collection':'🏥 Visit Lab'}</div>
            </div>
            <div style="text-align:right">
              <span class="badge ${b.status==='confirmed'?'badge-s':'badge-w'}">${b.status}</span>
              <div style="font-size:var(--text-sm);font-weight:700;margin-top:4px">₹${b.price}</div>
              ${b.reportUrl?`<button class="btn btn-s btn-sm" style="margin-top:var(--s-2)" onclick="A.downloadReport('${b.id}')">📄 Report</button>`:''}
            </div>
          </div>
        </div>`).join('')}
      `:''}
    </div>`;
  },

  // ===== BPT BOOKING SCREEN =====
  cBptBook() {
    const sessions = this.db.get('bpt_sessions');
    const { active, plan, bptCredits } = this.db.checkSubscription('U1');
    const canUseCredit = active && plan?.id === 'SP2' && bptCredits > 0;

    return `<div class="c-home">
      <h2 style="font-size:var(--text-xl);margin-bottom:var(--s-2)">🧘 Book Physiotherapy Session</h2>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-5)">Certified BPT therapists · Home & clinic visits available</p>
      ${canUseCredit?`<div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-5);display:flex;align-items:center;gap:var(--s-3)">
        <div style="font-size:24px">⭐</div>
        <div><div style="font-weight:600;color:var(--primary)">You have ${bptCredits} free session${bptCredits>1?'s':''}</div>
          <div style="font-size:11px;color:var(--text-muted)">Premium benefit · Use credits to book for free</div></div>
      </div>`:''}

      <div class="card" style="padding:var(--s-5);margin-bottom:var(--s-4)">
        <h4 style="margin-bottom:var(--s-4)">📋 Session Details</h4>

        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;display:block">CONDITION / COMPLAINT</label>
          <input class="inp" id="bpt_condition" placeholder="e.g. Lower back pain, Shoulder stiffness, Sport injury"/>
        </div>

        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;display:block">VISIT TYPE</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)">
            <label class="visit-opt" id="vopt-home" onclick="A.selectVisitType('home')" style="border:2px solid var(--primary);border-radius:var(--r-lg);padding:var(--s-4);cursor:pointer;text-align:center;background:var(--primary-subtle)">
              <div style="font-size:28px;margin-bottom:var(--s-2)">🏠</div>
              <div style="font-weight:600;font-size:var(--text-sm)">Home Visit</div>
              <div style="font-size:11px;color:var(--text-muted)">₹800/session</div>
            </label>
            <label class="visit-opt" id="vopt-clinic" onclick="A.selectVisitType('clinic')" style="border:2px solid var(--border);border-radius:var(--r-lg);padding:var(--s-4);cursor:pointer;text-align:center">
              <div style="font-size:28px;margin-bottom:var(--s-2)">🏥</div>
              <div style="font-weight:600;font-size:var(--text-sm)">Clinic Visit</div>
              <div style="font-size:11px;color:var(--text-muted)">₹500/session</div>
            </label>
          </div>
          <input type="hidden" id="bpt_visit_type" value="home"/>
        </div>

        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;display:block">SELECT DAY & SLOT</label>
          <div style="overflow-x:auto;display:flex;gap:var(--s-2);padding-bottom:var(--s-2);margin-bottom:var(--s-3)">
            ${sessions.map((s,i)=>`<div class="day-tab ${i===0?'on':''}" id="day-${s.id}" onclick="A.selectDay('${s.id}')" style="flex-shrink:0;padding:var(--s-2) var(--s-4);border-radius:var(--r-full);border:1.5px solid ${i===0?'var(--primary)':'var(--border)'};cursor:pointer;font-size:var(--text-sm);font-weight:${i===0?'600':'400'};background:${i===0?'var(--primary-subtle)':'transparent'};white-space:nowrap">${s.day}</div>`).join('')}
          </div>
          <input type="hidden" id="bpt_day" value="${sessions[0]?.day}"/>
          <input type="hidden" id="bpt_therapist" value="${sessions[0]?.therapist}"/>
          <div id="slotGrid" class="slot-grid">
            ${sessions[0]?.slots.map(sl=>`<div class="slot-item" onclick="A.selectSlot(this,'${sl}')">${sl}</div>`).join('')}
          </div>
          <input type="hidden" id="bpt_slot" value=""/>
        </div>

        ${canUseCredit?`
        <div style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3);background:var(--primary-subtle);border-radius:var(--r-md);margin-bottom:var(--s-4)">
          <input type="checkbox" id="useCredit" style="width:18px;height:18px" checked/>
          <label for="useCredit" style="font-size:var(--text-sm);font-weight:600;color:var(--primary);cursor:pointer">Use 1 Premium Credit (Free Session)</label>
        </div>`:''}
      </div>

      <button class="btn btn-p btn-block btn-lg" onclick="A.confirmBptBooking()">
        🧘 Confirm Booking
      </button>
    </div>`;
  },

  selectVisitType(type) {
    document.getElementById('bpt_visit_type').value = type;
    document.getElementById('vopt-home').style.border = type==='home'?'2px solid var(--primary)':'2px solid var(--border)';
    document.getElementById('vopt-home').style.background = type==='home'?'var(--primary-subtle)':'transparent';
    document.getElementById('vopt-clinic').style.border = type==='clinic'?'2px solid var(--primary)':'2px solid var(--border)';
    document.getElementById('vopt-clinic').style.background = type==='clinic'?'var(--primary-subtle)':'transparent';
  },

  selectDay(sessionId) {
    const sessions = this.db.get('bpt_sessions');
    const s = sessions.find(s=>s.id===sessionId);
    if (!s) return;
    document.getElementById('bpt_day').value = s.day;
    document.getElementById('bpt_therapist').value = s.therapist;
    sessions.forEach(ss => {
      const el = document.getElementById('day-'+ss.id);
      if (el) { el.style.borderColor=ss.id===sessionId?'var(--primary)':'var(--border)'; el.style.background=ss.id===sessionId?'var(--primary-subtle)':'transparent'; el.style.fontWeight=ss.id===sessionId?'600':'400'; }
    });
    document.getElementById('slotGrid').innerHTML = s.slots.map(sl=>`<div class="slot-item" onclick="A.selectSlot(this,'${sl}')">${sl}</div>`).join('');
    document.getElementById('bpt_slot').value = '';
  },

  selectSlot(el, slot) {
    document.querySelectorAll('.slot-item').forEach(e=>e.classList.remove('on'));
    el.classList.add('on');
    document.getElementById('bpt_slot').value = slot;
  },

  confirmBptBooking() {
    const condition = document.getElementById('bpt_condition')?.value?.trim();
    const day = document.getElementById('bpt_day')?.value;
    const slot = document.getElementById('bpt_slot')?.value;
    const visitType = document.getElementById('bpt_visit_type')?.value || 'home';
    const useCredit = document.getElementById('useCredit')?.checked;
    const therapist = document.getElementById('bpt_therapist')?.value;
    if (!condition) { this.toast('Please describe your condition', 'error'); return; }
    if (!slot) { this.toast('Please select a time slot', 'error'); return; }
    const price = visitType === 'home' ? 800 : 500;
    const now = new Date();
    this.db.add('bpt_bookings', {
      id: 'BB'+Date.now(), userId:'U1', day, slot, visitType, therapist,
      condition, price: useCredit?0:price, status:'confirmed',
      address:'42, Sector 15, Noida, UP 201301', usedCredit:!!useCredit,
      createdAt:now.toISOString(), sessionDate: 'Upcoming '+day
    });
    if (useCredit) {
      const sub = this.db.get('subscriptions').find(s=>s.userId==='U1'&&s.status==='active');
      if (sub) this.db.update('subscriptions', sub.id, {bptUsed:(sub.bptUsed||0)+1});
    }
    this.toast(`✅ BPT Session booked for ${day} at ${slot}!`);
    location.hash = '#/customer/services';
  },

  // ===== LAB BOOKING SCREEN =====
  cLabBook() {
    const tests = this.db.get('lab_tests');
    const cats = [...new Set(tests.map(t=>t.category))];
    const { active } = this.db.checkSubscription('U1');

    return `<div class="c-home">
      <h2 style="font-size:var(--text-xl);margin-bottom:var(--s-2)">🧪 Book a Lab Test</h2>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-5)">Home sample collection available · Results in 12–48 hrs</p>

      ${cats.map(cat=>`
        <div class="sec-h"><h3>${cat}</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--s-3);margin-bottom:var(--s-5)">
          ${tests.filter(t=>t.category===cat).map(t=>`
            <div class="card" style="padding:var(--s-4);cursor:pointer" onclick="A.showLabBookModal('${t.id}')">
              <div style="display:flex;align-items:center;gap:var(--s-3)">
                <div style="font-size:28px;width:48px;height:48px;background:var(--success-bg);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">${t.icon}</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:var(--text-sm)">${t.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Report in ${t.reportTime} ${t.homeCollection?'· 🏠 Home Collection':''}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;color:var(--primary)">₹${t.price}</div>
                  ${active?`<div style="font-size:10px;color:var(--success)">Priority</div>`:''}
                </div>
              </div>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
  },

  showLabBookModal(testId) {
    const t = this.db.getOne('lab_tests', testId);
    if (!t) return;
    const slots = ['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM'];
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    document.getElementById('modal-root').innerHTML = `
      <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:420px">
        <div class="modal-h"><h3>${t.icon} Book ${t.name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
        <div class="modal-b">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--s-4);background:var(--bg-surface);padding:var(--s-3);border-radius:var(--r-md)">
            <span style="font-size:var(--text-sm);color:var(--text-secondary)">Test Price</span>
            <span style="font-weight:700">₹${t.price}${t.homeCollection?` + ₹50 home collection`:''}</span>
          </div>
          ${t.homeCollection?`
          <div style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:var(--s-4);padding:var(--s-3);border:1.5px solid var(--border);border-radius:var(--r-md)">
            <input type="checkbox" id="homeCol" style="width:18px;height:18px" checked/>
            <label for="homeCol" style="font-size:var(--text-sm);cursor:pointer">🏠 Home sample collection (+₹50)</label>
          </div>`:``}
          <div class="inp-grp" style="margin-bottom:var(--s-4)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;display:block">DATE</label>
            <input class="inp" type="date" id="labDate" value="${tomorrow.toISOString().split('T')[0]}" min="${tomorrow.toISOString().split('T')[0]}"/>
          </div>
          <div class="inp-grp" style="margin-bottom:var(--s-4)">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;display:block">TIME SLOT</label>
            <div class="slot-grid" style="grid-template-columns:repeat(3,1fr)">
              ${slots.map(sl=>`<div class="slot-item" onclick="A.selectSlot(this,'${sl}')">${sl}</div>`).join('')}
            </div>
            <input type="hidden" id="bpt_slot" value=""/>
          </div>
        </div>
        <div class="modal-f">
          <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
          <button class="btn btn-p" onclick="A.confirmLabBooking('${testId}')">Confirm Booking</button>
        </div>
      </div></div>`;
  },

  confirmLabBooking(testId) {
    const t = this.db.getOne('lab_tests', testId);
    const date = document.getElementById('labDate')?.value;
    const slot = document.getElementById('bpt_slot')?.value;
    const homeCol = document.getElementById('homeCol')?.checked;
    if (!slot) { this.toast('Please select a time slot', 'error'); return; }
    const price = t.price + (homeCol && t.homeCollection ? 50 : 0);
    this.db.add('lab_bookings', {
      id:'LB'+Date.now(), userId:'U1', testId, testName:t.name,
      homeCollection:!!homeCol, slot, bookingDate:date, price,
      status:'confirmed', address:'42, Sector 15, Noida, UP 201301', reportUrl:null,
      createdAt:new Date().toISOString()
    });
    document.getElementById('modal-root').innerHTML = '';
    this.toast(`✅ Lab test booked for ${date} at ${slot}!`);
    location.hash = '#/customer/services';
  },

  downloadReport(bookingId) {
    const b = this.db.getOne('lab_bookings', bookingId);
    if (!b?.reportUrl) { this.toast('Report not yet available', 'info'); return; }
    this.toast('Downloading report...', 'info');
  },

  showFeatureLock(feature) {
    const featureNames = { bpt:'Physiotherapy (BPT) Sessions', counsellor:'Patient Counsellor', health_reports:'Health Reports' };
    document.getElementById('modal-root').innerHTML = `
      <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:360px;text-align:center">
        <div class="modal-b" style="padding:var(--s-8) var(--s-6)">
          <div style="font-size:48px;margin-bottom:var(--s-4)">🔒</div>
          <h3 style="margin-bottom:var(--s-2)">Premium Feature</h3>
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-5)">${featureNames[feature]||'This feature'} is available exclusively for Premium subscribers.</p>
          <button class="btn btn-p btn-block" onclick="document.getElementById('modal-root').innerHTML='';location.hash='#/customer/subscription'">⭐ Upgrade to Premium</button>
          <button class="btn btn-g btn-block" style="margin-top:var(--s-2)" onclick="document.getElementById('modal-root').innerHTML=''">Maybe Later</button>
        </div>
      </div></div>`;
  },

}); // end services mixin
