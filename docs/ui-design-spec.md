# Kulto — UI Design Spec

**Created:** 2026-03-23
**Aesthetic:** Clean / minimal — light, modern, frictionless
**Approach:** Mobile-first, responsive to desktop
**Primary user flow:** Browse events → express interest → receive match → confirm → see outing

---

## Design Tokens

### Colors

```
Background:     #FFFFFF  (white)
Surface:        #F7F7F5  (off-white, cards + inputs)
Border:         #E8E8E4  (subtle dividers)
Text Primary:   #111111  (near-black)
Text Secondary: #6B6B6B  (muted labels, metadata)
Text Disabled:  #B0B0AA

Accent:         #2D2DFF  (electric blue — CTAs, active states)
Accent Light:   #EBEBFF  (accent tint — selected states, badges)
Danger:         #E53E3E  (destructive actions, errors)
Success:        #38A169  (confirmations)

Category Colors (subtle chips):
  Cinema:       #FFF3E0 / #E65100
  Concert:      #F3E5F5 / #7B1FA2
  Exhibition:   #E8F5E9 / #2E7D32
  Theatre:      #E3F2FD / #1565C0
  Festival:     #FCE4EC / #C62828
```

### Typography

```
Font family:    Inter (system fallback: -apple-system, sans-serif)

Display:        32px / 700 / -0.5px tracking
Title:          20px / 600 / -0.25px tracking
Body:           15px / 400 / 0
Body Small:     13px / 400 / 0
Label:          12px / 500 / +0.5px tracking / uppercase
Caption:        11px / 400 / text-secondary
```

### Spacing

```
Base unit: 4px
xs:  4px    sm:  8px    md: 16px
lg: 24px    xl: 32px   2xl: 48px
```

### Radius & Elevation

```
Card:    12px radius, box-shadow: 0 1px 3px rgba(0,0,0,0.06)
Button:  8px radius
Input:   8px radius
Chip:    99px radius (pill)
Modal:   16px radius
```

---

## Components

### Button

```
Primary:    bg #2D2DFF, text white, 44px height, padding 0 20px
Secondary:  bg #F7F7F5, text #111, border #E8E8E4
Ghost:      no bg, text #2D2DFF, no border
Danger:     bg #E53E3E, text white
Disabled:   opacity 40%

States: hover (8% darker bg), active (scale 0.97), loading (spinner replaces label)
```

### Card (Event)

```
┌─────────────────────────────────────┐
│  [Event image — 16:9 ratio]         │
│                                     │
├─────────────────────────────────────┤
│  ● CINEMA                    €12.00 │  ← category chip + price
│  Dune: Part Two                     │  ← title (16px/600)
│  MK2 Bibliothèque · Mar 28          │  ← venue + date (13px/secondary)
└─────────────────────────────────────┘
```

### Chip / Tag

```
Taste tag:   bg #EBEBFF, text #2D2DFF, 11px uppercase, pill shape
Category:    bg [category color], pill shape
Interest:    "I want to go" — ghost → filled on select
```

### Avatar

```
Sizes: 32px (list), 48px (card), 72px (profile header)
Fallback: initials on #F7F7F5 background
Shape: circle
```

### Match Score Badge

```
┌──────────┐
│  87% ★   │  bg #EBEBFF, text #2D2DFF, 12px/600
└──────────┘
```

---

## Screens

---

### 1. Event Discovery (Homepage)

**The most important screen.** Clean browsing experience — filter bar at top, event cards in grid.

