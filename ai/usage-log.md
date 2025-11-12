## UI Design

### Date/Time:

2025-08-31 21:00

### Tool:

Lovable

### Prompt/Command:

Project Name: PeerPrep – Technical Interview Peer Practice Platform

Goal: Build a web-based platform that allows students to practice technical interview questions with peers in real-time collaboration.

Core User Flow:

A new user registers with email, username, and password.

They log in and land on a dashboard.

From the dashboard, they select a topic (e.g., Arrays, Graphs) and a difficulty (Easy, Medium, Hard).

The system attempts to match them with another online user who chose the same criteria.

If matched, both are taken into a collaboration room with:

Shared code editor (Monaco-style)

Question prompt displayed at the top

Side chat panel (text)

Button for AI Assistance (e.g., “Explain Code” or “Get Hint”)

At the end, users can terminate the session, and both see a summary screen with: attempted question, code history, AI usage.

Core Screens to Design:

Login/Register Screen → clean, simple, two-panel layout.

Dashboard → card/grid layout with topic + difficulty selection.

Matching/Waiting Room → show spinner + “Finding you a peer...” with timeout option.

Collaboration Room →

Large code editor (center).

Question prompt (top).

Chat panel (right side).

Buttons below editor: “Submit Solution,” “Get AI Hint,” “Explain Code.”

Session Summary Screen → list question, code attempted, AI explanations, and feedback.

Styling Guidelines:

Clean, modern design, student-friendly.

Primary color: Blue (#2563eb) with neutral background (#f9fafb).

Rounded corners, soft shadows, minimal clutter.

Typography: Sans-serif (Inter or Roboto).

Icons for actions (chat, AI, submit).

Must-Have Components:

Navbar with logo + logout button.

Cards for selecting difficulty/topic.

Spinner/animation in waiting room.

Monaco-like code editor (mockup acceptable).

AI button (with sparkles icon ✨).

Session recap with progress tracker.

Nice-to-Have (Optional for mockup):

AI assistant sidebar that shows past interactions with AI.

Profile page with session history.

Target Device: 13-inch laptop (desktop-first, not mobile responsive).

### Output Summary:

Design of pages in a preview page, with navigation and limited buttom behaviour

### Action Taken:

- Modified

### Author Notes:

- Only used as **design reference/wireframe**, none of the code generated was used in the project.
- Overhauled login page design
- Modified and added page designs based on our needs (e.g. adding user profile/history page, removing redundant statistic cards in session end page)

## CI/CD file Generation

### Date/Time:

2025-11-11 22:00

### Tool:

GitHub Copilot

### Prompt/Command:

Referencing existing github actions files and our Dockerfile, generate a pipeline yml file for Question Service.

### Output Summary:

Returned the `question-service.yml` file in a similar format as other services.

### Action Taken:

- Modified

### Author Notes:

- Removed unnecessary stages such as linting
- Verified and fixed incorrect working directory values
- Removed caching

## Documentation Generation

### Date/Time:

2025-11-12 18:00

### Tool:

ChatGPT, GitHub Copilot, Cursor

### Prompt/Command:

Referring to the payload/schemas and routes, generate a set of docs for `{service}`. Add this to the README.md file. Minimally include details like endpoint url, path/query parameters, body (if any), and responses.

### Output Summary:

Returned docs with relevant details in markdown format

### Action Taken

- Modified

### Author Notes:

- Verified and corrected some inaccuracies in the generated response
- Added missing details
