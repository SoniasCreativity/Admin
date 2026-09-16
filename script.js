const STORAGE_KEY = 'program-ops-command-center';
const defaultProgramData = {
  program: { name: 'Product launch', health: 'On track', healthTrend: '↗', lastUpdated: 'Updated today', launchReadiness: 72 },
  workstreams: [
    { name: 'Product & engineering', owner: 'Alex Morgan', deliverables: 8, health: 'On track', status: 'green' },
    { name: 'Go-to-market readiness', owner: 'Jamie Lee', deliverables: 12, health: 'At risk', status: 'amber' },
    { name: 'Customer enablement', owner: 'Priya Shah', deliverables: 6, health: 'On track', status: 'green' },
    { name: 'Legal & compliance', owner: 'Chris Wong', deliverables: 4, health: 'Not started', status: 'gray' },
  ],
  milestones: [
    { id: 'milestone-1', name: 'Internal beta', date: '2026-09-24', status: 'Complete' },
    { id: 'milestone-2', name: 'Launch readiness review', date: '2026-10-01', status: 'In progress' },
    { id: 'milestone-3', name: 'Public launch', date: '2026-10-15', status: 'Upcoming' },
  ],
  actionItems: [
    { id: 'action-1', title: 'Finalize launch messaging', owner: 'Jamie Lee', workstream: 'Go-to-market readiness', dueDate: '2026-09-18', status: 'Open', priority: 'High' },
    { id: 'action-2', title: 'Confirm support coverage', owner: 'Priya Shah', workstream: 'Customer enablement', dueDate: '2026-09-21', status: 'Open', priority: 'Medium' },
    { id: 'action-3', title: 'Complete security review', owner: 'Chris Wong', workstream: 'Legal & compliance', dueDate: '2026-09-23', status: 'Open', priority: 'High' },
    { id: 'action-4', title: 'Validate launch checklist', owner: 'Alex Morgan', workstream: 'Product & engineering', dueDate: '2026-09-27', status: 'Complete', priority: 'High' },
  ],
  raidItems: [
    { id: 'raid-1', type: 'Risks', count: 2, owner: 'Jamie Lee', description: 'Messaging may shift with final product scope.' },
    { id: 'raid-2', type: 'Assumptions', count: 4, owner: 'Alex Morgan', description: 'Customer usage patterns hold steady through launch.' },
    { id: 'raid-3', type: 'Issues', count: 1, owner: 'Chris Wong', description: 'Regulatory feedback still pending.' },
    { id: 'raid-4', type: 'Dependencies', count: 3, owner: 'Priya Shah', description: 'Support staffing and enablement materials depend on final launch approval.' },
  ],
  activity: [],
};

const filterState = {
  workstream: 'All',
  owner: 'All',
  health: 'All',
  dueDate: '',
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function loadProgramData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...clone(defaultProgramData), ...saved } : clone(defaultProgramData);
  } catch (error) {
    return clone(defaultProgramData);
  }
}

let programData = loadProgramData();

function saveProgramData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programData));
}

function getOpenActionCount() {
  return programData.actionItems.filter((item) => item.status !== 'Complete').length;
}

function button(label, handler) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'text-button';
  element.textContent = label;
  element.addEventListener('click', handler);
  return element;
}

function getFilteredActionItems() {
  const selectedWorkstream = filterState.workstream;
  const selectedOwner = filterState.owner;
  const selectedHealth = filterState.health;
  const selectedDueDate = filterState.dueDate;

  return programData.actionItems.filter((action) => {
    if (selectedWorkstream !== 'All' && action.workstream !== selectedWorkstream) return false;
    if (selectedOwner !== 'All' && action.owner !== selectedOwner) return false;
    if (selectedHealth !== 'All' && action.status !== selectedHealth) return false;
    if (selectedDueDate && action.dueDate && action.dueDate > selectedDueDate) return false;
    return true;
  });
}

function renderProgramMetrics() {
  const cards = [...document.querySelectorAll('.metric-card')];
  if (cards.length < 4) return;

  const values = cards.map((card) => card.querySelector('.metric-value'));
  const details = cards.map((card) => card.querySelector('small'));

  if (values[0]) values[0].innerHTML = `${programData.program.health} <span>${programData.program.healthTrend}</span>`;
  if (details[0]) details[0].textContent = programData.program.lastUpdated;
  if (values[1]) values[1].textContent = String(programData.workstreams.length).padStart(2, '0');
  if (details[1]) details[1].innerHTML = '<b class="positive">+1</b> this month';
  if (values[2]) values[2].textContent = String(getOpenActionCount()).padStart(2, '0');
  if (details[2]) details[2].innerHTML = `<b class="warning">${programData.actionItems.filter((item) => item.status === 'Open').length.toString().padStart(2, '0')}</b> currently open`;
  if (values[3]) values[3].textContent = `${programData.program.launchReadiness}%`;

  const progress = cards[3].querySelector('.progress span');
  if (progress) progress.style.width = `${programData.program.launchReadiness}%`;
}

