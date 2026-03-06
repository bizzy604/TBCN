# Brand Coach Network — Landing Page
## Engineering Spec & Design System for Claude Code

> **Objective:** Build a production-grade, single-page marketing landing page for The Brand Coach Network. This document contains every detail needed: story architecture, copy, component specs, design tokens, typography, layout, animations, and UX notes. Build this as a single `index.html` file or a Next.js/React app depending on the project setup.

---

## 1. Brand Foundation

| Property | Value |
|---|---|
| **Brand Name** | The Brand Coach Network |
| **Core Tagline** | *Everyone is a Brand™* |
| **Secondary Tagline** | *From Surviving Individuals to Thriving Brands™* |
| **Mission** | #ABillionLivesGlobally |
| **Tone** | Bold · Warm · Movement-driven · Cinematic |
| **Design Inspiration** | Nike (storytelling) + Apple (simplicity) + Cause-driven (community spotlighting) |

---

## 2. Design System

### 2.1 Color Tokens

```css
:root {
  --red:        #D0021B;   /* Primary accent — use surgically, not as backgrounds */
  --red-dim:    #9B0114;   /* Red hover/pressed state */
  --black:      #0A0A0A;   /* Primary background */
  --off-black:  #111111;   /* Alternate section background */
  --charcoal:   #1C1C1C;   /* Card backgrounds */
  --white:      #FAFAFA;   /* Primary text */
  --cream:      #F5F0E8;   /* Warm section background + italic accent text */
  --grey-muted: #6B6B6B;   /* Secondary body text, metadata */
  --grey-light: #E0DDD8;   /* Subtle borders on light sections */
}
```

**Color usage rules:**
- Red appears at points of emphasis only: one word in a headline, CTA buttons, active indicators, border-top hover effects
- Never use red as a section background fill
- Alternate sections: `--black` → `--off-black` → `--black` → `--cream` → `--black` → `--off-black` → `--black`
- The cream section (Act 4) is the only light section — it creates contrast rhythm in the scroll

### 2.2 Typography

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

--font-display: 'Cormorant Garamond', Georgia, serif;
--font-ui:      'Syne', sans-serif;
--font-body:    'DM Sans', sans-serif;
```

| Role | Font | Weight | Usage |
|---|---|---|---|
| Hero / Section Headlines | Cormorant Garamond | 300–700 | Emotional, editorial weight |
| Italic accents | Cormorant Garamond | 300–400 italic | Warmth, secondary emphasis |
| Navigation, labels, badges, CTAs | Syne | 700–800 | Sharp, modern, identity |
| Body copy, descriptions | DM Sans | 300–400 | Readable, warm, not clinical |

**Typography rules:**
- Hero display: `clamp(3.5rem, 8vw, 8rem)` — never fixed px for headlines
- Labels/eyebrows: `0.65rem`, `font-weight: 700`, `letter-spacing: 0.2em`, `text-transform: uppercase`
- Body: `0.88rem–1.05rem`, `font-weight: 300`, `line-height: 1.8–1.9`
- Short sentences. Line breaks used intentionally like breath pauses
- White space is not empty — it is intentional

### 2.3 Spacing Scale

```css
/* Sections */
padding: 8rem 4rem;     /* Standard section padding */
padding: 10rem 4rem;    /* Emphasis sections (Acts 3, 5, 6, 7) */
padding: 12rem 4rem;    /* Final CTA (Act 7) */

/* Mobile override */
@media (max-width: 900px) {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
```

### 2.4 Component Tokens

```css
/* Buttons */
.btn-primary {
  font-family: var(--font-ui);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--red);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-primary:hover {
  background: var(--red-dim);
  transform: translateY(-1px);
}

.btn-ghost {
  font-family: var(--font-ui);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: transparent;
  color: rgba(250,250,250,0.6);
  border: 1px solid rgba(250,250,250,0.18);
  padding: 1rem 2.5rem;
  transition: all 0.25s;
}
.btn-ghost:hover {
  color: var(--white);
  border-color: rgba(250,250,250,0.4);
}

/* Labels / Eyebrows */
.label {
  font-family: var(--font-ui);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--red);
}

