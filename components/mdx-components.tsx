import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

/**
 * Custom MDX components for blog posts
 * Styled to match the minimal aesthetic of the site
 */
export const mdxComponents: MDXComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-12 mb-6 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
      {children}
    </p>
  ),

  // Links
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline underline-offset-4"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || "#"}
        className="text-primary hover:underline underline-offset-4"
      >
        {children}
      </Link>
    );
  },

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-lg text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-lg text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 pl-6 py-2 my-6 italic text-lg text-muted-foreground">
      {children}
    </blockquote>
  ),

  // Code
  code: ({ children }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm">
      {children}
    </pre>
  ),

  // Horizontal rule
  hr: () => <hr className="border-border my-10" />,

  // Images
  // Use ?inline query param for inline images: ![icon](/icon.png?inline)
  img: ({ src, alt }) => {
    if (!src) return null;

    // Check for ?inline query param
    const isInline = src.includes("?inline");
    const cleanSrc = src.replace("?inline", "");

    // Inline images - render small, within text flow
    if (isInline) {
      return (
        <img
          src={cleanSrc}
          alt={alt || ""}
          className="inline-block align-middle h-5 w-auto mx-0.5"
          loading="lazy"
        />
      );
    }

    // For external images, use regular img
    if (cleanSrc.startsWith("http")) {
      return (
        <span className="block my-8">
          <img
            src={cleanSrc}
            alt={alt || ""}
            className="rounded-lg w-full"
            loading="lazy"
          />
          {alt && (
            <span className="block text-center text-sm text-muted-foreground mt-2">
              {alt}
            </span>
          )}
        </span>
      );
    }

    // For local images, use Next.js Image
    return (
      <span className="block my-8">
        <Image
          src={cleanSrc}
          alt={alt || ""}
          width={800}
          height={450}
          className="rounded-lg w-full h-auto"
        />
        {alt && (
          <span className="block text-center text-sm text-muted-foreground mt-2">
            {alt}
          </span>
        )}
      </span>
    );
  },

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border/50">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="text-left py-3 px-4 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="py-3 px-4 text-muted-foreground">{children}</td>
  ),

  // Strong and emphasis
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
};

