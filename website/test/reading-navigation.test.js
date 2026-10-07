const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPageRegistry,
  getRouteContext,
  validateRoutes,
} = require('../scripts/route-registry');

function page(rel, fm, content = '') {
  return { rel, fm, content };
}

test('explicit chapters define route progress and alternatives do not become a sequence', () => {
  const pages = [
    page('paths/new/_index.md', {
      page_type: 'route', route_group: 'new', route_group_mode: 'alternatives',
      route_key: 'new', route_order: 1, route_label: '新手阅读',
      chapters: ['01.md', '02.md'],
    }),
    page('paths/new/01.md', { page_type: 'reading-chapter', topic: '第一章' }),
    page('paths/new/02.md', { page_type: 'reading-chapter', topic: '第二章' }),
    page('paths/age.md', {
      page_type: 'route', route_group: 'ages', route_group_mode: 'alternatives',
      route_key: 'age', route_order: 1, route_label: '按年龄', chapters: ['article.md'],
    }),
    page('paths/question.md', {
      page_type: 'route', route_group: 'questions', route_group_mode: 'alternatives',
      route_key: 'question', route_order: 1, route_label: '按问题', chapters: ['article.md'],
    }),
    page('paths/article.md', { topic: '共享正文' }),
  ];
  const { registry, errors } = validateRoutes(pages);
  assert.deepEqual(errors, []);
  assert.equal(registry.routes.find(route => route.fm.route_key === 'new').chapters.length, 2);
  const shared = getRouteContext('paths/article.md', registry);
  assert.equal(shared.articleRoute, null, 'direct open must not silently choose the first route');
  assert.equal(shared.referencedBy.length, 2);
});

test('an explicit empty chapter list keeps supporting links out of route progress', () => {
  const pages = [
    page('paths/interest.md', {
      page_type: 'route', route_group: 'questions', route_group_mode: 'alternatives',
      route_key: 'interest', route_order: 1, route_label: '发现兴趣', chapters: [],
    }, '- [英语](../english.md)\n- [登山](../mountaineering.md)'),
    page('paths/english.md', { topic: '英语' }),
    page('paths/mountaineering.md', { topic: '登山' }),
  ];
  const { registry, errors } = validateRoutes(pages);
  assert.deepEqual(errors, []);
  const route = registry.routes[0];
  assert.deepEqual(route.chapters, []);
  assert.equal(registry.routeRefsByPage.size, 0);
});

test('a linked next-chapter promise must agree with the sole explicit reading route', () => {
  const pages = [
    page('paths/course/_index.md', {
      page_type: 'route', route_group: 'course', route_group_mode: 'alternatives',
      route_key: 'course', route_order: 1, chapters: ['one.md', 'two.md'],
    }),
    page('paths/course/one.md', {}, '下一章[实战篇](optional.md)会继续。'),
    page('paths/course/two.md', {}),
    page('paths/course/optional.md', {}),
  ];
  assert.ok(validateRoutes(pages).errors.some(error => error.includes('prose next chapter disagrees')));
  pages[1].content = '下一章[第二篇](two.md)会继续。需要时查[实战篇](optional.md)。';
  assert.deepEqual(validateRoutes(pages).errors, []);
  pages[2].content = '下一篇[实战篇](optional.md)会继续。';
  assert.ok(validateRoutes(pages).errors.some(error => error.includes('prose next chapter disagrees')));
});

test('legacy architecture routes remain ten-stage sequences', () => {
  const pages = [
    page('interests/system-architecture/_index.md', {
      page_type: 'route', route_group: 'system-architecture-core', route_key: 'root',
      route_order: 0, route_label: '总入口',
    }),
    page('interests/system-architecture/01/_index.md', {
      page_type: 'route', route_group: 'system-architecture-core', route_key: 'one',
      route_order: 1, route_label: '第一阶段', route_next: '../02/_index.md',
    }, '## 阅读顺序\n先读 [证据](../../evidence.md)'),
    page('interests/system-architecture/02/_index.md', {
      page_type: 'route', route_group: 'system-architecture-core', route_key: 'two',
      route_order: 2, route_label: '第二阶段',
    }),
    page('interests/evidence.md', { topic: '证据' }),
  ];
  const { registry, errors } = validateRoutes(pages);
  assert.deepEqual(errors, []);
  const route = registry.routes.find(item => item.fm.route_key === 'one');
  assert.equal(route.route_group_mode, 'sequence');
  assert.deepEqual(getRouteContext(route.rel, registry).steps.map(item => item.fm.route_key), ['root', 'one', 'two']);
  assert.deepEqual(route.chapters, [], 'legacy supporting links are not chapter progress');
});

