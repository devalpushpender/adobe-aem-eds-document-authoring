/**
 * Hero block. Expects rows, in order:
 * Badge | Heading | Subheading | Description | Primary CTA | Secondary CTA |
 * Terminal filename | Terminal code
 * Each row = [label cell, value cell]. Missing rows/empty cells are skipped.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const value = (i) => rows[i]?.children[1] || rows[i]?.children[0];
  const text = (i) => value(i)?.textContent?.trim() || '';
  const link = (i) => value(i)?.querySelector('a');

  const [badgeRow, headingRow, subheadingRow, descRow, primaryRow,
    secondaryRow, filenameRow, codeRow] = rows;

  const copy = document.createElement('div');
  copy.className = 'hero-copy';

  if (badgeRow && text(0)) {
    const badge = document.createElement('span');
    badge.className = 'hero-badge';
    badge.textContent = text(0);
    copy.append(badge);
  }

  if (headingRow) {
    const h1 = document.createElement('h1');
    h1.textContent = text(1);
    copy.append(h1);
  }

  if (subheadingRow && text(2)) {
    const sub = document.createElement('p');
    sub.className = 'hero-subheading';
    sub.textContent = text(2);
    copy.append(sub);
  }

  if (descRow && text(3)) {
    const desc = document.createElement('p');
    desc.className = 'hero-description';
    desc.textContent = text(3);
    copy.append(desc);
  }

  const actions = document.createElement('div');
  actions.className = 'hero-actions';
  const primaryLink = link(4);
  if (primaryLink) {
    primaryLink.className = 'button primary';
    actions.append(primaryLink);
  }
  const secondaryLink = link(5);
  if (secondaryLink) {
    secondaryLink.className = 'button secondary';
    actions.append(secondaryLink);
  }
  if (actions.children.length) copy.append(actions);

  // Terminal panel
  const terminal = document.createElement('div');
  terminal.className = 'hero-terminal';
  terminal.setAttribute('aria-hidden', 'true');

  const image = codeRow?.querySelector('img');
  if (image && !filenameRow) {
    terminal.classList.add('hero-terminal--image');
    terminal.append(image);
  } else {
    const header = document.createElement('div');
    header.className = 'hero-terminal-header';
    header.innerHTML = '<span class="hero-terminal-dots"><i></i><i></i><i></i></span>';
    const filename = document.createElement('span');
    filename.className = 'hero-terminal-filename';
    filename.textContent = filenameRow ? text(6) : 'terminal';
    header.append(filename);

    const body = document.createElement('pre');
    body.className = 'hero-terminal-body';
    const codeCell = value(7);
    const lines = (codeCell?.innerHTML || '')
      .split(/<br\s*\/?>/i)
      .map((l) => l.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    lines.forEach((lineText) => {
      const line = document.createElement('span');
      line.className = 'hero-terminal-line';
      if (lineText.startsWith('//')) line.classList.add('is-comment');
      else if (lineText.startsWith('import')) line.classList.add('is-import');
      else if (/expect\(/.test(lineText)) line.classList.add('is-assert');
      else if (/^(const|await)/.test(lineText)) line.classList.add('is-statement');
      else line.classList.add('is-keyword');
      line.textContent = lineText;
      body.append(line, document.createElement('br'));
    });
    const cursor = document.createElement('span');
    cursor.className = 'hero-terminal-cursor';
    body.append(cursor);

    terminal.append(header, body);
  }

  block.replaceChildren(copy, terminal);

  // Type-on animation, skipped for reduced-motion users
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = terminal.querySelectorAll('.hero-terminal-line');
  if (lines.length && !prefersReducedMotion) {
    lines.forEach((l) => { l.dataset.full = l.textContent; l.textContent = ''; });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let i = 0;
        const typeNext = () => {
          if (i >= lines.length) return;
          const lineEl = lines[i];
          lineEl.textContent = lineEl.dataset.full;
          i += 1;
          setTimeout(typeNext, 180);
        };
        typeNext();
      });
    }, { threshold: 0.4 });
    observer.observe(terminal);
  }
}
