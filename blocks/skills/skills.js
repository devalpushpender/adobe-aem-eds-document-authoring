/**
 * Skills block: section header + card carousel.
 * Row 1/2 (2 cells) = title/subtitle. Remaining rows (3 cells) =
 * icon | title | comma-separated tags.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [titleRow, subtitleRow, ...cardRows] = rows;

  const header = document.createElement('div');
  header.className = 'skills-header';
  header.innerHTML = `
    <h2>${titleRow.children[1]?.textContent.trim() || titleRow.children[0].textContent.trim()}</h2>
    <p class="section-subtitle"><span class="rule"></span>${subtitleRow.children[1]?.textContent.trim() || ''}</p>
  `;

  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', titleRow.children[1]?.textContent.trim() || 'Skills');

  const track = document.createElement('div');
  track.className = 'carousel-track';

  cardRows.forEach((row) => {
    const [iconCell, titleCell, tagsCell] = row.children;
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const card = document.createElement('div');
    card.className = 'skill-card';
    const head = document.createElement('div');
    head.className = 'skill-card-head';
    const icon = document.createElement('span');
    icon.className = 'skill-icon';
    const img = iconCell.querySelector('img');
    if (img) icon.append(img); else icon.textContent = iconCell.textContent.trim();
    const title = document.createElement('p');
    title.textContent = titleCell.textContent.trim();
    head.append(icon, title);

    const tagList = document.createElement('ul');
    tagList.className = 'skill-tags';
    tagsCell.textContent.split(',').map((t) => t.trim()).filter(Boolean).forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      tagList.append(li);
    });

    card.append(head, tagList);
    slide.append(card);
    track.append(slide);
  });

  carousel.append(track);
  block.replaceChildren(header, carousel);
  block.id = 'skills';

  initCarousel(carousel, getVisibleCount(block));
}

function getVisibleCount(block) {
  if (block.classList.contains('visible-2')) return 2;
  if (block.classList.contains('visible-4')) return 4;
  return 3;
}

/**
 * Generic slide-carousel behavior: dots + arrows + swipe, responsive count.
 * @param {HTMLElement} carousel
 * @param {number} desktopVisible
 */
export function initCarousel(carousel, desktopVisible = 3) {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.children];
  let index = 0;

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  const dots = document.createElement('div');
  dots.className = 'carousel-dots';
  const arrows = document.createElement('div');
  arrows.className = 'carousel-arrows';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.textContent = '‹';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.textContent = '›';
  arrows.append(prevBtn, nextBtn);
  controls.append(dots, arrows);
  carousel.append(controls);

  const visibleCount = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return Math.min(2, desktopVisible);
    return desktopVisible;
  };

  let maxIndex = Math.max(0, slides.length - visibleCount());

  const buildDots = () => {
    dots.innerHTML = '';
    for (let i = 0; i <= maxIndex; i += 1) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === index) dot.setAttribute('aria-current', 'true');
      dot.addEventListener('click', () => goTo(i));
      dots.append(dot);
    }
  };

  const render = () => {
    const vc = visibleCount();
    maxIndex = Math.max(0, slides.length - vc);
    index = Math.min(index, maxIndex);
    const gap = 24;
    track.style.transform = `translateX(calc(-${index} * (100% / ${vc} + ${gap / vc}px)))`;
    slides.forEach((slide) => {
      slide.style.width = `calc((100% - ${(vc - 1) * gap}px) / ${vc})`;
    });
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === maxIndex;
    buildDots();
  };

  const goTo = (i) => { index = Math.max(0, Math.min(i, maxIndex)); render(); };

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  window.addEventListener('resize', render);

  // touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  }, { passive: true });

  render();
}
