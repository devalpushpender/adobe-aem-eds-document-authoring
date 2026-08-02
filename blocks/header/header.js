import { getMetadata } from '../../scripts/aem.js';

/**
 * Loads the /nav fragment (configurable via header metadata) and decorates
 * it into brand / nav-links / CTA regions.
 *
 * Robust to how the /nav doc was authored: works whether links sit inside a
 * <ul>, or are written inline in a single paragraph (all that matters is
 * that they are real <a> links). The LAST link found is treated as the CTA
 * button, everything before it as nav links, and any leftover plain text
 * (with links stripped out) as the brand name.
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const navPath = getMetadata('nav') || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.warn(`header: could not load nav content from ${navPath}`);
    return;
  }
  const html = await resp.text();
  const nav = document.createElement('div');
  nav.innerHTML = html;

  const allLinks = [...nav.querySelectorAll('a')];
  const ctaLink = allLinks.pop();
  const navLinkEls = allLinks;

  // Brand: leading image (if any) + any plain text left after stripping links
  const img = nav.querySelector('img');
  const firstEl = nav.children[0];
  let brandText = '';
  if (firstEl) {
    const clone = firstEl.cloneNode(true);
    clone.querySelectorAll('a').forEach((a) => a.remove());
    brandText = clone.textContent.trim();
  }

  const brandWrap = document.createElement('div');
  brandWrap.className = 'header-brand';
  const logo = document.createElement('span');
  logo.className = 'header-logo';
  if (img) logo.append(img);
  else logo.textContent = 'PS';
  const name = document.createElement('p');
  name.className = 'header-name';
  name.textContent = brandText || 'Your Name';
  brandWrap.append(logo, name);

  const navLinks = document.createElement('nav');
  navLinks.className = 'header-nav';
  navLinks.setAttribute('aria-label', 'Primary');
  const ul = document.createElement('ul');
  navLinkEls.forEach((a) => {
    a.removeAttribute('title');
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  navLinks.append(ul);

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'header-cta';
  if (ctaLink) {
    ctaLink.removeAttribute('title');
    ctaLink.className = 'button';
    ctaWrap.append(ctaLink);
  }

  const toggle = document.createElement('button');
  toggle.className = 'header-nav-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.addEventListener('click', () => {
    const open = block.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // IMPORTANT: replaceChildren (not append) - clears the block's original
  // empty placeholder div left over from the synthetic auto-block creation.
  block.replaceChildren(brandWrap, navLinks, ctaWrap, toggle);

  // Smooth-scroll for in-page anchors, offset by header height
  block.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    const headerHeight = block.closest('header')?.offsetHeight || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
    block.classList.remove('nav-open');
  });
}
