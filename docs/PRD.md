

VedaAI – Product Design & Requirements Document (PDR)
Role: Full Stack Engineer
 Stack: Next.js + TypeScript | Node.js + Express | MongoDB | Redis | BullMQ | Gemini 2.5 Flash | WebSocket
 Version: 1.0 | Complete Build Reference

TABLE OF CONTENTS
Project Overview
Complete User Flow — Step by Step
Frontend Architecture
State Management — Zustand
Backend Architecture
Database Design — MongoDB
Queue System — BullMQ + Redis
WebSocket Implementation
AI Implementation — Gemini 2.5 Flash
PDF Parsing
Diagram & Visual Feature
Output Page — Exam Paper Template
PDF Export
Caching Strategy
LocalStorage Strategy
Worker Definitions
API Endpoints Reference
Tech Stack Summary
Folder Structure
Environment Variables

1. PROJECT OVERVIEW
VedaAI is an AI-powered assessment creator for teachers. A teacher provides metadata about the assessment (school, class, subject, chapter), configures the question structure (types, counts, marks), optionally uploads material (PDF or image), and the system generates a fully structured, exam-formatted question paper using Gemini 2.5 Flash. The output renders as a clean, printable exam paper and can be downloaded as PDF.
Core Capabilities
Multi-step assignment creation form
AI-driven structured question paper generation via background worker
Real-time generation status via WebSocket
Structured JSON output rendered into exam paper template
Per-section regeneration (token-efficient)
Diagram support: SVG for simple shapes, Dagre.js for graphs/cycles, teacher-uploaded images
PDF export via Puppeteer

2. COMPLETE USER FLOW
2.1 Landing Page
Hero section explaining the product
Two CTAs: Login and Register
No authenticated content visible

2.2 Registration
Fields collected:
Full Name
Email
Password (min 8 chars, one number)
School Name
City / Location
Avatar Selection:
After form submit, teacher is shown a grid of 8–10 predefined SVG avatars
Teacher selects one
Avatar ID (e.g., avatar_03) stored in DB, not the image itself
On success: JWT token issued, stored in httpOnly cookie, redirect to Homepage.

2.3 Login
Email + Password
On success: JWT issued, redirect to Homepage

