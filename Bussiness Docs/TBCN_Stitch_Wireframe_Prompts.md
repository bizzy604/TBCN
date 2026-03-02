**THE BRAND COACH NETWORK**

UI Screen Inventory & Google Stitch Wireframe Prompts

For Human-Centered Redesign — Apple HIG Design System

## **Screen Inventory by User Role**

**Total screens across all user types: 40 screens**

All screens below follow Apple Human Interface Guidelines applied to The Brand Coach Network's existing color system. Dashboards share one unified layout pattern.

| User Role | \# Screens | Key Screens |
| :---- | :---- | :---- |
| Public / Guest | **4** | Landing Page, Programs Catalog, Coach Directory, Sign Up / Login |
| Member (All tiers) | **11** | Member Dashboard, Profile, Courses, Lesson Player, Community, Events, Store, Coaching Booking, Onboarding, Settings, Notifications |
| Coach | **7** | Coach Dashboard, Session Management, Client List, Availability, Earnings, Content Upload, Public Coach Profile |
| Partner / Enterprise | **5** | Partner Dashboard, Group/Cohort Management, Bulk Enrollment, Impact Reports, Partner Profile |
| Admin | **8** | Admin Dashboard, User Management, Content Approval, Program Builder, Event Manager, E-Commerce, Analytics, Support Tickets |
| Shared / System | **5** | Checkout/Payment, Email Verification, Onboarding Flow, Certificate Viewer, 404 / Error States |
| **TOTAL** | **40** | Complete screen set for MVP |

## **Global Design System Notes**

| BRAND COLOR PALETTE  (extracted from your globals.css) • Primary — Crimson Red  ——  CTAs, buttons, active nav, badges • Secondary — Deep Teal  ——  supporting actions, skill tags, links • Accent — Amber Orange  ——  highlights, awards, warm callouts • Background — Warm Cream  ——  page backgrounds, card fills • Nav/Sidebar — Deep Navy-Teal  ——  sidebar, dark headers • Muted — Slate Blue  ——  secondary text, borders, placeholders APPLE HIG RULES APPLIED • Minimum 44×44pt touch targets on all interactive elements • SF Pro-inspired hierarchy: Title / Headline / Body / Caption • Generous white space — 16px base spacing unit • Cards with 12px radius, subtle drop shadow (not hard borders) • Unified dashboard layout: sidebar \+ header stats \+ content grid • Bottom tab bar on mobile (max 5 tabs), left sidebar on desktop ≥768px |
| :---- |

## **SECTION 1 — PUBLIC / GUEST SCREENS  (4 screens)**

**Screen 1  Landing Page (Homepage)**

