import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header } from "@/components/header";
import { mdxComponents } from "@/components/mdx-components";
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
  formatDate,
} from "@/lib/blog";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate dynamic metadata for each post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { meta } = getPostBySlug(slug);

    // Use the dynamic cover image API for OpenGraph
    const ogImageUrl = meta.featuredImage || `https://mandarin3d.com/api/blog/image/${slug}`;

    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.tags,
      authors: [{ name: meta.author }],
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: `https://mandarin3d.com/blog/${slug}`,
        type: "article",
        publishedTime: meta.date,
        authors: [meta.author],
        tags: meta.tags,
        images: [
          {
            url: ogImageUrl,
            width: 1920,
            height: 1080,
            alt: meta.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `https://mandarin3d.com/blog/${slug}`,
      },
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { meta, content } = post;
  const relatedPosts = getRelatedPosts(meta);

  // Use the dynamic cover image API, fall back to featuredImage if specified
  const coverImageSrc = `/api/blog/image/${slug}` || meta.featuredImage;

  // JSON-LD structured data for article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: meta.featuredImage || `https://mandarin3d.com/api/blog/image/${slug}`,
    datePublished: meta.date,
    author: {
      "@type": "Organization",
      name: meta.author,
      url: "https://mandarin3d.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Mandarin3D",
      logo: {
        "@type": "ImageObject",
        url: "https://mandarin3d.com/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mandarin3d.com/blog/${slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        <Header />
      </div>

      {/* Article Header */}
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Category */}
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
          {meta.category}
        </p>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          {meta.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
          <span>{formatDate(meta.date)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {meta.readingTime}
          </span>
          <span>•</span>
          <span>By {meta.author}</span>
        </div>

        {/* Featured Image - always show using dynamic API */}
        <div className="relative aspect-[16/9] mb-10 overflow-hidden rounded-lg bg-muted">
          {/* Using native img for API route that returns binary image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageSrc}
            alt={meta.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Tags */}
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-border">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-sm px-3 py-1.5 bg-muted rounded-full text-muted-foreground leading-none"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Content */}
        <div className="prose-custom">
          <MDXRemote source={content} components={mdxComponents} />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold tracking-tight mb-8">
              Related Posts
            </h2>

            <div className="space-y-6">
              {relatedPosts.map((relatedPost) => {
                const relatedCoverSrc = relatedPost.featuredImage || `/api/blog/image/${relatedPost.slug}`;
                return (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relatedCoverSrc}
                          alt={relatedPost.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">
                          {formatDate(relatedPost.date)}
                        </p>
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {relatedPost.description}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-border">
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