function editWorkstream(workstream) {
  const health = window.prompt('Health: On track, At risk, or Not started', workstream.health);
  if (!health || !['On track', 'At risk', 'Not started'].includes(health)) return;
  workstream.health = health;
  workstream.status = { 'On track': 'green', 'At risk': 'amber', 'Not started': 'gray' }[health];

  const owner = window.prompt('Owner', workstream.owner);
  if (owner && owner.trim()) workstream.owner = owner.trim();

  saveProgramData();
  renderDashboard();
}

function renderWorkstreams() {
  const streams = [...document.querySelectorAll('.workstreams .stream')];

  programData.workstreams.forEach((workstream, index) => {
    const stream = streams[index];
    if (!stream) return;

    const info = stream.querySelector('.stream-info');
    const dot = stream.querySelector('.status-dot');
    const tag = stream.querySelector('.tag');

    if (dot) dot.className = `status-dot ${workstream.status}`;
    if (info) {
      info.querySelector('strong').textContent = workstream.name;
      info.querySelector('small').textContent = `${workstream.owner} · ${workstream.deliverables} deliverables`;
    }
    if (tag) {
      tag.textContent = workstream.health;
      tag.className = `tag ${workstream.status}`;
    }

    stream.querySelector('[data-edit-workstream]')?.remove();
    const editButton = button('Edit', () => editWorkstream(workstream));
    editButton.dataset.editWorkstream = 'true';
    stream.appendChild(editButton);
  });
}

function editRaidItem(item) {
  const nextCount = window.prompt(`Count for ${item.type}`, String(item.count));
  const count = Number(nextCount);
  if (nextCount === null || !Number.isInteger(count) || count < 0) return;

  item.count = count;
  const nextOwner = window.prompt('Owner', item.owner || '');
  if (nextOwner !== null) item.owner = nextOwner.trim() || item.owner;
  const nextDescription = window.prompt('Description', item.description || '');
  if (nextDescription !== null) item.description = nextDescription.trim() || item.description;

  saveProgramData();
  renderDashboard();
}

function renderRaidItems() {
  const panel = document.querySelector('#risks');
  if (!panel) return;

  const grid = panel.querySelector('.raid-grid');
  if (!grid) return;

  const cells = [...grid.children];

  programData.raidItems.forEach((item, index) => {
    const cell = cells[index];
    if (!cell) return;

    const count = cell.querySelector('strong, .raid-count');
    if (count) count.textContent = item.count;

    cell.querySelector('[data-edit-raid]')?.remove();
    const editButton = button('Edit', () => editRaidItem(item));
    editButton.dataset.editRaid = 'true';
    cell.appendChild(editButton);
  });
}

function addRaidItem() {
  const type = window.prompt('RAID type (Risk, Assumption, Issue, Dependency)', 'Risk');
  if (!type || !type.trim()) return;

  const count = Number(window.prompt('Count', '1'));
  if (!Number.isInteger(count) || count < 0) return;

  const owner = window.prompt('Owner', 'Unassigned') || 'Unassigned';
  const description = window.prompt('Description', 'New item added.') || 'New item added.';

  programData.raidItems.push({
    id: `raid-${Date.now()}`,
    type: type.trim(),
    count,
    owner: owner.trim(),
    description: description.trim(),
  });

  saveProgramData();
  renderDashboard();
}

