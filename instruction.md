# VedaAI — Claude Code Master Instructions
> Read this entire file before writing a single line of code. Every rule here exists for a reason.

---

## PROJECT OVERVIEW

VedaAI is an AI-powered assessment creator for teachers. A teacher fills a multi-step form, a background worker calls Gemini 2.5 Flash, and the output renders as a structured exam paper. Built as a monorepo with Next.js frontend and Express backend.

Monorepo structure:
```
vedaai/
├── CLAUDE.md                  ← you are here
├── package.json               ← root, concurrently scripts
├── .env.example
├── docs/
│   ├── PRD.md
│   ├── UI_SPEC.md
│   └── screenshots/
│       ├── screen1_empty.png
│       ├── screen2_filled.png
│       ├── screen3_form.png
│       └── screen4_output.png
├── frontend/                  ← Next.js 14 App Router
└── backend/                   ← Express + TypeScript
```

---

## TECH STACK — NON-NEGOTIABLE

### Frontend
- Next.js 14 with App Router (not Pages Router)
- TypeScript — strict mode enabled
- Tailwind CSS
- shadcn/ui for base components
- lucide-react for ALL icons (no other icon library)
- Zustand for state management (not Redux, not Context)
- React Hook Form + Zod for all forms
- axios for all HTTP calls (never use fetch() directly in components)
- react-dropzone for file upload zone
- DiceBear for avatar generation

### Backend
- Node.js + Express + TypeScript
- ts-node-dev for development
- Mongoose for MongoDB ODM
- BullMQ for job queues
- ioredis for Redis client
- ws for WebSocket server
- pdf-parse for PDF text extraction
- Puppeteer for PDF export
- jsonwebtoken for auth tokens
- bcryptjs for password hashing
- Zod for runtime validation of all LLM responses
- Multer for file upload handling
- isomorphic-dompurify for SVG sanitization

### AI
- @google/generative-ai SDK
- Model: gemini-2.5-flash ONLY. Never use any other model.

### Infrastructure
- MongoDB Atlas (free tier)
- Upstash Redis (free tier, BullMQ compatible)
- Vercel for frontend deployment
- Railway for backend deployment

---

## ABSOLUTE RULES — NEVER VIOLATE THESE

### TypeScript
- Never use `any` type. Ever. Use `unknown` and narrow it, or define a proper interface.
- All function parameters and return types must be explicitly typed.
- No `// @ts-ignore` comments.
- Strict mode is on. Fix the error, do not suppress it.

### API Calls
- All HTTP calls go through `frontend/lib/api.ts` — never use fetch() or axios directly in components.
- api.ts uses axios with baseURL from environment variable.
- All API calls wrapped in try/catch. Errors handled and surfaced to UI.

### LLM Response Handling
- NEVER render raw LLM text to the UI. Ever.
- Every Gemini response must pass through Zod validation in `backend/src/ai/zodSchemas.ts` before anything else happens.
- If Zod validation fails: retry once with corrective prompt, then throw error. Never save invalid data.

### State Management
- Zustand stores live in `frontend/stores/` only.
- No business logic in components — components call store actions.
- Form draft store uses persist middleware with localStorage key `veda_form_draft`.
- Generation store is NOT persisted — memory only.

### Backend Architecture
- Route handlers are thin — validate input, call service, return response. No business logic.
- All business logic lives in `backend/src/services/`.
- All route handlers wrapped with asyncHandler utility to catch async errors.
- Global error handler is the last middleware — always returns `{ success: false, error: { code, message } }`.
- Never leak stack traces to client in production.

### Forms
- Every form uses React Hook Form + Zod resolver.
- Validation errors shown inline under the specific field.
- No alert() or console.log() for errors.

### Styling
- Tailwind utility classes only. No inline styles except for dynamic values that cannot be expressed as Tailwind classes.
- No CSS modules. No styled-components.
- All colors use the brand system defined below. No hardcoded hex values in components — use Tailwind config classes.