```
┌────────────────────────────────────┐
│  kulto              [avatar] [⚙]   │  ← top bar (40px)
├────────────────────────────────────┤
│  What's on in [Paris ▾]            │  ← city selector, 20px/600
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🔍  Search events...         │  │  ← search input
│  └──────────────────────────────┘  │
│                                    │
│  All  Cinema  Concert  Exhib  More │  ← horizontal scroll tabs
│       ────                         │    active: underline + #2D2DFF
│                                    │
│  Sat Mar 28  ──  Sun Mar 29  ──    │  ← date quick-filters (chips)
│                                    │
│  ┌──────────┐  ┌──────────┐        │
│  │ [image]  │  │ [image]  │        │  ← 2-col grid (mobile)
│  │ ● CINEMA │  │ ● CONCERT│        │
│  │ Dune Pt2 │  │ Bon Iver │        │
│  │ MK2 Bib  │  │ Zenith   │        │
│  │ Mar 28   │  │ Mar 29   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ [image]  │  │ [image]  │        │
│  │ ● EXHIB  │  │ ● THEATRE│        │
│  │ Cartier  │  │ Comédie  │        │
│  │ Grand    │  │ Française│        │
│  │ Apr 2    │  │ Apr 5    │        │
│  └──────────┘  └──────────┘        │
│                                    │
│           [Load more]              │
│                                    │
├────────────────────────────────────┤
│  [🎭 Discover] [♥ Outings] [👤 Me] │  ← bottom nav
└────────────────────────────────────┘
```

**Notes:**
- City selector opens a bottom sheet with recent cities + search
- Category tabs are horizontally scrollable; "All" is default
- Date chips: Today / This weekend / This week / Pick date
- Card tap → Event Detail screen
- No pagination text — infinite scroll with "Load more" button at end
- Empty state: "No events match your filters" + [Clear filters] button

---

### 2. Event Detail

**Where the user commits to going.** Full event info + prominent "I want to go" CTA.

```
┌────────────────────────────────────┐
│  ← Back                [Share ↗]  │  ← nav bar
│                                    │
│  ┌────────────────────────────────┐│
│  │                                ││
│  │      [Event image — 3:2]       ││
│  │                                ││
│  └────────────────────────────────┘│
│                                    │
│  ● CINEMA                          │  ← category chip
│  Dune: Part Two                    │  ← 24px/700
│                                    │
│  📅  Saturday, March 28 at 8:00pm  │
│  📍  MK2 Bibliothèque, Paris 13e   │
│  💶  €12.00                        │
│                                    │
│  ──────────────────────────────    │
│                                    │
│  About                             │  ← 16px/600
│  A cinematic epic. Denis           │
│  Villeneuve's sequel...            │
│  [Read more]                       │
│                                    │
│  ──────────────────────────────    │
│                                    │
│  Tags                              │
│  [sci-fi] [epic] [visually        │
│   stunning] [IMAX available]       │
│                                    │
│  ──────────────────────────────    │
│                                    │
│  3 people want to go               │  ← social proof (count only, no names)
│                                    │
│  ┌────────────────────────────────┐│
│  │    ♥  I want to go             ││  ← PRIMARY CTA, full width, #2D2DFF
│  └────────────────────────────────┘│
│                                    │
│  [View on official site ↗]         │  ← ghost button
│                                    │
└────────────────────────────────────┘
```

**States of "I want to go" button:**
- Default: outlined/ghost, "♥ I want to go"
- Active (already expressed interest): filled #2D2DFF, "♥ You want to go — waiting for a match"
- Matched: replaced by → "You're matched! View your outing →"

**Notes:**
- Tapping "I want to go" while logged out → redirects to Login with return URL
- "3 people want to go" — shows count only, not who (privacy)

---

### 3. Match Proposal

**The decisive moment.** User sees who they're matched with and the event. Accept or pass.

```
┌────────────────────────────────────┐
│              Matches               │  ← screen title, centered
│                                    │
│  ──────────────────────────────    │
│                                    │
│  You have a match!                 │  ← 20px/600
│  For an event you wanted to go to  │  ← secondary text
│                                    │
│  ┌────────────────────────────────┐│
│  │                                ││
│  │         [Event image]          ││  ← event card (compact)
│  │  ● CINEMA  ·  March 28         ││
│  │  Dune: Part Two                ││
│  │  MK2 Bibliothèque              ││
│  └────────────────────────────────┘│
│                                    │
│           meets                    │  ← centered, secondary, 13px
│                                    │
│  ┌────────────────────────────────┐│
│  │  [Avatar 72px]                 ││
│  │  Camille, 26                   ││  ← name + age
│  │                                ││
│  │  [sci-fi]  [arthouse]          ││  ← her taste tags
│  │  [world cinema]                ││
│  │                                ││
│  │  "I love discovering films     ││  ← bio, truncated to 2 lines
│  │   outside the mainstream..."   ││
│  │                                ││
│  │  ┌──────────┐                  ││
│  │  │  87% ★   │ taste match      ││  ← compatibility score
│  │  └──────────┘                  ││
│  └────────────────────────────────┘│
│                                    │
│  ┌──────────┐    ┌───────────────┐ │
│  │  ✕ Pass  │    │  ✓  Accept   │ │  ← two buttons, equal width
│  └──────────┘    └───────────────┘ │
│  secondary         primary         │
│                                    │
│  This match expires in 23h 41m     │  ← countdown, caption style
│                                    │
└────────────────────────────────────┘
```

