/* ============================================================
   NOYA Kids · Life Lab — Seed Data
   ------------------------------------------------------------
   Design principle:  same system + different child profiles
                      + different age levels.

   Everything a child "owns" lives inside one child profile.
   Two children never share a data object — each is stored and
   counted separately.  To add a third child later, add another
   profile here; to add a harder/easier version, add an AGE_LEVEL
   and point a child's `ageLevel` at it.  Nothing else changes.
   ============================================================ */
(function (NOYA) {
  'use strict';

  /* Age levels let the SAME world scale in difficulty & playfulness.
     v1 only uses them as labels + a couple of gentle switches, but the
     structure is ready for real per-level logic later. */
  NOYA.AGE_LEVELS = {
    sprout: {
      id: 'sprout',
      label: '小芽 · Sprout',
      note: '刚开始探索自己的世界',
      todayCount: 3,       // how many quests a day feels right
    },
    explorer: {
      id: 'explorer',
      label: '探索者 · Explorer',
      note: '开始自己做更多选择',
      todayCount: 4,
    },
  };

  /* The five islands — shared definition (identity, colour, order).
     Per-child *progress and content* live inside each profile. */
  NOYA.ISLANDS = [
    { id: 'learning', no: '01', name: '学习岛', en: 'Learning Island',
      color: '#c6a15b', tint: '#efe2c0', blurb: '学校学习、学期目标、数学、语文、英语、阅读。' },
    { id: 'life',     no: '02', name: '生活岛', en: 'Life Island',
      color: '#86a9c4', tint: '#dce8f0', blurb: '起床、整理、卫生、准备自己的物品、生活习惯。' },
    { id: 'home',     no: '03', name: '家庭岛', en: 'Home Island',
      color: '#c08763', tint: '#eddbcd', blurb: '家务、照顾宠物、帮助家人、自己的家庭责任。' },
    { id: 'growth',   no: '04', name: '成长岛', en: 'Growth Island',
      color: '#85a16e', tint: '#dbe6cf', blurb: '运动、阅读、音乐、兴趣、创造、新技能。' },
    { id: 'money',    no: '05', name: '财富岛', en: 'Money Island',
      color: '#5c9187', tint: '#cfe2dc', blurb: '自己的钱、收入、使用、储蓄、目标与分配。' },
  ];

  /* Money pools — shared definition. Each child holds its own amounts. */
  NOYA.MONEY_POOLS = [
    { id: 'available', name: '可用', en: 'AVAILABLE', vessel: 'purse',  color: '#c99a52', desc: '现在可以使用' },
    { id: 'save',      name: '储蓄', en: 'SAVE',      vessel: 'jar',    color: '#6f9c8f', desc: '留给未来' },
    { id: 'goal',      name: '目标', en: 'GOAL',      vessel: 'chest',  color: '#c0784f', desc: '为一个目标积累' },
    { id: 'give',      name: '分享', en: 'GIVE',      vessel: 'heart',  color: '#c06f7a', desc: '礼物 · 帮助别人' },
    { id: 'invest',    name: '种子', en: 'INVEST',    vessel: 'seed',   color: '#7d8bb0', desc: '未来会长大' },
  ];

  NOYA.DECISION_STEPS = [
    { key: 'want',  q: '你想要什么？',        en: 'What do you want?' },
    { key: 'why',   q: '为什么想要？',         en: 'Why do you want it?' },
    { key: 'cost',  q: '它需要付出什么？',     en: 'What will it cost?' },
    { key: 'give',  q: '你要暂时放弃什么？',   en: 'What will you give up?' },
    { key: 'still', q: '你还想要吗？',         en: 'Still want it?' },
  ];

  /* --- helpers to keep seed data readable --- */
  const q  = (island, icon, title) => ({ id: 'q_' + Math.round(Math.random()*1e6), island, icon, title, done: false });
  const it = (title, done) => ({ title, done: !!done });

  /* ============================================================
     CHILD PROFILES
     ============================================================ */
  NOYA.SEED = {
    version: 1,
    currentChild: 'donut',
    parentMode: false,
    children: {

      /* ---------------- 甜甜圈 · a sunrise world ---------------- */
      donut: {
        id: 'donut',
        name: '甜甜圈',
        en: 'Donut',
        ageLevel: 'explorer',
        worldTheme: 'sunrise',     // rosy / warm world tint
        day: 128,
        season: '初秋 · Early Autumn',
        stars: 24,
        motto: '慢慢地，把自己的世界建起来。',

        today: [
          { id: 't1', island: 'learning', icon: '📖', title: '复习乘法 6–9', done: false },
          { id: 't2', island: 'life',     icon: '🌙', title: '自己准备明天的书包', done: true },
          { id: 't3', island: 'growth',   icon: '🎵', title: '练习钢琴 15 分钟', done: false },
          { id: 't4', island: 'growth',   icon: '✨', title: '读 10 页《夏洛的网》', done: false, optional: true },
        ],

        islands: {
          learning: { progress: 62, note: '乘法快熟练了，阅读在慢慢加速。',
            items: [ it('乘法 6–9', false), it('语文课文背诵', true), it('英语听说', true), it('每周阅读 3 次', false) ] },
          life: { progress: 74, note: '早晨越来越顺，自己的东西自己管。',
            items: [ it('自己起床', true), it('整理书桌', true), it('准备第二天用品', false), it('刷牙洗脸', true) ] },
          home: { progress: 55, note: '开始照顾家里的一部分。',
            items: [ it('喂猫', true), it('饭后收碗', false), it('给植物浇水', true) ] },
          growth: { progress: 68, note: '钢琴和游泳都在往前走。',
            items: [ it('钢琴练习', false), it('游泳课', true), it('画画', true), it('每天运动', false) ] },
          money: { progress: 40, note: '在为水彩颜料存钱。',
            items: [ it('这周有零花钱', true), it('分配到各个罐子', false) ] },
        },

        semester: {
          subjects: [
            { id: 'math', name: '数学', color: '#c6a15b' },
            { id: 'chinese', name: '语文', color: '#c08763' },
            { id: 'english', name: '英语', color: '#86a9c4' },
          ],
          stages: [
            { id: 's1', subject: 'math',    title: '乘法启程',    status: 'done',    note: '认识乘法的意义' },
            { id: 's2', subject: 'chinese', title: '阅读森林',    status: 'done',    note: '每周读完一本绘本' },
            { id: 's3', subject: 'math',    title: '乘法熟练',    status: 'current', note: '6–9 的乘法口诀' },
            { id: 's4', subject: 'english', title: 'Noya 表达',   status: 'locked',  note: '一句地道的日常表达' },
            { id: 's5', subject: 'math',    title: '计算稳定',    status: 'locked',  note: '减少粗心的小错误' },
            { id: 's6', subject: 'chinese', title: '写作小溪',    status: 'locked',  note: '写一段自己的话' },
            { id: 's7', subject: 'english', title: '听说山谷',    status: 'locked',  note: '听懂一个小故事' },
          ],
        },

        baseline: [
          { icon: '🎒', title: '整理自己的东西', done: true },
          { icon: '📚', title: '完成学校作业',   done: false },
          { icon: '🪥', title: '个人卫生',       done: true },
          { icon: '🧹', title: '适龄家务',       done: false },
          { icon: '🌙', title: '准备第二天用品', done: false },
        ],
        beyond: [
          { icon: '🖼️', title: '完成一幅水彩画', status: 'done',    credit: 8 },
          { icon: '📖', title: '给妹妹讲一个故事', status: 'doing',  credit: 5 },
          { icon: '🧩', title: '自己解决了一个难题', status: 'idea', credit: 0 },
        ],

        money: {
          goalName: '一套水彩颜料',
          goalTarget: 60,
          pools: { available: 45, save: 30, goal: 25, give: 10, invest: 10 },
        },

        timeline: [
          { month: 2,  icon: '🌱', title: '开始每天练琴', note: '一个新习惯的开始' },
          { month: 3,  icon: '📚', title: '读完《小王子》', note: '第一本自己读完的长书' },
          { month: 4,  icon: '🏊', title: '学会换气', note: '游泳课的一个小突破' },
          { month: 5,  icon: '😢', title: '一次没考好', note: '难过了一天，后来又试了一次' },
          { month: 6,  icon: '🏆', title: '钢琴小演出', note: '自己真正骄傲的时刻' },
          { month: 8,  icon: '✈️', title: '海边的夏天', note: '看见了很大的海' },
        ],

        decisions: [],
      },

      /* ---------------- 甜甜豆 · a meadow world ---------------- */
      bean: {
        id: 'bean',
        name: '甜甜豆',
        en: 'Bean',
        ageLevel: 'sprout',
        worldTheme: 'meadow',      // fresh / green world tint
        day: 76,
        season: '初秋 · Early Autumn',
        stars: 15,
        motto: '一点点长大，一点点变厉害。',

        today: [
          { id: 'b1', island: 'learning', icon: '🔤', title: '认读 5 个新汉字', done: false },
          { id: 'b2', island: 'life',     icon: '🪥', title: '自己刷牙洗脸', done: true },
          { id: 'b3', island: 'growth',   icon: '🏊', title: '游泳课', done: false },
          { id: 'b4', island: 'home',     icon: '✨', title: '把玩具收回箱子', done: false, optional: true },
        ],

        islands: {
          learning: { progress: 40, note: '认识越来越多的字了。',
            items: [ it('认字', false), it('数数到 100', true), it('英文儿歌', true) ] },
          life: { progress: 58, note: '自己的小事情自己做。',
            items: [ it('自己穿衣服', true), it('刷牙洗脸', true), it('收拾玩具', false) ] },
          home: { progress: 42, note: '会帮一点点小忙了。',
            items: [ it('摆好自己的鞋', true), it('帮忙拿东西', false) ] },
          growth: { progress: 50, note: '喜欢游泳和搭积木。',
            items: [ it('游泳课', false), it('搭积木', true), it('听故事', true) ] },
          money: { progress: 25, note: '刚刚有了自己的小钱袋。',
            items: [ it('认识硬币', true), it('存进小猪罐', false) ] },
        },

        semester: {
          subjects: [
            { id: 'chinese', name: '语文', color: '#c08763' },
            { id: 'math', name: '数学', color: '#c6a15b' },
            { id: 'english', name: '英语', color: '#86a9c4' },
          ],
          stages: [
            { id: 'b_s1', subject: 'chinese', title: '认字小路',  status: 'done',    note: '认识常用字' },
            { id: 'b_s2', subject: 'math',    title: '数数草原',  status: 'current', note: '数到 100' },
            { id: 'b_s3', subject: 'math',    title: '加法小桥',  status: 'locked',  note: '10 以内加法' },
            { id: 'b_s4', subject: 'english', title: '听说花园',  status: 'locked',  note: '听懂简单指令' },
            { id: 'b_s5', subject: 'chinese', title: '读绘本',    status: 'locked',  note: '和大人一起读' },
          ],
        },

        baseline: [
          { icon: '🧸', title: '收好自己的玩具', done: false },
          { icon: '🪥', title: '刷牙洗脸',       done: true },
          { icon: '👟', title: '摆好自己的鞋',   done: true },
          { icon: '🍽️', title: '自己吃饭',       done: true },
        ],
        beyond: [
          { icon: '🏰', title: '搭一个积木城堡', status: 'doing', credit: 3 },
          { icon: '🤝', title: '帮姐姐拿东西',   status: 'done',  credit: 2 },
        ],

        money: {
          goalName: '一只毛绒小熊',
          goalTarget: 40,
          pools: { available: 30, save: 15, goal: 10, give: 5, invest: 0 },
        },

        timeline: [
          { month: 3, icon: '🚲', title: '学会了平衡车', note: '不用扶就能滑' },
          { month: 4, icon: '🔤', title: '认识自己的名字', note: '会写“甜甜豆”了' },
          { month: 6, icon: '🏊', title: '第一次下水', note: '有点怕，后来笑了' },
          { month: 8, icon: '🌻', title: '种了一颗向日葵', note: '每天去看它' },
        ],

        decisions: [],
      },
    },
  };

  /* Order children appear in the switcher */
  NOYA.CHILD_ORDER = ['donut', 'bean'];

})(window.NOYA = window.NOYA || {});
