# Program Operations Command Center

A portfolio-ready, lightweight dashboard for coordinating cross-functional programs and turning meeting notes into accountable follow-up communication.

> **Portfolio project:** This is a front-end demonstration of program operations thinking, stakeholder alignment, execution visibility, and communication design.

## Why this project

Senior program managers create clarity across ambiguity. This command center brings common operating mechanisms into one view:

- Program health and launch-readiness metrics
- Workstream ownership and status
- Milestones and timeline visibility
- RAID (risks, assumptions, issues, dependencies) snapshot
- Recent cross-functional activity
- A follow-up email creator that connects actions to owners

## Featured capability: Follow-up email creator

The email creator automatically populates the current date while allowing the user to change it. Users can provide a salutation, recipient, notes, follow-up points, owners, and a closing statement. The app generates an editable, professional email preview with copy-to-clipboard support.

## Skills demonstrated

- Program operating model design
- Cross-functional workstream management
- Risk, issue, and dependency visibility
- Accountability and action tracking
- Executive-friendly information hierarchy
- Responsive front-end development
- Accessible, low-friction user experience design

## Run locally

No build step or dependencies are required. Open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

- `index.html` — dashboard structure and form markup
- `styles.css` — responsive dark-theme presentation system
- `script.js` — date handling, email generation, and copy interaction

## Product decisions

This first version intentionally uses a client-side implementation so it is easy to review, deploy, and demo without an API key or external data source. A production iteration could add authentication, persistent program data, role-based permissions, integrations with project tools, and configurable templates.

## Future roadmap

1. Persist programs and action items with a lightweight backend.
2. Add filters for workstream, owner, health, and due date.
3. Add export to PDF and calendar/task integrations.
4. Add configurable email tone and organization branding.
5. Add an executive status report generator.

## Note

The sample program data is fictional and included for demonstration purposes.