### File naming
- Components: PascalCase (AssignmentCard.tsx)
- Utilities and hooks: camelCase (useWebSocket.ts)
- Constants: camelCase (theme.ts)
- API routes: kebab-case folders (/api/assignments/[id]/export-pdf)

---

## DESIGN SYSTEM

### Brand Colors (in tailwind.config.ts)
```
brand: {
  orange: '#E8470A',     → use as bg-brand-orange, text-brand-orange
  'orange-dark': '#C73D08',
  dark: '#111111',       → primary dark, CTA buttons, text
}
```

### Gray Scale (use Tailwind defaults)
```
gray-50:  #F9FAFB  → page background
gray-100: #F5F5F5  → content area background, active nav bg
gray-200: #E5E7EB  → borders, dividers
gray-400: #9CA3AF  → placeholder text, muted icons
gray-500: #6B6B6B  → secondary text
gray-900: #111111  → primary text
```

### Semantic Colors
```
Difficulty Easy:       bg-green-50  text-green-700    border-green-200
Difficulty Moderate:   bg-orange-50 text-orange-700   border-orange-200
Difficulty Hard:       bg-red-50    text-red-700      border-red-200
Success indicator:     #22C55E (green dot)
Error/Delete:          #EF4444
```

### Typography — Inter Font ONLY
Import in globals.css:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

Font size reference:
```
Logo text:            text-lg  font-bold      (18px 700)
Page title:           text-xl  font-semibold  (20px 600)
Card title:           text-base font-semibold (16px 600)
Section header:       text-base font-semibold (16px 600)
Body / form labels:   text-sm  font-medium    (14px 500)
Body text:            text-sm  font-normal    (14px 400)
Meta / helper text:   text-xs  font-normal    (12px 400)  color: gray-500
Difficulty badge:     text-xs  font-medium    (11px 500)
```

### Spacing & Sizing
```
Sidebar width (desktop):   w-[200px]
Sidebar width (collapsed): w-16 (64px) — icon only
Top navbar height:         h-14 (56px)
Card padding:              p-4 (16px) or px-5 py-4
Card border radius:        rounded-xl (12px)
Button border radius:      rounded-lg (8px)
Input height:              h-10 (40px)
Input border radius:       rounded-lg (8px)
Avatar size (navbar):      w-8 h-8 (32px)
Avatar size (profile card): w-9 h-9 (36px)
```

### Shadows
```
Cards:         shadow-none — use border instead: border border-gray-200
Dropdowns:     shadow-lg (0 4px 12px rgba(0,0,0,0.08))
Floating CTA:  shadow-xl
Focus rings:   ring-2 ring-brand-orange ring-offset-2
```

### Borders
```
Default:  border border-gray-200  (1px solid #E5E7EB)
Input:    border border-gray-300  (1px solid #D1D5DB)
Sidebar:  border-r border-gray-100
Navbar:   border-b border-gray-200
```

---

## RESPONSIVE BREAKPOINTS

This is a responsive web app — NOT a mobile native app. The mobile screenshots in Figma show the same Next.js app at mobile browser width.

```
Default (< 768px):   Mobile layout
md (768–1023px):     Tablet — sidebar collapses to icon-only
lg (1024px+):        Desktop — full sidebar, 2-col grids
xl (1280px+):        More padding, content breathes
2xl (1536px+):       max-w-[1200px] container kicks in
```

### Layout shifts at breakpoints:

**Sidebar:**
- `lg+`: Full sidebar 200px, shows icons + text
- `md`: Collapsed sidebar 64px, icons only, no text, tooltips on hover
- `< md`: Sidebar hidden completely

**Bottom tab bar (mobile only):**
- `lg+`: `hidden`
- `< lg`: `fixed bottom-0 left-0 right-0` dark bar with 4 tabs
- Tabs: Home, Assignments, Library, AI Toolkit
- Active: white icon + white text. Inactive: gray-400

**Assignment grid:**
- `lg+`: `grid grid-cols-2 gap-3`
- `< lg`: `grid grid-cols-1 gap-3`

