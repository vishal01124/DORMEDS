// =====================================================================
// DORMEDS 3.0 — Reminders, Health Profile, Notifications, Loyalty
// Boot-time reminder checks, notification center, vitals tracker
// =====================================================================

Object.assign(DormedsApp.prototype, {

  // =====================================================
  // BOOT HOOKS — called from init()
  // =====================================================
  _bootExtras() {
    // Check medicine reminders on load
    if (this.user?.id === 'U1' || this.role === 'customer') {
      const overdue = this.db.checkReminders('U1');
      overdue.forEach(r => {
        setTimeout(() => {
          this.toast(`💊 Reminder: Take ${r.medName} now! (${r.note || r.time})`, 'info');
        }, 2500);
      });
    }
    // Update notification badge
    this._updateNotifBadge();
  },

  _updateNotifBadge() {
    const count = this.db.unreadCount('U1');
    const badges = document.querySelectorAll('.notif-badge-live');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // =====================================================
  // NOTIFICATION CENTER
  // =====================================================
  showNotificationPanel() {
    const notifs = this.db.get('notifications').filter(n => n.userId === 'U1').reverse();
    const unread = notifs.filter(n => !n.read).length;

    const typeColors = {
      order: 'var(--primary)', subscription: '#8B5CF6',
      health: 'var(--success)', offer: 'var(--warning)', system: 'var(--text-muted)'
    };

    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="notif-panel" onclick="event.stopPropagation()">
      <div class="notif-panel-head">
        <div>
          <h3>Notifications</h3>
          ${unread > 0 ? `<span class="badge badge-p" style="margin-left:8px">${unread} new</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${unread > 0 ? `<button class="btn btn-g btn-sm" onclick="A.markAllNotifsRead()">Mark all read</button>` : ''}
          <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
        </div>
      </div>
      <div class="notif-panel-body">
        ${notifs.length === 0 ? `<div style="text-align:center;padding:var(--s-16)"><div style="font-size:48px;margin-bottom:var(--s-4)">🔔</div><h3>No notifications yet</h3></div>` : ''}
        ${notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="A.openNotif('${n.id}','${n.link}')">
          <div class="ni-icon" style="background:${typeColors[n.type] || 'var(--border)'}22;color:${typeColors[n.type] || 'var(--text-muted)'}">
            ${n.icon}
          </div>
          <div class="ni-body">
            <div class="ni-title">${n.title}</div>
            <div class="ni-desc">${n.body}</div>
            <div class="ni-time">${this._timeAgo(n.ts)}</div>
          </div>
          ${!n.read ? '<div class="ni-dot"></div>' : ''}
        </div>`).join('')}
      </div>
    </div>
    </div>`;
  },

  openNotif(id, link) {
    const notifs = this.db.get('notifications');
    const i = notifs.findIndex(n => n.id === id);
    if (i !== -1) { notifs[i].read = true; this.db.set('notifications', notifs); }
    document.getElementById('modal-root').innerHTML = '';
    if (link && link !== '#/') location.hash = link;
  },

  markAllNotifsRead() {
    this.db.markAllRead('U1');
    document.getElementById('modal-root').innerHTML = '';
    this._updateNotifBadge();
    this.toast('All notifications marked as read');
  },

  _timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  },

  // =====================================================
  // LOYALTY POINTS
  // =====================================================
  cLoyalty() {
    const balance = this.db.getLoyaltyBalance('U1');
    const ledger = this.db.get('loyalty_ledger').filter(l => l.userId === 'U1').reverse();
    const rupeeValue = Math.floor(balance / 10);
    const pct = Math.min(100, (balance % 100));

    return `
    <div style="padding:var(--s-4)">
      <div class="loyalty-hero">
        <div class="lh-icon">🪙</div>
        <div class="lh-coins">${balance.toLocaleString()}</div>
        <div class="lh-label">DORM Coins</div>
        <div class="lh-value">≈ ₹${rupeeValue} redeemable value</div>
        <div class="lh-progress-wrap">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.6);margin-bottom:6px">
            <span>${balance % 100} / 100 to next reward</span>
            <span>₹${rupeeValue + 1} next milestone</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,.2);border-radius:var(--r-full)">
            <div style="height:100%;width:${pct}%;background:#FCD34D;border-radius:var(--r-full);transition:width .5s"></div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4);margin-bottom:var(--s-6)">
        <div class="card" style="padding:var(--s-4);text-align:center">
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--primary)">${ledger.filter(l=>l.type==='earn').length}</div>
          <div style="font-size:var(--text-sm);color:var(--text-muted)">Times Earned</div>
        </div>
        <div class="card" style="padding:var(--s-4);text-align:center">
          <div style="font-size:var(--text-2xl);font-weight:800;color:var(--success)">₹${rupeeValue}</div>
          <div style="font-size:var(--text-sm);color:var(--text-muted)">Redeemable Now</div>
        </div>
      </div>

      ${balance >= 100 ? `
      <div class="card card-i" style="padding:var(--s-4);margin-bottom:var(--s-4);display:flex;align-items:center;gap:var(--s-3)">
        <div style="font-size:32px">🎁</div>
        <div style="flex:1">
          <div style="font-weight:600;color:var(--primary)">You can redeem ${Math.floor(balance/100)*100} coins!</div>
          <div style="font-size:var(--text-sm);color:var(--text-muted)">= ₹${Math.floor(balance/10)} off your next order</div>
        </div>
        <button class="btn btn-p btn-sm" onclick="A.redeemCoinsNow()">Redeem →</button>
      </div>` : `
      <div class="card" style="padding:var(--s-4);margin-bottom:var(--s-4);display:flex;align-items:center;gap:var(--s-3)">
        <div style="font-size:32px">🎯</div>
        <div>
          <div style="font-weight:600">Need ${100 - (balance % 100)} more coins</div>
          <div style="font-size:var(--text-sm);color:var(--text-muted)">to unlock ₹${Math.floor((balance + 100 - (balance%100))/10)} discount</div>
        </div>
      </div>`}

      <div class="sec-h"><h3>Coin History</h3></div>
      ${ledger.map(l => `
      <div class="dl-item" style="margin-bottom:var(--s-2)">
        <div class="dl-av" style="background:${l.type==='earn'?'var(--success-bg)':'var(--error-bg)'}">
          <span style="color:${l.type==='earn'?'var(--success)':'var(--error)'}">${l.type==='earn'?'↑':'↓'}</span>
        </div>
        <div style="flex:1">
          <div style="font-size:var(--text-sm);font-weight:600">${l.desc}</div>
          <div style="font-size:11px;color:var(--text-muted)">${new Date(l.ts).toLocaleDateString('en-IN')}</div>
        </div>
        <div style="font-weight:700;color:${l.type==='earn'?'var(--success)':'var(--error)'}">
          ${l.type==='earn'?'+':'−'}${l.amount} 🪙
        </div>
      </div>`).join('')}
    </div>`;
  },

  redeemCoinsNow() {
    const balance = this.db.getLoyaltyBalance('U1');
    const redeemable = Math.floor(balance / 100) * 100;
    if (redeemable === 0) { this.toast('Not enough coins to redeem', 'warning'); return; }
    const savings = Math.floor(redeemable / 10);
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:360px;text-align:center">
      <div class="modal-b" style="padding:var(--s-8) var(--s-6)">
        <div style="font-size:56px;margin-bottom:var(--s-3)">🪙</div>
        <h3 style="margin-bottom:var(--s-2)">Redeem ${redeemable} Coins</h3>
        <p style="color:var(--text-secondary);margin-bottom:var(--s-6)">Get <strong style="color:var(--success)">₹${savings} off</strong> your next order. Applied at checkout automatically.</p>
        <button class="btn btn-p btn-block" onclick="A._confirmRedeemCoins(${redeemable})">✅ Redeem Now</button>
        <button class="btn btn-g btn-block" style="margin-top:var(--s-2)" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
      </div>
    </div></div>`;
  },

  _confirmRedeemCoins(coins) {
    const ok = this.db.redeemCoins('U1', coins);
    if (ok) {
      const discount = Math.floor(coins / 10);
      localStorage.setItem('dmed_coin_discount', discount);
      document.getElementById('modal-root').innerHTML = '';
      this.toast(`🎉 ₹${discount} coin discount applied to your next order!`, 'success');
      this.route();
    }
  },

  // =====================================================
  // MEDICINE REMINDERS UI
  // =====================================================
  cReminders() {
    const reminders = this.db.get('reminder_schedules').filter(r => r.userId === 'U1');
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    return `
    <div style="padding:var(--s-4)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-6)">
        <div>
          <h2 style="font-size:var(--text-xl)">⏰ Medicine Reminders</h2>
          <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:4px">Never miss a dose again</p>
        </div>
        <button class="btn btn-p btn-sm" onclick="A.showAddReminderModal()">+ Add Reminder</button>
      </div>

      <div id="reminder-list">
        ${reminders.length === 0 ? `
        <div style="text-align:center;padding:var(--s-16)">
          <div style="font-size:56px;margin-bottom:var(--s-4)">⏰</div>
          <h3>No reminders set</h3>
          <p style="color:var(--text-secondary);margin-top:var(--s-2)">Add reminders for your daily medicines</p>
          <button class="btn btn-p" style="margin-top:var(--s-6)" onclick="A.showAddReminderModal()">+ Set First Reminder</button>
        </div>` : ''}
        ${reminders.map(r => `
        <div class="reminder-card ${r.enabled ? '' : 'disabled'}">
          <div class="rc-left">
            <div class="rc-icon">${r.medIcon}</div>
            <div>
              <div class="rc-med">${r.medName}</div>
              <div class="rc-time">⏰ ${r.time} · ${r.frequency}</div>
              ${r.note ? `<div class="rc-note">📝 ${r.note}</div>` : ''}
              <div class="rc-days">${r.daysOfWeek.map(d => `<span class="rc-day">${d}</span>`).join('')}</div>
            </div>
          </div>
          <div class="rc-right">
            <label class="toggle" style="margin-bottom:8px">
              <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="A.toggleReminder('${r.id}',this.checked)"/>
              <div class="toggle-track"></div>
            </label>
            <button style="background:none;border:none;color:var(--error);font-size:18px;cursor:pointer;padding:4px" onclick="A.deleteReminder('${r.id}')">🗑</button>
          </div>
        </div>`).join('')}
      </div>

      <div class="card" style="margin-top:var(--s-6);padding:var(--s-5)">
        <h4 style="margin-bottom:var(--s-3)">💡 Reminder Tips</h4>
        <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.8">
          • Set reminders 15 minutes before mealtime for best adherence<br>
          • Enable browser notifications for alerts even when app is closed<br>
          • Use "After breakfast" / "At bedtime" notes for context
        </div>
      </div>
    </div>`;
  },

  showAddReminderModal() {
    const orders = this.db.get('orders').filter(o => o.uid === 'U1' && ['delivered','completed'].includes(o.status));
    const meds = [];
    orders.forEach(o => o.items.forEach(it => {
      if (!meds.find(m => m.id === it.mid)) {
        const med = this.db.getOne('medicines', it.mid);
        if (med) meds.push(med);
      }
    }));

    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:440px">
      <div class="modal-h"><h3>⏰ Add Medicine Reminder</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b">
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">MEDICINE</label>
          ${meds.length > 0
            ? `<select class="inp" id="rem_med">
                ${meds.map(m => `<option value="${m.id}" data-name="${m.name}" data-icon="${m.icon}">${m.icon} ${m.name}</option>`).join('')}
               </select>`
            : `<input class="inp" id="rem_med_name" placeholder="e.g. Becosules Z"/>`
          }
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3);margin-bottom:var(--s-4)">
          <div>
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">TIME</label>
            <input class="inp" type="time" id="rem_time" value="08:00"/>
          </div>
          <div>
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">FREQUENCY</label>
            <select class="inp" id="rem_freq">
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">NOTE (optional)</label>
          <input class="inp" id="rem_note" placeholder="e.g. After breakfast, With water"/>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveReminder(${meds.length > 0})">⏰ Set Reminder</button>
      </div>
    </div></div>`;
  },

  saveReminder(fromSelect) {
    const time = document.getElementById('rem_time')?.value;
    const freq = document.getElementById('rem_freq')?.value;
    const note = document.getElementById('rem_note')?.value;
    let medId, medName, medIcon;
    if (fromSelect) {
      const sel = document.getElementById('rem_med');
      const opt = sel?.selectedOptions[0];
      medId = sel?.value;
      medName = opt?.getAttribute('data-name') || sel?.value;
      medIcon = opt?.getAttribute('data-icon') || '💊';
    } else {
      medName = document.getElementById('rem_med_name')?.value?.trim();
      medId = 'M' + Date.now();
      medIcon = '💊';
    }
    if (!medName || !time) { this.toast('Fill all fields', 'error'); return; }
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    this.db.add('reminder_schedules', {
      id: 'RS' + Date.now(), userId: 'U1', medId, medName, medIcon,
      time, frequency: freq, daysOfWeek: days, enabled: true,
      note: note || '', createdAt: new Date().toISOString(), lastNotified: null
    });
    document.getElementById('modal-root').innerHTML = '';
    this.toast(`⏰ Reminder set for ${medName} at ${time}!`);
    this.route();
  },

  toggleReminder(id, enabled) {
    this.db.update('reminder_schedules', id, { enabled });
    this.toast(enabled ? 'Reminder enabled ✅' : 'Reminder paused ⏸');
  },

  deleteReminder(id) {
    if (!confirm('Remove this reminder?')) return;
    this.db.remove('reminder_schedules', id);
    this.toast('Reminder removed');
    this.route();
  },

  // =====================================================
  // HEALTH PROFILE — Vitals Tracker
  // =====================================================
  cHealthProfile() {
    const records = this.db.get('health_records').filter(r => r.userId === 'U1').reverse();
    const bp = records.filter(r => r.type === 'blood_pressure');
    const sugar = records.filter(r => r.type === 'blood_sugar');
    const weight = records.filter(r => r.type === 'weight');

    const latestBP = bp[0];
    const latestSugar = sugar[0];
    const latestWeight = weight[0];

    const bpStatus = latestBP
      ? (latestBP.systolic < 120 && latestBP.diastolic < 80 ? 'Normal' : latestBP.systolic < 130 ? 'Elevated' : 'High')
      : '—';
    const sugarStatus = latestSugar
      ? (latestSugar.value < 100 ? 'Normal' : latestSugar.value < 126 ? 'Pre-diabetic' : 'High')
      : '—';

    const bmiVal = latestWeight ? (latestWeight.value / (1.72 * 1.72)).toFixed(1) : null;
    const bmiStatus = bmiVal ? (bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Normal' : bmiVal < 30 ? 'Overweight' : 'Obese') : '—';

    const statusColor = s => s === 'Normal' ? 'var(--success)' : s === 'Elevated' || s === 'Pre-diabetic' || s === 'Overweight' ? 'var(--warning)' : s === '—' ? 'var(--text-muted)' : 'var(--error)';

    return `
    <div style="padding:var(--s-4)">
      <div style="margin-bottom:var(--s-6)">
        <h2 style="font-size:var(--text-xl)">❤️ My Health Profile</h2>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:4px">Track your vitals and health metrics</p>
      </div>

      <!-- Vitals Summary -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--s-3);margin-bottom:var(--s-6)">
        <div class="vital-card" onclick="A.showAddVitalModal('blood_pressure')">
          <div class="vc-icon" style="background:rgba(239,68,68,.1);color:#EF4444">❤️</div>
          <div class="vc-label">Blood Pressure</div>
          <div class="vc-val">${latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—'}</div>
          <div class="vc-unit">${latestBP ? 'mmHg' : 'Tap to add'}</div>
          <div class="vc-status" style="color:${statusColor(bpStatus)}">${bpStatus}</div>
        </div>
        <div class="vital-card" onclick="A.showAddVitalModal('blood_sugar')">
          <div class="vc-icon" style="background:rgba(59,130,246,.1);color:#3B82F6">🩸</div>
          <div class="vc-label">Blood Sugar</div>
          <div class="vc-val">${latestSugar ? latestSugar.value : '—'}</div>
          <div class="vc-unit">${latestSugar ? 'mg/dL' : 'Tap to add'}</div>
          <div class="vc-status" style="color:${statusColor(sugarStatus)}">${sugarStatus}</div>
        </div>
        <div class="vital-card" onclick="A.showAddVitalModal('weight')">
          <div class="vc-icon" style="background:rgba(245,158,11,.1);color:#F59E0B">⚖️</div>
          <div class="vc-label">Weight / BMI</div>
          <div class="vc-val">${latestWeight ? latestWeight.value : '—'}</div>
          <div class="vc-unit">${latestWeight ? `kg · BMI ${bmiVal}` : 'Tap to add'}</div>
          <div class="vc-status" style="color:${statusColor(bmiStatus)}">${bmiStatus}</div>
        </div>
      </div>

      <!-- BP Trend Chart -->
      ${bp.length > 1 ? `
      <div class="card" style="margin-bottom:var(--s-4)">
        <div class="card-head"><h3 style="font-size:var(--text-base)">❤️ Blood Pressure Trend</h3></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:var(--s-2);height:80px;padding-top:var(--s-4)">
            ${bp.slice(0,7).reverse().map(r => {
              const h = Math.round((r.systolic / 160) * 80);
              const color = r.systolic < 120 ? 'var(--success)' : r.systolic < 130 ? 'var(--warning)' : 'var(--error)';
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                <div style="font-size:9px;color:var(--text-muted)">${r.systolic}</div>
                <div style="width:100%;height:${h}px;background:${color};border-radius:3px 3px 0 0"></div>
                <div style="font-size:9px;color:var(--text-muted)">${new Date(r.ts).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</div>
              </div>`;
            }).join('')}
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:var(--s-3);display:flex;gap:var(--s-3)">
            <span>🟢 Normal <120</span><span>🟡 Elevated <130</span><span>🔴 High ≥130</span>
          </div>
        </div>
      </div>` : ''}

      <!-- Full History -->
      <div class="sec-h">
        <h3>Full History</h3>
        <button class="btn btn-p btn-sm" onclick="A.showAddVitalModal()">+ Add Reading</button>
      </div>
      ${records.length === 0 ? `<div style="text-align:center;padding:var(--s-8);color:var(--text-muted)">No records yet. Tap + Add Reading to start tracking!</div>` : ''}
      ${records.map(r => `
      <div class="dl-item" style="margin-bottom:var(--s-2)">
        <div class="dl-av" style="background:${r.type==='blood_pressure'?'rgba(239,68,68,.1)':r.type==='blood_sugar'?'rgba(59,130,246,.1)':'rgba(245,158,11,.1)'}">
          ${r.type==='blood_pressure'?'❤️':r.type==='blood_sugar'?'🩸':'⚖️'}
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:var(--text-sm)">
            ${r.type==='blood_pressure'? `${r.systolic}/${r.diastolic} mmHg` : `${r.value} ${r.unit}`}
            · <span style="font-weight:400;color:var(--text-muted)">${r.type.replace(/_/g,' ')}</span>
          </div>
          ${r.note ? `<div style="font-size:11px;color:var(--text-muted)">${r.note}</div>` : ''}
        </div>
        <div style="font-size:11px;color:var(--text-muted)">${new Date(r.ts).toLocaleDateString('en-IN')}</div>
      </div>`).join('')}
    </div>`;
  },

  showAddVitalModal(preType) {
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:400px">
      <div class="modal-h"><h3>❤️ Add Vital Reading</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b">
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">TYPE</label>
          <select class="inp" id="vital_type" onchange="A._updateVitalFields()">
            <option value="blood_pressure" ${preType==='blood_pressure'?'selected':''}>❤️ Blood Pressure</option>
            <option value="blood_sugar" ${preType==='blood_sugar'?'selected':''}>🩸 Blood Sugar</option>
            <option value="weight" ${preType==='weight'?'selected':''}>⚖️ Weight</option>
          </select>
        </div>
        <div id="vital-fields">
          ${preType === 'blood_pressure' || !preType ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3);margin-bottom:var(--s-4)">
            <div><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">SYSTOLIC (mmHg)</label><input class="inp" type="number" id="vital_sys" placeholder="120" min="60" max="220"/></div>
            <div><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">DIASTOLIC (mmHg)</label><input class="inp" type="number" id="vital_dia" placeholder="80" min="40" max="140"/></div>
          </div>` : preType === 'blood_sugar' ? `
          <div class="inp-grp" style="margin-bottom:var(--s-4)"><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">BLOOD SUGAR (mg/dL)</label><input class="inp" type="number" id="vital_val" placeholder="95"/></div>` : `
          <div class="inp-grp" style="margin-bottom:var(--s-4)"><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">WEIGHT (kg)</label><input class="inp" type="number" id="vital_val" placeholder="70"/></div>`}
        </div>
        <div class="inp-grp">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">NOTE (optional)</label>
          <input class="inp" id="vital_note" placeholder="e.g. Morning reading, after exercise"/>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveVital()">💾 Save Reading</button>
      </div>
    </div></div>`;
  },

  _updateVitalFields() {
    const type = document.getElementById('vital_type')?.value;
    const container = document.getElementById('vital-fields');
    if (!container) return;
    if (type === 'blood_pressure') {
      container.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3);margin-bottom:var(--s-4)"><div><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">SYSTOLIC</label><input class="inp" type="number" id="vital_sys" placeholder="120"/></div><div><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">DIASTOLIC</label><input class="inp" type="number" id="vital_dia" placeholder="80"/></div></div>`;
    } else {
      const label = type === 'blood_sugar' ? 'BLOOD SUGAR (mg/dL)' : 'WEIGHT (kg)';
      const ph = type === 'blood_sugar' ? '95' : '70';
      container.innerHTML = `<div class="inp-grp" style="margin-bottom:var(--s-4)"><label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">${label}</label><input class="inp" type="number" id="vital_val" placeholder="${ph}"/></div>`;
    }
  },

  saveVital() {
    const type = document.getElementById('vital_type')?.value;
    const note = document.getElementById('vital_note')?.value;
    const now = new Date();
    let record;
    if (type === 'blood_pressure') {
      const sys = parseInt(document.getElementById('vital_sys')?.value);
      const dia = parseInt(document.getElementById('vital_dia')?.value);
      if (!sys || !dia) { this.toast('Enter both systolic and diastolic', 'error'); return; }
      record = { id:'HR'+Date.now(), userId:'U1', type, systolic:sys, diastolic:dia, unit:'mmHg', recorded:now.toISOString().split('T')[0], note:note||'', ts:now.toISOString() };
    } else {
      const val = parseFloat(document.getElementById('vital_val')?.value);
      if (!val) { this.toast('Enter a value', 'error'); return; }
      record = { id:'HR'+Date.now(), userId:'U1', type, value:val, unit:type==='blood_sugar'?'mg/dL':'kg', recorded:now.toISOString().split('T')[0], note:note||'', ts:now.toISOString() };
    }
    this.db.add('health_records', record);
    document.getElementById('modal-root').innerHTML = '';
    this.toast('✅ Vital reading saved!');
    this.route();
  },

  // =====================================================
  // INVOICE / RECEIPT GENERATOR
  // =====================================================
  printInvoice(oid) {
    const o = this.db.getOne('orders', oid);
    if (!o) { this.toast('Order not found', 'error'); return; }
    const gst = Math.round(o.subtotal * 0.05);
    const win = window.open('', '_blank');
    win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <title>Invoice #${o.id} — DORMEDS</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Arial', sans-serif; padding: 32px; color: #111; background: #fff; max-width:700px; margin:0 auto; }
        .inv-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #3B82F6; }
        .inv-brand { font-size:28px; font-weight:900; color:#2563EB; }
        .inv-brand span { font-size:13px; font-weight:400; color:#666; display:block; margin-top:2px; }
        .inv-meta { text-align:right; font-size:13px; color:#666; }
        .inv-meta strong { font-size:16px; color:#111; }
        .inv-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
        .inv-box { background:#f8faff; border-radius:8px; padding:16px; }
        .inv-box h4 { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:#666; margin-bottom:8px; }
        .inv-box p { font-size:13px; color:#111; line-height:1.6; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
        th { background:#2563EB; color:#fff; padding:10px 12px; text-align:left; font-size:12px; }
        td { padding:10px 12px; font-size:13px; border-bottom:1px solid #eee; }
        tr:last-child td { border:none; }
        .total-row { background:#f8faff; font-weight:700; }
        .gst-note { font-size:11px; color:#666; margin-bottom:24px; }
        .summary { background:#f8faff; border-radius:8px; padding:16px; }
        .sum-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#555; }
        .sum-row.total { font-size:16px; font-weight:700; color:#111; border-top:1px solid #ddd; padding-top:12px; margin-top:4px; }
        .inv-footer { margin-top:40px; text-align:center; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:20px; }
        .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; }
        .badge-paid { background:#dcfce7; color:#15803d; }
        .badge-cod { background:#fef9c3; color:#854d0e; }
        @media print {
          body { padding: 16px; }
          button { display:none; }
        }
      </style>
    </head>
    <body>
      <div class="inv-header">
        <div>
          <div class="inv-brand">💊 DORMEDS<span>Fast Medicine Delivery Platform</span></div>
          <div style="font-size:12px;color:#666;margin-top:8px">GSTIN: 27AABCD1234E1Z5 · CIN: U74999MH2024PTC000001</div>
        </div>
        <div class="inv-meta">
          <strong>TAX INVOICE</strong>
          <div>Invoice# <strong>${o.id}</strong></div>
          <div>Date: ${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div>
          <span class="badge ${o.payStatus==='paid'?'badge-paid':'badge-cod'}">${o.payStatus==='paid'?'✅ PAID':'💵 CASH ON DELIVERY'}</span>
        </div>
      </div>

      <div class="inv-grid">
        <div class="inv-box">
          <h4>Billed To (Patient)</h4>
          <p><strong>${o.uName}</strong><br>${o.address}<br>GSTIN: Not applicable</p>
        </div>
        <div class="inv-box">
          <h4>Fulfilled By (Pharmacy)</h4>
          <p><strong>${o.phName}</strong><br>DORMEDS Registered Partner<br>Payment: ${o.payMethod}${o.emergency ? '<br><span style="color:#EF4444;font-weight:600">⚡ Emergency Order</span>' : ''}</p>
        </div>
      </div>

      <table>
        <thead><tr><th>#</th><th>Medicine</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
        <tbody>
          ${o.items.map((it, i) => `
          <tr>
            <td>${i+1}</td>
            <td>${it.name}</td>
            <td>${it.qty}</td>
            <td>₹${it.price.toFixed(2)}</td>
            <td>₹${(it.price * it.qty).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="gst-note">*GST @ 5% (CGST 2.5% + SGST 2.5%) included in prices as per pharmaceutical GST slab</div>

      <div class="summary">
        <div class="sum-row"><span>Subtotal (excl. GST)</span><span>₹${(o.subtotal - gst).toFixed(2)}</span></div>
        <div class="sum-row"><span>GST (5%)</span><span>₹${gst.toFixed(2)}</span></div>
        <div class="sum-row"><span>Delivery Charges</span><span>${o.delFee === 0 ? '<span style="color:green">FREE</span>' : '₹' + o.delFee}</span></div>
        ${o.discount > 0 ? `<div class="sum-row" style="color:#15803d"><span>Discount Applied</span><span>−₹${o.discount}</span></div>` : ''}
        <div class="sum-row total"><span>TOTAL PAYABLE</span><span>₹${o.total.toFixed(2)}</span></div>
      </div>

      <div class="inv-footer">
        <p>Thank you for choosing DORMEDS! For any queries, contact support@dormeds.com or call 1800-DORMEDS</p>
        <p style="margin-top:8px">This is a computer-generated invoice and does not require a physical signature.</p>
        <button onclick="window.print()" style="margin-top:16px;padding:10px 24px;background:#2563EB;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">🖨️ Print Invoice</button>
      </div>
    </body>
    </html>`);
    win.document.close();
  },

  // =====================================================
  // DEMO MODE — Order Auto-Simulation
  // =====================================================
  startDemoMode() {
    if (this._demoRunning) { this.toast('Demo already running', 'info'); return; }
    this._demoRunning = true;

    // Create a demo order
    const demoId = this.db.genId('DEMO');
    const demoOrder = {
      id: demoId, uid: 'U1', uName: 'Rahul Sharma',
      phId: 'P1', phName: 'MedPlus', dId: 'D1', dName: 'Ravi Kumar',
      status: 'pending',
      items: [
        { mid: 'M1', name: 'Dolo 650', qty: 2, price: 28 },
        { mid: 'M10', name: 'Becosules Z', qty: 1, price: 29 }
      ],
      subtotal: 85, delFee: 0, discount: 0, total: 85,
      payMethod: 'UPI', payStatus: 'paid',
      address: '42, Sector 15, Noida, UP 201301',
      hasRx: false, rxStatus: null, emergency: false,
      isDemo: true,
      deliveryOtp: '7777', otpVerified: false,
      rating: null, review: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    this.db.add('orders', demoOrder);
    this.toast('🎬 Demo Mode started! Watch order auto-progress...', 'info');

    const states = ['accepted', 'preparing', 'packed', 'out_for_delivery', 'pending_physical_verification', 'completed'];
    let idx = 0;

    const advance = () => {
      if (idx >= states.length) {
        this._demoRunning = false;
        this.toast('🎬 Demo complete! Order delivered successfully.', 'success');
        return;
      }
      const next = states[idx++];
      this.db.update('orders', demoId, { status: next, updatedAt: new Date().toISOString(),
        ...(next === 'out_for_delivery' ? { otpVerified: false } : {}),
        ...(next === 'pending_physical_verification' ? { otpVerified: true } : {}),
      });

      const labels = { accepted:'✅ Order Accepted', preparing:'⚙️ Pharmacy preparing', packed:'📦 Packed & ready for pickup', out_for_delivery:'🏍️ Out for Delivery!', pending_physical_verification:'📝 Prescription verification...', completed:'🎉 Order Delivered!' };
      this.toast(labels[next] || next, next === 'completed' ? 'success' : 'info');

      // Navigate to tracking to show live update
      if (location.hash.includes(demoId) || location.hash.includes('customer/orders')) {
        this.route();
      } else {
        location.hash = `#/customer/tracking/${demoId}`;
      }

      if (idx < states.length) setTimeout(advance, 9000);
      else this._demoRunning = false;
    };

    location.hash = `#/customer/tracking/${demoId}`;
    setTimeout(advance, 4000);
  },

  stopDemoMode() {
    this._demoRunning = false;
    this.toast('Demo mode stopped', 'info');
  },

  // =====================================================
  // DRUG INTERACTION CHECK — called in addCart / cCart
  // =====================================================
  checkCartInteractions() {
    const medIds = this.cart.map(c => c.mid);
    if (medIds.length < 2) return;
    const interactions = this.db.checkInteractions(medIds);
    if (interactions.length === 0) return;
    const majors = interactions.filter(i => i.severity === 'major');
    const worst = majors.length ? majors[0] : interactions[0];
    const icon = worst.severity === 'major' ? '🔴' : worst.severity === 'moderate' ? '🟡' : '🔵';
    this.toast(`${icon} Drug Interaction: ${worst.drug1Name} + ${worst.drug2Name} — ${worst.severity.toUpperCase()}`, 'warning');
  },

}); // end reminders/health/loyalty mixin
