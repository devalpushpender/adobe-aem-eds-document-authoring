/**
 * Education block. Row 1/2 (2 cells) = title/subtitle. Remaining rows
 * (4 cells) = icon | institution | degree | year, one or more.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [titleRow, subtitleRow, ...entryRows] = rows;

  const header = document.createElement('div');
  header.className = 'education-header';
  header.innerHTML = `
    <h2>${titleRow.children[1]?.textContent.trim()}</h2>
    <p class="section-subtitle"><span class="rule"></span>${subtitleRow.children[1]?.textContent.trim() || ''}</p>
  `;

  const entries = entryRows.map((row) => {
    const [iconCell, instCell, degreeCell, yearCell] = row.children;
    const entry = document.createElement('div');
    entry.className = 'education-entry';
    const icon = document.createElement('span');
    icon.className = 'education-icon';
    const img = iconCell.querySelector('img');
    if (img) icon.append(img); else icon.textContent = iconCell.textContent.trim();
    const text = document.createElement('div');
    text.innerHTML = `
      <p class="education-institution">${instCell.textContent.trim()}</p>
      <p class="education-degree">${degreeCell.textContent.trim()}</p>
      <p class="education-year">${yearCell.textContent.trim()}</p>
    `;
    entry.append(icon, text);
    return entry;
  });

  block.replaceChildren(header, ...entries);
}
