export const TEMPLATE_COLLECTIONS = [
  {
    id: 'everyday-organisers',
    title: 'Everyday Organisers',
    description: 'Lightweight tools that keep home and personal routines on track.',
    templates: [
      {
        id: 'weekly-meal-planner',
        title: 'Weekly Meal Planner',
        summary: 'Plan dinners for the week, keep a running grocery list, and mark leftovers.',
        prompt:
          'Create a weekly meal planner where I can drag meals between days, tap to mark leftovers, and keep a grocery list that automatically groups items.',
        audience: ['Family', 'Phone-friendly'],
        tags: ['planning', 'family'],
        popularity: 920,
        preview: {
          html: `<section class="planner">
  <header>
    <h1>Weekly Meal Planner</h1>
    <p>Tap any slot to add a meal. Leftovers stay highlighted.</p>
  </header>
  <div class="grid">
    <div class="day" data-day="Mon">
      <h2>Mon</h2>
      <button class="slot">Add meal</button>
    </div>
    <div class="day" data-day="Tue">
      <h2>Tue</h2>
      <button class="slot completed">Leftovers</button>
    </div>
    <div class="day" data-day="Wed">
      <h2>Wed</h2>
      <button class="slot">Add meal</button>
    </div>
  </div>
</section>`,
          css: `.planner{font-family:var(--font-sans, 'Segoe UI', sans-serif);padding:1.5rem;background:rgba(15,23,42,.05);border-radius:1.25rem}
.planner header{display:flex;flex-direction:column;gap:.35rem;margin-bottom:1rem}
.planner h1{font-size:1.25rem;margin:0;color:#0f172a}
.planner p{margin:0;color:#475569;font-size:.9rem}
.planner .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem}
.planner .day{display:flex;flex-direction:column;gap:.5rem;padding:1rem;border-radius:1rem;background:white;box-shadow:0 12px 24px -18px rgba(15,23,42,.3)}
.planner .day h2{margin:0;color:#0f172a;font-size:1rem}
.planner .slot{border:1px dashed rgba(15,23,42,.2);background:rgba(94,234,212,.08);color:#0f172a;padding:.65rem;border-radius:.75rem;font-size:.9rem;cursor:pointer}
.planner .slot.completed{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.6);color:#047857}`,
          js: ''
        },
        quickTweaks: [
          'Add a breakfast column',
          'Include calorie totals per day',
          'Let me export the grocery list'
        ]
      },
      {
        id: 'budget-tracker',
        title: 'Simple Budget Tracker',
        summary:
          'Track weekly spending with coloured categories and a gentle reminder when you get close to limits.',
        prompt:
          'Build a weekly budget tracker with a category list, simple charts, and alerts when I am within 10% of my limit.',
        audience: ['Money', 'Phone-friendly'],
        tags: ['finance'],
        popularity: 810,
        preview: {
          html: `<div class="budget">
  <h1>Weekly Budget</h1>
  <ul>
    <li><span>Groceries</span><strong>$68</strong></li>
    <li class="warn"><span>Transport</span><strong>$42</strong></li>
    <li><span>Eating out</span><strong>$25</strong></li>
  </ul>
  <footer>Transport is almost at your limit.</footer>
</div>`,
          css: `.budget{padding:1.5rem;border-radius:1.25rem;background:linear-gradient(135deg,#0ea5e9,#22d3ee);color:white;font-family:var(--font-sans,'Segoe UI',sans-serif)}
.budget h1{margin-top:0;font-size:1.3rem}
.budget ul{list-style:none;margin:1rem 0;padding:0;display:flex;flex-direction:column;gap:.75rem}
.budget li{display:flex;justify-content:space-between;background:rgba(255,255,255,.12);border-radius:.75rem;padding:.8rem 1rem;font-size:.95rem}
.budget li.warn{background:rgba(250,204,21,.2);color:#134e4a}
.budget footer{font-size:.9rem;margin-top:1rem;background:rgba(255,255,255,.15);padding:.75rem;border-radius:.75rem}`,
          js: ''
        },
        quickTweaks: ['Add pie chart view', 'Share with my partner', 'Set monthly goals']
      }
    ]
  },
  {
    id: 'teams-and-projects',
    title: 'Teams & Projects',
    description: 'Collaborative helpers for busy groups and small businesses.',
    templates: [
      {
        id: 'daily-standup',
        title: 'Daily Stand-up Board',
        summary:
          'Capture yesterday, today, and blockers for each teammate with one tap reminders.',
        prompt:
          'Create a daily stand-up board where teammates add cards for yesterday, today, and blockers. Include a “gentle reminder” button that sends email summaries.',
        audience: ['Team', 'Desktop'],
        tags: ['work', 'collaboration'],
        popularity: 1140,
        preview: {
          html: `<div class="standup">
  <header>
    <h1>Team Stand-up</h1>
    <button>Send gentle reminder</button>
  </header>
  <section class="columns">
    <article>
      <h2>Yesterday</h2>
      <div class="card">Polished onboarding screen</div>
      <div class="card">Reviewed accessibility notes</div>
    </article>
    <article>
      <h2>Today</h2>
      <div class="card">Write release email</div>
    </article>
    <article>
      <h2>Blockers</h2>
      <div class="card empty">No blockers logged</div>
    </article>
  </section>
</div>`,
          css: `.standup{padding:1.5rem;border-radius:1.25rem;background:#0f172a;color:#e2e8f0;font-family:var(--font-sans,'Segoe UI',sans-serif)}
.standup header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}
.standup h1{margin:0;font-size:1.4rem}
.standup button{background:#22d3ee;color:#0f172a;border:none;border-radius:999px;padding:.55rem 1.25rem;font-weight:600}
.columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.columns h2{margin-bottom:.75rem;font-size:1rem;color:#bae6fd}
.card{padding:1rem;border-radius:.9rem;background:rgba(30,41,59,.8);box-shadow:0 12px 24px -18px rgba(15,23,42,.6)}
.card.empty{opacity:.65;font-style:italic}`,
          js: ''
        },
        quickTweaks: ['Add reactions to cards', 'Export notes to CSV', 'Schedule automatic reminder']
      },
      {
        id: 'client-intake',
        title: 'Client Intake Checklist',
        summary: 'Step-by-step capture of new client info with progress tracker.',
        prompt:
          'Design a client intake checklist with progress tracking, required document upload steps, and a final review summary.',
        audience: ['Business', 'Desktop'],
        tags: ['work', 'forms'],
        popularity: 980,
        preview: {
          html: `<div class="intake">
  <aside>
    <h2>Progress</h2>
    <ol>
      <li class="done">Welcome</li>
      <li class="active">Contact details</li>
      <li>Project scope</li>
      <li>Final review</li>
    </ol>
  </aside>
  <main>
    <h1>Contact details</h1>
    <label>Name<input placeholder="Full name"/></label>
    <label>Email<input placeholder="Best email"/></label>
    <label>Preferred meeting time<select><option>Morning</option><option>Afternoon</option></select></label>
    <button>Save and continue</button>
  </main>
</div>`,
          css: `.intake{display:grid;grid-template-columns:200px 1fr;gap:1.5rem;padding:1.5rem;border-radius:1.25rem;background:white;box-shadow:0 20px 40px -32px rgba(15,23,42,.6);font-family:var(--font-sans,'Segoe UI',sans-serif)}
.intake aside{background:rgba(14,165,233,.08);padding:1rem;border-radius:1rem}
.intake h2{margin-top:0;font-size:1rem;color:#0369a1}
.intake ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem;font-size:.95rem}
.intake li{padding:.6rem .8rem;border-radius:.75rem;background:rgba(255,255,255,.7)}
.intake li.done{background:rgba(16,185,129,.2);color:#047857}
.intake li.active{border:2px solid rgba(14,165,233,.6);background:white}
.intake main{display:flex;flex-direction:column;gap:.9rem}
.intake h1{margin:0;color:#0f172a;font-size:1.4rem}
.intake label{display:flex;flex-direction:column;gap:.35rem;color:#0f172a;font-size:.9rem}
.intake input,.intake select{padding:.65rem .75rem;border-radius:.65rem;border:1px solid rgba(148,163,184,.6)}
.intake button{align-self:flex-start;background:#0ea5e9;border:none;color:white;padding:.65rem 1.4rem;border-radius:999px;font-weight:600}`,
          js: ''
        },
        quickTweaks: ['Add e-signature step', 'Send confirmation email', 'Include invoice reminder']
      }
    ]
  },
  {
    id: 'personal-wellbeing',
    title: 'Personal Wellbeing',
    description: 'Gentle companions for habits, reflection, and self-care.',
    templates: [
      {
        id: 'mood-journal',
        title: 'Mood & Moments Journal',
        summary: 'Tap an emoji, add a quick note, and review your week at a glance.',
        prompt:
          'Create a phone-friendly mood journal with daily emojis, quick note fields, and a weekly trend chart.',
        audience: ['Wellbeing', 'Phone-friendly'],
        tags: ['journal'],
        popularity: 1320,
        preview: {
          html: `<div class="journal">
  <header>
    <h1>Today I feel…</h1>
    <div class="emojis">
      <button>😊</button><button>😐</button><button>😔</button><button>😴</button>
    </div>
  </header>
  <textarea placeholder="Add a quick note about your day"></textarea>
  <footer>
    <p>This week: mostly bright, a little tired on Wed.</p>
  </footer>
</div>`,
          css: `.journal{padding:1.25rem;border-radius:1.4rem;background:linear-gradient(145deg,#f5f3ff,#e0f2fe);font-family:var(--font-sans,'Segoe UI',sans-serif);max-width:360px;margin:auto}
.journal header{display:flex;flex-direction:column;gap:.65rem}
.journal h1{margin:0;font-size:1.3rem;color:#312e81}
.journal .emojis{display:flex;gap:.5rem}
.journal button{font-size:1.4rem;border:none;background:white;padding:.6rem;border-radius:.85rem;box-shadow:0 12px 22px -18px rgba(49,46,129,.6)}
.journal textarea{margin-top:1rem;width:100%;min-height:100px;padding:.8rem;border-radius:1rem;border:1px solid rgba(49,46,129,.2);font-size:.95rem}
.journal footer{margin-top:1rem;font-size:.85rem;color:#475569}`,
          js: ''
        },
        quickTweaks: ['Add breathing exercise', 'Send nightly reminder', 'Export as PDF']
      }
    ]
  }
];

export function flattenTemplates(collections = TEMPLATE_COLLECTIONS) {
  return collections.flatMap((collection) =>
    collection.templates.map((template) => ({
      ...template,
      collectionId: collection.id,
      collectionTitle: collection.title
    }))
  );
}

export function getTemplateById(id, collections = TEMPLATE_COLLECTIONS) {
  return (
    collections
      .flatMap((collection) =>
        collection.templates.map((template) => ({
          ...template,
          collectionId: collection.id,
          collectionTitle: collection.title
        }))
      )
      .find((template) => template.id === id) || null
  );
}
