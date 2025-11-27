import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";
import { db } from "@/db";
import { blogCoverImage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPostBySlug } from "@/lib/blog";

export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/blog/image/[slug]
 * Returns the cached cover image for a blog post, or generates it on first request
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Check for force regenerate query param
    const forceRegenerate =
      request.nextUrl.searchParams.get("regenerate") === "true";

    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
      const cached = await db
        .select()
        .from(blogCoverImage)
        .where(eq(blogCoverImage.slug, slug))
        .limit(1);

      if (cached.length > 0) {
        const { imageData, mimeType } = cached[0];
        const imageBuffer = Buffer.from(imageData, "base64");

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": imageBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Image-Source": "cache",
          },
        });
      }
    }

    // Not cached - get blog post metadata to generate image
    let title: string;
    let description: string;

    try {
      const { meta } = getPostBySlug(slug);
      title = meta.title;
      description = meta.description;
    } catch {
      return NextResponse.json(
        { error: `Blog post not found: ${slug}` },
        { status: 404 }
      );
    }

    // Generate the image
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Load the reference style image
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

    const prompt = `Generate a blog cover image for the post title and description below. White background, black text (for the title only, don't generate a description.) with a clean, glasslike isomorphic representation of what the post is talking about. Use Inter font, and format/style it in the same way as the reference image provided.

Title: ${title}

Description: ${description}`;

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
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    const candidate = response.candidates?.[0];
    const responseParts = candidate?.content?.parts;

    if (!responseParts) {
      return NextResponse.json(
        { error: "No response from image generation" },
        { status: 500 }
      );
    }

    // Find the image part
    for (const part of responseParts) {
      if ("inlineData" in part && part.inlineData) {
        const { mimeType, data } = part.inlineData;

        if (data && mimeType) {
          // Save to database
          try {
            await db
              .insert(blogCoverImage)
              .values({
                slug,
                imageData: data,
                mimeType,
                title,
                description,
              })
              .onConflictDoUpdate({
                target: blogCoverImage.slug,
                set: {
                  imageData: data,
                  mimeType,
                  title,
                  description,
                  updatedAt: new Date(),
                },
              });
          } catch (dbError) {
            console.error("Failed to cache image:", dbError);
          }

          const imageBuffer = Buffer.from(data, "base64");

          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Content-Length": imageBuffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Image-Source": "generated",
            },
          });
        }
      }
    }

    const textPart = responseParts.find((part) => "text" in part && part.text);
    const errorMessage =
      textPart && "text" in textPart
        ? textPart.text
        : "No image generated in response";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } catch (error) {
    console.error("Blog image error:", error);
    return NextResponse.json(
      {
        error: "Failed to get/generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/image/[slug]
 * Delete a cached cover image (useful for admin regeneration)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    await db.delete(blogCoverImage).where(eq(blogCoverImage.slug, slug));

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Failed to delete cached image:", error);
    return NextResponse.json(
      { error: "Failed to delete cached image" },
      { status: 500 }
    );
  }
}

