import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { getAllPosts, formatDate, type BlogPostMeta } from "@/lib/blog";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and insights about 3D printing. Learn about materials, design tips, and how to get the most out of your custom prints.",
  keywords: [
    "3D printing blog",
    "3D printing tips",
    "PLA vs PETG",
    "3D printing guides",
    "custom 3D printing",
    "3D design tips",
  ],
  openGraph: {
    title: "Blog | Mandarin3D",
    description:
      "Tips, guides, and insights about 3D printing from Jacksonville, FL.",
    url: "https://mandarin3d.com/blog",
  },
  alternates: {
    canonical: "https://mandarin3d.com/blog",
  },
};

function BlogPostCard({ post }: { post: BlogPostMeta }) {
  // Use the dynamic cover image API, fall back to featuredImage if specified
  const coverImageSrc = `/api/blog/image/${post.slug}` || post.featuredImage;

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-muted">
          {/* Using native img for API route that returns binary image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageSrc}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(post.date)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
          </div>

          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-2 pt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground leading-none"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Blog
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          3D Printing Tips & Insights
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Guides, tutorials, and thoughts on 3D printing. Whether you're new to 
          the craft or a seasoned pro, there's something here for you.
        </p>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-lg mb-2">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for 3D printing tips and guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Ready to Print Something?
          </h2>
          <p className="text-muted-foreground mb-6">
            Upload your 3D model and get an instant quote. No account required.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
          >
            Get an Instant Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
