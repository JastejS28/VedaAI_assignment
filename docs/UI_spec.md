Color System
Primary brand color: #E8470A (the burnt orange/rust — used for the logo mark, CTA button background, active nav item background, badge on nav, notification dot, "Next" button)
Background colors:
Page/sidebar background: #FFFFFF (pure white)
Main content area: #F5F5F5 (very light grey, almost white)
Assignment cards: #FFFFFF with a subtle border
Top navbar: #FFFFFF with a bottom border #E5E5E5
Dark banner (output page): #1A1A1A (near black)
Text colors:
Primary headings: #111111 (near black)
Secondary text: #6B6B6B (medium grey)
Muted/label text: #9CA3AF (light grey)
White text (on dark banner, on CTA button): #FFFFFF
Border colors:
Card borders: #E5E7EB (1px solid)
Input borders: #D1D5DB
Sidebar divider: #F0F0F0
Difficulty badge colors:
Easy: green background #DCFCE7, text #15803D
Moderate: orange background #FFF7ED, text #C2410C
Challenging: red background #FEF2F2, text #B91C1C

Typography
Font family: Inter — this is unmistakably Inter. Import from Google Fonts:
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
Then in Tailwind config: fontFamily: { sans: ['Inter', 'sans-serif'] }
Font sizes and weights across the UI:
Element
Size
Weight
Color
VedaAI logo text
18px
700
#111111
Sidebar nav items
14px
400
#6B6B6B
Sidebar active nav item
14px
500
#111111
"Create Assignment" button
14px
500
#FFFFFF
Page title ("Assignments")
20px
600
#111111
Page subtitle
13px
400
#6B6B6B
Card title
16px
600
#111111
Card meta text ("Assigned on")
13px
400
#6B6B6B
Card meta value (date)
13px
500
#111111
Form section title ("Assignment Details")
16px
600
#111111
Form section subtitle
13px
400
#6B6B6B
Input placeholder
14px
400
#9CA3AF
Input value
14px
400
#111111
Question type dropdown
14px
400
#111111
Total counts text
13px
400/500
#111111
Output: school name
22px
700
#111111
Output: subject/class
15px
400
#111111
Output: section header
18px
600
#111111
Output: question text
14px
400
#111111
Difficulty tag text
11px
500
(per color)
Dark banner text
14px
400
#FFFFFF
"Download as PDF" button text
13px
500
#FFFFFF
Empty state heading
18px
600
#111111
Empty state subtext
14px
400
#6B6B6B