**Form card:**
- Always: `max-w-[600px] mx-auto w-full`

**Output paper:**
- Always: `max-w-[720px] mx-auto w-full`
- Desktop padding: `px-12 py-10`
- Mobile padding: `px-4 py-6`

**Main content offset:**
- `lg+`: `ml-[200px]`
- `md`: `ml-16`
- `< md`: `ml-0 pb-16` (padding bottom for tab bar)

**Question type rows (form):**
- Desktop: inline flex row — [dropdown][×][count stepper][marks stepper]
- Mobile: dropdown full width on top, steppers on second row below

---

## COMPONENT ARCHITECTURE

### Layout Components
```
frontend/components/layout/
├── Sidebar.tsx              → full desktop sidebar
├── SidebarCollapsed.tsx     → md breakpoint icon-only version
├── TopBar.tsx               → top navigation bar
├── BottomTabBar.tsx         → mobile bottom navigation
└── DashboardLayout.tsx      → wraps all dashboard pages
```

### VedaAI Logo SVG (build exactly like this)
Orange rounded square (#E8470A, border-radius 6px, 32×32px) with white stylized lines/V mark inside.
Build as inline SVG component `components/common/VedaLogo.tsx`. Not an img tag. Not an external file.

### Sidebar Profile Card
- White card, border border-gray-200, rounded-xl, p-3
- DiceBear avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed={schoolName}`
- School name: text-sm font-semibold text-gray-900
- City: text-xs text-gray-500

### Assignment Card
- White bg, border border-gray-200, rounded-xl, px-5 py-4
- Title: text-base font-semibold text-gray-900
- Three-dot menu: lucide MoreVertical, text-gray-400
- Dropdown on click: white bg, shadow-lg, rounded-lg, border border-gray-200
  - "View Assignment": text-sm text-gray-900
  - "Delete": text-sm text-red-500

### Difficulty Badge
```tsx
const colors = {
  easy: 'bg-green-50 text-green-700 border-green-200',
  moderate: 'bg-orange-50 text-orange-700 border-orange-200',
  hard: 'bg-red-50 text-red-700 border-red-200',
}
// Render as: <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[difficulty]}`}>
```

---

## ZUSTAND STORES

### Store 1: useAssignmentFormStore
Location: `frontend/stores/assignmentFormStore.ts`
Persisted: YES — localStorage key `veda_form_draft`

Fields:
```typescript
// Step 1
title: string
schoolName: string
className: string
subject: string
chapters: string
board: 'CBSE' | 'ICSE' | 'State Board' | 'Other' | ''
timeAllowed: number

// Step 2
dueDate: string
questionTypes: QuestionTypeRow[]  // { id, type, count, marksEach }
additionalInstructions: string
fileRef: string | null
fileType: 'pdf' | 'image' | null

// Meta
currentStep: number   // 1 or 2
```

Actions: setField, addQuestionTypeRow, removeQuestionTypeRow, updateQuestionTypeRow, setFileRef, resetForm

### Store 2: useGenerationStore
Location: `frontend/stores/generationStore.ts`
Persisted: NO

Fields:
```typescript
jobId: string | null
assignmentId: string | null
status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
statusMessage: string
progress: number           // 0-100 (frontend timer driven)
error: string | null
regeneratingSections: string[]   // section IDs currently showing skeleton
```

Actions: setJob, setStatus, setStatusMessage, setRegenerating, clearRegenerating, setError, reset

### Store 3: useAuthStore
Location: `frontend/stores/authStore.ts`
Persisted: YES — localStorage key `veda_auth`

Fields:
```typescript
user: { id, name, email, schoolName, city, avatarId } | null
isAuthenticated: boolean
```

Actions: setUser, logout

---

## MONGODB SCHEMAS

### User
```typescript
{
  name: String (required),
  email: String (required, unique, lowercase),
  passwordHash: String (required),
  schoolName: String (required),
  city: String (required),
  avatarId: String (default: 'avatar_01'),
  createdAt: Date (default: Date.now)
}
```

### Assignment
```typescript
{
  userId: ObjectId (ref: User, required),
  title: String (required),
  schoolName: String (required),
  className: String (required),
  subject: String (required),
  chapters: String (required),
  board: String (required),
  timeAllowed: Number (required),
  dueDate: Date (required),
  questionTypes: [{
    type: String,
    count: Number,
    marksEach: Number
  }],
  additionalInstructions: String (default: ''),
  fileRef: String (default: null),
  fileType: String (default: null),
  status: String (enum: ['pending','processing','completed','failed'], default: 'pending'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### GeneratedPaper
```typescript
{
  assignmentId: ObjectId (ref: Assignment, required),
  userId: ObjectId (ref: User, required),
  paper: Mixed (required),   // AssessmentJSON object
  version: Number (default: 1),
  generatedAt: Date (default: Date.now)
}
```

---

## BULLMQ QUEUES

### Queue Names
```
'assessment-generation'      → full paper generation
'section-regeneration'       → single section redo
'pdf-export'                 → Puppeteer PDF generation
```

### Worker Concurrency
```
generationWorker:            3 concurrent
sectionRegenerationWorker:   5 concurrent
pdfWorker:                   2 concurrent
```

### Retry Config
```
generationWorker:     { attempts: 2, backoff: { type: 'exponential', delay: 5000 } }
sectionRegen:         { attempts: 2, backoff: { type: 'fixed', delay: 3000 } }
pdfWorker:            { attempts: 1 }
```

### Job Payload — generation
```typescript
{
  assignmentId: string
  userId: string
  title: string
  schoolName: string
  className: string
  subject: string
  chapters: string
  board: string
  timeAllowed: number
  questionTypes: { type: string; count: number; marksEach: number }[]
  additionalInstructions: string
  fileRef: string | null
  fileType: 'pdf' | 'image' | null
}
```

---

## WEBSOCKET EVENTS

Server → Client events:
```
generation_complete   { type, assignmentId }
generation_failed     { type, error: string }
section_updated       { type, sectionId, section: AssessmentSection }
```

Client → Server:
```
subscribe             { type: 'subscribe', jobId: string }
```

Volatile delivery: if client not connected when event fires, drop it. Client uses poll fallback.

Poll fallback: GET /api/assignments/:id/status every 3 seconds when WebSocket is closed.

---

## AI PROMPT STRUCTURE

### System prompt always includes:
- School name, class, subject, chapters, board
- Time allowed
- Strict instruction to return ONLY valid JSON
- Difficulty distribution: 40% easy, 40% moderate, 20% hard

### User message includes:
- Section requirements (type, count, marks per question)
- Additional instructions
- Extracted PDF text if provided (max 15,000 chars)
- Full AssessmentJSON schema as the required output format

### AssessmentJSON schema (the contract):
```typescript
{
  title: string
  schoolName: string
  subject: string
  className: string
  board: string
  timeAllowed: number
  totalMarks: number
  totalQuestions: number
  instructions: string
  sections: [{
    id: string                    // "A", "B", "C"
    title: string                 // "Section A"
    questionTypeName: string      // "Short Answer Questions"
    instruction: string           // "Attempt all questions. Each carries 2 marks."
    questions: [{
      id: number                  // global sequential
      text: string
      type: 'MCQ'|'short'|'long'|'diagram'|'numerical'|'truefalse'
      difficulty: 'easy'|'moderate'|'hard'
      marks: number
      options?: string[]          // MCQ only, exactly 4
      answer: string
      imageUrl?: string           // null unless teacher uploaded
      diagramData?: null          // null unless diagram type
    }]
  }]
}
```

### Response parsing (responseParser.ts):
1. Strip markdown fences (```json ... ```) if present
2. JSON.parse()
3. Validate with Zod schema
4. If Zod fails: retry ONCE with corrective prompt appended
5. If second failure: throw error

---

## API ENDPOINTS

### Auth
```
POST /api/auth/register        body: { name, email, password, schoolName, city, avatarId }
POST /api/auth/login           body: { email, password }
POST /api/auth/logout
GET  /api/auth/me
```

### Assignments
```
GET    /api/assignments                     → list for authenticated user
POST   /api/assignments                     → create + queue generation job
GET    /api/assignments/:id                 → single assignment metadata
DELETE /api/assignments/:id                 → delete assignment + paper
GET    /api/assignments/:id/paper           → generated paper (Redis → MongoDB)
GET    /api/assignments/:id/status          → job status (WebSocket fallback)
POST   /api/assignments/:id/regenerate      → full regeneration
POST   /api/assignments/:id/regenerate-section  body: { sectionId }
```

### Export
```
POST   /api/assignments/:id/export-pdf      → queue PDF job
GET    /api/assignments/:id/download        → stream PDF
```

### Upload
```
POST   /api/upload                          → multipart, returns { fileRef, fileType }
```

---

## ERROR HANDLING

### Frontend
- Every API call in try/catch
- Errors shown as toast notifications (use sonner library)
- Form validation errors shown inline under the field
- React Error Boundary wraps the output page
- If generation fails: show error message + "Try Again" button (re-queues without re-filling form)
- If section regeneration fails: restore previous section data silently + show toast

### Backend
- asyncHandler wraps every route handler
- Global error handler: last middleware, always returns `{ success: false, error: { code, message } }`
- Never send stack traces to client (check NODE_ENV)
- MongoDB down: exit process with code 1, clear log message
- Redis down: log warning, continue without cache (degrade gracefully)
- Zod validation failure in worker: log raw LLM response + Zod errors, retry once

---

## EXAM PAPER OUTPUT — HTML TEMPLATE RULES

This is the most important UI in the project. Build it to look like a real printed Indian school exam paper.

Structure:
```
[Dark banner #1A1A1A — AI message + Download PDF button]
[White card — the actual exam paper]
  School Name — text-2xl font-bold text-center text-gray-900
  Subject: X | Class: X — text-base text-center text-gray-700 mt-1
  ─────────────────────────────────────────────────────
  Time Allowed: X mins          Maximum Marks: X
  ─────────────────────────────────────────────────────
  All questions are compulsory unless stated otherwise.

  Name: ________________   Roll Number: ____________
  Class/Section: ___________
  ─────────────────────────────────────────────────────

  [For each section:]
  SECTION A                        ← text-lg font-bold text-center
  Short Answer Questions           ← text-sm font-semibold text-center
  Attempt all questions...         ← text-xs italic text-gray-500 text-center

  1. [Easy badge] Question text here                    [2 Marks]
  2. [Moderate badge] Question text here                [2 Marks]
     For MCQ — options on next line:
     (a) Option A    (b) Option B    (c) Option C    (d) Option D

  ─────────────────────────────────────────────────────
  End of Question Paper
  ─────────────────────────────────────────────────────

  Answer Key:
  1. Answer text...
```

Key rules:
- Questions numbered globally (continue across sections, never reset)
- Underline lines for Name/Roll/Section use `border-b border-gray-900 inline-block w-40`
- Paper padding: `px-12 py-10` desktop, `px-4 py-6` mobile
- All text inside paper is text-gray-900 unless specified
- The paper card has `border border-gray-200 rounded-b-xl` (no top radius — dark banner sits on top)
- Per-section regenerate button: small ghost button top-right of each section header row

---

## DIAGRAM RENDERING

Three paths — chosen by question.diagramData.renderType:

1. Teacher uploaded image: `<img src={imageUrl} className="max-w-[300px] mx-auto my-4 block" />`

2. SVG simple shapes:
   - Gemini returns raw SVG string
   - Backend sanitizes with isomorphic-dompurify before storing
   - Frontend renders: `<div dangerouslySetInnerHTML={{ __html: svgContent }} className="max-w-[300px] mx-auto my-4" />`

3. Dagre graph:
   - Gemini returns `{ nodes: [{id, label}], edges: [{from, to, label?}] }`
   - Frontend uses dagre library to compute layout
   - Render as SVG with rect+text nodes and line edges with arrowheads

Decision logic in DiagramRenderer.tsx:
```typescript
if (!question.diagramData && !question.imageUrl) return null
if (question.imageUrl) return <ImageDiagram />
if (question.diagramData.renderType === 'svg') return <SvgDiagram />
if (question.diagramData.renderType === 'dagre') return <DagreDiagram />
```

---

## CACHING

### Redis Keys
```
paper:{assignmentId}              → full AssessmentJSON, TTL 2 hours
job:{jobId}:status                → { status, message }, TTL 1 hour
user:{userId}:assignments         → assignment list summary, TTL 10 minutes
```

### Cache pattern (always use this):
```typescript
const cached = await redis.get(key)
if (cached) return JSON.parse(cached)
const data = await MongoDB.query()
await redis.setex(key, ttlSeconds, JSON.stringify(data))
return data
```

### Invalidation rules:
- `paper:{assignmentId}`: invalidate on section regen + full regen
- `user:{userId}:assignments`: invalidate on create + delete assignment
- Never cache PDF in Redis

---

## LOCALSTORAGE

Managed by Zustand persist middleware only. Never call localStorage directly.

```
veda_form_draft    → assignmentFormStore (form draft, all steps)
veda_auth          → authStore (user info)
```

Clear `veda_form_draft` when: teacher starts new assignment after successful generation.
Never clear on error.

---

## PDF EXPORT

Worker: pdfWorker.ts
Library: Puppeteer

Steps:
1. Fetch paper JSON from Redis/MongoDB
2. Render exam paper HTML string server-side (same template as frontend)
3. Puppeteer: `page.setContent(html)`, `page.emulateMediaType('print')`
4. `page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' } })`
5. Stream buffer to client
6. Filename: `{SchoolName}_{Subject}_Class{className}_{DDMMYYYY}.pdf`

---

## SEED SCRIPT

Location: `backend/src/scripts/seed.ts`

Creates:
- One teacher account: email `demo@vedaai.com`, password `demo1234`
- One sample assignment with a hardcoded pre-generated AssessmentJSON (do not call Gemini in seed)

Run with: `npm run seed --prefix backend`

---


```

README setup (exactly 4 lines):
```
git clone <repo-url>
cd vedaai
cp .env.example .env
npm run setup && npm run dev
```

---

## ENVIRONMENT VARIABLES

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### Backend (.env)
```
PORT=4000
NODE_ENV=development
MONGODB_URI=
REDIS_URL=
JWT_SECRET=
GEMINI_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
FRONTEND_URL=http://localhost:3000
```

---

## BUILD ORDER — FOLLOW EXACTLY

1. Project scaffold + CLAUDE.md + folder structure
2. Tailwind config + design system + globals.css
3. Backend foundation (DB, Redis, models, middleware, route stubs)
4. Auth (backend routes + frontend pages)
5. Dashboard layout shell (sidebar, topbar, bottom tab bar)
6. Assignments list page (0-state + filled state)
7. Create assignment form (step 1 + step 2)
8. File upload endpoint
9. BullMQ queues + generation worker (mock Gemini first)
10. WebSocket server + client + generating loading page
11. Wire real Gemini API (replace mock)
12. Output page (exam paper template)
13. Section regeneration (worker + optimistic UI)
14. PDF export (Puppeteer worker)
15. My Library page
16. Error handling pass (error boundaries, toasts, edge cases)
17. Mobile responsive pass (bottom tab bar, single-col grid, form stacking)
18. Seed script
19. README (architecture diagrams, setup, approach)
20. Deployment (Vercel + Railway)

DO NOT skip ahead. DO NOT combine steps. Test each step before starting the next.

---

## WHAT NOT TO BUILD

- No streaming of LLM response (full response only, timer-based loading UX)
- No mobile native app (responsive web only)
- No real-time collaboration
- No student-facing interface
- No grading/marking features
- No email notifications
- No payment/subscription features

---

*VedaAI CLAUDE.md — Last updated before project start. If a rule conflicts with a step prompt, this file wins.*