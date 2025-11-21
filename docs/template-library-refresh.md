# Template Library Refresh – Reference Steps

## Step 1 – Hero + Filters
- Replace the current utilitarian header with a “Browse Templates” hero section.
- Add playful copy, emoji, and a dedicated search bar.
- Introduce a sticky pill bar for category filters (All, Productivity, Creativity, etc.) with icons and active states.

## Step 2 – Curated Sections
- Break the catalog into curated rows such as “Community Favorites”, “Trending Now”, and “Fresh Drops”.
- Drive each section from Supabase (popularity, recent imports) and display badges like “Popular” or “Trending”.
- Keep cards within each section to three/four per row for better scanability.

## Step 3 – CTA + Storytelling Blocks
- Insert a mid-page “How it works” strip (Step 1 Pick, Step 2 Remix, Step 3 Ship, Step 4 Share).
- End the page with a high-impact CTA banner (“Let’s make something sick 🚀”) linking to the build/workbench experience.
- Optionally add a “Get Some Inspo” block that links common prompts directly into the builder.

## Step 4 – Visual Polish on Cards
- Standardize card anatomy: large icon/emoji circle, title, summary, tags, and dual CTAs (`Preview`, `Remix`).
- Surface metadata badges (Popular, Trending) in the card corner.
- Store lightweight icon/emoji references for each template (Supabase `hero_image` or a new `emoji` field) to keep the grid visually distinctive.