function runNav({ pagePath, pageRel, query, hash = '', links = [], routes, hashTarget = null, hasBottom = false, routePanels = null, sidebar = null }) {
  const callbacks = {};
  const history = [];
  const root = {
    inserted: null,
    appended: [],
    querySelector() { return null; },
    insertBefore(node) { this.inserted = node; },
    appendChild(node) { this.appended.push(node); },
  };
  const panels = routePanels || (hasBottom ? [{
    className: 'route-nav route-nav-bottom',
    classList: { contains(value) { return value === 'route-nav-bottom'; } },
    remove() { this.removed = true; },
  }] : []);
  const sidebarNode = sidebar ? {
    removed: false,
    remove() { this.removed = true; },
  } : null;
  function element(tag) {
    const node = {
      tagName: tag,
      className: '',
      textContent: '',
      href: '',
      children: [],
      handlers: {},
      classList: { contains() { return false; }, add() {} },
      append() { this.children.push(...arguments); },
      appendChild(child) { this.children.push(child); },
      addEventListener(type, callback) { this.handlers[type] = callback; },
      remove() { this.removed = true; },
      setAttribute() {},
    };
    node.cloneNode = function(deep) {
      const copy = element(tag);
      copy.className = node.className;
      copy.textContent = node.textContent;
      copy.href = node.href;
      if (deep) node.children.forEach(child => copy.appendChild(child.cloneNode ? child.cloneNode(true) : child));
      return copy;
    };
    return node;
  }
  const script = { textContent: JSON.stringify(routes) };
  const details = { open: false };
  const scrolls = [];
  const target = hashTarget ? { closest() { return details; }, scrollIntoView(options) { scrolls.push(options.block); } } : null;
  const document = {
    addEventListener(type, callback) { callbacks[type] = callback; },
    getElementById(id) { return id === 'reader-route-data' ? script : (id === hashTarget ? target : null); },
    body: { getAttribute(name) { return name === 'data-page-rel' ? pageRel : ''; } },
    createElement: element,
    querySelector(selector) {
      if (selector === '.content-inner') return root;
      if (selector === '.route-nav-bottom') return panels.find(panel => !panel.removed && panel.classList.contains('route-nav-bottom')) || null;
      if (selector === '.sidebar') return sidebarNode;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'a[href]') return links;
      if (selector === '.route-nav') return panels;
      return [];
    },
  };
  const location = new URL('https://example.test' + pagePath + query + hash);
  const window = {
    location,
    history: { replaceState(_state, _title, value) { history.push(value); } },
    addEventListener(type, callback) { callbacks[type] = callback; },
  };
  const vm = require('node:vm');
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../site-template/nav.js'), 'utf8');
  vm.runInNewContext(source, { document, window, URL, URLSearchParams, Array, JSON, Number, String, RegExp });
  callbacks.DOMContentLoaded();
  return { links, root, history, details, callbacks, scrolls, panels, sidebar: sidebarNode, document };
}

