import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, DM_Sans, Syne } from "next/font/google";
import BrandLogo from "@/components/shared/BrandLogo";
import SocialLinksBar from "@/components/shared/SocialLinksBar";
import { marketingBlogPosts } from "@/lib/content/marketing";
import LandingPageEffects from "./landing-page-effects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The Brand Coach Network | Everyone is a Brand",
  description:
    "A cinematic journey from invisibility to impact. Discover your brand, build visibility, and thrive with The Brand Coach Network.",
};

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const painCards = [
  {
    icon: "MIRROR",
    title: "No Clarity on Who You Are",
    body: "You've achieved things, but you can't articulate your value in a room that matters. You don't know how to present yourself online, on stage, or on paper.",
  },
  {
    icon: "VOICE",
    title: "Visibility Without Strategy",
    body: "You're posting, showing up, and networking, but nothing is converting. Visibility without a brand story is just noise.",
  },
  {
    icon: "LINK",
    title: "Isolated From the Right Community",
    body: "Growth does not happen alone. Finding mentors, collaborators, and people who get your path still feels impossible.",
  },
];

const stats = [
  { value: "10K+", label: "Individuals empowered across Africa and beyond" },
  { value: "4+", label: "Integrated schools and academies in the ecosystem" },
  { value: "20+", label: "Countries represented in the global community" },
  {
    value: "1B",
    label: "Lives to touch through the #ABillionLivesGlobally mission",
  },
];

const journeyTiers = [
  {
    badge: "Free · Tier 1",
    title: "Discover",
    tagline: "Start your journey - discover the brand within you.",
    description:
      "You've arrived. Something brought you here: a feeling, a question, or the quiet sense that you're capable of more. No commitment. No cost. Just the first honest look at who you are and what you're building.",
    features: [
      "Introductory branding courses and insights",
      "Community forum access and live webinars",
      "Personal brand profile - your first digital identity",
      "Monthly newsletter and ecosystem updates",
    ],
  },
  {
    badge: "Premium · Tier 2",
    title: "Build",
    tagline: "Build your visibility, influence, and income.",
    description:
      "You know what you want. Now you need the tools, structure, and people who push you further. This is where clarity becomes strategy, and strategy becomes measurable results.",
    features: [
      "Full Personal Branding Academy and SME School access",
      "Downloadable brand audit and business toolkits",
      "Mentorship circles and mastermind sessions",
      "Certified completion - your brand credentialled",
    ],
  },
  {
    badge: "Pro · Tier 3",
    title: "Thrive",
    tagline: "Your brand now powers others.",
    description:
      "You've done the work. Now it's time to lead. Teach, coach, and co-create while building a legacy that outlasts a single program.",
    features: [
      "Host and teach branded programs in the ecosystem",
      "Featured listing in The Brand Coach Directory",
      "Co-branding and partnership opportunities",
      "Priority access to #ABillionLivesGlobally initiatives",
    ],
  },
  {
    badge: "Enterprise · Tier 4",
    title: "Impact",
    tagline: "Empower communities through partnership.",
    description:
      "This is where organizations and development partners come to create real change at scale through co-branded learning spaces, Community Empowerment Centres, and meaningful impact data.",
    features: [
      "Co-branded learning spaces for teams and communities",
      "Community Empowerment Centre partnership model",
      "Custom impact analytics and quarterly strategy sessions",
      "Exclusive sponsorship visibility across the ecosystem",
    ],
  },
];

const stories = [
  {
    initials: "AK",
    before: "Invisible Professional",
    after: "Thought Leader",
    quote:
      "I had 12 years of experience and couldn't explain what I did in a sentence that made people lean in. Three months in the Branding Academy and I had offers I never thought possible.",
    name: "Amara O.",
    role: "Corporate Strategist -> Brand Consultant, Lagos",
  },
  {
    initials: "JN",
    before: "Struggling SME",
    after: "Market-Ready Brand",
    quote:
      "My product was good but my brand was invisible. The SME School didn't just teach me marketing, it showed me how to own the story my business was already telling.",
    name: "James N.",
    role: "SME Founder, Nairobi -> Regional Distribution Partner",
  },
  {
    initials: "FD",
    before: "Recent Graduate",
    after: "Brand Champion",
    quote:
      "I started on the free tier with no money, just curiosity. That decision changed the direction of my entire career. I now coach others through the same journey.",
    name: "Fatima D.",
    role: "Graduate -> Certified Brand Coach, Accra",
  },
];

