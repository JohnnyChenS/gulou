#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { validateRoutes } = require('./route-registry');

const ROOT = path.resolve(__dirname, '../..');
const CONTENT_DIRS = ['stages', 'interests', 'paths', 'references'];
const SKIP = new Set(['.git', '.claude', '.sisyphus', 'node_modules']);

function collect(dir, base, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, base, results);
    else if (entry.name.endsWith('.md')) {
      const raw = fs.readFileSync(full, 'utf8');
      const parsed = matter(raw);
      results.push({ full, rel: path.relative(base, full), fm: parsed.data, content: parsed.content });
    }
  }
  return results;
}

const pages = CONTENT_DIRS.flatMap(dir => collect(path.join(ROOT, dir), ROOT));
const { errors, warnings } = validateRoutes(pages);
for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
for (const error of errors) console.error(`  ✗ ${error}`);
if (errors.length > 0) process.exit(1);
console.log(`Route check passed: ${pages.length} pages scanned, ${warnings.length} warnings.`);
