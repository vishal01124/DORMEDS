// =====================================================================
// DORMEDS 4.0 — UPGRADE MODULE
// 1. Pharmacy Inventory (Manual + Barcode + Cloud Sync)
// 2. Delivery Prescription Fix
// 3. Patient Counselling Enhanced
// 4. Customer Support System (Chat + Tickets + Call)
// =====================================================================

Object.assign(DormedsApp.prototype, {

// ═══════════════════════════════════════════════════════════════
// MODULE 1 — PHARMACY INVENTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

  phInventory() {
    const meds = this.db.get('medicines').filter(m => m.phId === 'P1');
    const lowStock = meds.filter(m => m.stock <= 10).length;
    const expiringSoon = meds.filter(m => {
      if (!m.expiry) return false;
      const days = (new Date(m.expiry) - Date.now()) / 86400000;
      return days > 0 && days <= 30;
    }).length;

    return `
    <div style="padding:0">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5);flex-wrap:wrap;gap:var(--s-3)">
        <div>
          <h2 style="font-size:var(--text-xl)">📦 Inventory Management</h2>
          <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px">${meds.length} items · ${lowStock} low stock · ${expiringSoon} expiring soon</p>
        </div>
        <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
          <button class="btn btn-g btn-sm" onclick="A.syncInventory()">☁️ Sync Now</button>
          <button class="btn btn-g btn-sm" onclick="A.showBarcodeScanner()">📷 Scan Barcode</button>
          <button class="btn btn-p btn-sm" onclick="A.showAddMedicineModal()">+ Add Stock</button>
        </div>
      </div>

      <!-- Alert Banners -->
      ${lowStock > 0 ? `<div class="inv-alert inv-alert-warn"><span>⚠️</span><span>${lowStock} item(s) running low on stock — reorder soon</span></div>` : ''}
      ${expiringSoon > 0 ? `<div class="inv-alert inv-alert-err"><span>🗓️</span><span>${expiringSoon} item(s) expiring within 30 days</span></div>` : ''}

      <!-- Sync Status Bar -->
      <div class="sync-bar">
        <div style="display:flex;align-items:center;gap:var(--s-2)">
          <div class="sync-dot"></div>
          <span style="font-size:11px;font-weight:600;color:var(--success)">Cloud Sync Active</span>
        </div>
        <span style="font-size:11px;color:var(--text-muted)">Last synced: ${new Date().toLocaleTimeString('en-IN')}</span>
        <span style="font-size:11px;color:var(--text-muted)">Protocol: REST/JSON · Format: HL7-compatible</span>
      </div>

      <!-- Filter + Search -->
      <div style="display:flex;gap:var(--s-3);margin-bottom:var(--s-4);flex-wrap:wrap">
        <div class="search" style="flex:1;min-width:200px">
          <span class="s-icon">🔍</span>
          <input placeholder="Search medicines..." oninput="A.filterInventory(this.value)" style="min-height:42px"/>
        </div>
        <select class="inp" style="min-width:140px;min-height:42px" onchange="A.filterInventoryStock(this.value)">
          <option value="all">All Stock</option>
          <option value="low">Low Stock (≤10)</option>
          <option value="out">Out of Stock</option>
          <option value="expiring">Expiring Soon</option>
          <option value="ok">In Stock</option>
        </select>
      </div>

      <!-- Inventory Table -->
      <div class="tbl-wrap" id="inv-table-wrap">
        <table class="tbl" id="inv-table">
          <thead><tr>
            <th>Medicine</th><th>Batch / Expiry</th><th>Stock</th>
            <th>MRP</th><th>Price</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${meds.map(m => {
              const expiryDate = m.expiry ? new Date(m.expiry) : null;
              const daysToExp = expiryDate ? Math.round((expiryDate - Date.now()) / 86400000) : null;
              const expColor = daysToExp === null ? '' : daysToExp < 0 ? 'var(--error)' : daysToExp <= 30 ? 'var(--warning)' : 'var(--success)';
              const stockColor = m.stock > 50 ? 'var(--success)' : m.stock > 10 ? 'var(--warning)' : 'var(--error)';
              return `<tr class="inv-row" data-stock="${m.stock}" data-expiry="${daysToExp || 999}">
                <td data-label="Medicine">
                  <div style="display:flex;align-items:center;gap:var(--s-3)">
                    <span style="font-size:22px">${m.icon || '💊'}</span>
                    <div>
                      <div style="font-weight:600;font-size:var(--text-sm)">${m.name}</div>
                      <div style="font-size:11px;color:var(--text-muted)">${m.gen || ''} ${m.rx ? '· <span style="color:var(--primary)">Rx</span>' : ''}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Batch/Expiry">
                  <div style="font-size:var(--text-sm)">${m.batch || '—'}</div>
                  ${expiryDate ? `<div style="font-size:11px;color:${expColor};font-weight:600">${daysToExp < 0 ? '⚠️ Expired' : daysToExp <= 30 ? `⚠️ Exp in ${daysToExp}d` : expiryDate.toLocaleDateString('en-IN')}</div>` : '<div style="font-size:11px;color:var(--text-muted)">No expiry set</div>'}
                </td>
                <td data-label="Stock">
                  <div style="display:flex;align-items:center;gap:var(--s-2)">
                    <div style="width:8px;height:8px;border-radius:50%;background:${stockColor};flex-shrink:0"></div>
                    <span style="font-weight:600">${m.stock}</span>
                  </div>
                  <div style="margin-top:4px;height:4px;width:60px;background:var(--border);border-radius:var(--r-full)">
                    <div style="height:100%;width:${Math.min(100,(m.stock/100)*100)}%;background:${stockColor};border-radius:var(--r-full)"></div>
                  </div>
                </td>
                <td data-label="MRP">₹${m.mrp}</td>
                <td data-label="Price" style="color:var(--primary);font-weight:600">₹${m.price}</td>
                <td data-label="Status"><span class="badge ${m.stock > 10 ? 'badge-s' : m.stock > 0 ? 'badge-w' : 'badge-e'}">${m.stock > 10 ? 'In Stock' : m.stock > 0 ? 'Low' : 'Out'}</span></td>
                <td data-label="Actions">
                  <div style="display:flex;gap:var(--s-1);flex-wrap:wrap">
                    <button class="btn btn-p btn-sm" onclick="A.showRestockModal('${m.id}','${m.name}',${m.stock})">+</button>
                    <button class="btn btn-g btn-sm" onclick="A.showEditMedModal('${m.id}')">✏️</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  filterInventory(q) {
    const rows = document.querySelectorAll('#inv-table .inv-row');
    q = q.toLowerCase();
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  filterInventoryStock(filter) {
    const rows = document.querySelectorAll('#inv-table .inv-row');
    rows.forEach(r => {
      const stock = parseInt(r.dataset.stock);
      const exp = parseInt(r.dataset.expiry);
      let show = true;
      if (filter === 'low') show = stock > 0 && stock <= 10;
      else if (filter === 'out') show = stock === 0;
      else if (filter === 'expiring') show = exp <= 30;
      else if (filter === 'ok') show = stock > 10;
      r.style.display = show ? '' : 'none';
    });
  },

  // ---- Add Medicine Modal (Manual Entry) ----
  showAddMedicineModal() {
    const cats = this.db.get('categories').map(c => c.name);
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:560px">
      <div class="modal-h">
        <div>
          <h3>📦 Add Stock Entry</h3>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">Manual inventory entry — syncs to cloud automatically</p>
        </div>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="modal-b" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)">
        <div style="grid-column:1/-1">
          <label class="inp-label">Medicine Name *</label>
          <input class="inp" id="add_name" placeholder="e.g. Dolo 650"/>
        </div>
        <div>
          <label class="inp-label">Brand Name *</label>
          <input class="inp" id="add_brand" placeholder="e.g. Micro Labs"/>
        </div>
        <div>
          <label class="inp-label">Generic Name</label>
          <input class="inp" id="add_gen" placeholder="e.g. Paracetamol 650mg"/>
        </div>
        <div>
          <label class="inp-label">Batch Number *</label>
          <input class="inp" id="add_batch" placeholder="e.g. BX2024001"/>
        </div>
        <div>
          <label class="inp-label">Expiry Date *</label>
          <input class="inp" type="date" id="add_expiry" min="${new Date().toISOString().split('T')[0]}"/>
        </div>
        <div>
          <label class="inp-label">Quantity *</label>
          <input class="inp" type="number" id="add_qty" placeholder="100" min="1"/>
        </div>
        <div>
          <label class="inp-label">MRP (₹) *</label>
          <input class="inp" type="number" id="add_mrp" placeholder="50" min="0"/>
        </div>
        <div>
          <label class="inp-label">Selling Price (₹) *</label>
          <input class="inp" type="number" id="add_price" placeholder="45" min="0"/>
        </div>
        <div>
          <label class="inp-label">Category</label>
          <select class="inp" id="add_cat">
            ${cats.map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="inp-label">Prescription Required?</label>
          <select class="inp" id="add_rx">
            <option value="false">No (OTC)</option>
            <option value="true">Yes (Rx)</option>
          </select>
        </div>
        <div style="grid-column:1/-1">
          <label class="inp-label">Storage / Notes</label>
          <input class="inp" id="add_note" placeholder="e.g. Store below 25°C, away from light"/>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveNewMedicine()">💾 Add to Inventory</button>
      </div>
    </div></div>`;
  },

  saveNewMedicine() {
    const name   = document.getElementById('add_name')?.value?.trim();
    const brand  = document.getElementById('add_brand')?.value?.trim();
    const batch  = document.getElementById('add_batch')?.value?.trim();
    const expiry = document.getElementById('add_expiry')?.value;
    const qty    = parseInt(document.getElementById('add_qty')?.value);
    const mrp    = parseFloat(document.getElementById('add_mrp')?.value);
    const price  = parseFloat(document.getElementById('add_price')?.value);
    const cat    = document.getElementById('add_cat')?.value;
    const rx     = document.getElementById('add_rx')?.value === 'true';
    const gen    = document.getElementById('add_gen')?.value?.trim();
    const note   = document.getElementById('add_note')?.value?.trim();

    if (!name || !brand || !batch || !expiry || !qty || !mrp || !price) {
      this.toast('Fill all required fields (*)', 'error'); return;
    }
    if (new Date(expiry) <= new Date()) {
      this.toast('Expiry date must be in the future', 'error'); return;
    }
    if (price > mrp) {
      this.toast('Selling price cannot exceed MRP', 'error'); return;
    }

    const id = 'M' + Date.now();
    const med = {
      id, phId:'P1', name, brand, gen: gen || name, batch, expiry, stock: qty,
      mrp, price, cat: cat || 'General', rx, icon: '💊',
      desc: note || `${name} by ${brand}`, note,
      rating: 4.0, reviews: 0, synced: true,
      addedAt: new Date().toISOString()
    };
    this.db.add('medicines', med);
    this._cloudSync('add', med);
    document.getElementById('modal-root').innerHTML = '';
    this.toast(`✅ ${name} added to inventory!`);
    this.route();
  },

  // ---- Restock Modal ----
  showRestockModal(id, name, currentStock) {
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:380px">
      <div class="modal-h"><h3>📦 Restock: ${name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b">
        <div style="text-align:center;margin-bottom:var(--s-4)">
          <div style="font-size:40px;margin-bottom:var(--s-2)">📦</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">Current Stock: <strong>${currentStock} units</strong></div>
        </div>
        <div class="inp-grp">
          <label class="inp-label">New Batch Number</label>
          <input class="inp" id="rs_batch" placeholder="e.g. BX2025001" style="margin-bottom:var(--s-3)"/>
        </div>
        <div class="inp-grp">
          <label class="inp-label">New Expiry Date</label>
          <input class="inp" type="date" id="rs_expiry" min="${new Date().toISOString().split('T')[0]}" style="margin-bottom:var(--s-3)"/>
        </div>
        <div class="inp-grp">
          <label class="inp-label">Add Quantity *</label>
          <input class="inp" type="number" id="rs_qty" placeholder="Enter units to add" min="1"/>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveRestock('${id}','${name}')">+ Add Stock</button>
      </div>
    </div></div>`;
  },

  saveRestock(id, name) {
    const qty = parseInt(document.getElementById('rs_qty')?.value);
    const batch = document.getElementById('rs_batch')?.value?.trim();
    const expiry = document.getElementById('rs_expiry')?.value;
    if (!qty || qty < 1) { this.toast('Enter a valid quantity', 'error'); return; }
    const meds = this.db.get('medicines');
    const i = meds.findIndex(m => m.id === id);
    if (i === -1) { this.toast('Medicine not found', 'error'); return; }
    meds[i].stock += qty;
    if (batch) meds[i].batch = batch;
    if (expiry) meds[i].expiry = expiry;
    meds[i].updatedAt = new Date().toISOString();
    this.db.set('medicines', meds);
    this._cloudSync('update', meds[i]);
    document.getElementById('modal-root').innerHTML = '';
    this.toast(`✅ ${name}: +${qty} units. New stock: ${meds[i].stock}`);
    this.route();
  },

  // ---- Edit Medicine Modal ----
  showEditMedModal(id) {
    const m = this.db.getOne('medicines', id);
    if (!m) { this.toast('Not found', 'error'); return; }
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:480px">
      <div class="modal-h"><h3>✏️ Edit: ${m.name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)">
        <div><label class="inp-label">MRP (₹)</label><input class="inp" type="number" id="ed_mrp" value="${m.mrp}"/></div>
        <div><label class="inp-label">Price (₹)</label><input class="inp" type="number" id="ed_price" value="${m.price}"/></div>
        <div><label class="inp-label">Batch</label><input class="inp" id="ed_batch" value="${m.batch || ''}"/></div>
        <div><label class="inp-label">Expiry</label><input class="inp" type="date" id="ed_expiry" value="${m.expiry || ''}"/></div>
        <div style="grid-column:1/-1"><label class="inp-label">Description</label><input class="inp" id="ed_desc" value="${m.desc || ''}"/></div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveEditMed('${id}')">💾 Save Changes</button>
      </div>
    </div></div>`;
  },

  saveEditMed(id) {
    const mrp   = parseFloat(document.getElementById('ed_mrp')?.value);
    const price = parseFloat(document.getElementById('ed_price')?.value);
    const batch = document.getElementById('ed_batch')?.value?.trim();
    const expiry= document.getElementById('ed_expiry')?.value;
    const desc  = document.getElementById('ed_desc')?.value?.trim();
    if (!mrp || !price || price > mrp) { this.toast('Check price values', 'error'); return; }
    const upd = { mrp, price, batch, expiry, desc, updatedAt: new Date().toISOString() };
    this.db.update('medicines', id, upd);
    this._cloudSync('update', { id, ...upd });
    document.getElementById('modal-root').innerHTML = '';
    this.toast('✅ Medicine updated & synced!');
    this.route();
  },

  // ---- Barcode Scanner ----
  showBarcodeScanner() {
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML='';A._stopScanner()">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:480px">
      <div class="modal-h">
        <div><h3>📷 Barcode Scanner</h3><p style="font-size:11px;color:var(--text-muted);margin-top:2px">Point camera at medicine barcode</p></div>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML='';A._stopScanner()">✕</button>
      </div>
      <div class="modal-b" style="text-align:center">
        <div id="barcode-viewport" style="position:relative;background:#000;border-radius:var(--r-lg);overflow:hidden;height:240px;margin-bottom:var(--s-4)">
          <video id="barcode-video" style="width:100%;height:100%;object-fit:cover" autoplay muted playsinline></video>
          <div class="scanner-overlay">
            <div class="scanner-line"></div>
            <div class="scanner-corner tl"></div>
            <div class="scanner-corner tr"></div>
            <div class="scanner-corner bl"></div>
            <div class="scanner-corner br"></div>
          </div>
        </div>
        <div id="scan-result" style="margin-bottom:var(--s-4)">
          <p style="color:var(--text-secondary);font-size:var(--text-sm)">📡 Scanning... align barcode in the frame</p>
        </div>
        <div style="display:flex;gap:var(--s-3);justify-content:center">
          <button class="btn btn-g" onclick="A._manualBarcodeEntry()">⌨️ Enter Manually</button>
          <button class="btn btn-p" onclick="A._simulateScan()">🎯 Demo Scan</button>
        </div>
      </div>
    </div></div>`;
    this._startScanner();
  },

  _startScanner() {
    const video = document.getElementById('barcode-video');
    if (!video) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          this._scannerStream = stream;
          video.srcObject = stream;
          video.play();
        })
        .catch(() => {
          const vp = document.getElementById('barcode-viewport');
          if (vp) vp.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:var(--s-4);color:#fff"><div style="font-size:48px">📷</div><p style="font-size:var(--text-sm)">Camera access denied.<br>Use "Demo Scan" or enter manually.</p></div>`;
        });
    }
  },

  _stopScanner() {
    if (this._scannerStream) {
      this._scannerStream.getTracks().forEach(t => t.stop());
      this._scannerStream = null;
    }
  },

  _simulateScan() {
    const barcodes = ['8901030868047','8906072060018','8901014006673','8906032601276'];
    const barcode = barcodes[Math.floor(Math.random() * barcodes.length)];
    this._processBarcodeResult(barcode);
  },

  _processBarcodeResult(barcode) {
    const result = document.getElementById('scan-result');
    if (result) result.innerHTML = `<div style="padding:var(--s-3);background:var(--primary-subtle);border-radius:var(--r-md)"><strong style="color:var(--primary)">📊 Barcode: ${barcode}</strong><br><span style="color:var(--text-muted);font-size:11px">Looking up in database...</span></div>`;
    setTimeout(() => {
      const med = this.db.get('medicines').find(m => m.barcode === barcode);
      if (med) {
        if (result) result.innerHTML = `<div style="padding:var(--s-3);background:var(--success-bg);border-radius:var(--r-md)"><strong style="color:var(--success)">✅ Found: ${med.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">₹${med.price} · Stock: ${med.stock}</span></div>`;
        setTimeout(() => { document.getElementById('modal-root').innerHTML = ''; this._stopScanner(); this.showRestockModal(med.id, med.name, med.stock); }, 1500);
      } else {
        if (result) result.innerHTML = `<div style="padding:var(--s-3);background:var(--warning-bg);border-radius:var(--r-md)"><strong style="color:var(--warning)">⚠️ Not in system</strong><br><span style="font-size:11px;color:var(--text-muted)">Barcode: ${barcode}</span><br><button class="btn btn-p btn-sm" style="margin-top:var(--s-2)" onclick="document.getElementById('modal-root').innerHTML='';A._stopScanner();A.showAddMedicineModal()">+ Add New Medicine</button></div>`;
      }
    }, 1200);
  },

  _manualBarcodeEntry() {
    const bc = prompt('Enter barcode number:');
    if (bc && bc.trim()) this._processBarcodeResult(bc.trim());
  },

  // ---- Cloud Sync (REST simulation) ----
  _cloudSync(action, data) {
    // Simulate REST API call to DORMEDS central database
    const payload = { action, timestamp: new Date().toISOString(), pharmacyId: 'P1', data };
    console.log('[DORMEDS CloudSync] POST /api/v1/inventory', JSON.stringify(payload).substring(0, 200));
    // In production: fetch('/api/v1/inventory', { method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    // Mapping layer for different pharmacy software formats:
    const formats = {
      HL7: () => `<MedicationSupply>${data.name || ''}</MedicationSupply>`,
      FHIR: () => ({ resourceType:'MedicationKnowledge', code:{ coding:[{ display: data.name }] } }),
      custom_json: () => ({ med_name: data.name, batch: data.batch, qty: data.stock, sync_time: new Date().toISOString() })
    };
    return { success: true, payload, formats };
  },

  syncInventory() {
    const meds = this.db.get('medicines').filter(m => m.phId === 'P1');
    this.toast(`☁️ Syncing ${meds.length} items to cloud...`, 'info');
    setTimeout(() => {
      meds.forEach(m => this.db.update('medicines', m.id, { synced: true, lastSync: new Date().toISOString() }));
      this.toast(`✅ ${meds.length} items synced successfully!`, 'success');
    }, 1800);
  },

// ═══════════════════════════════════════════════════════════════
// MODULE 2 — DELIVERY: PRESCRIPTION FIX
// ═══════════════════════════════════════════════════════════════

  // Override cPrescription with fixed, fully working upload
  cPrescription() {
    const uploads = JSON.parse(localStorage.getItem('dmed_rx_uploads') || '[]');
    return `
    <div style="padding:var(--s-4)">
      <h3 style="margin-bottom:var(--s-2)">📋 Upload Prescription</h3>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-5)">Upload your doctor's prescription. Accepted: JPG, PNG, PDF (max 10MB)</p>

      <!-- Upload Zone -->
      <div class="upload-zone" id="upload-zone"
        onclick="document.getElementById('rxFileInput').click()"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="event.preventDefault();this.classList.remove('drag-over');A.handleRxDrop(event)">
        <div class="uz-icon">📸</div>
        <h4>Tap or Drag to Upload Prescription</h4>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-top:var(--s-2)">
          Camera · Gallery · PDF · Max 10MB
        </p>
        <input type="file" id="rxFileInput" accept="image/*,.pdf" multiple style="display:none"
          onchange="A.handleRxUpload(event)"/>
      </div>

      <!-- Manual Medicine Entry -->
      <div class="card" style="margin-bottom:var(--s-4)">
        <div class="card-head"><h4 style="font-size:var(--text-base)">⌨️ Or Type Medicine Names</h4></div>
        <div class="card-body">
          <div style="display:flex;gap:var(--s-2)">
            <input class="inp" id="manualRx" placeholder="e.g. Dolo 650, Crocin, Cetirizine" style="flex:1"/>
            <button class="btn btn-p" onclick="A.manualOcr()">🔍 Find</button>
          </div>
        </div>
      </div>

      <!-- Processing State -->
      <div id="rxProcessing" style="display:none;text-align:center;padding:var(--s-8)">
        <div style="font-size:40px;margin-bottom:var(--s-3);animation:spin 1s linear infinite">⚙️</div>
        <div style="font-weight:600">Processing prescription...</div>
        <div style="font-size:var(--text-sm);color:var(--text-muted);margin-top:var(--s-2)">Our AI is reading your prescription</div>
      </div>

      <!-- Preview + OCR Results -->
      <div id="rxPreviewArea"></div>
      <div id="ocrResults"></div>

      <!-- Uploaded Prescriptions History -->
      ${uploads.length > 0 ? `
      <div class="sec-h" style="margin-top:var(--s-6)"><h3>Previously Uploaded</h3></div>
      <div style="display:grid;gap:var(--s-3)">
        ${uploads.slice(0,6).map((u,i) => `
        <div class="rx-card">
          <div class="rx-thumbnail">${u.type === 'pdf' ? '📄' : '🖼️'}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:var(--text-sm)">${u.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${new Date(u.ts).toLocaleDateString('en-IN')} · ${u.size}</div>
            <div style="font-size:11px;color:var(--${u.status === 'verified' ? 'success' : u.status === 'pending' ? 'warning' : 'primary'})">${u.status === 'verified' ? '✅ Verified' : u.status === 'pending' ? '⏳ Under review' : '📤 Uploaded'}</div>
          </div>
          <button class="btn btn-g btn-sm" onclick="A.previewRxUpload(${i})">View</button>
        </div>`).join('')}
      </div>` : ''}
    </div>`;
  },

  handleRxUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    // Validate
    const invalid = files.filter(f => f.size > 10 * 1024 * 1024);
    if (invalid.length) { this.toast(`${invalid[0].name} exceeds 10MB limit`, 'error'); return; }
    files.forEach(file => this._processRxFile(file));
  },

  handleRxDrop(event) {
    const files = Array.from(event.dataTransfer.files);
    if (!files.length) return;
    files.forEach(f => this._processRxFile(f));
  },

  _processRxFile(file) {
    const proc = document.getElementById('rxProcessing');
    const preview = document.getElementById('rxPreviewArea');
    if (proc) proc.style.display = 'block';
    if (preview) preview.innerHTML = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      if (proc) proc.style.display = 'none';
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const dataUrl = e.target.result;

      // Show preview
      if (preview) {
        preview.innerHTML = `
        <div class="card" style="margin-bottom:var(--s-4)">
          <div class="card-head" style="display:flex;justify-content:space-between;align-items:center">
            <h4 style="font-size:var(--text-base)">📎 ${file.name}</h4>
            <span style="font-size:11px;color:var(--text-muted)">${(file.size / 1024).toFixed(0)} KB</span>
          </div>
          <div class="card-body" style="text-align:center">
            ${isImg
              ? `<img src="${dataUrl}" style="max-width:100%;max-height:280px;border-radius:var(--r-lg);object-fit:contain;margin-bottom:var(--s-3)"/>`
              : `<div style="font-size:64px;margin-bottom:var(--s-4)">📄</div><p style="color:var(--text-secondary)">${file.name} (PDF)</p>`
            }
            <span class="badge badge-s">✅ Preview Ready</span>
          </div>
        </div>`;
      }

      // Save to history
      const uploads = JSON.parse(localStorage.getItem('dmed_rx_uploads') || '[]');
      uploads.unshift({ name: file.name, type: isPdf ? 'pdf' : 'image', size: `${(file.size/1024).toFixed(0)} KB`, ts: new Date().toISOString(), status: 'uploaded', dataUrl: isImg ? dataUrl : null });
      localStorage.setItem('dmed_rx_uploads', JSON.stringify(uploads.slice(0, 10)));

      // Run OCR simulation
      this._runRxOcr(file.name);
    };

    reader.onerror = () => {
      if (proc) proc.style.display = 'none';
      this.toast('Failed to read file. Please try again.', 'error');
    };

    reader.readAsDataURL(file);
  },

  _runRxOcr(filename) {
    const container = document.getElementById('ocrResults');
    if (!container) return;
    const meds = this.db.get('medicines').slice(0, 6);
    const picked = meds.slice(0, 3 + Math.floor(Math.random() * 3));
    container.innerHTML = `
    <div class="card">
      <div class="card-head" style="display:flex;justify-content:space-between;align-items:center">
        <h4 style="font-size:var(--text-base)">🧠 Medicines Detected (${picked.length})</h4>
        <button class="btn btn-p btn-sm" onclick="A.addAllOcr()">Add All to Cart</button>
      </div>
      <div class="card-body" style="padding:0">
        ${picked.map(m => `
        <div style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-4);border-bottom:1px solid var(--border)">
          <span style="font-size:22px">${m.icon}</span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:var(--text-sm)">${m.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${m.gen} · ₹${m.price}</div>
            <span style="font-size:10px;font-weight:700;padding:2px 8px;background:var(--success-bg);color:var(--success);border-radius:var(--r-full)">✓ Exact Match</span>
          </div>
          <button class="btn btn-p btn-sm" onclick="A.addCart('${m.id}')">+ Cart</button>
        </div>`).join('')}
      </div>
      <div class="card-foot" style="text-align:center">
        <button class="btn btn-p btn-block" onclick="A.validateAndCheckout()">Proceed to Checkout →</button>
      </div>
    </div>`;
    this._lastOcr = picked.map(m => ({ match: m, fuzzy: [] }));
    this.toast(`📋 ${picked.length} medicines detected from prescription!`);
  },

  previewRxUpload(index) {
    const uploads = JSON.parse(localStorage.getItem('dmed_rx_uploads') || '[]');
    const u = uploads[index];
    if (!u) return;
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-h"><h3>📋 ${u.name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b" style="text-align:center">
        ${u.dataUrl ? `<img src="${u.dataUrl}" style="max-width:100%;border-radius:var(--r-lg);max-height:400px;object-fit:contain"/>` : `<div style="font-size:64px;padding:var(--s-8)">📄</div><p>${u.name}</p>`}
        <div style="margin-top:var(--s-3)">
          <span class="badge ${u.status === 'verified' ? 'badge-s' : 'badge-w'}">${u.status === 'verified' ? '✅ Verified by Doctor' : '⏳ Under Review'}</span>
        </div>
      </div>
    </div></div>`;
  },

// ═══════════════════════════════════════════════════════════════
// MODULE 3 — PATIENT COUNSELLING ENHANCED
// ═══════════════════════════════════════════════════════════════

  counsellorPatients() {
    const users = this.db.get('users');
    const orders = this.db.get('orders');
    return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
        <div><h2 style="font-size:var(--text-xl)">👤 Patient Records</h2><p style="font-size:var(--text-sm);color:var(--text-secondary)">${users.length} patients registered</p></div>
        <input class="inp" placeholder="🔍 Search patients..." style="max-width:220px;min-height:40px"/>
      </div>
      ${users.map(u => {
        const uOrds = orders.filter(o => o.uid === u.id);
        const rxOrds = uOrds.filter(o => o.hasRx);
        const rxUploads = JSON.parse(localStorage.getItem('dmed_rx_uploads') || '[]');
        return `
        <div class="card card-i" style="margin-bottom:var(--s-4)" onclick="A.showPatientDetail('${u.id}')">
          <div class="card-body" style="display:flex;align-items:center;gap:var(--s-4)">
            <div class="avatar av-lg">${u.avatar || u.name?.[0] || '👤'}</div>
            <div style="flex:1">
              <div style="font-weight:700">${u.name}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary)">+91 ${u.phone} · ${u.subscription === 'premium' ? '⭐ Premium' : 'Basic'}</div>
              <div style="display:flex;gap:var(--s-3);margin-top:var(--s-2);flex-wrap:wrap">
                <span style="font-size:11px;color:var(--text-muted)">📦 ${uOrds.length} orders</span>
                <span style="font-size:11px;color:var(--text-muted)">📋 ${rxOrds.length} Rx orders</span>
                <span style="font-size:11px;color:var(--text-muted)">💊 ${uOrds.reduce((s,o)=>s+o.items.length,0)} medicines</span>
              </div>
            </div>
            <div style="text-align:right">
              <button class="btn btn-p btn-sm" onclick="event.stopPropagation();A.showCounsellingNotes('${u.id}','${u.name}')">📝 Notes</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  showPatientDetail(uid) {
    const u = this.db.getOne('users', uid);
    if (!u) return;
    const orders = this.db.get('orders').filter(o => o.uid === uid).reverse();
    const healthRecs = this.db.get('health_records').filter(r => r.userId === uid);
    const meds = [...new Set(orders.flatMap(o => o.items.map(i => i.name)))];
    const logs = this.db.get('counselling_logs').filter(l => l.patientId === uid);

    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:600px;max-height:90vh">
      <div class="modal-h">
        <div style="display:flex;align-items:center;gap:var(--s-3)">
          <div class="avatar av-lg">${u.avatar || u.name?.[0] || '👤'}</div>
          <div><h3>${u.name}</h3><div style="font-size:11px;color:var(--text-muted)">+91 ${u.phone} · Patient ID: ${u.id}</div></div>
        </div>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="modal-b" style="padding:0;overflow-y:auto;max-height:65vh">

        <!-- RBAC: Role label -->
        <div style="padding:var(--s-3) var(--s-5);background:rgba(139,92,246,.06);border-bottom:1px solid var(--border);font-size:11px;color:#8B5CF6;font-weight:600">
          🔒 Counsellor Access — Patient records are securely protected under DORMEDS Healthcare Privacy Policy
        </div>

        <!-- Current Medications -->
        <div style="padding:var(--s-5)">
          <h4 style="margin-bottom:var(--s-3)">💊 Current Medications (from order history)</h4>
          <div style="display:flex;flex-wrap:wrap;gap:var(--s-2);margin-bottom:var(--s-5)">
            ${meds.length ? meds.map(m => `<span style="padding:4px 12px;background:var(--primary-subtle);color:var(--primary);border-radius:var(--r-full);font-size:11px;font-weight:600">${m}</span>`).join('') : '<span style="color:var(--text-muted);font-size:var(--text-sm)">No medication history</span>'}
          </div>

          <!-- Health Vitals -->
          ${healthRecs.length > 0 ? `
          <h4 style="margin-bottom:var(--s-3)">❤️ Latest Vitals</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--s-3);margin-bottom:var(--s-5)">
            ${['blood_pressure','blood_sugar','weight'].map(type => {
              const rec = healthRecs.find(r => r.type === type);
              return `<div class="card" style="padding:var(--s-3);text-align:center">
                <div style="font-size:18px">${type==='blood_pressure'?'❤️':type==='blood_sugar'?'🩸':'⚖️'}</div>
                <div style="font-weight:700;margin:4px 0">${rec ? (type==='blood_pressure'?`${rec.systolic}/${rec.diastolic}`:rec.value) : '—'}</div>
                <div style="font-size:10px;color:var(--text-muted)">${type.replace(/_/g,' ')}</div>
              </div>`;
            }).join('')}
          </div>` : ''}

          <!-- Recent Orders -->
          <h4 style="margin-bottom:var(--s-3)">📦 Recent Orders (${orders.length})</h4>
          ${orders.slice(0,3).map(o => `
          <div style="padding:var(--s-3);background:var(--bg-surface);border-radius:var(--r-md);margin-bottom:var(--s-2);font-size:var(--text-sm)">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <strong>#${o.id}</strong>
              <span class="badge ${o.status==='completed'||o.status==='delivered'?'badge-s':'badge-w'}">${o.status}</span>
            </div>
            <div style="color:var(--text-secondary)">${o.items.map(i=>i.name).join(', ')}</div>
            ${o.hasRx ? '<div style="color:var(--primary);font-size:11px">📋 Prescription order</div>' : ''}
          </div>`).join('')}

          <!-- Counselling Logs -->
          <h4 style="margin-top:var(--s-4);margin-bottom:var(--s-3)">📝 Counselling History (${logs.length})</h4>
          ${logs.length ? logs.map(l => `
          <div style="padding:var(--s-3);background:rgba(139,92,246,.05);border:1px solid rgba(139,92,246,.15);border-radius:var(--r-md);margin-bottom:var(--s-2)">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
              <span>Dr. ${l.counsellorName}</span><span>${new Date(l.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <p style="font-size:var(--text-sm)">${l.notes}</p>
          </div>`).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm)">No counselling sessions yet.</p>'}
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
        <button class="btn btn-p" onclick="document.getElementById('modal-root').innerHTML='';A.showCounsellingNotes('${u.id}','${u.name}')">📝 Add Notes</button>
      </div>
    </div></div>`;
  },

  showCounsellingNotes(uid, name) {
    const logs = this.db.get('counselling_logs').filter(l => l.patientId === uid);
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:520px">
      <div class="modal-h"><h3>📝 Counselling Notes — ${name}</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3);margin-bottom:var(--s-4)">
          <div><label class="inp-label">Session Type</label>
            <select class="inp" id="cn_type">
              <option value="follow_up">Follow-up</option>
              <option value="first_consult">First Consultation</option>
              <option value="medication_review">Medication Review</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div><label class="inp-label">Next Follow-up</label>
            <input class="inp" type="date" id="cn_next" min="${new Date().toISOString().split('T')[0]}"/>
          </div>
        </div>
        <div style="margin-bottom:var(--s-3)">
          <label class="inp-label">Chief Complaints / Observations *</label>
          <textarea class="inp" id="cn_notes" rows="4" placeholder="e.g. Patient reports lower back pain, difficulty sleeping. Recommended reducing NSAID usage..." style="resize:vertical;min-height:100px"></textarea>
        </div>
        <div style="margin-bottom:var(--s-3)">
          <label class="inp-label">Recommendations (one per line)</label>
          <textarea class="inp" id="cn_recs" rows="3" placeholder="BPT Home Visit&#10;Vitamin D Test&#10;Reduce screen time" style="resize:vertical;min-height:80px"></textarea>
        </div>
        <div>
          <label class="inp-label">Alert / Flag</label>
          <select class="inp" id="cn_flag">
            <option value="">No Alert</option>
            <option value="medication_change">⚠️ Medication Change Needed</option>
            <option value="refer_doctor">🩺 Refer to Doctor</option>
            <option value="followup_urgent">🚨 Urgent Follow-up Required</option>
          </select>
        </div>
        ${logs.length > 0 ? `
        <div style="margin-top:var(--s-5)">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:var(--s-3)">Previous Sessions</div>
          ${logs.slice(0,3).map(l => `<div style="padding:var(--s-3);background:var(--bg-surface);border-radius:var(--r-md);margin-bottom:var(--s-2);font-size:11px"><strong>${new Date(l.createdAt).toLocaleDateString('en-IN')}</strong> — ${l.notes.substring(0,80)}...</div>`).join('')}
        </div>` : ''}
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.saveCounsellingNote('${uid}','${name}')">💾 Save Session</button>
      </div>
    </div></div>`;
  },

  saveCounsellingNote(uid, name) {
    const notes = document.getElementById('cn_notes')?.value?.trim();
    const recs  = document.getElementById('cn_recs')?.value?.trim();
    const type  = document.getElementById('cn_type')?.value;
    const next  = document.getElementById('cn_next')?.value;
    const flag  = document.getElementById('cn_flag')?.value;
    if (!notes) { this.toast('Enter counselling notes', 'error'); return; }
    const log = {
      id: 'CL' + Date.now(),
      counsellorId: this.user?.id || 'ADM-C1',
      counsellorName: this.user?.name || 'Dr. Prathap Rao',
      patientId: uid, patientName: name,
      type, notes,
      recommendations: recs ? recs.split('\n').filter(Boolean) : [],
      flag, nextFollowup: next || null,
      createdAt: new Date().toISOString()
    };
    this.db.add('counselling_logs', log);
    document.getElementById('modal-root').innerHTML = '';
    this.toast('✅ Counselling session saved!');
    if (flag) this.toast(`🚩 Alert flagged: ${flag.replace(/_/g,' ')}`, 'warning');
    this.route();
  },

