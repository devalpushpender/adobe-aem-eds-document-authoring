import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');
/**
 * Loads the /nav fragment (configurable via header metadata) and decorates
 * it into brand / nav-links / CTA regions.
 * @param {Element} block
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

  // First paragraph (with or without an image) = brand
  const brandWrap = document.createElement('div');
  brandWrap.className = 'header-brand';
  const firstEl = nav.children[0];
  const img = firstEl?.querySelector('img');
  const logo = document.createElement('span');
  logo.className = 'header-logo';
  if (img) {
    logo.replaceChildren(img);
  } else {
    logo.textContent = 'PS';
  }
  const name = document.createElement('p');
  name.className = 'header-name';
  name.textContent = firstEl?.textContent?.trim() || 'Your Name';
  brandWrap.append(logo, name);
  firstEl?.remove();

  // First <ul> found = nav links
  const list = nav.querySelector('ul');
  const navLinks = document.createElement('nav');
  navLinks.className = 'header-nav';
  navLinks.setAttribute('aria-label', 'Primary');
  if (list) {
    list.querySelectorAll('a').forEach((a) => {
      a.removeAttribute('title');
    });
    navLinks.append(list);
    list.remove();
  }

  // Remaining paragraph with a single link = CTA button
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'header-cta';
  const ctaLink = nav.querySelector('a');
  if (ctaLink) {
    ctaLink.className = 'button';
    ctaWrap.append(ctaLink);
  }

  block.append(brandWrap, navLinks, ctaWrap);

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

  // Mobile nav toggle
  const toggle = document.createElement('button');
  toggle.className = 'header-nav-toggle';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.addEventListener('click', () => {
    const open = block.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  block.append(toggle);
}