/* Cards */
.card-base {
  background: var(--charcoal);
  border: 1px solid rgba(255,255,255,0.06);
  transition: border-color 0.3s, transform 0.3s;
}
.card-base:hover {
  border-color: rgba(208,2,27,0.4);
  transform: translateY(-3px);
}
```

### 2.5 Animation System

```css
/* Page load reveals (hero only) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scroll-triggered reveals (all other sections) */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger pattern for sibling reveals */
/* Apply transition-delay: 0.1s, 0.2s, 0.3s to siblings */

/* Pulse dot animation (Live community indicator) */
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(208,2,27,0.4); }
  50%       { opacity: 0.7; transform: scale(1.2); box-shadow: 0 0 0 6px rgba(208,2,27,0); }
}

/* Scroll line (hero scroll indicator) */
@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50%       { opacity: 1; transform: scaleY(1.1); }
}
```

**Scroll reveal JS (IntersectionObserver):**
```javascript
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));
```

---

## 3. Navigation

**Behaviour:** Fixed, transparent over hero. Gains `background: rgba(10,10,10,0.97)` and `border-bottom: 1px solid rgba(255,255,255,0.05)` on scroll past 60px.

**Layout:** `display: flex; justify-content: space-between; align-items: center;`
`padding: 1.5rem 4rem;`

**Left — Logo:**
- BCN logomark: `28×28px` red square, white text "BCN", `font: Syne 900 0.6rem`
- Brand name: `"The Brand Coach Network"` — Syne 800, 0.75rem, letter-spacing 0.12em

**Centre — Links (hide on mobile):**
Programs · Community · Coaches · Partners · About
Font: Syne 500, 0.7rem, letter-spacing 0.1em, `color: rgba(250,250,250,0.6)` → white on hover

**Right — CTA Button:**
`"Start Your Journey"` — `.btn-primary`

---

## 4. Page Structure — The 7-Act Story Arc

The page is divided into 7 acts. Each act is a full `<section>`. They alternate background colors to create visual rhythm as the user scrolls. This is a **story**, not a brochure.

```
Act 1 — The Mirror      bg: --black       (Hero)
Act 2 — The Wound       bg: --off-black   (Problem)
Act 3 — The Reframe     bg: --black       (Philosophy)
Act 4 — The Guide       bg: --cream       (Who We Are — only light section)
Act 5 — The Map         bg: --black       (Ecosystem Journey)
Act 6 — Community       bg: --off-black   (Social Proof)
Act 7 — The Call        bg: --black       (Final CTA)
Footer                  bg: --off-black
```

---

## 5. Act-by-Act Specifications

---

### ACT 1 — THE MIRROR (Hero)

**Purpose:** Make the visitor feel seen. Identity statement before product pitch. Emotional hook.

**Background effects:**
1. Subtle red grid overlay: `background-image: linear-gradient(rgba(208,2,27,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(208,2,27,0.04) 1px, transparent 1px)` at `background-size: 80px 80px`. Mask with radial gradient so it fades at edges.
2. Central glow: `500×400px` radial gradient, `rgba(208,2,27,0.12)`, centered at 50% 20% of section.

**Layout:** `min-height: 100vh`, flex column, content centred, scroll indicator at bottom.

**Content — in order:**

**Eyebrow line:**
```
[40px red line] — Everyone is a Brand™ — [40px red line]
```
Font: `.label` class. `margin-bottom: 3rem`.
Animation: `fadeUp 0.8s ease 0.3s forwards` (starts hidden)

**Headline H1:**
```
You were never just a
person trying to get by.
You were always a Brand.
```
- Line 1–2: Cormorant Garamond 300, `clamp(3.5rem, 8vw, 8rem)`, colour `--white`
- Line 2: italic (`<em>`)
- Line 3: `display: block`, colour `--red`, `font-weight: 700` — this is the gut-punch line
- `max-width: 900px`, `line-height: 1.0`, `letter-spacing: -0.02em`
- Animation: `fadeUp 1s ease 0.6s forwards`

**Subheading:**
```
The world doesn't reward the most talented. It rewards the most visible.
The Brand Coach Network exists to change that — for you, and for a billion lives like yours.
```
DM Sans 300, `clamp(0.95rem, 1.5vw, 1.1rem)`, `color: rgba(250,250,250,0.55)`, `max-width: 540px`, `line-height: 1.8`
Animation: `fadeUp 1s ease 0.9s forwards`

**CTA Row:**
- Primary: `"Discover Your Brand — Free"` → `.btn-primary`
- Secondary: `"See How It Works"` → `.btn-ghost`
- `display: flex; gap: 1rem; margin-top: 3rem`
- Animation: `fadeUp 1s ease 1.1s forwards`

**Scroll Indicator (bottom of section):**
- `1px` wide, `60px` tall line. Gradient: `var(--red)` → transparent. `scrollPulse` animation.
- Label: "scroll" in `.label` style, 0.55rem, 40% opacity
- Animation: `fadeIn 1s ease 1.8s forwards`

---

### ACT 2 — THE WOUND (Problem Statement)

**Purpose:** Name the pain. Second-person, present tense. No preaching. Universal to all 5 audience types.

**Section label floater** (top-left, absolute): `[30px red line] — Act II — The Reality`

**Top grid layout:** `grid-template-columns: 1fr 2fr; gap: 4rem; margin-bottom: 6rem`

**Left column:**
- Large decorative number `"02"`: Cormorant Garamond 700, 8rem, `color: rgba(208,2,27,0.08)`
- Headline: `"Talented. / Hard-working. / Still invisible."` — last line in `<strong>` italic Cormorant 600
- `clamp(2.5rem, 4vw, 4.5rem)`, weight 300

**Right column — 3 paragraphs of body copy:**

> You've put in the work. You have the skills, the hustle, the ideas — but somehow, the right opportunities keep going to **people who know how to show up**. It's not that you're not good enough.

> It's that the world can't see what you're worth — because **nobody taught you how to own your brand**. Your career, your business, your impact — all of it is being held back by a single missing piece: the clarity and confidence to be seen.

> This is the gap. And it costs more than most people ever realise — not just in income, but in **purpose, belonging, and momentum**. You were built to thrive. The question is: what's stopping you?

Bold phrases use `border-bottom: 1px solid rgba(208,2,27,0.4)` underline, colour `--white`, weight 400. Everything else is `rgba(250,250,250,0.7)`, weight 300.

**Pain Cards grid:** `grid-template-columns: repeat(3, 1fr)`, `gap: 1px`, `background: rgba(255,255,255,0.06)`, `border: 1px solid rgba(255,255,255,0.06)`.

Each card: `background: --off-black`, `padding: 2.5rem 2rem`. On hover: `background: --charcoal`. On hover, `::before` pseudo-element (2px red top border) scales from `scaleX(0)` to `scaleX(1)` — `transform-origin: left`.

| Card | Icon | Title | Description |
|---|---|---|---|
| 1 | 🪞 | No Clarity on Who You Are | You've achieved things, but you can't articulate your value in a room that matters. You don't know how to present yourself — online, on stage, or on paper. |
| 2 | 📣 | Visibility Without Strategy | You're posting, showing up, even networking — but nothing is converting. Because visibility without a brand story is just noise. |
| 3 | 🔗 | Isolated From the Right Community | Growth doesn't happen alone. But finding mentors, collaborators, and people who get it feels impossible. |

Cards are `.reveal` elements with staggered `transition-delay`.

---

### ACT 3 — THE REFRAME (The Idea)

**Purpose:** The pivot. The core philosophy lands as a revelation, not a tagline. Typography-dominant. Minimal visual noise.

**Background effects:**
- Two concentric rings: `500px` and `700px` diameter, `border-radius: 50%`, `border: 1px solid rgba(208,2,27,0.06/0.1)`, centred absolutely. They are decorative only.

**Centre divider line:** `1px` wide, `80px` tall, gradient `transparent → --red → transparent`, `margin: 0 auto 3rem`

**Main statement:**
```
"Everyone is a Brand™"
```
Cormorant Garamond 700 **italic**, `clamp(3rem, 6vw, 6rem)`, `colour: --white`.
The `™` is superscript, Syne 0.6rem, `colour: --red`, `font-style: normal`.

**Elaboration paragraph:**
```
Not a slogan. A declaration. You carry a story, a set of values, and a unique impact
only you can make. The Brand Coach Network was built on a single belief — that when
people understand and own their brand, they don't just succeed. They transform —
and their transformation transforms the people around them.
```
DM Sans 300, 1rem, `color: rgba(250,250,250,0.5)`, `max-width: 540px`, centred, `line-height: 1.9`.

Entire inner div is `.reveal`.

---

### ACT 4 — THE GUIDE (Who We Are)

**Purpose:** Position TBCN not as a company but as a movement. Credibility without boasting.

**Background:** `--cream`. Text colour switches to `--black`. This is the only light section.

**Layout:** `grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center`

**Left column:**

Section label (`.act4-label`): `"Who We Are"` in red

Headline:
```
We don't just teach branding.
We walk with you through it.
```
Cormorant Garamond 300, `clamp(2rem, 3.5vw, 3.5rem)`. Second line in `<strong>` (weight 600).

Body copy:
> The Brand Coach Network is Africa's most integrated personal and business branding ecosystem — connecting the SME School, the Branding Academy, Personal Development Institute, and Community Empowerment Centres under one digital home.

> We've walked with entrepreneurs who had nothing but a dream, professionals who'd lost their spark, and communities that just needed someone to believe in their potential. Every single time, the outcome was the same: clarity leads to confidence, confidence leads to action, action leads to transformation.

DM Sans 400, 0.95rem, `color: #444`, `line-height: 1.9`.

Mission badge (below body copy):
- Black background, white text
- Red dot + `"#ABillionLivesGlobally"` in Syne 700, 0.65rem, letter-spacing 0.12em

**Right column — 2×2 stat grid:**

`grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(0,0,0,0.1)`. Each stat cell has `border: 1px solid rgba(0,0,0,0.08); padding: 2rem; background: --cream`.

Stat number: Cormorant Garamond 700, 3rem, `colour: --black`. Red suffix for `+`, `B` indicators.

| Number | Label |
|---|---|
| 10K+ | Individuals empowered across Africa & beyond |
| 4+ | Integrated schools & academies in the ecosystem |
| 20+ | Countries represented in the global community |
| 1B | Lives to touch — the mission that drives every program |

---

### ACT 5 — THE ECOSYSTEM MAP (The Journey)

**Purpose:** Show the transformation path. This is a **journey map**, NOT a pricing table. The user self-selects emotionally before price is ever mentioned.

**Section header (centred, `max-width: 700px`):**

Label: `"The Path From Surviving to Thriving"`

Headline:
```
Your journey starts wherever you are.
And it ends where you choose.
```
Cormorant Garamond 300, `clamp(2.5rem, 4vw, 4rem)`. "wherever you are." in italic `<em>`.

Subtext:
> Every transformation is unique. That's why the Brand Coach Network is built as a living ecosystem — four entry points, one continuous path. Find where you are, and take the next step.

**Journey Timeline Layout:**

Vertical connecting line runs down the centre: `position: absolute; left: 50%; width: 1px; top: 0; bottom: 0`. Gradient: `transparent → rgba(208,2,27,0.3) → rgba(208,2,27,0.3) → transparent`.

Each tier uses a 3-column grid: `grid-template-columns: 1fr 80px 1fr`.

- Odd rows (Tier 1, 3): Card in column 1, node in column 2, empty in column 3
- Even rows (Tier 2, 4): Empty in column 1, node in column 2, card in column 3

**Node element** (column 2): Red outlined circle (20px), filled 8px red centre dot. Tier number label in red below.

**Card structure** (each tier card):
1. Tier badge: e.g. `"Free · Tier 1"` — red border, red text, Syne 700, 0.58rem, letter-spacing 0.15em
2. Tier name: Cormorant Garamond 600, 1.8rem
3. Tagline: DM Sans 0.78rem italic, `--grey-muted`
4. Description paragraph: DM Sans 300, 0.88rem, `rgba(250,250,250,0.6)`, `line-height: 1.7`
5. Feature list: Arrow prefix `→` in red, DM Sans 0.8rem, `rgba(250,250,250,0.5)`

---

#### Tier 1 — Discover (Free)

**Tagline:** *"Start your journey — discover the brand within you."*

**Description:**
> You've arrived. Something brought you here — a feeling, a question, or maybe just the quiet sense that you're capable of more. This is where that conversation begins. No commitment. No cost. Just the first honest look at who you are and what you're building.

**Features:**
- Introductory branding courses & insights
- Community forum access & live webinars
- Personal brand profile — your first digital identity
- Monthly newsletter & ecosystem updates

---

#### Tier 2 — Build (Premium)

**Tagline:** *"Build your visibility, influence, and income."*

**Description:**
> You know what you want. Now you need the tools, the structure, and the people who can push you further. This is where clarity becomes strategy — and strategy becomes results you can see in your career, your business, and your confidence.

**Features:**
- Full Personal Branding Academy & SME School access
- Downloadable brand audit & business toolkits
- Mentorship circles & mastermind sessions
- Certified completion — your brand credentialled

---

#### Tier 3 — Thrive (Pro / Partner)

**Tagline:** *"Your brand now powers others."*

**Description:**
> You've done the work. Now it's time to lead. Teach, coach, co-create — and build a legacy that outlasts any single program. Your expertise becomes a product. Your community becomes your audience. Your brand becomes a platform.

**Features:**
- Host & teach branded programs in the ecosystem
- Featured listing in The Brand Coach Directory
- Co-branding & partnership opportunities
- Priority access to #ABillionLivesGlobally initiatives

---

#### Tier 4 — Impact (Enterprise)

**Tagline:** *"Empower communities through partnership."*

**Description:**
> This is where organizations, corporates, and development partners come to do something that actually changes lives at scale. Co-branded learning spaces, Community Empowerment Centres, and real impact data — because your organization's legacy deserves more than a CSR report.

**Features:**
- Co-branded learning spaces for teams & communities
- Community Empowerment Centre (CEC) partnership model
- Custom impact analytics & quarterly strategy sessions
- Exclusive sponsorship visibility across the ecosystem

---

**Bottom CTA (after journey):**

Italic Cormorant 300 line:
> *Not sure where to start?* Take the free Brand Discovery assessment — it finds your entry point for you.

Button: `"Take the Free Assessment"` → `.btn-primary`

Separator above: `border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4rem`

---

### ACT 6 — COMMUNITY & PROOF

**Purpose:** Sell belonging, not the product. Let the community speak in transformation language, not star ratings.

**Section header — 2-column grid:** `grid-template-columns: 1fr 1fr; gap: 4rem; align-items: end`

**Left — Headline:**
```
You won't be learning
in a vacuum.
You'll be rising
with a movement.
```
Cormorant Garamond 300, `clamp(2.5rem, 4vw, 4rem)`. "in a vacuum." and "with a movement." in italic bold `<strong>` cream.

**Right — Two paragraphs:**
> The most powerful thing about The Brand Coach Network isn't the curriculum. It's the community that forms around it — coaches, entrepreneurs, professionals, and changemakers who chose to stop surviving and start thriving.

> When you join, you don't just get programs. You get people. People who are a few steps ahead, a few steps behind, and walking right beside you — all moving toward the same thing: a life defined by brand, purpose, and impact.

DM Sans 300, 0.95rem, `--grey-muted`, `line-height: 1.8`.

---

**Transformation Story Cards — `grid-template-columns: repeat(3, 1fr); gap: 1px`**

Each card has:
- `background: --off-black` → `--charcoal` on hover
- Large decorative `"` mark: `position: absolute; top: 1.5rem; right: 2rem; font-family: Cormorant; font-size: 5rem; color: rgba(208,2,27,0.08)`
- Avatar initials circle: `48px`, red border, red text initials, Syne 800 0.7rem
- **Before → After tags** (this is key — NOT star ratings):
  - Before tag: `background: rgba(255,255,255,0.05); color: --grey-muted`
  - Arrow: `→` in grey
  - After tag: `background: rgba(208,2,27,0.1); color: --red`
- Quote: DM Sans 300 italic, 0.9rem, `rgba(250,250,250,0.7)`, `line-height: 1.7`
- Name: Syne 700, 0.7rem, letter-spacing 0.08em, uppercase
- Role/location line: DM Sans 0.75rem, `--grey-muted`

| Avatar | Before | After | Quote | Name | Role |
|---|---|---|---|---|---|
| AK | Invisible Professional | Thought Leader | "I had 12 years of experience and couldn't explain what I did in a sentence that made people lean in. Three months in the Branding Academy and I had offers I never thought possible." | Amara O. | Corporate Strategist → Brand Consultant, Lagos |
| JN | Struggling SME | Market-Ready Brand | "My product was good but my brand was invisible. The SME School didn't just teach me marketing — it showed me how to own the story my business was already telling." | James N. | SME Founder, Nairobi → Regional Distribution Partner |
| FD | Recent Graduate | Brand Champion | "I started on the free tier — no money, just curiosity. That decision changed the direction of my entire career. I now coach others through the same journey." | Fatima D. | Graduate → Certified Brand Coach, Accra |

---

**Live Community Pulse Bar:**

Full-width bar, `border: 1px solid rgba(255,255,255,0.06); padding: 2.5rem`. Flex row, space-between.

**Left — Live indicator:**
- Animated red dot (`pulseDot` animation)
- Label: `"Community Live"` in red, Syne 700, letter-spacing 0.14em

**Centre — 4 metrics:**

| Number | Label |
|---|---|
| 4,200+ | Active Members |
| 20+ | Countries Represented |
| 380+ | Programs Completed This Month |
| 62+ | Certified Coaches in the Network |

Number style: Cormorant Garamond 700, 1.8rem. `+` suffix in `--red`. Label: DM Sans 0.72rem, `--grey-muted`.

**Right:** `"Join the Community →"` link — Syne 700, 0.65rem, `border-bottom: 1px solid rgba(250,250,250,0.15)`.

---

### ACT 7 — THE CALL (Final CTA)

**Purpose:** The invitation. Not a transaction. Free tier removes financial friction. Single focused moment.

**Background effect:** `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(208,2,27,0.08) 0%, transparent 70%)`

**Pre-line (italic, centred):**
```
— You've seen the path. You know what's possible. —
```
DM Sans 300 italic, 0.9rem, `--grey-muted`.

**Headline:**
```
The only question left is
how long you'll wait
to become who you already are.
```
Cormorant Garamond 300, `clamp(3rem, 6vw, 5.5rem)`, `line-height: 1.1`.
- "how long you'll wait" → italic `<em>`, colour `--cream`
- "to become who you already are." → `display: block; font-weight: 700; color: --red`

**Body:**
> Your brand is already there. It's been waiting for you to claim it. Start free. Start today. Join a community of thousands across Africa and beyond who chose to stop surviving — and started building something that will outlast them.

DM Sans 300, 1rem, `rgba(250,250,250,0.5)`, `line-height: 1.9`, `max-width: 600px`, centred.

**CTA Row (centred):**
- Primary: `"Start Your Journey — It's Free"` → `.btn-primary` (larger: `padding: 1.2rem 3rem; font-size: 0.72rem`)
- Secondary: `"Explore Premium Programs"` → `.btn-ghost`

**Trust note below CTAs:**
```
No credit card required · Cancel anytime · Part of a global cause
```
DM Sans 0.78rem, `--grey-muted`.

---

## 6. Footer

**Layout:** `grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; padding: 4rem; background: --off-black`

**Column 1 — Brand:**
- Logo mark + name
- Tagline: *"From Surviving Individuals to Thriving Brands™"* — Cormorant italic, `--grey-muted`
- Mission badge: red dot + `#ABillionLivesGlobally`

**Column 2 — Programs:**
Personal Branding Academy · The SME School · Finding Yourself · Skills Stacking · CEC Partnership

**Column 3 — Community:**
Member Directory · Coach Network · Events & Webinars · Brand Coach Blog · Forum & Circles

**Column 4 — Partner:**
Sponsor a Program · Investor Relations · Enterprise Tier · Become a Coach · Contact Us

**Footer bottom bar:** `border-top: 1px solid rgba(255,255,255,0.04); padding: 1.5rem 4rem; display: flex; justify-content: space-between`
- Left: `"© 2025 The Brand Coach Network. All rights reserved."`
- Right: `"Built to empower · Designed to inspire · Made for Africa and beyond"`

Link style: DM Sans 300, 0.82rem, `--grey-muted` → `--white` on hover. No underlines.

---

## 7. Responsive Breakpoint (`max-width: 900px`)

- Hide nav links (keep logo + CTA only)
- All section paddings: `padding-left: 1.5rem; padding-right: 1.5rem`
- Act 2 intro: `grid-template-columns: 1fr` (stack)
- Pain cards: `grid-template-columns: 1fr` (stack)
- Act 4: `grid-template-columns: 1fr` (stack)
- Act 5 timeline: hide the vertical centre line; all tier rows `grid-template-columns: 1fr` (stack, all cards full width, nodes hidden or inline)
- Act 6 header: `grid-template-columns: 1fr`
- Story cards: `grid-template-columns: 1fr`
- Pulse bar: `flex-direction: column; text-align: center`
- Footer: `grid-template-columns: 1fr 1fr`
- Footer bottom: `flex-direction: column; text-align: center`

---

## 8. Behaviour Notes for Claude Code

1. **Build as a single `index.html`** unless the project is already a Next.js/React repo, in which case build as a single `page.tsx` + `globals.css` update.
2. **No frameworks required** — vanilla HTML/CSS/JS is sufficient and preferred for performance.
3. **All fonts load from Google Fonts CDN** — include the `<link>` preconnect + stylesheet in `<head>`.
4. **No images required for V1** — all visual atmosphere is achieved through CSS (gradients, noise, geometric shapes). Avatar circles use initials only.
5. **Scroll reveal** uses `IntersectionObserver` (see Section 2.5) — no library needed.
6. **Nav scroll behaviour** uses a single `window.addEventListener('scroll', ...)` — no library needed.
7. **All CTAs are `<button>` elements** for Act 1/7 primary actions. Ghost CTAs that link to sections use `<a href="#section-id">`.
8. **Section IDs** to add: `#programs` (Act 5), `#community` (Act 6), `#join` (Act 7), `#about` (Act 4).
9. **Accessibility:** All sections need `aria-label`. Buttons need descriptive text (already written above). Colour contrast on body text meets WCAG AA minimum.
10. **Performance:** Lazy-load anything below the fold. The `reveal` class starts at `opacity: 0` which ensures no layout shift.

---

## 9. What This Page Must Make the Visitor Feel

> *"This landing page should make a 24-year-old entrepreneur in Nairobi feel like someone finally understands them — and then show them exactly where to go next."*

In order:
1. **Seen** — The Mirror tells them their story before they've said a word
2. **Validated** — The Wound names the frustration they've never been able to articulate
3. **Awakened** — The Reframe shifts their identity in a single sentence
4. **Trusted** — The Guide shows proof of walk, not just talk
5. **Oriented** — The Map tells them exactly where they fit and what to do next
6. **Belonging** — The Community shows them the room they're about to walk into
7. **Ready** — The Call makes the first step feel free, obvious, and meaningful

That sequence is non-negotiable. Every design, copy, and UX decision should serve it.

---

*Spec authored by: Amoni Kevin — Full-Stack Developer & AI Engineer*
*Brand: The Brand Coach Network · Version: 1.0 · March 2026*