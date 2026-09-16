const dateInput = document.getElementById('email-date');
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
dateInput.value = localDate;

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
  output.innerHTML = `<p>${salutation} ${recipient},</p><p>Thank you for the productive conversation on ${date}.</p><p class="email-subhead">SUMMARY</p><p>${notes}</p><p class="email-subhead">KEY FOLLOW-UP POINTS</p><p>${pointLines.join('<br>')}</p><p>${closing}</p><p>Best,<br>${sender}</p>`;
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