2.4 Homepage (Figma Screen 1 — matches sidebar layout)
Sidebar: VedaAI logo, Create Assignment CTA, nav items (Home, My Groups, Assignments, AI Teacher's Toolkit, My Library), Settings, Teacher profile card at bottom
Main area: Welcome message, quick stats (total assignments, recent activity)
No assignments yet state: Shows the empty illustration with "No assignments yet" (matches Figma 0-state screen)

2.5 Assignments Page (Figma Screen 2)-- this is for reponsiveness
Grid of assignment cards (2-column desktop, 1-column mobile)
Each card shows: Assignment title, Assigned on date, Due date, 3-dot menu (View Assignment / Delete)
Search bar + Filter by at top
Floating "+ Create Assignment" button at bottom center
0-state: Empty illustration (matches Figma exactly)

2.6 Create Assignment — Multi-Step Form
The form is a stepper with 2 steps. All data persisted to Zustand + LocalStorage at every change.
STEP 1 — Assessment Context
Fields:
Assignment Title
School Name (pre-filled from profile, editable)
Class / Grade (dropdown: 1–12)
Subject (text input)
Chapter(s) / Topics (text input, comma-separated)
Board (CBSE / ICSE / State Board / Other)
Time Allowed (in minutes)
Validation: All fields required. No empty strings.
On "Next" → save to Zustand, navigate to Step 2.

STEP 2 — Question Configuration (matches Figma Screen 3)
Top section:
File Upload zone (drag & drop or browse)
Accepts: PDF, JPEG, PNG, up to 10MB
On upload: file stored temporarily, upload to backend /api/upload, receive back a fileRef (S3 URL or local path)
Due Date (date picker, DD-MM-YYYY format)
Question Type Builder:
Dynamic list of question type rows(boxes type input form structure)
Each row has:
Question Type dropdown: Multiple Choice Questions / Short Answer / Long Answer / Diagram/Graph-Based / Numerical Problems / True-False
Number of Questions (stepper, min 1)
Marks per question (stepper, min 1)
Delete row (×)
"+ Add Question Type" button adds a new row
Running totals shown at bottom: Total Questions: N | Total Marks: N
Additional Instructions:
Textarea: e.g., "Generate for 3-hour exam, include HOTS questions"
Validation:
At least one question type row
No zero or negative values
Due date must be in future
On "Generate Assessment" click:
Validate all fields
Save complete form state to Zustand
POST to /api/assignments → receive assignmentId + jobId
Open WebSocket connection, subscribe to jobId
Navigate to /assignments/[assignmentId]/generating — loading screen

2.7 Generation Loading Screen
Shows assignment title
Animated status messages driven by WebSocket events:
"Initializing generation..."
"Analyzing your content..."
"Generating Section A..."
"Generating Section B..."
"Finalizing structure..."
"Done!"
Progress bar updates per section received
If error: show retry button

2.8 Output Page — Exam Paper (Figma Screen 4)
Top banner (dark):
AI confirmation message: "Here are your customized questions for [Subject], [Class]"
Download as PDF button
Regenerate button (triggers full regeneration)
Exam Paper (white card, A4-like):
School Name (bold, centered, large)
Subject | Class (centered)
Time Allowed | Maximum Marks (two columns)
Horizontal rule
Instructions line
Student info lines: Name ___ Roll Number ___ Section ___
Horizontal rule
Sections (A, B, C...) rendered in order
Section title (bold, centered)
Section instruction (italic)
Numbered question list
Question text
Difficulty badge (Easy = green, Moderate = orange, Hard/Challenging = red)
Marks tag [X Marks]
MCQ options if type = MCQ
Image if question has imageUrl
Diagram if question has diagramData
End of Question Paper (centered, bold)
Answer Key section (collapsible / below a divider)
Per-section regenerate:
Each section has a small "Regenerate" icon button
Clicking it triggers a targeted regeneration job for only that section

2.9 My Library Page
Organized by Subject
Each subject is a collapsible group
Inside each group: list of assessment cards for that subject
Each card: title, class, date created, view button

3. FRONTEND ARCHITECTURE
Framework: Next.js 14 App Router + TypeScript
Pages / Routes:
/                          → Landing page
/auth/login                → Login
/auth/register             → Register
/auth/register/avatar      → Avatar selection
/dashboard                 → Homepage
/assignments               → Assignments list
/assignments/create        → Multi-step form
/assignments/[id]/generating → Loading screen
/assignments/[id]/output   → Exam paper output
/library                   → My Library

Component Structure:
components/
  layout/
    Sidebar.tsx
    TopBar.tsx
    MobileNav.tsx
  form/
    StepOne.tsx
    StepTwo.tsx
    QuestionTypeRow.tsx
    FileUploadZone.tsx
  output/
    ExamPaper.tsx
    SectionBlock.tsx
    QuestionItem.tsx
    DifficultyBadge.tsx
    DiagramRenderer.tsx
    MCQOptions.tsx
  common/
    Avatar.tsx
    AssignmentCard.tsx
    StatusBar.tsx


4. STATE MANAGEMENT — ZUSTAND
Two stores:
Store 1: useAssignmentFormStore
interface AssignmentFormStore {
  // Step 1
  title: string
  schoolName: string
  className: string
  subject: string
  chapters: string
  board: string
  timeAllowed: number

  // Step 2
  dueDate: string
  questionTypes: QuestionTypeRow[]
  additionalInstructions: string
  fileRef: string | null      // URL returned after upload
  fileType: 'pdf' | 'image' | null

  // Meta
  currentStep: number
  isDirty: boolean

  // Actions
  setField: (field, value) => void
  addQuestionTypeRow: () => void
  removeQuestionTypeRow: (id) => void
  updateQuestionTypeRow: (id, data) => void
  resetForm: () => void
}

Persisted to LocalStorage via Zustand persist middleware. Key: veda_form_draft
Cleared: Only when teacher explicitly starts a new assignment after successful generation.

Store 2: useGenerationStore
interface GenerationStore {
  jobId: string | null
  assignmentId: string | null
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed'
  progress: number            // 0–100
  currentSectionLabel: string // "Generating Section B..."
  completedSections: AssessmentSection[]  // sections as they arrive
  error: string | null

  // Actions
  setJobId: (id) => void
  addSection: (section) => void
  setStatus: (status) => void
  setError: (msg) => void
  reset: () => void
}

Not persisted. Lives only in memory for the current generation session.

5. BACKEND ARCHITECTURE
Runtime: Node.js + Express + TypeScript
 Entry: src/index.ts → Express app + WebSocket server on same port using ws library
Middleware Stack
cors with frontend origin whitelist
helmet for security headers
express.json() with 10mb limit
JWT auth middleware on all /api/* routes except /api/auth/*
Rate limiter on /api/assignments/generate
Service Layers
src/
  routes/          → Express route handlers (thin, just validates and delegates)
  services/        → Business logic
    assignmentService.ts
    generationService.ts
    pdfService.ts
    uploadService.ts
  workers/         → BullMQ worker definitions
    generationWorker.ts
    pdfWorker.ts
  queues/          → BullMQ queue definitions
    generationQueue.ts
    pdfQueue.ts
  websocket/       → WebSocket server and event emitter
    wsServer.ts
    wsEvents.ts
  ai/              → Gemini integration
    geminiClient.ts
    promptBuilder.ts
    responseParser.ts
    zodSchemas.ts
  db/              → MongoDB models
  cache/           → Redis helpers


6. DATABASE DESIGN — MONGODB
Collection: users
{
  _id: ObjectId,
  name: string,
  email: string,           // unique
  passwordHash: string,
  schoolName: string,
  city: string,
  avatarId: string,        // e.g. "avatar_03"
  createdAt: Date
}

Collection: assignments
{
  _id: ObjectId,
  userId: ObjectId,        // ref: users
  title: string,
  schoolName: string,
  className: string,
  subject: string,
  chapters: string,
  board: string,
  timeAllowed: number,     // minutes
  dueDate: Date,
  questionTypes: [
    {
      type: string,        // "MCQ" | "Short Answer" etc.
      count: number,
      marksEach: number
    }
  ],
  additionalInstructions: string,
  fileRef: string | null,  // S3/local URL of uploaded material
  fileType: string | null,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  createdAt: Date,
  updatedAt: Date
}

Collection: generatedPapers
{
  _id: ObjectId,
  assignmentId: ObjectId,  // ref: assignments
  userId: ObjectId,
  paper: AssessmentJSON,   // full structured JSON (schema defined below)
  generatedAt: Date,
  version: number          // increments on full regeneration
}

AssessmentJSON Schema (the core data structure)
interface AssessmentJSON {
  title: string
  schoolName: string
  subject: string
  className: string
  board: string
  timeAllowed: number
  totalMarks: number
  totalQuestions: number
  instructions: string
  sections: AssessmentSection[]
}

interface AssessmentSection {
  id: string               // "A", "B", "C"
  title: string            // "Section A"
  questionTypeName: string // "Short Answer Questions"
  instruction: string      // "Attempt all questions. Each carries 2 marks."
  questions: Question[]
}

interface Question {
  id: number               // global sequential number
  text: string
  type: 'MCQ' | 'short' | 'long' | 'diagram' | 'numerical' | 'truefalse'
  difficulty: 'easy' | 'moderate' | 'hard'
  marks: number
  options?: string[]       // MCQ only, array of 4 strings
  answer?: string          // Answer key
  imageUrl?: string        // Teacher-uploaded image URL
  diagramData?: DiagramData | null
}

interface DiagramData {
  renderType: 'svg' | 'dagre'
  // If renderType === 'svg':
  svgContent?: string      // Raw SVG string (sanitized)
  // If renderType === 'dagre':
  nodes?: { id: string; label: string }[]
  edges?: { from: string; to: string; label?: string }[]
}


7. QUEUE SYSTEM — BULLMQ + REDIS
Why BullMQ Here
Gemini API calls take 10–40 seconds. PDF generation with Puppeteer takes 5–15 seconds. Both would cause HTTP timeouts if run synchronously in Express routes. BullMQ decouples the request from the processing.
Redis acts as BullMQ's backing store — it holds the job payloads, tracks job states (waiting → active → completed/failed), and enables retry logic.

Queue 1: assessment-generation
Added when: Teacher clicks "Generate Assessment", POST /api/assignments is called.
Job payload:
{
  assignmentId: string,
  userId: string,
  title: string,
  schoolName: string,
  className: string,
  subject: string,
  chapters: string,
  board: string,
  timeAllowed: number,
  questionTypes: QuestionTypeRow[],
  additionalInstructions: string,
  fileRef: string | null,
  fileType: 'pdf' | 'image' | null
}

Worker behavior (step by step):
Worker picks up job
Emit WebSocket event: { status: 'processing', message: 'Analyzing your content...' }
If fileRef exists and fileType === 'pdf': parse PDF with pdf-parse, extract text
If fileRef exists and fileType === 'image': read image as base64
Build system prompt (see Section 9)
Call Gemini 2.5 Flash with structured output prompt
Stream response section by section
For each completed section: validate with Zod, emit WebSocket section_ready event
After all sections: validate full JSON with Zod
Save to generatedPapers collection in MongoDB
Update assignments status to completed
Cache full JSON in Redis: key paper:{assignmentId}, TTL 2 hours
Emit WebSocket: { status: 'completed', assignmentId }
On failure:
BullMQ retries up to 2 times with exponential backoff
After all retries exhausted: update assignment status to failed, emit WebSocket { status: 'failed', error: '...' }
Concurrency: 3 concurrent workers (Gemini rate limit safe)

Queue 2: section-regeneration
Added when: Teacher clicks the regenerate icon on a specific section.
Job payload:
{
  assignmentId: string,
  userId: string,
  sectionId: string,        // "A", "B", etc.
  existingPaper: AssessmentJSON,  // full current paper (other sections preserved)
  // same context fields as above
}

Worker behavior:
Fetch existing paper from Redis cache (or MongoDB if cache miss)
Build targeted prompt: only regenerate the specified section, same context
Call Gemini, get only that section's questions
Validate section with Zod
Merge new section into existing paper JSON (replace only that section)
Update MongoDB generatedPapers document
Update Redis cache
Emit WebSocket: { status: 'section_updated', sectionId, section: newSection }
Why this is token-efficient: You're only asking Gemini to produce ~5–10 questions instead of the full paper. Saves roughly 60–80% of tokens on a regeneration call.

Queue 3: pdf-export
Added when: Teacher clicks "Download as PDF".
Job payload:
{
  assignmentId: string,
  userId: string,
  paperId: string
}

Worker behavior:
Fetch paper JSON from Redis (or MongoDB)
Render the exam paper HTML template server-side (same template as frontend output page, but a server-rendered HTML string)
Launch Puppeteer, load HTML string
Set page format to A4, print to PDF buffer
Save PDF temporarily to /tmp/[assignmentId].pdf
Respond to frontend with download stream or signed URL
Delete temp file after delivery

8. WEBSOCKET IMPLEMENTATION
Library: ws (Node.js WebSocket library)
 Setup: WebSocket server attached to the same Express HTTP server instance
Server Setup
Express HTTP Server
  └── WebSocket Server (ws)
       └── Connection map: Map<jobId, WebSocket>

When client connects, it sends an init message: { type: 'subscribe', jobId: 'xyz' }. Server stores connectionMap.set(jobId, ws).
Event Types Emitted by Server → Client
Event
Payload
Triggered by
status_update
{ status, message }
Worker progress
section_ready
{ sectionId, section: AssessmentSection }
Each section completed
generation_complete
{ assignmentId }
All sections done
section_updated
{ sectionId, section }
Section regeneration done
generation_failed
{ error: string }
Job failed after retries
pdf_ready
{ downloadUrl }
PDF job complete

Client WebSocket Handler (frontend)
// In generating page component
useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', jobId }))
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    switch(msg.type) {
      case 'section_ready':
        generationStore.addSection(msg.section)
        break
      case 'generation_complete':
        router.push(`/assignments/${assignmentId}/output`)
        break
      case 'generation_failed':
        generationStore.setError(msg.error)
        break
    }
  }

  return () => ws.close()
}, [jobId])

Why WebSocket Over Polling
A single persistent connection. The server pushes sections the moment they're ready. With polling (GET every 2s), you'd make 10–20 requests during a 20-second generation. WebSocket delivers each section the instant it completes — enabling the streaming section-by-section reveal UX on the output page.

9. AI IMPLEMENTATION — GEMINI 2.5 FLASH
Model: gemini-2.5-flash
 Library: @google/generative-ai
Why Gemini 2.5 Flash
Free tier available
Strong structured JSON output
Long context window (handles large PDFs)
Fast enough for streaming section delivery

Prompt Architecture
Every generation call has two parts: System Context and User Instruction.
System Context (built by promptBuilder.ts)
You are an expert educational assessment creator for Indian schools.
You create structured, curriculum-aligned question papers.

SCHOOL CONTEXT:
- School: {schoolName}
- Class: {className}
- Subject: {subject}
- Chapters/Topics: {chapters}
- Board: {board}
- Time Allowed: {timeAllowed} minutes

STRICT RULES:
1. Questions must be appropriate for Class {className} students
2. Vocabulary, complexity, and depth must match {board} curriculum standards
3. You must return ONLY valid JSON. No markdown, no preamble, no explanation.
4. Follow the exact JSON schema provided.
5. Difficulty distribution per section: 40% easy, 40% moderate, 20% hard unless instructed otherwise.
6. MCQ options must be plausible — wrong options should not be obviously wrong.

User Instruction
Generate a complete question paper with the following structure:

SECTIONS REQUIRED:
{foreach questionType row}
- Section {letter}: {count} {type} questions, {marksEach} marks each
{/foreach}

ADDITIONAL INSTRUCTIONS: {additionalInstructions}

{if pdfText}
BASE YOUR QUESTIONS ON THIS CONTENT:
---
{extractedPDFText}
---
{/if}

RESPOND ONLY WITH THIS JSON STRUCTURE:
{paste full AssessmentJSON schema with field descriptions}


Response Parsing (responseParser.ts)
Receive raw string from Gemini
Strip any accidental markdown fences (json ... )
JSON.parse()
Validate against Zod schema
If Zod fails: log the error, retry once with a corrective prompt
If second attempt fails: throw error, let BullMQ handle retry

AI Scenario: Section Regeneration
System context is the same. User instruction changes:
I have an existing question paper. Regenerate ONLY Section {sectionId} ({questionTypeName}).
Keep the same difficulty distribution and marks structure.
The rest of the paper is unchanged.

SECTION TO REGENERATE:
- Type: {questionTypeName}
- Count: {count} questions
- Marks each: {marksEach}

Return ONLY the section JSON in this format:
{ "section": AssessmentSection }


AI Scenario: Diagram Generation (Dagre)
Called separately when a question's type is diagram or graph:
Generate a simple directed graph/cycle diagram for the following concept:
"{questionText}"

Return ONLY this JSON:
{
  "renderType": "dagre",
  "nodes": [{ "id": "1", "label": "Node Name" }],
  "edges": [{ "from": "1", "to": "2", "label": "optional edge label" }]
}

Keep it simple: maximum 8 nodes, clear labels, school-level accuracy.


AI Scenario: Simple Shape Diagram (SVG)
For geometric or simple labeled diagrams where Dagre doesn't fit:
Generate a simple SVG diagram for: "{diagramDescription}"

Rules:
- Use only basic SVG elements: circle, rect, line, text, path
- Black and white only (stroke: black, fill: white or none)
- ViewBox: 0 0 300 300
- All text must be inside <text> elements with appropriate font-size
- No external resources, no JavaScript, no CSS classes
- Keep it simple and school-appropriate

Return ONLY the raw SVG string starting with <svg>

After receiving: sanitize with DOMPurify before storing in DB or rendering.

10. PDF PARSING
Library: pdf-parse
When used: When teacher uploads a PDF in Step 2 of the form.
Flow:
Teacher uploads PDF via file upload zone
Frontend sends multipart form POST to /api/upload
Backend receives file buffer (Multer middleware)
Save file to local /uploads/ directory or S3
Return fileRef URL to frontend
Zustand stores fileRef + fileType: 'pdf'
When generation job runs: worker fetches the file, runs pdf-parse
Extracted text (plain string) is trimmed and truncated to 15,000 characters (Gemini context limit safety)
Injected into the generation prompt under "BASE YOUR QUESTIONS ON THIS CONTENT"
Important: Do not pass the raw file to Gemini. Extract text first. Cleaner, cheaper, more reliable.
If image uploaded (JPEG/PNG):
Worker reads the file as base64
Passes it to Gemini as an inline image part in the multimodal message
Gemini can read text and diagrams from the image

11. DIAGRAM AND VISUAL FEATURE
Three rendering paths, chosen by the AI response field diagramData.renderType.
Path 1: Teacher-Uploaded Image
Teacher uploads image via question form
Image stored on backend, imageUrl stored in question JSON
Frontend QuestionItem renders <img src={imageUrl} /> with max-width constraint
In PDF: Puppeteer captures it naturally as part of the page
Path 2: SVG (Simple Shapes)
Used for: geometric figures, labeled diagrams (e.g., parts of a plant), simple science diagrams
Gemini generates raw SVG string
Backend sanitizes with isomorphic-dompurify before storing
Frontend DiagramRenderer renders <div dangerouslySetInnerHTML={{ __html: svgContent }} />
Constrained inside a fixed 300×300 container
Path 3: Dagre.js (Graphs, Cycles, Flowcharts)
Used for: food chains, water cycle, flowcharts, process diagrams, organizational structures
Gemini returns nodes + edges JSON (NOT coordinates)
Frontend DiagramRenderer uses dagre library to compute layout
Renders nodes as <rect> + <text>, edges as <line> or <path> with arrowheads
All inside a dynamically sized SVG element
DiagramRenderer Decision Logic:
if (!question.diagramData && !question.imageUrl) return null
if (question.imageUrl) return <img src={question.imageUrl} />
if (question.diagramData.renderType === 'svg') return <SvgDiagram />
if (question.diagramData.renderType === 'dagre') return <DagreDiagram />


12. OUTPUT PAGE — EXAM PAPER TEMPLATE
The output is a React component that renders in the style of a real Indian school exam paper. It is a fixed template — the data fills it, the structure is predetermined.
Visual Structure (matches Figma Screen 4)
┌─────────────────────────────────────────────────────────┐
│  [Dark Banner]                                          │
│  "Here are your customized questions for..."           │
│  [Download PDF]  [Regenerate All]                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              DELHI PUBLIC SCHOOL, BOKARO                │  ← bold, centered, large
│              Subject: Science | Class: 8th              │  ← centered
│─────────────────────────────────────────────────────────│
│  Time Allowed: 45 mins          Maximum Marks: 50       │
│─────────────────────────────────────────────────────────│
│  All questions are compulsory unless stated otherwise.  │
│                                                         │
│  Name: ________________  Roll No: _________            │
│  Class/Section: _________                               │
│─────────────────────────────────────────────────────────│
│                     SECTION A                           │  ← bold, centered
│           Short Answer Questions                        │  ← centered
│    Attempt all questions. Each carries 2 marks.         │  ← , smaller
│                                                         │
│  1. [Easy] Question text here...              [2 Marks] │
│  2. [Moderate] Question text here...          [2 Marks] │
│     [Diagram here if applicable]                        │
│                                                         │
│                     SECTION B                           │
│           Multiple Choice Questions                     │
│    Choose the correct answer.                           │
│                                                         │
│  11. [Easy] Question text...                  [1 Mark]  │
│      (a) Option A   (b) Option B                        │
│      (c) Option C   (d) Option D                        │
│                                                         │
│─────────────────────────────────────────────────────────│
│                  END OF QUESTION PAPER                  │
│─────────────────────────────────────────────────────────│
│  ANSWER KEY                                             │
│  1. Answer text...                                      │
│  2. Answer text...                                      │
└─────────────────────────────────────────────────────────┘

Difficulty Badge Colors
Easy → green background (#dcfce7), green text
Moderate → orange background (#fff7ed), orange text
Hard/Challenging → red background (#fef2f2), red text
Question Numbering
Questions numbered globally across all sections (1, 2, 3... continues across sections). Section breaks are visual separators, not number resets.
Mobile Responsive
On mobile: paper fills full width, font scales down slightly
Difficulty badges remain inline with question
MCQ options stack to 2-per-row instead of 2-per-line

13. PDF EXPORT
Library: Puppeteer (backend, in PDF worker)
Flow:
Teacher clicks "Download as PDF"
POST /api/assignments/:id/export-pdf
Job added to pdf-export queue
Worker launches Puppeteer headless browser
Loads a server-rendered HTML version of the exam paper (same CSS, same structure)
Sets Puppeteer print options: A4, margins 15mm all sides, background graphics enabled
Generates PDF buffer
Streams back to client as application/pdf download
Filename: {SchoolName}_{Subject}_{Class}_{Date}.pdf
Why Puppeteer over LLM-generated PDF: Puppeteer renders exactly what you see on screen. Pixel-perfect. No formatting discrepancies.
Key Puppeteer config:
await page.emulateMediaType('print')
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
})


14. CACHING STRATEGY
Redis Cache Keys and TTLs
Key Pattern
Value
TTL
Purpose
paper:{assignmentId}
Full AssessmentJSON (JSON string)
2 hours
Avoid DB hit on output page load
job:{jobId}:status
{ status, progress, message }
1 hour
WebSocket reconnect recovery
user:{userId}:assignments
Array of assignment summaries
10 minutes
Assignments list page

Cache Invalidation Rules
paper:{assignmentId} is invalidated and rewritten whenever a section is regenerated or full regeneration runs
user:{userId}:assignments is invalidated whenever an assignment is created or deleted
Never cache PDF binary in Redis — too large, unnecessary
Cache Miss Handling
Every cache read has a fallback:
Redis GET → if null → MongoDB query → write result back to Redis → return


15. LOCALSTORAGE STRATEGY
Managed by: Zustand persist middleware
 Key: veda_form_draft
What is Stored
All Step 1 form fields (title, class, subject, chapters, board, time)
All Step 2 form fields (due date, question type rows, additional instructions)
Current step number (1 or 2)
fileRef of uploaded file (so teacher doesn't need to re-upload on refresh)
What is NOT Stored in LocalStorage
JWT token (stored in httpOnly cookie only)
Generated paper JSON (stored in MongoDB + Redis, fetched on output page load)
Zustand generationStore (ephemeral, session-only)
Clearing LocalStorage
On successful generation completion (after teacher views output): resetForm() called in store
On explicit "Start New Assignment": resetForm() called
Never cleared on error — teacher should be able to resume

16. WORKER DEFINITIONS
Worker 1: generationWorker.ts
Queue: assessment-generation
 Concurrency: 3
 Steps:
Extract job data
Parse uploaded file if present (pdf-parse or base64 image)
Build system prompt using promptBuilder.ts
Call Gemini, stream response
Parse + validate each section with Zod
Emit section_ready WebSocket event per section
Save complete paper to MongoDB
Cache in Redis
Update assignment status
Emit generation_complete WebSocket event
Retry config: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } }

Worker 2: sectionRegenerationWorker.ts
Queue: section-regeneration
 Concurrency: 5
 Steps:
Fetch existing paper from Redis (fallback MongoDB)
Build targeted section-only prompt
Call Gemini
Parse + validate section with Zod
Merge new section into existing paper
Update MongoDB + Redis cache
Emit section_updated WebSocket event
Retry config: { attempts: 2, backoff: { type: 'fixed', delay: 3000 } }

Worker 3: pdfWorker.ts
Queue: pdf-export
 Concurrency: 2
 Steps:
Fetch paper JSON from Redis/MongoDB
Render HTML string from exam paper template
Launch Puppeteer, load HTML
Generate PDF buffer
Stream to client or save to /tmp/ and send signed URL
Cleanup temp file
Retry config: { attempts: 1 } (PDF failures should surface immediately)

17. API ENDPOINTS
Auth
Method
Path
Description
POST
/api/auth/register
Create teacher account
POST
/api/auth/login
Login, returns JWT in cookie
POST
/api/auth/logout
Clear cookie

Assignments
Method
Path
Description
GET
/api/assignments
List all assignments for teacher
POST
/api/assignments
Create assignment + add to generation queue
GET
/api/assignments/:id
Get single assignment metadata
DELETE
/api/assignments/:id
Delete assignment + paper
GET
/api/assignments/:id/paper
Get generated paper JSON (Redis → MongoDB)

Generation
Method
Path
Description
GET
/api/assignments/:id/status
Get job status (fallback for WebSocket reconnect)
POST
/api/assignments/:id/regenerate
Full regeneration
POST
/api/assignments/:id/regenerate-section
Section regeneration

Export
Method
Path
Description
POST
/api/assignments/:id/export-pdf
Queue PDF generation
GET
/api/assignments/:id/download
Stream PDF

Upload
Method
Path
Description
POST
/api/upload
Upload PDF/image, return fileRef URL


18. TECH STACK
Frontend
Tool
Purpose
Next.js 14 (App Router)
Framework, routing, SSR
TypeScript
Type safety
Zustand + persist middleware
State management + LocalStorage
TailwindCSS
Styling
React Hook Form + Zod
Form validation
dagre
Graph layout computation
ws (browser WebSocket)
Real-time updates
axios
HTTP client

Backend
Tool
Purpose
Node.js + Express + TypeScript
Server
ws
WebSocket server
BullMQ
Job queue
ioredis
Redis client
Mongoose
MongoDB ODM
Multer
File upload handling
pdf-parse
PDF text extraction
isomorphic-dompurify
SVG sanitization
Puppeteer
PDF export
jsonwebtoken
Auth tokens
bcryptjs
Password hashing
zod
Runtime JSON validation

AI
Tool
Purpose
@google/generative-ai
Gemini 2.5 Flash SDK
Gemini 2.5 Flash
Question generation, diagram data

Infrastructure
Tool
Purpose
MongoDB (Atlas free tier)
Persistent storage
Redis (Upstash free tier)
Cache + BullMQ backing
Vercel
Frontend deployment
Railway / Render
Backend deployment


19. FOLDER STRUCTURE
vedaai/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── register/avatar/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── assignments/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── generating/page.tsx
│   │   │       └── output/page.tsx
│   │   └── library/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── form/
│   │   ├── output/
│   │   └── common/
│   ├── stores/
│   │   ├── assignmentFormStore.ts
│   │   └── generationStore.ts
│   └── lib/
│       ├── api.ts
│       └── websocket.ts
│
├── backend/                     # Express app
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   │   ├── generationWorker.ts
│   │   │   ├── sectionRegenerationWorker.ts
│   │   │   └── pdfWorker.ts
│   │   ├── queues/
│   │   │   ├── generationQueue.ts
│   │   │   └── pdfQueue.ts
│   │   ├── websocket/
│   │   │   └── wsServer.ts
│   │   ├── ai/
│   │   │   ├── geminiClient.ts
│   │   │   ├── promptBuilder.ts
│   │   │   ├── responseParser.ts
│   │   │   └── zodSchemas.ts
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Assignment.ts
│   │   │   │   └── GeneratedPaper.ts
│   │   │   └── connect.ts
│   │   └── cache/
│   │       └── redis.ts
│   └── uploads/                 # Temp upload directory


20. ENVIRONMENT VARIABLES
Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000

Backend (.env)
PORT=4000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your_jwt_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
FRONTEND_URL=http://localhost:3000

ADDENDUM — Implementation Details

 Error Handling
Every layer has a defined error behavior. Nothing fails silently.
Frontend:
Wrap the output page in a React Error Boundary. If any component throws, show a fallback UI with a "Reload" button — not a blank white screen.
Every API call wrapped in try/catch. On network error: show a toast notification with the specific message, not a generic "Something went wrong."
Form validation errors shown inline under the specific field, not as a page-level alert.
If generation job fails (WebSocket delivers generation_failed event): show the error message with a "Try Again" button that re-queues the same job without making the teacher re-fill the form.
Backend:
Global Express error handler as the last middleware. Catches anything that falls through and returns structured JSON: { success: false, error: { code, message } }. Never leak stack traces to the client in production.
All route handlers wrapped with an asyncHandler utility that catches async errors and passes them to the global handler — no unhandled promise rejections.
Zod validation failure in worker: log the raw LLM response and the Zod error to console, retry once with a corrective prompt appended ("Your previous response was invalid JSON. Return only valid JSON matching this schema."). If second attempt also fails, mark job as failed and emit error via WebSocket.
MongoDB connection failure on startup: exit process with code 1 and a clear log message. Do not start the server with no DB connection.
Redis connection failure: log a warning but continue — degrade gracefully by bypassing cache (go directly to MongoDB). BullMQ will not start if Redis is unavailable, so log that workers are offline.
Worker-level:
Each worker's process function wrapped in try/catch. On caught error: update assignment status to failed in MongoDB, emit generation_failed WebSocket event, let BullMQ handle the retry count.
After all retry attempts exhausted: emit final failure event with a human-readable message.

No Streaming — Full Response Generation
Generation is not streamed. The Gemini call runs to completion, the full JSON response is received, validated with Zod, saved to MongoDB, and only then the WebSocket emits a single generation_complete event with the full paper.
This simplifies the worker significantly — no partial JSON parsing, no chunk reassembly, no section-by-section emit logic.
Loading UX without streaming: Show a deterministic progress animation driven by time elapsed, not actual server events. A sequence of status messages cycles automatically on the frontend:
0s: "Submitting your assignment..."
2s: "Analyzing content and context..."
5s: "Building question structure..."
10s: "Generating questions..."
18s: "Reviewing and formatting..."
On generation_complete event received: "Done! Loading your paper..."
These are frontend timers only — they do not reflect actual backend progress. But they keep the teacher engaged during the wait and are far simpler to implement than real streaming.
WebSocket in this model carries only three events:
generation_complete — full paper is ready, assignmentId in payload
generation_failed — job failed, error message in payload
section_updated — a single section was regenerated (still used for section-level regeneration)

WebSocket — Volatile Delivery with Poll Fallback
WebSocket messages are fire-and-forget (volatile). If a packet is lost due to network congestion or a dropped connection, do not retry it. Move on.
Server behavior: Emit WebSocket events with no acknowledgement requirement. If the client is not connected when the event fires, the event is dropped. The source of truth is always MongoDB — WebSocket is just a notification channel, not a data delivery mechanism.
typescript
// In worker, after generation completes:
const ws = connectionMap.get(jobId)
if (ws && ws.readyState === WebSocket.OPEN) {
  ws.send(JSON.stringify({ type: 'generation_complete', assignmentId }))
}
// If ws is null or closed — drop it. Client will poll.
Client reconnect + poll fallback: If the WebSocket connection drops during generation, the client falls back to polling automatically.
typescript
useEffect(() => {
  let pollInterval: NodeJS.Timeout

  const ws = new WebSocket(WS_URL)

  ws.onopen = () => ws.send(JSON.stringify({ type: 'subscribe', jobId }))

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'generation_complete') {
      clearInterval(pollInterval)
      router.push(`/assignments/${assignmentId}/output`)
    }
    if (msg.type === 'generation_failed') {
      clearInterval(pollInterval)
      setError(msg.error)
    }
  }

  ws.onclose = () => {
    // WebSocket dropped — start polling as fallback
    pollInterval = setInterval(async () => {
      const res = await fetch(`/api/assignments/${assignmentId}/status`)
      const data = await res.json()
      if (data.status === 'completed') {
        clearInterval(pollInterval)
        router.push(`/assignments/${assignmentId}/output`)
      }
      if (data.status === 'failed') {
        clearInterval(pollInterval)
        setError(data.error)
      }
    }, 3000)
  }

  return () => {
    ws.close()
    clearInterval(pollInterval)
  }
}, [jobId, assignmentId])
Poll interval: every 3 seconds. Stop polling the moment either a status of completed or failed is returned. This covers every failure scenario — tab sleep, network blip, server restart — without any complex reconnection logic.

Optimistic UI on Section Regeneration
When the teacher clicks the regenerate icon on a section, do not wait for the WebSocket event before updating the UI. Immediately replace that section's content with a skeleton shimmer. This makes the interaction feel instant.
State change on click:
typescript
// In generationStore, add:
regeneratingSections: Set<string>   // section IDs currently regenerating
setRegenerating: (sectionId: string, value: boolean) => void
On regenerate button click:
Immediately call setRegenerating('B', true) — UI swaps section content for skeleton
POST to /api/assignments/:id/regenerate-section with { sectionId: 'B' }
Receive back a jobId
WebSocket is already connected — it will deliver section_updated when done
SectionBlock component render logic:
typescript
const isRegenerating = regeneratingSections.has(section.id)

if (isRegenerating) return <SectionSkeleton />
return <SectionContent section={section} />
SectionSkeleton: Three to five grey shimmer bars of varying widths. Animating pulse (Tailwind animate-pulse). Looks like loading question text. Renders inside the same section container so the page layout does not shift.
On section_updated WebSocket event received:
Call setRegenerating('B', false)
Update the section data in the store
Section content re-renders with new questions
On failure:
Call setRegenerating('B', false)
Restore the previous section data (keep a previousSections snapshot in the store before triggering)
Show a toast: "Failed to regenerate Section B. Previous version restored."



APPENDIX: BUILD PRIORITY ORDER
Build in this exact order. Do not skip ahead.
Auth (register, login, JWT, avatar selection)
Sidebar layout + Homepage (match Figma exactly)
Assignments list page (0-state and filled state)
Multi-step form (Step 1 + Step 2, validation, Zustand + LocalStorage)
File upload endpoint
MongoDB models + Redis setup
BullMQ queues + generation worker (without AI first — mock the Gemini call)
WebSocket server + client integration
Gemini integration (replace mock with real call)
Zod validation + response parsing
Output page (exam paper template, all question types)
Section regeneration (worker + UI button)
PDF export (Puppeteer worker)
Diagram rendering (SVG + Dagre)
My Library page
Polish, mobile responsive, README

VedaAI PDR — Complete Build Reference
 Generated for Full Stack Engineering Assignment Submission