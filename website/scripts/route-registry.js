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

    const refs = extractMainStepLinks(route.content, route.rel);
    route.mainStepLinks = refs;
    for (const ref of refs) {
      if (!routeRefsByPage.has(ref.target)) routeRefsByPage.set(ref.target, []);
      routeRefsByPage.get(ref.target).push({ route, label: ref.label });
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
    steps = registry.routesByGroup.get(currentRoute.fm.route_group) || [];
    const index = steps.findIndex(route => route.rel === rel);
    previous = index > 0 ? steps[index - 1] : null;
    next = routeTarget(currentRoute, registry) || (index >= 0 ? steps[index + 1] || null : null);
  } else if (refs.length > 0) {
    articleRoute = refs[0].route;
    const articleLinks = articleRoute.mainStepLinks || [];
    steps = articleLinks.map(link => registry.byRel.get(link.target)).filter(Boolean);
    articleIndex = articleLinks.findIndex(link => link.target === rel);
    articlePrevious = articleIndex > 0 ? registry.byRel.get(articleLinks[articleIndex - 1].target) || null : null;
    articleNext = articleIndex >= 0 ? registry.byRel.get(articleLinks[articleIndex + 1] && articleLinks[articleIndex + 1].target) || null : null;
  }

  return { currentRel: rel, route: currentRoute, steps, previous, next, referencedBy: refs, articleRoute, articleIndex, articlePrevious, articleNext };
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
