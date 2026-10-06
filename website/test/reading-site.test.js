const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '../site');
const chapterFiles = [
  '01-before-birth', '02-ready-for-hospital', '03-birth-day',
  '04-first-day', '05-going-home', '06-first-week',
  '07-recovery-and-rhythm', '08-reading-baby-signals',
  '09-care-and-connection',
  '10-six-weeks-to-three-months', '11-three-to-six-months',
  '12-six-to-twelve-months', '13-twelve-to-eighteen-months',
  '14-eighteen-to-twenty-four-months', '15-twenty-four-to-thirty-six-months',
];
const routeDir = 'paths/parenting/new-parent/';

function read(rel) {
  return fs.readFileSync(path.join(site, rel), 'utf8');
}

function hrefs(html) {
  return Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g), match => match[1]);
}

test('the homepage offers continuous reading before project background', () => {
  const home = read('index.html');
  const primary = home.match(/<section\b[^>]*class="[^"]*new-parent-entry[^"]*"[\s\S]*?<\/section>/)?.[0];
  assert.ok(primary, 'homepage must expose the novice reading entry');
  assert.ok(home.indexOf(primary) < home.indexOf('关于鼓楼'));
  for (const suffix of [routeDir + '01-before-birth.html', routeDir]) {
    assert.ok(hrefs(primary).some(href => href.split(/[?#]/)[0].endsWith('/' + suffix)), `missing reader entry ${suffix}`);
  }
  for (const interest of ['language', 'mountaineering', 'system-architecture']) {
    assert.ok(hrefs(home).some(href => href.endsWith(`/interests/${interest}/index.html`)), `missing interest entry ${interest}`);
  }
});

test('each built chapter view exposes its draft state and correct adjacent chapters', () => {
  chapterFiles.forEach((file, index) => {
    const html = read(routeDir + file + '.html');
    const nav = html.match(/<section\b[^>]*class="route-nav"[\s\S]*?<\/section>/)?.[0];
    assert.ok(nav, `no reading navigation in ${file}`);
    assert.ok(!html.includes('class="route-choice-panel"'), `${file} should open the single canonical novice route directly`);
    assert.ok(html.includes('状态：</strong>草稿'), `${file} must remain a draft`);
    assert.match(html, /尚未完成(?:逐条)?专业复核/, `${file} must show its source/review boundary`);
    const breadcrumb = html.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(breadcrumb, `${file} needs a way back to its directory`);
    const routeHref = hrefs(nav).find(href => href.includes('/' + routeDir + 'index.html'));
    const prefix = new URL(routeHref, 'https://example.test').pathname.split('/paths/')[0];
    for (const href of hrefs(breadcrumb)) {
      let destination = new URL(href, 'https://example.test').pathname.slice(prefix.length).replace(/^\//, '');
      if (!destination || destination.endsWith('/')) destination += 'index.html';
      assert.ok(fs.existsSync(path.join(site, destination)), `${file} breadcrumb points to missing ${destination}`);
    }
    for (const [className, adjacent] of [['route-prev', index - 1], ['route-next', index + 1]]) {
      const link = nav.match(new RegExp(`<a class="${className}" href="([^"]+)"`));
      if (adjacent < 0 || adjacent >= chapterFiles.length) {
        assert.equal(link, null, `${file} must not invent an adjacent chapter`);
      } else {
        assert.ok(link, `${file} missing ${className}`);
        const url = new URL(link[1].replace(/&amp;/g, '&'), 'https://example.test');
        assert.ok(url.pathname.endsWith('/' + routeDir + chapterFiles[adjacent] + '.html'));
        assert.equal(url.searchParams.get('reader_route'), 'prenatal-first-week');
        assert.equal(url.searchParams.get('reader_chapter'), String(adjacent));
      }
    }
  });
});

test('the care handbook exposes the operation and safety destinations used by current chapters', () => {
  const tutorial = read('stages/family/parenting/quick-start.html');
  const ids = new Set(Array.from(tutorial.matchAll(/\bid="([^"]+)"/g), match => match[1]));
  for (const id of ['safety', 'timeline', 'feeding', 'milk-safety', 'sleep', 'diaper', 'bath', 'crying', 'weeks-two-six', 'months-one-three', 'months-three-six', 'next-stage', 'handover']) {
    assert.ok(ids.has(id), `existing tutorial destination missing: ${id}`);
  }
});

test('ordinary age-route topics have a collapsed directory and a next chapter after the body', () => {
  const html = read('stages/family/parenting/3-6/cognitive/emotion-regulation-01.html');
  assert.match(html, /<details class="route-chapter-list">/);
  const footer = html.match(/<section\b[^>]*class="route-nav route-nav-bottom"[\s\S]*?<\/section>/)?.[0];
  assert.ok(footer, 'a topic used as a chapter needs navigation after reading');
  const next = footer.match(/<a class="route-next" href="([^"]+)"/);
  assert.ok(next, 'the second chapter needs a next chapter');
  assert.ok(new URL(next[1].replaceAll('&amp;', '&'), 'https://gulou.invalid').pathname.endsWith('/stages/family/parenting/3-6/cognitive/social-play-01.html'));
});

test('young readers have their own four-chapter course and homepage entry', () => {
  const home = read('index.html');
  const primary = home.match(/<section\b[^>]*class="[^"]*youth-entry[^\"]*"[\s\S]*?<\/section>/)?.[0];
  assert.ok(primary, 'homepage must expose the youth course directly');
  assert.ok(home.indexOf(primary) < home.indexOf('关于鼓楼'));
  const names = ['01-not-sure-what-i-like', '02-try-without-choosing', '03-when-you-did-not-keep-going', '04-compare-and-choose-next-step'];
  names.forEach((name, index) => {
    const html = read('paths/exploration/youth/' + name + '.html');
    const nav = html.match(/<section\b[^>]*class="route-nav"[\s\S]*?<\/section>/)?.[0];
    assert.ok(nav, name + ' needs course navigation');
    assert.ok(html.includes('状态：</strong>草稿'), name + ' must retain its real review state');
    for (const [className, adjacent] of [['route-prev', index - 1], ['route-next', index + 1]]) {
      const link = nav.match(new RegExp(`<a class="${className}" href="([^"]+)"`));
      if (adjacent < 0 || adjacent >= names.length) assert.equal(link, null);
      else {
        assert.ok(link, name + ' missing ' + className);
        const url = new URL(link[1].replace(/&amp;/g, '&'), 'https://gulou.invalid');
        assert.ok(url.pathname.endsWith('/paths/exploration/youth/' + names[adjacent] + '.html'));
        assert.equal(url.searchParams.get('reader_route'), 'youth-self-exploration');
        assert.equal(url.searchParams.get('reader_chapter'), String(adjacent));
      }
    }
  });
});
