/**
 * Stats block ("Professional Summary").
 * 2-cell rows (label, value) => title / subtitle / paragraphs, in order.
 * 4-cell rows (icon, value, label, sub) => stat cards.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const textRows = rows.filter((r) => r.children.length === 2);
  const statRows = rows.filter((r) => r.children.length === 4);

  const [titleRow, subtitleRow, ...paraRows] = textRows;

  const header = document.createElement('div');
  header.className = 'stats-header';
  if (titleRow) {
    const h2 = document.createElement('h2');
    h2.textContent = titleRow.children[1].textContent.trim();
    header.append(h2);
  }
  if (subtitleRow) {
    const subtitle = document.createElement('p');
    subtitle.className = 'stats-subtitle';
    subtitle.innerHTML = `<span class="rule"></span>${subtitleRow.children[1].textContent.trim()}`;
    header.append(subtitle);
  }

  const body = document.createElement('div');
  body.className = 'stats-body';

  const copy = document.createElement('div');
  copy.className = 'stats-copy';
  paraRows.forEach((row, i) => {
    const p = document.createElement('p');
    if (i === 0) p.className = 'lead';
    p.textContent = row.children[1].textContent.trim();
    copy.append(p);
  });

  const cards = document.createElement('div');
  cards.className = 'stats-cards';
  statRows.forEach((row) => {
    const [iconCell, valueCell, labelCell, subCell] = row.children;
    const card = document.createElement('div');
    card.className = 'stat-card';
    const icon = document.createElement('span');
    icon.className = 'stat-icon';
    const img = iconCell.querySelector('img');
    if (img) icon.append(img);
    else icon.textContent = iconCell.textContent.trim();
    const text = document.createElement('div');
    text.className = 'stat-text';
    text.innerHTML = `
      <p class="stat-value">${valueCell.textContent.trim()}</p>
      <p class="stat-label">${labelCell.textContent.trim()}</p>
      <p class="stat-sub">${subCell.textContent.trim()}</p>
    `;
    card.append(icon, text);
    cards.append(card);
  });

  body.append(copy, cards);
  block.replaceChildren(header, body);
  block.id = 'about';
}
