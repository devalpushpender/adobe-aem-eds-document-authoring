const ICONS = {
  email: '✉️',
  phone: '📞',
  linkedin: '💼',
  location: '📍',
};

/**
 * Contact block: info list + message form.
 * Rows: Section title | Section subtitle | Intro | (Email|Phone|LinkedIn|
 * Location rows) | Form title | Form action | Submit label.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const get = (label) => rows.find((r) => r.children[0]?.textContent.trim().toLowerCase() === label.toLowerCase());

  const titleRow = rows[0];
  const subtitleRow = rows[1];
  const introRow = rows[2];
  const formTitleRow = get('form title');
  const formActionRow = get('form action');
  const submitLabelRow = get('submit label');

  const reservedLabels = new Set(['form title', 'form action', 'submit label']);
  const infoRows = rows.slice(3).filter((r) => {
    const label = r.children[0]?.textContent.trim().toLowerCase();
    return label && !reservedLabels.has(label);
  });

  const info = document.createElement('div');
  info.className = 'contact-info';
  info.innerHTML = `
    <div class="contact-header">
      <h2>${titleRow.children[1]?.textContent.trim()}</h2>
      <p class="section-subtitle"><span class="rule"></span>${subtitleRow.children[1]?.textContent.trim() || ''}</p>
    </div>
    <p class="contact-intro">${introRow?.children[1]?.textContent.trim() || ''}</p>
  `;

  const list = document.createElement('ul');
  list.className = 'contact-list';
  infoRows.forEach((row) => {
    const label = row.children[0].textContent.trim();
    const valueCell = row.children[1];
    const linkEl = valueCell.querySelector('a');
    const li = document.createElement('li');
    li.className = 'contact-item';
    const iconKey = label.toLowerCase();
    li.innerHTML = `
      <span class="contact-icon">${ICONS[iconKey] || '•'}</span>
      <span class="contact-item-text">
        <span class="contact-label">${label}</span>
      </span>
    `;
    const textWrap = li.querySelector('.contact-item-text');
    if (linkEl) {
      linkEl.className = 'contact-value';
      textWrap.append(linkEl);
    } else {
      const value = document.createElement('span');
      value.className = 'contact-value';
      value.textContent = valueCell.textContent.trim();
      textWrap.append(value);
    }
    list.append(li);
  });
  info.append(list);

  const form = document.createElement('form');
  form.className = 'contact-form';
  form.method = 'POST';
  form.action = formActionRow?.children[1]?.textContent.trim() || '#';

  const formTitle = document.createElement('h3');
  formTitle.textContent = formTitleRow?.children[1]?.textContent.trim() || 'Send a Message';

  const nameField = buildField('name', 'Your Name', 'text', 'John Doe');
  const emailField = buildField('email', 'Your Email', 'email', 'john@example.com');
  const messageField = buildTextareaField('message', 'Message', "Hi, let's discuss our next project...");

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = submitLabelRow?.children[1]?.textContent.trim() || 'Send Message';

  form.append(formTitle, nameField, emailField, messageField, submit);
  info.append();
  block.replaceChildren(info, form);
  block.id = 'contact';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error('Submit failed');
      form.replaceChildren(formTitle, buildSuccessMessage());
    } catch {
      submit.disabled = false;
      submit.textContent = submitLabelRow?.children[1]?.textContent.trim() || 'Send Message';
      let error = form.querySelector('.contact-form-error');
      if (!error) {
        error = document.createElement('p');
        error.className = 'contact-form-error';
        form.append(error);
      }
      error.textContent = 'Something went wrong. Please try again or email directly.';
    }
  });
}

function buildField(name, label, type, placeholder) {
  const wrap = document.createElement('label');
  wrap.className = 'contact-field';
  wrap.innerHTML = `<span>${label}</span>`;
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  input.required = true;
  wrap.append(input);
  return wrap;
}

function buildTextareaField(name, label, placeholder) {
  const wrap = document.createElement('label');
  wrap.className = 'contact-field';
  wrap.innerHTML = `<span>${label}</span>`;
  const textarea = document.createElement('textarea');
  textarea.name = name;
  textarea.rows = 4;
  textarea.placeholder = placeholder;
  textarea.required = true;
  wrap.append(textarea);
  return wrap;
}

function buildSuccessMessage() {
  const p = document.createElement('p');
  p.className = 'contact-form-success';
  p.textContent = "Thanks for reaching out — I'll get back to you soon.";
  return p;
}
