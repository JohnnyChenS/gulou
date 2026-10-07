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

test('course entrances offer a start action without duplicating the chapter list above the title', () => {
  for (const rel of ['paths/parenting/new-parent/index.html', 'paths/exploration/youth/index.html', 'stages/family/parenting/3-6/index.html']) {
    const html = read(rel);
    const nav = html.match(/<section\b[^>]*class="route-nav"[\s\S]*?<\/section>/)?.[0];
    assert.ok(nav, rel + ' needs a start action');
    assert.ok(nav.includes('从第一章开始'), rel + ' must label the first chapter clearly');
    assert.ok(!nav.includes('class="route-step'), rel + ' duplicates the directory before the body');
  }
});

test('academic pressure separates immediate danger, suicidal thoughts, and school impairment', () => {
  const html = read('stages/family/parenting/14-18/cognitive/academic-pressure-01.html');
  const section = html.match(/<h2\b[^>]*>先确认安全<\/h2>([\s\S]*?)<h2\b/)?.[1];
  assert.ok(section, 'the safety distinction must precede ordinary learning advice');
  const paragraphs = Array.from(section.matchAll(/<p>([\s\S]*?)<\/p>/g), match => match[1]);
  const danger = paragraphs.find(text => text.includes('正在实施自伤'));
  const thoughts = paragraphs.find(text => text.includes('即使没有说出计划'));
  const impairment = paragraphs.find(text => text.includes('因焦虑无法参加考试或到校'));
  assert.ok(danger?.includes('120'), 'immediate danger must retain emergency help');
  assert.ok(thoughts?.includes('立即') && thoughts.includes('不等出现计划'), 'thoughts without a plan still need immediate support');
  assert.ok(impairment?.includes('具体评估'), 'functional impairment needs assessment');
  assert.ok(!impairment.includes('120'), 'school impairment alone must not inherit an emergency number');
});

test('the newborn stool threshold stays within its formula-feeding context', () => {
  const html = read('paths/parenting/new-parent/08-reading-baby-signals.html');
  const paragraphs = Array.from(html.matchAll(/<p>([\s\S]*?)<\/p>/g), match => match[1]);
  const threshold = paragraphs.find(text => text.includes('2–3 天没有排便'));
  assert.ok(threshold?.includes('配方奶喂养') && threshold.includes('未满 8 周'), 'do not generalize the source threshold to all feeding methods');
  const breastmilk = paragraphs.find(text => text.includes('纯母乳喂养时'));
  assert.ok(breastmilk?.includes('不等满某个天数才咨询'), 'early breastmilk intake concerns must not wait for the formula threshold');
});

test('first-day maternal care keeps timing and comfort measures conditional on medical assessment', () => {
  const html = read(routeDir + '04-first-day.html');
  const maternal = html.split('id="maternal-first-day"')[1]?.split('宝宝的第一次护理要有人带')[0];
  assert.ok(maternal, 'maternal care must precede the newborn care section');
  const text = maternal.replace(/<[^>]+>/g, '');
  assert.match(text, /分娩后或拔管后[\s\S]*4 小时[\s\S]*告知医护[\s\S]*6 小时[\s\S]*评估/);
  assert.match(text, /下腹胀痛[\s\S]*当时就叫护士，不等到某个小时数/, 'symptoms must not wait for the clock threshold');
  assert.match(text, /流水声只是[\s\S]*不反复尝试拖延评估/, 'comfort measures must not delay assessment');
  assert.match(text, /不为“催尿”短时间灌大量水/);
  assert.match(text, /第一次下床[\s\S]*腿部感觉和力量已经恢复[\s\S]*不是所有人的统一时刻/);
  assert.match(text, /不必把“必须等排气才能喝水或吃饭”当作所有人的规则[\s\S]*个体方案/);
  assert.match(text, /第一天没有大便本身不需要强行处理[\s\S]*反复呕吐[\s\S]*当场叫医护/);
  const handbook = read('stages/family/parenting/quick-start.html');
  assert.ok(hrefs(handbook).some(href => href.includes('/04-first-day.html') && href.endsWith('#maternal-first-day')), 'the concise handbook must link to the detailed maternal guidance');
});

test('movement and observation articles separate emergency signs from development consultation', () => {
  for (const name of ['3-6/physical/basic-movement-01', '3-6/physical/outdoor-habits-01', '6-9/development-assessment']) {
    const html = read('stages/family/parenting/' + name + '.html');
    const paragraphs = Array.from(html.matchAll(/<p>([\s\S]*?)<\/p>/g), match => match[1]);
    const danger = paragraphs.find(text => text.includes('呼吸困难'));
    assert.ok(danger?.includes('立即') && danger.includes('当地急救'), name + ' must make emergency action explicit');
    const development = paragraphs.find(text => text.includes('不必等'));
    assert.ok(development && /咨询|联系/.test(development) && !development.includes('呼吸困难'), name + ' must not make ordinary consultation the response to respiratory distress');
  }
});

test('age directories and novice chapters open the matching section of both materials guides', () => {
  const infantAnchors = ['months-0-3', 'months-3-6', 'months-6-12', 'months-12-18', 'months-18-24', 'years-2-3'];
  const ageAnchors = [['0-3', 'months-0-3'], ['3-6', 'years-3-6'], ['6-9', 'years-6-9'], ['9-12', 'years-9-12'], ['12-14', 'years-12-18'], ['14-18', 'years-12-18']];
  for (const guide of ['reading-materials', 'play-materials']) {
    const guideHtml = read(`stages/family/parenting/${guide}.html`);
    const ids = new Set(Array.from(guideHtml.matchAll(/\bid="([^"]+)"/g), match => match[1]));
    for (const anchor of new Set([...infantAnchors, ...ageAnchors.map(([, anchor]) => anchor)])) {
      assert.ok(ids.has(anchor), `${guide} must retain age destination ${anchor}`);
    }
    const entries = ageAnchors.map(([age, anchor]) => [`stages/family/parenting/${age}/index.html`, anchor]);
    infantAnchors.forEach((anchor, i) => entries.push([routeDir + chapterFiles[9 + i] + '.html', anchor]));
    for (const [entry, anchor] of entries) {
      assert.ok(hrefs(read(entry)).some(href => href.endsWith(`/parenting/${guide}.html#${anchor}`)), `${entry} must open ${guide} at its own age`);
    }
  }
  const reading = read('stages/family/parenting/reading-materials.html');
  assert.ok(reading.includes('id="parents"') && reading.includes('id="language-materials"'), 'parents and language materials must remain separate destinations');
});

test('home sensory play separates a rest break from symptoms requiring assessment', () => {
  const html = read('stages/family/parenting/play-materials.html');
  const text = html.replace(/<[^>]+>/g, '');
  assert.match(text, /害怕或明显疲倦时，停下来休息/);
  assert.match(text, /疼痛、头晕、恶心或反复失去平衡[\s\S]*立即停止[\s\S]*明显、持续或反复出现，应联系医生/);
  assert.match(text, /怀疑吞入电池、磁铁或吸水珠，立即联系急诊／急救，不等出现症状/);
  const sensory = text.split('“感统器材”怎样选：先说清要玩什么')[1];
  assert.ok(sensory, 'ordinary sensory games must explain their scope');
  assert.match(sensory, /不能据此诊断或治疗/);
  assert.match(sensory, /不把快速旋转、高处跳落、强力挤压或家庭蹦床作为感统练习/);
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
