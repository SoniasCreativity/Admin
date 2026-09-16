const STORAGE_KEY = 'program-ops-command-center';

const defaultProgramData = {
  program: {
    name: 'Product launch',
    health: 'On track',
    healthTrend: '↗',
    lastUpdated: 'Updated today',
    launchReadiness: 72,
  },
  workstreams: [
    { name: 'Product & engineering', owner: 'Alex Morgan', deliverables: 8, health: 'On track', status: 'green' },
    { name: 'Go-to-market readiness', owner: 'Jamie Lee', deliverables: 12, health: 'At risk', status: 'amber' },
    { name: 'Customer enablement', owner: 'Priya Shah', deliverables: 6, health: 'On track', status: 'green' },
    { name: 'Legal & compliance', owner: 'Chris Wong', deliverables: 4, health: 'Not started', status: 'gray' },
  ],
  milestones: [
    { name: 'Internal beta', date: 'Sep 24', status: 'Complete' },
    { name: 'Launch readiness review', date: 'Oct 01', status: 'In progress' },
    { name: 'Public launch', date: 'Oct 15', status: 'Upcoming' },
  ],
  actionItems: [
    { id: 'action-1', title: 'Finalize launch messaging', owner: 'Jamie Lee', dueDate: '2026-09-18', status: 'Open', priority: 'High' },
    { id: 'action-2', title: 'Confirm support coverage', owner: 'Priya Shah', dueDate: '2026-09-21', status: 'Open', priority: 'Medium' },
    { id: 'action-3', title: 'Complete security review', owner: 'Chris Wong', dueDate: '2026-09-23', status: 'Open', priority: 'High' },
  ],
  raidItems: [
    { type: 'Risks', count: 2 },
    { type: 'Assumptions', count: 4 },
    { type: 'Issues', count: 1 },
    { type: 'Dependencies', count: 3 },
  ],
  activity: [],
};

function loadProgramData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultProgramData, ...JSON.parse(saved) } : structuredClone(defaultProgramData);
  } catch (error) {
    return structuredClone(defaultProgramData);
  }
}

let programData = loadProgramData();

function saveProgramData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programData));
}

function getOpenActionCount() {
  return programData.actionItems.filter(item => item.status !== 'Complete').length;
}

function renderProgramMetrics() {
  const metricCards = [...document.querySelectorAll('.metric-card')];
  if (metricCards.length < 4) return;

  const values = metricCards.map(card => card.querySelector('.metric-value'));
  const details = metricCards.map(card => card.querySelector('small'));

  if (values[0]) values[0].innerHTML = `${programData.program.health} <span>${programData.program.healthTrend}</span>`;
  if (details[0]) details[0].textContent = programData.program.lastUpdated;
  if (values[1]) values[1].textContent = String(programData.workstreams.length).padStart(2, '0');
  if (details[1]) details[1].innerHTML = '<b class="positive">+1</b> this month';
  if (values[2]) values[2].textContent = String(getOpenActionCount()).padStart(2, '0');
  if (details[2]) details[2].innerHTML = `<b class="warning">${programData.actionItems.filter(item => item.status === 'Open').length.toString().padStart(2, '0')}</b> currently open`;
  if (values[3]) values[3].textContent = `${programData.program.launchReadiness}%`;

  const progress = metricCards[3].querySelector('.progress span');
  if (progress) progress.style.width = `${programData.program.launchReadiness}%`;
}

function renderWorkstreams() {
  const streams = [...document.querySelectorAll('.workstreams .stream')];
  programData.workstreams.forEach((workstream, index) => {
    const stream = streams[index];
    if (!stream) return;
    const dot = stream.querySelector('.status-dot');
    const info = stream.querySelector('.stream-info');
    const tag = stream.querySelector('.tag');
    if (dot) dot.className = `status-dot ${workstream.status}`;
    if (info) {
      const title = info.querySelector('strong');
      const details = info.querySelector('small');
      if (title) title.textContent = workstream.name;
      if (details) details.textContent = `${workstream.owner} · ${workstream.deliverables} deliverables`;
    }
    if (tag) {
      tag.textContent = workstream.health;
      tag.className = `tag ${workstream.status}`;
    }
  });
}

function createActionElement(action) {
  const item = document.createElement('article');
  item.className = 'action-item';
  item.dataset.actionId = action.id;
  item.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px 0;border-top:1px solid var(--line);';

  const details = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = action.title;
  if (action.status === 'Complete') title.style.textDecoration = 'line-through';
  const meta = document.createElement('small');
  meta.style.display = 'block';
  meta.style.color = 'var(--muted)';
  meta.textContent = `${action.owner} · Due ${action.dueDate} · ${action.priority}`;
  details.append(title, meta);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'text-button';
  toggle.textContent = action.status === 'Complete' ? 'Reopen' : 'Complete';
  toggle.addEventListener('click', () => {
    action.status = action.status === 'Complete' ? 'Open' : 'Complete';
    saveProgramData();
    renderDashboard();
  });

  item.append(details, toggle);
  return item;
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
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'text-button';
  addButton.textContent = 'Add action +';
  addButton.addEventListener('click', addActionItem);
  heading.append(label, addButton);
  manager.appendChild(heading);

  programData.actionItems.forEach(action => manager.appendChild(createActionElement(action)));
}

function addActionItem() {
  const title = window.prompt('Action title');
  if (!title || !title.trim()) return;
  const owner = window.prompt('Owner', 'Unassigned') || 'Unassigned';
  const dueDate = window.prompt('Due date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
  programData.actionItems.push({
    id: `action-${Date.now()}`,
    title: title.trim(),
    owner: owner.trim(),
    dueDate: dueDate || 'TBD',
    status: 'Open',
    priority: 'Medium',
  });
  saveProgramData();
  renderDashboard();
}

function renderDashboard() {
  renderProgramMetrics();
  renderWorkstreams();
  renderActionItems();
}

const dateInput = document.getElementById('email-date');
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
if (dateInput) dateInput.value = localDate;

const form = document.getElementById('email-form');
const output = document.getElementById('email-output');
const copyButton = document.getElementById('copy-button');
let emailText = '';

function displayDate(value) {
  if (!value) return 'today';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function lines(value) {
  return value.split('\n').map(item => item.trim()).filter(Boolean);
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
    const date = displayDate(dateInput.value);
    const pointLines = followups.length ? followups.map((point, index) => {
      const owner = owners[index] ? ` — Owner: ${owners[index]}` : '';
      return `${index + 1}. ${point}${owner}`;
    }) : ['1. Confirm next steps and communicate any blockers.'];

    emailText = `${salutation} ${recipient},\n\nThank you for the productive conversation on ${date}.\n\nSummary\n${notes}\n\nKey follow-up points\n${pointLines.join('\n')}\n\n${closing}\n\nBest,\n${sender}`;
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
