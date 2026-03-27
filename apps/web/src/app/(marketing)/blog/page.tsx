import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { marketingBlogPosts } from "@/lib/content/marketing";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, stories, and practical brand growth guidance from The Brand Coach Network.",
};

export default function BlogPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <NewspaperIcon className="h-4 w-4" />
              Media & Publishing
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              TBCN <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Practical insights, essays, and newsletters on personal branding,
              leadership, visibility, and community transformation.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {marketingBlogPosts.map((post) => (
              <a
                key={post.href}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="card-hover flex h-full flex-col p-6"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {post.tag}
                </p>
                <h2 className="mb-3 text-xl font-semibold">{post.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  <span>{post.source}</span>
                  <span>{post.ctaLabel}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/#blog" className="btn-primary btn-lg">
              Back to Featured Stories
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
