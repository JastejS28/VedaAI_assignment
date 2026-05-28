
MongoDB (Atlas free tier)  Persistent storage 
Redis (Upstash free tier)  Cache + BullMQ backing 
Vercel  Frontend deployment 
Railway / Render  Backend deployment 
 
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
 
1.   Error Handling 
Every layer has a defined error behavior. Nothing fails silently. 
Frontend: 
●  Wrap the output page in a React Error Boundary. If any component throws, show a 
fallback UI with a "Reload" button — not a blank white screen. 
●  Every API call wrapped in try/catch. On network error: show a toast notification with the 
specific message, not a generic "Something went wrong." 
●  Form validation errors shown inline under the specific field, not as a page-level alert. 
●  If generation job fails (WebSocket delivers generation_failed event): show the error 
message with a "Try Again" button that re-queues the same job without making the 
teacher re-fill the form. 
Backend: 
●  Global Express error handler as the last middleware. Catches anything that falls through 
and returns structured JSON: { success: false, error: { code, message } 
}. Never leak stack traces to the client in production. 
●  All route handlers wrapped with an asyncHandler utility that catches async errors and 
passes them to the global handler — no unhandled promise rejections. 
●  Zod validation failure in worker: log the raw LLM response and the Zod error to console, 
retry once with a corrective prompt appended ("Your previous response was invalid 
JSON. Return only valid JSON matching this schema."). If second attempt also fails, 
mark job as failed and emit error via WebSocket. 
●  MongoDB connection failure on startup: exit process with code 1 and a clear log 
message. Do not start the server with no DB connection. 
●  Redis connection failure: log a warning but continue — degrade gracefully by bypassing 
cache (go directly to MongoDB). BullMQ will not start if Redis is unavailable, so log that 
workers are offline. 
Worker-level: 
●  Each worker's process function wrapped in try/catch. On caught error: update 
assignment status to failed in MongoDB, emit generation_failed WebSocket 
event, let BullMQ handle the retry count. 
●  After all retry attempts exhausted: emit final failure event with a human-readable 
message. 
 
2.  No Streaming — Full Response Generation 
Generation is not streamed. The Gemini call runs to completion, the full JSON response is 
received, validated with Zod, saved to MongoDB, and only then the WebSocket emits a single 
generation_complete event with the full paper. 
This simplifies the worker significantly — no partial JSON parsing, no chunk reassembly, no 
section-by-section emit logic. 
Loading UX without streaming: Show a deterministic progress animation driven by time 
elapsed, not actual server events. A sequence of status messages cycles automatically on the 
frontend: 
●  0s: "Submitting your assignment..." 
●  2s: "Analyzing content and context..." 
●  5s: "Building question structure..." 
●  10s: "Generating questions..." 
●  18s: "Reviewing and formatting..." 
●  On generation_complete event received: "Done! Loading your paper..." 
These are frontend timers only — they do not reflect actual backend progress. But they keep 
the teacher engaged during the wait and are far simpler to implement than real streaming. 
WebSocket in this model carries only three events: 
●  generation_complete — full paper is ready, assignmentId in payload 
●  generation_failed — job failed, error message in payload 
●  section_updated — a single section was regenerated (still used for section-level 
regeneration) 
 
3.  WebSocket — Volatile Delivery with Poll Fallback 
WebSocket messages are fire-and-forget (volatile). If a packet is lost due to network congestion 
or a dropped connection, do not retry it. Move on. 
Server behavior: Emit WebSocket events with no acknowledgement requirement. If the client is 
not connected when the event fires, the event is dropped. The source of truth is always 
MongoDB — WebSocket is just a notification channel, not a data delivery mechanism. 
typescript 
// In worker, after generation completes: 
const ws = connectionMap.get(jobId) 
if (ws && ws.readyState === WebSocket.OPEN) { 
  ws.send(JSON.stringify({ type: 'generation_complete', assignmentId })) 
} 
// If ws is null or closed — drop it. Client will poll. 
Client reconnect + poll fallback: If the WebSocket connection drops during generation, the 
client falls back to polling automatically. 
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
Poll interval: every 3 seconds. Stop polling the moment either a status of completed or 
failed is returned. This covers every failure scenario — tab sleep, network blip, server restart 
— without any complex reconnection logic. 
 
4.  Optimistic UI on Section Regeneration 
When the teacher clicks the regenerate icon on a section, do not wait for the WebSocket event 
before updating the UI. Immediately replace that section's content with a skeleton shimmer. This 
makes the interaction feel instant. 
State change on click: 
typescript 
// In generationStore, add: 
regeneratingSections: Set<string>   // section IDs currently regenerating 
setRegenerating: (sectionId: string, value: boolean) => void 
On regenerate button click: 
1.  Immediately call setRegenerating('B', true) — UI swaps section content for 
skeleton 
2.  POST to /api/assignments/:id/regenerate-section with { sectionId: 
'B' } 
3.  Receive back a jobId 
4.  WebSocket is already connected — it will deliver section_updated when done 
SectionBlock component render logic: 
typescript 
const isRegenerating = regeneratingSections.has(section.id) 
 
if (isRegenerating) return <SectionSkeleton /> 
return <SectionContent section={section} /> 
SectionSkeleton: Three to five grey shimmer bars of varying widths. Animating pulse (Tailwind 
animate-pulse). Looks like loading question text. Renders inside the same section container 
so the page layout does not shift. 
On section_updated WebSocket event received: 
1.  Call setRegenerating('B', false) 
2.  Update the section data in the store 
3.  Section content re-renders with new questions 
On failure: 
1.  Call setRegenerating('B', false) 
2.  Restore the previous section data (keep a previousSections snapshot in the store 
before triggering) 
3.  Show a toast: "Failed to regenerate Section B. Previous version restored." 
 
 
 
APPENDIX: BUILD PRIORITY ORDER 
Build in this exact order. Do not skip ahead. 
1.  Auth (register, login, JWT, avatar selection) 
2.  Sidebar layout + Homepage (match Figma exactly) 
3.  Assignments list page (0-state and filled state) 
4.  Multi-step form (Step 1 + Step 2, validation, Zustand + LocalStorage) 
5.  File upload endpoint 
6.  MongoDB models + Redis setup 
7.  BullMQ queues + generation worker (without AI first — mock the Gemini call) 
8.  WebSocket server + client integration 
9.  Gemini integration (replace mock with real call) 
10. Zod validation + response parsing 
11. Output page (exam paper template, all question types) 
12. Section regeneration (worker + UI button) 
13. PDF export (Puppeteer worker) 
14. Diagram rendering (SVG + Dagre) 
15. My Library page 
16. Polish, mobile responsive, README 
 
VedaAI PDR — Complete Build Reference 
 Generated for Full Stack Engineering Assignment Submission