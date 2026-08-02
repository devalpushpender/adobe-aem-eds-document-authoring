const ACCENTS = new Set(['blue', 'green', 'purple', 'orange']);

/**
 * Projects block: section header + static card grid.
 * Row 1/2 (2 cells) = title/subtitle. Remaining rows (4 cells) =
 * title | description | comma-separated tags | accent color.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [titleRow, subtitleRow, ...cardRows] = rows;

  const header = document.createElement('div');
  header.className = 'projects-header';
  header.innerHTML = `
    <h2>${titleRow.children[1]?.textContent.trim()}</h2>
    <p class="section-subtitle"><span class="rule"></span>${subtitleRow.children[1]?.textContent.trim() || ''}</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'projects-grid';

  cardRows.forEach((row) => {
    const [titleCell, descCell, tagsCell, accentCell] = row.children;
    const accent = accentCell?.textContent.trim().toLowerCase();

    const card = document.createElement('article');
    card.className = `project-card is-${ACCENTS.has(accent) ? accent : 'blue'}`;

    const h3 = document.createElement('h3');
    h3.textContent = titleCell.textContent.trim();

    const desc = document.createElement('p');
    desc.textContent = descCell.textContent.trim();

    const tags = document.createElement('ul');
    tags.className = 'project-tags';
    tagsCell.textContent.split(',').map((t) => t.trim()).filter(Boolean).forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      tags.append(li);
    });

    card.append(h3, desc, tags);
    grid.append(card);
  });

  block.replaceChildren(header, grid);
  block.id = 'projects';
}
