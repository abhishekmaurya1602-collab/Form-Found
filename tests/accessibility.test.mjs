import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { createSite, root, contrast } from './helpers.mjs';

const tick = () => new Promise(resolve => setTimeout(resolve, 30));
const press = (w, key, options = {}) => {
  const event = new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  w.document.dispatchEvent(event);
  return event;
};

test('skip navigation moves focus into the gallery without changing the exploration route', () => {
  const s = createSite();
  s.d.querySelector('.skip-link').click();
  assert.equal(s.d.activeElement.id, 'gallery');
  assert.equal(s.w.location.hash, '');
  assert.deepEqual(s.errors, []);
  s.close();
});

test('search uses a modifier shortcut; ordinary typing does not move focus', () => {
  const s = createSite();
  s.d.querySelector('#page-title').focus();
  assert.equal(press(s.w, '/').defaultPrevented, false);
  assert.equal(s.d.activeElement.id, 'page-title');
  assert.equal(press(s.w, 'k', { ctrlKey: true }).defaultPrevented, true);
  assert.equal(s.d.activeElement.id, 'search');
  s.w.navigate('maker', 'eames');
  press(s.w, 'k', { metaKey: true });
  assert.equal(s.d.activeElement.id, 'detail-title');
  s.close();
});

test('dialog navigation updates its name, description, document title and focused heading', async () => {
  const s = createSite();
  const trigger = s.d.querySelector('[data-open="eames-lcw"]');
  trigger.focus(); trigger.click();
  assert.equal(s.d.activeElement.id, 'detail-title');
  assert.equal(s.d.querySelector('#product-dialog').getAttribute('aria-describedby'), 'detail-description');
  assert.match(s.d.title, /LCW Lounge Chair/);
  s.d.querySelector('#product-detail [data-maker="eames"]').click();
  assert.match(s.d.title, /Charles & Ray Eames/);
  assert.equal(s.d.activeElement.id, 'detail-title');
  s.d.querySelector('[data-trail-back]').click(); await tick();
  assert.equal(s.w.location.hash, '#object/eames-lcw');
  assert.equal(s.d.activeElement.id, 'detail-title');
  s.d.querySelector('#product-dialog [data-close]').click();
  assert.equal(s.d.activeElement, trigger);
  assert.match(s.d.title, /Discover/);
  s.close();
});

test('save and follow accessible names contain the visible labels in both toggle states', () => {
  const s = createSite();
  for (const el of s.d.querySelectorAll('button[aria-label]')) {
    if (s.w.getComputedStyle(el).display === 'none') continue;
    const visible = el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    if (visible) assert.ok(el.getAttribute('aria-label').toLowerCase().includes(visible), `${visible} missing from accessible name`);
  }
  const check = el => {
    const visible = el.textContent.replace(/\s+/g, ' ').trim();
    assert.ok(el.getAttribute('aria-label').includes(visible), `${visible} missing from accessible name`);
  };
  s.w.navigate('object', 'eames-lcw');
  let save = s.d.querySelector('.detail-save'); check(save); save.click(); check(save);
  assert.equal(save.getAttribute('aria-pressed'), 'true');
  assert.match(s.d.querySelector('#exploration-feedback').textContent, /Saved/);
  s.w.navigate('maker', 'eames');
  let follow = s.d.querySelector('[data-follow]'); check(follow); follow.click(); check(follow);
  assert.equal(follow.getAttribute('aria-pressed'), 'true');
  assert.match(s.d.querySelector('#exploration-feedback').textContent, /following/);
  s.close();
});

test('removing a saved object focuses its successor, then the empty-state action', () => {
  const s = createSite({ stored: { 'form-found-saved': '["eames-lcw","hang-it-all"]' } });
  s.w.setView('saved');
  let button = s.d.querySelector('[data-save="eames-lcw"]'); button.focus(); button.click();
  assert.equal(s.d.activeElement.dataset.save, 'hang-it-all');
  button = s.d.activeElement; button.click();
  assert.equal(s.d.activeElement.id, 'empty-action');
  assert.equal(s.d.querySelector('#empty-state').hidden, false);
  s.d.activeElement.click();
  assert.equal(s.d.activeElement.id, 'page-title');
  s.close();
});

test('requesting more stories focuses new content and announces what changed', () => {
  const s = createSite();
  const before = [...s.d.querySelectorAll('[data-product]')].map(c => c.dataset.product);
  const button = s.d.querySelector('#load-more'); button.focus(); button.click();
  assert.equal(s.d.querySelectorAll('[data-product]').length, 18);
  assert.ok(!before.includes(s.d.activeElement.dataset.open));
  assert.match(s.d.querySelector('#toast').textContent, /2 more design stories loaded/);
  assert.equal(s.d.querySelector('#load-zone').hidden, true);
  assert.ok(!readFileSync(path.join(root, 'app.js'), 'utf8').includes('new IntersectionObserver'));
  s.close();
});

