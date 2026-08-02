const HTML_ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
};

function decodeHtmlEntities(str) {
  return str.replace(/&(amp|lt|gt|quot|#39);/g, (m) => HTML_ENTITIES[m] || m);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CODE_KEYWORDS = [
  'import', 'from', 'const', 'let', 'var', 'await', 'async', 'new', 'return',
  'function', 'export', 'default', 'test', 'expect', 'class', 'extends',
];

/**
 * Lightweight, line-level syntax highlighter for the decorative hero
 * terminal - not a real tokenizer, just enough regex passes to read like
 * an IDE (comments, strings, keywords, function calls).
 * @param {string} lineText plain-text source line (already decoded)
 * @returns {string} HTML with <span class="tok-*"> wrapped tokens
 */
function highlightCodeLine(lineText) {
  const escaped = escapeHtml(lineText);

  if (escaped.trim().startsWith('//')) {
    return `<span class="tok-comment">${escaped}</span>`;
  }

  let out = escaped;
  // string literals
  out = out.replace(
    /('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)/g,
    (m) => `<span class="tok-string">${m}</span>`,
  );
  // keywords
  const kwRegex = new RegExp(`\\b(${CODE_KEYWORDS.join('|')})\\b`, 'g');
  out = out.replace(kwRegex, '<span class="tok-keyword">$1</span>');
  // function / method calls: word immediately followed by (
  out = out.replace(
    /\b([A-Za-z_$][\w$]*)(?=\()/g,
    (m) => (CODE_KEYWORDS.includes(m) ? m : `<span class="tok-func">${m}</span>`),
  );
  // numeric literals
  out = out.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-number">$1</span>');

  return out;
}

/**
 * Hero block. Expects rows, in order:
 * Badge | Heading | Subheading | Description | Primary CTA | Secondary CTA |
 * Terminal filename | Terminal code
 * Each row = [label cell, value cell]. Missing rows/empty cells are skipped.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const value = (i) => rows[i]?.children[1] || rows[i]?.children[0];
  const text = (i) => value(i)?.textContent?.trim() || '';
  const link = (i) => value(i)?.querySelector('a');

  const [badgeRow, headingRow, subheadingRow, descRow, , , filenameRow, codeRow] = rows;

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
    // If the authored link points at a PDF, download it on click instead
    // of navigating to it (e.g. "Download Resume" -> /media/resume.pdf).
    const href = secondaryLink.getAttribute('href') || '';
    if (/\.pdf(\?.*)?$/i.test(href)) {
      secondaryLink.setAttribute('download', '');
    }
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
    // Authored multi-line text comes through as real newline characters
    // (soft line breaks), not <br> tags - split on \n, not markup.
    const rawText = codeCell?.innerHTML
      ? codeCell.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      : '';
    const lines = decodeHtmlEntities(rawText)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const lineEls = lines.map((lineText) => {
      const line = document.createElement('span');
      line.className = 'hero-terminal-line';
      line.dataset.html = highlightCodeLine(lineText);
      body.append(line, document.createElement('br'));
      return line;
    });
    const cursor = document.createElement('span');
    cursor.className = 'hero-terminal-cursor';
    body.append(cursor);

    terminal.append(header, body);

    // Type-on animation, skipped for reduced-motion users
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      lineEls.forEach((l) => { l.innerHTML = l.dataset.html; });
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          let i = 0;
          const typeNext = () => {
            if (i >= lineEls.length) return;
            lineEls[i].innerHTML = lineEls[i].dataset.html;
            i += 1;
            setTimeout(typeNext, 180);
          };
          typeNext();
        });
      }, { threshold: 0.4 });
      observer.observe(terminal);
    }
  }

  block.replaceChildren(copy, terminal);
}
