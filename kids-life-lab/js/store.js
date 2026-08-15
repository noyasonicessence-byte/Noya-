/* ============================================================
   NOYA Kids · Life Lab — Store
   ------------------------------------------------------------
   Tiny state container over localStorage.
   - Deep-merges saved data on top of SEED, so adding new fields
     or new children to data.js never breaks an existing save.
   - Any mutation goes through updateChild()/update(), which saves
     and then notifies subscribers (the app re-renders).
   ============================================================ */
(function (NOYA) {
  'use strict';

  const KEY = 'noya-kids-life-lab-v1';

  function deepMerge(base, over) {
    if (Array.isArray(base)) {
      // Arrays are treated as whole values: prefer the saved one if present.
      return over === undefined ? base : over;
    }
    if (base && typeof base === 'object') {
      const out = {};
      const keys = new Set([...Object.keys(base), ...Object.keys(over || {})]);
      keys.forEach((k) => {
        if (over && k in over && !(base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]))) {
          out[k] = deepMerge(base[k] !== undefined ? base[k] : over[k], over[k]);
        } else if (base[k] && typeof base[k] === 'object') {
          out[k] = deepMerge(base[k], over ? over[k] || {} : {});
        } else {
          out[k] = over && k in over ? over[k] : base[k];
        }
      });
      return out;
    }
    return over === undefined ? base : over;
  }

  const Store = {
    state: null,
    subs: [],

    load() {
      let saved = null;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) saved = JSON.parse(raw);
      } catch (e) { saved = null; }
      // Merge saved over a fresh clone of SEED.
      const fresh = JSON.parse(JSON.stringify(NOYA.SEED));
      this.state = saved ? deepMerge(fresh, saved) : fresh;
      return this.state;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); }
      catch (e) { /* storage full / disabled — prototype degrades gracefully */ }
    },

    reset() {
      try { localStorage.removeItem(KEY); } catch (e) {}
      this.load();
      this.emit();
    },

    subscribe(fn) { this.subs.push(fn); },
    emit() { this.subs.forEach((fn) => fn(this.state)); },

    /* --- accessors --- */
    child(id) { return this.state.children[id || this.state.currentChild]; },
    current() { return this.child(this.state.currentChild); },

    /* --- mutations (save + re-render) --- */
    update(fn) { fn(this.state); this.save(); this.emit(); },
    updateChild(id, fn) { fn(this.state.children[id]); this.save(); this.emit(); },

    setChild(id) { this.update((s) => { s.currentChild = id; }); },
    setParentMode(on) { this.update((s) => { s.parentMode = !!on; }); },
  };

  NOYA.Store = Store;
})(window.NOYA = window.NOYA || {});
