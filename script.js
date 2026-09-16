const programData = {
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
    { title: 'Finalize launch messaging', owner: 'Jamie Lee', dueDate: '2026-09-18', status: 'Open', priority: 'High' },
    { title: 'Confirm support coverage', owner: 'Priya Shah', dueDate: '2026-09-21', status: 'Open', priority: 'Medium' },
    { title: 'Complete security review', owner: 'Chris Wong', dueDate: '2026-09-23', status: 'Open', priority: 'High' },
  ],
  raidItems: [
    { type: 'Risks', count: 2 },
    { type: 'Assumptions', count: 4 },
    { type: 'Issues', count: 1 },
    { type: 'Dependencies', count: 3 },
  ],
  activity: [],
};

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

function renderDashboard() {
  renderProgramMetrics();
  renderWorkstreams();
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