Sidebar
Desktop sidebar dimensions: 200px wide, full height, white background, right border 1px solid #F0F0F0.
Logo area (top):
Height: ~64px, padding: 16px 20px
Logo mark: the orange square with rounded corners (~32px) containing a white stylized "V" shape — this is a custom SVG, not a library icon. Build it as an inline SVG with fill="#E8470A" background rect with rx="6" and a white path inside.
"VedaAI" text: 18px, weight 700, color #111111, margin-left 8px
"+ Create Assignment" button:
Full width minus 20px padding each side
Height: 40px
Background: #111111 (dark, near black — NOT the orange)
Border radius: 8px
Text: "✦ Create Assignment" — the ✦ sparkle icon before the text, white, 14px, weight 500
The sparkle (✦) is a unicode character ✦ (U+2726) or use a small SVG star
Nav items:
Padding: 10px 16px
Border radius: 8px
Icon + label, gap 10px
Icons: 18px, from Lucide React (Home, Users, FileText, Wand2, BookOpen)
Active state: background #F5F5F5, text color #111111, weight 500
Inactive state: no background, text color #6B6B6B
"Assignments" nav item shows an orange badge #E8470A with white number text, 11px, positioned as a pill on the right side of the row
Bottom section (separated by generous margin-top: auto):
Settings row: gear icon + "Settings" text, 14px, #6B6B6B
Teacher profile card:
White background, border 1px solid #E5E7EB, border-radius 10px
Padding: 12px
Avatar: 36px circle, contains an illustrated avatar (cartoonish teacher illustration — these are custom SVG avatars, not initials. Use DiceBear Avatars library or similar: https://api.dicebear.com/7.x/avataaars/svg?seed=DelhiPublicSchool)
School name: 13px, weight 600, #111111
City: 12px, weight 400, #6B6B6B

Top Navigation Bar
Height: 56px
 Background: #FFFFFF
 Border bottom: 1px solid #E5E7EB
 Padding: 0 24px
 Layout: flex, space-between
Left side:
Back arrow icon (Lucide ChevronLeft or ArrowLeft), 18px, #6B6B6B
Breadcrumb icon (grid/layout icon, Lucide LayoutGrid), 14px, #6B6B6B
Breadcrumb text: "Assignment", 14px, #6B6B6B
Right side:
Bell icon (Lucide Bell), 20px, #6B6B6B, with a small red dot notification badge (8px circle, #E8470A, positioned absolute top-right of the bell)
Avatar circle: 32px, circular image of teacher
Teacher name: "John Doe", 14px, weight 500, #111111
Chevron down: 14px, #6B6B6B

Screen 1 — Zero State (Assignments Page)
Empty state container: centered vertically and horizontally in the content area.
Illustration: The magnifying glass with red X and document — this is NOT from a library. It's a custom SVG illustration. Build it yourself or use an open-source illustration library like unDraw (search "empty" or "no data") or Storyset. The color scheme of the illustration uses soft purple/lavender for the document and glass, red for the X. Alternatively use the Lucide SearchX icon scaled up to ~120px with a light gray background circle.
"No assignments yet": 18px, weight 600, #111111, margin-top 24px
Subtext: 14px, weight 400, #6B6B6B, max-width 300px, text-align center, line-height 1.6
"+ Create Your First Assignment" button:
Background: #111111
Text: white, 14px, weight 500
Padding: 12px 24px
Border radius: 8px
"+" prefix character

Screen 2 — Filled State (Assignments Grid)
Page header:
Green dot indicator (8px circle, #22C55E) before "Assignments" title — indicates active/live status
Title: "Assignments", 20px, weight 600
Subtitle: "Manage and create assignments for your classes.", 13px, #6B6B6B
Filter bar:
Full width, flex row, space-between
Left: "Filter By" with filter icon (Lucide SlidersHorizontal), 14px, #6B6B6B, no background, just text+icon
Right: Search input — height 36px, border 1px solid #E5E7EB, border-radius 8px, padding 0 12px, placeholder "Search Assignment", Lucide Search icon inside on left, 14px
Assignment cards:
Grid: 2 columns on desktop (grid-template-columns: 1fr 1fr), gap 12px
Card: white background, border 1px solid #E5E7EB, border-radius 12px, padding 16px 20px
Card height: approximately 100px
Title: 16px, weight 600, #111111, margin-bottom auto (pushed to top)
Three-dot menu: Lucide MoreVertical, 16px, #9CA3AF, positioned top-right of card
Bottom row: flex, space-between
"Assigned on : " label 13px weight 400 #6B6B6B + date value 13px weight 500 #111111
"Due : " label 13px weight 400 #6B6B6B + date value 13px weight 500 #111111
Three-dot dropdown menu:
White background, border 1px solid #E5E7EB, border-radius 8px
Shadow: box-shadow: 0 4px 12px rgba(0,0,0,0.08)
Two items: "View Assignment" (14px, #111111) and "Delete" (14px, #EF4444 red)
Padding: 8px 0, each item 8px 16px
Floating "+ Create Assignment" button:
Positioned: bottom center, position: sticky at bottom of scroll area
Same dark style as sidebar CTA but with + prefix
Shadow: box-shadow: 0 4px 16px rgba(0,0,0,0.15)

Screen 3 — Create Assignment Form
Step indicator:
Full width bar at top of content card
Two steps indicated by a horizontal progress line
Active step: thick dark line #111111, height 3px, border-radius 2px
Inactive step: light line #E5E7EB, same dimensions
The bar appears to be split into two equal halves with a gap between them
Content card:
White background
Border: 1px solid #E5E7EB
Border radius: 16px
Padding: 32px
Max-width approximately 560px, centered
"Assignment Details" section:
Title: 16px, weight 600, #111111
Subtitle: 13px, #6B6B6B, margin-bottom 16px
File upload zone:
Border: 2px dashed #D1D5DB
Border radius: 12px
Background: #FAFAFA
Padding: 32px
Center-aligned: upload cloud icon (Lucide UploadCloud), 28px, #9CA3AF
"Choose a file or drag & drop it here" — 14px, weight 500, #111111
"JPEG, PNG, upto 10MB" — 12px, #9CA3AF
"Browse Files" button: border 1px solid #D1D5DB, background white, border-radius 6px, padding 8px 16px, 13px, weight 500, #111111
Below the zone: helper text "Upload images of your preferred document/image", 12px, #9CA3AF, centered
Due Date input:
Label: "Due Date", 14px, weight 500, #111111, margin-bottom 6px
Input: height 40px, border 1px solid #D1D5DB, border-radius 8px, padding 0 12px, full width
Placeholder "DD-MM-YYYY", 14px, #9CA3AF
Right icon: calendar icon (Lucide CalendarPlus), 16px, #9CA3AF
Question Type section:
Label row: "Question Type" | "No. of Questions" | "Marks" — 13px, weight 500, #6B6B6B, flex row with space-between, margin-bottom 8px
Each question type row:
Height: 44px
Background: white, border 1px solid #E5E7EB, border-radius 8px
Layout: flex row, aligned center
Left: dropdown select (takes ~50% width), Chevron down icon, 14px #111111
Middle: × delete button — Lucide X, 14px, #9CA3AF, clickable
Right two sections: stepper for count + stepper for marks
Each stepper: − button | number | + button
Stepper buttons: 28px circle or square, border 1px solid #E5E7EB, font 16px, color #111111
Number display: 14px, weight 500, #111111, min-width 24px, text-align center
"+ Add Question Type" row:
+ icon in a circle (28px, border 1px solid #111111, color #111111)
"Add Question Type" text, 14px, weight 500, #111111
No background, just the icon and text
Totals row:
Aligned right
"Total Questions : 25" — 13px, weight 400, #111111 (value weight 600)
"Total Marks : 60" — same style
Line-height tight, two separate lines
Additional Information textarea:
Label: "Additional Information (For better output)", 14px, weight 500, #111111
Textarea: min-height 80px, border 1px solid #E5E7EB, border-radius 8px, padding 12px
Placeholder: 13px, #9CA3AF, italic
Microphone icon bottom-right corner of textarea: Lucide Mic, 16px, #9CA3AF
Navigation buttons (bottom):
Left: "← Previous" — outlined button, border 1px solid #D1D5DB, background white, border-radius 8px, padding 10px 24px, 14px, weight 500, #111111, left arrow
Right: "Next →" — filled button, background #111111, text white, same sizing, right arrow

Screen 4 — Assignment Output
Dark banner:
Background: #1A1A1A
Border radius: 12px (top of the paper section)
Padding: 20px 24px
Text: 14px, weight 400, white, line-height 1.5, max-width ~600px
"Download as PDF" button:
Border: 1px solid rgba(255,255,255,0.3)
Background: transparent (outlined style)
Text: white, 13px, weight 500
Icon: Lucide Download, 14px, white
Border radius: 8px
Padding: 8px 16px
Exam paper (white card):
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border radius: 0 0 12px 12px (bottom radius only, connects to dark banner above)
Padding: 40px 48px (generous, like a real printed paper)
Max-width: ~700px
Paper content typography:
School name: 20px, weight 700, #111111, text-align center
Subject + Class: 15px, weight 400, #111111, text-align center
Time Allowed + Max Marks: 13px, weight 400, #111111, flex row space-between
Horizontal rule: border-top: 1px solid #E5E7EB
General instruction: 13px, weight 500, #111111, italic
Name/Roll/Section lines: 13px, weight 400, #111111, with underscores rendered as border-bottom: 1px solid #111111 on a fixed-width span
Section header ("Section A"): 16px, weight 700, #111111, text-align center
Section type name ("Short Answer Questions"): 14px, weight 600, #111111
Section instruction ("Attempt all questions..."): 13px, italic, #6B6B6B
Question text: 14px, weight 400, #111111, line-height 1.6
Difficulty tag: inline, [Easy] / [Moderate] / [Challenging] — in the Figma these appear as plain text brackets, NOT as colored badges. But the assignment asks for visual highlighting, so add small colored pills
Marks: [2 Marks] — 13px, #6B6B6B, at end of question line
"End of Question Paper": 14px, weight 600, #111111, text-align left, margin-top 24px
Answer Key: 14px, weight 600, #111111, section below a divider line. Answers as numbered list, 13px, #333333

Mobile (Dashboard column in screenshots)
Top bar:
VedaAI logo left
Bell icon + avatar + hamburger menu icon right
Height: 52px
Bottom tab bar:
Background: #111111 (dark)
4 tabs: Home, Assignments, Library, AI Toolkit
Active tab: white icon + white text, small white indicator dot above
Inactive tab: grey icon + grey text
Height: 64px
Cards on mobile: Full width, single column, same styling as desktop cards but width 100%
Form on mobile: Question type rows stack — the No. of Questions and Marks steppers drop below the dropdown selector

UI Library Recommendations
Based on what I see, use these exact libraries:
Component library: shadcn/ui — it matches the exact aesthetic (clean, minimal, Inter font, consistent border radius, no heavy opinionated styling). Install individual components as needed.
Icons: lucide-react — every icon in this UI is from Lucide. 100% match.
Avatars: DiceBear (@dicebear/core + @dicebear/collection) — for the cartoonish teacher avatar in the sidebar profile card.
Date picker: react-day-picker (used by shadcn's Calendar component) — matches the DD-MM-YYYY input style.
Drag and drop file upload: react-dropzone — for the dashed upload zone.
Tailwind config additions needed:
js
theme: {
  extend: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    colors: {
      brand: '#E8470A',
      'brand-dark': '#C73D08',
    }
  }
}




VedaAI — Mobile Responsive Implementation Guide

CORE PRINCIPLE
This is ONE Next.js codebase. No separate mobile app. The same components render differently at different screen widths using Tailwind breakpoints. The Figma mobile screenshots show exactly what each screen should look like below 1024px.
Breakpoint reference:
< 768px   → mobile phones
768–1023px → tablets / small laptops  
1024px+   → desktop / large laptops   ← your primary target


LAYOUT CHANGES AT EACH BREAKPOINT
THE BIGGEST CHANGE — Sidebar vs Bottom Tab Bar
Desktop (lg+):
Left sidebar is visible: w-[200px], fixed, full height
Main content has: ml-[200px]
Bottom tab bar: HIDDEN
Mobile (< lg):
Sidebar is HIDDEN completely
Main content has: ml-0, pb-16 (padding bottom so content doesn't hide behind tab bar)
Bottom tab bar: FIXED at bottom, full width, height 64px, dark background #111111
// DashboardLayout.tsx structure
<div className="min-h-screen bg-gray-50">
  
  {/* Sidebar — desktop only */}
  <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[200px] 
                    bg-white border-r border-gray-100 z-40">
    <Sidebar />
  </aside>

  {/* Top bar — always visible */}
  <header className="fixed top-0 right-0 left-0 lg:left-[200px] h-14 
                     bg-white border-b border-gray-200 z-30">
    <TopBar />
  </header>

  {/* Main content */}
  <main className="pt-14 lg:ml-[200px] pb-16 lg:pb-0 min-h-screen">
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
      {children}
    </div>
  </main>

  {/* Bottom tab bar — mobile only */}
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 
                  bg-[#111111] z-40 flex items-center justify-around px-4">
    <BottomTabBar />
  </nav>

</div>


COMPONENT-BY-COMPONENT MOBILE SPEC
1. TopBar
Desktop:
Left: back arrow + breadcrumb icon + "Assignment" text
Right: bell icon + avatar + name + chevron
Mobile:
Left: VedaAI logo (icon + text)
Right: bell icon + avatar + hamburger menu (lucide Menu icon)
No breadcrumb text on mobile
Teacher name hidden on mobile
<header>
  <div className="flex items-center justify-between h-14 px-4">
    
    {/* Left — logo on mobile, breadcrumb on desktop */}
    <div className="flex items-center gap-2">
      <span className="lg:hidden"><VedaLogo /></span>
      <span className="hidden lg:flex items-center gap-2 text-gray-500 text-sm">
        <ChevronLeft size={16} />
        <LayoutGrid size={14} />
        Assignment
      </span>
    </div>

    {/* Right */}
    <div className="flex items-center gap-3">
      <button className="relative">
        <Bell size={20} className="text-gray-500" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-brand-orange rounded-full" />
      </button>
      <img className="w-8 h-8 rounded-full" src={avatarUrl} />
      {/* Name — desktop only */}
      <span className="hidden lg:block text-sm font-medium text-gray-900">John Doe</span>
      <ChevronDown size={14} className="hidden lg:block text-gray-500" />
      {/* Hamburger — mobile only */}
      <button className="lg:hidden">
        <Menu size={20} className="text-gray-500" />
      </button>
    </div>

  </div>
</header>


2. Bottom Tab Bar (mobile only)
4 tabs: Home, Assignments, Library, AI Toolkit Active tab: white icon + white text + small white dot above Inactive tab: gray-400 icon + gray-400 text
// BottomTabBar.tsx
const tabs = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Assignments', icon: FileText, href: '/assignments' },
  { label: 'Library', icon: BookOpen, href: '/library' },
  { label: 'AI Toolkit', icon: Wand2, href: '/toolkit' },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <>
      {tabs.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href}
            className="flex flex-col items-center gap-1 flex-1">
            {/* Active indicator dot */}
            <span className={`w-1 h-1 rounded-full mb-0.5 
              ${active ? 'bg-white' : 'bg-transparent'}`} />
            <tab.icon size={20} 
              className={active ? 'text-white' : 'text-gray-400'} />
            <span className={`text-[10px] 
              ${active ? 'text-white' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </>
  )
}


3. Assignments List Page
Desktop: 2-column card grid Mobile: 1-column card grid, filter bar stacks vertically
{/* Page header */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-1">
    <span className="w-2 h-2 rounded-full bg-green-500" />
    <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
  </div>
  <p className="text-sm text-gray-500">Manage and create assignments for your classes.</p>
</div>

{/* Filter bar — stacks on mobile */}
<div className="flex flex-col sm:flex-row gap-3 mb-6">
  <button className="flex items-center gap-2 text-sm text-gray-500">
    <SlidersHorizontal size={14} />
    Filter By
  </button>
  <div className="relative flex-1">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input className="w-full h-9 pl-8 pr-4 border border-gray-200 rounded-lg text-sm" 
           placeholder="Search Assignment" />
  </div>
</div>

{/* Grid — 2 col desktop, 1 col mobile */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
  {assignments.map(a => <AssignmentCard key={a._id} assignment={a} />)}
</div>

{/* Floating create button */}
<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-20">
  <button className="flex items-center gap-2 bg-[#111111] text-white 
                     text-sm font-medium px-5 py-2.5 rounded-full shadow-xl">
    <Plus size={16} />
    Create Assignment
  </button>
</div>

Note: bottom-20 on mobile (above the tab bar), bottom-6 on desktop.

4. Create Assignment Form
Desktop: form card centered with max-w-[600px] Mobile: form fills full width, question type rows stack
{/* Form wrapper */}
<div className="max-w-[600px] mx-auto w-full">

  {/* Step progress bar */}
  <div className="flex gap-2 mb-8">
    <div className={`h-[3px] flex-1 rounded-full 
      ${currentStep >= 1 ? 'bg-[#111111]' : 'bg-gray-200'}`} />
    <div className={`h-[3px] flex-1 rounded-full 
      ${currentStep >= 2 ? 'bg-[#111111]' : 'bg-gray-200'}`} />
  </div>

  {/* Form card */}
  <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:p-8">
    ...
  </div>

</div>

Question type row — stacks on mobile:
{/* Desktop: all inline. Mobile: dropdown full width, steppers below */}
<div className="border border-gray-200 rounded-lg p-3">
  
  {/* Row 1: dropdown + delete button */}
  <div className="flex items-center gap-2 mb-3 lg:mb-0">
    <select className="flex-1 lg:w-[45%] h-9 border border-gray-200 
                       rounded-lg px-3 text-sm">
      {questionTypeOptions.map(opt => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
    <button onClick={() => removeRow(row.id)}>
      <X size={14} className="text-gray-400" />
    </button>
  </div>

  {/* Row 2 on mobile, inline on desktop */}
  <div className="flex items-center gap-4 lg:ml-auto">
    <div className="flex-1 lg:flex-none">
      <p className="text-xs text-gray-500 mb-1 lg:hidden">No. of Questions</p>
      <Stepper value={row.count} onChange={v => updateRow(row.id, 'count', v)} />
    </div>
    <div className="flex-1 lg:flex-none">
      <p className="text-xs text-gray-500 mb-1 lg:hidden">Marks</p>
      <Stepper value={row.marksEach} onChange={v => updateRow(row.id, 'marksEach', v)} />
    </div>
  </div>

</div>

Navigation buttons — full width on mobile:
<div className="flex gap-3 mt-6">
  <button className="flex-1 lg:flex-none lg:w-auto h-10 border border-gray-300 
                     rounded-lg text-sm font-medium text-gray-900 px-6">
    ← Previous
  </button>
  <button className="flex-1 lg:flex-none lg:w-auto h-10 bg-[#111111] 
                     rounded-lg text-sm font-medium text-white px-6 ml-auto">
    Next →
  </button>
</div>


5. Output Page
Desktop: dark banner + white paper card, max-w-[720px], generous padding Mobile: same structure, reduced padding, font sizes scale down
<div className="max-w-[720px] mx-auto w-full">

  {/* Dark banner */}
  <div className="bg-[#1A1A1A] rounded-t-xl p-4 lg:p-6">
    <p className="text-white text-sm leading-relaxed mb-3">
      Certainly, Lakshya! Here are customized Question Paper...
    </p>
    <button className="flex items-center gap-2 border border-white/30 
                       text-white text-xs font-medium px-3 py-2 rounded-lg">
      <Download size={13} />
      Download as PDF
    </button>
  </div>

  {/* Exam paper */}
  <div className="bg-white border border-gray-200 rounded-b-xl 
                  px-4 py-6 lg:px-12 lg:py-10">
    
    {/* School header */}
    <h1 className="text-lg lg:text-2xl font-bold text-center text-gray-900">
      Delhi Public School, Bokaro
    </h1>
    <p className="text-sm lg:text-base text-center text-gray-700 mt-1">
      Subject: English
    </p>
    <p className="text-sm lg:text-base text-center text-gray-700">
      Class: 5th
    </p>

    <hr className="border-gray-200 my-4" />

    {/* Time + Marks row */}
    <div className="flex justify-between text-xs lg:text-sm text-gray-900">
      <span>Time Allowed: 45 minutes</span>
      <span>Maximum Marks: 20</span>
    </div>

    <hr className="border-gray-200 my-4" />

    {/* Instructions */}
    <p className="text-xs lg:text-sm font-medium text-gray-900 mb-4">
      All questions are compulsory unless stated otherwise.
    </p>

    {/* Student info */}
    <div className="space-y-2 mb-6">
      <p className="text-xs lg:text-sm text-gray-900">
        Name: <span className="inline-block w-32 lg:w-48 border-b border-gray-900 ml-1" />
      </p>
      <p className="text-xs lg:text-sm text-gray-900">
        Roll Number: <span className="inline-block w-24 lg:w-36 border-b border-gray-900 ml-1" />
      </p>
      <p className="text-xs lg:text-sm text-gray-900">
        Class/Section: <span className="inline-block w-20 lg:w-28 border-b border-gray-900 ml-1" />
      </p>
    </div>

    <hr className="border-gray-200 mb-6" />

    {/* Sections */}
    {paper.sections.map(section => (
      <SectionBlock key={section.id} section={section} />
    ))}

    <hr className="border-gray-200 my-6" />
    <p className="text-sm font-semibold text-gray-900">End of Question Paper</p>

  </div>
</div>

Question item — difficulty badge and marks wrap on mobile:
<div className="flex items-start gap-2 py-2">
  <span className="text-sm text-gray-900 min-w-[1.5rem]">{question.id}.</span>
  <div className="flex-1">
    <div className="flex flex-wrap items-start gap-2">
      <DifficultyBadge difficulty={question.difficulty} />
      <p className="text-sm text-gray-900 flex-1 min-w-[200px]">
        {question.text}
      </p>
      <span className="text-xs text-gray-500 whitespace-nowrap ml-auto">
        [{question.marks} Marks]
      </span>
    </div>
    {question.options && (
      <div className="grid grid-cols-2 gap-1 mt-2 ml-0">
        {question.options.map((opt, i) => (
          <span key={i} className="text-sm text-gray-900">
            ({String.fromCharCode(97 + i)}) {opt}
          </span>
        ))}
      </div>
    )}
  </div>
</div>


6. Generating / Loading Page
Same on all screen sizes — just a centered loading state:
<div className="min-h-screen flex items-center justify-center px-4">
  <div className="text-center max-w-sm w-full">
    <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-orange 
                    rounded-full animate-spin mx-auto mb-6" />
    <h2 className="text-lg font-semibold text-gray-900 mb-2">
      Generating your assessment
    </h2>
    <p className="text-sm text-gray-500">{statusMessage}</p>
    <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5">
      <div className="bg-brand-orange h-1.5 rounded-full transition-all duration-500"
           style={{ width: `${progress}%` }} />
    </div>
  </div>
</div>


7. Empty State (Zero state)
Same layout on all screens, just padding changes:
<div className="flex flex-col items-center justify-center 
                min-h-[60vh] text-center px-4">
  
  {/* Illustration — use Lucide SearchX in a circle */}
  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gray-100 
                  flex items-center justify-center mb-6">
    <SearchX size={40} className="text-gray-400" />
  </div>

  <h2 className="text-lg font-semibold text-gray-900 mb-2">
    No assignments yet
  </h2>
  <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed mb-6">
    Create your first assignment to start collecting and grading student submissions.
  </p>
  <button className="flex items-center gap-2 bg-[#111111] text-white 
                     text-sm font-medium px-5 py-2.5 rounded-lg">
    <Plus size={16} />
    Create Your First Assignment
  </button>

</div>


WHAT TO ADD TO EVERY STEP PROMPT 
At the end of every step prompt you give , add this line:
Also apply mobile responsive classes throughout:
- Sidebar hidden on mobile (lg:flex hidden), bottom tab bar visible only on mobile (lg:hidden)
- Main content ml-[200px] on lg+, ml-0 on mobile with pb-16 for tab bar
- Cards single column on mobile (grid-cols-1 lg:grid-cols-2)
- Form question type rows stack on mobile (flex-col lg:flex-row)
- Floating button bottom-20 on mobile (above tab bar), bottom-6 on desktop
- Reduced padding on mobile (px-4 lg:px-12) for paper and cards
Reference the mobile column in docs/screenshots/ for exact visual target.

That one paragraph added to each step prompt is all you need.

QUICK REFERENCE — MOST USED RESPONSIVE PATTERNS
Sidebar visible:          hidden lg:flex
Bottom tab bar:           lg:hidden fixed bottom-0
Main content offset:      lg:ml-[200px]
Main content padding:     pb-16 lg:pb-0
Grid columns:             grid-cols-1 lg:grid-cols-2
Floating btn position:    bottom-20 lg:bottom-6
Paper padding:            px-4 py-6 lg:px-12 lg:py-10
Form card padding:        p-5 lg:p-8
Question row layout:      flex-col lg:flex-row
Font size scale:          text-lg lg:text-2xl (school name)
                          text-xs lg:text-sm (meta text)
Nav name visible:         hidden lg:block
Hamburger visible:        lg:hidden

















