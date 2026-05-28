
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
●  Left: back arrow + breadcrumb icon + "Assignment" text 
●  Right: bell icon + avatar + name + chevron 
Mobile: 
●  Left: VedaAI logo (icon + text) 
●  Right: bell icon + avatar + hamburger menu (lucide Menu icon) 
●  No breadcrumb text on mobile 
●  Teacher name hidden on mobile 
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
4 tabs: Home, Assignments, Library, AI Toolkit Active tab: white icon + white text + small white 
dot above Inactive tab: gray-400 icon + gray-400 text 
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
Desktop: form card centered with max-w-[600px] Mobile: form fills full width, question type rows 
stack 
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
Desktop: dark banner + white paper card, max-w-[720px], generous padding Mobile: same 
structure, reduced padding, font sizes scale down 
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
        Roll Number: <span className="inline-block w-24 lg:w-36 border-b border-gray-900 ml-1" 
/> 
      </p> 
      <p className="text-xs lg:text-sm text-gray-900"> 
        Class/Section: <span className="inline-block w-20 lg:w-28 border-b border-gray-900 
ml-1" /> 
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
At the end of every step prompt you give Claude Code, add this line: 
Also apply mobile responsive classes throughout: 
- Sidebar hidden on mobile (lg:flex hidden), bottom tab bar visible only on mobile (lg:hidden) 
- Main content ml-[200px] on lg+, ml-0 on mobile with pb-16 for tab bar 
- Cards single column on mobile (grid-cols-1 lg:grid-cols-2) 
- Form question type rows stack on mobile (flex-col lg:flex-row) 
- Floating button bottom-20 on mobile (above tab bar), bottom-6 on desktop 
- Reduced padding on mobile (px-4 lg:px-12) for paper and cards 
Reference the mobile column in docs/screenshots/ for exact visual target. 
 
That one paragraph added to each step prompt is all you need. 
 
QUICK REFERENCE — MOST USED RESPONSIVE 
PATTERNS 
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