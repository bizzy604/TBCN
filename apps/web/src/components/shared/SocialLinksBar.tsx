import type { ComponentType } from "react";
import {
  BookText,
  Facebook,
  FileText,
  Globe,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Newspaper,
  NotebookText,
  Send,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import {
  socialMediaLinks,
  type SocialMediaLink,
} from "@/lib/content/marketing";
import { cn } from "@/lib/utils";

type SocialLinksBarProps = {
  className?: string;
  iconClassName?: string;
  linkClassName?: string;
};

type IconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number | string;
}>;

const iconMap: Record<SocialMediaLink["icon"], IconComponent> = {
  blog: FileText,
  book: BookText,
  facebook: Facebook,
  globe: Globe,
  graduation: GraduationCap,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
  message: MessageCircle,
  music: Music2,
  newspaper: Newspaper,
  notebook: NotebookText,
  send: Send,
  twitter: Twitter,
  users: Users,
  youtube: Youtube,
};

export default function SocialLinksBar({
  className,
  iconClassName,
  linkClassName,
}: SocialLinksBarProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-4 pt-3 sm:gap-5",
        className,
      )}
    >
      {socialMediaLinks.map((link) => {
        const Icon = iconMap[link.icon];

        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            className={cn(
              "group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition",
              linkClassName,
            )}
          >
            <span
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
              )}
            >
              {link.label}
            </span>
            <Icon className={cn("h-4 w-4", iconClassName)} strokeWidth={1.9} />
            <span className="sr-only">{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