export default function HomePage() {
  return (
    <div
      className={`${styles.page} ${cormorant.variable} ${syne.variable} ${dmSans.variable}`}
    >
      <div className={styles.shell}>
        <LandingPageEffects
          navClass={styles.nav}
          navScrolledClass={styles.navScrolled}
          revealClass={styles.reveal}
          visibleClass={styles.visible}
        />

        <nav
          className={styles.nav}
          aria-label="Primary navigation"
          data-landing-nav="true"
        >
          <BrandLogo
            size={38}
            priority
            className={styles.navLogo}
            imageWrapperClassName={styles.logoMark}
          />
          <ul className={styles.navLinks}>
            <li>
              <a href="#programs">Programs</a>
            </li>
            <li>
              <a href="#community">Community</a>
            </li>
            <li>
              <a href="#programs">Coaches</a>
            </li>
            <li>
              <a href="#programs">Partners</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
          <button
            type="button"
            data-href="/register"
            className={styles.navCta}
            aria-label="Start your journey"
          >
            Start Your Journey
          </button>
        </nav>

        <main>
          <section className={styles.hero} aria-label="Act 1 The Mirror">
            <div className={styles.heroGrid} />
            <div className={styles.heroGlow} />
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>
                <div className={styles.eyebrowLine} />
                <span className={styles.label}>Everyone is a Brand(TM)</span>
                <div className={styles.eyebrowLine} />
              </div>
              <h1 className={styles.headline}>
                <span className={styles.headlineLine1}>
                  You were never just a
                </span>
                <em className={styles.headlineLine2}>
                  person trying to get by.
                </em>
                <span className={styles.breakRed}>
                  You were always a Brand.
                </span>
              </h1>
              <p className={styles.sub}>
                The world does not reward the most talented. It rewards the most
                visible. The Brand Coach Network exists to change that for you,
                and for a billion lives like yours.
              </p>
              <div className={styles.ctas}>
                <button
                  type="button"
                  data-href="/register"
                  className={styles.btnPrimary}
                  aria-label="Discover your brand for free"
                >
                  Discover Your Brand - Free
                </button>
                <a href="#programs" className={styles.btnGhost}>
                  See How It Works
                </a>
              </div>
            </div>
            <div className={styles.scrollIndicator}>
              <div className={styles.scrollLine} />
              <span className={styles.scrollLabel}>scroll</span>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.wound}`}
            aria-label="Act 2 The Wound"
          >
            <div className={styles.woundTexture} />
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act II - The Reality</span>
            </div>
            <div className={styles.inner}>
              <div className={styles.introGrid}>
                <div>
                  <div className={styles.largeNum}>02</div>
                  <h2 className={styles.sectionHeadline}>
                    Talented.
                    <br />
                    Hard-working.
                    <br />
                    <strong>Still invisible.</strong>
                  </h2>
                </div>
                <div>
                  <p className={styles.statement}>
                    You've put in the work. You have the skills, the hustle, the
                    ideas, but somehow the right opportunities keep going to
                    <span> people who know how to show up</span>. It's not that
                    you're not good enough.
                  </p>
                  <p className={styles.statement}>
                    It's that the world can't see what you're worth, because
                    <span> nobody taught you how to own your brand</span>. Your
                    career, your business, your impact, all of it is held back
                    by one missing piece.
                  </p>
                  <p className={styles.statement}>
                    This is the gap. And it costs more than most people realize,
                    not just in income, but in
                    <span> purpose, belonging, and momentum</span>. You were
                    built to thrive. What's stopping you?
                  </p>
                </div>
              </div>
              <div className={styles.pains}>
                {painCards.map((pain, index) => (
                  <article
                    key={pain.title}
                    className={`${styles.painCard} ${styles.reveal} ${index === 1 ? styles.delay1 : ""} ${index === 2 ? styles.delay2 : ""}`}
                  >
                    <span className={styles.painIcon}>{pain.icon}</span>
                    <h3 className={styles.painTitle}>{pain.title}</h3>
                    <p className={styles.painDesc}>{pain.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.reframe}`}
            aria-label="Act 3 The Reframe"
          >
            <div className={styles.reframeCircle} />
            <div className={styles.reframeCircle2} />
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act III - The Shift</span>
            </div>
            <div className={`${styles.inner} ${styles.reveal}`}>
              <div className={styles.reframeMark} />
              <p className={styles.reframeQuote}>
                &quot;Everyone is a Brand
                <span className={styles.registered}>(TM)</span>
                &quot;
              </p>
              <p className={styles.reframeSub}>
                Not a slogan. A declaration. You carry a story, a set of values,
                and a unique impact only you can make. The Brand Coach Network
                was built on one belief: when people understand and own their
                brand, they do not just succeed. They transform, and their
                transformation transforms the people around them.
              </p>
            </div>
          </section>

          <section
            id="about"
            className={`${styles.section} ${styles.guide}`}
            aria-label="Act 4 The Guide"
          >
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act IV - The Network</span>
            </div>
            <div className={styles.guideGrid}>
              <div className={styles.reveal}>
                <span className={styles.guideLabel}>Who We Are</span>
                <h2 className={styles.guideHeadline}>
                  We don't just teach branding.
                  <br />
                  <strong>We walk with you through it.</strong>
                </h2>
                <p className={styles.guideBody}>
                  The Brand Coach Network is Africa's storytelling-powered
                  human capital & community empowerment infrastructure,
                  designed to solve youth unemployment at scale and tell a
                  different African story to the world 🌎.
                </p>
                <p className={styles.guideBody}>
                  We've walked with entrepreneurs who had nothing but a dream,
                  professionals who had lost their spark, and communities that
                  needed someone to believe in their potential. Every time, the
                  outcome is the same: clarity leads to confidence, confidence
                  leads to action, and action leads to transformation.
                </p>
                <p className={styles.guideBody}>
                  And ladies and gentlemen, this is an express welcome to help
                  you turn your story into your career advantage.{" "}
                  <Link href="/register" className={styles.guideInlineCta}>
                    Start your journey.
                  </Link>
                </p>
                <div className={styles.missionBadge}>
                  <span className={styles.dot} />
                  #ABillionLivesGlobally
                </div>
              </div>
              <div className={styles.reveal}>
                <div className={styles.statGrid}>
                  {stats.map((stat) => (
                    <article key={stat.value} className={styles.stat}>
                      <p className={styles.statNum}>
                        {stat.value.replace("+", "")}
                        {stat.value.includes("+") ? <span>+</span> : null}
                      </p>
                      <p className={styles.statDesc}>{stat.label}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="blog"
            className={`${styles.section} ${styles.blog}`}
            aria-label="The Brand Coach Blog"
          >
            <div className={styles.blogGlow} />
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>From the Blog</span>
            </div>
            <div className={styles.blogInner}>
              <div className={styles.blogHeader}>
                <div className={styles.reveal}>
                  <span className={styles.blogLabel}>Published Insights</span>
                  <h2 className={styles.blogHeadline}>
                    Fresh thinking from
                    <br />
                    <strong>the Brand Coach desk.</strong>
                  </h2>
                </div>
                <div className={`${styles.blogCopy} ${styles.reveal}`}>
                  <p>
                    The latest articles, essays, and newsletter drops from the
                    network live here, so visitors can move from inspiration
                    into practical next steps without leaving the story.
                  </p>
                  <p>
                    As the publishing desk grows, this section becomes the front
                    door to what the team is writing, teaching, and sharing with
                    the wider ecosystem.
                  </p>
                </div>
              </div>

              <div className={styles.blogGrid}>
                {marketingBlogPosts.map((post) => (
                  <a
                    key={post.href}
                    href={post.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.blogCard} ${styles.reveal}`}
                  >
                    <span className={styles.blogCardTag}>{post.tag}</span>
                    <h3 className={styles.blogCardTitle}>{post.title}</h3>
                    <p className={styles.blogCardExcerpt}>{post.excerpt}</p>
                    <div className={styles.blogCardMeta}>
                      <span>{post.source}</span>
                      <span>Read now</span>
                    </div>
                    <span className={styles.blogCardCta}>
                      {post.ctaLabel} -&gt;
                    </span>
                  </a>
                ))}
              </div>

              <div className={styles.blogCtaRow}>
                <p className={styles.blogCtaText}>
                  Want the wider publishing archive? Open the full blog hub and
                  follow the network across every content channel.
                </p>
                <Link href="/blog" className={styles.btnGhost}>
                  Visit the Blog Hub
                </Link>
              </div>
            </div>
          </section>

          <section
            id="programs"
            className={`${styles.section} ${styles.ecosystem}`}
            aria-label="Act 5 The Map"
          >
            <div className={styles.ecoAccent} />
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act V - Your Journey</span>
            </div>
            <div className={`${styles.ecoHeader} ${styles.reveal}`}>
              <span className={styles.label}>
                The Path From Surviving to Thriving
              </span>
              <h2 className={styles.ecoHeadline}>
                Your journey starts <em>wherever you are.</em>
                <br />
                And it ends where you choose.
              </h2>
              <p className={styles.ecoSub}>
                Every transformation is unique. That's why the Brand Coach
                Network is a living ecosystem: four entry points, one continuous
                path. Find where you are, and take the next step.
              </p>
            </div>

            <div className={styles.journey}>
              {journeyTiers.map((tier, index) => {
                const rightAligned = index % 2 === 1;

                return (
                  <div
                    key={tier.title}
                    className={`${styles.tierRow} ${rightAligned ? styles.rightCard : ""}`}
                  >
                    <div className={styles.tierCard}>
                      <span className={styles.tierBadge}>{tier.badge}</span>
                      <h3 className={styles.tierTitle}>{tier.title}</h3>
                      <p className={styles.tierTagline}>{tier.tagline}</p>
                      <p className={styles.tierDesc}>{tier.description}</p>
                      <ul className={styles.tierFeatures}>
                        {tier.features.map((feature) => (
                          <li key={`${tier.title}-${feature}`}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.tierNode}>
                      <div className={styles.tierDot} />
                      <span className={styles.tierNum}>{`0${index + 1}`}</span>
                    </div>
                    <div className={styles.tierSpacer} />
                  </div>
                );
              })}
            </div>

            <div className={styles.centerCta}>
              <p className={styles.centerCtaLabel}>
                Not sure where to start? Take the free Brand Discovery
                assessment, it finds your entry point for you.
              </p>
              <button
                type="button"
                data-href="/register"
                className={styles.btnPrimary}
                aria-label="Take the free assessment"
              >
                Take the Free Assessment
              </button>
            </div>
          </section>

          <section
            id="community"
            className={`${styles.section} ${styles.community}`}
            aria-label="Act 6 Community and Proof"
          >
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act VI - The Community</span>
            </div>
            <div className={styles.communityHeader}>
              <div className={styles.reveal}>
                <span className={styles.label}>
                  Real People. Real Transformations.
                </span>
                <h2 className={styles.communityHeadline}>
                  You won't be learning
                  <br />
                  <strong>in a vacuum.</strong>
                  <br />
                  You'll be rising
                  <br />
                  <strong>with a movement.</strong>
                </h2>
              </div>
              <div className={`${styles.communitySub} ${styles.reveal}`}>
                <p>
                  The most powerful thing about The Brand Coach Network isn't
                  the curriculum. It's the community that forms around it,
                  coaches, entrepreneurs, professionals, and changemakers who
                  chose to stop surviving and start thriving.
                </p>
                <p>
                  When you join, you don't just get programs. You get people,
                  people a few steps ahead, a few steps behind, and right beside
                  you moving toward brand, purpose, and impact.
                </p>
              </div>
            </div>

            <div className={styles.storyGrid}>
              {stories.map((story) => (
                <article key={story.name} className={styles.storyCard}>
                  <div className={styles.storyAvatar}>{story.initials}</div>
                  <div className={styles.storyTags}>
                    <span className={styles.storyBefore}>{story.before}</span>
                    <span className={styles.storyArrow}>-&gt;</span>
                    <span className={styles.storyAfter}>{story.after}</span>
                  </div>
                  <p className={styles.storyQuote}>&quot;{story.quote}&quot;</p>
                  <p className={styles.storyName}>{story.name}</p>
                  <p className={styles.storyRole}>{story.role}</p>
                </article>
              ))}
            </div>

            <div className={styles.pulse}>
              <div className={styles.pulseLive}>
                <div className={styles.pulseDot} />
                <span className={styles.pulseLabel}>Community Live</span>
              </div>
              <div className={styles.pulseMetrics}>
                <div>
                  <p className={styles.pulseMetricNum}>
                    4,200<span>+</span>
                  </p>
                  <p className={styles.pulseMetricLabel}>Active Members</p>
                </div>
                <div>
                  <p className={styles.pulseMetricNum}>
                    20<span>+</span>
                  </p>
                  <p className={styles.pulseMetricLabel}>
                    Countries Represented
                  </p>
                </div>
                <div>
                  <p className={styles.pulseMetricNum}>
                    380<span>+</span>
                  </p>
                  <p className={styles.pulseMetricLabel}>
                    Programs Completed This Month
                  </p>
                </div>
                <div>
                  <p className={styles.pulseMetricNum}>
                    62<span>+</span>
                  </p>
                  <p className={styles.pulseMetricLabel}>Certified Coaches</p>
                </div>
              </div>
              <Link href="/register" className={styles.pulseCta}>
                Join the Community -&gt;
              </Link>
            </div>
          </section>

          <section
            id="join"
            className={`${styles.section} ${styles.call}`}
            aria-label="Act 7 The Call"
          >
            <div className={styles.callBg} />
            <div className={styles.sectionFloater}>
              <div className={styles.sectionLine} />
              <span className={styles.label}>Act VII - Your Move</span>
            </div>
            <div className={`${styles.callInner} ${styles.reveal}`}>
              <p className={styles.callPre}>
                - You've seen the path. You know what's possible. -
              </p>
              <h2 className={styles.callHeadline}>
                The only question left is
                <br />
                <em>how long you'll wait</em>
                <strong>to become who you already are.</strong>
              </h2>
              <p className={styles.callBody}>
                Your brand is already there. It's been waiting for you to claim
                it. Start free. Start today. Join a community of thousands
                across Africa and beyond who chose to stop surviving and started
                building something that outlasts them.
              </p>
              <div className={styles.ctas}>
                <button
                  type="button"
                  data-href="/register"
                  className={`${styles.btnPrimary} ${styles.largeCta}`}
                  aria-label="Start your journey for free"
                >
                  Start Your Journey - It's Free
                </button>
                <a href="#programs" className={styles.btnGhost}>
                  Explore Premium Programs
                </a>
              </div>
              <p className={styles.callNote}>
                No credit card required · Cancel anytime · Part of a global
                cause
              </p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div>
            <BrandLogo
              size={42}
              className={styles.footerBrand}
              imageWrapperClassName={styles.logoMark}
            />
            <p className={styles.footerTag}>
              From Surviving Individuals to Thriving Brands(TM)
            </p>
            <div className={styles.footerMission}>
              <span className={styles.dot} />
              #ABillionLivesGlobally
            </div>
          </div>
          <div>
            <p className={styles.footerTitle}>Programs</p>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#programs">Personal Branding Academy</a>
              </li>
              <li>
                <a href="#programs">The SME School</a>
              </li>
              <li>
                <a href="#programs">Finding Yourself</a>
              </li>
              <li>
                <a href="#programs">Skills Stacking</a>
              </li>
              <li>
                <a href="#programs">CEC Partnership</a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.footerTitle}>Community</p>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#community">Member Directory</a>
              </li>
              <li>
                <a href="#community">Coach Network</a>
              </li>
              <li>
                <a href="#community">Events and Webinars</a>
              </li>
              <li>
                <a href="#blog">Brand Coach Blog</a>
              </li>
              <li>
                <a href="#community">Forum and Circles</a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.footerTitle}>Partner</p>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#programs">Sponsor a Program</a>
              </li>
              <li>
                <a href="#programs">Investor Relations</a>
              </li>
              <li>
                <a href="#programs">Enterprise Tier</a>
              </li>
              <li>
                <a href="#programs">Become a Coach</a>
              </li>
              <li>
                <a href="#about">Contact Us</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerSocialPanel}>
            <SocialLinksBar
              className={styles.footerSocialIcons}
              linkClassName={styles.footerSocialIconLink}
            />
          </div>
        </footer>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            © {new Date().getFullYear()} The Brand Coach Network. All rights
            reserved.
          </span>
          <span className={styles.footerCopy}>
            Built to empower · Designed to inspire · Made for Africa and beyond
          </span>
        </div>
      </div>
    </div>
  );
}