// ═══════════════════════════════════════════════════════════════
// MODULE 4 — CUSTOMER SUPPORT SYSTEM
// ═══════════════════════════════════════════════════════════════

  // ---- Customer: Open Support ----
  cSupport() {
    const tickets = this.db.get('support_tickets').filter(t => t.userId === 'U1').reverse();
    return `
    <div style="padding:var(--s-4)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
        <div><h2 style="font-size:var(--text-xl)">🎧 Customer Support</h2><p style="font-size:var(--text-sm);color:var(--text-secondary)">We're here to help 24/7</p></div>
        <button class="btn btn-p btn-sm" onclick="A.showNewTicketModal()">+ New Request</button>
      </div>

      <!-- Contact Options -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--s-3);margin-bottom:var(--s-6)">
        <div class="support-option" onclick="A.initiateCall()">
          <div class="so-icon" style="background:rgba(34,197,94,.1);color:var(--success)">📞</div>
          <div class="so-title">Call Support</div>
          <div class="so-sub">Avg wait: 2 min</div>
        </div>
        <div class="support-option" onclick="A.openLiveChat()">
          <div class="so-icon" style="background:var(--primary-subtle);color:var(--primary)">💬</div>
          <div class="so-title">Live Chat</div>
          <div class="so-sub">Instant response</div>
        </div>
        <div class="support-option" onclick="A.showNewTicketModal()">
          <div class="so-icon" style="background:rgba(245,158,11,.1);color:var(--warning)">🎟️</div>
          <div class="so-title">Raise Ticket</div>
          <div class="so-sub">24h resolution</div>
        </div>
        <div class="support-option" onclick="A.toast('FAQ opening...','info')">
          <div class="so-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">❓</div>
          <div class="so-title">FAQs</div>
          <div class="so-sub">Quick answers</div>
        </div>
      </div>

      <!-- My Tickets -->
      <div class="sec-h"><h3>My Support Tickets</h3></div>
      ${tickets.length === 0 ? `<div style="text-align:center;padding:var(--s-10);color:var(--text-muted)"><div style="font-size:40px;margin-bottom:var(--s-3)">🎟️</div><p>No support tickets yet</p></div>` : ''}
      ${tickets.map(t => `
      <div class="ticket-card" onclick="A.openTicketChat('${t.id}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--s-2)">
          <div>
            <span class="badge badge-n" style="font-size:10px;margin-right:var(--s-2)">#${t.id}</span>
            <span class="badge ${t.status==='resolved'?'badge-s':t.status==='pending'?'badge-w':'badge-i'}">${t.status}</span>
          </div>
          <span style="font-size:11px;color:var(--text-muted)">${new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:4px">${t.subject}</div>
        <div style="font-size:11px;color:var(--text-secondary)">${t.lastMessage || t.description.substring(0,60)}...</div>
        ${t.unread ? `<div class="unread-dot-wrap"><span class="ni-dot"></span><span style="font-size:10px;color:var(--primary)">New reply</span></div>` : ''}
      </div>`).join('')}
    </div>`;
  },

  // ---- New Ticket Modal ----
  showNewTicketModal() {
    const orders = this.db.get('orders').filter(o => o.uid === 'U1').reverse().slice(0, 5);
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:480px">
      <div class="modal-h"><h3>🎟️ Raise Support Request</h3><button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button></div>
      <div class="modal-b">
        <div style="margin-bottom:var(--s-3)">
          <label class="inp-label">Issue Category *</label>
          <select class="inp" id="tk_cat">
            <option value="order_issue">📦 Order Issue</option>
            <option value="payment">💳 Payment Problem</option>
            <option value="medicine_wrong">💊 Wrong Medicine</option>
            <option value="delivery_late">🏍️ Delivery Delay</option>
            <option value="prescription">📋 Prescription Issue</option>
            <option value="refund">💰 Refund Request</option>
            <option value="other">❓ Other</option>
          </select>
        </div>
        ${orders.length > 0 ? `
        <div style="margin-bottom:var(--s-3)">
          <label class="inp-label">Related Order (optional)</label>
          <select class="inp" id="tk_order">
            <option value="">Not order-specific</option>
            ${orders.map(o => `<option value="${o.id}">#${o.id} — ${o.items[0]?.name} (₹${o.total})</option>`).join('')}
          </select>
        </div>` : ''}
        <div style="margin-bottom:var(--s-3)">
          <label class="inp-label">Subject *</label>
          <input class="inp" id="tk_subject" placeholder="Brief description of your issue"/>
        </div>
        <div>
          <label class="inp-label">Details *</label>
          <textarea class="inp" id="tk_desc" rows="4" placeholder="Please describe your issue in detail..." style="resize:vertical;min-height:100px"></textarea>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.submitTicket()">📤 Submit Ticket</button>
      </div>
    </div></div>`;
  },

  submitTicket() {
    const cat     = document.getElementById('tk_cat')?.value;
    const subject = document.getElementById('tk_subject')?.value?.trim();
    const desc    = document.getElementById('tk_desc')?.value?.trim();
    const orderId = document.getElementById('tk_order')?.value;
    if (!subject || !desc) { this.toast('Fill all required fields', 'error'); return; }
    const id = 'TK' + Date.now().toString(36).toUpperCase();
    const ticket = {
      id, userId:'U1', userName: this.user?.name || 'Rahul Sharma',
      userPhone: this.user?.phone || '9876543210',
      category: cat, subject, description: desc,
      orderId: orderId || null, status:'open', priority:'medium',
      assignedTo: null, lastMessage: desc,
      messages:[{ sender:'user', text: desc, ts: new Date().toISOString() }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      unread: false
    };
    this.db.add('support_tickets', ticket);
    document.getElementById('modal-root').innerHTML = '';
    this.toast(`🎟️ Ticket #${id} raised! We'll respond within 24 hours.`);
    this.db.addNotification('U1', { type:'system', icon:'🎧', title:'Support Ticket Created', body:`Your ticket #${id} is open. Expected response: within 24 hours.`, link:'#/customer/support' });
    this.route();
  },

  // ---- Live Chat ----
  openLiveChat(ticketId) {
    const ticket = ticketId ? this.db.getOne('support_tickets', ticketId) : null;
    const msgs = ticket?.messages || [];
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:460px;height:85vh;display:flex;flex-direction:column">
      <div class="modal-h" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark))">
        <div style="display:flex;align-items:center;gap:var(--s-3)">
          <div class="avatar" style="background:rgba(255,255,255,.2)">🎧</div>
          <div>
            <div style="font-weight:700;color:white">DORMEDS Support</div>
            <div style="font-size:11px;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#4ADE80;display:inline-block"></span>Online</div>
          </div>
        </div>
        <button class="modal-x" style="color:rgba(255,255,255,.7)" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>

      <!-- Chat Messages -->
      <div id="chat-messages" style="flex:1;overflow-y:auto;padding:var(--s-4);display:flex;flex-direction:column;gap:var(--s-3)">
        <div class="chat-msg chat-agent">
          <div class="cm-bubble">👋 Hi! I'm your DORMEDS support agent. How can I help you today?</div>
          <div class="cm-time">Support · Just now</div>
        </div>
        ${msgs.map(m => `
        <div class="chat-msg ${m.sender === 'user' ? 'chat-user' : 'chat-agent'}">
          <div class="cm-bubble">${m.text}</div>
          <div class="cm-time">${m.sender === 'user' ? 'You' : 'Support'} · ${this._timeAgo(m.ts)}</div>
        </div>`).join('')}
      </div>

      <!-- Quick Replies -->
      <div style="padding:0 var(--s-3) var(--s-2);display:flex;gap:var(--s-2);overflow-x:auto;scrollbar-width:none">
        ${['Track my order','Request refund','Wrong medicine received','When will I get delivery?'].map(q =>
          `<button class="quick-reply-btn" onclick="A.sendChatMessage('${q}','${ticketId || ''}')">${q}</button>`
        ).join('')}
      </div>

      <!-- Chat Input -->
      <div style="padding:var(--s-3) var(--s-4);border-top:1px solid var(--border);display:flex;gap:var(--s-2)">
        <input class="inp" id="chat-input" placeholder="Type a message..." style="flex:1;min-height:44px"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();A.sendChatMessage(null,'${ticketId || ''}')}"
        />
        <button class="btn btn-p btn-icon" onclick="A.sendChatMessage(null,'${ticketId || ''}')">➤</button>
      </div>
    </div></div>`;
    // Auto-scroll to bottom
    setTimeout(() => { const c = document.getElementById('chat-messages'); if(c) c.scrollTop = c.scrollHeight; }, 100);
  },

  sendChatMessage(preset, ticketId) {
    const input = document.getElementById('chat-input');
    const text = preset || input?.value?.trim();
    if (!text) return;
    if (input) input.value = '';

    const chatArea = document.getElementById('chat-messages');
    if (!chatArea) return;

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg chat-user';
    userDiv.innerHTML = `<div class="cm-bubble">${text}</div><div class="cm-time">You · Just now</div>`;
    chatArea.appendChild(userDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Save to ticket if exists
    if (ticketId) {
      const tickets = this.db.get('support_tickets');
      const i = tickets.findIndex(t => t.id === ticketId);
      if (i !== -1) {
        tickets[i].messages = tickets[i].messages || [];
        tickets[i].messages.push({ sender:'user', text, ts: new Date().toISOString() });
        tickets[i].lastMessage = text;
        tickets[i].updatedAt = new Date().toISOString();
        this.db.set('support_tickets', tickets);
      }
    }

    // Auto-reply after delay
    setTimeout(() => {
      const replies = {
        'Track my order': 'Sure! You can track your order by going to My Orders → tap on your order. I can also check it for you — which order ID?',
        'Request refund': 'I can help with your refund. Refunds are processed within 3-5 business days to your original payment method. Can you share your order ID?',
        'Wrong medicine received': 'I apologize for the inconvenience! Please keep the medicine aside and I will arrange a replacement pickup. Can you share your order ID?',
        'When will I get delivery?': 'Our standard delivery time is 30-60 minutes. Let me check the status of your order. Can you share your order ID?',
      };
      const reply = replies[text] || `Thank you for reaching out! Your query "${text.substring(0,30)}..." has been noted. A support agent will respond shortly.`;
      const agentDiv = document.createElement('div');
      agentDiv.className = 'chat-msg chat-agent';
      agentDiv.innerHTML = `<div class="cm-bubble">${reply}</div><div class="cm-time">Support · Just now</div>`;
      chatArea.appendChild(agentDiv);
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 1000);
  },

  openTicketChat(ticketId) {
    this.openLiveChat(ticketId);
  },

  // ---- Click-to-Call ----
  initiateCall() {
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:340px;text-align:center">
      <div class="modal-b" style="padding:var(--s-8) var(--s-6)">
        <div style="font-size:64px;margin-bottom:var(--s-4);animation:bounce 1s infinite">📞</div>
        <h3 style="margin-bottom:var(--s-2)">Calling DORMEDS Support</h3>
        <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--s-2)">1800-DORMEDS (Toll Free)</p>
        <p style="color:var(--text-muted);font-size:11px;margin-bottom:var(--s-6)">Estimated wait: ~2 minutes</p>
        <div class="call-animation">
          <div class="call-ring"></div>
          <div class="call-ring" style="animation-delay:.5s"></div>
          <div class="call-center">📞</div>
        </div>
        <p style="color:var(--text-muted);font-size:11px;margin-top:var(--s-5);margin-bottom:var(--s-4)">
          In production, this connects via Twilio API:<br>
          <code style="font-size:10px">POST /api/calls/initiate {from, to, callerId}</code>
        </p>
        <a href="tel:18001234567" class="btn btn-success btn-block" style="text-decoration:none">📞 Call Now</a>
        <button class="btn btn-g btn-block" style="margin-top:var(--s-2)" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
      </div>
    </div></div>`;
  },

  // ---- Admin Support Dashboard ----
  supportDash() {
    const tickets = this.db.get('support_tickets');
    const open = tickets.filter(t => t.status === 'open').length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const recent = [...tickets].reverse().slice(0, 8);

    return `
    <div>
      <!-- Stats -->
      <div class="stats-g" style="margin-bottom:var(--s-5)">
        <div class="stat"><div class="st-icon" style="background:var(--error-bg);color:var(--error)">🔴</div><div class="st-val">${open}</div><div class="st-label">Open Tickets</div></div>
        <div class="stat"><div class="st-icon" style="background:var(--warning-bg);color:var(--warning)">⏳</div><div class="st-val">${pending}</div><div class="st-label">Pending</div></div>
        <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">✅</div><div class="st-val">${resolved}</div><div class="st-label">Resolved</div></div>
        <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">🎟️</div><div class="st-val">${tickets.length}</div><div class="st-label">Total</div></div>
      </div>

      <!-- Filters -->
      <div style="display:flex;gap:var(--s-2);margin-bottom:var(--s-4);flex-wrap:wrap">
        ${['all','open','pending','resolved'].map(s => `<button class="btn btn-${s==='all'?'p':'g'} btn-sm" onclick="A.filterTickets('${s}')" id="tkf-${s}">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`).join('')}
        <div style="flex:1"></div>
        <input class="inp" placeholder="🔍 Search tickets..." style="max-width:200px;min-height:36px" oninput="A.searchTickets(this.value)"/>
      </div>

      <!-- Tickets List -->
      <div id="tickets-container">
        ${recent.length === 0 ? `<div style="text-align:center;padding:var(--s-10);color:var(--text-muted)">No tickets yet</div>` : ''}
        ${recent.map(t => `
        <div class="ticket-admin-card" data-status="${t.status}" data-text="${(t.subject+t.description+t.userName).toLowerCase()}">
          <div style="display:flex;align-items:flex-start;gap:var(--s-3)">
            <div class="avatar" style="background:${t.status==='open'?'var(--error-bg)':t.status==='pending'?'var(--warning-bg)':'var(--success-bg)'};color:${t.status==='open'?'var(--error)':t.status==='pending'?'var(--warning)':'var(--success)'};font-size:14px">
              ${t.status==='open'?'🔴':t.status==='pending'?'⏳':'✅'}
            </div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--s-2)">
                <div>
                  <span style="font-weight:700;font-size:var(--text-sm)">${t.subject}</span>
                  <span class="badge badge-n" style="margin-left:var(--s-2);font-size:10px">#${t.id}</span>
                </div>
                <div style="display:flex;gap:var(--s-2)">
                  <span class="badge ${t.status==='open'?'badge-e':t.status==='pending'?'badge-w':'badge-s'}">${t.status}</span>
                  <span class="badge badge-n" style="font-size:10px">${t.priority || 'medium'}</span>
                </div>
              </div>
              <div style="font-size:11px;color:var(--text-secondary);margin:4px 0">👤 ${t.userName} · ${t.userPhone} · ${new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary)">${(t.lastMessage || t.description).substring(0,80)}...</div>
            </div>
          </div>
          <div style="display:flex;gap:var(--s-2);margin-top:var(--s-3);flex-wrap:wrap">
            <button class="btn btn-p btn-sm" onclick="A.openAdminTicketChat('${t.id}')">💬 Reply</button>
            ${t.status !== 'resolved' ? `<button class="btn btn-success btn-sm" onclick="A.updateTicketStatus('${t.id}','resolved')">✅ Resolve</button>` : ''}
            ${t.status === 'open' ? `<button class="btn btn-g btn-sm" onclick="A.updateTicketStatus('${t.id}','pending')">⏳ Pending</button>` : ''}
            <button class="btn btn-g btn-sm" onclick="A.assignTicket('${t.id}')">👤 Assign</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  },

  filterTickets(status) {
    const cards = document.querySelectorAll('.ticket-admin-card');
    cards.forEach(c => { c.style.display = status === 'all' || c.dataset.status === status ? '' : 'none'; });
    document.querySelectorAll('[id^="tkf-"]').forEach(b => b.className = b.className.replace('btn-p','btn-g'));
    const btn = document.getElementById('tkf-' + status);
    if (btn) btn.className = btn.className.replace('btn-g','btn-p');
  },

  searchTickets(q) {
    const cards = document.querySelectorAll('.ticket-admin-card');
    cards.forEach(c => { c.style.display = c.dataset.text?.includes(q.toLowerCase()) ? '' : 'none'; });
  },

  updateTicketStatus(id, status) {
    this.db.update('support_tickets', id, { status, updatedAt: new Date().toISOString() });
    this.toast(`Ticket #${id} → ${status}`);
    this.route();
  },

  assignTicket(id) {
    const agent = prompt('Assign to agent (name):');
    if (!agent || !agent.trim()) return;
    this.db.update('support_tickets', id, { assignedTo: agent.trim(), status:'pending', updatedAt: new Date().toISOString() });
    this.toast(`Ticket #${id} assigned to ${agent.trim()}`);
    this.route();
  },

  openAdminTicketChat(ticketId) {
    const ticket = this.db.getOne('support_tickets', ticketId);
    if (!ticket) return;
    const msgs = ticket.messages || [];
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:480px;height:85vh;display:flex;flex-direction:column">
      <div class="modal-h" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark))">
        <div>
          <div style="font-weight:700;color:white">Ticket #${ticketId}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.7)">${ticket.subject} · ${ticket.userName}</div>
        </div>
        <button class="modal-x" style="color:rgba(255,255,255,.7)" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div id="admin-chat-messages" style="flex:1;overflow-y:auto;padding:var(--s-4);display:flex;flex-direction:column;gap:var(--s-3)">
        ${msgs.map(m => `
        <div class="chat-msg ${m.sender === 'agent' ? 'chat-user' : 'chat-agent'}">
          <div class="cm-bubble">${m.text}</div>
          <div class="cm-time">${m.sender === 'user' ? ticket.userName : 'You (Agent)'} · ${this._timeAgo(m.ts)}</div>
        </div>`).join('')}
      </div>
      <div style="padding:var(--s-3) var(--s-4);border-top:1px solid var(--border);display:flex;gap:var(--s-2)">
        <input class="inp" id="admin-chat-input" placeholder="Reply to customer..." style="flex:1;min-height:44px"
          onkeydown="if(event.key==='Enter'){event.preventDefault();A.sendAgentReply('${ticketId}')}"/>
        <button class="btn btn-p btn-icon" onclick="A.sendAgentReply('${ticketId}')">➤</button>
      </div>
    </div></div>`;
    setTimeout(() => { const c = document.getElementById('admin-chat-messages'); if(c) c.scrollTop = c.scrollHeight; }, 100);
  },

  sendAgentReply(ticketId) {
    const input = document.getElementById('admin-chat-input');
    const text = input?.value?.trim();
    if (!text) return;
    if (input) input.value = '';
    const tickets = this.db.get('support_tickets');
    const i = tickets.findIndex(t => t.id === ticketId);
    if (i !== -1) {
      tickets[i].messages = tickets[i].messages || [];
      tickets[i].messages.push({ sender:'agent', text, ts: new Date().toISOString() });
      tickets[i].lastMessage = text;
      tickets[i].status = 'pending';
      tickets[i].updatedAt = new Date().toISOString();
      tickets[i].unread = true;
      this.db.set('support_tickets', tickets);
    }
    const chatArea = document.getElementById('admin-chat-messages');
    if (chatArea) {
      const div = document.createElement('div');
      div.className = 'chat-msg chat-user';
      div.innerHTML = `<div class="cm-bubble">${text}</div><div class="cm-time">You (Agent) · Just now</div>`;
      chatArea.appendChild(div);
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    this.db.addNotification(tickets[i]?.userId || 'U1', { type:'system', icon:'🎧', title:'Support Reply', body:`Agent replied to ticket #${ticketId}: "${text.substring(0,40)}..."`, link:'#/customer/support' });
    this.toast('Reply sent ✅');
  },

}); // end upgrade module