test('nested optional links preserve BASE_PATH route context and return section', () => {
  const routes = [{
    group: 'new-parent-reading', key: 'prenatal-first-week', label: '新手父母连续阅读', path: '/gulou/paths/parenting/new-parent/index.html',
    chapters: [
      { rel: 'paths/parenting/new-parent/01-before-birth.md', path: '/gulou/paths/parenting/new-parent/01-before-birth.html', label: '第一章', anchors: ['safety'] },
      { rel: 'paths/parenting/new-parent/02-ready-for-hospital.md', path: '/gulou/paths/parenting/new-parent/02-ready-for-hospital.html', label: '第二章', anchors: ['safety'] },
    ],
    allowed: ['/gulou/paths/parenting/new-parent/01-before-birth.html', '/gulou/stages/care.html', '/gulou/stages/care-two.html', '/gulou/stages/care-three.html'],
  }];
  const link = { href: 'https://example.test/gulou/stages/care-two.html#feeding', classList: { contains() { return false; } }, addEventListener(type, cb) { this.callback = cb; } };
  const first = runNav({
    pagePath: '/gulou/stages/care.html', pageRel: 'stages/care.md',
    query: '?reader_group=new-parent-reading&reader_route=prenatal-first-week&reader_chapter=0&reader_section=safety',
    links: [link], routes,
  });
  assert.match(first.root.inserted.className, /route-extension-live/);
  assert.equal(first.root.inserted.children[1].children.length, 1);
  assert.equal(link.callback, undefined, 'the native destination must work without a click handler');
  assert.match(link.href, /reader_chapter=0/);
  assert.match(link.href, /reader_section=safety/);
  assert.match(link.href, /#feeding$/);

  const second = runNav({
    pagePath: '/gulou/stages/care-two.html', pageRel: 'stages/care-two.md',
    query: '?reader_group=new-parent-reading&reader_route=prenatal-first-week&reader_chapter=0&reader_section=safety',
    links: [{ href: 'https://example.test/gulou/stages/care-three.html', classList: { contains() { return false; } } }],
    routes,
  });
  assert.ok(second.root.inserted);
  const actions = second.root.inserted.children[1];
  const back = new URL(actions.children[0].href);
  assert.ok(back.pathname.endsWith('/new-parent/01-before-birth.html'));
  assert.equal(back.hash, '#safety');
  assert.equal(back.searchParams.get('reader_route'), 'prenatal-first-week');
  assert.equal(actions.children.length, 1, 'extension pages keep only the return-to-mainline action');
  assert.equal(second.root.appended.length, 1, 'a second extension page also gets an end-of-article return panel');
  assert.equal(second.root.appended[0].children[1].children[0].href, actions.children[0].href);
});

test('the current chapter context points to the route directory and leaves adjacent links at the bottom', () => {
  const route = {
    group: 'new-parent-reading', key: 'prenatal-first-week', label: '新手父母连续阅读', path: '/gulou/paths/new/index.html',
    chapters: [
      { rel: 'paths/new/01.md', path: '/gulou/paths/new/01.html', label: '第一章', anchors: ['第一章'] },
      { rel: 'paths/new/02.md', path: '/gulou/paths/new/02.html', label: '第二章', anchors: ['第二章'] },
    ],
    allowed: ['/gulou/paths/new/01.html', '/gulou/paths/new/02.html'],
  };
  const result = runNav({
    pagePath: '/gulou/paths/new/01.html', pageRel: 'paths/new/01.md',
    query: '?reader_group=new-parent-reading&reader_route=prenatal-first-week&reader_chapter=0', routes: [route], hasBottom: true, sidebar: true,
  });
  assert.match(result.root.inserted.className, /route-current-live/);
  assert.match(result.root.inserted.children[1].children[0].textContent, /查看主线目录/);
  assert.equal(result.root.inserted.children[1].children.length, 1);
  assert.equal(result.panels[0].removed, undefined, 'a selected chapter keeps its static footer');
  assert.equal(result.sidebar.removed, false, 'a selected chapter keeps its route sidebar');
});

test('an extension page removes its own course footer and sidebar while preserving the selected return context', () => {
  const footer = {
    className: 'route-nav route-nav-bottom',
    classList: { contains(value) { return value === 'route-nav-bottom'; } },
    remove() { this.removed = true; },
  };
  const result = runNav({
    pagePath: '/gulou/stages/family/parenting/parents/prenatal/prenatal-preparation-01.html',
    pageRel: 'stages/family/parenting/parents/prenatal/prenatal-preparation-01.md',
    query: '?reader_group=new-parent-reading&reader_route=prenatal-first-week&reader_chapter=0&reader_section=先建立一条求助链',
    routes: [{
      group: 'new-parent-reading', key: 'prenatal-first-week', label: '新手父母连续阅读',
      chapters: [{ path: '/gulou/paths/parenting/new-parent/01-before-birth.html', label: '第一章', anchors: ['先建立一条求助链'] }],
      allowed: [
        '/gulou/paths/parenting/new-parent/01-before-birth.html',
        '/gulou/stages/family/parenting/parents/prenatal/prenatal-preparation-01.html',
      ],
    }],
    routePanels: [footer],
    sidebar: true,
  });
  assert.equal(footer.removed, true, 'the extension must not retain its own course footer');
  assert.equal(result.sidebar.removed, true, 'the extension must not advertise its own course in the sidebar');
  const actions = result.root.inserted.children[1].children;
  assert.equal(actions.length, 1, 'the extension exposes only a return action');
  const back = new URL(actions[0].href);
  assert.equal(back.pathname, '/gulou/paths/parenting/new-parent/01-before-birth.html');
  assert.equal(back.searchParams.get('reader_group'), 'new-parent-reading');
  assert.equal(back.searchParams.get('reader_chapter'), '0');
  assert.equal(back.searchParams.has('reader_section'), false);
  assert.equal(decodeURIComponent(back.hash.slice(1)), '先建立一条求助链');
  assert.match(actions[0].textContent, /查阅结束.*返回主线/);
  assert.equal(result.root.appended.length, 1, 'the extension gets a return panel after the article');
  const bottomActions = result.root.appended[0].children[1].children;
  assert.match(result.root.appended[0].className, /route-nav-bottom/);
  assert.equal(bottomActions.length, 1);
  assert.equal(bottomActions[0].href, actions[0].href, 'top and bottom return to the same chapter and section');
  assert.equal(result.document.querySelector('.route-nav-bottom'), null, 'removed static footer must not remain discoverable');
});

test('a chosen shared-article route remains navigable without a static chapter footer', () => {
  const result = runNav({
    pagePath: '/gulou/shared.html', pageRel: 'shared.md',
    query: '?reader_group=question&reader_route=habits&reader_chapter=1',
    routes: [{
      group: 'question', key: 'habits', label: '学习习惯', path: '/gulou/habits.html',
      chapters: [
        { path: '/gulou/first.html', label: '前一章', anchors: [] },
        { path: '/gulou/shared.html', label: '共享文章', anchors: [] },
        { path: '/gulou/last.html', label: '后一章', anchors: [] },
      ],
      allowed: ['/gulou/first.html', '/gulou/shared.html', '/gulou/last.html'],
    }],
  });
  const actions = result.root.inserted.children[1].children;
  assert.equal(actions.length, 3);
  assert.equal(new URL(actions[1].href).searchParams.get('reader_chapter'), '0');
  assert.equal(new URL(actions[2].href).searchParams.get('reader_chapter'), '2');
  assert.equal(new URL(actions[2].href).searchParams.get('reader_route'), 'habits');
});

test('implicit context is enabled only for unique chapters and chapter clicks change position', () => {
  const route = {
    group: 'new-parent-reading', key: 'prenatal-first-week', label: '路线',
    chapters: [
      { rel: 'paths/new/01.md', path: '/gulou/paths/new/01.html', label: '第一章', anchors: ['第一章'] },
      { rel: 'paths/new/02.md', path: '/gulou/paths/new/02.html', label: '第二章', anchors: ['第二章'] },
    ],
    allowed: ['/gulou/paths/new/01.html', '/gulou/paths/new/02.html', '/gulou/paths/new/topic.html'],
  };
  const chapterLink = { href: 'https://example.test/gulou/paths/new/02.html', classList: { contains() { return false; } }, addEventListener(type, cb) { this.callback = cb; } };
  const unique = runNav({ pagePath: '/gulou/paths/new/01.html', pageRel: 'paths/new/01.md', query: '', links: [chapterLink], routes: [route] });
  assert.equal(chapterLink.callback, undefined);
  assert.match(chapterLink.href, /reader_chapter=1/);

  const sharedRoute = { ...route, group: 'other', key: 'other', chapters: route.chapters.slice() };
  const sharedLink = { href: 'https://example.test/gulou/paths/new/topic.html', classList: { contains() { return false; } }, addEventListener(type, cb) { this.callback = cb; } };
  runNav({ pagePath: '/gulou/paths/new/01.html', pageRel: 'paths/new/01.md', query: '', links: [sharedLink], routes: [route, sharedRoute] });
  assert.equal(sharedLink.callback, undefined, 'shared chapter should require explicit route selection');
});

test('entering a stage chapter from its directory selects that route after a cross-stage handoff', () => {
  const oldRoute = {
    group: 'new-parent', key: 'infancy', label: '婴幼儿主线', rel: 'paths/infancy.md', path: '/gulou/paths/infancy.html',
    chapters: [{ path: '/gulou/last.html', label: '三岁交接', anchors: ['下一阶段'] }],
    allowed: ['/gulou/last.html', '/gulou/paths/preschool.html', '/gulou/outdoor.html', '/gulou/support.html'],
  };
  const newRoute = {
    group: 'ages', key: 'preschool', label: '学龄前路线', rel: 'paths/preschool.md', path: '/gulou/paths/preschool.html',
    chapters: [{ path: '/gulou/outdoor.html', label: '户外活动', anchors: [] }],
    allowed: ['/gulou/paths/preschool.html', '/gulou/outdoor.html', '/gulou/support.html'],
  };
  const makeLink = href => ({ href, classList: { contains() { return false; } }, addEventListener(type, cb) { this.callback = cb; } });
  const chapter = makeLink('https://example.test/gulou/outdoor.html#活动');
  const optional = makeLink('https://example.test/gulou/support.html');
  runNav({
    pagePath: '/gulou/paths/preschool.html', pageRel: 'paths/preschool.md',
    query: '?reader_group=new-parent&reader_route=infancy&reader_chapter=0&reader_section=下一阶段',
    links: [chapter, optional], routes: [oldRoute, newRoute],
  });
  assert.equal(chapter.callback, undefined);
  const next = new URL(chapter.href);
  assert.equal(next.searchParams.get('reader_group'), 'ages');
  assert.equal(next.searchParams.get('reader_route'), 'preschool');
  assert.equal(next.searchParams.get('reader_chapter'), '0');
  assert.equal(next.searchParams.has('reader_section'), false);
  assert.equal(decodeURIComponent(next.hash), '#活动');
  assert.equal(new URL(optional.href).searchParams.get('reader_route'), 'infancy', 'reading supporting information still preserves the original handoff');

  const direct = makeLink('https://example.test/gulou/outdoor.html');
  runNav({pagePath: '/gulou/paths/preschool.html', pageRel: 'paths/preschool.md', query: '', links: [direct], routes: [oldRoute, newRoute]});
  assert.equal(new URL(direct.href).searchParams.get('reader_route'), 'preschool', 'starting in a route directory also selects that route for a shared article');
});

test('hash targets inside collapsed details open on load and hashchange', () => {
  const result = runNav({
    pagePath: '/gulou/stages/family.html', pageRel: 'stages/family.md', query: '', hash: '#month-observation',
    routes: [], hashTarget: 'month-observation',
  });
  assert.equal(result.details.open, true);
  assert.deepEqual(result.scrolls, ['start']);
  result.details.open = false;
  result.callbacks.hashchange();
  assert.equal(result.details.open, true);
  assert.deepEqual(result.scrolls, ['start', 'start']);
});

test('a new-tab destination retains the source section and independent query parameters', () => {
  const routes = [{
    group: 'ages', key: 'preschool', path: '/gulou/ages/preschool.html',
    chapters: [{ path: '/gulou/reading.html', label: '执行功能', anchors: ['延伸探索'] }],
    allowed: ['/gulou/reading.html', '/gulou/topic.html'],
  }];
  const heading = { tagName: 'H2', id: '延伸探索', previousElementSibling: null };
  const link = {
    href: 'https://example.test/gulou/topic.html?view=full#例子',
    previousElementSibling: heading,
    classList: { contains() { return false; } },
    addEventListener() { throw new Error('new-tab navigation cannot depend on click'); },
  };
  runNav({ pagePath: '/gulou/reading.html', pageRel: 'reading.md', query: '', links: [link], routes });
  const destination = new URL(link.href);
  assert.equal(destination.searchParams.get('reader_section'), '延伸探索');
  assert.equal(destination.searchParams.get('view'), 'full');
  assert.equal(decodeURIComponent(destination.hash), '#例子');
  const opened = runNav({ pagePath: destination.pathname, pageRel: 'topic.md', query: destination.search, routes });
  const back = new URL(opened.root.inserted.children[1].children[0].href);
  assert.equal(decodeURIComponent(back.hash), '#延伸探索');
  assert.equal(back.searchParams.get('reader_route'), 'preschool');
});

test('invalid route, chapter, page, and section context is removed', () => {
  const routes = [{
    group: 'new-parent-reading', key: 'prenatal-first-week', label: '路线',
    chapters: [{ rel: 'paths/parenting/new-parent/01.md', path: '/gulou/paths/parenting/new-parent/01.html', label: '第一章' }],
    allowed: ['/gulou/paths/parenting/new-parent/01.html'],
  }];
  const invalid = runNav({
    pagePath: '/gulou/unrelated.html', pageRel: 'unrelated.md',
    query: '?reader_group=unknown&reader_route=bad&reader_chapter=8&reader_section=<script>&reader_extra=1', routes,
  });
  assert.equal(invalid.history.length, 1);
  assert.equal(invalid.history[0], '/gulou/unrelated.html');
  const invalidSection = runNav({
    pagePath: '/gulou/paths/parenting/new-parent/01.html', pageRel: 'paths/parenting/new-parent/01.md',
    query: '?reader_group=new-parent-reading&reader_route=prenatal-first-week&reader_chapter=0&reader_section=not-an-anchor', routes,
  });
  assert.equal(invalidSection.history[0], '/gulou/paths/parenting/new-parent/01.html');
});
