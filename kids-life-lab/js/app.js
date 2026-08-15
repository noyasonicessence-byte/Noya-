/* ============================================================
   NOYA Kids · Life Lab — App boot + event routing
   ------------------------------------------------------------
   One delegated click handler keeps the world screen wiring in
   one place; the overlays wire their own internal events.
   ============================================================ */
(function (NOYA) {
  'use strict';
  const { Store, V } = NOYA;

  const CHEERS = [
    '地图上前进了一步 ✦', '一颗星星亮了 ✦', '一小片区域被点亮了 ✧',
    '小树又长高了一点 🌱', '你的世界更完整了一点 ✦',
  ];
  const cheer = () => CHEERS[Math.floor(Date.now() / 900) % CHEERS.length];

  function pulseIsland(islandId) {
    const g = document.querySelector(`.isle[data-island="${islandId}"]`);
    if (!g) return;
    g.classList.remove('cheer'); void g.getBoundingClientRect();
    g.classList.add('cheer');
    setTimeout(() => g.classList.remove('cheer'), 900);
  }

  function handle(action, el) {
    const state = Store.state;
    switch (action) {
      case 'switch-child':
        Store.setChild(el.getAttribute('data-id'));
        break;
      case 'toggle-parent':
        Store.setParentMode(!state.parentMode);
        break;
      case 'open-island':
        V.openIsland(el.getAttribute('data-island'));
        break;
      case 'open-journey':  V.openJourney(); break;
      case 'open-year':     V.openYear(); break;
      case 'open-decision': V.openDecision(); break;

      case 'toggle-quest': {
        const id = el.getAttribute('data-id');
        const child = Store.current();
        const q = child.today.find((t) => t.id === id);
        const willComplete = !q.done;
        Store.updateChild(child.id, (c) => {
          const t = c.today.find((x) => x.id === id);
          t.done = !t.done;
          c.stars = Math.max(0, c.stars + (t.done ? 1 : -1));
        });
        if (willComplete) { pulseIsland(q.island); V.toast(cheer()); }
        break;
      }
      case 'toggle-baseline': {
        const i = +el.getAttribute('data-index');
        Store.updateChild(Store.current().id, (c) => { c.baseline[i].done = !c.baseline[i].done; });
        break;
      }
      case 'reset-data':
        if (confirm('重置为示例数据？两个孩子当前的数据都会清空。')) Store.reset();
        break;
    }
  }

  function onActivate(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (e.type === 'keydown') {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
    }
    handle(el.getAttribute('data-action'), el);
  }

  document.addEventListener('click', onActivate);
  document.addEventListener('keydown', (e) => {
    // only route keyboard activation for the SVG island buttons / focusable roles
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-action][tabindex]')) onActivate(e);
  });

  /* boot */
  Store.load();
  Store.subscribe(V.render);
  V.render(Store.state);
})(window.NOYA = window.NOYA || {});
