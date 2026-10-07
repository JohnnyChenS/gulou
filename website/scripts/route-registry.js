const path = require('path');

function normalizeTarget(sourceRel, target) {
  const decoded = decodeURIComponent(target.split('#')[0]);
  if (!decoded.endsWith('.md')) return null;
  if (decoded.startsWith('/')) return path.normalize(decoded.slice(1));
  return path.normalize(path.join(path.dirname(sourceRel), decoded));
}

function extractMarkdownLinks(content, sourceRel) {
  const links = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const target = normalizeTarget(sourceRel, match[1]);
    if (!target) continue;
    links.push({ target, label: match[0].slice(1, match[0].indexOf(']')) });
  }
  return links;
}

function extractMainStepLinks(content, sourceRel) {
  const start = content.search(/^##\s+阅读顺序\s*$/m);
  if (start === -1) return [];
  const after = content.slice(start).replace(/^##\s+阅读顺序\s*$/m, '');
  const end = after.search(/^##\s+/m);
  const section = end === -1 ? after : after.slice(0, end);
  return extractMarkdownLinks(section, sourceRel);
}

function routeGroupMode(route) {
  if (route && route.fm && route.fm.route_group_mode) return route.fm.route_group_mode;
  // The architecture course predates the explicit mode field, but its ten
  // stages are an intentional sequence. Keep that contract for old content.
  if (route && route.fm && route.fm.route_group === 'system-architecture-core') return 'sequence';
  return 'legacy';
}

function extractChapterLinks(route, byRel) {
  const explicit = Array.isArray(route.fm.chapters);
  const items = explicit
    ? route.fm.chapters.map(target => ({ target: normalizeTarget(route.rel, String(target)), label: String(target) }))
    : extractMainStepLinks(route.content, route.rel);
  return items
    .filter(item => item.target)
    .map((item, index) => ({
      ...item,
      index,
      page: byRel.get(item.target) || null,
    }));
}

function routeChapters(route, byRel) {
  return extractChapterLinks(route, byRel).filter(chapter => chapter.page);
}

function routeContextRels(route, byRel) {
  const chapters = routeChapters(route, byRel);
  const allowed = new Set(chapters.map(chapter => chapter.target));
  const queue = [...chapters.map(chapter => chapter.page)];
  while (queue.length > 0) {
    const page = queue.shift();
    if (page.fm && (page.fm.page_type === 'route' || page.fm.page_type === 'route-index')) continue;
    for (const link of extractMarkdownLinks(page.content || '', page.rel)) {
      if (!byRel.has(link.target) || allowed.has(link.target)) continue;
      allowed.add(link.target);
      queue.push(byRel.get(link.target));
    }
  }
  return Array.from(allowed);
}

function buildPageRegistry(pages) {
  const byRel = new Map(pages.map(page => [page.rel, page]));
  const routes = pages.filter(page => page.fm && page.fm.page_type === 'route');
  const routesByGroup = new Map();
  const routeRefsByPage = new Map();

  for (const route of routes) {
    const group = route.fm.route_group;
    if (!group) continue;
    if (!routesByGroup.has(group)) routesByGroup.set(group, []);
    routesByGroup.get(group).push(route);

    route.route_group_mode = routeGroupMode(route);
    route.chapterLinks = extractChapterLinks(route, byRel);
    // Only explicit chapter arrays create a reader chapter route. Legacy
    // "阅读顺序" links remain article references while route groups such as
    // system-architecture-core continue to use their route-level sequence.
    route.chapters = Array.isArray(route.fm.chapters)
      ? route.chapterLinks.filter(chapter => chapter.page)
      : [];
    route.legacyChapters = route.chapterLinks.filter(chapter => chapter.page);
    route.contextRels = routeContextRels(route, byRel);
    const refs = route.chapterLinks;
    route.mainStepLinks = refs;
    for (const ref of refs) {
      if (!routeRefsByPage.has(ref.target)) routeRefsByPage.set(ref.target, []);
      routeRefsByPage.get(ref.target).push({ route, label: ref.label, index: ref.index, kind: 'chapter' });
    }
  }

  for (const groupRoutes of routesByGroup.values()) {
    groupRoutes.sort((a, b) => {
      const order = Number(a.fm.route_order) - Number(b.fm.route_order);
      return order || String(a.fm.route_label || a.rel).localeCompare(String(b.fm.route_label || b.rel));
    });
  }

  return { byRel, routes, routesByGroup, routeRefsByPage };
}

function routeTarget(route, registry) {
  if (!route.fm.route_next) return null;
  const target = normalizeTarget(route.rel, route.fm.route_next);
  return target ? registry.byRel.get(target) || null : null;
}

function getRouteContext(rel, registry) {
  const current = registry.byRel.get(rel);
  const currentRoute = current && current.fm.page_type === 'route' ? current : null;
  const refs = registry.routeRefsByPage.get(rel) || [];
  if (!currentRoute && refs.length === 0) return null;

  let steps = [];
  let previous = null;
  let next = null;
  let articleRoute = null;
  let articleIndex = -1;
  let articlePrevious = null;
  let articleNext = null;
  if (currentRoute) {
    if (currentRoute.route_group_mode === 'sequence' || currentRoute.route_group_mode === 'legacy') {
      steps = registry.routesByGroup.get(currentRoute.fm.route_group) || [];
      const index = steps.findIndex(route => route.rel === rel);
      previous = index > 0 ? steps[index - 1] : null;
      next = routeTarget(currentRoute, registry) || (index >= 0 ? steps[index + 1] || null : null);
    } else {
      steps = currentRoute.chapters || [];
      next = steps[0] ? steps[0].page : null;
    }
  } else if (refs.length > 0) {
    // A direct article open must not silently select refs[0]. The renderer
    // shows all memberships and nav.js validates an explicit query choice.
    const chapterRefs = refs.filter(ref => ref.kind === 'chapter');
    if (chapterRefs.length === 1) {
      articleRoute = chapterRefs[0].route;
      steps = articleRoute.chapters.length > 0 ? articleRoute.chapters : articleRoute.legacyChapters;
      articleIndex = chapterRefs[0].index;
      articlePrevious = articleIndex > 0 ? steps[articleIndex - 1].page : null;
      articleNext = articleIndex >= 0 ? (steps[articleIndex + 1] && steps[articleIndex + 1].page) || null : null;
    }
  }

  return {
    currentRel: rel,
    // Explicit route membership determines the reading view for ordinary
    // topic pages too. Shared articles still require a reader's route choice.
    readingChapter: articleIndex >= 0 || Boolean(current && current.fm && current.fm.page_type === 'reading-chapter'),
    route: currentRoute,
    steps,
    previous,
    next,
    referencedBy: refs,
    articleRoute,
    articleIndex,
    articlePrevious,
    articleNext,
  };
}

function validateRoutes(pages) {
  const registry = buildPageRegistry(pages);
  const errors = [];
  const warnings = [];
  const seenKeys = new Set();

  for (const route of registry.routes) {
    const group = route.fm.route_group;
    const key = `${group}:${route.fm.route_key}`;
    if (!group || !route.fm.route_key) errors.push(`${route.rel}: route_group and route_key are required`);
    if (!Number.isFinite(Number(route.fm.route_order))) errors.push(`${route.rel}: route_order must be a number`);
    if (!['sequence', 'alternatives', 'legacy'].includes(route.route_group_mode)) {
      errors.push(`${route.rel}: route_group_mode must be sequence, alternatives, or legacy`);
    }
    if (Object.hasOwn(route.fm, 'chapters') && !Array.isArray(route.fm.chapters)) {
      errors.push(`${route.rel}: chapters must be an array when provided`);
    }
    const chapterTargets = new Set();
    for (const chapter of route.chapterLinks || []) {
      if (chapterTargets.has(chapter.target)) errors.push(`${route.rel}: duplicate chapter ${chapter.target}`);
      chapterTargets.add(chapter.target);
      if (!chapter.page) errors.push(`${route.rel}: chapter does not exist: ${chapter.target}`);
      if (chapter.page && chapter.page.fm.page_type === 'route') {
        errors.push(`${route.rel}: chapter must be a reading page, not a route: ${chapter.target}`);
      }
    }
    if (seenKeys.has(key)) errors.push(`${route.rel}: duplicate route key ${key}`);
    seenKeys.add(key);

    if (route.fm.route_next) {
      const next = routeTarget(route, registry);
      if (!next) {
        errors.push(`${route.rel}: route_next target does not exist: ${route.fm.route_next}`);
      } else if (next.fm.route_group !== group) {
        errors.push(`${route.rel}: route_next target is outside route group: ${route.fm.route_next}`);
      }
    }

    for (const ref of route.mainStepLinks || []) {
      if (!registry.byRel.has(ref.target)) errors.push(`${route.rel}: main step link does not exist: ${ref.target}`);
    }
  }

  for (const index of pages.filter(page => page.fm.page_type === 'route-index')) {
    const expected = (registry.routesByGroup.get(index.fm.route_group) || []).map(route => route.rel);
    const linked = new Set(extractMarkdownLinks(index.content, index.rel).map(link => link.target));
    for (const target of expected) {
      if (!linked.has(target)) errors.push(`${index.rel}: route index does not link to ${target}`);
    }
  }

  for (const page of pages) {
    const refs = (registry.routeRefsByPage.get(page.rel) || [])
      .filter(ref => Array.isArray(ref.route.fm.chapters));
    if (refs.length === 1) {
      const ref = refs[0];
      const next = ref.route.chapters[ref.index + 1];
      // Only check an explicit linked promise. Ordinary mentions of “下一章”
      // and optional reading links have no reliable machine-readable meaning.
      for (const match of page.content.matchAll(/下一(?:章|篇)(?:的)?\s*\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = normalizeTarget(page.rel, match[1]);
        if (target && target !== next?.target) {
          errors.push(`${page.rel}: prose next chapter disagrees with ${ref.route.rel}: ${target}`);
        }
      }
    }
    if (page.fm.page_type === 'route' || registry.routeRefsByPage.has(page.rel)) continue;
    warnings.push(`${page.rel}: no route reference`);
  }

  return { registry, errors, warnings };
}

module.exports = {
  buildPageRegistry,
  extractMainStepLinks,
  extractMarkdownLinks,
  getRouteContext,
  normalizeTarget,
  validateRoutes,
};