function renderFilterControls() {
  const panel = document.querySelector('#actions');
  if (!panel) return;

  let filterBar = panel.querySelector('.filter-bar');
  if (!filterBar) {
    filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';
    filterBar.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0;';
    panel.insertBefore(filterBar, panel.querySelector('.action-manager'));
  }

  filterBar.innerHTML = '';

  const workstreamOptions = ['All', ...new Set(programData.actionItems.map((item) => item.workstream))];
  const ownerOptions = ['All', ...new Set(programData.actionItems.map((item) => item.owner))];
  const healthOptions = ['All', 'Open', 'Complete'];

  const createSelect = (label, name, options, value) => {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:grid;gap:6px;font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:.12em;';

    const text = document.createElement('span');
    text.textContent = label;

    const select = document.createElement('select');
    select.style.cssText = 'background:var(--surface-2);border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:8px;';
    options.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      if (value === optionValue) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', (event) => {
      filterState[name] = event.target.value;
      renderDashboard();
    });

    wrap.append(text, select);
    return wrap;
  };

  const workstreamSelect = createSelect('Workstream', 'workstream', workstreamOptions, filterState.workstream);
  const ownerSelect = createSelect('Owner', 'owner', ownerOptions, filterState.owner);
  const healthSelect = createSelect('Health', 'health', healthOptions, filterState.health);

  const dueDateWrap = document.createElement('label');
  dueDateWrap.style.cssText = 'display:grid;gap:6px;font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:.12em;';

  const dueLabel = document.createElement('span');
  dueLabel.textContent = 'Due by';

  const dueInput = document.createElement('input');
  dueInput.type = 'date';
  dueInput.value = filterState.dueDate;
  dueInput.style.cssText = 'background:var(--surface-2);border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:8px;';
  dueInput.addEventListener('change', (event) => {
    filterState.dueDate = event.target.value;
    renderDashboard();
  });

  dueDateWrap.append(dueLabel, dueInput);

  const resetButton = button('Reset filters', () => {
    filterState.workstream = 'All';
    filterState.owner = 'All';
    filterState.health = 'All';
    filterState.dueDate = '';
    renderDashboard();
  });
  resetButton.style.cssText = 'align-self:end;height:42px;';

  filterBar.append(workstreamSelect, ownerSelect, healthSelect, dueDateWrap, resetButton);
}

