import { getMetadata } from '../../scripts/aem.js';

/**
 * Loads the /footer fragment and decorates it into copyright + social list.
 * @param {HTMLElement} block
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
    const links = [...list.querySelectorAll('a')];
    if (links.length < list.children.length) {
      // eslint-disable-next-line no-console
      console.warn('footer: one or more social items are plain text, not links. '
        + 'Hyperlink them in the /footer document for them to work as links.');
    }
    links.forEach((a, i) => {
      const li = a.parentElement;
      const hasSecondaryMarker = li.textContent.includes('(secondary)');
      if (hasSecondaryMarker) {
        // Strip the "(secondary)" marker from surrounding text nodes only -
        // never overwrite li.textContent directly, that would destroy the
        // <a> element itself (this was the actual bug: it silently deleted
        // the links on every render, even when no marker was present).
        [...li.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = node.textContent.replace('(secondary)', '').trim();
          }
        });
      }
      if (i === 0 && !hasSecondaryMarker) a.classList.add('is-primary');
    });
  }

  // IMPORTANT: replaceChildren (not append) - clears the block's original
  // empty placeholder div left over from the synthetic auto-block creation.
  block.replaceChildren(copyright, ...(list ? [list] : []));
}