**Notes:**
- Match expires after 48h if not acted on
- After accept: shows pending state ("Waiting for Camille to accept...")
- After both accept: transitions to Outing Confirmed screen (see below)
- After pass: card dismissed with swipe-down animation, next match shown (or empty state)
- Showing age is optional (user can hide in settings)

---

### 3b. Outing Confirmed

**Shown immediately after mutual acceptance.** Moment of delight.

```
┌────────────────────────────────────┐
│                                    │
│                                    │
│           ✓                        │  ← large checkmark, #38A169, 64px
│                                    │
│      It's happening!               │  ← 24px/700, centered
│  You and Camille are going to      │  ← secondary text
│  Dune: Part Two                    │
│                                    │
│  ┌────────────────────────────────┐│
│  │  📅  Saturday, March 28        ││
│  │  📍  MK2 Bibliothèque          ││
│  │  💶  €12.00                    ││
│  └────────────────────────────────┘│
│                                    │
│  See you there!                    │  ← caption, centered
│                                    │
│  ┌────────────────────────────────┐│
│  │     View my outings            ││  ← primary CTA
│  └────────────────────────────────┘│
│                                    │
│  [Back to events]                  │  ← ghost link
│                                    │
└────────────────────────────────────┘
```

---

### 4. My Outings

**Upcoming confirmed outings.** Simple list.

```
┌────────────────────────────────────┐
│  kulto              [avatar] [⚙]   │
├────────────────────────────────────┤
│  My Outings                        │  ← 20px/700
│                                    │
│  Upcoming ──────────────────────   │  ← section label
│                                    │
│  ┌────────────────────────────────┐│
│  │  [img]  Dune: Part Two         ││
│  │  56px   Saturday, March 28     ││  ← thumbnail + info
│  │         MK2 Bibliothèque       ││
│  │         with  [●] Camille      ││  ← avatar (24px) + name
│  └────────────────────────────────┘│
│                                    │
│  ┌────────────────────────────────┐│
│  │  [img]  Bon Iver               ││
│  │         Sunday, March 29       ││
│  │         Zenith                 ││
│  │         with  [●] Thomas       ││
│  └────────────────────────────────┘│
│                                    │
│  ──────────────────────────────    │
│                                    │
│  Waiting for a match ───────────   │  ← section label
│                                    │
│  ┌────────────────────────────────┐│
│  │  [img]  Cartier Exhibition     ││
│  │         April 2 · Grand Palais ││
│  │         ○ Finding your match..  ││  ← pending state, muted
│  └────────────────────────────────┘│
│                                    │
│                                    │
│                                    │
├────────────────────────────────────┤
│  [🎭 Discover] [♥ Outings] [👤 Me] │
└────────────────────────────────────┘
```

**Empty state:**

```
│                                    │
│       [illustration: two           │
│        empty chairs]               │
│                                    │
│   No outings yet                   │  ← 16px/600
│   Express interest in events       │  ← secondary text
│   to get matched                   │
│                                    │
│   [Discover events]                │  ← primary CTA
│                                    │
```

---

### 5. Profile & Taste Setup (Onboarding)

**Multi-step onboarding after registration.** 3 steps shown as progress dots.

#### Step 1 — Basic info