function renderMilestones() {
  const panel = document.querySelector('#actions');
  if (!panel) return;

  let track = panel.querySelector('.timeline-track');
  if (!track) {
    track = document.createElement('div');
    track.className = 'timeline-track';
    panel.appendChild(track);
  }

  track.innerHTML = '';

  const line = document.createElement('div');
  line.className = 'timeline-line';
  track.appendChild(line);

  programData.milestones.forEach((milestone) => {
    const item = document.createElement('div');
    item.className = 'milestone';
    item.style.cssText = 'position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;';

    const left = document.createElement('div');
    left.style.cssText = 'display:flex;align-items:center;gap:10px;';

    const dot = document.createElement('span');
    dot.className = 'status-dot green';
    dot.style.cssText = 'width:10px;height:10px;display:inline-block;border-radius:50%;background:var(--accent);';

    const text = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = milestone.name;
    const date = document.createElement('small');
    date.textContent = milestone.date;
    text.append(title, date);

    left.append(dot, text);

    const status = document.createElement('span');
    status.className = 'tag green';
    status.textContent = milestone.status;

    item.append(left, status);
    track.appendChild(item);
  });

  const actionBar = document.createElement('div');
  actionBar.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:12px;';
  actionBar.append(
    button('Add milestone', () => {
      const name = window.prompt('Milestone name', 'New milestone');
      if (!name || !name.trim()) return;
      const date = window.prompt('Milestone date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
      const status = window.prompt('Status', 'Upcoming') || 'Upcoming';
      programData.milestones.push({
        id: `milestone-${Date.now()}`,
        name: name.trim(),
        date: date || 'TBD',
        status: status.trim(),
      });
      saveProgramData();
      renderDashboard();
    })
  );

  actionBar.append(
    button('Edit milestone', () => {
      const name = window.prompt('Milestone name to edit', programData.milestones[0]?.name || '');
      if (!name || !name.trim()) return;
      const milestone = programData.milestones.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
      if (!milestone) {
        window.alert('Milestone not found.');
        return;
      }
      const nextName = window.prompt('New milestone name', milestone.name);
      const nextDate = window.prompt('New date (YYYY-MM-DD)', milestone.date);
      const nextStatus = window.prompt('New status', milestone.status);
      milestone.name = nextName && nextName.trim() ? nextName.trim() : milestone.name;
      milestone.date = nextDate && nextDate.trim() ? nextDate.trim() : milestone.date;
      milestone.status = nextStatus && nextStatus.trim() ? nextStatus.trim() : milestone.status;
      saveProgramData();
      renderDashboard();
    })
  );

  actionBar.append(
    button('Add RAID item', () => {
      addRaidItem();
    })
  );

  panel.appendChild(actionBar);
}

function createActionElement(action) {
  const item = document.createElement('article');
  item.className = 'action-item';
  item.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px 0;border-top:1px solid var(--line);';

  const details = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = action.title;
  if (action.status === 'Complete') title.style.textDecoration = 'line-through';

  const meta = document.createElement('small');
  meta.style.cssText = 'display:block;color:var(--muted)';
  meta.textContent = `${action.owner} · ${action.workstream} · Due ${action.dueDate} · ${action.priority}`;

  details.append(title, meta);

  const toggle = button(
    action.status === 'Complete' ? 'Reopen' : 'Complete',
    () => {
      action.status = action.status === 'Complete' ? 'Open' : 'Complete';
      saveProgramData();
      renderDashboard();
    }
  );

  item.append(details, toggle);
  return item;
}

function addActionItem() {
  const title = window.prompt('Action title');
  if (!title || !title.trim()) return;

  const owner = window.prompt('Owner', 'Unassigned') || 'Unassigned';
  const workstream = window.prompt('Workstream', 'Unassigned') || 'Unassigned';
  const dueDate = window.prompt('Due date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);

  programData.actionItems.push({
    id: `action-${Date.now()}`,
    title: title.trim(),
    owner: owner.trim(),
    workstream: workstream.trim(),
    dueDate: dueDate || 'TBD',
    status: 'Open',
    priority: 'Medium',
  });

  saveProgramData();
  renderDashboard();
}

function renderActionItems() {
  const panel = document.querySelector('#actions');
  if (!panel) return;

  let manager = panel.querySelector('.action-manager');
  if (!manager) {
    manager = document.createElement('div');
    manager.className = 'action-manager';
    manager.style.marginTop = '18px';
    panel.appendChild(manager);
  }

  manager.replaceChildren();

  const heading = document.createElement('div');
  heading.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:4px;';

  const label = document.createElement('strong');
  label.textContent = 'Action items';

  heading.append(label, button('Add action +', addActionItem));
  manager.appendChild(heading);

  const filteredActions = getFilteredActionItems();
  if (!filteredActions.length) {
    const empty = document.createElement('p');
    empty.style.cssText = 'margin:14px 0 0;color:var(--muted);';
    empty.textContent = 'No action items match the current filters.';
    manager.appendChild(empty);
    return;
  }

  filteredActions.forEach((action) => manager.appendChild(createActionElement(action)));
}

function renderDashboard() {
  renderProgramMetrics();
  renderWorkstreams();
  renderRaidItems();
  renderFilterControls();
  renderMilestones();
  renderActionItems();
}

const dateInput = document.getElementById('email-date');
const today = new Date();
if (dateInput) dateInput.value = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

const form = document.getElementById('email-form');
const output = document.getElementById('email-output');
const copyButton = document.getElementById('copy-button');
let emailText = '';

function displayDate(value) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'today';
}

function lines(value) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

if (form && output && copyButton) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const recipient = document.getElementById('recipient').value.trim() || 'team';
    const sender = document.getElementById('sender').value.trim() || 'Your name';
    const salutation = document.getElementById('salutation').value;
    const notes = document.getElementById('notes').value.trim() || 'We aligned on the current program priorities and next steps.';
    const followups = lines(document.getElementById('followups').value);
    const owners = lines(document.getElementById('owners').value);
    const closing = document.getElementById('closing').value.trim() || 'Please let me know if I missed anything.';
    const currentDate = displayDate(dateInput?.value);
    const points = followups.length
      ? followups.map((point, index) => `${index + 1}. ${point}${owners[index] ? ` — Owner: ${owners[index]}` : ''}`)
      : ['1. Confirm next steps and communicate any blockers.'];

    emailText = `${salutation} ${recipient},\n\nThank you for the productive conversation on ${currentDate}.\n\nSummary\n${notes}\n\nKey follow-up points\n${points.join('\n')}\n\n${closing}\n\nBest,\n${sender}`;
    output.textContent = emailText;
    copyButton.textContent = 'Copy text';
  });

  copyButton.addEventListener('click', async () => {
    if (!emailText) return;

    try {
      await navigator.clipboard.writeText(emailText);
      copyButton.textContent = 'Copied ✓';
      setTimeout(() => { copyButton.textContent = 'Copy text'; }, 1800);
    } catch (error) {
      copyButton.textContent = 'Select to copy';
    }
  });
}

document.addEventListener('DOMContentLoaded', renderDashboard);
