document.addEventListener('DOMContentLoaded', function() {
  function normalizePath(value) {
    var parsed = new URL(value, window.location.origin);
    return parsed.pathname.replace(/\/+$/, '') || '/';
  }

  function validSection(value) {
    return typeof value === 'string' && /^[\p{L}\p{N}][\p{L}\p{N}_:-]{0,120}$/u.test(value);
  }

  function readData() {
    var node = document.getElementById('reader-route-data');
    if (!node) return [];
    try {
      var value = JSON.parse(node.textContent || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function routeForParams(routes, params) {
    var known = ['reader_group', 'reader_route', 'reader_chapter', 'reader_section'];
    for (var key of params.keys()) {
      if (key.indexOf('reader_') === 0 && known.indexOf(key) === -1) return null;
      if (key.indexOf('reader_') === 0 && params.getAll(key).length !== 1) return null;
    }
    var group = params.get('reader_group');
    var key = params.get('reader_route');
    var chapterValue = params.get('reader_chapter');
    if (!group || !key || !/^\d+$/.test(chapterValue || '')) return null;
    var route = routes.find(function(item) {
      return item && item.group === group && item.key === key;
    });
    if (!route || !Array.isArray(route.chapters)) return null;
    var chapter = Number(chapterValue);
    if (!Number.isSafeInteger(chapter) || !route.chapters[chapter]) return null;
    var currentPath = normalizePath(window.location.href);
    var allowed = Array.isArray(route.allowed) && route.allowed.some(function(item) {
      return normalizePath(item) === currentPath;
    });
    if (!allowed) return null;
    var section = params.get('reader_section') || '';
    if (section && !validSection(section)) return null;
    if (section && (!Array.isArray(route.chapters[chapter].anchors) || route.chapters[chapter].anchors.indexOf(section) === -1)) return null;
    return { route: route, chapter: chapter, section: section };
  }

  function implicitChapterContext(routes) {
    var currentPath = normalizePath(window.location.href);
    var matches = [];
    for (var route of routes) {
      if (!Array.isArray(route.chapters)) continue;
      for (var index = 0; index < route.chapters.length; index += 1) {
        var chapter = route.chapters[index];
        if (chapter && normalizePath(chapter.path) === currentPath) {
          matches.push({ route: route, chapter: index, section: '', implicit: true });
        }
      }
    }
    return matches.length === 1 ? matches[0] : null;
  }

  function chapterIndexForTarget(route, target) {
    var targetPath = normalizePath(target.href || target);
    if (!route || !Array.isArray(route.chapters)) return -1;
    return route.chapters.findIndex(function(chapter) {
      return chapter && normalizePath(chapter.path) === targetPath;
    });
  }

  function sectionForLink(link) {
    var node = link;
    while (node && node !== document.body) {
      var sibling = node.previousElementSibling;
      while (sibling) {
        if (sibling.tagName && /^H[1-6]$/.test(sibling.tagName) && validSection(sibling.id)) return sibling.id;
        sibling = sibling.previousElementSibling;
      }
      node = node.parentElement;
    }
    return '';
  }

  function contextQuery(context, hash) {
    var params = new URLSearchParams();
    params.set('reader_group', context.route.group);
    params.set('reader_route', context.route.key);
    params.set('reader_chapter', String(context.chapter));
    if (context.section) params.set('reader_section', context.section);
    var query = params.toString();
    return query + (hash || '');
  }

  function makeLink(label, href, className) {
    var link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    if (className) link.className = className;
    return link;
  }

  function renderLiveContext(context) {
    var existing = document.querySelector('.route-context-live');
    if (existing) existing.remove();
    var chapter = context.route.chapters[context.chapter];
    if (!chapter) return;
    var onChapter = normalizePath(window.location.href) === normalizePath(chapter.path);
    var panel = document.createElement('section');
    panel.className = 'route-nav route-context-live ' + (onChapter ? 'route-current-live' : 'route-extension-live');
    panel.setAttribute('aria-label', '当前阅读上下文');
    var summary = document.createElement('div');
    summary.className = 'route-summary';
    var title = document.createElement('span');
    title.textContent = onChapter
      ? context.route.label
      : '延伸查阅 · 来自第' + (context.chapter + 1) + '章';
    var position = document.createElement('small');
    position.textContent = onChapter
      ? '第 ' + (context.chapter + 1) + ' 章 / 共 ' + context.route.chapters.length + ' 章'
      : context.route.label;
    summary.append(title, position);
    panel.appendChild(summary);

    var actions = document.createElement('div');
    actions.className = 'route-actions';
    if (onChapter) {
      var routeUrl = new URL(context.route.path, window.location.href);
      routeUrl.search = '';
      routeUrl.hash = '';
      actions.appendChild(makeLink('查看主线目录', routeUrl.toString(), 'route-back'));
      // Shared knowledge articles have no statically selected footer. Keep
      // their chosen route navigable after replacing the choice panel.
      if (!document.querySelector('.route-nav-bottom')) {
        [context.chapter - 1, context.chapter + 1].forEach(function(index) {
          var adjacent = context.route.chapters[index];
          if (!adjacent) return;
          var previous = index < context.chapter;
          var url = new URL(adjacent.path, window.location.href);
          url.search = '?' + contextQuery({ route: context.route, chapter: index, section: '' }, '');
          url.hash = '';
          actions.appendChild(makeLink((previous ? '← 上一章：' : '下一章：') + adjacent.label + (previous ? '' : ' →'), url.toString(), previous ? 'route-prev' : 'route-next'));
        });
      }
    } else {
      var sectionHash = context.section ? '#' + context.section : '';
      var chapterUrl = new URL(chapter.path, window.location.href);
      chapterUrl.search = '?' + contextQuery({ route: context.route, chapter: context.chapter, section: '' }, '');
      chapterUrl.hash = sectionHash;
      actions.appendChild(makeLink('返回主线：' + chapter.label + (context.section ? ' · 原位置' : ''), chapterUrl.toString(), 'route-back'));
    }
    panel.appendChild(actions);
    var target = document.querySelector('.content-inner');
    if (target) target.insertBefore(panel, target.querySelector('.route-nav, h1, h2') || target.firstChild);
  }

  var routes = readData();
  var pageRel = document.body.getAttribute('data-page-rel');
  var entryRoute = routes.find(function(route) {
    return Array.isArray(route.chapters) && route.chapters.length > 0
      && ((route.rel && route.rel === pageRel)
        || (route.path && normalizePath(route.path) === normalizePath(window.location.href)));
  });
  function entryChapterForTarget(target) {
    return chapterIndexForTarget(entryRoute, target);
  }
  var params = new URLSearchParams(window.location.search);
  var explicitContext = routeForParams(routes, params);
  var context = explicitContext || implicitChapterContext(routes);
  var hasReaderParams = Array.from(params.keys()).some(function(key) { return key.indexOf('reader_') === 0; });
  if (hasReaderParams && !explicitContext) {
    // Unknown routes, chapters, pages, and malformed anchors never become
    // navigation state. Keep the page usable after dropping invalid context.
    var clean = new URL(window.location.href);
    Array.from(clean.searchParams.keys()).forEach(function(key) {
      if (key.indexOf('reader_') === 0) clean.searchParams.delete(key);
    });
    window.history.replaceState({}, '', clean.pathname + (clean.search ? clean.search : '') + clean.hash);
  }

  if (context && explicitContext) {
    document.querySelectorAll('.route-choice-panel').forEach(function(panel) { panel.remove(); });
    document.querySelectorAll('.route-nav').forEach(function(panel) {
      if (!panel.classList.contains('route-nav-bottom')) panel.remove();
    });
    renderLiveContext(context);
  }

  // Put context in the actual destination before any interaction. Native
  // middle-click, modifier-click and "open in new tab" all use this href.
  if (context) {
    document.querySelectorAll('a[href]').forEach(function(link) {
      if (link.classList.contains('route-back') || link.classList.contains('route-prev') || link.classList.contains('route-next')) return;
      var target;
      try { target = new URL(link.href, window.location.href); } catch (error) { return; }
      if (target.origin !== window.location.origin || target.protocol !== window.location.protocol) return;
      if (entryChapterForTarget(target) >= 0) return;
      if (target.pathname === window.location.pathname) return;
      var routeAllowed = context.route.allowed.some(function(item) {
        return normalizePath(item) === normalizePath(target.href);
      });
      if (!routeAllowed) return;
      var targetChapter = chapterIndexForTarget(context.route, target);
      var nextContext = {
        route: context.route,
        chapter: targetChapter >= 0 ? targetChapter : context.chapter,
        section: targetChapter >= 0 ? '' : (context.section || sectionForLink(link)),
      };
      applyContext(target, nextContext);
      link.href = target.toString();
    });
  }

  // Choosing a chapter from a route directory starts that route, even when
  // the directory was reached as supporting information from another stage.
  // Other supporting links continue to preserve their original return point.
  if (entryRoute) {
    document.querySelectorAll('a[href]').forEach(function(link) {
      var target;
      try { target = new URL(link.href, window.location.href); } catch (error) { return; }
      if (target.origin !== window.location.origin || target.protocol !== window.location.protocol) return;
      var chapter = entryChapterForTarget(target);
      if (chapter < 0) return;
      applyContext(target, { route: entryRoute, chapter: chapter, section: '' });
      link.href = target.toString();
    });
  }

  function applyContext(target, nextContext) {
    Array.from(target.searchParams.keys()).forEach(function(key) {
      if (key.indexOf('reader_') === 0) target.searchParams.delete(key);
    });
    new URLSearchParams(contextQuery(nextContext, '')).forEach(function(value, key) {
      target.searchParams.set(key, value);
    });
  }

  function revealHashTarget() {
    var raw = window.location.hash ? window.location.hash.slice(1) : '';
    if (!raw) return;
    var id;
    try { id = decodeURIComponent(raw); } catch (error) { return; }
    var target = document.getElementById(id);
    if (!target) return;
    var details = target.closest ? target.closest('details') : null;
    if (details && !details.open) {
      details.open = true;
      // The initial fragment lookup may have run while this target was hidden.
      if (target.scrollIntoView) target.scrollIntoView({ block: 'start' });
    }
  }

  revealHashTarget();
  if (window.addEventListener) window.addEventListener('hashchange', revealHashTarget);

  var currentPath = normalizePath(window.location.href);
  document.querySelectorAll('.sidebar a').forEach(function(link) {
    if (normalizePath(link.href) === currentPath) link.classList.add('active');
  });
});
