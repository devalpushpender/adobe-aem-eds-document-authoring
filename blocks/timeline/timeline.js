/**
 * Timeline block ("Professional Experience").
 * Row 1/2 (2 cells) = title/subtitle. Remaining rows (3 cells) =
 * role/title | period | bullets (list or line-broken text).
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [titleRow, subtitleRow, ...entryRows] = rows;

  const header = document.createElement('div');
  header.className = 'timeline-header';
  header.innerHTML = `
    <h2>${titleRow.children[1]?.textContent.trim()}</h2>
    <p class="section-subtitle"><span class="rule"></span>${subtitleRow.children[1]?.textContent.trim() || ''}</p>
  `;

  const list = document.createElement('ol');
  list.className = 'timeline-list';

  entryRows.forEach((row) => {
    const [titleCell, periodCell, bulletsCell] = row.children;
    const item = document.createElement('li');
    item.className = 'timeline-item';

    const dot = document.createElement('span');
    dot.className = 'timeline-dot';

    const card = document.createElement('div');
    card.className = 'timeline-card';

    const head = document.createElement('div');
    head.className = 'timeline-card-head';
    head.innerHTML = `
      <p class="timeline-title">${titleCell.textContent.trim()}</p>
      <span class="timeline-period">${periodCell.textContent.trim()}</span>
    `;

    const bullets = document.createElement('ul');
    bullets.className = 'timeline-bullets';
    const existingList = bulletsCell.querySelector('ul, ol');
    const bulletTexts = existingList
      ? [...existingList.children].map((li) => li.textContent.trim())
      : bulletsCell.innerHTML.split(/<br\s*\/?>/i).map((l) => l.replace(/<[^>]+>/g, '').replace(/^[•\-*]\s*/, '').trim()).filter(Boolean);
    bulletTexts.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      bullets.append(li);
    });

    card.append(head, bullets);
    item.append(dot, card);
    list.append(item);
  });

  block.replaceChildren(header, list);
  block.id = 'experience';

  const items = block.querySelectorAll('.timeline-item');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach((item) => observer.observe(item));
}
