/* ============================================================
   NOYA Kids · Life Lab — Parent Mode
   ------------------------------------------------------------
   A calm build-the-environment panel, not a surveillance center.
   The parent seeds goals, tasks, baseline, challenges, money and
   growth events — then hands the world back to the child.
   Text/number edits commit on an explicit button (so typing is
   never interrupted by a re-render); toggles commit immediately.
   ============================================================ */
(function (NOYA) {
  'use strict';
  const { Store, V } = NOYA;
  const esc = NOYA._esc, h = NOYA._h;

  let editId = null; // which child the parent is editing

  V.parent = function (state) {
    if (!editId || !state.children[editId]) editId = state.currentChild;
    const child = state.children[editId];
    const wrap = h(`<main class="parent"></main>`);

    /* ---- overview of both children ---- */
    const ov = h(`<section class="card p-overview"></section>`);
    ov.appendChild(h(`<div class="card-head"><h2>近期状态</h2><span class="card-sub">帮助搭建环境，然后把管理权交给孩子</span></div>`));
    const grid = h(`<div class="ov-grid"></div>`);
    NOYA.CHILD_ORDER.forEach((id) => {
      const c = state.children[id];
      const doneToday = c.today.filter((t) => t.done).length;
      const avg = Math.round(NOYA.ISLANDS.reduce((a, i) => a + c.islands[i.id].progress, 0) / NOYA.ISLANDS.length);
      const bars = NOYA.ISLANDS.map((i) =>
        `<span class="ov-bar" title="${esc(i.name)}"><i style="height:${c.islands[i.id].progress}%;background:${i.color}"></i></span>`).join('');
      grid.appendChild(h(`
        <div class="ov-card" data-theme="${c.worldTheme}">
          <div class="ov-top"><b>${esc(c.name)}</b><span>${NOYA.AGE_LEVELS[c.ageLevel].label}</span></div>
          <div class="ov-bars">${bars}</div>
          <div class="ov-meta">
            <span>✦ ${c.stars}</span><span>今日 ${doneToday}/${c.today.length}</span><span>平均 ${avg}%</span>
          </div>
          <button class="ov-edit ${id === editId ? 'on' : ''}" data-edit="${id}">${id === editId ? '编辑中' : '编辑这个孩子'}</button>
        </div>`));
    });
    ov.appendChild(grid);
    wrap.appendChild(ov);

    /* ---- editing panels for the selected child ---- */
    const head = h(`<div class="p-editing"><span class="p-tag" data-theme="${child.worldTheme}">正在编辑</span>
      <b>${esc(child.name)}</b><span class="p-en">${child.en} · ${NOYA.AGE_LEVELS[child.ageLevel].label}</span></div>`);
    wrap.appendChild(head);

    const cols = h(`<div class="p-cols"></div>`);

    /* helper to build a section card */
    const section = (title, sub) => {
      const s = h(`<section class="card p-sec"></section>`);
      s.appendChild(h(`<div class="card-head"><h2>${title}</h2>${sub ? `<span class="card-sub">${sub}</span>` : ''}</div>`));
      return s;
    };
    const commit = (fn) => Store.updateChild(editId, fn);

    /* ---- Semester goals ---- */
    const sem = section('学期目标', '完成一关，地图上前进一步');
    const cycle = { locked: 'done', done: 'current', current: 'locked' };
    const stList = h(`<div class="p-list"></div>`);
    child.semester.stages.forEach((s, idx) => {
      const sub = child.semester.subjects.find((x) => x.id === s.subject) || {};
      const row = h(`<div class="p-row">
        <button class="p-status st-${s.status}" title="切换状态">${{done:'✓',current:'★',locked:'·'}[s.status]}</button>
        <span class="p-dot" style="background:${sub.color||'#ccc'}"></span>
        <span class="p-row-main"><b>${esc(s.title)}</b><i>${esc(sub.name||'')} · ${esc(s.note||'')}</i></span>
        <button class="p-del" title="删除">✕</button></div>`);
      row.querySelector('.p-status').addEventListener('click', () => commit((c) => { c.semester.stages[idx].status = cycle[s.status]; }));
      row.querySelector('.p-del').addEventListener('click', () => commit((c) => c.semester.stages.splice(idx, 1)));
      stList.appendChild(row);
    });
    sem.appendChild(stList);
    const subjOpts = child.semester.subjects.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    const semForm = h(`<div class="p-form">
      <select class="pf-sub">${subjOpts}</select>
      <input class="pf-title" placeholder="关卡名，如「乘法熟练」"/>
      <input class="pf-note" placeholder="说明（可选）"/>
      <button class="pf-add">＋ 添加关卡</button></div>`);
    semForm.querySelector('.pf-add').addEventListener('click', () => {
      const title = semForm.querySelector('.pf-title').value.trim(); if (!title) return;
      commit((c) => c.semester.stages.push({
        id: 's_' + Date.now(), subject: semForm.querySelector('.pf-sub').value,
        title, status: 'locked', note: semForm.querySelector('.pf-note').value.trim() }));
    });
    sem.appendChild(semForm);
    cols.appendChild(sem);

    /* ---- Today quests ---- */
    const tod = section('今日任务', '只放今天最重要的几件');
    const tList = h(`<div class="p-list"></div>`);
    child.today.forEach((t, idx) => {
      const isl = NOYA.ISLANDS.find((i) => i.id === t.island) || {};
      const row = h(`<div class="p-row">
        <span class="p-ic">${t.icon}</span>
        <span class="p-row-main"><b>${esc(t.title)}</b><i>${esc(isl.name||'')}${t.optional?' · 可选':''}${t.done?' · 已完成':''}</i></span>
        <button class="p-del">✕</button></div>`);
      row.querySelector('.p-del').addEventListener('click', () => commit((c) => c.today.splice(idx, 1)));
      tList.appendChild(row);
    });
    tod.appendChild(tList);
    const islOpts = NOYA.ISLANDS.map((i) => `<option value="${i.id}">${esc(i.name)}</option>`).join('');
    const todForm = h(`<div class="p-form">
      <input class="pf-ic" placeholder="📚" value="📚" maxlength="2" style="max-width:56px"/>
      <select class="pf-isl">${islOpts}</select>
      <input class="pf-title" placeholder="任务，如「复习乘法」"/>
      <label class="pf-check"><input type="checkbox" class="pf-opt"/>可选挑战</label>
      <button class="pf-add">＋ 添加任务</button></div>`);
    todForm.querySelector('.pf-add').addEventListener('click', () => {
      const title = todForm.querySelector('.pf-title').value.trim(); if (!title) return;
      commit((c) => c.today.push({ id: 't_' + Date.now(),
        island: todForm.querySelector('.pf-isl').value,
        icon: todForm.querySelector('.pf-ic').value || '✨',
        title, done: false, optional: todForm.querySelector('.pf-opt').checked }));
    });
    tod.appendChild(todForm);
    cols.appendChild(tod);

    /* ---- Baseline ---- */
    const base = section('Baseline · 基本生活线', '本来就要承担的基本责任');
    const bList = h(`<div class="p-list"></div>`);
    child.baseline.forEach((b, idx) => {
      const row = h(`<div class="p-row">
        <button class="p-status ${b.done ? 'st-done' : 'st-locked'}">${b.done ? '✓' : '·'}</button>
        <span class="p-ic">${b.icon}</span>
        <span class="p-row-main"><b>${esc(b.title)}</b></span>
        <button class="p-del">✕</button></div>`);
      row.querySelector('.p-status').addEventListener('click', () => commit((c) => c.baseline[idx].done = !c.baseline[idx].done));
      row.querySelector('.p-del').addEventListener('click', () => commit((c) => c.baseline.splice(idx, 1)));
      bList.appendChild(row);
    });
    base.appendChild(bList);
    const bForm = h(`<div class="p-form">
      <input class="pf-ic" placeholder="🎒" value="✓" maxlength="2" style="max-width:56px"/>
      <input class="pf-title" placeholder="基本责任，如「准备第二天用品」"/>
      <button class="pf-add">＋ 添加</button></div>`);
    bForm.querySelector('.pf-add').addEventListener('click', () => {
      const title = bForm.querySelector('.pf-title').value.trim(); if (!title) return;
      commit((c) => c.baseline.push({ icon: bForm.querySelector('.pf-ic').value || '✓', title, done: false }));
    });
    base.appendChild(bForm);
    cols.appendChild(base);

    /* ---- Beyond ---- */
    const bey = section('Beyond · 超越基本线', '主动创造的额外价值');
    const yList = h(`<div class="p-list"></div>`);
    const yCycle = { idea: 'doing', doing: 'done', done: 'idea' };
    child.beyond.forEach((b, idx) => {
      const row = h(`<div class="p-row">
        <button class="p-status st-${b.status}" title="切换状态">${{done:'✓',doing:'…',idea:'○'}[b.status]}</button>
        <span class="p-ic">${b.icon}</span>
        <span class="p-row-main"><b>${esc(b.title)}</b><i>✦ ${b.credit||0}</i></span>
        <button class="p-del">✕</button></div>`);
      row.querySelector('.p-status').addEventListener('click', () => commit((c) => c.beyond[idx].status = yCycle[b.status]));
      row.querySelector('.p-del').addEventListener('click', () => commit((c) => c.beyond.splice(idx, 1)));
      yList.appendChild(row);
    });
    bey.appendChild(yList);
    const yForm = h(`<div class="p-form">
      <input class="pf-ic" placeholder="🌟" value="🌟" maxlength="2" style="max-width:56px"/>
      <input class="pf-title" placeholder="额外挑战"/>
      <input class="pf-credit" type="number" min="0" placeholder="✦" value="3" style="max-width:64px"/>
      <button class="pf-add">＋ 添加</button></div>`);
    yForm.querySelector('.pf-add').addEventListener('click', () => {
      const title = yForm.querySelector('.pf-title').value.trim(); if (!title) return;
      commit((c) => c.beyond.push({ icon: yForm.querySelector('.pf-ic').value || '🌟', title,
        status: 'idea', credit: +yForm.querySelector('.pf-credit').value || 0 }));
    });
    bey.appendChild(yForm);
    cols.appendChild(bey);

    /* ---- Money ---- */
    const money = section('财富账户', '调整各个池子里的资源');
    const mForm = h(`<div class="p-money"></div>`);
    const poolInputs = NOYA.MONEY_POOLS.map((p) =>
      `<label class="pm-field"><span style="color:${p.color}">${esc(p.name)} ${p.en}</span>
        <input type="number" min="0" class="pm-in" data-pool="${p.id}" value="${child.money.pools[p.id]}"/></label>`).join('');
    mForm.innerHTML = `
      ${poolInputs}
      <label class="pm-field pm-wide"><span>目标名称</span><input class="pm-goal" value="${esc(child.money.goalName)}"/></label>
      <label class="pm-field"><span>目标金额</span><input type="number" min="1" class="pm-target" value="${child.money.goalTarget}"/></label>
      <button class="pm-save">保存财富账户</button>`;
    mForm.querySelector('.pm-save').addEventListener('click', () => {
      commit((c) => {
        mForm.querySelectorAll('.pm-in').forEach((inp) => c.money.pools[inp.getAttribute('data-pool')] = Math.max(0, +inp.value || 0));
        c.money.goalName = mForm.querySelector('.pm-goal').value.trim() || c.money.goalName;
        c.money.goalTarget = Math.max(1, +mForm.querySelector('.pm-target').value || 1);
      });
      V.toast('已保存 ✦');
    });
    money.appendChild(mForm);
    cols.appendChild(money);

    /* ---- Timeline ---- */
    const tl = section('成长事件', '记录真正经历过的时刻');
    const tlList = h(`<div class="p-list"></div>`);
    child.timeline.slice().sort((a,b)=>a.month-b.month).forEach((e) => {
      const idx = child.timeline.indexOf(e);
      const row = h(`<div class="p-row">
        <span class="p-mo">${e.month}月</span><span class="p-ic">${e.icon}</span>
        <span class="p-row-main"><b>${esc(e.title)}</b><i>${esc(e.note||'')}</i></span>
        <button class="p-del">✕</button></div>`);
      row.querySelector('.p-del').addEventListener('click', () => commit((c) => c.timeline.splice(idx, 1)));
      tlList.appendChild(row);
    });
    tl.appendChild(tlList);
    const moOpts = Array.from({length:12}, (_,i)=>`<option value="${i+1}">${i+1}月</option>`).join('');
    const tlForm = h(`<div class="p-form">
      <select class="pf-mo">${moOpts}</select>
      <input class="pf-ic" placeholder="🌟" value="🌟" maxlength="2" style="max-width:56px"/>
      <input class="pf-title" placeholder="事件"/>
      <input class="pf-note" placeholder="一句话（可选）"/>
      <button class="pf-add">＋ 添加</button></div>`);
    tlForm.querySelector('.pf-add').addEventListener('click', () => {
      const title = tlForm.querySelector('.pf-title').value.trim(); if (!title) return;
      commit((c) => c.timeline.push({ month: +tlForm.querySelector('.pf-mo').value,
        icon: tlForm.querySelector('.pf-ic').value || '🌟', title,
        note: tlForm.querySelector('.pf-note').value.trim() }));
    });
    tl.appendChild(tlForm);
    cols.appendChild(tl);

    wrap.appendChild(cols);

    /* wire the child-edit switch */
    ov.querySelectorAll('.ov-edit').forEach((b) =>
      b.addEventListener('click', () => { editId = b.getAttribute('data-edit'); Store.emit(); }));

    return wrap;
  };
})(window.NOYA = window.NOYA || {});
