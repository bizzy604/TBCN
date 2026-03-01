export interface ArchitectureSubPage {
  title: string;
  anchorId: string;
  description: string;
}

export interface ArchitectureSection {
  title: string;
  anchorId: string;
  description: string;
  subPages: ArchitectureSubPage[];
}

export const SITE_ARCHITECTURE: ArchitectureSection[] = [
  {
    title: 'Community',
    anchorId: 'community',
    description:
      'Community addresses isolation and access barriers through circles, discussions, mentorship, events, and local empowerment hubs that move people from learning to real-world outcomes.',
    subPages: [
      {
        title: '#ABillionLivesGlobally',
        anchorId: 'community-abillion-lives-globally',
        description:
          'The mission backbone of the platform: transform aspiring brands into thriving global contributors through measurable community impact and empowerment outcomes.',
      },
      {
        title: 'CCC (Career Counseling Centers)',
        anchorId: 'community-ccc',
        description:
          'Career counseling pathways help members clarify identity, improve visibility, and transition into stronger opportunities using mentorship, assessments, and coaching support.',
      },
      {
        title: 'CEC (Community Empowerment Center)',
        anchorId: 'community-cec',
        description:
          'Grassroots centers connect local communities to digital training and support, with participant tracking and impact reporting to show measurable change.',
      },
      {
        title: 'The SME School',
        anchorId: 'community-the-sme-school',
        description:
          'Structured SME learning tracks deliver practical brand and business development through modular programs, assignments, and certifications.',
      },
      {
        title: 'The Brand Coach Circle',
        anchorId: 'community-brand-coach-circle',
        description:
          'A moderated peer community with discussions, stories, direct collaboration, and mentorship requests designed to sustain accountability and growth.',
      },
      {
        title: 'Events (Finding Work Conferences, ATA, Finding Work Global Summit)',
        anchorId: 'community-events',
        description:
          'Community events and masterclasses provide live learning, networking, and momentum with registration, reminders, participation tracking, and replay support.',
      },
      {
        title: 'Membership',
        anchorId: 'community-membership',
        description:
          'Tiered membership creates a clear value ladder from entry access to advanced coaching, analytics, and enterprise support.',
      },
    ],
  },
  {
    title: 'Collaboration',
    anchorId: 'collaboration',
    description:
      'Collaboration turns learning into shared execution through partner programs, institutional onboarding, innovation submissions, and service exchange channels.',
    subPages: [
      {
        title: 'TBCN Workforce & Talent Solutions',
        anchorId: 'collaboration-workforce-talent-solutions',
        description:
          'Institutional training solutions for employees and beneficiaries with cohort setup, participant enrollment, progress dashboards, and outcome reporting.',
      },
      {
        title: 'Media & Publishing',
        anchorId: 'collaboration-media-publishing',
        description:
          'Publishing pathways for stories, guides, and thought leadership content that amplify visibility, credibility, and community learning.',
      },
      {
        title: 'Office Solutions',
        anchorId: 'collaboration-office-solutions',
        description:
          'Operational collaboration tooling for organizations: onboarding support, participant management, invoicing visibility, and coordinated execution.',
      },
      {
        title: 'Partnerships (HUB)',
        anchorId: 'collaboration-partnerships-hub',
        description:
          'A structured partner journey from inquiry to launch, including discovery calls, proposal alignment, co-branding, and recurring impact reviews.',
      },
      {
        title: 'KEM Marketplace (Coaches, Trainers, Mentors, etc.)',
        anchorId: 'collaboration-kem-marketplace',
        description:
          'A searchable ecosystem where verified professionals can list services, generate leads, and connect members to coaches, trainers, and mentors.',
      },
      {
        title: 'High Level Engagements (Masterclass, Awards & Gala, Mentors Mingle)',
        anchorId: 'collaboration-high-level-engagements',
        description:
          'Premium engagement formats that combine expert masterclasses, recognition moments, and strategic networking to deepen trust and visibility.',
      },
      {
        title: 'Global Alliances',
        anchorId: 'collaboration-global-alliances',
        description:
          'Cross-border partnerships and alliances designed to scale impact across countries through co-branded initiatives and measurable results.',
      },
    ],
  },
  {
    title: 'Coaching',
    anchorId: 'coaching',
    description:
      'Coaching provides structured transformation through programs, assessments, and live sessions that convert personal potential into sustained brand outcomes.',
    subPages: [
      {
        title: 'About The Brand Coach',
        anchorId: 'coaching-about-the-brand-coach',
        description:
          'This section presents the leadership and coaching philosophy of Winston Eboyi (The Brand Coach), whose credibility and guidance anchor the ecosystem.',
      },
      {
        title: 'About TBCN',
        anchorId: 'coaching-about-tbcn',
        description:
          'TBCN is positioned as a mission-driven digital ecosystem combining coaching, community, and commerce for measurable transformation.',
      },
      {
        title: 'Programs',
        anchorId: 'coaching-programs',
        description:
          'Program delivery includes modular lessons, downloadable resources, quizzes, assignments, and certificates mapped to practical outcomes.',
      },
      {
        title: '1:1 Coaching',
        anchorId: 'coaching-one-to-one',
        description:
          'One-on-one sessions support personalized growth with calendar booking, reminders, meeting links, rescheduling controls, and feedback capture.',
      },
      {
        title: 'Group Coaching',
        anchorId: 'coaching-group',
        description:
          'Group coaching creates shared momentum through cohort sessions, collaborative learning, and accountability across similar growth journeys.',
      },
      {
        title: 'Annual Engagements (Speaking, Training, Advisory)',
        anchorId: 'coaching-annual-engagements',
        description:
          'Annual engagements package speaking, advisory, and institutional training into high-impact delivery formats for organizations and communities.',
      },
      {
        title: 'Marketplace',
        anchorId: 'coaching-marketplace',
        description:
          'Coaching marketplace visibility enables coaches and experts to publish services, receive inquiries, and convert expertise into sustainable income.',
      },
    ],
  },
];