test('about and credits dialogs restore focus and announce links opening new tabs', () => {
  const s = createSite();
  const trigger = s.d.querySelector('#credits-open'); trigger.focus(); trigger.click();
  assert.equal(s.d.activeElement.id, 'info-title');
  assert.ok(s.d.querySelector('#info-description'));
  for (const a of s.d.querySelectorAll('#info-dialog a[target="_blank"]')) assert.match(a.textContent, /opens in a new tab/);
  s.d.querySelector('#info-dialog [data-close]').click();
  assert.equal(s.d.activeElement, trigger);
  s.close();
});

test('search, filters, sort, deep links and persisted collections still work', () => {
  const s = createSite({ hash: '#maker/rams' });
  assert.equal(s.d.querySelector('#detail-title').textContent, 'Dieter Rams');
  s.w.closeExplorer();
  s.d.querySelector('#search').value = 'Hans Gugelot';
  s.d.querySelector('#search').dispatchEvent(new s.w.Event('input'));
  assert.equal(s.d.querySelectorAll('[data-product]').length, 1);
  assert.equal(s.d.querySelector('[data-product]').dataset.product, 'braun-sk4');
  s.w.setView('discover');
  s.d.querySelector('#sort').value = 'oldest';
  s.d.querySelector('#sort').dispatchEvent(new s.w.Event('change'));
  assert.equal(s.d.querySelector('[data-product]').dataset.product, 'tube-diagram');
  let category = s.d.querySelector('[data-category="Furniture"]');
  category.focus(); category.click();
  assert.equal(s.d.activeElement.dataset.category, 'Furniture');
  assert.equal(s.d.activeElement.getAttribute('aria-pressed'), 'true');
  s.d.querySelector('#back-top').hidden = false;
  s.d.querySelector('#back-top').focus(); s.d.querySelector('#back-top').click();
  assert.equal(s.d.activeElement.id, 'page-title');
  for (const p of s.evaluate('PRODUCTS')) assert.ok(existsSync(path.join(root, p.image)));
  s.close();
});

test('normal text palette meets 4.5:1 on every authored light background; controls meet 3:1', () => {
  const s = createSite();
  const tree = postcss.parse(readFileSync(path.join(root, 'accessibility.css'), 'utf8'));
  const palette = {};
  tree.walkRules(':root', rule => rule.walkDecls(decl => { palette[decl.prop] = decl.value; }));
  const backgrounds = new Set([palette['--bg'], '#ffffff', '#efeee9', '#efeee8', '#eeeee4', '#e9eee1', '#f0f0e8', '#eceee3', '#eeefe7', '#f1e9e2', '#ecebe5', '#e9e7e0', ...s.evaluate('PRODUCTS').map(p => p.bg), ...s.evaluate('DESIGNERS').map(d => d.color)]);
  for (const background of backgrounds) {
    for (const token of ['--ink', '--muted', '--green', '--accent']) {
      assert.ok(contrast(palette[token], background) >= 4.5, `${token} on ${background}: ${contrast(palette[token], background).toFixed(2)}`);
    }
    assert.ok(contrast(palette['--control-border'], background) >= 3, `Control boundary on ${background}`);
    assert.ok(contrast(palette['--focus'], background) >= 3, `Focus outline on ${background}`);
  }
  for (const background of [palette['--ink'], palette['--green'], palette['--accent']]) assert.ok(contrast('#ffffff', background) >= 4.5);
  s.close();
});

test('all shared styles parse, credit-page images have text alternatives, and CSS supplies reflow/focus adaptations', () => {
  for (const file of ['styles.css', 'accessibility.css']) assert.ok(postcss.parse(readFileSync(path.join(root, file), 'utf8')));
  const css = readFileSync(path.join(root, 'accessibility.css'), 'utf8');
  assert.match(css, /forced-colors: active/); assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width: 480px/); assert.match(css, /min-block-size: 2\.75rem/);
  for (const file of ['assets/classics/credits.html', 'assets/portraits/credits.html']) {
    const s = createSite({ file });
    for (const img of s.d.images) assert.ok(img.hasAttribute('alt'));
    assert.equal(s.d.querySelectorAll('h1').length, 1);
    assert.ok(s.d.querySelector('.skip-link'));
    s.close();
  }
});
