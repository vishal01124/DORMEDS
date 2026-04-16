// =====================================================================
// DORMEDS 3.0 — BPT Exercise Library + Physiotherapist Panel
// Smart Exercise Suggestions, Filters, Exercise Plans
// =====================================================================

Object.assign(DormedsApp.prototype, {

  // ===== BPT EXERCISE LIBRARY (Customer + Physio) =====
  cBptExerciseLibrary() {
    const exercises = this.db.get('exercise_library');
    const painTypes = [...new Set(exercises.map(e => e.painType))];
    const bodyParts = [...new Set(exercises.map(e => e.bodyPart))];
    return this._renderExerciseLibrary(exercises, painTypes, bodyParts, {}, 'customer');
  },

  _renderExerciseLibrary(exercises, painTypes, bodyParts, filters, mode) {
    let filtered = exercises;
    if (filters.painType) filtered = filtered.filter(e => e.painType === filters.painType);
    if (filters.bodyPart) filtered = filtered.filter(e => e.bodyPart === filters.bodyPart);
    if (filters.difficulty) filtered = filtered.filter(e => e.difficulty === filters.difficulty);

    const diffColors = { Easy:'easy', Medium:'medium', Hard:'hard' };

    return `
    <div style="padding:var(--s-4)">
      <div style="margin-bottom:var(--s-5)">
        <h2 style="font-size:var(--text-xl);font-weight:800;margin-bottom:4px">🏋️ Exercise Library</h2>
        <p style="color:var(--text-secondary);font-size:var(--text-sm)">Smart exercises mapped to your pain type and body part</p>
      </div>

      <!-- Filters -->
      <div class="exercise-filters">
        <select id="ef_pain" onchange="A.filterExercises()" style="background:var(--bg-surface);border:1.5px solid var(--border);border-radius:var(--r-md);padding:10px 14px;font-size:var(--text-sm);color:var(--text-primary);cursor:pointer;min-height:44px">
          <option value="">🩺 All Pain Types</option>
          ${painTypes.map(p => `<option value="${p}" ${filters.painType === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select id="ef_body" onchange="A.filterExercises()" style="background:var(--bg-surface);border:1.5px solid var(--border);border-radius:var(--r-md);padding:10px 14px;font-size:var(--text-sm);color:var(--text-primary);cursor:pointer;min-height:44px">
          <option value="">🦴 All Body Parts</option>
          ${bodyParts.map(b => `<option value="${b}" ${filters.bodyPart === b ? 'selected' : ''}>${b}</option>`).join('')}
        </select>
        <div class="diff-chips">
          ${['All','Easy','Medium','Hard'].map(d => `
            <button class="diff-chip ${filters.difficulty === (d === 'All' ? '' : d) ? 'active' : ''}" data-diff="${d}"
              onclick="A.filterByDifficulty('${d === 'All' ? '' : d}')">${d}</button>
          `).join('')}
        </div>
      </div>

      <!-- Results count -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s-4)">
        <span style="font-size:var(--text-sm);color:var(--text-muted)">${filtered.length} exercise${filtered.length !== 1 ? 's' : ''} found</span>
        ${(filters.painType || filters.bodyPart || filters.difficulty) ? `<button class="btn btn-g btn-sm" onclick="A.clearExerciseFilters()">✕ Clear Filters</button>` : ''}
      </div>

      <!-- Exercise Grid -->
      <div class="exercise-grid" id="exercise-grid">
        ${filtered.length === 0
          ? `<div style="text-align:center;padding:var(--s-16);grid-column:1/-1">
               <div style="font-size:48px;margin-bottom:var(--s-4)">🔍</div>
               <h3>No exercises found</h3>
               <p style="color:var(--text-secondary);margin-top:var(--s-2)">Try different filters</p>
             </div>`
          : filtered.map(ex => this._exerciseCard(ex, mode)).join('')
        }
      </div>
    </div>`;
  },

  _exerciseCard(ex, mode) {
    const dc = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
    return `
    <div class="exercise-card" id="ec-${ex.id}" onclick="A.toggleExercise('${ex.id}')">
      <div class="ec-header">
        <div class="ec-icon">${ex.icon}</div>
        <div class="ec-info">
          <div class="ec-name">${ex.name}</div>
          <div class="ec-body">${ex.bodyPart} • ${ex.painType}</div>
          <div class="ec-badges">
            <span class="diff-badge-${dc[ex.difficulty]}">${ex.difficulty}</span>
            <span style="background:var(--bg-surface);color:var(--text-secondary);padding:2px 8px;border-radius:var(--r-full);font-size:10px;font-weight:600">${ex.painType}</span>
          </div>
        </div>
      </div>
      <div class="ec-meta">
        <span>⏱️ ${ex.duration}</span>
        <span>🔁 ${ex.reps}</span>
      </div>
      <div class="ec-instructions">${ex.instructions}</div>
      <div class="ec-actions">
        <button class="btn btn-g btn-sm" onclick="event.stopPropagation();A.toggleExercise('${ex.id}')">📋 Instructions</button>
        ${mode === 'physio' ? `<button class="btn btn-p btn-sm" onclick="event.stopPropagation();A.addExerciseToPlan('${ex.id}')">+ Add to Plan</button>` : ''}
      </div>
    </div>`;
  },

  toggleExercise(id) {
    const el = document.getElementById('ec-' + id);
    if (el) el.classList.toggle('expanded');
  },

  _exerciseFilters: {},

  filterExercises() {
    this._exerciseFilters = {
      ...this._exerciseFilters,
      painType: document.getElementById('ef_pain')?.value || '',
      bodyPart: document.getElementById('ef_body')?.value || '',
    };
    this._reloadExerciseGrid();
  },

  filterByDifficulty(diff) {
    this._exerciseFilters = { ...this._exerciseFilters, difficulty: diff };
    // update chip active states
    document.querySelectorAll('.diff-chip').forEach(c => {
      const d = c.getAttribute('data-diff');
      c.classList.toggle('active', (d === 'All' && diff === '') || (d === diff));
    });
    this._reloadExerciseGrid();
  },

  clearExerciseFilters() {
    this._exerciseFilters = {};
    this.renderExerciseLibraryPage();
  },

  renderExerciseLibraryPage() {
    const exercises = this.db.get('exercise_library');
    const painTypes = [...new Set(exercises.map(e => e.painType))];
    const bodyParts = [...new Set(exercises.map(e => e.bodyPart))];
    const container = document.getElementById('exercise-lib-root');
    if (container) {
      container.innerHTML = this._renderExerciseLibrary(exercises, painTypes, bodyParts, this._exerciseFilters || {}, 'customer');
    }
  },

  _reloadExerciseGrid() {
    const exercises = this.db.get('exercise_library');
    let filtered = exercises;
    if (this._exerciseFilters?.painType) filtered = filtered.filter(e => e.painType === this._exerciseFilters.painType);
    if (this._exerciseFilters?.bodyPart) filtered = filtered.filter(e => e.bodyPart === this._exerciseFilters.bodyPart);
    if (this._exerciseFilters?.difficulty) filtered = filtered.filter(e => e.difficulty === this._exerciseFilters.difficulty);
    const grid = document.getElementById('exercise-grid');
    if (!grid) return;
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="text-align:center;padding:var(--s-16);grid-column:1/-1"><div style="font-size:48px;margin-bottom:var(--s-4)">🔍</div><h3>No exercises found</h3><p style="color:var(--text-secondary);margin-top:var(--s-2)">Try different filters</p></div>`;
      return;
    }
    grid.innerHTML = filtered.map(ex => this._exerciseCard(ex, 'customer')).join('');
  },

  // ===== PHYSIOTHERAPIST PANEL (Admin sub-panel) =====
  physioDash() {
    const plans = this.db.get('patient_exercise_plans');
    const exercises = this.db.get('exercise_library');
    const users = this.db.get('users');

    return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-6)">
        <h2 style="font-size:var(--text-xl)">🏋️ Physiotherapy Management</h2>
        <button class="btn btn-p btn-sm" onclick="A.showCreatePlanModal()">+ Create Plan</button>
      </div>

      <div class="stats-g" style="grid-template-columns:repeat(3,1fr);margin-bottom:var(--s-6)">
        <div class="stat"><div class="st-icon" style="background:var(--primary-subtle);color:var(--primary)">📋</div><div class="st-val">${plans.length}</div><div class="st-label">Active Plans</div></div>
        <div class="stat"><div class="st-icon" style="background:var(--success-bg);color:var(--success)">🏋️</div><div class="st-val">${exercises.length}</div><div class="st-label">Exercises</div></div>
        <div class="stat"><div class="st-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">👥</div><div class="st-val">${users.length}</div><div class="st-label">Patients</div></div>
      </div>

      <div id="plan-create-area"></div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--s-4);margin-bottom:var(--s-6)">
        ${plans.map(p => {
          const u = this.db.getOne('users', p.patientId) || { name: p.patientName };
          const exs = (p.exercises || []).map(eid => this.db.getOne('exercise_library', eid)).filter(Boolean);
          return `
          <div class="plan-card">
            <div class="pc-header">
              <div>
                <div class="pc-title">📋 ${p.title}</div>
                <div class="pc-patient">👤 ${u.name} · ${p.frequency}</div>
              </div>
              <span class="badge ${p.status === 'active' ? 'badge-s' : 'badge-n'}">${p.status}</span>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:var(--s-2)">${p.notes || ''}</div>
            <div class="plan-exercises">
              ${exs.map(e => `<span class="plan-ex-chip">${e.icon} ${e.name}</span>`).join('')}
            </div>
            <div style="margin-top:var(--s-3);display:flex;gap:var(--s-2)">
              <button class="btn btn-g btn-sm" onclick="A.toast('Tracking progress for ${u.name}','info')">📈 Track</button>
              <button class="btn btn-g btn-sm" onclick="A.editPlan('${p.id}')">✏️ Edit</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div>
        <div class="sec-h"><h3>📚 Exercise Library</h3><button class="btn btn-g btn-sm" onclick="A.filterByDifficulty('')">Show All</button></div>
        ${this._renderExerciseLibrary(exercises, [...new Set(exercises.map(e => e.painType))], [...new Set(exercises.map(e => e.bodyPart))], {}, 'physio')}
      </div>
    </div>`;
  },

  showCreatePlanModal() {
    const exercises = this.db.get('exercise_library');
    const users = this.db.get('users');
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()" style="max-width:540px">
      <div class="modal-h">
        <h3>📋 Create Exercise Plan</h3>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="modal-b">
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">PATIENT</label>
          <select class="inp" id="plan_patient">
            ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">PLAN TITLE</label>
          <input class="inp" id="plan_title" placeholder="e.g. Lower Back Recovery Plan"/>
        </div>
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">EXERCISES (select multiple)</label>
          <div style="max-height:200px;overflow-y:auto;border:1.5px solid var(--border);border-radius:var(--r-md);padding:var(--s-2)">
            ${exercises.map(e => `
            <label style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-2) var(--s-3);border-radius:var(--r-sm);cursor:pointer;font-size:var(--text-sm)">
              <input type="checkbox" name="plan_ex" value="${e.id}" style="width:16px;height:16px;accent-color:var(--primary)"/>
              <span>${e.icon} ${e.name}</span>
              <span class="diff-badge-${e.difficulty.toLowerCase()}" style="margin-left:auto">${e.difficulty}</span>
            </label>`).join('')}
          </div>
        </div>
        <div class="inp-grp" style="margin-bottom:var(--s-4)">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">FREQUENCY</label>
          <input class="inp" id="plan_freq" placeholder="e.g. Daily — 20 min" value="Daily — 20 min"/>
        </div>
        <div class="inp-grp">
          <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">NOTES</label>
          <textarea class="inp" id="plan_notes" rows="2" placeholder="Guidance notes for patient..."></textarea>
        </div>
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
        <button class="btn btn-p" onclick="A.savePlan()">💾 Save Plan</button>
      </div>
    </div></div>`;
  },

  savePlan() {
    const patientId = document.getElementById('plan_patient')?.value;
    const title = document.getElementById('plan_title')?.value?.trim();
    const freq = document.getElementById('plan_freq')?.value?.trim();
    const notes = document.getElementById('plan_notes')?.value?.trim();
    const exChecks = [...document.querySelectorAll('input[name=plan_ex]:checked')].map(c => c.value);
    if (!title) { this.toast('Enter a plan title', 'error'); return; }
    if (exChecks.length === 0) { this.toast('Select at least one exercise', 'error'); return; }
    const user = this.db.getOne('users', patientId) || { name: 'Patient' };
    this.db.add('patient_exercise_plans', {
      id: 'PEP' + Date.now(), patientId, patientName: user.name,
      title, exercises: exChecks, frequency: freq, notes,
      createdBy: 'ADM-C1', createdByName: 'Physiotherapist',
      status: 'active', createdAt: new Date().toISOString()
    });
    document.getElementById('modal-root').innerHTML = '';
    this.toast('Exercise plan created! 💪');
    this.route();
  },

  editPlan(planId) {
    const p = this.db.getOne('patient_exercise_plans', planId);
    if (!p) return;
    const newStatus = p.status === 'active' ? 'completed' : 'active';
    this.db.update('patient_exercise_plans', planId, { status: newStatus });
    this.toast(`Plan marked as ${newStatus}`);
    this.route();
  },

  addExerciseToPlan(exId) {
    this.toast('Use "Create Plan" to assign exercises to a patient', 'info');
  },

  // ===== BPT SMART SUGGESTION =====
  getBptSuggestions(painType) {
    const exercises = this.db.get('exercise_library');
    return exercises.filter(e => e.painType === painType).slice(0, 3);
  },

  showBptSuggestions(painType) {
    const sugg = this.getBptSuggestions(painType);
    if (sugg.length === 0) { this.toast('No exercises found for this pain type', 'info'); return; }
    document.getElementById('modal-root').innerHTML = `
    <div class="modal-ov" onclick="document.getElementById('modal-root').innerHTML=''">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-h">
        <h3>💡 Suggested Exercises — ${painType}</h3>
        <button class="modal-x" onclick="document.getElementById('modal-root').innerHTML=''">✕</button>
      </div>
      <div class="modal-b">
        ${sugg.map(ex => `
        <div class="exercise-card" style="margin-bottom:var(--s-3)" onclick="this.classList.toggle('expanded')">
          <div class="ec-header">
            <div class="ec-icon">${ex.icon}</div>
            <div class="ec-info">
              <div class="ec-name">${ex.name}</div>
              <div class="ec-body">${ex.bodyPart}</div>
              <div class="ec-badges"><span class="diff-badge-${ex.difficulty.toLowerCase()}">${ex.difficulty}</span></div>
            </div>
          </div>
          <div class="ec-meta"><span>⏱️ ${ex.duration}</span><span>🔁 ${ex.reps}</span></div>
          <div class="ec-instructions">${ex.instructions}</div>
        </div>`).join('')}
      </div>
      <div class="modal-f">
        <button class="btn btn-g" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
        <button class="btn btn-p" onclick="document.getElementById('modal-root').innerHTML='';location.hash='#/customer/bptbook'">Book Session →</button>
      </div>
    </div></div>`;
  },

}); // end bpt mixin