| User Role | Guest / Public |
| :---- | :---- |
| **Description** | Marketing homepage introducing the platform. Hero section, value proposition, featured programs, testimonials, pricing tiers overview, and a sticky CTA to sign up. |
| **Stitch Prompt** | Design a mobile-first landing page for The Brand Coach Network — a personal branding and entrepreneurship coaching platform for African professionals. The page uses a warm cream (\#F5F0E0) background with a deep navy-teal (\#1C3A4A) navigation bar. Apply Apple HIG principles: generous white space, clear typographic hierarchy, 44pt minimum tap targets. Include: (1) Hero section — bold headline "Everyone is a Brand™", sub-headline, two CTA buttons (crimson-red primary "Get Started" \+ teal secondary "View Programs"), and a warm illustrated hero image. (2) Value proposition: 3 horizontal cards showing key benefits. (3) Featured Programs row: 3 horizontal course cards with cover image, title, coach avatar, price, and enrollment button. (4) How It Works: 3-step numbered flow. (5) Testimonials: 3 quotes in card carousel. (6) Pricing tier table: 4 columns (Discover/Build/Thrive/Impact). (7) Partner logos strip. (8) Footer with links and social icons. Sticky top nav with logo, links, and "Sign Up" crimson-red button. Color palette: cream bg, crimson-red primary, deep teal secondary, amber accent, deep navy sidebar/header. Font: clean modern sans-serif. Mobile-responsive. No generic blue — use the defined palette. |

**Screen 2  Programs Catalog**

| User Role | Guest / Public |
| :---- | :---- |
| **Description** | Browse all available programs and courses before signing in. Filter by category, tier, format. Cards show program details with locked/unlocked states for guests. |
| **Stitch Prompt** | Design a programs catalog page for The Brand Coach Network using Apple HIG principles. Background: warm cream (\#F5F0E0). Header bar: deep navy-teal with search bar and filter icon. Left sidebar (desktop) or top horizontal chips (mobile): filter options for Category (Personal Branding, SME, Leadership, Life Skills), Format (Self-paced, Live, Cohort), Tier Access (Free, Build, Thrive), Duration. Main content: grid of program cards (2 cols mobile, 3 cols desktop). Each card: cover image (16:9), badge showing tier required (crimson-red for paid, teal for free), program title, coach name \+ avatar, duration, rating stars, price, and "Enroll" button. Locked programs show a subtle padlock icon overlay \+ "Upgrade to Access" tooltip. Active filter pills displayed below header. Empty state with illustrated icon if no results. Pagination or infinite scroll indicator at bottom. Crimson-red active filter badges, teal secondary buttons, amber-orange highlighted featured programs. No generic blue UI elements. |

**Screen 3  Coach / Mentor Directory**

| User Role | Guest / Public |
| :---- | :---- |
| **Description** | Searchable public directory of certified coaches with profile cards, specializations, and a booking CTA that prompts sign-up for guests. |
| **Stitch Prompt** | Design a coach and mentor directory page for The Brand Coach Network following Apple HIG. Background: warm cream. Page header: "Find Your Coach" with search bar and filter dropdown. Filter options: Specialization, Availability, Rating, Language, Price Range. Coach cards in a responsive grid: avatar photo (round), name, title/specialization badge (teal), 5-star rating, session price, "Book a Session" button (crimson-red). Clicking "Book" for a guest triggers a sign-up modal. Featured coaches have a subtle amber-orange "Top Coach" badge. Each card has a soft card shadow and 12px border radius. Sidebar on desktop shows filter panel. Sort dropdown: Top Rated, Price Low-High, Availability. Mobile: filter accessible via bottom sheet. Use the defined color palette; no generic blues. Clean, professional, Apple-HIG inspired. |

**Screen 4  Sign Up / Login Screen**

| User Role | Guest / Public |
| :---- | :---- |
| **Description** | Authentication screen with email/social login options, and a multi-step onboarding flow for new users including profile setup and tier selection. |
| **Stitch Prompt** | Design a sign-up and login screen for The Brand Coach Network following Apple Human Interface Guidelines. Split-screen layout on desktop: left panel is a branded deep navy-teal (\#1C3A4A) panel with the platform logo, tagline "Everyone is a Brand™", and a motivational quote or testimonial. Right panel: white card with form. Login tab / Sign-up tab toggle at top. Sign-up form: Full Name, Email, Password, Location (country dropdown). Social login buttons for Google and LinkedIn (clean, outlined style). "By signing up you agree to Terms & Privacy" fine print. Crimson-red primary "Create Account" button, full width. Login form: Email, Password, "Forgot Password" link, "Sign In" crimson-red button. Below: "New here? Create an account" link. Mobile: full-screen single column, branded header image at top. Apple-style floating input labels. Real-time password strength indicator. No generic blue — use the defined warm color palette. |

## **SECTION 2 — MEMBER SCREENS  (11 screens)**

**Screen 5  Onboarding Flow**

| User Role | Member (New User) |
| :---- | :---- |
| **Description** | 3-step onboarding after registration: profile setup → interest selection → tier/plan selection. Progress indicator at top. |
| **Stitch Prompt** | Design a 3-step onboarding flow for new members of The Brand Coach Network. Apply Apple HIG: clean, minimal, progress-focused. Step indicator at top (pill steps: 1 Profile → 2 Interests → 3 Your Plan). Step 1 — "Build Your Profile": large avatar upload circle (crimson-red dashed ring), fields for Display Name, Tagline, Location, Bio (multiline), and profile photo upload. Step 2 — "Select Your Interests": grid of interest chips (Personal Branding, Entrepreneurship, Leadership, SME Growth, Career Transition, Public Speaking, etc.) — tap to select (teal filled when selected). Step 3 — "Choose Your Plan": 3 plan cards side by side (Build/Thrive/Impact). Recommended plan (Build) highlighted with crimson-red border and "Most Popular" badge. Free Discover tier as text link below. Each step has a large illustrated icon at top. Background: warm cream. Navigation: Back and Continue buttons. Skip option for each step. Mobile-first single column layout. Deep navy-teal header with white logo. |

**Screen 6  Member Dashboard**

| User Role | Member |
| :---- | :---- |
| **Description** | Main logged-in homepage. Stats overview, continue learning, upcoming events, community highlights, and personalized recommendations. |
| **Stitch Prompt** | Design the Member Dashboard for The Brand Coach Network following Apple HIG. IMPORTANT: Use the UNIFIED DASHBOARD LAYOUT — left sidebar navigation (deep navy-teal, \#1C3A4A) \+ top header bar \+ main content area. Left sidebar: platform logo at top, navigation items (Home, My Learning, Community, Events, Store, Coaching, Profile, Settings) with crimson-red active state indicator. Top header: greeting "Welcome back, \[Name\]" \+ notification bell \+ avatar. Main content: Row 1 — 4 horizontal stat cards with icons: Courses Enrolled, Hours Learned, Certificates, Community Posts (amber-orange accent numbers). Row 2 — "Continue Learning": horizontal scroll of in-progress course cards (thumbnail, title, progress bar in crimson-red, % complete). Row 3 — Two columns: left "Upcoming Events" (event cards with date chip in teal, title, time), right "Community Activity" (recent posts/replies). Row 4 — "Recommended for You": 3 program cards. Profile completion banner (if \<80%): amber-orange strip at top of main content. Background: warm cream. Mobile: bottom tab bar replaces sidebar, cards stack vertically. No generic blue palette. |

**Screen 7  My Learning (Course Library)**

| User Role | Member |
| :---- | :---- |
| **Description** | All enrolled courses with progress. Tabs for In Progress, Completed, Saved. Filters and search. |
| **Stitch Prompt** | Design the My Learning page for The Brand Coach Network member area. Apply Apple HIG and the UNIFIED DASHBOARD LAYOUT (left sidebar \+ header \+ content). Content area: "My Learning" heading. Three segmented tabs: In Progress | Completed | Saved. Search bar \+ Sort dropdown (Recently Accessed, Alphabetical, Progress). "In Progress" state: course cards in a responsive list-grid hybrid. Each card: course thumbnail, course title, coach name \+ avatar, progress bar (crimson-red fill), percentage complete, "Continue" button (crimson-red), last accessed timestamp. Completed tab: same cards but with a teal "Completed" badge and "View Certificate" button. Saved tab: wishlist-style cards with "Enroll Now" button. Empty states: illustrated icon \+ "You haven't enrolled in any courses yet. Explore Programs." CTA. Background: warm cream. Sidebar active state on My Learning. Mobile-optimized card layout. Use defined brand palette only. |

**Screen 8  Lesson / Course Player**

| User Role | Member |
| :---- | :---- |
| **Description** | In-course learning experience. Video player, lesson navigation sidebar, notes, quiz, and resources tabs. |
| **Stitch Prompt** | Design a course lesson player screen for The Brand Coach Network following Apple HIG. Full-width video player at top (16:9, dark background, custom controls in crimson-red accent). Below the player: three tabs — Lesson Notes | Resources | Discussion. Lesson Notes tab: rich text display of lesson notes, download button. Resources tab: list of downloadable files (PDFs, templates) with amber-orange download icons. Discussion tab: comment thread for this lesson. Right sidebar (desktop): Course Navigation panel — course title, progress ring (crimson-red), module list accordion with lesson items (checkmark for completed, crimson-red dot for current). "Mark as Complete" button (crimson-red) below video. Navigation arrows: Previous Lesson / Next Lesson. Breadcrumb: Dashboard \> My Learning \> \[Course Name\] \> \[Lesson Name\]. Quiz lessons: show question card overlaid below video. Mobile: navigation sidebar becomes a bottom drawer. Background: deep navy-teal for player area, warm cream for content area. No generic blue. |

**Screen 9  Community Hub**

| User Role | Member |
| :---- | :---- |
| **Description** | Community feed with categories, posts, ability to create posts, like/comment, and discover members. |
| **Stitch Prompt** | Design the Community Hub for The Brand Coach Network following Apple HIG and unified dashboard layout. Left sidebar: platform nav. Main content area: Left column (desktop) — Category sidebar with tabs: All | Discussions | Success Stories | Questions | Projects. Center column — Feed of community posts. Each post card: author avatar \+ name \+ role badge (teal "Coach" or muted "Member"), time ago, post title (bold), content preview (2 lines), media thumbnail if attached, action row (Like with count, Comment with count, Share). Crimson-red heart for liked posts. Top of feed: "Create Post" card with avatar \+ "Share something with the community..." prompt that expands to a full composer. Trending topics sidebar on right (desktop): list of trending tags in teal chips. Community stats: Total Members, Posts This Week. Featured member spotlight card. Notification for new replies in amber-orange badge. Mobile: single column feed, FAB (floating action button) in crimson-red for creating posts. Use brand color palette only. |

**Screen 10  Events Page**

| User Role | Member |
| :---- | :---- |
| **Description** | Browse upcoming events, masterclasses, and webinars. Register, view tickets, and access replays. |
| **Stitch Prompt** | Design the Events page for The Brand Coach Network member area, following Apple HIG and unified dashboard layout. Content area header: "Events & Masterclasses". Toggle: Upcoming | Registered | Replays. Filter chips: All | Virtual | In-Person | Masterclass | Workshop | Free | Paid. Events displayed as cards in a responsive grid. Each event card: banner image (16:9), event title (bold), date+time chip (crimson-red background), location type badge (teal "Virtual" / amber "In-Person"), speaker name \+ avatar, ticket price (or "Free"), "Register" button (crimson-red) or "Registered" (teal checkmark). Featured events: larger hero card at top with prominent CTA. Registered tab: shows your booked events with QR ticket button and calendar add option. Replays tab: past event recordings in video card grid, accessible by tier. Calendar mini-view on right sidebar (desktop) shows events on dates. Mobile: horizontal filter scroll, vertical card list. Warm cream background, brand palette. |

**Screen 11  Store / Marketplace**

| User Role | Member |
| :---- | :---- |
| **Description** | E-commerce for digital products (ebooks, toolkits), physical merchandise, and course bundles. |
| **Stitch Prompt** | Design the Store / Marketplace page for The Brand Coach Network following Apple HIG and unified dashboard layout. Header: "Store" with search bar and cart icon (crimson-red badge for item count). Category tabs: All | Digital Products | Merchandise | Course Bundles | Tools & Templates. Product grid: cards showing product image, product name, short description, price, "Add to Cart" button (crimson-red). Digital products show a download icon badge. Physical products show "Ships to Kenya" tag. Out of stock items grayed out with "Notify Me" button. Featured section: hero banner at top for highlighted product. Cart sidebar/drawer slides in from right. Member discounts shown in amber-orange badge ("Build Member — 15% off"). Mobile: 2-column product grid. Warm cream background, teal \+ crimson-red buttons, amber-orange accent. Apple-style clean layout. |

**Screen 12  Coaching Booking Screen**

| User Role | Member |
| :---- | :---- |
| **Description** | Book a 1-on-1 coaching session. Browse coach profile, pick session type, select date/time, and pay. |
| **Stitch Prompt** | Design a coaching session booking screen for The Brand Coach Network following Apple HIG. Three-step flow within a modal or dedicated page: Step 1 — Coach Profile Summary: large avatar, name, specialization tags (teal), star rating, reviews count, bio excerpt, session types offered (Discovery Call / 1-on-1 / Group) as selectable cards with price. Step 2 — Schedule: calendar date picker (Apple-calendar style, crimson-red selected date), time slot grid (morning/afternoon/evening rows, available slots in teal, unavailable grayed). Selected slot highlighted in crimson-red. Step 3 — Confirm & Pay: booking summary card (coach name, date, time, session type, price), promo code input, payment method selector (M-PESA / Stripe Card / PayPal) with icons, total amount, "Confirm Booking" crimson-red button. Success state: animated checkmark, booking confirmation card with Zoom link and calendar add button. Mobile-first layout. Warm cream background. |

**Screen 13  Member Profile**

| User Role | Member |
| :---- | :---- |
| **Description** | Public-facing brand profile page. Photo, bio, skills, certifications, portfolio, and social links. |
| **Stitch Prompt** | Design the Member Profile page for The Brand Coach Network following Apple HIG. Profile header: large cover banner (customizable, defaults to a deep navy-teal gradient with amber pattern), circular profile photo overlapping banner, member name (large bold), tagline (italic muted), location \+ membership tier badge (crimson-red for paid, muted for free), profile completion progress ring. Tab navigation below header: Overview | Portfolio | Certifications | Activity. Overview tab: Bio section, Skills chips (teal outlined), Social links row (icons). Portfolio tab: masonry or grid of uploaded work (images, PDFs, links) in cards. Certifications tab: certificate cards with TBCN logo, program name, date, "Verify" button. Activity tab: recent community posts and course completions. Edit button (top right) for own profile — ghost style. "Connect" and "Message" buttons for viewing others' profiles. Mobile: stacked single column, tabs become a horizontal scroll. Warm cream background. |

**Screen 14  Notifications Center**

| User Role | Member |
| :---- | :---- |
| **Description** | All platform notifications: new messages, course updates, community replies, events, payment receipts. |
| **Stitch Prompt** | Design a Notifications Center page/panel for The Brand Coach Network following Apple HIG. Full page on mobile, right-side slide-over panel on desktop. Header: "Notifications" \+ "Mark All Read" text button (teal). Filter tabs: All | Unread | Community | Courses | Events | Payments. Notification list: each item has a category icon (colored: crimson-red for urgent, teal for info, amber for events), notification text (bold title \+ body preview), timestamp (relative: "2 hours ago"), unread indicator dot (crimson-red). Notification types: new reply to post, course module unlocked, upcoming event reminder, payment confirmed (with receipt link), new connection request, certificate issued. Grouped by day: "Today", "Yesterday", "This Week". Tap/click opens related content. Empty state: illustrated empty inbox icon with "You're all caught up\!" text. Background: warm cream. Matches unified dashboard layout. |

**Screen 15  Settings & Account**

| User Role | Member |
| :---- | :---- |
| **Description** | Account settings: profile, password, payment methods, notification preferences, privacy, subscription management. |
| **Stitch Prompt** | Design an Account Settings page for The Brand Coach Network following Apple HIG and unified dashboard layout. Left nav sidebar active on Settings. Content area: Settings grouped in section cards. Section 1 — Account: Edit Profile link, Change Email, Change Password (inline form with toggle). Section 2 — Subscription & Billing: current plan badge (crimson-red for Build, teal for Thrive), renewal date, "Upgrade Plan" button, saved payment methods (M-PESA number, card last 4 digits), billing history table. Section 3 — Notifications: toggle switches (Apple-style) for Email Notifications, SMS Alerts, Community Digest, Event Reminders, Course Updates. Section 4 — Privacy: Profile visibility selector (Public / Members Only / Private), Data Export button, Delete Account (destructive red text button). Section 5 — Language & Region: language dropdown, timezone, currency preference. Clean list-style layout with section headers in muted uppercase. Warm cream background. Teal for toggles active state. |

## **SECTION 3 — COACH SCREENS  (7 screens)**

**Screen 16  Coach Dashboard**

| User Role | Coach |
| :---- | :---- |
| **Description** | Coach's main workspace. Session stats, upcoming bookings, client list preview, earnings summary, and content performance. |
| **Stitch Prompt** | Design the Coach Dashboard for The Brand Coach Network following Apple HIG. Use the UNIFIED DASHBOARD LAYOUT (same as member dashboard): left sidebar (deep navy-teal) with nav items: Dashboard, My Sessions, Clients, Content, Earnings, Availability, My Profile. Top header: "Coach Portal" label \+ coach name \+ notification bell \+ avatar. Main content: Row 1 — Stat cards (4): Sessions This Month, Active Clients, Total Earnings (KES), Average Rating (stars). Use crimson-red for primary numbers, teal for secondary metrics, amber for earnings. Row 2 — "Upcoming Sessions" table/list: client avatar \+ name, session type, date+time, meeting link button (teal "Join"), status badge. Row 3 — Two columns: Left "Recent Client Activity" (client name, last interaction, progress), Right "Content Performance" (course title, enrollments, rating, revenue). Row 4 — Earnings chart (bar chart, crimson-red bars, monthly). Background: warm cream. Same layout grid as Member Dashboard for design consistency. |

**Screen 17  Session Management**

| User Role | Coach |
| :---- | :---- |
| **Description** | Manage all coaching sessions: upcoming, completed, cancelled. Filter by status, client, date range. |
| **Stitch Prompt** | Design the Session Management page for a Coach on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "My Sessions". Three tabs: Upcoming | Completed | Cancelled. Filter bar: Search client name, Date range picker, Session type dropdown (1-on-1 / Group / Discovery). Sessions displayed in a data list/table: columns — Client (avatar \+ name), Session Type (badge), Date & Time, Duration, Status (badge: Scheduled=teal, Completed=green, Cancelled=muted), Meeting Link, Actions (Join/View Notes/Cancel). Clicking a session opens a detail panel: client profile snippet, session notes textarea, session rating input, mark as complete button. "Schedule New Session" button (crimson-red) top right. Completed sessions show star rating from client (amber stars) and coach notes. Pagination at bottom. Mobile: card list per session instead of table. Warm cream background, brand palette. |

**Screen 18  Client List & Profiles**

| User Role | Coach |
| :---- | :---- |
| **Description** | All clients who have booked sessions. View individual client profiles, progress, session history, and notes. |
| **Stitch Prompt** | Design the Client Management page for a Coach on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "My Clients". Search bar \+ filter (Active/Past). Client list as cards or table rows: client avatar, name, membership tier badge, total sessions count, last session date, current program enrolled, progress bar (crimson-red), quick actions (Message, Schedule Session). Clicking a client opens a client detail view (right panel on desktop, full page on mobile): larger avatar \+ name \+ bio snippet, "Member since" date, Session History timeline, shared notes textarea (coach-only visible), certifications earned, "Schedule Session" crimson-red button, "Message" teal button. Client progress overview: courses enrolled \+ % complete. Empty state: "You have no clients yet. Share your profile to get bookings." Warm cream background. Apple-style clean panels. |

**Screen 19  Availability & Calendar**

| User Role | Coach |
| :---- | :---- |
| **Description** | Set weekly availability, block dates, view booking calendar. |
| **Stitch Prompt** | Design the Availability & Calendar page for a Coach on The Brand Coach Network following Apple HIG and unified dashboard layout. Left panel (desktop): Weekly availability setter — days of week as rows (Mon-Sun), each with an on/off toggle (teal when active), and time range inputs (Start Time → End Time, Apple-style time picker). "Block Dates" section: date range picker to mark unavailable periods. "Session Duration" setting: 30 / 45 / 60 / 90 min radio buttons. "Buffer Time Between Sessions" dropdown. Right panel (desktop): full calendar view (month view default, toggleable to week/day). Booked sessions shown as crimson-red blocks. Available slots shown as teal blocks. Blocked time shown as muted gray. Legend at top. Clicking a date shows session details sidebar. "Sync with Google Calendar" button (teal outlined). "Save Availability" crimson-red button at bottom. Mobile: stacked layout, availability form first, calendar below. Warm cream background. |

**Screen 20  Earnings & Payments**

| User Role | Coach |
| :---- | :---- |
| **Description** | Earnings overview, payment history, payout settings, and revenue breakdown by session type. |
| **Stitch Prompt** | Design the Earnings & Payments page for a Coach on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Earnings". Summary row: 3 large stat cards — Total Earned (This Month), Pending Payout, Total (All Time). Numbers in amber-orange (earnings highlight). Earnings Chart: bar chart showing monthly earnings for last 6 months (crimson-red bars). Payment History table: Date, Client Name, Session Type, Amount (KES), Platform Fee, Net Payout, Status (Paid=teal/Pending=amber). Filterable by month and status. Payout Settings card: current payout method (M-PESA number or bank), "Update Payout Details" button. Minimum payout threshold notice. Revenue Split info: "You earn 80% of every session fee" in a teal info box. "Request Payout" crimson-red button (active when balance ≥ threshold). Mobile-optimized with scrollable table. Warm cream background. |

**Screen 21  Content Upload & Management**

| User Role | Coach |
| :---- | :---- |
| **Description** | Upload courses, lessons, and resources. Manage draft and published content. View enrollment and ratings. |
| **Stitch Prompt** | Design the Content Management page for a Coach on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "My Content". Two tabs: Courses | Resources. Courses tab: list of coach's programs — card format with cover image, title, status badge (Draft=amber / Published=teal / Archived=muted), enrollment count, average rating (stars), revenue earned, Edit \+ View \+ Archive action buttons. "Create New Course" crimson-red button top right. Clicking Create opens a multi-step course builder: Step 1 Basic Info (title, description, category, cover image upload), Step 2 Curriculum (drag-drop module \+ lesson builder), Step 3 Pricing (free/paid toggle, price input, tier access), Step 4 Review & Publish. Lesson editor: video upload dropzone (dashed border, amber-orange icon), lesson title, description, resource attachments, quiz toggle. Resources tab: list of uploaded PDFs/toolkits with download count. Apple-style upload UI with drag-drop support. Warm cream background. |

**Screen 22  Public Coach Profile**

| User Role | Coach |
| :---- | :---- |
| **Description** | Coach's public-facing profile page that members see. Bio, specializations, reviews, courses offered, and booking CTA. |
| **Stitch Prompt** | Design the Public Coach Profile page for The Brand Coach Network following Apple HIG. This is what members/guests see when they visit a coach's profile. Header: full-width cover banner (customizable or default branded), circular coach photo (large, centered or left-aligned), Coach name (bold, large), Title/Specialization (muted italic), Location \+ Languages spoken. Badges: "TBCN Certified Coach" (teal badge with checkmark icon), star rating (amber stars) \+ reviews count. CTA buttons: "Book a Session" (crimson-red, prominent) \+ "Message" (teal outlined). About section: bio paragraph, areas of expertise as chips (teal outlined). Courses Offered: horizontal scroll of program cards (thumbnail, title, price, rating). Reviews section: review cards with client avatar, rating, quote, date. Availability snippet: "Next available: \[Date\]". Social links footer. Mobile-first layout, warm cream background. No generic blues. |

## **SECTION 4 — PARTNER / ENTERPRISE SCREENS  (5 screens)**

**Screen 23  Partner Dashboard**

| User Role | Partner / Enterprise |
| :---- | :---- |
| **Description** | Institutional partner main workspace. Organization overview, cohort progress, spending, and impact metrics. |
| **Stitch Prompt** | Design the Partner Dashboard for The Brand Coach Network following Apple HIG. Use the UNIFIED DASHBOARD LAYOUT — same structural grid as Member and Coach dashboards. Left sidebar: deep navy-teal, nav items: Dashboard, Our Cohorts, Bulk Enrollment, Impact Reports, Billing, Organization Profile. Sidebar header: company logo \+ "Partner Portal" label. Main content: Row 1 — Stat cards (4): Total Participants Enrolled, Active Learners (This Month), Certifications Earned, Budget Utilization (progress bar). Crimson-red for enrolled count, teal for active, amber for certifications, green for budget. Row 2 — "Active Cohorts" table: cohort name, start date, participants, avg progress (progress bar), completion rate, actions. Row 3 — Two columns: Left "Top Performing Participants" list, Right "Program Breakdown" donut chart (by program category). Row 4 — Quick Actions: "Enroll New Participants", "Download Report", "Add Budget". Background: warm cream. Consistent with other dashboards. |

**Screen 24  Cohort / Group Management**

| User Role | Partner |
| :---- | :---- |
| **Description** | Create and manage participant cohorts. Track individual and group progress, communicate with cohort. |
| **Stitch Prompt** | Design the Cohort Management page for a Partner on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Our Cohorts". "Create New Cohort" crimson-red button top right. Cohort cards or list: cohort name, assigned programs, participant count, start+end dates, status badge (Active=teal / Completed / Draft). Clicking a cohort opens a detail view: cohort header with name \+ programs assigned \+ dates. Participants table: avatar, name, enrollment date, progress bar, completion %, certifications, status (Active / Inactive / Dropped). Search \+ filter within cohort. Bulk actions: message all, export list (CSV). Individual participant: click to see their course progress detail. Coach assignment: "Assign Coach" for group sessions. Notes field for cohort. Mobile: participant cards stack vertically. Warm cream background, brand palette. Apple-style data tables with subtle row shading. |

**Screen 25  Bulk Enrollment**

| User Role | Partner |
| :---- | :---- |
| **Description** | CSV upload or manual enrollment of multiple participants into programs. |
| **Stitch Prompt** | Design the Bulk Enrollment page for a Partner on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Enroll Participants". Step-by-step wizard: Step 1 — Select Program: grid of available programs the partner has licensed (cards with program name, coach, duration, select radio/checkbox). Step 2 — Add Participants: two options — (A) CSV Upload with drag-drop zone (dashed border, amber icon, "Download template" link), preview table of uploaded data with error rows highlighted in red, validation summary. (B) Manual Entry form to add one by one. Step 3 — Assign to Cohort: dropdown to assign to existing cohort or create new. Step 4 — Review & Confirm: summary card — Programs selected, Participants count, Cost calculation, Estimated start date. "Confirm Enrollment" crimson-red button. Progress indicator at top. Success state: animated checkmark, summary of enrolled participants, link to view cohort. Mobile-first, warm cream background. |

**Screen 26  Impact Reports**

| User Role | Partner |
| :---- | :---- |
| **Description** | Automated impact and ROI reports for CSR documentation, stakeholder reporting, and program evaluation. |
| **Stitch Prompt** | Design the Impact Reports page for a Partner on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Impact Reports". Report selector: dropdown for time period (Monthly / Quarterly / Annual) and cohort. "Generate Report" button (crimson-red). Report preview (in-page): branded header with TBCN logo \+ partner logo side by side. Key Impact Metrics section: large number cards — Participants Trained, Certifications Earned, Avg Course Completion Rate, Total Learning Hours. Visual charts: Line chart showing enrollment over time (crimson-red line), Bar chart of completion by program (teal bars), Map visualization of participant locations. Qualitative section: "Success Stories" with 2-3 participant quote cards (avatar \+ quote \+ outcome). ROI Calculation table: Investment vs. Estimated Value Delivered. "Download PDF Report" amber-orange button \+ "Share via Email" teal button. Saved Reports list below: previous reports with date and download link. Warm cream background. |

**Screen 27  Partner Organization Profile**

| User Role | Partner |
| :---- | :---- |
| **Description** | Partner's organizational profile, branding, contact info, and co-branded program showcase. |
| **Stitch Prompt** | Design the Partner Organization Profile page for The Brand Coach Network following Apple HIG and unified dashboard layout. Two views: Edit Mode (for partner admin) and Public View (visible on platform directory). Header: company cover image/banner, company logo (large, square with rounded corners), company name, industry, website link, description paragraph. Partnership Tier badge (crimson-red "Impact Partner"). Contact details: email, phone, address. Programs Partnership section: list of co-branded programs with TBCN, shown as program cards with dual logos. Impact numbers: large stat display (e.g., "1,200 employees trained", "340 certifications"). Social media links. Edit Mode: all fields are editable inline, upload buttons for logo and banner, "Save Changes" crimson-red button. Public View: clean read-only layout with "Contact Partner" button. Mobile-responsive. Warm cream background. |

## **SECTION 5 — ADMIN SCREENS  (8 screens)**

**Screen 28  Admin Dashboard**

| User Role | Admin / Super Admin |
| :---- | :---- |
| **Description** | Platform-wide analytics and operations overview. Users, revenue, content, and system health. |
| **Stitch Prompt** | Design the Admin Dashboard for The Brand Coach Network following Apple HIG. Use the UNIFIED DASHBOARD LAYOUT — left sidebar (deep navy-teal) with nav: Dashboard, Users, Content, Programs, Events, Store, Analytics, Partners, Support, System. Sidebar shows "Admin Portal" label at top. Main content: Row 1 — Platform-wide KPI cards (6): Total Users, Active Today (DAU), New Signups (7 days), Total Revenue (MTD), Pending Approvals (amber-orange badge if \>0), Open Support Tickets. Row 2 — Revenue chart (area chart, crimson-red fill, last 30 days) \+ User Growth chart (teal line, last 3 months). Row 3 — Three columns: Recent Signups list, Pending Content Approvals list (with approve/reject quick actions), Recent Transactions list. Row 4 — System Health bar: Server Uptime %, API Response Time, Storage Used — all as mini progress bars. "Recent Activity" log at bottom: timestamped admin actions. Background: warm cream. Same structural grid as all other dashboards. |

**Screen 29  User Management**

| User Role | Admin |
| :---- | :---- |
| **Description** | Browse, search, filter, and manage all platform users. View profiles, change roles, suspend, and send messages. |
| **Stitch Prompt** | Design the User Management page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "User Management". Search bar \+ filter row: Role dropdown (All / Member / Coach / Partner / Admin), Status (Active / Suspended / Pending), Membership Tier, Country, Date Range. Results count shown. Users in a data table: checkbox, Avatar \+ Name, Email, Role badge (color-coded), Tier badge, Status badge, Joined date, Last Active, Actions (3-dot menu: View Profile, Edit Role, Suspend, Delete). Bulk action toolbar appears when checkboxes selected: Send Message, Export CSV, Bulk Role Change. Clicking a user opens a side panel with: full profile, activity log, subscription details, session history, admin notes field. "Add User" button (crimson-red) top right. Table pagination. Role badges: Coach=teal, Partner=amber, Admin=crimson-red, Member=muted. Warm cream background. |

**Screen 30  Content Approval Workflow**

| User Role | Admin / Content Manager |
| :---- | :---- |
| **Description** | Review and approve/reject community posts, courses, and coach-submitted content in a moderation queue. |
| **Stitch Prompt** | Design the Content Approval Workflow page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Content Approval Queue". Filter tabs: All | Courses | Community Posts | Coach Profiles | Events (each with count badge). Status filter: Pending | Editorial Approved | Brand Approved | Rejected. Content review list: each item shows — content type icon (color coded), title/preview, submitted by (avatar \+ name), submission date, current approval stage (pipeline indicator: Draft → Editorial → Brand → Published). Clicking an item opens a review panel: full content preview (video player if course, post text, event details), previous review notes, approve/reject buttons (teal approve / crimson-red reject), notes textarea for feedback, escalate button. Approval history log per item. "Approved" items get a teal checkmark, "Rejected" get a red X with reason displayed to creator. Notification sent automatically on status change. Warm cream background. |

**Screen 31  Program & Course Builder**

| User Role | Admin |
| :---- | :---- |
| **Description** | Admin tool to create, edit, and publish programs. Manage modules, lessons, pricing, and tier access. |
| **Stitch Prompt** | Design the Program / Course Builder page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Split-view layout: Left panel — Course Navigator (collapsible tree: Course \> Modules \> Lessons). Right panel — Content Editor for selected item. Course Level: form fields for Title, Description (rich text editor), Category, Cover Image upload (drag-drop), Instructor assignment dropdown (search coaches), Pricing (toggle: Free / Paid, price input, currency, tier access checkboxes), Certification toggle. Module Level: module title, description, order number (drag handle), add lesson button. Lesson Level: lesson title, video upload dropzone, lesson notes rich text, resource file upload, quiz toggle (with question builder if enabled), estimated duration. Top action bar: Save Draft (teal) \+ Publish (crimson-red) \+ Preview. Unsaved changes indicator. Module/lesson reordering via drag-and-drop. Progress autosave with green toast notification. Mobile: panels stack vertically. Warm cream background. |

**Screen 32  Event Manager**

| User Role | Admin |
| :---- | :---- |
| **Description** | Create, manage, and analyze platform events. Attendee lists, ticket management, and post-event reports. |
| **Stitch Prompt** | Design the Event Manager page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Event Manager". "Create New Event" crimson-red button. Events list: cards or table with event banner, title, date (crimson-red date chip), status (Upcoming=teal / Live=pulsing red / Completed / Cancelled), ticket sales progress bar (sold/total), revenue. Filter: by status, date range, type (Virtual / Physical / Hybrid). Clicking an event opens the event management panel: Event Details (editable), Attendee List (table: name, ticket tier, payment status, attended checkbox, export CSV button), Ticket Tiers management (add/edit tiers with price and capacity), Promotional code creator, Analytics tab (registration vs. attendance rate, revenue by tier, geographic breakdown chart), Reminders panel (schedule email/SMS reminders with timing settings). "Go Live" button for virtual events with Zoom link input. Post-event: certificate generation trigger. Warm cream background. |

**Screen 33  E-Commerce & Store Admin**

| User Role | Admin |
| :---- | :---- |
| **Description** | Manage digital products, physical merchandise, orders, inventory, and coupons. |
| **Stitch Prompt** | Design the E-Commerce Admin page for The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Store Management". Three tabs: Products | Orders | Coupons. Products tab: table of all products — image thumbnail, name, type (Digital=teal / Physical=amber), price, stock (N/A for digital), sales count, status (Active/Draft), Edit \+ Archive actions. "Add New Product" crimson-red button. Product editor slide-over: product name, description (rich text), images (multi-upload), product type toggle, price (with currency), stock quantity (physical only), downloadable file upload (digital), shipping dimensions (physical). Orders tab: orders table — order ID, customer name, product, amount, payment method badge (M-PESA / Stripe / PayPal), status (Paid=teal / Pending=amber / Refunded=muted), date, actions (View Receipt / Process Refund). Coupons tab: coupon list with code, discount type (% or fixed), expiry, usage count, active toggle. "Create Coupon" form. Warm cream background. |

**Screen 34  Analytics & Reports**

| User Role | Admin |
| :---- | :---- |
| **Description** | Platform-wide analytics: user growth, revenue, engagement, learning outcomes, and exportable reports. |
| **Stitch Prompt** | Design the Analytics & Reports page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Platform Analytics". Date range picker at top right (Last 7 / 30 / 90 days / Custom). Section 1 — User Analytics: line chart of DAU/WAU/MAU, funnel chart (Visitors → Registered → Active → Paid), geographic heatmap of users by country, top referral sources bar chart. Section 2 — Revenue Analytics: revenue by stream (subscriptions / courses / events / coaching / store) as stacked area chart, MRR trend line (crimson-red), ARPU metric card. Section 3 — Learning Outcomes: course completion rates bar chart (teal), certifications issued trend, average rating per course table. Section 4 — Community: post volume trend, top active members list, category breakdown pie chart. Section 5 — Export: "Download Full Report (PDF)" amber-orange button \+ "Export CSV" teal button. All charts use brand palette only. Interactive tooltips on hover. Warm cream background. |

**Screen 35  Support Ticket System**

| User Role | Admin |
| :---- | :---- |
| **Description** | View and respond to user support requests. Filter by status, category, and priority. |
| **Stitch Prompt** | Design the Support Ticket System page for an Admin on The Brand Coach Network following Apple HIG and unified dashboard layout. Page title: "Support Tickets". Stats row at top: Open Tickets (crimson-red), In Progress (amber), Resolved Today (teal), Avg Response Time. Filter row: Status (Open / In Progress / Resolved / Closed), Priority (High/Medium/Low), Category (Billing / Technical / Content / Account / Other), Assigned to (dropdown). Tickets in a data list: ticket ID, user avatar+name, subject, category badge, priority badge (crimson-red=High, amber=Medium, teal=Low), status badge, created time, last updated, assigned admin, "Open" button. Clicking a ticket opens a full ticket detail panel: user info block, original message, conversation thread (chat-bubble style), internal admin notes (hidden from user), status changer, priority changer, assign to dropdown, "Reply" rich text area, "Send Reply" crimson-red button, "Mark Resolved" teal button. Warm cream background. |

## **SECTION 6 — SHARED / SYSTEM SCREENS  (5 screens)**

**Screen 36  Checkout & Payment**

| User Role | All Users |
| :---- | :---- |
| **Description** | Universal checkout flow for subscriptions, courses, events, and merchandise. Multi-payment method support. |
| **Stitch Prompt** | Design a universal Checkout & Payment page for The Brand Coach Network following Apple HIG. Clean, minimal, trust-focused design. Order Summary card (right side desktop, top on mobile): item name \+ thumbnail, price, any discount applied (strikethrough original \+ new price in teal), platform fee, VAT (16%), total in large bold. Promo code input with "Apply" button. Left side (desktop), below on mobile: Payment Method selector — three tiled options: M-PESA (green with Safaricom logo), Stripe/Card (blue-gray card icon), PayPal (yellow PayPal icon). M-PESA selected: shows phone number input \+ "You will receive an M-PESA STK push prompt" instruction text. Card selected: card number, expiry, CVV fields with inline card type icon. Secure payment trust badges row (SSL, encrypted). "Complete Payment" crimson-red button, full width, large. Below button: refund policy text in muted. Payment processing state: animated loading spinner, "Processing your payment..." text. Success state: animated checkmark, order confirmation number, CTA button. Background: warm cream, no clutter. |

**Screen 37  Email Verification & Password Reset**

| User Role | All Users |
| :---- | :---- |
| **Description** | Email verification landing page and password reset flow. |
| **Stitch Prompt** | Design the Email Verification and Password Reset screens for The Brand Coach Network following Apple HIG. Screen A — Email Verification: centered card on cream background, TBCN logo at top, envelope illustration (amber-orange), heading "Verify Your Email", body text "We sent a verification link to your@email.com. Click the link to activate your account.", "Resend Email" teal text button, "Open Gmail" and "Open Outlook" shortcut buttons. After clicking link — success screen with checkmark animation, "Email Verified\!" heading, crimson-red "Go to Dashboard" button. Screen B — Forgot Password: centered card, email input with "Send Reset Link" crimson-red button. Screen C — Reset Password: two password inputs (New Password \+ Confirm), password strength bar, "Reset Password" crimson-red button. Success state: animated lock icon, "Password updated successfully" message, "Sign In" button. All screens: minimal, centered, branded, warm cream background, no sidebar. |

**Screen 38  Certificate Viewer**

| User Role | All Users |
| :---- | :---- |
| **Description** | Branded certificate display page with verification link, download, and share options. |
| **Stitch Prompt** | Design a Certificate Viewer page for The Brand Coach Network following Apple HIG. Full-width certificate preview (landscape orientation): elegant certificate design with TBCN logo (top center), decorative border in brand colors (crimson-red \+ teal), heading "Certificate of Completion", recipient name (large script-style), program title (bold), completion date, Winston Eboyi signature with title, QR verification code (bottom right corner), certificate ID number. Below certificate: action buttons row — "Download PDF" (crimson-red filled), "Share on LinkedIn" (teal outlined), "Copy Verification Link" (ghost outlined), "Print" (ghost). Certificate metadata: issued date, program name, issuing coach, skills gained chips (teal). Verification state shown: green checkmark "Verified Certificate" or orange warning if not found. Mobile: certificate shown at readable scale with zoom gesture, buttons stack below. Background: deep navy-teal header, warm cream content area. |

**Screen 39  Notifications & Email Preview**

| User Role | System |
| :---- | :---- |
| **Description** | Branded email template design used for all transactional and marketing emails from the platform. |
| **Stitch Prompt** | Design branded email templates for The Brand Coach Network following Apple-inspired email design principles. Template A — Welcome Email: TBCN logo on deep navy-teal header banner, warm cream body, "Welcome to The Brand Coach Network, \[Name\]\!" heading in bold, 2-sentence body copy, 3 quick start cards (icons \+ "Complete Profile" / "Explore Programs" / "Join Community"), crimson-red CTA button, footer with social icons \+ unsubscribe link. Template B — Course Completion: certificate thumbnail, "Congratulations \[Name\]\!" heading, program name, completion date, "Download Your Certificate" crimson-red button, "Share on LinkedIn" teal button. Template C — Payment Confirmation: receipt-style layout with order summary table, amount paid, payment method, order number, "View in Dashboard" button. Template D — Event Reminder: event banner, event name, date+time, location, "Join Now" / "Get Directions" button, add to calendar links. All templates: 600px wide, mobile preview at 375px, brand palette strictly applied. |

**Screen 40  404 / Error States**

| User Role | All Users |
| :---- | :---- |
| **Description** | Error screens for 404 not found, 403 access denied, 500 server error, and empty states. |
| **Stitch Prompt** | Design error and empty state screens for The Brand Coach Network following Apple HIG. Screen A — 404 Not Found: centered layout on warm cream background, large illustrated graphic of a lost character with TBCN branding elements, heading "Page Not Found", body "The page you're looking for has moved or doesn't exist.", "Go to Homepage" crimson-red button \+ "Go Back" teal ghost button. Screen B — 403 Access Denied / Upgrade Required: lock icon illustration, heading "This Content is for \[Build\] Members", body explaining what the tier includes, "Upgrade Now" crimson-red button, "Learn More" teal link, current tier badge shown. Screen C — 500 Server Error: broken server illustration with brand colors, "Something Went Wrong" heading, "We're working on it. Try again in a moment.", "Retry" button \+ "Contact Support" link. Screen D — Empty State (generic): illustrated empty box graphic, context-specific message (e.g., "No courses enrolled yet"), CTA button. All screens: minimal, illustrated, centered, brand palette, mobile-first. |

## **Summary: Full Screen Count per User Type**

| User Type | Screens | Screen Numbers |
| :---- | :---- | :---- |
| Public / Guest | **4** | 1–4 |
| Member | **11** | 5–15 |
| Coach | **7** | 16–22 |
| Partner / Enterprise | **5** | 23–27 |
| Admin | **8** | 28–35 |
| Shared / System | **5** | 36–40 |
| **TOTAL** | **40** | Complete MVP Screen Set |

**How to Use These Prompts in Google Stitch**

* 1\. Open Google Stitch (stitch.withgoogle.com) and create a new project for TBCN.

* 2\. Copy the "Stitch Prompt" for each screen exactly as written into Stitch's design generation prompt.

* 3\. Add this prefix to every prompt: "High-fidelity wireframe for a web application. " — then paste the screen prompt.

* 4\. After generation, apply your color variables from globals.css to replace Stitch's default palette.

* 5\. Dashboards (screens 6, 16, 23, 28): Stitch may vary layout — manually adjust all to match the UNIFIED DASHBOARD LAYOUT after generation.

* 6\. Use the component library feature in Stitch to save reusable components (nav sidebar, stats cards, data tables) after the first dashboard is designed.

Prepared for The Brand Coach Network  ·  UI Screen Inventory v1.0  ·  \#ABillionLivesGlobally