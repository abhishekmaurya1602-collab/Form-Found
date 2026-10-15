import { JSDOM, VirtualConsole } from 'jsdom';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export function createSite({ file = 'index.html', hash = '', stored = {} } = {}) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => {
    if (!/not implemented/i.test(error.message)) errors.push(error.message);
  });
  const dom = new JSDOM(readFileSync(path.join(root, file), 'utf8'), {
    url: `https://form-found.vercel.app/${file === 'index.html' ? '' : file}${hash}`,
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console
  });
  const w = dom.window;
  // These stubs test application behavior, not native browser layout or focus trapping.
  w.matchMedia = () => ({ matches: false });
  w.scrollTo = () => {};
  w.ResizeObserver = class { observe() {} unobserve() {} };
  w.IntersectionObserver = class { observe() {} };
  w.document.fonts = { ready: Promise.resolve() };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute('open');
    this.dispatchEvent(new w.Event('close'));
  };
  for (const [key, value] of Object.entries(stored)) w.localStorage.setItem(key, value);
  for (const file of ['styles.css', 'accessibility.css']) {
    const style = w.document.createElement('style');
    style.textContent = readFileSync(path.join(root, file), 'utf8');
    w.document.head.append(style);
  }
  const evaluate = source => vm.runInContext(source, dom.getInternalVMContext());
  if (file === 'index.html') for (const file of ['products.js', 'app.js']) evaluate(readFileSync(path.join(root, file), 'utf8'));
  return { dom, w, d: w.document, evaluate, errors, close: () => w.close() };
}
export function contrast(foreground, background) {
  const luminance = hex => {
    const channels = hex.replace('#', '').match(/../g).map(c => parseInt(c, 16) / 255)
      .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  };
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
