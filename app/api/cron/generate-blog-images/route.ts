import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";
import { db } from "@/db";
import { blogCoverImage } from "@/db/schema";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";

export const maxDuration = 300; // 5 minutes max for cron job

/**
 * Cron job to generate cover images for blog posts that don't have cached images
 * Runs daily at 6 AM UTC via Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    // Get all blog post slugs
    const allSlugs = getAllPostSlugs();

    if (allSlugs.length === 0) {
      return NextResponse.json({
        message: "No blog posts found",
        generated: 0,
      });
    }

    // Get all cached images from DB
    const cachedImages = await db.select({ slug: blogCoverImage.slug }).from(blogCoverImage);
    const cachedSlugs = new Set(cachedImages.map((img) => img.slug));

    // Find posts without cached images (excluding those with featuredImage in frontmatter)
    const uncachedSlugs: string[] = [];
    for (const slug of allSlugs) {
      if (!cachedSlugs.has(slug)) {
        try {
          const { meta } = getPostBySlug(slug);
          // Only generate if no featuredImage is set
          if (!meta.featuredImage) {
            uncachedSlugs.push(slug);
          }
        } catch {
          // Skip posts that can't be read
        }
      }
    }

    if (uncachedSlugs.length === 0) {
      return NextResponse.json({
        message: "All blog posts have cached images",
        totalPosts: allSlugs.length,
        generated: 0,
      });
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Load reference image
    const referenceImagePath = path.join(
      process.cwd(),
      "public",
      "reference-generation-image.png"
    );

    let referenceImagePart = null;
    try {
      const imageBuffer = await readFile(referenceImagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = mime.getType(referenceImagePath) || "image/png";
      referenceImagePart = {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      };
    } catch {
      console.warn("Reference image not found, generating without style reference");
    }

    const results: { slug: string; status: "success" | "error"; error?: string }[] = [];

    // Generate images for uncached posts (limit to 5 per run to avoid timeout)
    const toGenerate = uncachedSlugs.slice(0, 5);

    for (const slug of toGenerate) {
      try {
        const { meta } = getPostBySlug(slug);

        const prompt = `Generate a blog cover image for the post title and description below. White background, black text (for the title only, don't generate a description.) with a clean, glasslike isomorphic representation of what the post is talking about. Use Inter font, and format/style it in the same way as the reference image provided.

Title: ${meta.title}

Description: ${meta.description}`;

        const parts: Array<
          { text: string } | { inlineData: { mimeType: string; data: string } }
        > = [];

        if (referenceImagePart) {
          parts.push(referenceImagePart);
        }
        parts.push({ text: prompt });

        const config = {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K",
          },
          tools: [{ googleSearch: {} }],
        };

        const response = await ai.models.generateContent({
          model: "gemini-3-pro-image-preview",
          config,
          contents: [{ role: "user", parts }],
        });

        const candidate = response.candidates?.[0];
        const responseParts = candidate?.content?.parts;

        if (!responseParts) {
          results.push({ slug, status: "error", error: "No response from API" });
          continue;
        }

        // Find the image part
        let imageGenerated = false;
        for (const part of responseParts) {
          if ("inlineData" in part && part.inlineData) {
            const { mimeType, data } = part.inlineData;

            if (data && mimeType) {
              // Save to database
              await db
                .insert(blogCoverImage)
                .values({
                  slug,
                  imageData: data,
                  mimeType,
                  title: meta.title,
                  description: meta.description,
                })
                .onConflictDoUpdate({
                  target: blogCoverImage.slug,
                  set: {
                    imageData: data,
                    mimeType,
                    title: meta.title,
                    description: meta.description,
                    updatedAt: new Date(),
                  },
                });

              results.push({ slug, status: "success" });
              imageGenerated = true;
              break;
            }
          }
        }

        if (!imageGenerated) {
          results.push({ slug, status: "error", error: "No image in response" });
        }

        // Add delay between generations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          slug,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;

    return NextResponse.json({
      message: `Generated ${successCount} of ${toGenerate.length} images`,
      totalPosts: allSlugs.length,
      uncachedPosts: uncachedSlugs.length,
      processed: toGenerate.length,
      remaining: uncachedSlugs.length - toGenerate.length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

