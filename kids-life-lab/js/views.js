/* ============================================================
   NOYA Kids · Life Lab — Views
   ------------------------------------------------------------
   Pure-ish render functions.  The world map, Today, Journey,
   Baseline/Beyond render from state; the interactive overlays
   (Island, Money, My Year, Decision Lab, Parent) manage their
   own small pieces of local UI state and persist through Store.
   ============================================================ */
(function (NOYA) {
  'use strict';

  const { Store, SVG } = NOYA;
  const V = {};

  /* ---------- tiny DOM helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const islandById = (id) => NOYA.ISLANDS.find((i) => i.id === id);

  let toastTimer = null;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('<div class="toast" role="status"></div>'); document.body.appendChild(t); }
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }
  V.toast = toast;

  /* ---------- generic modal ---------- */
  function modal(titleHTML, bodyNode, cls) {
    const back = h(`<div class="modal-back"></div>`);
    const win = h(`<div class="modal ${cls || ''}"></div>`);
    const head = h(`<div class="modal-head"><div class="modal-title">${titleHTML}</div>
      <button class="modal-close" aria-label="关闭">✕</button></div>`);
    win.appendChild(head);
    const body = h(`<div class="modal-body"></div>`);
    body.appendChild(bodyNode);
    win.appendChild(body);
    back.appendChild(win);
    const close = () => { back.classList.remove('in'); setTimeout(() => back.remove(), 200); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    head.querySelector('.modal-close').addEventListener('click', close);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    requestAnimationFrame(() => back.classList.add('in'));
    return { back, win, body, close };
  }
  V.modal = modal;

  /* ============================================================
     TOP-LEVEL RENDER
     ============================================================ */
  V.render = function (state) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(V.header(state));
    if (state.parentMode) {
      app.appendChild(V.parent(state));
    } else {
      const child = Store.current();
      app.setAttribute('data-theme', child.worldTheme);
      app.appendChild(V.world(child));
    }
  };

  /* ---------- header + child switcher ---------- */
  V.header = function (state) {
    const wrap = h(`<header class="topbar"></header>`);
    wrap.innerHTML = `
      <div class="brand">
        <span class="brand-mark">◈</span>
        <span class="brand-name">NOYA Kids <span class="brand-dot">·</span> Life Lab</span>
      </div>
      <div class="switcher" role="tablist" aria-label="选择孩子"></div>
      <button class="parent-btn ${state.parentMode ? 'on' : ''}" data-action="toggle-parent">
        ${state.parentMode ? '← 回到孩子的世界' : '家长入口'}
      </button>`;
    const sw = wrap.querySelector('.switcher');
    NOYA.CHILD_ORDER.forEach((id) => {
      const c = state.children[id];
      const on = !state.parentMode && state.currentChild === id;
      const b = h(`<button class="chip ${on ? 'on' : ''}" data-action="switch-child" data-id="${id}"
        role="tab" aria-selected="${on}" data-theme="${c.worldTheme}">
        <span class="chip-orb"></span><span>${esc(c.name)}</span></button>`);
      sw.appendChild(b);
    });
    return wrap;
  };

  /* ============================================================
     MY WORLD
     ============================================================ */
  V.world = function (child) {
    const wrap = h(`<main class="world"></main>`);

    /* hero */
    const doneCount = child.today.filter((t) => t.done).length;
    wrap.appendChild(h(`
      <section class="hero">
        <div class="hero-left">
          <div class="hero-kicker">${esc(child.name)} 的世界 · Day ${child.day}</div>
          <h1 class="hero-title">MY WORLD</h1>
          <p class="hero-motto">“${esc(child.motto)}”</p>
        </div>
        <div class="hero-right">
          <div class="hero-stat"><b>${child.stars}</b><span>✦ 星星</span></div>
          <div class="hero-stat"><b>${doneCount}/${child.today.length}</b><span>今日</span></div>
          <div class="hero-season">${esc(child.season)}</div>
        </div>
      </section>`));

    /* portals row */
    const portals = h(`<nav class="portals"></nav>`);
    portals.innerHTML = `
      <button class="portal" data-action="open-journey"><span>🗺️</span><b>学期旅程</b><i>Semester Journey</i></button>
      <button class="portal" data-action="open-year"><span>📖</span><b>我的一年</b><i>My Life Atlas</i></button>
      <button class="portal" data-action="open-decision"><span>🔮</span><b>选择实验室</b><i>Decision Lab</i></button>
      <button class="portal" data-action="open-island" data-island="money"><span>🏝️</span><b>财富岛</b><i>Money Island</i></button>`;
    wrap.appendChild(portals);

    /* Today */
    wrap.appendChild(V.today(child));

    /* World map */
    wrap.appendChild(V.map(child));

    /* Baseline & Beyond */
    wrap.appendChild(V.baseline(child));

    /* footer note */
    wrap.appendChild(h(`<footer class="worldfoot">
      <span>这是 ${esc(child.name)} 自己的世界 — 一点一点建起来。</span>
      <button class="linkbtn" data-action="reset-data">重置示例数据</button>
    </footer>`));

    return wrap;
  };

  /* ---------- Today's Quest ---------- */
  V.today = function (child) {
    const sec = h(`<section class="card today"></section>`);
    sec.appendChild(h(`<div class="card-head"><h2>Today's Quest</h2><span class="card-sub">今天最重要的几件小事</span></div>`));
    const list = h(`<div class="quests"></div>`);
    child.today.forEach((q) => {
      const isl = islandById(q.island);
      const card = h(`
        <button class="quest ${q.done ? 'done' : ''}" data-action="toggle-quest" data-id="${q.id}"
          style="--isl:${isl ? isl.color : '#b0946a'}">
          <span class="quest-check">${q.done ? '✓' : ''}</span>
          <span class="quest-icon">${q.icon}</span>
          <span class="quest-main">
            <span class="quest-title">${esc(q.title)}</span>
            <span class="quest-tag">${isl ? esc(isl.name) : ''}${q.optional ? ' · 可选挑战' : ''}</span>
          </span>
        </button>`);
      list.appendChild(card);
    });
    sec.appendChild(list);
    return sec;
  };

  /* ---------- World Map ---------- */
  V.map = function (child) {
    const sec = h(`<section class="card mapcard"></section>`);
    sec.appendChild(h(`<div class="card-head"><h2>My World Map</h2><span class="card-sub">点一座岛，进去看看</span></div>`));

    const pos = {
      learning: { cx: 205, cy: 165, scale: 1 },
      life:     { cx: 795, cy: 150, scale: 1 },
      home:     { cx: 260, cy: 410, scale: 1 },
      growth:   { cx: 800, cy: 410, scale: 1 },
      money:    { cx: 515, cy: 295, scale: 1.12 },
    };

    let isles = '';
    NOYA.ISLANDS.forEach((isl) => {
      isles += SVG.island(isl, { ...pos[isl.id], progress: child.islands[isl.id].progress });
    });

    /* scenery */
    let stars = '';
    const starPts = [[120,70],[360,60],[640,80],[900,70],[70,300],[940,300],[430,120],[700,250]];
    starPts.forEach((p, i) => stars += SVG.star(p[0], p[1], 2 + (i % 3) * 0.7, 0.75));

    const svg = `
      <svg viewBox="0 0 1000 560" class="worldmap" role="img" aria-label="${esc(child.name)} 的世界地图" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sea" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stop-color="var(--sea-1)"/>
            <stop offset="100%" stop-color="var(--sea-2)"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="560" rx="22" fill="url(#sea)"/>
        <g class="sea-lines" stroke="var(--sea-line)" stroke-width="1.2" fill="none" opacity="0.5">
          <path d="M60 470 q40 -10 80 0 t80 0"/>
          <path d="M700 490 q40 -10 80 0 t80 0"/>
          <path d="M420 500 q30 -8 60 0 t60 0"/>
        </g>
        <path class="routes" d="M240 190 Q380 120 505 270 Q640 380 780 180 M300 380 Q420 330 505 300 M540 320 Q680 380 800 380"
              fill="none" stroke="var(--route)" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.6"/>
        ${stars}
        ${SVG.tree(120, 470, 1.3)} ${SVG.tree(150, 480, 1)} ${SVG.tree(905, 470, 1.2)}
        ${SVG.boat(620, 470)}
        ${SVG.lighthouse(70, 150)}
        ${isles}
        ${SVG.compass(925, 490)}
      </svg>`;
    const holder = h(`<div class="mapwrap"></div>`);
    holder.innerHTML = svg;
    sec.appendChild(holder);
    return sec;
  };

  /* ---------- Baseline & Beyond ---------- */
  V.baseline = function (child) {
    const sec = h(`<section class="bb"></section>`);

    const baseDone = child.baseline.filter((b) => b.done).length;
    const base = h(`<div class="card bb-base"></div>`);
    base.appendChild(h(`<div class="card-head"><h2>Baseline · 基本生活线</h2>
      <span class="card-sub">作为家庭成员、学生和照顾自己的人，本来就要做的事 · ${baseDone}/${child.baseline.length}</span></div>`));
    const bl = h(`<div class="baseline-list"></div>`);
    child.baseline.forEach((b, i) => {
      bl.appendChild(h(`<button class="bl-item ${b.done ? 'done' : ''}" data-action="toggle-baseline" data-index="${i}">
        <span class="bl-check">${b.done ? '✓' : ''}</span><span class="bl-ic">${b.icon}</span>
        <span class="bl-title">${esc(b.title)}</span></button>`));
    });
    base.appendChild(bl);
    sec.appendChild(base);

    const beyond = h(`<div class="card bb-beyond"></div>`);
    beyond.appendChild(h(`<div class="card-head"><h2>Beyond the Line · 超越基本线</h2>
      <span class="card-sub">主动创造的额外价值 — 未来会变成 Value Credit</span></div>`));
    const yl = h(`<div class="beyond-list"></div>`);
    const statusLabel = { done: '已完成', doing: '进行中', idea: '想法' };
    child.beyond.forEach((b) => {
      yl.appendChild(h(`<div class="by-item st-${b.status}">
        <span class="by-ic">${b.icon}</span>
        <span class="by-main"><span class="by-title">${esc(b.title)}</span>
        <span class="by-status">${statusLabel[b.status] || ''}</span></span>
        <span class="by-credit">${b.credit ? '✦ ' + b.credit : '—'}</span></div>`));
    });
    beyond.appendChild(yl);
    beyond.appendChild(h(`<div class="by-hint">value credit 只是让努力被看见，不是“做一件赚多少钱”。</div>`));
    sec.appendChild(beyond);

    return sec;
  };

  /* ============================================================
     ISLAND OVERLAY
     ============================================================ */
  V.openIsland = function (id) {
    if (id === 'money') return V.openMoney();
    const child = Store.current();
    const isl = islandById(id);
    const data = child.islands[id];
    const body = h(`<div class="isle-panel" style="--isl:${isl.color};--isl-tint:${isl.tint}"></div>`);
    let items = '';
    data.items.forEach((it, i) => {
      items += `<button class="ip-item ${it.done ? 'done' : ''}" data-ip="${i}">
        <span class="ip-check">${it.done ? '✓' : ''}</span><span>${esc(it.title)}</span></button>`;
    });
    body.innerHTML = `
      <div class="ip-hero">
        <div class="ip-badge">${isl.no}</div>
        <div>
          <div class="ip-en">${isl.en}</div>
          <div class="ip-blurb">${esc(isl.blurb)}</div>
        </div>
      </div>
      <div class="ip-progress"><div class="ip-bar"><i style="width:${data.progress}%"></i></div><b>${data.progress}%</b></div>
      <p class="ip-note">${esc(data.note)}</p>
      <div class="ip-items">${items}</div>`;

    const m = modal(`<span class="mt-ic" style="color:${isl.color}">●</span> ${esc(isl.name)} <span class="mt-en">${isl.en}</span>`, body, 'wide');

    body.querySelectorAll('.ip-item').forEach((el) => {
      el.addEventListener('click', () => {
        const i = +el.getAttribute('data-ip');
        Store.updateChild(child.id, (c) => {
          const item = c.islands[id].items[i];
          item.done = !item.done;
          const done = c.islands[id].items.filter((x) => x.done).length;
          c.islands[id].progress = Math.round((done / c.islands[id].items.length) * 100);
        });
        const nd = Store.child(child.id).islands[id];
        el.classList.toggle('done');
        el.querySelector('.ip-check').textContent = el.classList.contains('done') ? '✓' : '';
        body.querySelector('.ip-bar i').style.width = nd.progress + '%';
        body.querySelector('.ip-progress b').textContent = nd.progress + '%';
      });
    });
  };

  /* ============================================================
     MONEY ISLAND
     ============================================================ */
  function total(pools) { return Object.values(pools).reduce((a, b) => a + b, 0); }

  V.openMoney = function () {
    const child = Store.current();
    const body = h(`<div class="money-panel"></div>`);
    const m = modal(`<span class="mt-ic" style="color:#5c9187">●</span> 财富岛 <span class="mt-en">Money Island</span>`, body, 'wide');

    function paint() {
      const c = Store.child(child.id);
      const p = c.money.pools;
      const t = total(p);
      const goalPct = Math.min(100, Math.round((p.goal / c.money.goalTarget) * 100));
      const vessels = NOYA.MONEY_POOLS.map((pool) => {
        const amt = p[pool.id];
        const isAvail = pool.id === 'available';
        return `
          <div class="vessel ${isAvail ? 'is-available' : 'drop'}" data-pool="${pool.id}" style="--pc:${pool.color}">
            <div class="vessel-art">
              <svg viewBox="0 0 56 26" preserveAspectRatio="xMidYMax meet">${SVG.vessel(pool.vessel, pool.color)}</svg>
            </div>
            <div class="vessel-amt">${amt}</div>
            <div class="vessel-name">${pool.name} <i>${pool.en}</i></div>
            <div class="vessel-desc">${pool.desc}</div>
            ${isAvail ? '' : `<button class="vessel-return" data-return="${pool.id}" title="退回 5 到可用">−5</button>`}
            ${pool.id === 'goal' ? `<div class="vessel-goal">${esc(c.money.goalName)} · ${p.goal}/${c.money.goalTarget}</div>` : ''}
          </div>`;
      }).join('');

      body.innerHTML = `
        <div class="money-top">
          <div class="money-total">
            <span class="mt-label">TOTAL · 我拥有的</span>
            <span class="mt-num">${t}</span>
            <span class="mt-unit">枚</span>
          </div>
          <div class="money-goal">
            <span>🎯 ${esc(c.money.goalName)}</span>
            <div class="goal-bar"><i style="width:${goalPct}%"></i></div>
            <span class="goal-pct">${goalPct}%</span>
          </div>
        </div>
        <div class="coin-tray">
          <span class="tray-label">拖一枚硬币，放进想要的地方 →</span>
          <div class="coins">
            <span class="coin" draggable="true" data-val="1">1</span>
            <span class="coin" draggable="true" data-val="5">5</span>
            <span class="coin" draggable="true" data-val="10">10</span>
          </div>
        </div>
        <div class="vessels">${vessels}</div>
        <p class="money-hint">有限的资源 → 自己选择 → 分配 → 看到结果。没有标准答案。</p>`;

      wire();
    }

    function move(from, to, amt) {
      const c = Store.child(child.id);
      if (c.money.pools[from] < amt) { toast('可用的不够啦'); return false; }
      Store.updateChild(child.id, (cc) => { cc.money.pools[from] -= amt; cc.money.pools[to] += amt; });
      return true;
    }

    function wire() {
      // drag coins
      let dragVal = 0;
      body.querySelectorAll('.coin').forEach((coin) => {
        coin.addEventListener('dragstart', (e) => {
          dragVal = +coin.getAttribute('data-val');
          e.dataTransfer.setData('text/plain', String(dragVal));
          e.dataTransfer.effectAllowed = 'move';
        });
      });
      body.querySelectorAll('.vessel.drop').forEach((v) => {
        v.addEventListener('dragover', (e) => { e.preventDefault(); v.classList.add('over'); });
        v.addEventListener('dragleave', () => v.classList.remove('over'));
        v.addEventListener('drop', (e) => {
          e.preventDefault(); v.classList.remove('over');
          const amt = +(e.dataTransfer.getData('text/plain') || dragVal);
          const to = v.getAttribute('data-pool');
          if (move('available', to, amt)) { toast(`放进「${NOYA.MONEY_POOLS.find(p=>p.id===to).name}」 +${amt} ✦`); paint(); }
        });
      });
      // return buttons
      body.querySelectorAll('.vessel-return').forEach((b) => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const from = b.getAttribute('data-return');
          const c = Store.child(child.id);
          const amt = Math.min(5, c.money.pools[from]);
          if (amt <= 0) return;
          Store.updateChild(child.id, (cc) => { cc.money.pools[from] -= amt; cc.money.pools.available += amt; });
          paint();
        });
      });
    }

    paint();
  };

  /* ============================================================
     SEMESTER JOURNEY
     ============================================================ */
  V.openJourney = function () {
    const child = Store.current();
    const body = h(`<div class="journey-panel"></div>`);
    const st = child.semester.stages;
    const subjById = {}; child.semester.subjects.forEach((s) => subjById[s.id] = s);

    // winding path points across width
    const N = st.length;
    const W = 720, H = 300, padX = 60;
    const pts = st.map((s, i) => {
      const x = padX + (i / (N - 1)) * (W - padX * 2);
      const y = H / 2 + Math.sin(i * 1.15) * 78;
      return { x, y };
    });
    let path = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a.x + b.x) / 2;
      path += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
    }
    const doneIdx = st.map((s, i) => s.status === 'done' ? i : -1).filter((i) => i >= 0);
    const lastDone = doneIdx.length ? Math.max(...doneIdx) : 0;

    let nodes = '';
    st.forEach((s, i) => {
      const p = pts[i], sub = subjById[s.subject] || { color: '#b0946a', name: '' };
      const r = s.status === 'current' ? 16 : 13;
      nodes += `
        <g class="jnode st-${s.status}" data-jn="${i}" transform="translate(${p.x},${p.y})">
          <circle r="26" fill="transparent"/>
          ${s.status === 'current' ? `<circle r="24" class="pulse" fill="none" stroke="${sub.color}"/>` : ''}
          <circle r="${r}" fill="${s.status === 'locked' ? '#e7ddc9' : sub.color}"
                  stroke="#fff" stroke-width="3"/>
          ${s.status === 'done' ? `<path d="M-5 0 l3 4 l7 -8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
          ${s.status === 'current' ? `<circle r="4" fill="#fff"/>` : ''}
          <text y="${r + 16}" text-anchor="middle" class="jn-title">${esc(s.title)}</text>
          <text y="${r + 30}" text-anchor="middle" class="jn-sub">${esc(sub.name)}</text>
        </g>`;
    });
    // walker at last done node moving toward current
    const walker = pts[lastDone];

    const legend = child.semester.subjects.map((s) =>
      `<span class="lg"><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('');

    body.innerHTML = `
      <p class="jp-intro">每完成一个阶段，就在地图上往前走一步。这学期的路，是这样的：</p>
      <div class="jp-legend">${legend}</div>
      <div class="jp-mapwrap">
        <svg viewBox="0 0 ${W} ${H + 30}" class="journey-map" preserveAspectRatio="xMidYMid meet">
          <path d="${path}" fill="none" stroke="#e3d8c1" stroke-width="10" stroke-linecap="round"/>
          <path d="${path}" fill="none" stroke="var(--isl,#c6a15b)" stroke-width="3.4"
                stroke-dasharray="3 8" stroke-linecap="round" opacity="0.55"/>
          ${nodes}
          <g transform="translate(${walker.x},${walker.y - 26})" class="walker">
            <text text-anchor="middle" font-size="20">🚶</text>
          </g>
        </svg>
      </div>
      <div class="jp-detail" id="jp-detail">点一个路标，看看那一关是什么。</div>`;

    const m = modal(`🗺️ 学期旅程 <span class="mt-en">Semester Journey</span>`, body, 'wide');

    const detail = body.querySelector('#jp-detail');
    body.querySelectorAll('.jnode').forEach((n) => {
      n.addEventListener('click', () => {
        const s = st[+n.getAttribute('data-jn')];
        const sub = subjById[s.subject];
        const label = { done: '已经走过 ✓', current: '正在这里 ★', locked: '还没解锁' }[s.status];
        detail.innerHTML = `<b style="color:${sub.color}">${esc(sub.name)} · ${esc(s.title)}</b>
          <span class="jd-status">${label}</span><p>${esc(s.note)}</p>`;
      });
    });
  };

  /* ============================================================
     MY YEAR · Life Atlas
     ============================================================ */
  V.openYear = function () {
    const child = Store.current();
    const body = h(`<div class="year-panel"></div>`);
    const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    let filter = 0; // 0 = all

    function paint() {
      const evs = child.timeline.slice().sort((a, b) => a.month - b.month);
      const shown = filter ? evs.filter((e) => e.month === filter) : evs;
      const rail = months.map((mn, i) => {
        const has = evs.some((e) => e.month === i + 1);
        const on = filter === i + 1;
        return `<button class="mo ${has ? 'has' : ''} ${on ? 'on' : ''}" data-mo="${i + 1}">${mn}</button>`;
      }).join('');
      const cards = shown.length ? shown.map((e) => `
        <div class="atlas-ev">
          <div class="ev-mo">${months[e.month - 1]}</div>
          <div class="ev-ic">${e.icon}</div>
          <div class="ev-body"><b>${esc(e.title)}</b><span>${esc(e.note)}</span></div>
        </div>`).join('') : `<div class="atlas-empty">这个月还没有记录 — 未来可以加进来。</div>`;

      body.innerHTML = `
        <p class="atlas-intro">这里记录的不只是成绩，是 ${esc(child.name)} 真正经历过的时刻。</p>
        <div class="mo-rail">
          <button class="mo ${filter === 0 ? 'on' : ''}" data-mo="0">全部</button>${rail}
        </div>
        <div class="atlas-list">${cards}</div>
        <div class="atlas-foot">未来可以生成 · <b>${esc(child.name)} · MY 2026</b> 年度成长图</div>`;
      body.querySelectorAll('.mo').forEach((b) =>
        b.addEventListener('click', () => { filter = +b.getAttribute('data-mo'); paint(); }));
    }
    paint();
    modal(`📖 我的一年 <span class="mt-en">My Life Atlas</span>`, body, 'wide');
  };

  /* ============================================================
     DECISION LAB
     ============================================================ */
  V.openDecision = function () {
    const child = Store.current();
    const steps = NOYA.DECISION_STEPS;
    const answers = {};
    let i = 0;
    const body = h(`<div class="lab-panel"></div>`);

    function paint() {
      if (i < steps.length) {
        const s = steps[i];
        body.innerHTML = `
          <div class="lab-door">
            <div class="lab-step">第 ${i + 1} / ${steps.length} 道门</div>
            <h3 class="lab-q">${esc(s.q)}</h3>
            <div class="lab-en">${s.en}</div>
            ${s.key === 'still'
              ? `<div class="lab-final">
                   <button class="lab-yes" data-final="yes">YES · 我还想要</button>
                   <button class="lab-not" data-final="not">NOT NOW · 现在先不要</button>
                 </div>`
              : `<textarea class="lab-input" rows="3" placeholder="用自己的话写一写…">${esc(answers[s.key] || '')}</textarea>
                 <div class="lab-nav">
                   ${i > 0 ? `<button class="lab-back">← 上一道</button>` : `<span></span>`}
                   <button class="lab-next">下一道 →</button>
                 </div>`}
          </div>`;
        const ta = body.querySelector('.lab-input');
        if (ta) ta.addEventListener('input', () => answers[s.key] = ta.value);
        const nb = body.querySelector('.lab-next');
        if (nb) nb.addEventListener('click', () => { i++; paint(); });
        const bb = body.querySelector('.lab-back');
        if (bb) bb.addEventListener('click', () => { i--; paint(); });
        body.querySelectorAll('[data-final]').forEach((b) =>
          b.addEventListener('click', () => finish(b.getAttribute('data-final') === 'yes')));
      }
    }

    function finish(yes) {
      Store.updateChild(child.id, (c) => {
        c.decisions.unshift({ want: answers.want || '', result: yes ? 'yes' : 'not', day: c.day });
        if (c.decisions.length > 20) c.decisions.pop();
      });
      body.innerHTML = `
        <div class="lab-result ${yes ? 'yes' : 'not'}">
          <div class="lab-res-ic">${yes ? '🌟' : '🌙'}</div>
          <h3>${yes ? '你选择了：YES' : '你选择了：NOT NOW'}</h3>
          <p>${yes
            ? '你想清楚了，也知道要付出什么。这是你自己的选择。'
            : '现在先不要，不代表永远不要。你可以以后再回来。'}</p>
          <div class="lab-recall">
            <span>你想要的：</span>${esc(answers.want || '（没有写）')}
          </div>
          <button class="lab-again" data-action="open-decision">再走一次</button>
        </div>`;
    }

    paint();
    modal(`🔮 选择实验室 <span class="mt-en">Decision Lab</span>`, body, 'lab');
  };

  NOYA.V = V;
  NOYA._esc = esc; NOYA._h = h;
})(window.NOYA = window.NOYA || {});
