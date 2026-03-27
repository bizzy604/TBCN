export type MarketingBlogPost = {
  tag: string;
  title: string;
  excerpt: string;
  href: string;
  source: string;
  ctaLabel: string;
};

export type SocialMediaLink = {
  icon:
    | "blog"
    | "book"
    | "facebook"
    | "globe"
    | "graduation"
    | "instagram"
    | "linkedin"
    | "mail"
    | "message"
    | "music"
    | "newspaper"
    | "notebook"
    | "send"
    | "twitter"
    | "users"
    | "youtube";
  label: string;
  href: string;
};

export const marketingBlogPosts: MarketingBlogPost[] = [
  {
    tag: "Official Blog",
    title: "Unveiling the Soul of African Businesses",
    excerpt:
      "A flagship reflection on branding beyond pixels, helping founders and professionals rediscover the deeper soul of African business storytelling.",
    href: "https://brandcoachnetwork.com/blog/Unveiling-the-Soul-of-African-Businesses-The-True-Essence-of-Branding-beyond-Pixels",
    source: "brandcoachnetwork.com",
    ctaLabel: "Read the feature",
  },
  {
    tag: "Medium",
    title: "Clarity is power. Ownership is brand. Visibility is equity.",
    excerpt:
      "A practical essay on why clarity, ownership, and visibility compound into influence, trust, and business growth.",
    href: "https://medium.com/@TheBrandCoach/clarity-is-power-ownership-is-brand-visibility-is-equity-3342448d6688",
    source: "Medium",
    ctaLabel: "Read on Medium",
  },
  {
    tag: "Newsletter",
    title: "A Billion Lives Globally",
    excerpt:
      "Follow the network newsletter for recurring leadership, branding, and ecosystem updates tied to the mission of touching a billion lives.",
    href: "https://www.linkedin.com/newsletters/a-billion-lives-globally-7158189937144561664",
    source: "LinkedIn Newsletter",
    ctaLabel: "Open the newsletter",
  },
];

export const socialMediaLinks: SocialMediaLink[] = [
  {
    icon: "message",
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029Va6uoWcCxoAoYKWfRV2K",
  },
  {
    icon: "message",
    label: "WhatsApp Community",
    href: "https://chat.whatsapp.com/KNQ4rKVPQQn8N9ROEuAYWU",
  },
  {
    icon: "send",
    label: "Telegram",
    href: "https://t.me/TheBrandCoachNetwork",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/%C2%A9the-brand-coach%E2%84%A2-network/",
  },
  {
    icon: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/thebrandcoachnetwork?mibextid=rS40aB7S9Ucbxw6v",
  },
  {
    icon: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/winston_tony?utm_source=qr&igsh=eXpqYjdycHNhZWZl",
  },
  {
    icon: "twitter",
    label: "X / Twitter",
    href: "https://x.com/Winstontony8?t=92ZiTM75wEqyurhZhe8jOg&s=08",
  },
  {
    icon: "music",
    label: "TikTok",
    href: "https://vm.tiktok.com/ZMM7JQaPd/",
  },
  {
    icon: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@brandcoachnetwork?si=CF33IkiRkWNT3wzw",
  },
  {
    icon: "blog",
    label: "Blog",
    href: "https://brandcoachnetwork.com/blog/Unveiling-the-Soul-of-African-Businesses-The-True-Essence-of-Branding-beyond-Pixels",
  },
  {
    icon: "globe",
    label: "Website",
    href: "https://brandcoachnetwork.com/",
  },
  {
    icon: "notebook",
    label: "Substack",
    href: "https://substack.com/@thebrandcoach?utm_source=share&utm_medium=android&r=1o5034",
  },
  {
    icon: "book",
    label: "Medium",
    href: "https://medium.com/@TheBrandCoach/clarity-is-power-ownership-is-brand-visibility-is-equity-3342448d6688",
  },
  {
    icon: "graduation",
    label: "Skool",
    href: "https://www.skool.com/@winston-eboyi-5860?g=a-billion-lives-globally-1323",
  },
  {
    icon: "newspaper",
    label: "Newsletter",
    href: "https://www.linkedin.com/newsletters/a-billion-lives-globally-7158189937144561664",
  },
  {
    icon: "users",
    label: "Facebook Community",
    href: "https://www.facebook.com/groups/276994819105303/?ref=share&mibextid=NSMWBT",
  },
];