```
┌────────────────────────────────────┐
│  ← Back                  1 of 3   │
├────────────────────────────────────┤
│                                    │
│  Tell us about you                 │  ← 22px/700
│                                    │
│  ┌──────────────────────────────┐  │
│  │  [Avatar upload circle]      │  │  ← tap to upload photo
│  │        + Add photo           │  │
│  └──────────────────────────────┘  │
│                                    │
│  Name                              │
│  ┌──────────────────────────────┐  │
│  │  Camille                     │  │
│  └──────────────────────────────┘  │
│                                    │
│  Your outing vibe (optional)       │
│  ┌──────────────────────────────┐  │
│  │  I love discovering films    │  │  ← textarea, max 300 chars
│  │  outside the mainstream...   │  │    char counter bottom right
│  │                         47 / 300 │
│  └──────────────────────────────┘  │
│                                    │
│  ┌────────────────────────────────┐│
│  │          Continue →            ││
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

#### Step 2 — Cultural interests

```
┌────────────────────────────────────┐
│  ← Back                  2 of 3   │
├────────────────────────────────────┤
│                                    │
│  What are you into?                │  ← 22px/700
│  Pick at least 3                   │  ← secondary
│                                    │
│  Categories                        │  ← label
│  ┌──────────┐ ┌──────────┐         │
│  │ 🎬 Cinema│ │ 🎵 Concert│        │  ← selectable tiles, 2-col
│  │ selected │ │          │         │    selected: accent border + bg tint
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ 🖼 Exhib │ │ 🎭 Theatre│        │
│  │ selected │ │ selected  │        │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐                      │
│  │ 🎪 Festival│                    │
│  └──────────┘                      │
│                                    │
│  Genre / taste tags                │  ← label
│  ┌──────────────────────────────┐  │
│  │ 🔍  Add a tag (sci-fi, jazz..│  │  ← tag input with autocomplete
│  └──────────────────────────────┘  │
│  [sci-fi ×]  [arthouse ×]          │
│  [world cinema ×]                  │
│                                    │
│  ┌────────────────────────────────┐│
│  │          Continue →            ││
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

#### Step 3 — Location

```
┌────────────────────────────────────┐
│  ← Back                  3 of 3   │
├────────────────────────────────────┤
│                                    │
│  Where are you based?              │  ← 22px/700
│                                    │
│  City                              │
│  ┌──────────────────────────────┐  │
│  │  Paris                       │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌────────────────────────────────┐│
│  │     Get started →              ││  ← primary CTA → goes to Discover
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

---

### 6. Auth Screens

#### Login

```
┌────────────────────────────────────┐
│                                    │
│            kulto                   │  ← logo, centered, 28px/700
│                                    │
│  ──────────────────────────────    │
│                                    │
│  Welcome back                      │  ← 22px/600
│                                    │
│  Email                             │
│  ┌──────────────────────────────┐  │
│  │  you@example.com             │  │
│  └──────────────────────────────┘  │
│                                    │
│  Password                          │
│  ┌──────────────────────────────┐  │
│  │  ••••••••••         [show]   │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Forgot password?]                │  ← right-aligned, ghost link
│                                    │
│  ┌────────────────────────────────┐│
│  │           Log in               ││
│  └────────────────────────────────┘│
│                                    │
│  ──────── or ────────              │
│                                    │
│  Don't have an account?            │
│  [Create one]                      │  ← accent link
│                                    │
└────────────────────────────────────┘
```

---

## Navigation Structure

```
App Shell
├── /discover              ← Event Discovery (default tab)
├── /events/:id            ← Event Detail (pushed on stack)
├── /outings               ← My Outings (tab)
│   └── /outings/:id       ← Outing detail (future)
├── /matches               ← Match Proposals (badge on Outings tab when pending)
├── /profile               ← My Profile (tab "Me")
│   └── /profile/edit      ← Edit profile
├── /onboarding            ← Post-registration flow (steps 1–3)
├── /login                 ← Auth
└── /register              ← Auth

Bottom nav tabs: Discover | Outings | Me
Match proposals: accessible via Outings tab badge (red dot when pending)
```

---

## Key Interaction Notes

- **Match notification:** A red badge on the Outings tab indicates pending match proposals. Tapping it opens the match proposal screen.
- **"I want to go" persistence:** Stored per user+event. Shows across sessions.
- **Match expiry:** 48h countdown shown on match card. Expired matches auto-dismissed.
- **No empty grid cells:** If odd number of events, last card spans full width.
- **Loading skeleton:** Cards show skeleton (grey pulse) while loading — never a spinner over blank space.
- **Pull to refresh:** Supported on Event Discovery and My Outings.

---
*UI Spec created: 2026-03-23*
