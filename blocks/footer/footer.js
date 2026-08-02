import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */

export default async function decorate(block) {
  const footerPath = getMetadata('footer') || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.warn(`footer: could not load footer content from ${footerPath}`);
    return;
  }
  const html = await resp.text();
  const wrap = document.createElement('div');
  wrap.innerHTML = html;

  const copyEl = wrap.querySelector('p');
  const copyright = document.createElement('p');
  copyright.className = 'footer-copyright';
  copyright.textContent = copyEl?.textContent?.trim() || '';

  const list = wrap.querySelector('ul');
  if (list) {
    list.className = 'footer-social';
    const links = list.querySelectorAll('a');
    links.forEach((a, i) => {
      const isSecondary = a.parentElement.textContent.includes('(secondary)');
      a.parentElement.textContent = a.parentElement.textContent.replace('(secondary)', '').trim();
      if (i === 0 && !isSecondary) a.classList.add('is-primary');
    });
  }

  block.append(copyright);
  if (list) block.append(list);
}

